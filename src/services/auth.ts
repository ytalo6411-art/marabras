import type { Session, User } from '@supabase/supabase-js';
import { supabase, APP_URL } from '@/lib/supabase';

/**
 * Camada de autenticação do ATHLETIX.
 *
 * Usa exclusivamente os mecanismos oficiais do Supabase Auth:
 *  • Google OAuth via redirect (fluxo PKCE)
 *  • E-mail + senha (signup / signInWithPassword)
 *  • Recuperação de senha por e-mail
 *  • Confirmação de e-mail
 *  • Sessão persistida com refresh token rotativo
 *
 * Nenhuma senha é armazenada manualmente, nenhum token é salvo em
 * localStorage por nós (o SDK cuida disso de forma segura).
 */

export type AuthErrorCode =
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'user_already_exists'
  | 'weak_password'
  | 'rate_limit'
  | 'network'
  | 'unknown';

export interface AuthError {
  code: AuthErrorCode;
  message: string;
}

/** Traduz erros do Supabase para mensagens compreensíveis em português. */
export function translateAuthError(error: unknown): AuthError {
  const raw = error as { message?: string; status?: number; code?: string } | null;
  const message = raw?.message ?? '';
  const status = raw?.status ?? 0;

  if (status === 429 || /rate limit|too many/i.test(message)) {
    return {
      code: 'rate_limit',
      message: 'Muitas tentativas seguidas. Aguarde alguns instantes e tente novamente.',
    };
  }

  if (/invalid login credentials/i.test(message)) {
    return {
      code: 'invalid_credentials',
      message: 'E-mail ou senha incorretos.',
    };
  }

  if (/email not confirmed/i.test(message)) {
    return {
      code: 'email_not_confirmed',
      message: 'Confirme seu e-mail para ativar a conta. Verifique sua caixa de entrada.',
    };
  }

  if (/user already registered|already been registered/i.test(message)) {
    return {
      code: 'user_already_exists',
      message: 'Já existe uma conta com este e-mail. Tente entrar.',
    };
  }

  if (/password should be at least|password is too weak/i.test(message)) {
    return {
      code: 'weak_password',
      message: 'A senha precisa ter pelo menos 6 caracteres.',
    };
  }

  if (/fetch|network|failed to fetch/i.test(message)) {
    return {
      code: 'network',
      message: 'Não foi possível conectar. Verifique sua internet e tente de novo.',
    };
  }

  return {
    code: 'unknown',
    // Nunca repassamos a mensagem crua do backend: ela pode conter
    // detalhes internos (SQL, nomes de tabela, stack). O usuário vê uma
    // mensagem genérica e o erro real fica no console para depuração.
    message: 'Algo deu errado. Tente novamente em instantes.',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Google OAuth
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Inicia o login com Google.
 *
 * Usa `redirectTo` apontando para a raiz do app: o Supabase redireciona de
 * volta depois do consentimento, o SDK troca o `code` pela sessão e o
 * `onAuthStateChange` dispara. O usuário cai direto no dashboard.
 *
 * `skipBrowserRedirect: false` = o SDK cuida da navegação.
 */
export async function signInWithGoogle(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: APP_URL,
      // Pede apenas o mínimo: e-mail e nome do perfil.
      scopes: 'email profile',
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });

  return { error: error ? translateAuthError(error) : null };
}

// ─────────────────────────────────────────────────────────────────────────────
// E-mail + senha
// ─────────────────────────────────────────────────────────────────────────────

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName?: string,
): Promise<{ error: AuthError | null; needsEmailConfirmation: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      emailRedirectTo: APP_URL,
      data: {
        full_name: fullName?.trim() || undefined,
      },
    },
  });

  if (error) {
    return { error: translateAuthError(error), needsEmailConfirmation: false };
  }

  // Se o usuário já existia e está confirmado, o Supabase retorna sessão
  // direto e não envia e-mail novo.
  const needsEmailConfirmation = !data.session && !!data.user;
  return { error: null, needsEmailConfirmation };
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  return { error: error ? translateAuthError(error) : null };
}

/**
 * Envia o e-mail de recuperação de senha.
 *
 * A resposta é sempre bem-sucedida por design, mesmo se o e-mail não existir
 * (evita enumerar contas). Por isso retornamos um erro genérico.
 */
export async function requestPasswordReset(
  email: string,
): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${APP_URL}/auth/reset-password`,
  });

  return { error: error ? translateAuthError(error) : null };
}

/** Define a nova senha depois que o usuário clica no link do e-mail. */
export async function updatePassword(
  password: string,
): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.updateUser({ password });
  return { error: error ? translateAuthError(error) : null };
}

/** Reenvia o e-mail de confirmação de conta. */
export async function resendConfirmation(
  email: string,
): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim(),
    options: { emailRedirectTo: APP_URL },
  });

  return { error: error ? translateAuthError(error) : null };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sessão
// ─────────────────────────────────────────────────────────────────────────────

export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut();
  return { error: error ? translateAuthError(error) : null };
}

/** Recupera a sessão atual (usada no boot do app). */
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** Recupera o usuário atual. */
export async function getUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Assina mudanças de sessão (login, logout, refresh de token).
 * Retorna a função para cancelar a assinatura.
 */
export function onAuthStateChange(
  handler: (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED', session: Session | null) => void,
): () => void {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    handler(
      event as 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED',
      session,
    );
  });

  return () => data.subscription.unsubscribe();
}
