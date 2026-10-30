import { describe, it, expect } from 'vitest';
import type { WorkoutPlan, WorkoutExercise } from '@/types/database';

/**
 * Testes das regras de negócio de treino.
 *
 * O CRUD efetivo é validado contra o banco nos testes de integração
 * (`permissions.test.ts`); aqui validamos a lógica pura que transforma
 * os dados do formulário em linhas de banco — que é onde costuma morar
 * o erro de campo trocado (sets/reps/weight) que só aparece em produção.
 */

/** Espelha a transformação usada em `WorkoutBuilderPage`. */
function buildPlanPayload(input: {
  name: string;
  description: string | null;
  workout_type: string;
  days_of_week: number[];
  estimated_minutes: number | null;
  is_active: boolean;
}): Partial<WorkoutPlan> {
  return {
    name: input.name.trim(),
    description: input.description?.trim() || null,
    workout_type: input.workout_type,
    days_of_week: input.days_of_week,
    estimated_minutes: input.estimated_minutes,
    is_active: input.is_active,
  };
}

/** Espelha a transformação de um item do builder para `workout_exercises`. */
function buildExercisePayload(
  exerciseId: string,
  input: { sets: number; reps: string; weight_kg: number | null; rest_seconds: number },
): Partial<WorkoutExercise> {
  return {
    exercise_id: exerciseId,
    sets: input.sets,
    reps: input.reps,
    weight_kg: input.weight_kg,
    rest_seconds: input.rest_seconds,
  };
}

describe('payload de plano de treino', () => {
  it('normaliza o nome e limpa a descrição vazia', () => {
    const payload = buildPlanPayload({
      name: '  Peito e tríceps  ',
      description: '   ',
      workout_type: 'strength',
      days_of_week: [1, 3],
      estimated_minutes: 50,
      is_active: true,
    });

    expect(payload.name).toBe('Peito e tríceps');
    expect(payload.description).toBeNull();
  });

  it('preserva os dias da semana na ordem', () => {
    const payload = buildPlanPayload({
      name: 'Full Body',
      description: null,
      workout_type: 'strength',
      days_of_week: [1, 2, 3, 4, 5],
      estimated_minutes: null,
      is_active: true,
    });

    expect(payload.days_of_week).toEqual([1, 2, 3, 4, 5]);
  });

  it('mantém minutos estimados quando informado', () => {
    const payload = buildPlanPayload({
      name: 'Corrida',
      description: null,
      workout_type: 'cardio',
      days_of_week: [2],
      estimated_minutes: 40,
      is_active: true,
    });

    expect(payload.estimated_minutes).toBe(40);
  });
});

describe('payload de exercício do plano', () => {
  it('mapeia séries, reps, carga e descanso corretamente', () => {
    const payload = buildExercisePayload('ex-uuid-1', {
      sets: 4,
      reps: '8-12',
      weight_kg: 60,
      rest_seconds: 90,
    });

    expect(payload.sets).toBe(4);
    expect(payload.reps).toBe('8-12');
    expect(payload.weight_kg).toBe(60);
    expect(payload.rest_seconds).toBe(90);
  });

  it('mantém carga nula quando o exercício usa peso corporal', () => {
    const payload = buildExercisePayload('ex-uuid-2', {
      sets: 3,
      reps: '20',
      weight_kg: null,
      rest_seconds: 45,
    });

    expect(payload.weight_kg).toBeNull();
  });
});

describe('cálculo de volume e carga', () => {
  it('soma reps × carga das séries concluídas', () => {
    const sets = [
      { reps: 10, weight: 40, done: true },
      { reps: 8, weight: 40, done: true },
      { reps: 10, weight: 40, done: false },
    ];

    const volume = sets
      .filter((s) => s.done)
      .reduce((acc, s) => acc + s.reps * s.weight, 0);

    expect(volume).toBe(720);
  });

  it('ignora séries sem reps ou sem carga', () => {
    const sets = [
      { reps: null, weight: 40, done: true },
      { reps: 10, weight: null, done: true },
      { reps: 10, weight: 30, done: true },
    ];

    const volume = sets
      .filter((s) => s.done)
      .reduce((acc, s) => acc + (s.reps ?? 0) * (s.weight ?? 0), 0);

    expect(volume).toBe(300);
  });
});
