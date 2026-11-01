import { supabase } from '@/lib/supabase';
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
export async function startSession(planId: string, userId: string): Promise<string> {
  const { data: existing, error: readError } = await supabase.from('workout_sessions')
    .select('id').eq('user_id',userId).eq('plan_id',planId).eq('status','in_progress').maybeSingle();
  if (readError) throw readError;
  if (existing) return existing.id;
  const { data: exercises, error } = await supabase.from('workout_exercises')
    .select('*, exercise:exercises(*)').eq('plan_id',planId).order('position');
  if (error) throw error;
  if (!exercises?.length) throw new Error('Este treino não tem exercícios. Edite-o antes de iniciar.');
  const { data, error: insertError } = await supabase.from('workout_sessions').insert({
    user_id: userId, plan_id: planId, exercise_snapshot: exercises, client_state: initialProgress,
  }).select('id').single();
  if (insertError) throw insertError;
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
