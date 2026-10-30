/**
 * Verificação de sessão nas Vercel Functions.
 *
 * O cliente envia o access token do Supabase no corpo/header. Aqui ele é
 * validado contra o próprio projeto Supabase (`auth.getUser`) usando a chave
 * anônima — nenhuma chave secreta é necessária para ler o usuário, e uma
 * chamada de IA nunca acontece sem sessão válida.
 */

import { createClient } from '@supabase/supabase-js';

export interface VerifiedUser {
  id: string;
  email: string | null;
}

interface SupabaseEnv {
  url: string;
  anonKey: string;
}

export function readSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export async function verifyUser(token: string | undefined): Promise<VerifiedUser | null> {
  if (!token || token.length < 20) return null;

  const env = readSupabaseEnv();
  if (!env) return null;

  const client = createClient(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;

  return { id: data.user.id, email: data.user.email ?? null };
}
