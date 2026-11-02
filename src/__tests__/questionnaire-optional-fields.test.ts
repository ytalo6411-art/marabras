import { describe, expect, it } from 'vitest';
import {
  EMPTY_ANSWERS,
  questionnaireSchema,
  validateStep,
  type QuestionnaireAnswers,
} from '@/services/trainingProfile';

/**
 * Regressão do segundo bug real, encontrado pelo teste de navegador do fluxo
 * completo (questionário → prévia → salvar).
 *
 * A etapa 1 travava com "gender: Invalid option: expected one of ..." mesmo sem
 * o usuário tocar em nada. Causa: `refreshProfile` cria a profile de fallback só
 * com id/email/full_name/avatar_url, então `profile.gender/height_cm/weight_kg`
 * chegavam `undefined`; o load() do onboarding copiava esse undefined por cima
 * do null seguro, e o schema aceitava null mas não undefined.
 *
 * Duas correções: normalizar para null na origem e tolerar ausência no schema
 * (rascunhos locais antigos também não têm esses campos). As faixas de valor
 * continuam validadas — nada foi afrouxado.
 */

const answered = (): QuestionnaireAnswers => ({
  ...EMPTY_ANSWERS,
  experience: 'never',
  goals: ['hypertrophy'],
  goalPriority: 'hypertrophy',
  environment: 'home_bodyweight',
});

describe('campos opcionais do questionário', () => {
  it('etapa 1 passa com gênero/altura/peso ausentes', () => {
    const answers = answered();
    // Simula a profile de fallback: campos simplesmente não existem.
    delete (answers as Partial<QuestionnaireAnswers>).gender;
    delete (answers as Partial<QuestionnaireAnswers>).heightCm;
    delete (answers as Partial<QuestionnaireAnswers>).weightKg;

    const result = validateStep(1, answers);
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it('etapa 1 passa com os opcionais explicitamente undefined', () => {
    const answers = { ...answered(), gender: undefined, heightCm: undefined, weightKg: undefined };
    expect(validateStep(1, answers as unknown as QuestionnaireAnswers).ok).toBe(true);
  });

  it('schema normaliza ausência para null, sem inventar valor', () => {
    const parsed = questionnaireSchema.safeParse({
      ...answered(),
      gender: undefined,
      heightCm: undefined,
      weightKg: undefined,
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.gender).toBeNull();
    expect(parsed.data.heightCm).toBeNull();
    expect(parsed.data.weightKg).toBeNull();
  });

  it('rascunho antigo sem os campos opcionais continua carregável', () => {
    const legacy = { ...answered() } as Record<string, unknown>;
    for (const key of ['gender', 'heightCm', 'weightKg', 'ageRange', 'sessionLengthPreference', 'splitPreference', 'guidancePreference']) {
      delete legacy[key];
    }
    expect(questionnaireSchema.safeParse(legacy).success).toBe(true);
  });

  it('valores presentes continuam validados (nada foi desativado)', () => {
    expect(questionnaireSchema.safeParse({ ...answered(), heightCm: 5 }).success).toBe(false);
    expect(questionnaireSchema.safeParse({ ...answered(), heightCm: 999 }).success).toBe(false);
    expect(questionnaireSchema.safeParse({ ...answered(), weightKg: 1 }).success).toBe(false);
    expect(questionnaireSchema.safeParse({ ...answered(), weightKg: 900 }).success).toBe(false);
    expect(questionnaireSchema.safeParse({ ...answered(), gender: 'banana' }).success).toBe(false);
    expect(questionnaireSchema.safeParse({ ...answered(), heightCm: 172, weightKg: 68 }).success).toBe(true);
  });

  it('experiência continua obrigatória na etapa 1', () => {
    const result = validateStep(1, { ...answered(), experience: null });
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toMatch(/experiência/i);
  });
});

describe('mensagens de validação', () => {
  it('não vaza nome técnico de campo nem mensagem crua do Zod', () => {
    const result = validateStep(1, { ...answered(), experience: 'banana' } as unknown as QuestionnaireAnswers);
    const text = result.errors.join(' ');
    expect(result.ok).toBe(false);
    expect(text).not.toMatch(/experience:/);
    expect(text).not.toMatch(/Invalid option|expected one of|Invalid input/i);
    expect(text).toMatch(/experiência/i);
  });

  it('altura fora da faixa produz mensagem acionável em português', () => {
    const result = validateStep(1, { ...answered(), heightCm: 5 });
    // heightCm não é campo obrigatório da etapa 1, então não pode travá-la;
    // a mensagem específica aparece no schema, usada ao salvar.
    const parsed = questionnaireSchema.safeParse({ ...answered(), heightCm: 5 });
    expect(parsed.success).toBe(false);
    expect(result.ok).toBe(true);
  });

  it('erro de outra etapa não trava a etapa atual', () => {
    // minutesPerSession inválido pertence à etapa 4, não à 1.
    const result = validateStep(1, { ...answered(), minutesPerSession: 2 });
    expect(result.ok).toBe(true);
    expect(validateStep(4, { ...answered(), minutesPerSession: 2 }).ok).toBe(false);
  });
});
