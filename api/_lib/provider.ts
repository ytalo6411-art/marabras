/**
 * Cliente do provedor de IA (compatível com a API de Chat Completions).
 *
 * Variáveis de ambiente SERVER-SIDE (nunca prefixadas com VITE_):
 *   AI_API_KEY   — obrigatória; sem ela o endpoint responde 503
 *   AI_BASE_URL  — opcional (padrão: https://api.openai.com/v1)
 *   AI_MODEL     — opcional (padrão: gpt-4o-mini)
 *
 * Funciona com qualquer provedor compatível (OpenAI, Groq, Together, Ollama
 * com endpoint compatível etc.). Nada é inventado: se a chamada falhar, o
 * erro é repassado de forma genérica e o cliente cai no motor de regras.
 */

export interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export function readProviderConfig(): ProviderConfig | null {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return null;

  return {
    apiKey,
    baseUrl: (process.env.AI_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/+$/, ''),
    model: process.env.AI_MODEL ?? 'gpt-4o-mini',
  };
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class ProviderError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ProviderError';
    this.status = status;
  }
}

/**
 * Chama o provedor pedindo JSON estrito.
 * Timeout de 40 s — o cliente espera até 45 s.
 */
export async function completeJson(
  config: ProviderConfig,
  messages: ChatMessage[],
): Promise<{ text: string; model: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 40_000);

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: 0.3,
        max_tokens: 2200,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      // Não repassamos o corpo cru: ele pode conter detalhes do provedor.
      throw new ProviderError(`Provedor respondeu HTTP ${response.status}`, response.status);
    }

    const body = (await response.json()) as {
      model?: string;
      choices?: { message?: { content?: string } }[];
    };

    const text = body.choices?.[0]?.message?.content;
    if (!text) throw new ProviderError('Provedor devolveu resposta vazia', 502);

    return { text, model: body.model ?? config.model };
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    const aborted = error instanceof Error && error.name === 'AbortError';
    throw new ProviderError(
      aborted ? 'Provedor de IA excedeu o tempo limite' : 'Falha ao contatar o provedor de IA',
      aborted ? 504 : 502,
    );
  } finally {
    clearTimeout(timer);
  }
}
