import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase único da aplicação.
 *
 * A chave usada aqui é a "publishable"/"anon" — ela é projetada para ir ao
 * navegador. A segurança dos dados NÃO depende do segredo dessa chave, e sim
 * das políticas RLS no Postgres: cada usuário só enxerga os próprios dados.
 *
 * O `service_role` NUNCA deve aparecer neste arquivo nem em qualquer outro
 * arquivo que vá para o bundle do navegador.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * URL e chave anônima do projeto, exportadas para a camada de serviços.
 *
 * São valores públicos por design (a segurança está nas políticas RLS do
 * Postgres, não na chave). Precisam ser exportados para consultas diretas
 * a endpoints públicos do Auth — por exemplo `/auth/v1/settings`, usado para
 * descobrir quais provedores OAuth estão habilitados.
 */
export { SUPABASE_URL, SUPABASE_ANON_KEY };

/** Indica se as variáveis de ambiente foram configuradas. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

if (!isSupabaseConfigured) {
  // Falha ruidosa em desenvolvimento: melhor do que um erro 401 fantasma.
  if (import.meta.env.DEV) {
    console.error(
      '[ATHLETIX] VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não estão definidas. ' +
        'Copie .env.example para .env e preencha.',
    );
  }
}

/**
 * Se as variáveis não estiverem configuradas, usamos uma URL placeholder.
 * O app ainda renderiza (tela de configuração) em vez de quebrar com
 * "Failed to construct URL" — importante para o preview da Vercel.
 */
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-anon-key',
  {
    auth: {
      // Persistência da sessão no localStorage: o usuário continua logado
      // ao fechar e reabrir o app. Supabase usa refresh token rotativo.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Google OAuth retorna com ?code=... no callback — o SDK troca
      // pelo token automaticamente (detectSessionInUrl: true).
      flowType: 'pkce',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    global: {
      headers: { 'X-Client-Info': 'athletix-web/2.0' },
    },
    db: {
      schema: 'public',
    },
    realtime: {
      params: { eventsPerSecond: 5 },
    },
  },
);

/** URL pública do app (usada nos callbacks OAuth e no PWA). */
export const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;
