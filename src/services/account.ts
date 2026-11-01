/**
 * Gestão de conta — exclusão definitiva (LGPD, direito ao esquecimento).
 *
 * O fluxo antigo chamava a RPC e mostrava "Conta excluída" sem checar o
 * resultado. No banco, a exclusão abortava: o trigger de auditoria inseria
 * audit_logs.user_id depois de auth.users já ter sido removido, estourando a
 * FK e revertendo a transação inteira.
 *
 * Regras deste módulo:
 *  1. Reautentica antes de apagar (senha ou provedor OAuth).
 *  2. Remove os arquivos de avatar pela Storage API — SQL direto é bloqueado
 *     por storage.protect_delete().
 *  3. Chama a RPC e SÓ considera sucesso quando o servidor devolve o próprio id.
 *  4. Limpa o estado local depois, nunca antes.
 */

import { supabase } from '@/lib/supabase';

export interface DeleteAccountResult {
  ok: boolean;
  /** Mensagem pronta para a interface, em português. */
  error?: string;
  /** true quando a conta exige nova autenticação antes de excluir. */
  needsReauth?: boolean;
}

const AVATAR_BUCKET = 'avatars';

/** Remove os arquivos de perfil do usuário. Falha aqui não impede a exclusão. */
async function removeAvatarFiles(userId: string): Promise<void> {
  try {
    const { data, error } = await supabase.storage.from(AVATAR_BUCKET).list(userId);
    if (error || !data || data.length === 0) return;
    await supabase.storage
      .from(AVATAR_BUCKET)
      .remove(data.map((entry) => `${userId}/${entry.name}`));
  } catch {
    // Bucket pode não existir ainda. A exclusão da conta segue.
  }
}

/**
 * Reautentica com a senha atual. Usado quando o servidor exige sessão recente
 * para uma ação destrutiva.
 */
export async function reauthenticate(password: string): Promise<{ ok: boolean; error?: string }> {
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email;
  if (!email) return { ok: false, error: 'Sessão expirada. Entre novamente para continuar.' };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: 'Senha incorreta. A conta não foi excluída.' };
  return { ok: true };
}

/** true quando a conta usa senha (e não apenas Google/OAuth). */
export async function hasPasswordIdentity(): Promise<boolean> {
  const { data } = await supabase.auth.getUser();
  const providers = (data.user?.app_metadata?.providers ?? []) as string[];
  return providers.includes('email');
}

/**
 * Exclui a conta e todos os dados vinculados.
 *
 * `password` é obrigatório para contas com senha; contas OAuth precisam ter
 * entrado recentemente no app.
 */
export async function deleteAccount(password?: string): Promise<DeleteAccountResult> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    return { ok: false, error: 'Sessão expirada. Entre novamente para excluir a conta.', needsReauth: true };
  }

  const providers = (user.app_metadata?.providers ?? []) as string[];
  if (providers.includes('email')) {
    if (!password) {
      return { ok: false, error: 'Informe sua senha para confirmar a exclusão.', needsReauth: true };
    }
    const reauth = await reauthenticate(password);
    if (!reauth.ok) return { ok: false, error: reauth.error, needsReauth: true };
  }

  await removeAvatarFiles(user.id);

  const { data, error } = await supabase.rpc('delete_own_account');

  if (error) {
    const message = error.message ?? '';
    if (/authentication required|jwt|expired|not authenticated/i.test(message)) {
      return { ok: false, error: 'Sua sessão expirou. Entre novamente e repita a exclusão.', needsReauth: true };
    }
    // Nunca dizemos "excluída" quando o servidor recusou.
    return {
      ok: false,
      error: 'Não foi possível excluir a conta. Nenhum dado foi removido. Tente novamente ou fale com o suporte.',
    };
  }

  // O servidor devolve o id removido. Sem essa confirmação, não há sucesso.
  if (data !== user.id) {
    return {
      ok: false,
      error: 'O servidor não confirmou a exclusão. Tente novamente antes de sair da conta.',
    };
  }

  return { ok: true };
}
