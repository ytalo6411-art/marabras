import { describe, expect, it } from 'vitest';
import {
  dedupeExercises,
  fallbackCatalog,
  filterCatalog,
  findAlternatives,
  normalizeNameKey,
} from '@/services/catalog';
import type { CatalogExercise } from '@/services/catalog';
import { groupPrograms, pickNextWorkout, computeStreak } from '@/services/trainingOverview';
import type { WorkoutPlan } from '@/types/database';

function exercise(overrides: Partial<CatalogExercise>): CatalogExercise {
  return {
    id: 'id-1',
    slug: 'slug-1',
    name: 'Exercício',
    primaryMuscle: 'pectoralis_major',
    secondaryMuscles: [],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    pattern: 'push_horizontal',
    source: 'manual',
    inDatabase: true,
    ...overrides,
  };
}

describe('normalização do catálogo', () => {
  it('normaliza nome removendo acento, caixa e pontuação', () => {
    expect(normalizeNameKey('Flexão de Braços (Diamante)')).toBe('flexao de bracos diamante');
    expect(normalizeNameKey('  Supino   Reto ')).toBe('supino reto');
  });

  it('deduplica o mesmo movimento entre fontes e prioriza o banco', () => {
    const external = exercise({ id: '', name: 'Push-Up', inDatabase: false, equipment: ['bodyweight'] });
    const database = exercise({ id: 'uuid-1', name: 'Push-up', inDatabase: true, equipment: ['bodyweight'] });

    const result = dedupeExercises([external, database]);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('uuid-1');
  });

  it('mantém registros com equipamentos diferentes (não são o mesmo exercício)', () => {
    const bodyweight = exercise({ id: 'a', name: 'Squat', equipment: ['bodyweight'] });
    const barbell = exercise({ id: 'b', name: 'Squat', equipment: ['barbell'] });

    expect(dedupeExercises([bodyweight, barbell])).toHaveLength(2);
  });

  it('filtra por padrão, equipamento, nível e busca textual', () => {
    const items = [
      exercise({ id: 'a', name: 'Supino Reto', primaryMuscle: 'pectoralis_major', pattern: 'push_horizontal', equipment: ['barbell'] }),
      exercise({ id: 'b', name: 'Flexão', pattern: 'push_horizontal', difficulty: 'beginner' }),
      exercise({ id: 'c', name: 'Remada', pattern: 'pull_horizontal', equipment: ['band'] }),
    ];

    expect(filterCatalog(items, { patterns: ['push_horizontal'] })).toHaveLength(2);
    expect(filterCatalog(items, { equipment: ['barbell'] })).toHaveLength(1);
    expect(filterCatalog(items, { difficulties: ['beginner'] })).toHaveLength(3);
    expect(filterCatalog(items, { query: 'remada' })).toHaveLength(1);
    expect(filterCatalog(items, { inDatabaseOnly: true })).toHaveLength(3);
  });

  it('sugere alternativas do mesmo padrão, sem repetir o próprio exercício', () => {
    const base = exercise({ id: 'a', name: 'Supino', pattern: 'push_horizontal', equipment: ['barbell'] });
    const alternatives = findAlternatives(base, [
      base,
      exercise({ id: 'b', name: 'Flexão', pattern: 'push_horizontal', equipment: ['bodyweight'] }),
      exercise({ id: 'c', name: 'Remada', pattern: 'pull_horizontal', equipment: ['bodyweight'] }),
    ]);

    expect(alternatives.map((item) => item.id)).toEqual(['b']);
    expect(alternatives.map((item) => item.id)).not.toContain('a');
  });

  it('fornece catálogo de emergência apenas com dados locais (sem ids do banco)', () => {
    const fallback = fallbackCatalog();
    expect(fallback.length).toBeGreaterThan(10);
    expect(fallback.every((item) => item.inDatabase === false)).toBe(true);
    expect(fallback.every((item) => item.instructions && item.instructions.length > 20)).toBe(true);
  });
});

function plan(overrides: Partial<WorkoutPlan>): WorkoutPlan {
  return {
    id: 'plan-1',
    user_id: 'user-1',
    name: 'Treino',
    description: null,
    focus: 'hypertrophy',
    modality: null,
    days_of_week: [],
    estimated_minutes: 45,
    is_active: true,
    is_template: false,
    program_id: null,
    program_name: null,
    day_label: null,
    generated_by: 'rules',
    rationale: null,
    level: 'beginner',
    environment: 'home_equipment',
    template_slug: null,
    metadata: {},
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('visão semanal', () => {
  it('agrupa planos do mesmo programa', () => {
    const groups = groupPrograms([
      plan({ id: 'p1', program_id: 'prog-1', program_name: 'ABC', day_label: 'A', days_of_week: [1] }),
      plan({ id: 'p2', program_id: 'prog-1', program_name: 'ABC', day_label: 'B', days_of_week: [3] }),
      plan({ id: 'p3', program_id: null }),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups.find((group) => group.programId === 'prog-1')?.plans).toHaveLength(2);
    expect(groups.find((group) => group.programId === null)?.name).toBe('Planos avulsos');
  });

  it('escolhe o treino de hoje quando existe', () => {
    const now = new Date('2026-03-09T12:00:00.000Z'); // segunda-feira local
    const monday = now.getDay();
    const next = pickNextWorkout(
      [
        plan({ id: 'p1', days_of_week: [(monday + 2) % 7] }),
        plan({ id: 'p2', days_of_week: [monday] }),
      ],
      now,
    );

    expect(next?.id).toBe('p2');
  });

  it('escolhe o próximo dia da semana quando hoje não tem treino', () => {
    const now = new Date('2026-03-09T12:00:00.000Z');
    const today = now.getDay();
    const next = pickNextWorkout([plan({ id: 'p1', days_of_week: [(today + 1) % 7] })], now);
    expect(next?.id).toBe('p1');
  });

  it('devolve null quando não há planos', () => {
    expect(pickNextWorkout([])).toBeNull();
  });

  it('marca sequência vazia sem sessões concluídas', () => {
    expect(computeStreak([], new Date()).current).toBe(0);
  });
});
