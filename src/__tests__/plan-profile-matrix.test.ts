import { describe, expect, it } from 'vitest';
import {
  generateProgram,
  validateGeneratedProgram,
  type PlanGenerationProfile,
} from '@/services/planGenerator';
import { ENVIRONMENT_EQUIPMENT } from '@/data/exerciseTaxonomy';
import type { CatalogExercise } from '@/services/catalog';
import { testCatalog, BASE_PROFILE } from './plan-generator.test';
import type { DifficultyLevel, TrainingEnvironment, TrainingGoal } from '@/types/database';

/**
 * Matriz de perfis.
 *
 * O gerador era validado sem `profile` nos dois fluxos principais (onboarding e
 * "gerar plano"), então equipamento indisponível, nível incompatível, dia fora
 * da disponibilidade e duração acima do informado passavam batido — só a saída
 * da IA era conferida. Aqui a validação completa roda para cada combinação, que
 * é o que protege a mudança de ter ligado o `profile` nos call sites.
 */

const GOALS: TrainingGoal[] = [
  'hypertrophy', 'strength', 'conditioning', 'endurance',
  'mobility', 'fat_loss', 'active_routine', 'sport_performance',
];
const ENVIRONMENTS: TrainingEnvironment[] = ['gym', 'home_equipment', 'home_bodyweight', 'outdoor', 'other'];
const LEVELS: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced'];

function profileFor(
  goal: TrainingGoal,
  environment: TrainingEnvironment,
  level: DifficultyLevel,
  sessionsPerWeek: number,
  minutesPerSession: number,
): PlanGenerationProfile {
  return {
    ...BASE_PROFILE,
    goal,
    environment,
    level,
    equipment: ENVIRONMENT_EQUIPMENT[environment],
    sessionsPerWeek,
    minutesPerSession,
    // O gerador distribui quando a lista não casa com o número de sessões.
    preferredDays: [1, 3, 5],
    splitPreference: 'coach_choice',
  };
}

/** Catálogo com cobertura real por ambiente, incluindo fora da academia. */
function wideCatalog(): CatalogExercise[] {
  const base = testCatalog();
  const extra: CatalogExercise[] = [];
  const muscles = ['quadriceps', 'pectoralis_major', 'lats', 'glutes', 'rectus_abdominis', 'deltoids', 'hamstrings', 'biceps', 'triceps', 'calves'];
  const kinds: [string, string[]][] = [
    ['Bodyweight', ['bodyweight']],
    ['Band', ['band']],
    ['Dumbbell', ['dumbbell']],
    ['Barbell', ['barbell', 'bench']],
    ['Cable', ['cable']],
    ['Machine', ['machine']],
  ];
  let n = 0;
  for (const [prefix, equipment] of kinds) {
    for (const muscle of muscles) {
      for (const difficulty of ['beginner', 'intermediate'] as const) {
        n += 1;
        const name = `${prefix} ${muscle} ${difficulty} ${n}`;
        extra.push({
          id: `wide-${n}`,
          slug: `wide-${n}`,
          name,
          primaryMuscle: muscle,
          secondaryMuscles: [],
          equipment,
          difficulty,
          pattern: base[n % base.length]!.pattern,
          instructions: `${name}: execução controlada.`,
          source: 'manual',
          inDatabase: true,
        });
      }
    }
  }
  return [...base, ...extra];
}

describe('matriz de perfis: objetivo x ambiente x nível x frequência x tempo', () => {
  const catalog = wideCatalog();
  let combinations = 0;
  const failures: string[] = [];

  for (const goal of GOALS) {
    for (const environment of ENVIRONMENTS) {
      for (const level of LEVELS) {
        for (const [days, minutes] of [[2, 25], [3, 45], [4, 60], [6, 90]] as const) {
          const profile = profileFor(goal, environment, level, days, minutes);
          const label = `${goal}/${environment}/${level}/${days}d/${minutes}min`;
          it(`gera plano válido e coerente: ${label}`, () => {
            combinations += 1;
            const program = generateProgram({ profile, catalog, seed: label });
            const result = validateGeneratedProgram(program, catalog, profile);

            if (!result.ok) failures.push(`${label}: ${result.errors.join(' | ')}`);
            expect(result.errors, label).toEqual([]);
            expect(result.ok, label).toBe(true);

            // Requisitos do produto, não só "passou no schema".
            expect(program.days.length, label).toBe(days);
            const all = program.days.flatMap((day) => day.exercises);
            expect(all.length, label).toBeGreaterThan(0);

            for (const day of program.days) {
              // Sem exercício duplicado no mesmo dia.
              const ids = day.exercises.map((e) => e.exerciseId);
              expect(new Set(ids).size, `${label} duplicado`).toBe(ids.length);
              // Tempo prometido é o tempo cabeível.
              expect(day.estimatedMinutes, `${label} duração`).toBeLessThanOrEqual(Math.max(10, minutes));
              for (const exercise of day.exercises) {
                // Nada de equipamento que o usuário não tem.
                for (const eq of exercise.equipment) {
                  if (eq === 'bodyweight') continue;
                  expect(profile.equipment, `${label} equipamento ${eq}`).toContain(eq);
                }
                expect(exercise.sets).toBeGreaterThan(0);
                expect(exercise.reps.length).toBeGreaterThan(0);
              }
            }
          });
        }
      }
    }
  }

  it('resumo da matriz', () => {
    // Guarda contra a matriz encolher sem ninguém notar.
    expect(combinations).toBeGreaterThanOrEqual(
      GOALS.length * ENVIRONMENTS.length * LEVELS.length * 4,
    );
    expect(failures).toEqual([]);
  });
});

describe('segurança por idade na matriz', () => {
  it('menor de idade nunca recebe advanced, em nenhum objetivo/ambiente', () => {
    const catalog = wideCatalog();
    const advanced = new Set(catalog.filter((e) => e.difficulty === 'advanced').map((e) => e.id));
    for (const goal of GOALS) {
      for (const environment of ENVIRONMENTS) {
        const profile = {
          ...profileFor(goal, environment, 'advanced', 4, 60),
          ageRange: '16_17' as const,
        };
        const program = generateProgram({ profile, catalog, seed: `minor-${goal}-${environment}` });
        for (const exercise of program.days.flatMap((d) => d.exercises)) {
          expect(advanced.has(exercise.exerciseId), `${goal}/${environment}`).toBe(false);
          if (exercise.pattern !== 'cardio' && exercise.pattern !== 'mobility') {
            expect(exercise.sets).toBeLessThanOrEqual(3);
          }
        }
        expect(validateGeneratedProgram(program, catalog, profile).ok).toBe(true);
      }
    }
  });
});
