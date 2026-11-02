import { describe, expect, it } from 'vitest';
import {
  generateProgram,
  isHighImpact,
  prefersLowImpact,
  validateGeneratedProgram,
  type PlanGenerationProfile,
} from '@/services/planGenerator';
import type { CatalogExercise } from '@/services/catalog';
import { toPlanProfile, EMPTY_ANSWERS } from '@/services/trainingProfile';
import { testCatalog, BASE_PROFILE } from './plan-generator.test';

/**
 * Altura e peso eram coletados no questionário, salvos na profile e descartados
 * em `toPlanProfile` — a geração nunca os via. Estes testes fixam o efeito real
 * (preferência suave por baixo impacto) e, principalmente, os limites onde ele
 * NÃO pode agir.
 */

const profile = (over: Partial<PlanGenerationProfile> = {}): PlanGenerationProfile => ({
  ...BASE_PROFILE,
  level: 'beginner',
  ...over,
});

function ex(id: string, name: string): CatalogExercise {
  return {
    id,
    slug: id,
    name,
    primaryMuscle: 'quadriceps',
    secondaryMuscles: [],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    pattern: 'cardio',
    instructions: 'Execução controlada.',
    source: 'manual',
    inDatabase: true,
  };
}

describe('o questionário entrega altura e peso à geração', () => {
  it('toPlanProfile repassa os valores informados', () => {
    const result = toPlanProfile({ ...EMPTY_ANSWERS, heightCm: 178, weightKg: 96 });
    expect(result.heightCm).toBe(178);
    expect(result.weightKg).toBe(96);
  });

  it('mantém null quando o usuário não informa (campo opcional)', () => {
    const result = toPlanProfile({ ...EMPTY_ANSWERS, heightCm: null, weightKg: null });
    expect(result.heightCm).toBeNull();
    expect(result.weightKg).toBeNull();
  });
});

describe('prefersLowImpact: quando o sinal liga', () => {
  it('iniciante com massa alta para a estatura', () => {
    expect(prefersLowImpact(profile({ heightCm: 170, weightKg: 100 }))).toBe(true);
  });

  it('não liga sem os dois valores', () => {
    expect(prefersLowImpact(profile({ heightCm: null, weightKg: 100 }))).toBe(false);
    expect(prefersLowImpact(profile({ heightCm: 170, weightKg: null }))).toBe(false);
    expect(prefersLowImpact(profile({ heightCm: null, weightKg: null }))).toBe(false);
  });

  it('não liga para quem está abaixo da faixa', () => {
    expect(prefersLowImpact(profile({ heightCm: 175, weightKg: 70 }))).toBe(false);
  });

  it('não liga para menor de idade, mesmo com os mesmos números', () => {
    // Ponto de corte de IMC adulto não se aplica a adolescente.
    expect(prefersLowImpact(profile({ heightCm: 170, weightKg: 100, ageRange: '16_17' }))).toBe(false);
  });

  it('não liga para quem já treina há mais tempo', () => {
    expect(prefersLowImpact(profile({ heightCm: 170, weightKg: 100, level: 'intermediate' }))).toBe(false);
    expect(prefersLowImpact(profile({ heightCm: 170, weightKg: 100, level: 'advanced' }))).toBe(false);
  });

  it('ignora valores fora da faixa plausível em vez de calcular com lixo', () => {
    expect(prefersLowImpact(profile({ heightCm: 0, weightKg: 100 }))).toBe(false);
    expect(prefersLowImpact(profile({ heightCm: 170, weightKg: 0 }))).toBe(false);
    expect(prefersLowImpact(profile({ heightCm: 999, weightKg: 900 }))).toBe(false);
  });
});

describe('isHighImpact', () => {
  it('reconhece salto e pliometria em português e inglês', () => {
    for (const name of ['Salto no caixote', 'Box Jump', 'Burpee', 'Plyometric Push-up', 'Sprint']) {
      expect(isHighImpact(ex('x', name)), name).toBe(true);
    }
  });

  it('não marca movimento de força controlada', () => {
    for (const name of ['Agachamento livre', 'Supino reto', 'Remada curvada', 'Prancha']) {
      expect(isHighImpact(ex('x', name)), name).toBe(false);
    }
  });
});

describe('o sinal é suave: nunca esvazia o plano nem proíbe exercício', () => {
  it('catálogo só com impacto ainda gera plano completo', () => {
    // Se o sinal fosse filtro, nenhum exercício sobraria e o plano viria vazio.
    // Catálogo completo (todos os padrões), com nome de impacto em tudo.
    const catalog = testCatalog().map((e) => ({ ...e, name: `Salto ${e.name}`, slug: `salto-${e.slug}` }));
    const p = profile({
      heightCm: 170,
      weightKg: 105,
      sessionsPerWeek: 3,
      preferredDays: [1, 3, 5],
    });
    const program = generateProgram({ profile: p, catalog, seed: 'impact-only' });
    expect(program.days.length).toBe(3);
    for (const day of program.days) {
      expect(day.exercises.length).toBeGreaterThan(0);
    }
    expect(validateGeneratedProgram(program, catalog, p).ok).toBe(true);
  });

  it('havendo gêmeo de baixo impacto, ele é escolhido no lugar do salto', () => {
    // Para cada exercício existe uma versão de impacto idêntica em padrão,
    // músculo, equipamento e nível: a única diferença é o impacto.
    const originals = testCatalog();
    const twins = originals.map((e) => ({
      ...e,
      id: `imp-${e.id}`,
      slug: `imp-${e.slug}`,
      name: `Salto ${e.name}`,
    }));
    const catalog = [...originals, ...twins];
    const base = profile({ sessionsPerWeek: 3, preferredDays: [1, 3, 5] });

    const heavy = generateProgram({ profile: { ...base, heightCm: 170, weightKg: 105 }, catalog, seed: 'same' });
    const light = generateProgram({ profile: { ...base, heightCm: 170, weightKg: 70 }, catalog, seed: 'same' });

    const impactCount = (p: typeof heavy) =>
      p.days.flatMap((d) => d.exercises).filter((e) => e.exerciseId.startsWith('imp-')).length;

    // No primeiro dia, com todos os exercícios ainda unused, o gêmeo de baixo
    // impacto sempre vence: nenhuma versão de salto entra.
    const firstDayImpact = (heavy.days[0]?.exercises ?? []).filter((e) => e.exerciseId.startsWith('imp-'));
    expect(firstDayImpact).toEqual([]);

    // Nos dias seguintes o sinal é suave de propósito: evitar repetir o mesmo
    // exercício (-40) pesa mais que evitar impacto (-10), então a variedade
    // vence. O efeito agregado ainda é menos impacto que o perfil leve.
    expect(impactCount(heavy)).toBeLessThan(impactCount(light));

    // O plano não encolhe por causa da preferência.
    expect(heavy.days.flatMap((d) => d.exercises).length)
      .toBe(light.days.flatMap((d) => d.exercises).length);
  });

  it('não altera a prescrição de séries/reps, só a escolha', () => {
    const catalog = testCatalog();
    const base = profile({ sessionsPerWeek: 3, preferredDays: [1, 3, 5] });
    const a = generateProgram({ profile: { ...base, heightCm: 170, weightKg: 105 }, catalog, seed: 'x' });
    const b = generateProgram({ profile: { ...base, heightCm: 170, weightKg: 70 }, catalog, seed: 'x' });
    const volume = (p: typeof a) => p.days.flatMap((d) => d.exercises).reduce((sum, e) => sum + e.sets, 0);
    expect(volume(a)).toBe(volume(b));
  });

  it('não interfere em sexo: nenhum campo de gênero entra na geração', () => {
    const catalog = testCatalog();
    const p = profile({ heightCm: 175, weightKg: 78, sessionsPerWeek: 3, preferredDays: [1, 3, 5] });
    const a = generateProgram({ profile: p, catalog, seed: 'gender-neutral' });
    const b = generateProgram({ profile: { ...p }, catalog, seed: 'gender-neutral' });
    expect(a.days.map((d) => d.exercises.map((e) => e.exerciseId)))
      .toEqual(b.days.map((d) => d.exercises.map((e) => e.exerciseId)));
  });
});
