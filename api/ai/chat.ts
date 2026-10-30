/**
 * POST /api/ai/chat
 *
 * Pergunta livre ao treinador. Usa o mesmo provedor de `/api/ai/plan`.
 * Sem chave configurada responde 503 e o cliente mostra respostas baseadas
 * nas regras do plano — nunca texto fingindo ser IA.
 */

import { jsonError, rateLimit, type ApiRequest, type ApiResponse } from '../_lib/http';
import { verifyUser } from '../_lib/auth';
import { completeJson, ProviderError, readProviderConfig } from '../_lib/provider';
import { CHAT_SYSTEM_PROMPT, chatRequestSchema } from '../_lib/planContract';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return jsonError(res, 405, 'Método não permitido.');
  }

  const config = readProviderConfig();
  if (!config) {
    return jsonError(res, 503, 'Serviço de IA não configurado no servidor.', {
      code: 'ai_not_configured',
    });
  }

  const parsed = chatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return jsonError(res, 400, 'Requisição inválida.');
  }

  const user = await verifyUser(parsed.data.token);
  if (!user) {
    return jsonError(res, 401, 'Sessão inválida. Entre novamente.');
  }

  if (!rateLimit(`chat:${user.id}`, 30, 60 * 60 * 1000)) {
    return jsonError(res, 429, 'Muitas perguntas em pouco tempo. Tente mais tarde.');
  }

  try {
    const completion = await completeJson(config, [
      { role: 'system', content: CHAT_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Contexto do plano (JSON): ${JSON.stringify(parsed.data.context).slice(0, 6000)}

Pergunta do usuário: ${parsed.data.question}`,
      },
    ]);

    const text = completion.text.trim();
    let answer = '';

    try {
      const asJson = JSON.parse(text) as { answer?: unknown };
      if (typeof asJson.answer === 'string') answer = asJson.answer;
    } catch {
      // Provedor ignorou o formato JSON: aceita texto plano, mas nunca vazio.
      answer = text;
    }

    if (!answer.trim()) {
      return jsonError(res, 502, 'O treinador não devolveu uma resposta.');
    }

    res.status(200).json({ answer: answer.slice(0, 2000), model: completion.model });
  } catch (error) {
    if (error instanceof ProviderError) {
      return jsonError(res, 502, 'O provedor de IA não respondeu. Tente novamente.');
    }
    return jsonError(res, 500, 'Não foi possível responder agora.');
  }
}
