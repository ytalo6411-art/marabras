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
  maxTokens: number;
}

export function readProviderConfig(): ProviderConfig | null {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return null;

  let baseUrl: URL;
  try { baseUrl = new URL(process.env.AI_BASE_URL ?? 'https://api.openai.com/v1'); } catch { return null; }
  const allowedHosts = ['api.openai.com','api.groq.com','api.together.xyz'];
  if (baseUrl.protocol !== 'https:' || baseUrl.username || baseUrl.password || baseUrl.search || baseUrl.hash || !allowedHosts.includes(baseUrl.hostname)) return null;
  const model = process.env.AI_MODEL ?? 'gpt-4o-mini';
  if (!/^[A-Za-z0-9._:-]{1,100}$/.test(model)) return null;
  return {
    apiKey,
    baseUrl: baseUrl.toString().replace(/\/+$/, ''),
    model,
    maxTokens: 2200,
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
  maxTokens = 2200,
): Promise<{ text: string; model: string; totalTokens: number | null }> {
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
        max_tokens: Math.min(2200, Math.max(1, maxTokens)),
        stream: false,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
      redirect: 'error',
    });

    if (!response.ok) {
      // Não repassamos o corpo cru: ele pode conter detalhes do provedor.
      throw new ProviderError(`Provedor respondeu HTTP ${response.status}`, response.status);
    }

    const raw = await readBounded(response, 131_072);
    const body = JSON.parse(raw) as {
      usage?: { total_tokens?: number };
      model?: string;
      choices?: { message?: { content?: string } }[];
    };

    const text = body.choices?.[0]?.message?.content;
    if (!text) throw new ProviderError('Provedor devolveu resposta vazia', 502);

    if (text.length > 32_768) throw new ProviderError('Resposta muito grande', 502);
    return { text, model: config.model, totalTokens: typeof body.usage?.total_tokens === 'number' ? Math.min(24000, Math.max(0, body.usage.total_tokens)) : null };
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

/** Bound memory even when a compromised/upstream server omits Content-Length. */
export async function readBounded(response: Response, maxBytes: number): Promise<string> {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let size = 0; let text = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new ProviderError('Resposta muito grande', 502); }
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } finally { reader.releaseLock(); }
}
