/**
 * Dados e helpers da comunidade, fora dos componentes.
 *
 * Separado de `components/community.tsx` porque o Fast Refresh exige que um
 * arquivo de componentes exporte apenas componentes.
 */

import type { ReportReason, SharedWorkout } from '@/services/community';

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam ou propaganda' },
  { value: 'harassment', label: 'Assédio ou ofensa' },
  { value: 'inappropriate', label: 'Conteúdo inadequado' },
  { value: 'dangerous', label: 'Orientação perigosa' },
  { value: 'other', label: 'Outro motivo' },
];

/** Total de exercícios de um snapshot publicado, tolerando dias incompletos. */
export function countExercises(workout: SharedWorkout): number {
  return (workout.snapshot?.days ?? []).reduce(
    (total, day) => total + (day.exercises?.length ?? 0),
    0,
  );
}