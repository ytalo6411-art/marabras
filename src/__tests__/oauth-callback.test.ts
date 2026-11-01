import { describe, it, expect, beforeEach, vi } from 'vitest';
import { consumeOAuthCallbackError } from '@/services/oauthCallback';

function setUrl(search: string, hash = '') {
  const url = `https://athletix.test/app/login${search}${hash}`;
  const replaceState = vi.fn();
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      pathname: '/app/login',
      search,
      hash,
      origin: 'https://athletix.test',
      href: url,
    },
  });
  Object.defineProperty(window, 'history', {
    configurable: true,
    value: { state: null, replaceState },
  });
  return replaceState;
}

describe('retorno do OAuth', () => {
  beforeEach(() => vi.clearAllMocks());

  it('não faz nada quando não há erro na URL', () => {
    const replace = setUrl('');
    expect(consumeOAuthCallbackError()).toBeNull();
    expect(replace).not.toHaveBeenCalled();
  });

  it('traduz cancelamento do usuário e limpa a URL', () => {
    const replace = setUrl('?error=access_denied&error_description=User+cancelled');
    const result = consumeOAuthCallbackError();
    expect(result?.code).toBe('access_denied');
    expect(result?.message).toMatch(/cancelou/i);
    // O erro não pode ficar na URL para reaparecer em cada reload.
    expect(replace).toHaveBeenCalledWith(null, '', '/app/login');
  });

  it('lê erro vindo no fragmento (#), não só na query', () => {
    setUrl('', '#error=server_error&error_description=oops');
    const result = consumeOAuthCallbackError();
    expect(result?.code).toBe('server_error');
    expect(result?.message).toMatch(/indisponível/i);
  });

  it('orienta vincular a conta quando o e-mail já existe', () => {
    setUrl('?error=validation_failed');
    expect(consumeOAuthCallbackError()?.message).toMatch(/Já existe uma conta/);
  });

  it('detecta conta existente pela descrição, sem exibir texto cru do provedor', () => {
    setUrl('?error=unexpected&error_description=Email%20address%20already%20registered');
    const result = consumeOAuthCallbackError();
    expect(result?.message).toMatch(/Já existe uma conta/);
    expect(result?.message).not.toMatch(/already registered/);
  });

  it('usa mensagem genérica para erro desconhecido, sem vazar detalhes', () => {
    setUrl('?error=weird_code&error_description=internal%20stack%20trace');
    const result = consumeOAuthCallbackError();
    expect(result?.message).toMatch(/Não foi possível concluir/);
    expect(result?.message).not.toMatch(/stack trace/);
  });

  it('preserva outros parâmetros ao limpar apenas os do OAuth', () => {
    const replace = setUrl('?tab=signup&error=access_denied&state=abc');
    consumeOAuthCallbackError();
    expect(replace).toHaveBeenCalledWith(null, '', '/app/login?tab=signup');
  });
});
