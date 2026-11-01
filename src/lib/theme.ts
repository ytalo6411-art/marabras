/**
 * Tema do ATHLETIX — claro, escuro e sistema.
 *
 * Problemas que este módulo resolve:
 *  • "Sistema" era gravado no perfil mas o AppShell só conhecia light/dark,
 *    então a opção não tinha efeito real.
 *  • O tema só era aplicado dentro do AppShell: login, reset de senha e
 *    páginas públicas ficavam sempre escuras.
 *  • Havia flash de tema errado no primeiro paint.
 *
 * Agora a resolução é única, roda antes do React (script inline no index.html
 * replicando esta lógica) e reage à mudança do sistema enquanto "system"
 * estiver selecionado.
 */

export type ThemeChoice = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

/** Chave pública de preferência: não contém dado pessoal. */
export const THEME_STORAGE_KEY = 'athletix-theme';

const CHOICES: ThemeChoice[] = ['light', 'dark', 'system'];

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return typeof value === 'string' && (CHOICES as string[]).includes(value);
}

export function readStoredTheme(): ThemeChoice {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeChoice(raw) ? raw : 'system';
  } catch {
    return 'system';
  }
}

export function systemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function resolveTheme(choice: ThemeChoice): ResolvedTheme {
  return choice === 'system' ? systemTheme() : choice;
}

/**
 * Aplica o tema no <html> e atualiza a meta theme-color para a barra do
 * navegador mobile acompanhar o tema real.
 */
export function applyTheme(choice: ThemeChoice): ResolvedTheme {
  const resolved = resolveTheme(choice);
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.style.colorScheme = resolved;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', resolved === 'light' ? '#f7f8fa' : '#05070a');
  }
  return resolved;
}

export function persistTheme(choice: ThemeChoice): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    // Modo privado / cota cheia: o tema ainda funciona nesta sessão.
  }
}

/**
 * Observa a preferência do sistema. Só tem efeito quando a escolha é "system";
 * nos outros casos a escolha explícita do usuário sempre vence.
 */
export function watchSystemTheme(getChoice: () => ThemeChoice): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const query = window.matchMedia('(prefers-color-scheme: light)');
  const handler = () => {
    if (getChoice() === 'system') applyTheme('system');
  };
  query.addEventListener('change', handler);
  return () => query.removeEventListener('change', handler);
}
