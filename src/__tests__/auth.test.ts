import { describe, it, expect, beforeEach } from 'vitest';
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
  beforeEach(() => {
    vi.clearAllMocks();
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
