import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { jsonError, readHeader, type ApiRequest, type ApiResponse } from './http';
import { readSupabaseEnv } from './auth';

export class SecurityError extends Error {
  constructor(readonly status: number, message: string, readonly code = 'request_rejected') { super(message); }
}

/** Only same-origin browser calls; bearer tokens are never read from query/body. */
export function checkRequest(req: ApiRequest, maxBytes = 65_536): string | null {
  const origin = readHeader(req, 'origin');
  const host = readHeader(req, 'x-forwarded-host') ?? readHeader(req, 'host');
  if (origin) {
    let parsed: URL;
    try { parsed = new URL(origin); } catch { throw new SecurityError(403, 'Origem não permitida.'); }
    const forwardedProto = readHeader(req, 'x-forwarded-proto');
    if (parsed.host !== host || !['http:', 'https:'].includes(parsed.protocol) ||
        (forwardedProto && parsed.protocol !== `${forwardedProto}:`)) {
      throw new SecurityError(403, 'Origem não permitida.');
    }
  }
  if (!(readHeader(req, 'content-type') ?? '').toLowerCase().startsWith('application/json')) {
    throw new SecurityError(415, 'Envie application/json.');
  }
  const declared = Number(readHeader(req, 'content-length') ?? 0);
  if (Number.isFinite(declared) && declared > maxBytes) throw new SecurityError(413, 'Requisição muito grande.');
  // Vercel normally parses JSON before the handler. Bound the accepted object as
  // well, since a malicious client can omit Content-Length.
  if (Buffer.byteLength(JSON.stringify(req.body ?? null), 'utf8') > maxBytes) {
    throw new SecurityError(413, 'Requisição muito grande.');
  }
  const authorization = readHeader(req, 'authorization');
  const token = authorization?.match(/^Bearer ([A-Za-z0-9._-]{20,8192})$/i)?.[1];
  if (!token) throw new SecurityError(401, 'Sessão inválida. Entre novamente.');
  return token;
}

export function userClient(token: string) {
  const env = readSupabaseEnv();
  if (!env) throw new SecurityError(503, 'Serviço temporariamente indisponível.');
  return createClient(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      headers: { Authorization: `Bearer ${token}` },
      fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(8_000), redirect: 'error' }),
    },
  });
}

export type UserClient = ReturnType<typeof userClient>;
export interface Reservation { requestId: string; secret: string; estimated: number; client: UserClient; userId: string }

export async function reserve(client: UserClient, userId: string, endpoint: 'plan' | 'chat', requestId: string, estimated: number): Promise<Reservation> {
  const { data, error } = await client.rpc('reserve_ai_request', { p_request_id: requestId, p_endpoint: endpoint, p_tokens: estimated });
  if (error) throw new SecurityError(503, 'O controle de uso está indisponível. Tente mais tarde.', 'quota_unavailable');
  const result = data as { allowed?: boolean; reason?: string; secret?: string } | null;
  if (!result?.allowed) throw new SecurityError(result?.reason === 'duplicate' || result?.reason === 'busy' ? 409 : 429,
    result?.reason === 'duplicate' ? 'Esta solicitação já foi recebida.' : result?.reason === 'busy' ? 'Aguarde a resposta anterior terminar.' : 'Limite de uso atingido. Tente mais tarde.', 'quota_exceeded');
  if (!result.secret) throw new SecurityError(503, 'O controle de uso está indisponível.', 'quota_unavailable');
  return { requestId, secret: result.secret, estimated, client, userId };
}

export async function finish(reservation: Reservation, tokens: number | null, success: boolean) {
  // Fail closed on accounting errors: do not log tokens, prompts or provider bodies.
  const { error } = await reservation.client.rpc('finish_ai_request', {
    p_request_id: reservation.requestId, p_secret: reservation.secret, p_tokens: tokens ?? reservation.estimated, p_success: success,
  });
  if (error) throw new SecurityError(503, 'Não foi possível confirmar o uso.');
}

export function estimateTokens(value: unknown, output: number) {
  return Math.min(12_000, Math.ceil(JSON.stringify(value).length / 3) + output + 500);
}

export function requestFingerprint(value: unknown) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export function securityHeaders(res: ApiResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
}

export function handleSecurityError(res: ApiResponse, error: unknown) {
  if (error instanceof SecurityError) return jsonError(res, error.status, error.message, { code: error.code });
  return jsonError(res, 500, 'Não foi possível concluir a solicitação.');
}
