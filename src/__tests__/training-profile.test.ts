import { describe, expect, it } from 'vitest';
import {
  EMPTY_ANSWERS,
  answersFromRow,
  effectiveEquipment,
  firstIncompleteStep,
  questionnaireSchema,
  toPlanProfile,
  validateStep,
  type QuestionnaireAnswers,
} from '@/services/trainingProfile';
import { computeStreak } from '@/services/trainingOverview';
import type { TrainingProfile } from '@/types/database';
import { inferMovementPattern, levelFromExperience, allowedDifficulties } from '@/data/exerciseTaxonomy';

const COMPLETE: QuestionnaireAnswers = {
  ...EMPTY_ANSWERS,
  experience: 'beginner',
  ageRange: '25_34',
  goals: ['hypertrophy', 'conditioning'],
  goalPriority: 'hypertrophy',
  environment: 'home_equipment',
  equipment: ['bodyweight', 'dumbbell'],
  sessionsPerWeek: 3,
  minutesPerSession: 45,
  preferredDays: [1, 3, 5],
  priorityMuscles: ['glutes'],
  preferredTraining: ['strength_training'],
  splitPreference: 'coach_choice',
  guidancePreference: 'both',
  limitations: [],
  safetyAcknowledged: false,
};

describe('validação do questionário', () => {
  it('exige experiência na etapa 1', () => {
    const result = validateStep(1, { ...EMPTY_ANSWERS });
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatch(/experiência/i);
  });

  it('exige ao menos um objetivo e uma prioridade na etapa 2', () => {
    expect(validateStep(2, { ...EMPTY_ANSWERS, experience: 'beginner' }).ok).toBe(false);
    expect(
      validateStep(2, {
        ...EMPTY_ANSWERS,
        experience: 'beginner',
        goals: ['strength'],
        goalPriority: null,
      }).errors.join(' '),
    ).toMatch(/prioridade/i);

    expect(
      validateStep(2, { ...EMPTY_ANSWERS, experience: 'beginner', goals: ['strength'], goalPriority: 'strength' }).ok,
    ).toBe(true);
  });

  it('não presume equipamento quando o usuário escolhe academia sem marcar nada', () => {
    const result = validateStep(3, {
      ...EMPTY_ANSWERS,
      environment: 'gym',
      equipment: [],
    });
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toMatch(/equipamentos/i);
  });

  it('aceita casa sem equipamento sem exigir seleção', () => {
    expect(validateStep(3, { ...EMPTY_ANSWERS, environment: 'home_bodyweight' }).ok).toBe(true);
  });

  it('exige confirmação de segurança quando há limitação', () => {
    const withLimitation = { ...COMPLETE, limitations: ['knee'], safetyAcknowledged: false };
    expect(validateStep(6, withLimitation).ok).toBe(false);
    expect(validateStep(6, { ...withLimitation, safetyAcknowledged: true }).ok).toBe(true);
  });

  it('encontra a primeira etapa pendente para retomar o fluxo', () => {
    expect(firstIncompleteStep(EMPTY_ANSWERS)).toBe(1);
    expect(firstIncompleteStep(COMPLETE)).toBe(7);
  });

  it('rejeita respostas fora do vocabulário antes de gravar', () => {
    const parsed = questionnaireSchema.safeParse({
      ...COMPLETE,
      sessionsPerWeek: 12,
      goals: ['ficar_gigante'],
    });
    expect(parsed.success).toBe(false);
  });
});

describe('conversão para o gerador', () => {
  it('usa peso do corpo quando não há equipamento marcado', () => {
    const equipment = effectiveEquipment({
      ...EMPTY_ANSWERS,
      environment: 'home_bodyweight',
      equipment: [],
    });
    expect(equipment).toContain('bodyweight');
  });

  it('traduz experiência em nível e limita dificuldade', () => {
    expect(levelFromExperience('never')).toBe('beginner');
    expect(levelFromExperience('intermediate')).toBe('intermediate');
    expect(allowedDifficulties('beginner')).toEqual(['beginner']);
    expect(allowedDifficulties('advanced')).toContain('advanced');
  });

  it('mantém o objetivo prioritário como primeiro do plano', () => {
    const profile = toPlanProfile(COMPLETE);
    expect(profile.goal).toBe('hypertrophy');
    expect(profile.secondaryGoals).toEqual(['conditioning']);
    expect(profile.sessionsPerWeek).toBe(3);
    expect(profile.equipment).toContain('dumbbell');
  });

  it('aplica defaults seguros quando as respostas estão vazias', () => {
    const profile = toPlanProfile(EMPTY_ANSWERS);
    expect(profile.sessionsPerWeek).toBeGreaterThanOrEqual(1);
    expect(profile.minutesPerSession).toBeGreaterThanOrEqual(10);
    expect(profile.equipment.length).toBeGreaterThan(0);
    expect(profile.goal).toBe('active_routine');
  });

  it('reconstrói as respostas a partir da linha salva', () => {
    const row: TrainingProfile = {
      user_id: 'user-1',
      experience: 'intermediate',
      age_range: '25_34',
      goals: ['strength'],
      goal_priority: 'strength',
      environment: 'gym',
      equipment: ['bodyweight', 'barbell'],
      sessions_per_week: 4,
      minutes_per_session: 60,
      preferred_days: [1, 2, 4, 5],
      session_length_preference: 'long',
      priority_muscles: [],
      avoided_exercises: [],
      preferred_training: ['strength_training'],
      split_preference: 'split',
      guidance_preference: 'video',
      limitations: ['lower_back'],
      needs_professional_guidance: true,
      safety_acknowledged: true,
      questionnaire: {},
      schema_version: 1,
      completed_at: '2026-01-01T00:00:00.000Z',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    };

    const answers = answersFromRow(row);
    expect(answers.experience).toBe('intermediate');
    expect(answers.goals).toEqual(['strength']);
    expect(answers.limitations).toEqual(['lower_back']);
    expect(answers.sessionsPerWeek).toBe(4);
  });
});

describe('inferência de padrão de movimento', () => {
  it('distingue agachamento de dobradiça mesmo com músculo parecido', () => {
    expect(inferMovementPattern('Barbell Squat', 'quadriceps')).toBe('squat');
    expect(inferMovementPattern('Romanian Deadlift', 'hamstrings')).toBe('hinge');
    expect(inferMovementPattern('Walking Lunge', 'quadriceps')).toBe('lunge');
    expect(inferMovementPattern('Lat Pulldown', 'lats')).toBe('pull_vertical');
    expect(inferMovementPattern('Plank', 'abdominals')).toBe('core');
  });
});

describe('sequência de atividades', () => {
  const today = new Date('2026-03-10T15:00:00.000Z');

  it('conta dias consecutivos incluindo hoje', () => {
    const streak = computeStreak(
      ['2026-03-10T10:00:00.000Z', '2026-03-09T10:00:00.000Z', '2026-03-08T10:00:00.000Z'],
      today,
    );
    expect(streak.current).toBeGreaterThanOrEqual(2);
    expect(streak.last7).toHaveLength(7);
    expect(streak.last7[6]).toBe(true);
  });

  it('não inventa sequência sem sessões', () => {
    const streak = computeStreak([], today);
    expect(streak.current).toBe(0);
    expect(streak.last7.every((active) => active === false)).toBe(true);
  });

  it('ignora datas nulas', () => {
    const streak = computeStreak([null, null], today);
    expect(streak.current).toBe(0);
  });
});
