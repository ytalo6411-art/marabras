import { createContext, useContext } from 'react';
import type { ResolvedTheme, ThemeChoice } from '@/lib/theme';

export interface ThemeContextValue {
  /** Escolha do usuário (inclui "system"). */
  choice: ThemeChoice;
  /** Tema efetivamente aplicado. */
  resolved: ResolvedTheme;
  setChoice: (choice: ThemeChoice) => void;
  /** Alterna claro/escuro saindo de "system" de forma explícita. */
  toggle: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme precisa estar dentro de ThemeProvider');
  return context;
}
