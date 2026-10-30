import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  onAuthStateChange,
  getSession,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOut as supabaseSignOut,
  requestPasswordReset,
  updatePassword,
  type AuthError,
} from '@/services/auth';
import type { Profile, UserPreference } from '@/types/database';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  preferences: UserPreference | null;
  isAdmin: boolean;
  /** Quantidade de notificações não lidas (badge no header). */
  unreadCount: number;
  /** true enquanto a sessão inicial está sendo resolvida. */
  initializing: boolean;
  /** true durante uma ação de login (evita duplo submit). */
  loading: boolean;
  error: AuthError | null;
  configured: boolean;

  initialize: () => Promise<void>;
  signInGoogle: () => Promise<AuthError | null>;
  signInEmail: (email: string, password: string) => Promise<AuthError | null>;
  signUpEmail: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<{ error: AuthError | null; needsEmailConfirmation: boolean }>;
  resetPassword: (email: string) => Promise<AuthError | null>;
  setNewPassword: (password: string) => Promise<AuthError | null>;
  signOut: () => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  preferences: null,
  isAdmin: false,
  unreadCount: 0,
  initializing: true,
  loading: false,
  error: null,
  configured: isSupabaseConfigured,

  /**
   * Resolve a sessão e carrega o perfil.
   *
   * O profile é criado por trigger no banco (handle_new_user), então pode
   * haver um pequeno atraso entre o login e a disponibilidade da linha —
   * por isso tentamos uma vez e, se falhar, reagimos ao evento de sessão.
   */
  initialize: async () => {
    if (!isSupabaseConfigured) {
      set({ initializing: false });
      return;
    }

    try {
      const session = await getSession();
      set({ session, user: session?.user ?? null, initializing: false });

      if (session?.user) {
        await get().refreshProfile();
      }
    } catch {
      set({ initializing: false });
    }

    // Mantém o estado em sincronia com refresh de token, logout e login social.
    onAuthStateChange(async (event, session) => {
      set({ session, user: session?.user ?? null });

      if (event === 'SIGNED_IN' && session?.user) {
        await get().refreshProfile();
      }

      if (event === 'SIGNED_OUT') {
        set({ profile: null, preferences: null, isAdmin: false, unreadCount: 0 });
      }
    });
  },

  refreshProfile: async () => {
    const user = get().user;
    if (!user) return;

    try {
      const [profileRes, prefsRes, adminRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('user_preferences').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('admin_users').select('role, active').eq('user_id', user.id).maybeSingle(),
      ]);

      // Se o trigger ainda não criou a profile, criamos aqui como fallback.
      // A política RLS permite inserir apenas a própria linha.
      if (!profileRes.data && !profileRes.error) {
        const { data } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email ?? '',
            full_name:
              (user.user_metadata?.full_name as string) ||
              (user.user_metadata?.name as string) ||
              (user.email ?? '').split('@')[0],
            avatar_url: (user.user_metadata?.avatar_url as string) || null,
          })
          .select()
          .single();

        set({ profile: data });
      } else if (profileRes.data) {
        set({ profile: profileRes.data });
      }

      if (prefsRes.data) {
        set({ preferences: prefsRes.data });
      } else if (!prefsRes.error) {
        const { data } = await supabase
          .from('user_preferences')
          .insert({ user_id: user.id })
          .select()
          .single();
        set({ preferences: data });
      }

      const admin = adminRes.data;
      set({ isAdmin: Boolean(admin && admin.active && admin.role === 'admin') });

      await get().refreshUnreadCount();
    } catch {
      // Falha ao carregar o perfil não deve derrubar o app — o usuário
      // continua autenticado e as telas degradam com segurança.
    }
  },

  refreshUnreadCount: async () => {
    const user = get().user;
    if (!user) {
      set({ unreadCount: 0 });
      return;
    }
    try {
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      set({ unreadCount: count ?? 0 });
    } catch {
      // Badge é cosmético — falha silenciosa.
    }
  },

  signInGoogle: async () => {
    set({ loading: true, error: null });
    const { error } = await signInWithGoogle();
    if (error) set({ error, loading: false });
    // Sem error: o navegador está sendo redirecionado. O loading fica
    // ativo de propósito até a página recarregar.
    return error;
  },

  signInEmail: async (email, password) => {
    set({ loading: true, error: null });
    const { error } = await signInWithEmail(email, password);
    set({ loading: false, error });
    if (!error) await get().refreshProfile();
    return error;
  },

  signUpEmail: async (email, password, fullName) => {
    set({ loading: true, error: null });
    const result = await signUpWithEmail(email, password, fullName);
    set({ loading: false, error: result.error });
    return result;
  },

  resetPassword: async (email) => {
    set({ loading: true, error: null });
    const { error } = await requestPasswordReset(email);
    set({ loading: false, error });
    return error;
  },

  setNewPassword: async (password) => {
    set({ loading: true, error: null });
    const { error } = await updatePassword(password);
    set({ loading: false, error });
    return error;
  },

  signOut: async () => {
    set({ loading: true });
    await supabaseSignOut();
    set({
      session: null,
      user: null,
      profile: null,
      preferences: null,
      isAdmin: false,
      loading: false,
    });
  },

  clearError: () => set({ error: null }),
}));
