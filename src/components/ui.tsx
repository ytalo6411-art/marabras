import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { IconCheck, IconX } from './icons';

/* ─────────────────────────────────────────────────────────────────────────────
   Button
   ───────────────────────────────────────────────────────────────────────────── */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'google';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  block,
  loading,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  return (
    <button
      className={`btn btn-${variant} ${sizeClass} ${block ? 'btn-block' : ''} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Card
   ───────────────────────────────────────────────────────────────────────────── */

export function Card({
  children,
  className = '',
  ...rest
}: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card ${className}`} {...rest}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Field
   ───────────────────────────────────────────────────────────────────────────── */

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string | null;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error ? (
        <span className="field-error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="field-hint">{hint}</span>
      ) : null}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Alert
   ───────────────────────────────────────────────────────────────────────────── */

export function Alert({
  variant = 'info',
  children,
}: {
  variant?: 'info' | 'error' | 'success' | 'warning';
  children: ReactNode;
}) {
  return (
    <div className={`alert alert-${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      <span>{children}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Skeleton
   ───────────────────────────────────────────────────────────────────────────── */

export function Skeleton({
  height,
  width = '100%',
  className = '',
}: {
  height?: number | string;
  width?: number | string;
  className?: string;
}) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ height, width }}
      aria-hidden="true"
    />
  );
}

/** Lista de skeletons para carregamento de listas. */
export function SkeletonList({ count = 3, height = 80 }: { count?: number; height?: number }) {
  return (
    <div className="stack stack-3" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} height={height} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Empty state
   ───────────────────────────────────────────────────────────────────────────── */

export function EmptyState({
  icon = '📭',
  title,
  text,
  action,
}: {
  icon?: string;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">
        {icon}
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {text && <p className="empty-state__text">{text}</p>}
      {action}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Progress
   ───────────────────────────────────────────────────────────────────────────── */

export function Progress({
  value,
  max = 100,
  tone = 'accent',
  label,
}: {
  value: number;
  max?: number;
  tone?: 'accent' | 'lime' | 'cyan';
  label?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={`progress__fill ${tone !== 'accent' ? `progress__fill--${tone}` : ''}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Modal
   ───────────────────────────────────────────────────────────────────────────── */

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Fecha com Esc e prende o foco dentro do modal.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
      >
        <div className="card-header">
          <h2 className="card-title">{title}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Fechar">
            <IconX size={18} />
          </button>
        </div>
        {children}
        {footer && <div className="row row-wrap" style={{ marginTop: 'var(--sp-4)' }}>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Toast
   ───────────────────────────────────────────────────────────────────────────── */

interface Toast {
  id: number;
  message: string;
  variant: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  show: (message: string, variant?: Toast['variant']) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const show = useCallback((message: string, variant: Toast['variant'] = 'info') => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" role="region" aria-label="Notificações" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.variant}`}>
            <span aria-hidden="true">
              {t.variant === 'success' ? <IconCheck size={18} /> : null}
              {t.variant === 'error' ? <IconX size={18} /> : null}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>');
  return ctx;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Confirmação
   ───────────────────────────────────────────────────────────────────────────── */

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-muted">{message}</div>
    </Modal>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Avatar
   ───────────────────────────────────────────────────────────────────────────── */

export function Avatar({
  name,
  src,
  size = 'md',
}: {
  name?: string | null;
  src?: string | null;
  size?: 'md' | 'lg' | 'xl';
}) {
  const initials = (name || 'A')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const sizeClass = size === 'lg' ? 'avatar-lg' : size === 'xl' ? 'avatar-xl' : '';

  if (src) {
    return (
      <span className={`avatar ${sizeClass}`}>
        <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" />
      </span>
    );
  }

  return (
    <span className={`avatar ${sizeClass}`} aria-hidden="true">
      {initials}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Card clicável
   ───────────────────────────────────────────────────────────────────────────── */

export function ClickableCard({
  onClick,
  children,
  className = '',
  ...rest
}: {
  onClick: () => void;
  children: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`card card-interactive ${className}`} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}
