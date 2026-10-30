import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as reactModule from 'react';
import LoginPage from '@/pages/auth/LoginPage';

/**
 * Teste de regressão do bug reportado pelo usuário.
 *
 * Sintoma original: ao clicar em "Entrar com Google", o navegador SAIA do
 * app e mostrava a página de erro crua do Supabase:
 *
 *   {"code":400,"error_code":"validation_failed",
 *    "msg":"Unsupported provider: provider is not enabled"}
 *
 * Causa: `supabase.auth.signInWithOAuth()` monta a URL e chama
 * `window.location.assign(...)`. Se o Google está desabilitado no projeto,
 * o Supabase responde 400 e o NAVEGADOR renderiza esse JSON — o tratamento
 * de erro do ATHLETIX nunca era alcançado.
 *
 * A correção consulta `/auth/v1/settings` (endpoint público do Supabase)
 * ANTES do redirect. Este teste garante que:
 *   1. o usuário permanece dentro do app;
 *   2. aparece uma mensagem em português, legível e útil;
 *   3. o botão do Google não dispara nenhuma navegação.
 */

const signInWithOAuth = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: (...args: unknown[]) => signInWithOAuth(...args),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signOut: vi.fn(),
    },
  },
  APP_URL: 'http://localhost:5173',
  isSupabaseConfigured: true,
  SUPABASE_URL: 'https://project.supabase.co',
  SUPABASE_ANON_KEY: 'anon-key-teste',
}));

/**
 * Store mock reativo, com ESTADO de verdade.
 *
 * A primeira versão deste teste devolvia `error: null` fixo — o alerta
 * nunca aparecia e a asserção passava só porque o texto do botão ("Entrar
 * com Google") e o divisor ("ou com e-mail") contêm as palavras procuradas.
 * Um teste que passa assim não prova nada: com a correção removida, ele
 * continuava verde.
 *
 * Aqui usamos `useSyncExternalStore` para que o componente RE-RENDERIZE
 * quando o erro é definido — como o store real (Zustand) faz. Assim o
 * alerta exibido vem de fato do caminho de código que queremos proteger.
 */
type MockAuthError = { code: string; message: string };

const storeState = {
  error: null as MockAuthError | null,
  loading: false,
  user: null,
  configured: true,
  signInGoogle: (async () => ({ error: null })) as () => Promise<{ error: MockAuthError | null }>,
  signInEmail: async () => ({ error: null as MockAuthError | null }),
  clearError: () => {},
};

// Implementa a ação de login sobre o estado do mock.
storeState.signInGoogle = async () => {
  const { signInWithGoogle } = await import('@/services/auth');
  const result = await signInWithGoogle();
  storeState.error = result.error;
  storeState.loading = false;
  notify();
  return result;
};

const storeListeners = new Set<() => void>();

/**
 * `useSyncExternalStore` exige que `getSnapshot` devolva um valor ESTÁVEL:
 * se devolver o mesmo objeto mutado, o React considera que nada mudou e
 * não re-renderiza (por isso o alerta não aparecia). Mantemos um snapshot
 * imutável, recriado a cada mudança.
 *
 * O snapshot é montado por função (e não por spread no load do módulo),
 * senão ele capturaria a `signInGoogle` placeholder antes da reatribuição
 * abaixo — e a página chamaria a ação errada.
 */
let snapshot = buildSnapshot();

function buildSnapshot() {
  return {
    error: storeState.error,
    loading: storeState.loading,
    user: storeState.user,
    configured: storeState.configured,
    signInGoogle: storeState.signInGoogle,
    signInEmail: storeState.signInEmail,
    clearError: storeState.clearError,
  };
}

function notify() {
  snapshot = buildSnapshot();
  for (const l of storeListeners) l();
}

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => {
    const { useSyncExternalStore } = reactModule;
    return useSyncExternalStore(
      (listener: () => void) => {
        storeListeners.add(listener);
        return () => {
          storeListeners.delete(listener);
        };
      },
      () => snapshot,
    );
  },
}));

describe('login com Google — provedor desabilitado', () => {
  const fetchSpy = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchSpy);
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ external: { google: false, email: true } }),
    });
    window.history.pushState({}, '', '/app/login');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('mantém o usuário no app e mostra uma mensagem compreensível', async () => {
    render(
      <MemoryRouter initialEntries={["/app/login"]}>
        <LoginPage />
      </MemoryRouter>,
    );

    const googleButton = await screen.findByRole('button', { name: /entrar com google/i });
    fireEvent.click(googleButton);

    // 1) Nenhuma navegação para o Supabase foi disparada.
    expect(signInWithOAuth).not.toHaveBeenCalled();

    // 2) O usuário continua vendo a tela de login (não saiu do app).
    expect(screen.getByRole('button', { name: /entrar com google/i })).toBeTruthy();

    // 3) Aparece uma mensagem em português, em vez do JSON cru do backend.
    //    Buscamos o texto EXATO da mensagem: "Google" e "e-mail" também
    //    aparecem no rótulo do botão e no divisor, então não serviam
    //    como prova.
    await waitFor(() => {
      expect(
        screen.getByText(/O login com Google ainda não está disponível/i),
      ).toBeTruthy();
    });
    expect(
      screen.getByText(/Use e-mail e senha, ou volte mais tarde/i),
    ).toBeTruthy();

    // 4) O JSON cru do Supabase nunca aparece na tela.
    const body = document.body.textContent ?? '';
    expect(body).not.toMatch(/Unsupported provider/i);
    expect(body).not.toMatch(/validation_failed/i);
    expect(body).not.toMatch(/error_code/i);
  });

  it('não bloqueia o login quando o Google está habilitado', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ external: { google: true, email: true } }),
    });
    signInWithOAuth.mockResolvedValue({ data: {}, error: null });

    render(
      <MemoryRouter initialEntries={["/app/login"]}>
        <LoginPage />
      </MemoryRouter>,
    );

    const googleButton = await screen.findByRole('button', { name: /entrar com google/i });
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(signInWithOAuth).toHaveBeenCalledOnce();
    });
  });
});
