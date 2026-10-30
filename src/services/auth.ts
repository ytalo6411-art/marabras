import type { Session, User } from '@supabase/supabase-js';
import { supabase, APP_URL, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';

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
  | 'provider_disabled'
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

  // O provedor OAuth não está habilitado no projeto Supabase. Não adianta
  // tentar de novo: é uma configuração do servidor, não um erro do usuário.
  if (/provider is not enabled|unsupported provider/i.test(message)) {
    return {
      code: 'provider_disabled',
      message:
        'O login com Google ainda não está disponível. Use e-mail e senha, ou volte mais tarde.',
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
 * Descobre quais provedores externos estão habilitados no projeto Supabase.
 *
 * Usa o endpoint oficial `/auth/v1/settings`, que aceita a chave anônima
 * (é público por design — não devolve segredo nenhum). É o único jeito
 * seguro de saber, no navegador, se o Google está ligado.
 *
 * Se a consulta falhar (sem rede, projeto fora do ar), devolvemos `null`
 * como "não sabemos" — nesse caso tentamos o login normalmente, porque o
 * botão do Google deve funcionar mesmo sem essa verificação.
 */
export async function getEnabledAuthProviders(): Promise<Record<string, boolean> | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_ANON_KEY ?? '' },
    });

    if (!res.ok) return null;

    const body = (await res.json()) as { external?: Record<string, boolean> };
    return body.external ?? null;
  } catch {
    // Falha de rede não deve impedir o login: tratamos como "desconhecido".
    return null;
  }
}

/**
 * Inicia o login com Google.
 *
 * Usa `redirectTo` apontando para a raiz do app: o Supabase redireciona de
 * volta depois do consentimento, o SDK troca o `code` pela sessão e o
 * `onAuthStateChange` dispara. O usuário cai direto no dashboard.
 *
 * `skipBrowserRedirect: false` = o SDK cuida da navegação.
 *
 * IMPORTANTE — por que checamos o provedor antes de redirecionar:
 * `signInWithOAuth` monta a URL e faz `window.location.assign(...)`. Se o
 * Google estiver desabilitado no projeto, o Supabase responde 400 com um
 * JSON cru ("Unsupported provider: provider is not enabled") e o navegador
 * MOSTRA ESSA PÁGINA DE ERRO — o usuário sai do app e nunca vê o
 * tratamento de erro do ATHLETIX. Por isso consultamos `/auth/v1/settings`
 * antes: assim devolvemos uma mensagem clara em português e o usuário
 * permanece no app, com o login por e-mail e senha à mão.
 */
export async function signInWithGoogle(): Promise<{ error: AuthError | null }> {
  const providers = await getEnabledAuthProviders();

  // `providers === null` significa "não deu para verificar" — nesse caso
  // seguimos o fluxo normal em vez de bloquear o usuário sem motivo.
  if (providers && providers.google === false) {
    return {
      error: {
        code: 'provider_disabled',
        message:
          'O login com Google ainda não está disponível. Use e-mail e senha, ou volte mais tarde.',
      },
    };
  }

  try {
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
  } catch (err) {
    // O SDK pode lançar em vez de retornar (ex.: falha de rede no redirect).
    // Traduzimos para não vazar mensagem crua do backend na tela.
    return { error: translateAuthError(err) };
  }
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
