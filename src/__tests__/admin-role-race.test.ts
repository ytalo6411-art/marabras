import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Regressão: abrir /app/admin por link direto expulsava o administrador.
 *
 * `initialize()` marca `initializing: false` assim que a sessão resolve, mas o
 * papel de admin vem de uma segunda consulta em `admin_users`. Nesse intervalo
 * `isAdmin` ainda era false e `RequireAdmin` redirecionava para o painel.
 *
 * O flag `roleResolved` existe para a guarda esperar o papel — nunca para
 * liberar acesso: em erro ele resolve como false (falha fechada).
 */

const mock = vi.hoisted(() => ({
  getSession: vi.fn(),
  adminResponse: vi.fn(),
}));

vi.mock('@/lib/privateStorage', () => ({ clearPrivateUserData: vi.fn() }));
vi.mock('@/services/catalog', () => ({ clearCatalogCache: vi.fn() }));
vi.mock('@/services/dbCapabilities', () => ({ clearSchemaCapabilities: vi.fn() }));
vi.mock('@/services/aiCoach', () => ({ clearAiSessionCache: vi.fn() }));

vi.mock('@/services/auth', () => ({
  onAuthStateChange: vi.fn(),
  getSession: mock.getSession,
  signInWithGoogle: vi.fn(),
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  signOut: vi.fn(),
  requestPasswordReset: vi.fn(),
  updatePassword: vi.fn(),
}));

vi.mock('@/lib/supabase', () => {
  function builder(table: string) {
    const chain: Record<string, unknown> = {};
    for (const method of ['select', 'eq', 'insert', 'update']) {
      chain[method] = vi.fn(() => chain);
    }
    chain.maybeSingle = vi.fn(() =>
      table === 'admin_users'
        ? mock.adminResponse()
        : Promise.resolve({ data: { id: 'u1', email: 'admin@test.invalid' }, error: null }),
    );
    chain.single = vi.fn(() => Promise.resolve({ data: { id: 'u1' }, error: null }));
    chain.head = vi.fn(() => Promise.resolve({ count: 0, error: null }));
    (chain as { then?: unknown }).then = (resolve: (v: unknown) => unknown) =>
      Promise.resolve({ data: [], error: null, count: 0 }).then(resolve);
    return chain;
  }
  return {
    supabase: { from: vi.fn(builder), auth: { signOut: vi.fn() } },
    isSupabaseConfigured: true,
    APP_URL: 'http://localhost:5173',
    SUPABASE_URL: 'https://project.supabase.co',
    SUPABASE_ANON_KEY: 'anon-test',
  };
});

const USER = {
  id: 'u1',
  email: 'admin@test.invalid',
  email_confirmed_at: '2026-01-01T00:00:00Z',
  app_metadata: { provider: 'email' },
  user_metadata: {},
};

async function freshStore() {
  vi.resetModules();
  const { useAuthStore } = await import('@/stores/auth');
  useAuthStore.setState({
    session: null, user: null, profile: null, preferences: null,
    isAdmin: false, roleResolved: false, initializing: true, unreadCount: 0,
  });
  return useAuthStore;
}

beforeEach(() => {
  vi.clearAllMocks();
  mock.getSession.mockResolvedValue({ user: USER });
});

describe('guarda de administrador e a corrida do papel', () => {
  it('não declara o papel resolvido antes da consulta em admin_users', async () => {
    let release: (value: unknown) => void = () => {};
    mock.adminResponse.mockReturnValue(
      new Promise((resolve) => { release = resolve; }),
    );

    const store = await freshStore();
    const pending = store.getState().initialize();

    // A sessão já resolveu, o papel ainda não: a guarda precisa esperar.
    await vi.waitFor(() => expect(store.getState().user).not.toBeNull());
    expect(store.getState().initializing).toBe(false);
    expect(store.getState().roleResolved).toBe(false);
    expect(store.getState().isAdmin).toBe(false);

    release({ data: { role: 'admin', active: true }, error: null });
    await pending;

    expect(store.getState().roleResolved).toBe(true);
    expect(store.getState().isAdmin).toBe(true);
  });

  it('usuário comum resolve como não-admin, sem ficar carregando para sempre', async () => {
    mock.adminResponse.mockResolvedValue({ data: null, error: null });
    const store = await freshStore();
    await store.getState().initialize();

    expect(store.getState().roleResolved).toBe(true);
    expect(store.getState().isAdmin).toBe(false);
  });

  it('falha na consulta resolve como não-admin (falha fechada)', async () => {
    mock.adminResponse.mockRejectedValue(new Error('network down'));
    const store = await freshStore();
    await store.getState().initialize();

    expect(store.getState().roleResolved).toBe(true);
    expect(store.getState().isAdmin).toBe(false);
  });

  it('papel inativo não concede acesso', async () => {
    mock.adminResponse.mockResolvedValue({ data: { role: 'admin', active: false }, error: null });
    const store = await freshStore();
    await store.getState().initialize();

    expect(store.getState().isAdmin).toBe(false);
  });

  it('sair da conta limpa o papel para a próxima sessão não herdá-lo', async () => {
    mock.adminResponse.mockResolvedValue({ data: { role: 'admin', active: true }, error: null });
    const store = await freshStore();
    await store.getState().initialize();
    expect(store.getState().isAdmin).toBe(true);

    store.getState().resetLocalSession();
    expect(store.getState().isAdmin).toBe(false);
    expect(store.getState().roleResolved).toBe(false);
  });
});