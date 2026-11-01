import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateAvatarFile, MAX_AVATAR_BYTES } from '@/services/avatar';
import { deleteAccount } from '@/services/account';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => {
  const storage = {
    upload: vi.fn(),
    getPublicUrl: vi.fn(),
    list: vi.fn(),
    remove: vi.fn(),
  };
  return {
    supabase: {
      auth: { getUser: vi.fn(), signInWithPassword: vi.fn(), signOut: vi.fn() },
      storage: { from: vi.fn(() => storage) },
      from: vi.fn(),
      rpc: vi.fn(),
    },
    APP_URL: 'http://localhost:5173',
    isSupabaseConfigured: true,
    SUPABASE_URL: 'https://project.supabase.co',
    SUPABASE_ANON_KEY: 'anon-test',
  };
});

const USER_ID = '10000000-0000-4000-8000-000000000001';

function fileOf(type: string, size: number): File {
  const file = new File(['x'], 'photo', { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('validação de foto de perfil', () => {
  it('aceita JPG, PNG e WebP dentro do limite', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp']) {
      expect(validateAvatarFile(fileOf(type, 1024))).toBeNull();
    }
  });

  it('recusa SVG (vetor pode conter script)', () => {
    expect(validateAvatarFile(fileOf('image/svg+xml', 1024))).toMatch(/JPG, PNG ou WebP/);
  });

  it('recusa tipos que não são imagem', () => {
    expect(validateAvatarFile(fileOf('application/pdf', 1024))).not.toBeNull();
    expect(validateAvatarFile(fileOf('text/html', 1024))).not.toBeNull();
  });

  it('recusa arquivo acima de 2 MB e arquivo vazio', () => {
    expect(validateAvatarFile(fileOf('image/png', MAX_AVATAR_BYTES + 1))).toMatch(/2 MB/);
    expect(validateAvatarFile(fileOf('image/png', 0))).toMatch(/vazio/);
  });
});

describe('exclusão de conta', () => {
  beforeEach(() => vi.clearAllMocks());

  function mockUser(providers: string[]) {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: USER_ID, email: 'user@test.invalid', app_metadata: { providers } } },
      error: null,
    } as never);
  }

  it('exige senha para contas com e-mail antes de chamar o servidor', async () => {
    mockUser(['email']);
    const result = await deleteAccount();
    expect(result.ok).toBe(false);
    expect(result.needsReauth).toBe(true);
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it('não exclui quando a senha está errada', async () => {
    mockUser(['email']);
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: {}, error: { message: 'Invalid login credentials' },
    } as never);

    const result = await deleteAccount('wrong');
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Senha incorreta/);
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it('NÃO declara sucesso quando o servidor não confirma o id', async () => {
    mockUser(['google']);
    vi.mocked(supabase.storage.from('avatars').list).mockResolvedValue({ data: [], error: null } as never);
    // Regressão do bug: a UI dizia "excluída" mesmo com a transação revertida.
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null } as never);

    const result = await deleteAccount();
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/não confirmou/);
  });

  it('não declara sucesso quando a RPC falha', async () => {
    mockUser(['google']);
    vi.mocked(supabase.storage.from('avatars').list).mockResolvedValue({ data: [], error: null } as never);
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null, error: { message: 'violates foreign key constraint' },
    } as never);

    const result = await deleteAccount();
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Nenhum dado foi removido/);
  });

  it('só confirma sucesso quando o servidor devolve o próprio id', async () => {
    mockUser(['google']);
    vi.mocked(supabase.storage.from('avatars').list).mockResolvedValue({
      data: [{ name: 'avatar-1.jpg' }], error: null,
    } as never);
    vi.mocked(supabase.storage.from('avatars').remove).mockResolvedValue({ data: [], error: null } as never);
    vi.mocked(supabase.rpc).mockResolvedValue({ data: USER_ID, error: null } as never);

    const result = await deleteAccount();
    expect(result.ok).toBe(true);
    // Os arquivos são apagados antes da identidade.
    expect(supabase.storage.from('avatars').remove).toHaveBeenCalledWith([`${USER_ID}/avatar-1.jpg`]);
    expect(supabase.rpc).toHaveBeenCalledWith('delete_own_account');
  });

  it('pede nova sessão quando não há usuário autenticado', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: null }, error: null } as never);
    const result = await deleteAccount();
    expect(result.ok).toBe(false);
    expect(result.needsReauth).toBe(true);
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
