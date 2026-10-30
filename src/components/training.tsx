/**
 * Componentes de treino reutilizáveis.
 *
 * Seguem o design system existente (`card`, `badge`, `chip`, tokens de cor) —
 * nenhuma identidade nova foi inventada. A ideia é dar hierarquia clara:
 * dia da semana → foco → exercícios → ação principal.
 */

import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { IconChevronRight, IconClock, IconDumbbell, IconPlay, IconSparkles } from './icons';
import type { WorkoutPlan } from '@/types/database';
import { WEEKDAYS_SHORT, planWeekdayLabel } from '@/services/trainingOverview';

/* ─── Cartão de opção (questionário) ───────────────────────────────────────── */

export function OptionCard({
  label,
  hint,
  icon,
  selected,
  onClick,
  disabled,
  multiple,
}: {
  label: string;
  hint?: string;
  icon?: ReactNode;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  multiple?: boolean;
}) {
  return (
    <button
      type="button"
      className={`option-card ${selected ? 'option-card--selected' : ''}`}
      aria-pressed={selected}
      data-multiple={multiple || undefined}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && (
        <span className="option-card__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="option-card__body">
        <span className="option-card__label">{label}</span>
        {hint && <span className="option-card__hint">{hint}</span>}
      </span>
      <span className="option-card__check" aria-hidden="true">
        {selected ? '✓' : ''}
      </span>
    </button>
  );
}

export function OptionGrid({ children }: { children: ReactNode }) {
  return <div className="option-grid">{children}</div>;
}

/* ─── Badge de origem do plano ────────────────────────────────────────────── */

export function PlanSourceBadge({ source }: { source: WorkoutPlan['generated_by'] }) {
  if (source === 'ai') {
    return (
      <span className="badge badge-cyan" title="Plano revisado e validado a partir de uma sugestão de IA">
        <IconSparkles size={12} style={{ verticalAlign: '-2px' }} /> IA validada
      </span>
    );
  }
  if (source === 'rules') {
    return (
      <span className="badge badge-lime" title="Plano montado por regras de treinamento e catálogo do ATHLETIX">
        Plano por regras
      </span>
    );
  }
  if (source === 'template') {
    return <span className="badge">Modelo</span>;
  }
  return <span className="badge">Manual</span>;
}

/* ─── Cartão de dia de treino ─────────────────────────────────────────────── */

export function PlanDayCard({
  plan,
  emphasis,
  compact,
}: {
  plan: WorkoutPlan;
  emphasis?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`plan-day ${emphasis ? 'plan-day--next' : ''}`}>
      <div className="plan-day__head">
        <div className="plan-day__label" aria-hidden="true">
          {plan.day_label ?? '•'}
        </div>
        <div className="grow">
          <h3 className="plan-day__name">{plan.name.replace(/^[A-F]\s·\s/, '')}</h3>
          <div className="row row-wrap plan-day__meta">
            <span>{planWeekdayLabel(plan)}</span>
            {plan.estimated_minutes && (
              <span>
                <IconClock size={12} style={{ verticalAlign: '-2px' }} /> {plan.estimated_minutes} min
              </span>
            )}
            {emphasis && <span className="plan-day__tag">próximo treino</span>}
          </div>
        </div>
      </div>

      {plan.description && !compact && (
        <p className="text-sm text-muted plan-day__desc">{plan.description}</p>
      )}

      <div className="row row-wrap" style={{ gap: 8, marginTop: 'var(--sp-3)' }}>
        <Link to={`/app/session/${plan.id}`} className="btn btn-primary btn-sm">
          <IconPlay size={14} />
          Iniciar
        </Link>
        <Link to={`/app/workouts/${plan.id}`} className="btn btn-secondary btn-sm">
          <IconDumbbell size={14} />
          Ver treino
        </Link>
      </div>
    </div>
  );
}

/* ─── Faixa de dias ───────────────────────────────────────────────────────── */

export function WeekStrip({
  last7,
  streak,
}: {
  last7: boolean[];
  streak: number;
}) {
  // last7 vem de 6 dias atrás até hoje (7 posições). O rótulo usa os dias reais.
  const today = new Date().getDay();
  const ordered = Array.from({ length: 7 }, (_, index) => {
    const dayIndex = (today - 6 + index + 7) % 7;
    return { dayIndex, label: WEEKDAYS_SHORT[dayIndex] ?? '', active: last7[index] ?? false };
  });

  return (
    <div className="week-strip" aria-label={`Sequência atual: ${streak} dia(s) com treino`}>
      {ordered.map((day, index) => (
        <div key={`${day.label}-${index}`} className="week-strip__day">
          <span
            className={`week-strip__dot ${day.active ? 'week-strip__dot--active' : ''}`}
            aria-hidden="true"
          />
          <span className="week-strip__label">{day.label}</span>
        </div>
      ))}
      <div className="week-strip__summary">
        <strong>{streak}</strong>
        <span>{streak === 1 ? 'dia seguido' : 'dias seguidos'}</span>
      </div>
      <span className="sr-only">
        Dias com treino nos últimos 7 dias:{' '}
        {ordered.filter((day) => day.active).map((day) => day.label).join(', ') || 'nenhum'}
      </span>
    </div>
  );
}

/* ─── Linha de exercício (resumo) ─────────────────────────────────────────── */

export function ExerciseLine({
  index,
  name,
  detail,
  href,
}: {
  index: number;
  name: string;
  detail: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="exercise-line__index" aria-hidden="true">
        {index}
      </span>
      <span className="grow">
        <span className="exercise-line__name">{name}</span>
        <span className="exercise-line__detail">{detail}</span>
      </span>
      {href && <IconChevronRight size={16} />}
    </>
  );

  if (href) {
    return (
      <Link to={href} className="exercise-line">
        {content}
      </Link>
    );
  }

  return <div className="exercise-line">{content}</div>;
}
