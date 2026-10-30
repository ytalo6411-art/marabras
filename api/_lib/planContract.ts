/**
 * Contrato do plano vindo da IA.
 *
 * A IA recebe o perfil e uma lista FECHADA de exercícios (com id do banco) e
 * deve devolver um JSON que use só esses ids. O servidor normaliza e valida;
 * qualquer exercício inventado é descartado antes de chegar ao cliente — e o
 * cliente valida de novo antes de gravar.
 */

import { z } from 'zod';

export const profileSchema = z.object({
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  goal: z.enum([
    'hypertrophy', 'strength', 'conditioning', 'endurance',
    'mobility', 'fat_loss', 'active_routine', 'sport_performance',
  ]),
  secondaryGoals: z.array(z.string()).max(4).default([]),
  environment: z.enum(['gym', 'home_equipment', 'home_bodyweight', 'outdoor', 'other']),
  equipment: z.array(z.string()).min(1).max(12),
  sessionsPerWeek: z.number().int().min(1).max(7),
  minutesPerSession: z.number().int().min(10).max(180),
  preferredDays: z.array(z.number().int().min(0).max(6)).max(7).default([]),
  splitPreference: z.enum(['full_body', 'split', 'coach_choice']),
  priorityMuscles: z.array(z.string()).max(8).default([]),
  avoidedExercises: z.array(z.string()).max(20).default([]),
  preferredTraining: z.array(z.string()).max(5).default([]),
  limitations: z.array(z.string()).max(8).default([]),
});

export const candidateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  muscle: z.string().min(1),
  equipment: z.array(z.string()).min(1),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  pattern: z.string().min(1),
});

export const planRequestSchema = z.object({
  token: z.string().min(20),
  profile: profileSchema,
  candidates: z.array(candidateSchema).min(1).max(200),
  seed: z.string().min(1).max(120),
});

export type PlanRequest = z.infer<typeof planRequestSchema>;
export type Candidate = z.infer<typeof candidateSchema>;

/** O que exigimos do modelo (normalizamos o resto no servidor). */
export const aiPlanSchema = z.object({
  name: z.string().min(1).max(120),
  rationale: z.array(z.string().max(600)).min(1).max(10),
  warnings: z.array(z.string().max(400)).max(8).default([]),
  days: z
    .array(
      z.object({
        label: z.string().min(1).max(24),
        name: z.string().min(1).max(120),
        weekday: z.number().int().min(0).max(6).nullable().default(null),
        rationale: z.string().min(1).max(600),
        exercises: z
          .array(
            z.object({
              exerciseId: z.string().min(1),
              sets: z.number().int().min(1).max(20),
              reps: z.string().min(1).max(40),
              restSeconds: z.number().int().min(0).max(900),
              durationSeconds: z.number().int().min(0).max(7200).nullable().default(null),
              notes: z.string().max(400).nullable().default(null),
            }),
          )
          .min(1)
          .max(10),
      }),
    )
    .min(1)
    .max(7),
});

export type AiPlanRaw = z.infer<typeof aiPlanSchema>;

const SYSTEM_PROMPT = `Você é um planejador de treinamento de força do ATHLETIX.
Regras obrigatórias:
1. Use SOMENTE exercícios da lista "candidatos" fornecida, usando exatamente o campo "id".
2. Nunca invente exercício, vídeo, imagem, estudo ou resultado. Nunca prometa prazo ou garantia.
3. Respeite o nível: iniciante não recebe exercícios avançados.
4. Respeite os equipamentos. Só use exercícios cujo equipamento esteja na lista do perfil (peso do corpo é sempre permitido).
5. Não repita o mesmo exercício no mesmo dia. Evite repetir o mesmo exercício na semana quando houver alternativa.
6. Respeite limitações: adapte a seleção, sem prescrever reabilitação nem diagnóstico. Se houver sinal de alerta, inclua um aviso em "warnings" recomendando avaliação profissional.
7. Volume e descanso coerentes com o objetivo: força (4-6 reps, 120-180s), hipertrofia (8-12 reps, 60-90s), condicionamento/perda de gordura (12-15 reps, 30-60s), resistência (12-20 reps, 30-60s), mobilidade (30-45s, 20-30s).
8. Gere exatamente o número de dias pedido (sessionsPerWeek), com cerca de minutosPerSession minutos cada.
9. Escreva em português do Brasil, direto e sem exageros.
10. Responda APENAS com JSON válido neste formato:
{"name":string,"rationale":[string],"warnings":[string],"days":[{"label":string,"name":string,"weekday":number|null,"rationale":string,"exercises":[{"exerciseId":string,"sets":number,"reps":string,"restSeconds":number,"durationSeconds":number|null,"notes":string|null}]}]}`;

export function buildPlanMessages(request: PlanRequest) {
  const profile = request.profile;

  const user = `Perfil do usuário (JSON):
${JSON.stringify(profile, null, 2)}

Candidatos disponíveis (id | nome | músculo | equipamento | nível | padrão):
${request.candidates
  .map(
    (candidate) =>
      `${candidate.id} | ${candidate.name} | ${candidate.muscle} | ${candidate.equipment.join('+')} | ${candidate.difficulty} | ${candidate.pattern}`,
  )
  .join('\n')}

Gere o programa semanal considerando objetivo "${profile.goal}", nível "${profile.level}", ${profile.sessionsPerWeek} dias por semana, ${profile.minutesPerSession} minutos por sessão. O primeiro dia deve ser o mais importante para o objetivo.`;

  return [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    { role: 'user' as const, content: user },
  ];
}

export const chatRequestSchema = z.object({
  token: z.string().min(20),
  question: z.string().min(2).max(600),
  context: z.record(z.unknown()).default({}),
});

export const CHAT_SYSTEM_PROMPT = `Você é o treinador do ATHLETIX. Responda em português do Brasil, em no máximo 160 palavras.
Regras: não diagnostique, não prescreva reabilitação, não prometa resultados nem prazos, não invente dados.
Se a pergunta indicar dor aguda, lesão ou sintoma preocupante, oriente procurar um profissional de saúde e parar o exercício.
Se faltar informação no contexto, diga o que o usuário pode verificar no app.
Responda apenas com JSON: {"answer": string}.`;
