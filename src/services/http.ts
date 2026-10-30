/**
 * Helpers de rede usados pelas integrações externas.
 *
 * Por que existir: antes desta camada, cada serviço chamava `fetch` cru. Uma
 * API lenta (ou offline) travava a tela indefinidamente, porque `fetch` não
 * tem timeout próprio. Aqui toda chamada externa tem limite de tempo, retry
 * conservador e erro tipado — sem nunca vazar a chave usada.
 */

export class HttpError extends Error {
  readonly status: number;
  readonly url: string;
  readonly retryable: boolean;

  constructor(message: string, opts: { status: number; url: string; retryable?: boolean }) {
    super(message);
    this.name = 'HttpError';
    this.status = opts.status;
    this.url = opts.url;
    this.retryable = opts.retryable ?? false;
  }
}

export interface FetchOptions {
  /** Tempo máximo total por tentativa (ms). */
  timeoutMs?: number;
  /** Número de tentativas adicionais apenas para falhas transitórias. */
  retries?: number;
  /** Backoff base em ms (cresce linearmente). */
  backoffMs?: number;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

const DEFAULT_TIMEOUT = 8000;

/**
 * `fetch` com timeout e retry.
 *
 * Só repete requisições idempotentes (GET/HEAD) e apenas em falha de rede ou
 * HTTP 5xx/429. Nunca repete POST: evita efeito duplicado em APIs de escrita.
 */
export async function fetchWithTimeout(
  input: string | URL,
  init: RequestInit = {},
  options: FetchOptions = {},
): Promise<Response> {
  const {
    timeoutMs = DEFAULT_TIMEOUT,
    backoffMs = 400,
    signal,
    headers,
  } = options;
  const method = (init.method ?? 'GET').toUpperCase();
  const idempotent = method === 'GET' || method === 'HEAD';
  const retries = options.retries ?? (idempotent ? 1 : 0);

  const url = typeof input === 'string' ? input : input.toString();
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const onAbort = () => controller.abort();
    signal?.addEventListener('abort', onAbort, { once: true });

    try {
      const res = await fetch(input, {
        ...init,
        headers: { ...init.headers, ...headers },
        signal: controller.signal,
      });

      if (!res.ok) {
        const retryable = res.status >= 500 || res.status === 429;
        // 404/400 não melhoram com retry — devolve o erro imediatamente.
        if (!retryable || attempt === retries) {
          throw new HttpError(`HTTP ${res.status} em ${url}`, {
            status: res.status,
            url,
            retryable,
          });
        }
        lastError = new HttpError(`HTTP ${res.status} em ${url}`, {
          status: res.status,
          url,
          retryable,
        });
      } else {
        return res;
      }
    } catch (err) {
      if (err instanceof HttpError && !err.retryable) throw err;
      lastError = err;
      if (attempt === retries) break;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }

    await new Promise((resolve) => setTimeout(resolve, backoffMs * (attempt + 1)));
  }

  if (lastError instanceof HttpError) throw lastError;

  const reason =
    lastError instanceof Error && lastError.name === 'AbortError'
      ? 'tempo esgotado'
      : 'falha de rede';
  throw new HttpError(`Não foi possível carregar (${reason}): ${url}`, {
    status: 0,
    url,
    retryable: true,
  });
}

/** GET JSON com timeout e retry. */
export async function getJson<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const res = await fetchWithTimeout(url, { method: 'GET' }, { timeoutMs: 8000, ...options });
  return (await res.json()) as T;
}

/** POST JSON (sem retry) — usado pelos endpoints de IA server-side. */
export async function postJson<T>(
  url: string,
  body: unknown,
  options: FetchOptions = {},
): Promise<T> {
  const res = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    { timeoutMs: 30000, retries: 0, ...options },
  );
  return (await res.json()) as T;
}
