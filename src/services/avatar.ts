/**
 * Foto de perfil.
 *
 * Regras de segurança aplicadas no cliente E no servidor:
 *  • caminho sempre `<user_id>/<arquivo>` — as políticas de Storage recusam
 *    escrever em pasta de outro usuário;
 *  • apenas JPEG/PNG/WebP (SVG é vetorial e pode carregar script);
 *  • limite de 2 MB, validado antes do envio e também no bucket;
 *  • a URL só é gravada no perfil depois de o upload terminar.
 */

import { supabase } from '@/lib/supabase';

const BUCKET = 'avatars';
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
export const ACCEPTED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export interface AvatarResult {
  ok: boolean;
  url?: string;
  error?: string;
}

function extensionFor(type: string): string {
  return type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
}

export function validateAvatarFile(file: File): string | null {
  if (!(ACCEPTED_AVATAR_TYPES as readonly string[]).includes(file.type)) {
    return 'Envie uma imagem JPG, PNG ou WebP.';
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return 'A imagem deve ter no máximo 2 MB.';
  }
  if (file.size === 0) {
    return 'O arquivo está vazio.';
  }
  return null;
}

/** Envia a foto e atualiza o perfil. Retorna a URL pública versionada. */
export async function uploadAvatar(userId: string, file: File): Promise<AvatarResult> {
  const invalid = validateAvatarFile(file);
  if (invalid) return { ok: false, error: invalid };

  const path = `${userId}/avatar-${Date.now()}.${extensionFor(file.type)}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false, cacheControl: '3600' });

  if (uploadError) {
    return { ok: false, error: 'Não foi possível enviar a foto. Tente novamente.' };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const url = data.publicUrl;

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_url: url })
    .eq('id', userId);

  if (profileError) {
    // Não deixa arquivo órfão se o perfil recusou a URL.
    await supabase.storage.from(BUCKET).remove([path]);
    return { ok: false, error: 'Foto enviada, mas não foi possível salvá-la no perfil. Tente novamente.' };
  }

  // Remove versões antigas para não acumular arquivos do mesmo usuário.
  await removeOtherAvatars(userId, path);

  return { ok: true, url };
}

async function removeOtherAvatars(userId: string, keepPath: string): Promise<void> {
  try {
    const { data } = await supabase.storage.from(BUCKET).list(userId);
    const stale = (data ?? [])
      .map((entry) => `${userId}/${entry.name}`)
      .filter((full) => full !== keepPath);
    if (stale.length > 0) await supabase.storage.from(BUCKET).remove(stale);
  } catch {
    // Limpeza é melhor esforço; não invalida o upload concluído.
  }
}

/** Remove a foto e limpa o campo no perfil. */
export async function removeAvatar(userId: string): Promise<AvatarResult> {
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_url: null })
    .eq('id', userId);

  if (profileError) {
    return { ok: false, error: 'Não foi possível remover a foto. Tente novamente.' };
  }

  try {
    const { data } = await supabase.storage.from(BUCKET).list(userId);
    const paths = (data ?? []).map((entry) => `${userId}/${entry.name}`);
    if (paths.length > 0) await supabase.storage.from(BUCKET).remove(paths);
  } catch {
    // O campo já foi limpo; arquivos órfãos são removidos na exclusão da conta.
  }

  return { ok: true };
}
