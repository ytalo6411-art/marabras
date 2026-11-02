import { supabase } from '@/lib/supabase';
import { isUniqueViolation } from '@/services/dbErrors';
import type { WorkoutExercise, WorkoutSession, WorkoutSet } from '@/types/database';

export type SessionExercise = WorkoutExercise & { exercise: import('@/types/database').Exercise };
export interface SessionProgress { current: number; restUntil: number | null; paused: boolean; remaining: number }
export const initialProgress: SessionProgress = { current: 0, restUntil: null, paused: false, remaining: 90 };
export function sessionExercises(snapshot: unknown, plan: SessionExercise[]): SessionExercise[] {
  if (!Array.isArray(snapshot)) return plan;
  const valid = snapshot.filter((item): item is SessionExercise => !!item && typeof item === 'object' &&
    typeof item.id === 'string' && typeof item.exercise_id === 'string' && !!item.exercise &&
    typeof item.exercise.name === 'string' && Number.isInteger(item.sets) && item.sets > 0);
  return valid.length ? valid : plan;
}
export function progressStorageKey(userId: string, sessionId: string) { return `athletix:session:${userId}:${sessionId}`; }
export function restoreProgress(raw: string | null, count: number): SessionProgress {
  try {
    const p = JSON.parse(raw ?? '{}');
    return { current: Number.isInteger(p.current) ? Math.max(0, Math.min(Math.max(0,count-1),p.current)) : 0,
      restUntil: typeof p.restUntil === 'number' && Number.isFinite(p.restUntil) ? p.restUntil : null,
      paused: p.paused === true, remaining: typeof p.remaining === 'number' ? Math.max(0,Math.min(7200,p.remaining)) : 90 };
  } catch { return { ...initialProgress }; }
}

/**
 * Nome da sessão.
 *
 * `workout_sessions.name` é NOT NULL + CHECK (length(trim(name)) > 0) e não tem
 * default. O insert original não enviava `name`, então o Postgres recusava com
 * SQLSTATE 23502 e a UI mostrava "verifique a migração V10" — a migração estava
 * aplicada; o campo obrigatório é que faltava. O nome vem do plano, com fallback
 * não vazio para o caso de o plano ter sido renomeado para espaços.
 */
export function sessionName(planName: string | null | undefined): string {
  const trimmed = (planName ?? '').trim().replace(/\s+/g, ' ');
  return (trimmed.length ? trimmed : 'Treino').slice(0, 120);
}

/** Payload de abertura de sessão — exportado para ser testado sem rede. */
export function buildSessionInsert(params: {
  planId: string;
  userId: string;
  planName: string | null | undefined;
  exercises: SessionExercise[];
  startedAt?: string;
}) {
  return {
    user_id: params.userId,
    plan_id: params.planId,
    name: sessionName(params.planName),
    // Sem isto o default do banco é 'planned': a sessão nascia inativa, o
    // progresso não sincronizava e complete_workout_session recusava com
    // "Session is not active".
    status: 'in_progress' as const,
    // Sem started_at a duração concluída era sempre 0, porque a função calcula
    // now() - coalesce(started_at, now()).
    started_at: params.startedAt ?? new Date().toISOString(),
    exercise_snapshot: params.exercises,
    client_state: initialProgress,
  };
}

async function findOpenSession(planId: string, userId: string): Promise<string | null> {
  const { data, error } = await supabase.from('workout_sessions')
    .select('id').eq('user_id', userId).eq('plan_id', planId).eq('status', 'in_progress')
    .order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

export async function startSession(planId: string, userId: string): Promise<string> {
  const existing = await findOpenSession(planId, userId);
  if (existing) return existing;

  // O nome é obrigatório no banco e pertence ao plano: lemos antes de inserir.
  const { data: plan, error: planError } = await supabase.from('workout_plans')
    .select('name').eq('id', planId).eq('user_id', userId).maybeSingle();
  if (planError) throw planError;
  if (!plan) throw new Error('Treino não encontrado nesta conta. Atualize a lista de treinos.');

  const { data: exercises, error } = await supabase.from('workout_exercises')
    .select('*, exercise:exercises(*)').eq('plan_id', planId).order('position');
  if (error) throw error;
  if (!exercises?.length) throw new Error('Este treino não tem exercícios. Edite-o antes de iniciar.');

  const { data, error: insertError } = await supabase.from('workout_sessions')
    .insert(buildSessionInsert({
      planId, userId, planName: plan.name, exercises: exercises as SessionExercise[],
    }))
    .select('id').single();

  if (insertError) {
    // Duas abas abertas ao mesmo tempo: a segunda encontra a sessão da primeira
    // em vez de falhar ou duplicar.
    if (isUniqueViolation(insertError)) {
      const raced = await findOpenSession(planId, userId);
      if (raced) return raced;
    }
    throw insertError;
  }
  return data.id;
}
export async function saveSessionProgress(id: string, userId: string, progress: SessionProgress) {
  const { error } = await supabase.from('workout_sessions').update({ client_state: progress }).eq('id',id).eq('user_id',userId);
  if (error) throw error;
}
export async function saveSet(set: Omit<WorkoutSet,'id'|'created_at'> & { id?: string }): Promise<WorkoutSet> {
  const { data, error } = await supabase.from('workout_sets').upsert(set, { onConflict: 'session_id,exercise_id,set_number' }).select('*').single();
  if (error) throw error;
  return data;
}
export async function completeSession(id: string): Promise<WorkoutSession> {
  const { data, error } = await supabase.rpc('complete_workout_session',{ p_session_id: id });
  if (error) throw error;
  return data as unknown as WorkoutSession;
}
