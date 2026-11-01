/**
 * Provider de tema global.
 *
 * Montado em main.tsx, FORA das rotas — assim login, recuperação de senha e
 * páginas públicas obedecem ao tema como qualquer tela autenticada.
 *
 * A preferência vive em dois lugares, com responsabilidades distintas:
 *  • localStorage: resolução imediata no primeiro paint (sem flash).
 *  • user_preferences.theme: sincroniza entre dispositivos quando há sessão.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import { ThemeContext, type ThemeContextValue } from './themeContext';
import {
  applyTheme,
  isThemeChoice,
  persistTheme,
  readStoredTheme,
  watchSystemTheme,
  type ResolvedTheme,
  type ThemeChoice,
} from '@/lib/theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [choice, setChoiceState] = useState<ThemeChoice>(() => readStoredTheme());
  const [resolved, setResolved] = useState<ResolvedTheme>(() => applyTheme(readStoredTheme()));
  const choiceRef = useRef(choice);
  const userId = useAuthStore((s) => s.user?.id);
  const preferencesTheme = useAuthStore((s) => s.preferences?.theme);

  // Aplica + persiste localmente a cada mudança.
  useEffect(() => {
    choiceRef.current = choice;
    setResolved(applyTheme(choice));
    persistTheme(choice);
  }, [choice]);

  // Reage à mudança do sistema operacional apenas no modo "system".
  useEffect(() => {
    const stop = watchSystemTheme(() => choiceRef.current);
    const query = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => {
      if (choiceRef.current === 'system') setResolved(applyTheme('system'));
    };
    query.addEventListener('change', onChange);
    return () => { stop(); query.removeEventListener('change', onChange); };
  }, []);

  // Preferência da conta vence ao entrar (sincroniza entre dispositivos).
  useEffect(() => {
    if (isThemeChoice(preferencesTheme)) {
      setChoiceState((current) => (current === preferencesTheme ? current : preferencesTheme));
    }
  }, [preferencesTheme, userId]);

  const setChoice = useCallback((next: ThemeChoice) => {
    setChoiceState(next);
    // Grava na conta em segundo plano; a UI já respondeu localmente.
    const id = useAuthStore.getState().user?.id;
    if (id) {
      void supabase.from('user_preferences').update({ theme: next }).eq('user_id', id);
    }
  }, []);

  const toggle = useCallback(() => {
    setChoice(resolveNext(choiceRef.current));
  }, [setChoice]);

  const value = useMemo<ThemeContextValue>(
    () => ({ choice, resolved, setChoice, toggle }),
    [choice, resolved, setChoice, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function resolveNext(current: ThemeChoice): ThemeChoice {
  const effective = current === 'system' ? applyTheme('system') : current;
  return effective === 'dark' ? 'light' : 'dark';
}
