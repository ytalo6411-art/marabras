/**
 * Hook de notificações (toasts).
 *
 * Fica em um módulo separado de `ui.tsx` porque o `react-refresh` exige que
 * um arquivo que exporta componentes exporte apenas componentes — misturar
 * hooks e componentes no mesmo módulo quebra o Fast Refresh no dev.
 */

import { useContext } from 'react';
import { ToastContext, type ToastContextValue } from './toastContext';

export type { ToastContextValue };

/** Acessa o provedor de toasts. Deve ser usado dentro de `<ToastProvider>`. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>');
  return ctx;
}
