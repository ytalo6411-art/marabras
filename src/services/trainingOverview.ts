/**
 * Visão agregada do treino do usuário para dashboard, treinos e treinador.
 *
 * Nada aqui inventa número: tudo vem de `workout_plans`, `workout_sessions` e
 * `exercise_history`, com RLS garantindo o escopo por usuário.
 */

import { supabase } from '@/lib/supabase';
import type { WorkoutPlan, WorkoutSession } from '@/types/database';

export interface ProgramGroup {
  /** `null` = planos criados manualmente, sem programa. */
  programId: string | null;
  name: string;
  plans: WorkoutPlan[];
  level: WorkoutPlan['level'];
  goal: WorkoutPlan['focus'] | null;
  generatedBy: WorkoutPlan['generated_by'];
}

export async function loadActivePlans(): Promise<WorkoutPlan[]> {
  const { data, error } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('is_active', true)
    .order('days_of_week', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as WorkoutPlan[];
}

/** Agrupa planos por programa, mantendo a ordem dos dias. */
export function groupPrograms(plans: WorkoutPlan[]): ProgramGroup[] {
  const groups = new Map<string, ProgramGroup>();

  for (const plan of plans) {
    const key = plan.program_id ?? '__manual__';
    const existing = groups.get(key);

    if (existing) {
      existing.plans.push(plan);
      continue;
    }

    groups.set(key, {
      programId: plan.program_id,
      name: plan.program_name ?? 'Planos avulsos',
      plans: [plan],
      level: plan.level,
      goal: plan.focus,
      generatedBy: plan.generated_by,
    });
  }

  return [...groups.values()].map((group) => ({
    ...group,
    plans: [...group.plans].sort((a, b) => (a.days_of_week[0] ?? 9) - (b.days_of_week[0] ?? 9)),
  }));
}

/**
 * Próximo treino recomendado.
 *
 * Prioriza o dia da semana de hoje; se não houver treino hoje, escolhe o dia
 * mais próximo à frente na semana. Se o programa não tem dias definidos,
 * devolve o primeiro plano.
 */
export function pickNextWorkout(plans: WorkoutPlan[], now = new Date()): WorkoutPlan | null {
  if (plans.length === 0) return null;

  const today = now.getDay();
  const withDays = plans.filter((plan) => plan.days_of_week.length > 0);

  if (withDays.length === 0) return plans[0] ?? null;

  const todayMatch = withDays.find((plan) => plan.days_of_week.includes(today));
  if (todayMatch) return todayMatch;

  for (let offset = 1; offset <= 7; offset++) {
    const weekday = (today + offset) % 7;
    const match = withDays.find((plan) => plan.days_of_week.includes(weekday));
    if (match) return match;
  }

  return withDays[0] ?? null;
}

/** Rótulo do dia da semana de um plano ('' quando não definido). */
export const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;

export function planWeekdayLabel(plan: WorkoutPlan): string {
  const days = plan.days_of_week;
  if (days.length === 0) return 'Sem dia definido';
  return days.map((day) => WEEKDAYS_SHORT[day] ?? '—').join(', ');
}

/* ─── Sequência de atividades ──────────────────────────────────────────────── */

export interface ActivityStreak {
  /** Dias consecutivos com treino concluído, contando a partir de hoje/ontem. */
  current: number;
  /** Últimos 7 dias (mais antigo → mais recente). */
  last7: boolean[];
  /** Datas (YYYY-MM-DD) com sessão concluída nos últimos 30 dias. */
  activeDates: string[];
}

function localDateKey(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calcula a sequência a partir das datas reais de conclusão.
 * Um dia é considerado "ativo" se teve pelo menos uma sessão concluída.
 */
export function computeStreak(completedAtValues: (string | null)[], now = new Date()): ActivityStreak {
  const dates = new Set(
    completedAtValues.filter((value): value is string => Boolean(value)).map((value) => localDateKey(value)),
  );

  const last7: boolean[] = [];
  for (let offset = 6; offset >= 0; offset--) {
    const day = new Date(now);
    day.setDate(day.getDate() - offset);
    last7.push(dates.has(localDateKey(day)));
  }

  let current = 0;
  const cursor = new Date(now);
  // Se hoje ainda não treinou, a sequência pode continuar contando de ontem.
  if (!dates.has(localDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (dates.has(localDateKey(cursor))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const activeDates = [...dates].sort();

  return { current, last7, activeDates };
}

export async function loadStreak(userId: string): Promise<ActivityStreak> {
  const since = new Date(Date.now() - 60 * 86_400_000).toISOString();

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('completed_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', since)
    .order('completed_at', { ascending: false })
    .limit(200);

  if (error || !data) return computeStreak([]);

  return computeStreak(data.map((row) => (row.completed_at as string | null) ?? null));
}

/* ─── Sessões ──────────────────────────────────────────────────────────────── */

export async function loadRecentSessions(limit = 10): Promise<WorkoutSession[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as WorkoutSession[];
}

export async function updateSessionNotes(
  sessionId: string,
  notes: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from('workout_sessions')
    .update({ notes: notes.trim() || null })
    .eq('id', sessionId);

  if (error) return { ok: false, error: 'Não foi possível salvar a observação.' };
  return { ok: true };
}

export async function deleteSession(sessionId: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('workout_sessions').delete().eq('id', sessionId);
  if (error) return { ok: false, error: 'Não foi possível excluir a sessão.' };
  return { ok: true };
}
