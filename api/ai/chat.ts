import { z } from 'zod';
import { securityHeaders, checkRequest, userClient, reserve, finish, estimateTokens, handleSecurityError } from '../_lib/security';
import { verifyUser } from '../_lib/auth';
import { completeJson, readProviderConfig } from '../_lib/provider';
import { CHAT_SYSTEM_PROMPT, chatRequestSchema } from '../_lib/planContract';
import type { ApiRequest, ApiResponse } from '../_lib/http';

const answerSchema = z.object({ answer: z.string().trim().min(1).max(2000) }).strict();

export const config = { maxDuration: 60 };

export default async function handler(req: ApiRequest, res: ApiResponse) {
  securityHeaders(res);
  let lease: Awaited<ReturnType<typeof reserve>> | undefined;
  let totalTokens: number | null = null;
  try {
    if (req.method !== 'POST') { res.setHeader('Allow','POST'); return handleSecurityError(res, Object.assign(new Error(), {status:405,message:'Método não permitido.'})); }
    const token = checkRequest(req, 16_384);
    const parsed = chatRequestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Requisição inválida.' });
    const user = await verifyUser(token);
    if (!user) return res.status(401).json({ error: 'Sessão inválida. Entre novamente.' });
    const config = readProviderConfig();
    if (!config) return res.status(503).json({ error: 'Serviço de IA não configurado.', code: 'ai_not_configured' });
    lease = await reserve(userClient(user.token), user.id, 'chat', parsed.data.requestId, estimateTokens(parsed.data, 500));
    const completion = await completeJson(config, [
      { role:'system', content:`${CHAT_SYSTEM_PROMPT}\nIdioma obrigatório: ${parsed.data.locale}.` },
      { role:'user', content:JSON.stringify({ untrusted_context:parsed.data.context, untrusted_question:parsed.data.question }) },
    ], 500);
    totalTokens = completion.totalTokens;
    let unknown: unknown;
    try { unknown = JSON.parse(completion.text); } catch { return res.status(422).json({ error:'A IA devolveu um formato inválido.' }); }
    const answer = answerSchema.safeParse(unknown);
    if (!answer.success) return res.status(422).json({ error:'A IA devolveu uma resposta inválida.' });
    await finish(lease, totalTokens, true);
    return res.status(200).json({ answer:answer.data.answer, model:completion.model });
  } catch (error) {
    return handleSecurityError(res, error);
  } finally {
    if (lease) { try { await finish(lease,totalTokens,false); } catch { /* reservation remains charged until its lease expires */ } }
  }
}
