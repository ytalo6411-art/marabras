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

import { type ApiRequest, type ApiResponse } from '../_lib/http';
import { securityHeaders, checkRequest, userClient, reserve, finish, estimateTokens, handleSecurityError, SecurityError } from '../_lib/security';
import { verifyUser } from '../_lib/auth';
import { completeJson, readProviderConfig } from '../_lib/provider';
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

export const config = { maxDuration: 60 };

export default async function handler(req: ApiRequest, res: ApiResponse) {
  securityHeaders(res);
  let lease: Awaited<ReturnType<typeof reserve>> | undefined;
  let totalTokens: number | null = null;
  try {
    if (req.method !== 'POST') { res.setHeader('Allow','POST'); throw new SecurityError(405,'Método não permitido.'); }
    const token = checkRequest(req);
    const parsed = planRequestSchema.safeParse(req.body);
    if (!parsed.success) throw new SecurityError(400,'Requisição inválida.');
    const request = parsed.data;
    const user = await verifyUser(token);
    if (!user) throw new SecurityError(401,'Sessão inválida. Entre novamente.');
    const config = readProviderConfig();
    if (!config) throw new SecurityError(503,'Serviço de IA não configurado.','ai_not_configured');
    const client = userClient(user.token);
    // Never trust client-supplied exercise metadata/IDs as a catalog authority.
    const { data: rows, error: catalogError } = await client.from('exercises')
      .select('id,name,primary_muscle,equipment,difficulty')
      .in('id',request.candidates.map(c=>c.id)).eq('is_active',true).limit(200);
    if (catalogError) throw new SecurityError(503,'Catálogo indisponível.');
    const byId = new Map((rows ?? []).map(row=>[row.id,row] as const));
    const candidates: Candidate[] = [];
    for (const supplied of request.candidates) {
      const row = byId.get(supplied.id);
      if (!row) continue;
      const candidate = { id:row.id,name:row.name,muscle:row.primary_muscle,equipment:row.equipment as string[],
        difficulty:row.difficulty,pattern:supplied.pattern };
      if (candidate.equipment.some(eq=>!request.profile.equipment.includes(eq) && eq!=='bodyweight') ||
          (request.profile.level==='beginner' && candidate.difficulty!=='beginner') ||
          (request.profile.level==='intermediate' && candidate.difficulty==='advanced')) continue;
      candidates.push(candidate);
    }
    if (!candidates.length) throw new SecurityError(422,'Nenhum candidato autorizado e compatível.');
    const trustedRequest = {...request,candidates};
    lease = await reserve(client,user.id,'plan',request.requestId,estimateTokens(trustedRequest,2200));
    const completion = await completeJson(config,buildPlanMessages(trustedRequest),2200);
    totalTokens = completion.totalTokens;
    let unknown: unknown;
    try { unknown=JSON.parse(completion.text); } catch { throw new SecurityError(422,'A IA devolveu um formato inválido.'); }
    const raw=aiPlanSchema.safeParse(unknown);
    if (!raw.success) throw new SecurityError(422,'A IA não devolveu um plano válido.');
    const catalog=new Map(candidates.map(c=>[c.id,c] as const));
    const days=raw.data.days.map(day=>{
      const seen=new Set<string>();
      const exercises=day.exercises.flatMap(exercise=>{
        const candidate=catalog.get(exercise.exerciseId);
        if (!candidate || seen.has(candidate.id)) return [];
        seen.add(candidate.id);
        return [normalizeExercise(exercise,candidate)];
      });
      const workSeconds=exercises.reduce((total,e)=>total+(e.durationSeconds??e.sets*40)+e.restSeconds*Math.max(0,e.sets-1),0);
      return {label:day.label,name:day.name,weekday:day.weekday,
        estimatedMinutes:Math.min(180,Math.max(10,Math.round(workSeconds/60)+8)),
        muscles:[...new Set(exercises.map(e=>e.primaryMuscle))],rationale:day.rationale,exercises};
    });
    if (days.length!==request.profile.sessionsPerWeek || days.some(day=>!day.exercises.length)) {
      throw new SecurityError(422,'A IA não respeitou o catálogo e a frequência semanal.');
    }
    await finish(lease,totalTokens,true);
    return res.status(200).json({model:completion.model,program:{name:raw.data.name,
      goal:request.profile.goal,level:request.profile.level,environment:request.profile.environment,
      split:days.length<=2?'full_body':'split',days,rationale:raw.data.rationale,
      warnings:raw.data.warnings,source:'ai',seed:request.seed}});
  } catch(error) { return handleSecurityError(res,error); }
  finally { if(lease) { try { await finish(lease,totalTokens,false); } catch { /* charged lease expires */ } } }
}
