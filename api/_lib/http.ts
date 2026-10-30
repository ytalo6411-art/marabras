/**
 * Tipos mínimos de request/response das Vercel Functions.
 *
 * Declarados aqui (em vez de depender de `@vercel/node`) para não adicionar
 * dependência só por causa de tipos. O runtime da Vercel entrega exatamente
 * esta superfície.
 */

export interface ApiRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
}

export interface ApiResponse {
  status(code: number): ApiResponse;
  json(body: unknown): void;
  setHeader(name: string, value: string): void;
  end(): void;
}

export function readHeader(req: ApiRequest, name: string): string | undefined {
  const value = req.headers[name] ?? req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

export function jsonError(
  res: ApiResponse,
  status: number,
  message: string,
  extra: Record<string, unknown> = {},
) {
  res.status(status).json({ error: message, ...extra });
}

/** Limite simples em memória por instância (best-effort contra abuso). */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}
