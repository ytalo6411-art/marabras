import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  translateAuthError,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  requestPasswordReset,
} from '@/services/auth';
import { supabase } from '@/lib/supabase';

/**
 * Testes da camada de autenticação.
 *
 * O cliente Supabase é mockado para verificar o contrato com a API:
 *  • o login Google redireciona (não cria sessão local)
 *  • erros são traduzidos para mensagens em português
 *  • nenhum erro vaza a mensagem original em inglês
 */

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      resend: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
  APP_URL: 'http://localhost:5173',
  isSupabaseConfigured: true,
  SUPABASE_URL: 'https://project.supabase.co',
  SUPABASE_ANON_KEY: 'anon-key-teste',
}));

const mocked = supabase.auth as unknown as {
  signInWithOAuth: ReturnType<typeof vi.fn>;
  signUp: ReturnType<typeof vi.fn>;
  signInWithPassword: ReturnType<typeof vi.fn>;
  resetPasswordForEmail: ReturnType<typeof vi.fn>;
};

describe('translateAuthError', () => {
  it('traduz credenciais inválidas', () => {
    const result = translateAuthError({
      message: 'Invalid login credentials',
      status: 400,
    });
    expect(result.code).toBe('invalid_credentials');
    expect(result.message).toContain('E-mail ou senha');
  });

  it('traduz e-mail não confirmado', () => {
    const result = translateAuthError({ message: 'Email not confirmed', status: 400 });
    expect(result.code).toBe('email_not_confirmed');
  });

  it('traduz usuário já existente', () => {
    const result = translateAuthError({
      message: 'User already registered',
      status: 422,
    });
    expect(result.code).toBe('user_already_exists');
  });

  it('traduz senha fraca', () => {
    const result = translateAuthError({
      message: 'Password should be at least 6 characters.',
      status: 422,
    });
    expect(result.code).toBe('weak_password');
  });

  it('detecta rate limit', () => {
    const result = translateAuthError({ message: 'Too many requests', status: 429 });
    expect(result.code).toBe('rate_limit');
  });

  it('detecta provedor OAuth não habilitado', () => {
    const result = translateAuthError({
      message: 'Unsupported provider: provider is not enabled',
      status: 400,
    });
    expect(result.code).toBe('provider_disabled');
    // A mensagem precisa sugerir o caminho alternativo, não mandar
    // "tente novamente" — repetir não resolve uma configuração de servidor.
    expect(result.message).toMatch(/e-mail/i);
    expect(result.message).not.toMatch(/tente novamente/i);
  });

  it('traduz também a variante "provider is not enabled"', () => {
    const result = translateAuthError({
      message: 'Provider is not enabled',
      status: 400,
    });
    expect(result.code).toBe('provider_disabled');
  });

  it('detecta erro de rede', () => {
    const result = translateAuthError({ message: 'Failed to fetch', status: 0 });
    expect(result.code).toBe('network');
  });

  it('nunca expõe a mensagem original em inglês', () => {
    const result = translateAuthError({
      message: 'Database connection failed: FATAL some raw pg detail',
      status: 500,
    });
    // A mensagem exibida deve ser genérica, não o erro cru do backend.
    expect(result.message).not.toContain('FATAL');
    expect(result.message).not.toContain('some raw pg detail');
  });
});

describe('signInWithGoogle', () => {
  const fetchSpy = vi.fn();

  /** Simula o endpoint público `/auth/v1/settings` do Supabase. */
  function mockSettings(external: Record<string, boolean>) {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ external }),
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchSpy);
    // Padrão: Google habilitado — os testes que importam o fluxo OAuth
    // não devem ser afetados pela nova verificação.
    mockSettings({ google: true, email: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('inicia o fluxo OAuth com redirect para a APP_URL', async () => {
    mocked.signInWithOAuth.mockResolvedValue({ data: {}, error: null });

    const { error } = await signInWithGoogle();

    expect(error).toBeNull();
    expect(mocked.signInWithOAuth).toHaveBeenCalledOnce();

    const arg = mocked.signInWithOAuth.mock.calls[0]![0];
    expect(arg.provider).toBe('google');
    expect(arg.options.redirectTo).toBe('http://localhost:5173');
    expect(arg.options.scopes).toBe('email profile');
  });

  it('traduz o erro quando o provider falha', async () => {
    mocked.signInWithOAuth.mockResolvedValue({
      data: {},
      error: { message: 'Invalid login credentials', status: 400 },
    });

    const { error } = await signInWithGoogle();

    expect(error?.code).toBe('invalid_credentials');
  });

  it('NÃO redireciona quando o Google está desabilitado no projeto', async () => {
    // Este é o bug reportado: sem esta checagem, o SDK chama
    // `window.location.assign(...)`, o Supabase responde 400 com um JSON
    // cru e o NAVEGADOR sai do app mostrando esse JSON ao usuário.
    mockSettings({ google: false, email: true });

    const { error } = await signInWithGoogle();

    expect(error?.code).toBe('provider_disabled');
    expect(error?.message).toMatch(/e-mail/i);
    // O ponto central: nenhuma navegação para o Supabase aconteceu.
    expect(mocked.signInWithOAuth).not.toHaveBeenCalled();
  });

  it('traduz o erro de provedor desabilitado vindo do SDK', async () => {
    // Defesa em profundidade: mesmo que o provedor seja desabilitado
    // entre a verificação e o redirect, a mensagem é compreensível.
    mockSettings({ google: true, email: true });
    mocked.signInWithOAuth.mockResolvedValue({
      data: {},
      error: { message: 'Unsupported provider: provider is not enabled', status: 400 },
    });

    const { error } = await signInWithGoogle();

    expect(error?.code).toBe('provider_disabled');
  });

  it('segue o fluxo normal quando não dá para verificar os provedores', async () => {
    // Sem rede não devemos bloquear o usuário: tentamos o login.
    fetchSpy.mockRejectedValue(new Error('Failed to fetch'));
    mocked.signInWithOAuth.mockResolvedValue({ data: {}, error: null });

    const { error } = await signInWithGoogle();

    expect(error).toBeNull();
    expect(mocked.signInWithOAuth).toHaveBeenCalledOnce();
  });

  it('traduz uma exceção lançada pelo SDK em vez de vazar para a tela', async () => {
    mockSettings({ google: true, email: true });
    mocked.signInWithOAuth.mockRejectedValue(new Error('Failed to fetch'));

    const { error } = await signInWithGoogle();

    expect(error?.code).toBe('network');
    expect(error?.message).not.toMatch(/failed to fetch/i);
  });

  it('bloqueia o redirect usando o payload REAL de /auth/v1/settings', async () => {
    // Payload capturado do projeto de produção em 2026-10-30. Serve de
    // guarda contra mudança de formato: se o Supabase alterar o payload,
    // este teste avisa em vez de o app silenciosamente deixar de bloquear.
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({
        external: {
          anonymous_users: false,
          apple: false,
          azure: false,
          bitbucket: false,
          discord: false,
          facebook: false,
          snapchat: false,
          figma: false,
          fly: false,
          github: false,
          gitlab: false,
          google: false,
          keycloak: false,
          kakao: false,
          linkedin: false,
          linkedin_oidc: false,
          notion: false,
          spotify: false,
          slack: false,
          slack_oidc: false,
          workos: false,
          twich: false,
          twitter: false,
          email: true,
          phone: false,
          zoom: false,
        },
        disable_signup: false,
        mailer_autoconfirm: false,
        phone_autoconfirm: false,
        sms_provider: 'twilio',
        saml_enabled: false,
        passkeys_enabled: false,
      }),
    });

    const { error } = await signInWithGoogle();

    expect(error?.code).toBe('provider_disabled');
    expect(mocked.signInWithOAuth).not.toHaveBeenCalled();
  });
});

describe('signInWithEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envia e-mail e senha', async () => {
    mocked.signInWithPassword.mockResolvedValue({ data: {}, error: null });

    const { error } = await signInWithEmail('  user@test.com  ', 'senha123');

    expect(error).toBeNull();
    // O e-mail é normalizado (trim) antes do envio.
    expect(mocked.signInWithPassword).toHaveBeenCalledWith({
      email: 'user@test.com',
      password: 'senha123',
    });
  });

  it('devolve erro traduzido', async () => {
    mocked.signInWithPassword.mockResolvedValue({
      data: {},
      error: { message: 'Invalid login credentials', status: 400 },
    });

    const { error } = await signInWithEmail('user@test.com', 'errada');

    expect(error?.code).toBe('invalid_credentials');
  });
});

describe('signUpWithEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envia o nome completo nos metadados', async () => {
    mocked.signUp.mockResolvedValue({
      data: { user: { id: 'abc' }, session: null },
      error: null,
    });

    const result = await signUpWithEmail('novo@test.com', 'senha123', '  Ytalo Lima  ');

    expect(result.error).toBeNull();
    expect(result.needsEmailConfirmation).toBe(true);

    const arg = mocked.signUp.mock.calls[0]![0];
    expect(arg.email).toBe('novo@test.com');
    expect(arg.options.data.full_name).toBe('Ytalo Lima');
  });

  it('não exige confirmação quando já há sessão', async () => {
    mocked.signUp.mockResolvedValue({
      data: { user: { id: 'abc' }, session: { access_token: 'x' } },
      error: null,
    });

    const result = await signUpWithEmail('novo@test.com', 'senha123');

    expect(result.needsEmailConfirmation).toBe(false);
  });
});

describe('requestPasswordReset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redireciona para a rota de reset de senha', async () => {
    mocked.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });

    await requestPasswordReset('user@test.com');

    const arg = mocked.resetPasswordForEmail.mock.calls[0]!;
    expect(arg[0]).toBe('user@test.com');
    expect(arg[1].redirectTo).toContain('/auth/reset-password');
  });
});
