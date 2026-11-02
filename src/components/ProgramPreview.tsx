/**
 * Prévia do programa gerado — antes de gravar no banco.
 *
 * O fluxo anterior gerava e salvava na mesma ação: o usuário só descobria o que
 * tinha recebido depois de o plano já estar na conta. Aqui ele vê dias,
 * exercícios, séries, repetições e descanso, e confirma ou descarta.
 *
 * Reaproveita os componentes e tokens existentes (`card`, `badge`, `plan-day`).
 * Nenhum dado é gravado por este componente.
 */

import { useId, useState } from 'react';
import { t } from '@/i18n/runtime';
import { Alert, Button } from '@/components/ui';
import { IconChevronRight, IconClock, IconDumbbell } from '@/components/icons';
import { PlanSourceBadge } from '@/components/training';
import { muscleGroup } from '@/data/exerciseTaxonomy';
import { WEEKDAYS_SHORT } from '@/services/trainingOverview';
import type { GeneratedProgram } from '@/services/planGenerator';

const MUSCLE_LABELS: Record<string, string> = {
  push: 'Empurrar',
  pull: 'Puxar',
  legs: 'Pernas',
  core: 'Core',
  cardio: 'Cardio',
  mobility: 'Mobilidade',
};

export function ProgramPreview({
  program,
  confirming,
  onConfirm,
  onDiscard,
}: {
  program: GeneratedProgram;
  confirming: boolean;
  onConfirm: () => void;
  onDiscard: () => void;
}) {
  const [openDay, setOpenDay] = useState<string | null>(program.days[0]?.label ?? null);
  const titleId = useId();
  const totalExercises = program.days.reduce((sum, day) => sum + day.exercises.length, 0);

  return (
    <section aria-labelledby={titleId} className="program-preview">
      <div className="row row-between row-wrap" style={{ gap: 'var(--sp-3)' }}>
        <div>
          <span className="eyebrow">PRÉVIA DO SEU PLANO</span>
          <h2 id={titleId} className="section-title" style={{ marginTop: 'var(--sp-1)' }}>
            {program.name}
          </h2>
        </div>
        <PlanSourceBadge source={program.source} />
      </div>

      <p className="text-sm text-muted">
        {t(`${program.days.length} sessões por semana · ${totalExercises} exercícios no total`)}
        {'. '}
        {t('Nada foi salvo ainda — confira e confirme.')}
      </p>

      {program.warnings.map((warning) => (
        <Alert key={warning} variant="warning">{warning}</Alert>
      ))}

      <div className="plan-days" style={{ marginTop: 'var(--sp-4)' }}>
        {program.days.map((day) => {
          const open = openDay === day.label;
          const groups = [...new Set(day.muscles.map((muscle) => muscleGroup(muscle)))];
          return (
            <div key={day.label} className="plan-day">
              <button
                type="button"
                className="plan-day__head program-preview__toggle"
                onClick={() => setOpenDay(open ? null : day.label)}
                aria-expanded={open}
              >
                <span className="plan-day__label" aria-hidden="true">{day.label}</span>
                <span className="program-preview__day-info">
                  <span className="plan-day__name">{day.name}</span>
                  <span className="plan-day__meta">
                    {day.weekday !== null && WEEKDAYS_SHORT[day.weekday] ? (
                      <span className="plan-day__tag">{WEEKDAYS_SHORT[day.weekday]}</span>
                    ) : null}
                    <span className="plan-day__tag">
                      <IconClock size={12} aria-hidden="true" /> {day.estimatedMinutes} min
                    </span>
                    <span className="plan-day__tag">
                      <IconDumbbell size={12} aria-hidden="true" /> {day.exercises.length} exercícios
                    </span>
                  </span>
                </span>
                <IconChevronRight
                  size={16}
                  aria-hidden="true"
                  className={open ? 'program-preview__chevron program-preview__chevron--open' : 'program-preview__chevron'}
                />
              </button>

              {open ? (
                <>
                  <p className="plan-day__desc">{day.rationale}</p>
                  <ul className="program-preview__exercises">
                    {day.exercises.map((exercise) => (
                      <li key={exercise.exerciseId}>
                        <div className="program-preview__exercise-head">
                          <strong>{exercise.name}</strong>
                          <span className="badge">
                            {exercise.sets} × {exercise.reps}
                          </span>
                        </div>
                        <div className="program-preview__exercise-meta text-xs text-muted">
                          <span>{t(MUSCLE_LABELS[muscleGroup(exercise.primaryMuscle)] ?? exercise.primaryMuscle)}</span>
                          {exercise.restSeconds > 0 ? <span>{t(`Descanso ${exercise.restSeconds}s`)}</span> : null}
                          {exercise.alternatives.length > 0 ? (
                            <span>{t(`${exercise.alternatives.length} substituições`)}</span>
                          ) : null}
                        </div>
                        {exercise.notes ? (
                          <p className="text-xs text-muted program-preview__note">{exercise.notes}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                  {groups.length > 0 ? (
                    <p className="text-xs text-muted" style={{ marginTop: 'var(--sp-2)' }}>
                      {t(`Grupos trabalhados: ${groups.map((group) => MUSCLE_LABELS[group] ?? group).join(', ')}`)}
                    </p>
                  ) : null}
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      <details className="program-preview__why">
        <summary>Por que este plano foi montado assim</summary>
        <ul className="summary-list">
          {program.rationale.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </details>

      <div className="row row-wrap" style={{ gap: 'var(--sp-3)', marginTop: 'var(--sp-4)' }}>
        <Button size="lg" onClick={onConfirm} loading={confirming}>
          Salvar este plano
        </Button>
        <Button size="lg" variant="secondary" onClick={onDiscard} disabled={confirming}>
          Voltar e ajustar
        </Button>
      </div>
    </section>
  );
}
