/**
 * POST /api/ai/plan
 *
 * Gera um plano semanal com IA — SOMENTE quando AI_API_KEY está configurada.
 * Sem a chave, responde 503 e o cliente usa o gerador determinístico.
 *
 * Segurança:
 *  • valida o JWT do Supabase antes de qualquer chamada ao provedor;
 *  • limita requisições por usuário;
 *  • descarta exercícios fora da lista de candidatos (anti-alucinação);
 *  • normaliza e valida a saída antes de responder.
 */

import { jsonError, rateLimit, readHeader, type ApiRequest, type ApiResponse } from '../_lib/http';
import { verifyUser } from '../_lib/auth';
import { completeJson, ProviderError, readProviderConfig } from '../_lib/provider';
import {
  aiPlanSchema,
  buildPlanMessages,
  planRequestSchema,
  type Candidate,
} from '../_lib/planContract';

function normalizeExercise(
  raw: { exerciseId: string; sets: number; reps: string; restSeconds: number; durationSeconds: number | null; notes: string | null },
  candidate: Candidate,
  catalogVideo: string | null = null,
) {
  return {
    exerciseId: candidate.id,
    name: candidate.name,
    primaryMuscle: candidate.muscle,
    pattern: candidate.pattern,
    equipment: candidate.equipment,
    sets: Math.min(20, Math.max(1, Math.round(raw.sets))),
    reps: raw.reps.slice(0, 40),
    restSeconds: Math.min(900, Math.max(0, Math.round(raw.restSeconds))),
    durationSeconds: raw.durationSeconds === null ? null : Math.min(7200, Math.max(0, Math.round(raw.durationSeconds))),
    notes: raw.notes ? raw.notes.slice(0, 400) : null,
    videoUrl: catalogVideo,
    alternatives: [],
  };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return jsonError(res, 405, 'Método não permitido.');
  }

  const config = readProviderConfig();
  if (!config) {
    return jsonError(res, 503, 'Serviço de IA não configurado no servidor.', {
      code: 'ai_not_configured',
    });
  }

  const parsed = planRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return jsonError(res, 400, 'Requisição inválida.');
  }

  const request = parsed.data;

  const token = request.token ?? readHeader(req, 'authorization')?.replace(/^Bearer\s+/i, '');
  const user = await verifyUser(token);
  if (!user) {
    return jsonError(res, 401, 'Sessão inválida. Entre novamente.');
  }

  if (!rateLimit(`plan:${user.id}`, 8, 60 * 60 * 1000)) {
    return jsonError(res, 429, 'Limite de gerações por hora atingido. Tente mais tarde.');
  }

  try {
    const completion = await completeJson(config, buildPlanMessages(request));
    const raw = aiPlanSchema.safeParse(JSON.parse(completion.text));

    if (!raw.success) {
      return jsonError(res, 422, 'A IA não devolveu um plano no formato esperado.');
    }

    const candidates = new Map(request.candidates.map((candidate) => [candidate.id, candidate]));

    const days = raw.data.days
      .map((day) => {
        const exercises = day.exercises
          .map((exercise) => {
            const candidate = candidates.get(exercise.exerciseId);
            return candidate ? normalizeExercise(exercise, candidate) : null;
          })
          .filter((exercise): exercise is NonNullable<typeof exercise> => exercise !== null);

        // Remove duplicatas dentro do dia (a IA às vezes repete).
        const seen = new Set<string>();
        const unique = exercises.filter((exercise) => {
          if (seen.has(exercise.exerciseId)) return false;
          seen.add(exercise.exerciseId);
          return true;
        });

        const workSeconds = unique.reduce(
          (total, exercise) =>
            total + (exercise.durationSeconds ?? exercise.sets * 40) + exercise.restSeconds * Math.max(0, exercise.sets - 1),
          0,
        );

        return {
          label: day.label.slice(0, 24),
          name: day.name.slice(0, 120),
          weekday: day.weekday,
          estimatedMinutes: Math.min(180, Math.max(10, Math.round(workSeconds / 60) + 8)),
          muscles: [...new Set(unique.map((exercise) => exercise.primaryMuscle))],
          rationale: day.rationale,
          exercises: unique,
        };
      })
      .filter((day) => day.exercises.length > 0);

    if (days.length === 0) {
      return jsonError(res, 422, 'A IA não sugeriu exercícios válidos do catálogo.');
    }

    res.status(200).json({
      model: completion.model,
      program: {
        name: raw.data.name,
        goal: request.profile.goal,
        level: request.profile.level,
        environment: request.profile.environment,
        split: days.length <= 2 ? 'full_body' : 'split',
        days,
        rationale: raw.data.rationale,
        warnings: raw.data.warnings,
        source: 'ai',
        seed: request.seed,
      },
    });
  } catch (error) {
    if (error instanceof ProviderError) {
      return jsonError(res, 502, 'O provedor de IA não respondeu. Tente novamente.');
    }
    return jsonError(res, 500, 'Não foi possível gerar o plano com IA.');
  }
}
