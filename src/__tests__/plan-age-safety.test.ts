import { describe, expect, it } from 'vitest';
import {
  allowedDifficultiesFor,
  generateProgram,
  isMinorProfile,
  validateGeneratedProgram,
} from '@/services/planGenerator';
import { testCatalog, BASE_PROFILE } from './plan-generator.test';

/**
 * Idade tinha efeito ZERO na geração.
 *
 * `ageRange` era coletado no questionário, tipado em PlanGenerationProfile e
 * nunca lido: um atleta de 16 anos que se declarasse avançado recebia a mesma
 * prescrição de força máxima (4–6 reps, até 5 séries) de um adulto avançado,
 * incluindo exercícios de dificuldade avançada.
 *
 * Estes testes travam a proteção. Gênero continua NÃO sendo usado para escolher
 * exercício — a regra é idade/segurança, não estereótipo.
 */

const GYM = {
  environment: 'gym' as const,
  equipment: ['bodyweight', 'barbell', 'dumbbell', 'machine', 'cable', 'bench', 'pullup_bar'],
  minutesPerSession: 90,
  sessionsPerWeek: 4,
  splitPreference: 'split' as const,
};

describe('segurança por idade', () => {
  it('identifica menor de idade apenas pela faixa 16_17', () => {
    expect(isMinorProfile({ ageRange: '16_17' })).toBe(true);
    for (const ageRange of ['18_24', '25_34', '35_44', '45_54', '55_64', '65_plus', null] as const) {
      expect(isMinorProfile({ ageRange })).toBe(false);
    }
    expect(isMinorProfile({})).toBe(false);
  });

  it('menor não recebe dificuldade avançada mesmo se declarando avançado', () => {
    const minor = allowedDifficultiesFor({ ...BASE_PROFILE, level: 'advanced', ageRange: '16_17' });
    expect(minor).not.toContain('advanced');
    expect(minor).toContain('beginner');

    const adult = allowedDifficultiesFor({ ...BASE_PROFILE, level: 'advanced', ageRange: '25_34' });
    expect(adult).toContain('advanced');
  });

  it('nenhum exercício avançado entra no plano de menor de idade', () => {
    const program = generateProgram({
      profile: { ...BASE_PROFILE, ...GYM, level: 'advanced', ageRange: '16_17', goal: 'strength' },
      catalog: testCatalog(),
      seed: 'minor-1',
    });
    const advancedIds = new Set(testCatalog().filter((e) => e.difficulty === 'advanced').map((e) => e.id));
    const chosen = program.days.flatMap((day) => day.exercises);
    expect(chosen.length).toBeGreaterThan(0);
    for (const exercise of chosen) expect(advancedIds.has(exercise.exerciseId)).toBe(false);
  });

  it('prescrição do menor: 2–3 séries e nada de faixa de força máxima', () => {
    const program = generateProgram({
      profile: { ...BASE_PROFILE, ...GYM, level: 'advanced', ageRange: '16_17', goal: 'strength' },
      catalog: testCatalog(),
      seed: 'minor-2',
    });
    const strength = program.days.flatMap((day) => day.exercises)
      .filter((e) => e.pattern !== 'cardio' && e.pattern !== 'mobility');
    expect(strength.length).toBeGreaterThan(0);
    for (const exercise of strength) {
      expect(exercise.sets).toBeGreaterThanOrEqual(2);
      expect(exercise.sets).toBeLessThanOrEqual(3);
      // '4–6' é a faixa de força máxima do adulto: não pode aparecer.
      expect(exercise.reps).not.toBe('4–6');
    }
  });

  it('adulto avançado continua recebendo a prescrição de força completa', () => {
    const program = generateProgram({
      profile: { ...BASE_PROFILE, ...GYM, level: 'advanced', ageRange: '25_34', goal: 'strength' },
      catalog: testCatalog(),
      seed: 'adult-1',
    });
    const strength = program.days.flatMap((day) => day.exercises)
      .filter((e) => e.pattern !== 'cardio' && e.pattern !== 'mobility');
    expect(strength.some((e) => e.reps === '4–6')).toBe(true);
    expect(strength.some((e) => e.sets >= 4)).toBe(true);
  });

  it('menor recebe aviso de acompanhamento e explicação da adaptação', () => {
    const program = generateProgram({
      profile: { ...BASE_PROFILE, ...GYM, ageRange: '16_17' },
      catalog: testCatalog(),
      seed: 'minor-3',
    });
    expect(program.warnings.join(' ')).toMatch(/menor de idade/i);
    expect(program.warnings.join(' ')).toMatch(/profissional/i);
    expect(program.rationale.join(' ')).toMatch(/18 anos/);
  });

  it('adulto não recebe o aviso de menor de idade', () => {
    const program = generateProgram({
      profile: { ...BASE_PROFILE, ...GYM, ageRange: '25_34' },
      catalog: testCatalog(),
      seed: 'adult-2',
    });
    expect(program.warnings.join(' ')).not.toMatch(/menor de idade/i);
  });

  it('o plano do menor continua válido no schema (nada foi afrouxado)', () => {
    const profile = { ...BASE_PROFILE, ...GYM, level: 'advanced' as const, ageRange: '16_17' as const, goal: 'hypertrophy' as const };
    const program = generateProgram({ profile, catalog: testCatalog(), seed: 'minor-4' });
    const result = validateGeneratedProgram(program, testCatalog(), profile);
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it('limita exercícios por sessão para o menor, mesmo com 90 min disponíveis', () => {
    const program = generateProgram({
      profile: { ...BASE_PROFILE, ...GYM, level: 'advanced', ageRange: '16_17' },
      catalog: testCatalog(),
      seed: 'minor-5',
    });
    for (const day of program.days) expect(day.exercises.length).toBeLessThanOrEqual(5);
  });
});
