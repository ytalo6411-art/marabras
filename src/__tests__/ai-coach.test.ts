import { afterEach, describe, expect, it, vi } from 'vitest';
import { aiPlanSchema, planRequestSchema } from '../../api/_lib/planContract';
import { getAiStatus, localCoachAnswer } from '@/services/aiCoach';

const VALID_AI_PLAN = {
  name: 'Hipertrofia ABC',
  rationale: ['Divisão push/pull/legs para três sessões.'],
  warnings: [],
  days: [
    {
      label: 'A',
      name: 'Empurrar',
      weekday: 1,
      rationale: 'Peito, ombro e tríceps.',
      exercises: [
        { exerciseId: 'uuid-1', sets: 3, reps: '8-12', restSeconds: 90, durationSeconds: null, notes: null },
      ],
    },
  ],
};

describe('contrato da IA', () => {
  it('aceita um plano no formato esperado', () => {
    expect(aiPlanSchema.safeParse(VALID_AI_PLAN).success).toBe(true);
  });

  it('rejeita dia sem exercício', () => {
    const invalid = {
      ...VALID_AI_PLAN,
      days: [{ ...VALID_AI_PLAN.days[0]!, exercises: [] }],
    };
    expect(aiPlanSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejeita séries fora de faixa (evita plano absurdo)', () => {
    const invalid = {
      ...VALID_AI_PLAN,
      days: [
        {
          ...VALID_AI_PLAN.days[0]!,
          exercises: [{ ...VALID_AI_PLAN.days[0]!.exercises[0]!, sets: 99 }],
        },
      ],
    };
    expect(aiPlanSchema.safeParse(invalid).success).toBe(false);
  });

  it('exige token de sessão na requisição', () => {
    const result = planRequestSchema.safeParse({
      token: 'curto',
      profile: {
        level: 'beginner',
        goal: 'hypertrophy',
        environment: 'gym',
        equipment: ['bodyweight'],
        sessionsPerWeek: 3,
        minutesPerSession: 45,
        splitPreference: 'coach_choice',
      },
      candidates: [{ id: 'a', name: 'X', muscle: 'chest', equipment: ['bodyweight'], difficulty: 'beginner', pattern: 'push_horizontal' }],
      seed: 'seed',
    });
    expect(result.success).toBe(false);
  });
});

describe('fallback sem IA', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('detecta ausência de provedor e não finge ser IA', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    const status = await getAiStatus(true);
    expect(status.available).toBe(false);

    const answer = localCoachAnswer('quanto tempo de descanso?', {
      goal: 'Hipertrofia',
      level: 'Iniciante',
      sessionsPerWeek: 3,
      minutesPerSession: 45,
    });

    expect(answer).toMatch(/descanso/i);
    expect(answer).not.toMatch(/como uma IA/i);
    expect(answer).toMatch(/não como regra absoluta/i);
  });

  it('orienta procurar profissional diante de dor', () => {
    const answer = localCoachAnswer('senti dor no joelho durante o agachamento', {});
    expect(answer).toMatch(/profissional/i);
    expect(answer).toMatch(/não faz diagnóstico|não é algo para "treinar por cima"/i);
  });
});
