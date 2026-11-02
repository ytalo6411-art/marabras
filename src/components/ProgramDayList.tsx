/**
 * Lista dos dias de um programa, com reordenação persistida.
 *
 * Dois caminhos para a mesma ação, porque arrastar não é acessível:
 *  • ponteiro — arrastar e soltar (HTML5 drag and drop);
 *  • teclado/toque — botões "mover para cima/baixo" com alvo de 44px.
 *
 * A ordem real vem de `days_of_week` no banco. Depois de mover, a lista é
 * recarregada do servidor: nada é reordenado apenas em memória, e uma falha
 * de gravação não deixa a tela mentindo sobre o que foi salvo.
 */

import { useState } from 'react';
import type { WorkoutPlan } from '@/types/database';
import { Alert, Button } from './ui';
import { PlanDayCard } from './training';
import { IconGrip, IconChevronDown } from './icons';
import { useToast } from './useToast';
import { reorderProgramDays } from '@/services/planPersistence';
import { planWeekdayLabel } from '@/services/trainingOverview';

export function ProgramDayList({
  plans,
  onChanged,
}: {
  plans: WorkoutPlan[];
  onChanged: () => Promise<void> | void;
}) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  // Sem dias da semana não há ordem persistível: não oferecemos o controle.
  const canReorder = plans.length > 1 && plans.every((plan) => plan.days_of_week.length > 0);

  async function move(from: number, to: number) {
    if (busy || to < 0 || to >= plans.length || from === to) return;
    setBusy(true);
    setError('');
    const result = await reorderProgramDays(plans, from, to);
    if (!result.ok) {
      setError(result.error ?? 'Não foi possível salvar a nova ordem.');
      setBusy(false);
      return;
    }
    await onChanged();
    toast.show('Ordem dos dias salva', 'success');
    setBusy(false);
  }

  return (
    <>
      {canReorder && (
        <div className="row row-between row-wrap" style={{ marginBottom: 'var(--sp-2)', gap: 'var(--sp-2)' }}>
          <p className="text-xs text-dim" style={{ margin: 0 }}>
            {editing
              ? 'Arraste um dia ou use as setas. A ordem muda o dia da semana de cada treino.'
              : 'A ordem abaixo segue os dias da semana do programa.'}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setEditing((value) => !value); setError(''); }}
            aria-pressed={editing}
            disabled={busy}
          >
            <IconGrip size={15} />
            {editing ? 'Concluir ordem' : 'Reordenar dias'}
          </Button>
        </div>
      )}

      {error && <Alert variant="error">{error}</Alert>}

      <div className="plan-days" role={editing ? 'list' : undefined}>
        {plans.map((plan, index) => (
          <div
            key={plan.id}
            role={editing ? 'listitem' : undefined}
            className={[
              'plan-day-slot',
              editing ? 'plan-day-slot--editing' : '',
              dragIndex === index ? 'plan-day-slot--dragging' : '',
              overIndex === index && dragIndex !== index ? 'plan-day-slot--over' : '',
            ].filter(Boolean).join(' ')}
            draggable={editing && !busy}
            onDragStart={(event) => {
              if (!editing || busy) return;
              setDragIndex(index);
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('text/plain', String(index));
            }}
            onDragOver={(event) => {
              if (!editing || dragIndex === null) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              setOverIndex(index);
            }}
            onDragLeave={() => setOverIndex((current) => (current === index ? null : current))}
            onDrop={(event) => {
              if (!editing) return;
              event.preventDefault();
              const from = Number(event.dataTransfer.getData('text/plain'));
              setDragIndex(null);
              setOverIndex(null);
              if (Number.isInteger(from)) void move(from, index);
            }}
            onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
          >
            {editing && (
              <div className="plan-day-slot__controls">
                <span className="plan-day-slot__grip" aria-hidden="true">
                  <IconGrip size={16} />
                </span>
                <span className="text-xs text-muted grow truncate">
                  {plan.day_label ?? plan.name} · {planWeekdayLabel(plan)}
                </span>
                <button
                  type="button"
                  className="plan-day-slot__move"
                  onClick={() => void move(index, index - 1)}
                  disabled={busy || index === 0}
                  aria-label={`Mover ${plan.day_label ?? plan.name} para cima`}
                >
                  <IconChevronDown size={16} style={{ transform: 'rotate(180deg)' }} />
                </button>
                <button
                  type="button"
                  className="plan-day-slot__move"
                  onClick={() => void move(index, index + 1)}
                  disabled={busy || index === plans.length - 1}
                  aria-label={`Mover ${plan.day_label ?? plan.name} para baixo`}
                >
                  <IconChevronDown size={16} />
                </button>
              </div>
            )}
            <PlanDayCard plan={plan} compact />
          </div>
        ))}
      </div>

      {busy && <p className="text-sm text-muted" role="status">Salvando nova ordem…</p>}
    </>
  );
}
