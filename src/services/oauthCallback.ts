/**
 * Tratamento do retorno do OAuth (Google).
 *
 * Quando o usuário cancela o consentimento, o provedor devolve o erro na URL
 * (`?error=access_denied` ou `#error=...`). Sem isto o app abria o dashboard
 * sem sessão e sem explicação, ou ficava em silêncio na tela de login.
 *
 * A função lê, traduz e REMOVE os parâmetros da URL — assim o erro não fica
 * no histórico nem é reexibido a cada reload.
 */

export interface OAuthCallbackError {
  code: string;
  message: string;
}

const MESSAGES: Record<string, string> = {
  access_denied: 'Você cancelou a entrada com Google. Tente novamente ou use e-mail e senha.',
  user_cancelled: 'Você cancelou a entrada com Google. Tente novamente ou use e-mail e senha.',
  invalid_request: 'Não foi possível concluir a entrada com Google. Tente novamente.',
  unauthorized_client: 'O login com Google não está configurado corretamente. Use e-mail e senha.',
  server_error: 'O provedor de login está indisponível no momento. Tente novamente em instantes.',
  temporarily_unavailable: 'O provedor de login está indisponível no momento. Tente novamente em instantes.',
  validation_failed:
    'Já existe uma conta com este e-mail. Entre com e-mail e senha e vincule o Google nas configurações.',
};

/** Lê e limpa o erro de OAuth da URL. Retorna null quando não há erro. */
export function consumeOAuthCallbackError(): OAuthCallbackError | null {
  if (typeof window === 'undefined') return null;

  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));

  const code = search.get('error') ?? hash.get('error');
  if (!code) return null;

  const description = search.get('error_description') ?? hash.get('error_description') ?? '';
  const normalized = code.toLowerCase();

  // A descrição do provedor pode citar conta existente; nunca a exibimos crua.
  const message =
    MESSAGES[normalized] ??
    (/already.*registered|exists/i.test(description)
      ? MESSAGES.validation_failed!
      : 'Não foi possível concluir a entrada com Google. Tente novamente ou use e-mail e senha.');

  // Remove os parâmetros para não repetir o erro em reloads nem guardar no histórico.
  for (const key of ['error', 'error_code', 'error_description', 'state']) {
    search.delete(key);
    hash.delete(key);
  }
  const query = search.toString();
  const fragment = hash.toString();
  const next = `${window.location.pathname}${query ? `?${query}` : ''}${fragment ? `#${fragment}` : ''}`;
  window.history.replaceState(window.history.state, '', next);

  return { code: normalized, message };
}
