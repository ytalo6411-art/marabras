/**
 * Comunidade de atletas.
 *
 * Toda a autorização é do servidor (RLS). Este módulo nunca decide quem pode
 * ver o quê — apenas envia a operação e trata o resultado. Trocar um id na
 * requisição não dá acesso a nada: a política recusa e a linha não volta.
 *
 * Publicação usa SNAPSHOT do treino: copiar o plano no momento de publicar
 * evita que editar/apagar o plano privado mude o que os outros já viram, e
 * garante que nenhum dado privado (pesa, carga pessoal, notas) vá junto.
 */

import { supabase } from '@/lib/supabase';
import type { PlanWithExercises } from '@/services/planPersistence';

export interface AthleteProfile {
  user_id: string;
  handle: string;
  display_name: string;
  bio: string | null;
  goals: string | null;
  is_public: boolean;
  show_workouts: boolean;
  show_progress: boolean;
}

export interface AthleteCard {
  user_id: string;
  handle: string;
  display_name: string;
  bio: string | null;
  goals: string | null;
  avatar_url: string | null;
  show_workouts: boolean;
  show_progress: boolean;
}

/** Um exercício publicado: só o necessário para estudar o treino. */
export interface SharedExercise {
  name: string;
  slug: string;
  sets: number;
  reps: string;
  restSeconds: number;
  primaryMuscle: string;
}

export interface SharedDay {
  label: string;
  name: string;
  exercises: SharedExercise[];
}

export interface SharedWorkoutSnapshot {
  days: SharedDay[];
  goal?: string;
  level?: string;
}

export interface SharedWorkout {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  snapshot: SharedWorkoutSnapshot;
  is_public: boolean;
  like_count: number;
  comment_count: number;
  created_at: string;
  author?: AthleteCard | null;
  liked_by_me?: boolean;
}

export interface WorkoutComment {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  author?: AthleteCard | null;
}

export type ReportReason = 'spam' | 'harassment' | 'inappropriate' | 'dangerous' | 'other';

export interface CommunityResult<T = undefined> {
  ok: boolean;
  data?: T;
  error?: string;
}

const HANDLE_RE = /^[a-z0-9_]{3,30}$/;

export function normalizeHandle(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 30);
}

export function validateHandle(value: string): string | null {
  if (!HANDLE_RE.test(value)) {
    return 'Use de 3 a 30 caracteres: letras minúsculas, números e sublinhado.';
  }
  return null;
}

/* ─── Perfil público ───────────────────────────────────────────────────────── */

export async function loadMyAthleteProfile(userId: string): Promise<AthleteProfile | null> {
  const { data } = await supabase
    .from('athlete_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return (data as AthleteProfile) ?? null;
}

export async function saveAthleteProfile(
  userId: string,
  input: Omit<AthleteProfile, 'user_id'>,
): Promise<CommunityResult<AthleteProfile>> {
  const handle = normalizeHandle(input.handle);
  const invalid = validateHandle(handle);
  if (invalid) return { ok: false, error: invalid };

  const displayName = input.display_name.trim();
  if (displayName.length < 1 || displayName.length > 60) {
    return { ok: false, error: 'O nome de exibição deve ter entre 1 e 60 caracteres.' };
  }

  const { data, error } = await supabase
    .from('athlete_profiles')
    .upsert(
      {
        user_id: userId,
        handle,
        display_name: displayName,
        bio: input.bio?.trim().slice(0, 300) || null,
        goals: input.goals?.trim().slice(0, 200) || null,
        is_public: input.is_public,
        show_workouts: input.show_workouts,
        show_progress: input.show_progress,
      },
      { onConflict: 'user_id' },
    )
    .select()
    .single();

  if (error) {
    if (/duplicate key|unique/i.test(error.message)) {
      return { ok: false, error: 'Este nome de usuário já está em uso. Escolha outro.' };
    }
    return { ok: false, error: 'Não foi possível salvar seu perfil. Tente novamente.' };
  }

  return { ok: true, data: data as AthleteProfile };
}

/* ─── Busca e feed ─────────────────────────────────────────────────────────── */

export async function searchAthletes(query: string, limit = 20): Promise<AthleteCard[]> {
  let request = supabase
    .from('athlete_directory')
    .select('user_id, handle, display_name, bio, goals, avatar_url, show_workouts, show_progress')
    .limit(limit);

  const term = query.trim();
  if (term) {
    // Escapa os curingas do PostgREST para o termo ser tratado literalmente.
    const safe = term.replace(/[%,()]/g, ' ');
    request = request.or(`display_name.ilike.%${safe}%,handle.ilike.%${safe}%`);
  }

  const { data } = await request.order('display_name');
  return (data ?? []) as AthleteCard[];
}

export async function loadFeed(limit = 20, before?: string): Promise<SharedWorkout[]> {
  let request = supabase
    .from('shared_workouts')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (before) request = request.lt('created_at', before);

  const { data } = await request;
  const rows = (data ?? []) as SharedWorkout[];
  if (rows.length === 0) return [];

  const authorIds = [...new Set(rows.map((row) => row.user_id))];
  const { data: authors } = await supabase
    .from('athlete_directory')
    .select('user_id, handle, display_name, bio, goals, avatar_url, show_workouts, show_progress')
    .in('user_id', authorIds);

  const byId = new Map((authors ?? []).map((author) => [author.user_id, author as AthleteCard]));
  return rows.map((row) => ({ ...row, author: byId.get(row.user_id) ?? null }));
}

export async function loadSharedWorkout(id: string): Promise<SharedWorkout | null> {
  const { data } = await supabase.from('shared_workouts').select('*').eq('id', id).maybeSingle();
  if (!data) return null;

  const workout = data as SharedWorkout;
  const { data: author } = await supabase
    .from('athlete_directory')
    .select('user_id, handle, display_name, bio, goals, avatar_url, show_workouts, show_progress')
    .eq('user_id', workout.user_id)
    .maybeSingle();

  return { ...workout, author: (author as AthleteCard) ?? null };
}

/* ─── Publicar ─────────────────────────────────────────────────────────────── */

/**
 * Converte planos privados em um snapshot publicável.
 *
 * Copia apenas nome do exercício, séries, repetições e descanso. Ficam de fora
 * carga pessoal (weight_kg), notas privadas, histórico e qualquer medida.
 */
export function buildSnapshot(plans: PlanWithExercises[]): SharedWorkoutSnapshot {
  return {
    days: plans.map((plan) => ({
      label: plan.day_label ?? plan.name,
      name: plan.name,
      exercises: plan.exercises.map((exercise) => ({
        name: exercise.name,
        slug: exercise.slug,
        sets: exercise.sets,
        reps: exercise.reps,
        restSeconds: exercise.rest_seconds,
        primaryMuscle: exercise.primary_muscle,
      })),
    })),
  };
}

export async function publishWorkout(params: {
  userId: string;
  title: string;
  description?: string;
  plans: PlanWithExercises[];
}): Promise<CommunityResult<string>> {
  const title = params.title.trim();
  if (title.length < 1 || title.length > 120) {
    return { ok: false, error: 'Dê um título de até 120 caracteres ao treino.' };
  }
  if (params.plans.length === 0 || params.plans.every((plan) => plan.exercises.length === 0)) {
    return { ok: false, error: 'Este treino não tem exercícios para publicar.' };
  }

  const { data, error } = await supabase
    .from('shared_workouts')
    .insert({
      user_id: params.userId,
      title,
      description: params.description?.trim().slice(0, 1000) || null,
      snapshot: buildSnapshot(params.plans),
      is_public: true,
    })
    .select('id')
    .single();

  if (error) {
    return { ok: false, error: 'Não foi possível publicar o treino. Tente novamente.' };
  }
  return { ok: true, data: String(data.id) };
}

export async function unpublishWorkout(id: string): Promise<CommunityResult> {
  const { error } = await supabase.from('shared_workouts').delete().eq('id', id);
  if (error) return { ok: false, error: 'Não foi possível remover a publicação.' };
  return { ok: true };
}

/* ─── Interações ───────────────────────────────────────────────────────────── */

export async function toggleLike(workoutId: string, userId: string, liked: boolean): Promise<CommunityResult> {
  const { error } = liked
    ? await supabase.from('workout_likes').delete().eq('workout_id', workoutId).eq('user_id', userId)
    : await supabase.from('workout_likes').insert({ workout_id: workoutId, user_id: userId });

  if (error) return { ok: false, error: 'Não foi possível registrar sua curtida.' };
  return { ok: true };
}

export async function loadMyLikes(userId: string, workoutIds: string[]): Promise<Set<string>> {
  if (workoutIds.length === 0) return new Set();
  const { data } = await supabase
    .from('workout_likes')
    .select('workout_id')
    .eq('user_id', userId)
    .in('workout_id', workoutIds);
  return new Set((data ?? []).map((row) => String(row.workout_id)));
}

export async function loadComments(workoutId: string): Promise<WorkoutComment[]> {
  const { data } = await supabase
    .from('workout_comments')
    .select('*')
    .eq('workout_id', workoutId)
    .order('created_at')
    .limit(100);

  const rows = (data ?? []) as WorkoutComment[];
  if (rows.length === 0) return [];

  const ids = [...new Set(rows.map((row) => row.user_id))];
  const { data: authors } = await supabase
    .from('athlete_directory')
    .select('user_id, handle, display_name, bio, goals, avatar_url, show_workouts, show_progress')
    .in('user_id', ids);

  const byId = new Map((authors ?? []).map((author) => [author.user_id, author as AthleteCard]));
  return rows.map((row) => ({ ...row, author: byId.get(row.user_id) ?? null }));
}

export async function addComment(
  workoutId: string,
  userId: string,
  body: string,
): Promise<CommunityResult> {
  const text = body.trim();
  if (text.length < 1 || text.length > 500) {
    return { ok: false, error: 'O comentário deve ter entre 1 e 500 caracteres.' };
  }
  const { error } = await supabase
    .from('workout_comments')
    .insert({ workout_id: workoutId, user_id: userId, body: text });

  if (error) return { ok: false, error: 'Não foi possível enviar o comentário.' };
  return { ok: true };
}

export async function deleteComment(id: string): Promise<CommunityResult> {
  const { error } = await supabase.from('workout_comments').delete().eq('id', id);
  if (error) return { ok: false, error: 'Não foi possível remover o comentário.' };
  return { ok: true };
}

/* ─── Segurança social ─────────────────────────────────────────────────────── */

export async function blockAthlete(blockerId: string, blockedId: string): Promise<CommunityResult> {
  if (blockerId === blockedId) return { ok: false, error: 'Você não pode bloquear a si mesmo.' };
  const { error } = await supabase
    .from('athlete_blocks')
    .insert({ blocker_id: blockerId, blocked_id: blockedId });
  if (error) return { ok: false, error: 'Não foi possível bloquear este atleta.' };
  return { ok: true };
}

export async function unblockAthlete(blockerId: string, blockedId: string): Promise<CommunityResult> {
  const { error } = await supabase
    .from('athlete_blocks')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);
  if (error) return { ok: false, error: 'Não foi possível desbloquear este atleta.' };
  return { ok: true };
}

export async function loadBlocked(userId: string): Promise<string[]> {
  const { data } = await supabase.from('athlete_blocks').select('blocked_id').eq('blocker_id', userId);
  return (data ?? []).map((row) => String(row.blocked_id));
}

export async function reportContent(params: {
  reporterId: string;
  workoutId?: string;
  reportedUserId?: string;
  reason: ReportReason;
  details?: string;
}): Promise<CommunityResult> {
  if (!params.workoutId && !params.reportedUserId) {
    return { ok: false, error: 'Selecione o que deseja denunciar.' };
  }
  const { error } = await supabase.from('content_reports').insert({
    reporter_id: params.reporterId,
    workout_id: params.workoutId ?? null,
    reported_user_id: params.reportedUserId ?? null,
    reason: params.reason,
    details: params.details?.trim().slice(0, 500) || null,
  });
  if (error) return { ok: false, error: 'Não foi possível enviar a denúncia.' };
  return { ok: true };
}

/* ─── Salvar treinos de outros atletas ──────────────────────────────────────── */

/**
 * A lista de salvos é privada: a RLS só devolve as linhas do próprio usuário.
 * Salvar exige que o treino esteja visível — o servidor recusa id adivinhado.
 */
export async function toggleSave(
  workoutId: string,
  userId: string,
  saved: boolean,
): Promise<CommunityResult> {
  if (saved) {
    const { error } = await supabase
      .from('workout_saves')
      .delete()
      .eq('workout_id', workoutId)
      .eq('user_id', userId);
    if (error) return { ok: false, error: 'Não foi possível remover dos salvos.' };
    return { ok: true };
  }
  const { error } = await supabase
    .from('workout_saves')
    .insert({ workout_id: workoutId, user_id: userId });
  if (error) {
    return { ok: false, error: 'Não foi possível salvar este treino. Ele pode ter se tornado privado.' };
  }
  return { ok: true };
}

export async function loadMySaves(userId: string, workoutIds: string[]): Promise<Set<string>> {
  if (workoutIds.length === 0) return new Set();
  const { data } = await supabase
    .from('workout_saves')
    .select('workout_id')
    .eq('user_id', userId)
    .in('workout_id', workoutIds);
  return new Set((data ?? []).map((row) => String(row.workout_id)));
}

/** Aba "Salvos": treinos que o usuário guardou, do mais recente ao mais antigo. */
export async function loadSavedWorkouts(userId: string): Promise<SharedWorkout[]> {
  const { data } = await supabase
    .from('workout_saves')
    .select('workout_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  const ids = (data ?? []).map((row) => String(row.workout_id));
  if (ids.length === 0) return [];

  // A leitura passa pela RLS de shared_workouts: o que ficou privado depois de
  // salvo simplesmente não volta, em vez de aparecer quebrado.
  const { data: workouts } = await supabase.from('shared_workouts').select('*').in('id', ids);
  const rows = (workouts ?? []) as SharedWorkout[];
  const byId = new Map(rows.map((row) => [row.id, row]));
  const ordered = ids.map((id) => byId.get(id)).filter((row): row is SharedWorkout => Boolean(row));

  const authorIds = [...new Set(ordered.map((row) => row.user_id))];
  const { data: authors } = await supabase
    .from('athlete_directory')
    .select('user_id, handle, display_name, bio, goals, avatar_url, show_workouts, show_progress')
    .in('user_id', authorIds);
  const authorById = new Map((authors ?? []).map((a) => [a.user_id, a as AthleteCard]));
  return ordered.map((row) => ({ ...row, author: authorById.get(row.user_id) ?? null }));
}

/* ─── Perfil público de um atleta ───────────────────────────────────────────── */

export interface PublicAthleteProgress {
  user_id: string;
  sessions_completed: number;
  sessions_last_30d: number;
  athlete_since: string;
}

export async function loadAthleteByHandle(handle: string): Promise<AthleteCard | null> {
  const clean = normalizeHandle(handle);
  if (!clean) return null;
  const { data } = await supabase
    .from('athlete_directory')
    .select('user_id, handle, display_name, bio, goals, avatar_url, show_workouts, show_progress')
    .eq('handle', clean)
    .maybeSingle();
  return (data as AthleteCard) ?? null;
}

/** Só agregados. A view não expõe carga, peso, medidas, datas ou nomes de planos. */
export async function loadPublicProgress(userId: string): Promise<PublicAthleteProgress | null> {
  const { data } = await supabase
    .from('athlete_public_progress')
    .select('user_id, sessions_completed, sessions_last_30d, athlete_since')
    .eq('user_id', userId)
    .maybeSingle();
  return (data as PublicAthleteProgress) ?? null;
}

export async function loadAthleteWorkouts(userId: string, limit = 20): Promise<SharedWorkout[]> {
  const { data } = await supabase
    .from('shared_workouts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as SharedWorkout[];
}

/* ─── Moderação (admin) ─────────────────────────────────────────────────────── */

export type ReportStatus = 'open' | 'reviewed' | 'dismissed';

export interface ModerationReport {
  id: string;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  created_at: string;
  workout_id: string | null;
  reported_user_id: string | null;
  workout_title: string | null;
  workout_is_public: boolean | null;
  workout_author_id: string | null;
  reporter_handle: string | null;
  reported_handle: string | null;
}

export async function loadReportQueue(status: ReportStatus = 'open'): Promise<ModerationReport[]> {
  const { data } = await supabase
    .from('admin_content_reports')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: true })
    .limit(50);
  return (data ?? []) as ModerationReport[];
}

/** Só confirma sucesso quando o servidor devolve o id resolvido. */
export async function resolveReport(
  reportId: string,
  decision: 'reviewed' | 'dismissed',
  hideContent: boolean,
): Promise<CommunityResult> {
  const { data, error } = await supabase.rpc('resolve_content_report', {
    p_report_id: reportId,
    p_decision: decision,
    p_hide_content: hideContent,
  });
  if (error || data !== reportId) {
    return { ok: false, error: 'Não foi possível resolver a denúncia. Tente novamente.' };
  }
  return { ok: true };
}
