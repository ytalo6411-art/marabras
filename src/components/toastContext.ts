/**
 * Contexto de notificações (toasts).
 *
 * Módulo separado de `ui.tsx` — o `react-refresh` exige que arquivos que
 * exportam componentes exportem apenas componentes (o contexto e o hook
 * quebram o Fast Refresh quando convivem no mesmo módulo).
 */

import { createContext } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

export interface ToastContextValue {
  show: (message: string, variant?: ToastVariant) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
