import { describe, expect, it } from 'vitest';
import {
  generateProgram,
  regenerateDay,
  validateGeneratedProgram,
  type PlanGenerationProfile,
} from '@/services/planGenerator';
import type { CatalogExercise } from '@/services/catalog';
import { inferMovementPattern } from '@/data/exerciseTaxonomy';

type Def = [name: string, muscle: string, equipment: string[], difficulty: CatalogExercise['difficulty']];

const DEFS: Def[] = [
  ['Barbell Bench Press', 'pectoralis_major', ['barbell', 'bench'], 'intermediate'],
  ['Push-Up', 'pectoralis_major', ['bodyweight'], 'beginner'],
  ['Overhead Press', 'deltoids', ['barbell'], 'intermediate'],
  ['Dumbbell Shoulder Press', 'deltoids', ['dumbbell'], 'beginner'],
  ['Pull-Up', 'lats', ['pullup_bar'], 'intermediate'],
  ['Band Row', 'middle_back', ['band'], 'beginner'],
  ['Lat Pulldown', 'lats', ['cable'], 'beginner'],
  ['Barbell Squat', 'quadriceps', ['barbell'], 'intermediate'],
  ['Bodyweight Squat', 'quadriceps', ['bodyweight'], 'beginner'],
  ['Jump Squat', 'quadriceps', ['bodyweight'], 'intermediate'],
  ['Romanian Deadlift', 'hamstrings', ['barbell'], 'intermediate'],
  ['Glute Bridge', 'glutes', ['bodyweight'], 'beginner'],
  ['Walking Lunge', 'quadriceps', ['bodyweight'], 'beginner'],
  ['Calf Raise', 'calves', ['bodyweight'], 'beginner'],
  ['Plank', 'rectus_abdominis', ['bodyweight'], 'beginner'],
  ['Bicycle Crunch', 'obliques', ['bodyweight'], 'beginner'],
  ['Biceps Curl', 'biceps', ['dumbbell'], 'beginner'],
  ['Triceps Pushdown', 'triceps', ['cable'], 'beginner'],
  ['Lateral Raise', 'deltoids', ['dumbbell'], 'beginner'],
  ['Burpee', 'cardiovascular', ['bodyweight'], 'intermediate'],
  ['Hip Mobility Flow', 'mobility', ['bodyweight'], 'beginner'],
  ['Deadlift', 'erector_spinae', ['barbell'], 'advanced'],
  ['Cable Fly', 'pectoralis_major', ['cable'], 'beginner'],
  ['Machine Chest Press', 'pectoralis_major', ['machine'], 'beginner'],
];

export function testCatalog(): CatalogExercise[] {
  return DEFS.map(([name, muscle, equipment, difficulty], index) => ({
    id: `ex-${index + 1}`,
    slug: `ex-${index + 1}`,
    name,
    primaryMuscle: muscle,
    secondaryMuscles: [],
    equipment,
    difficulty,
    pattern: inferMovementPattern(name, muscle),
    instructions: `${name}: execute com controle.`,
    source: 'manual',
    inDatabase: true,
  }));
}

const BASE_PROFILE: PlanGenerationProfile = {
  level: 'beginner',
  goal: 'active_routine',
  secondaryGoals: [],
  environment: 'home_bodyweight',
  equipment: ['bodyweight'],
  sessionsPerWeek: 3,
  minutesPerSession: 40,
  preferredDays: [1, 3, 5],
  splitPreference: 'coach_choice',
  priorityMuscles: [],
  avoidedExercises: [],
  preferredTraining: [],
  limitations: [],
  guidancePreference: 'both',
};

describe('gerador de planos', () => {
  it('gera exatamente um dia por sessão semanal informada', () => {
    const program = generateProgram({
      profile: { ...BASE_PROFILE, sessionsPerWeek: 4, splitPreference: 'split' },
      catalog: testCatalog(),
      seed: 'user-1',
    });

    expect(program.days).toHaveLength(4);
    expect(program.source).toBe('rules');
    expect(program.rationale.length).toBeGreaterThan(0);
  });

  it('respeita o equipamento disponível (casa sem equipamento)', () => {
    const program = generateProgram({
      profile: BASE_PROFILE,
      catalog: testCatalog(),
      seed: 'user-2',
    });

    const exercises = program.days.flatMap((day) => day.exercises);
    expect(exercises.length).toBeGreaterThan(0);

    for (const exercise of exercises) {
      expect(exercise.equipment.some((eq) => eq === 'bodyweight' || eq === 'band')).toBe(true);
    }
  });

  it('não entrega exercícios acima do nível do usuário', () => {
    const program = generateProgram({
      profile: { ...BASE_PROFILE, level: 'beginner' },
      catalog: testCatalog(),
      seed: 'user-3',
    });

    const beginnerOnly = new Set(
      testCatalog().filter((e) => e.difficulty === 'beginner').map((e) => e.id),
    );

    for (const exercise of program.days.flatMap((day) => day.exercises)) {
      expect(beginnerOnly.has(exercise.exerciseId)).toBe(true);
    }
  });

  it('não repete exercício dentro do mesmo dia', () => {
    const program = generateProgram({
      profile: { ...BASE_PROFILE, environment: 'gym', equipment: ['bodyweight', 'barbell', 'machine', 'dumbbell', 'cable', 'bench', 'pullup_bar'], sessionsPerWeek: 5, level: 'advanced', minutesPerSession: 90, splitPreference: 'split' },
      catalog: testCatalog(),
      seed: 'user-4',
    });

    for (const day of program.days) {
      const ids = day.exercises.map((exercise) => exercise.exerciseId);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('é determinístico: mesma semente → mesmos exercícios', () => {
    const first = generateProgram({ profile: BASE_PROFILE, catalog: testCatalog(), seed: 'seed-abc' });
    const second = generateProgram({ profile: BASE_PROFILE, catalog: testCatalog(), seed: 'seed-abc' });

    expect(first.days.map((day) => day.exercises.map((e) => e.exerciseId))).toEqual(
      second.days.map((day) => day.exercises.map((e) => e.exerciseId)),
    );
  });

  it('respeita exercícios que o usuário quer evitar', () => {
    const program = generateProgram({
      profile: { ...BASE_PROFILE, avoidedExercises: ['Push-Up', 'Plank'] },
      catalog: testCatalog(),
      seed: 'user-5',
    });

    const names = program.days.flatMap((day) => day.exercises.map((e) => e.name));
    expect(names).not.toContain('Push-Up');
    expect(names).not.toContain('Plank');
  });

  it('remove da seleção exercícios incompatíveis com a limitação declarada', () => {
    const program = generateProgram({
      profile: { ...BASE_PROFILE, limitations: ['knee'] },
      catalog: testCatalog(),
      seed: 'user-6',
    });

    const names = program.days.flatMap((day) => day.exercises.map((e) => e.name));
    expect(names.some((name) => /jump/i.test(name))).toBe(false);
    expect(program.warnings.join(' ')).toMatch(/avalia/i);
  });

  it('prioriza o grupo muscular escolhido quando há opção', () => {
    const program = generateProgram({
      profile: {
        ...BASE_PROFILE,
        environment: 'gym',
        equipment: ['bodyweight', 'dumbbell', 'cable', 'machine', 'bench', 'barbell'],
        priorityMuscles: ['biceps'],
        sessionsPerWeek: 3,
      },
      catalog: testCatalog(),
      seed: 'user-7',
    });

    const muscles = program.days.flatMap((day) => day.exercises.map((e) => e.primaryMuscle));
    expect(muscles).toContain('biceps');
  });

  it('não gera plano sem catálogo no banco', () => {
    const program = generateProgram({
      profile: BASE_PROFILE,
      catalog: testCatalog().map((exercise) => ({ ...exercise, inDatabase: false })),
      seed: 'user-8',
    });

    expect(program.days).toHaveLength(0);
    expect(program.warnings[0]).toMatch(/catálogo/i);
  });

  it('declara a origem como regras (nunca finge IA)', () => {
    const program = generateProgram({ profile: BASE_PROFILE, catalog: testCatalog(), seed: 'seed' });
    expect(program.source).toBe('rules');
    expect(program.rationale.join(' ')).toMatch(/regras/i);
    expect(program.rationale.join(' ')).toMatch(/nenhum modelo de IA/i);
  });

  it('regenera um dia trocando exercícios e mantendo os padrões', () => {
    const catalog = testCatalog();
    const day = regenerateDay({
      profile: { ...BASE_PROFILE, environment: 'gym', equipment: ['bodyweight', 'barbell', 'machine', 'dumbbell', 'cable', 'bench', 'pullup_bar'] },
      catalog,
      patterns: ['push_horizontal', 'pull_horizontal', 'squat', 'core'],
      label: 'A',
      name: 'Dia A',
      weekday: 1,
      seed: 'regen-seed',
      avoidExerciseIds: catalog.filter((e) => e.pattern === 'push_horizontal').map((e) => e.id),
    });

    expect(day.exercises.length).toBeGreaterThan(0);
    expect(day.exercises.some((e) => e.pattern === 'push_horizontal')).toBe(true);
    expect(day.rationale).toMatch(/padrões de movimento/i);
  });
});

describe('validação do plano', () => {
  const validProgram = () =>
    generateProgram({
      profile: { ...BASE_PROFILE, environment: 'gym', equipment: ['bodyweight', 'barbell', 'dumbbell', 'machine', 'cable', 'bench', 'pullup_bar'] },
      catalog: testCatalog(),
      seed: 'valid',
    });

  it('aceita um plano gerado com exercícios do catálogo', () => {
    const result = validateGeneratedProgram(validProgram(), testCatalog());
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it('rejeita exercício que não existe no catálogo', () => {
    const program = validProgram();
    const firstDay = program.days[0];
    expect(firstDay).toBeDefined();
    if (!firstDay) return;

    firstDay.exercises[0] = {
      ...firstDay.exercises[0]!,
      exerciseId: 'inventado-123',
      name: 'Exercício Inventado',
    };

    const result = validateGeneratedProgram(program, testCatalog());
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toMatch(/fora do catálogo/i);
  });

  it('rejeita exercício repetido no mesmo dia', () => {
    const program = validProgram();
    const firstDay = program.days[0];
    expect(firstDay).toBeDefined();
    if (!firstDay || firstDay.exercises.length < 2) return;

    firstDay.exercises[1] = { ...firstDay.exercises[0]! };

    const result = validateGeneratedProgram(program, testCatalog());
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toMatch(/repetido/i);
  });

  it('rejeita plano vazio (origem IA) por schema', () => {
    const result = validateGeneratedProgram({
      name: 'Plano',
      goal: 'hypertrophy',
      level: 'beginner',
      environment: 'gym',
      split: 'split',
      days: [],
      rationale: ['x'],
      warnings: [],
      source: 'ai',
      seed: 'x',
    });
    expect(result.ok).toBe(false);
  });
});
