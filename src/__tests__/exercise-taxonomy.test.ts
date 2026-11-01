import { describe, it, expect } from 'vitest';
import seed from '../../supabase/seed/exercises.json';
import localized from '../data/exerciseNamesPt.json';
import { inferMovementPattern } from '@/data/exerciseTaxonomy';
import { generateProgram, validateGeneratedProgram, type PlanGenerationProfile } from '@/services/planGenerator';
import type { CatalogExercise } from '@/services/catalog';

const catalog: CatalogExercise[] = (seed as Record<string, unknown>[]).map((row, i) => ({
  id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
  slug: String(row.slug),
  name: String(row.name),
  primaryMuscle: String(row.primary_muscle),
  secondaryMuscles: (row.secondary_muscles as string[]) ?? [],
  equipment: (row.equipment as string[]) ?? ['bodyweight'],
  difficulty: (row.difficulty as 'beginner') ?? 'beginner',
  pattern: inferMovementPattern(String(row.name), String(row.primary_muscle)),
  videoUrl: row.video_url as string,
  instructions: row.instructions as string,
  source: 'free_exercise_db',
  inDatabase: true,
}));

function profile(over: Partial<PlanGenerationProfile> = {}): PlanGenerationProfile {
  return {
    level: 'beginner', goal: 'hypertrophy', secondaryGoals: [], environment: 'home_bodyweight',
    equipment: ['bodyweight'], sessionsPerWeek: 3, minutesPerSession: 45, preferredDays: [1, 3, 5],
    splitPreference: 'coach_choice', priorityMuscles: [], avoidedExercises: [], preferredTraining: [],
    limitations: [], guidancePreference: 'both', ageRange: '25_34', ...over,
  };
}

const GYM = ['bodyweight', 'dumbbell', 'barbell', 'machine', 'cable', 'bench'];

describe('classificação de movimento (regressão de bugs reais)', () => {
  // Cada caso abaixo estava classificado ERRADO antes da correção da ordem
  // das regras: `bench` e `curl` genéricos casavam antes do movimento real.
  const cases: [string, string, string][] = [
    ['Bench Dips', 'triceps', 'elbow_extension'],
    ['Bench Pull-Up', 'lats', 'pull_vertical'],
    ['Bench Crunch', 'rectus_abdominis', 'core'],
    ['Band Prone Leg Curl', 'hamstrings', 'hinge'],
    ['Dumbbell Lying Leg Curl', 'hamstrings', 'hinge'],
    ['Lever Seated Leg Curl', 'hamstrings', 'hinge'],
    ['Calf Stretch with Rope', 'calves', 'mobility'],
    ['Barbell Bench Press', 'pectoralis_major', 'push_horizontal'],
    ['Barbell Back Squat', 'quadriceps', 'squat'],
    ['Barbell Drag Curl', 'biceps', 'elbow_flexion'],
    ['Dumbbell Lateral Raise', 'deltoids', 'shoulder_isolation'],
    ['Military Press', 'deltoids', 'push_vertical'],
  ];
  for (const [name, muscle, expected] of cases) {
    it(`${name} → ${expected}`, () => {
      expect(inferMovementPattern(name, muscle)).toBe(expected);
    });
  }
});

describe('catálogo em português', () => {
  it('cobre todos os exercícios do seed, sem deixar nome em inglês', () => {
    expect(localized).toHaveLength(seed.length);
    const bySlug = new Map(localized.map((row) => [row.slug, row]));
    for (const exercise of seed as Record<string, unknown>[]) {
      const row = bySlug.get(String(exercise.slug));
      expect(row, `sem tradução: ${exercise.name}`).toBeDefined();
      expect(row!.name_pt.length).toBeGreaterThan(2);
      expect(row!.name_en).toBe(exercise.name);
    }
  });

  it('desambigua kickback pelo músculo real, não pela palavra', () => {
    const byName = new Map(localized.map((row) => [row.name_en, row.name_pt]));
    // Glúteo não pode virar tríceps.
    expect(byName.get('Band One-Leg Kickback (Bent Position)')).toMatch(/quadril/i);
    expect(byName.get('Dumbbell Kickback')).toMatch(/tríceps/i);
    expect(byName.get('45 Degree Hyperextension')).toMatch(/hiperextensão lombar/i);
    expect(byName.get('Barbell Drag Curl')).toBe('Rosca arrastada com barra');
  });

  it('não mistura equipamentos incompatíveis no mesmo nome', () => {
    for (const row of localized) {
      const pt = row.name_pt.toLowerCase();
      if (pt.includes('na polia')) {
        expect(pt, row.name_en).not.toMatch(/com halteres|com elástico|com barra/);
      }
      if (pt.includes('em máquina')) {
        expect(pt, row.name_en).not.toMatch(/com halteres|com elástico/);
      }
    }
  });
});

describe('gerador entrega exercícios reais para perfis distintos', () => {
  const scenarios: [string, Partial<PlanGenerationProfile>][] = [
    ['iniciante em casa, peso do corpo, 3×45', {}],
    ['iniciante academia, 3×45', { environment: 'gym', equipment: GYM }],
    ['intermediário academia, 4×60', { level: 'intermediate', environment: 'gym', equipment: GYM, sessionsPerWeek: 4, minutesPerSession: 60, preferredDays: [1, 2, 4, 5] }],
    ['iniciante 2×30 (sessão curta)', { sessionsPerWeek: 2, minutesPerSession: 30, preferredDays: [2, 5] }],
    ['mobilidade ao ar livre', { goal: 'mobility', environment: 'outdoor' }],
    ['força avançado 5×75', { level: 'advanced', goal: 'strength', environment: 'gym', equipment: GYM, sessionsPerWeek: 5, minutesPerSession: 75, preferredDays: [1, 2, 3, 4, 5] }],
    ['1 dia por semana', { sessionsPerWeek: 1, preferredDays: [6] }],
  ];

  for (const [label, over] of scenarios) {
    it(`${label}: nenhum dia vazio e plano válido`, () => {
      const p = profile(over);
      const program = generateProgram({ profile: p, catalog, seed: 'regression' });

      expect(program.days.length).toBe(p.sessionsPerWeek);
      for (const day of program.days) {
        expect(day.exercises.length, `dia vazio: ${day.label}`).toBeGreaterThan(0);
        expect(day.estimatedMinutes).toBeLessThanOrEqual(p.minutesPerSession);
      }
      const validation = validateGeneratedProgram(program, catalog, p);
      expect(validation.errors).toEqual([]);
      expect(validation.ok).toBe(true);
    });
  }

  it('respeita equipamento: sem barra para quem só tem peso do corpo', () => {
    const program = generateProgram({ profile: profile(), catalog, seed: 'equip' });
    for (const day of program.days) {
      for (const exercise of day.exercises) {
        expect(exercise.equipment.every((eq) => eq === 'bodyweight')).toBe(true);
      }
    }
  });

  it('respeita exercícios evitados declarados pelo usuário', () => {
    const p = profile({ environment: 'gym', equipment: GYM, avoidedExercises: ['Supino'] });
    const program = generateProgram({ profile: p, catalog, seed: 'avoid' });
    const names = program.days.flatMap((d) => d.exercises.map((e) => e.name.toLowerCase()));
    expect(names.some((n) => n.includes('bench press'))).toBe(false);
  });

  it('é determinístico: mesma entrada e semente geram o mesmo plano', () => {
    const a = generateProgram({ profile: profile(), catalog, seed: 'same' });
    const b = generateProgram({ profile: profile(), catalog, seed: 'same' });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
