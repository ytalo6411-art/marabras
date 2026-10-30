/**
 * Persistência de planos de treino.
 *
 * Um "programa" é o plano semanal inteiro (ex.: split ABC). Cada dia do
 * programa é uma linha em `workout_plans`, agrupada por `program_id`. Por quê?
 *  • reaproveita 100% do schema existente (`workout_plans` + `workout_exercises`);
 *  • o construtor de treino atual continua funcionando em cada dia;
 *  • regenerar/trocar um dia não toca nos outros.
 *
 * Toda escrita é feita com o JWT do usuário — a RLS é quem garante que ninguém
 * grava no plano de outra pessoa.
 */

import { supabase } from '@/lib/supabase';
import type {
  Exercise,
  TrainingEnvironment,
  TrainingFocus,
  TrainingGoal,
  WorkoutPlan,
} from '@/types/database';
import type {
  GeneratedDay,
  GeneratedProgram,
  PlanGenerationProfile,
} from '@/services/planGenerator';
import { regenerateDay, validateGeneratedProgram } from '@/services/planGenerator';
import { getSchemaCapabilities } from '@/services/dbCapabilities';
import type { CatalogExercise } from '@/services/catalog';
import type { MovementPattern } from '@/data/exerciseTaxonomy';

const GOAL_TO_FOCUS: Record<TrainingGoal, TrainingFocus> = {
  hypertrophy: 'hypertrophy',
  strength: 'strength',
  conditioning: 'conditioning',
  endurance: 'cardio',
  mobility: 'mobility',
  fat_loss: 'weight_loss',
  active_routine: 'conditioning',
  sport_performance: 'sport_prep',
};

export interface SavedProgram {
  programId: string;
  planIds: string[];
  name: string;
}

export interface SaveProgramResult {
  ok: boolean;
  saved?: SavedProgram;
  error?: string;
  /**
   * true quando o plano foi gravado sem os metadados de programa porque a
   * migração ainda não está aplicada no banco. O plano funciona; a UI avisa.
   */
  degraded?: boolean;
}

/**
 * Linha de `workout_plans` para um dia do programa.
 *
 * `extended = false` quando o banco ainda não tem a migração: nesse caso os
 * metadados de programa não podem ser gravados e a explicação vai para a
 * `description`, que já existe no schema original.
 */
export function buildPlanRow(params: {
  userId: string;
  program: GeneratedProgram;
  day: GeneratedDay;
  programId: string;
  templateSlug?: string | null;
  extended: boolean;
}): Record<string, unknown> {
  const { userId, program, day, programId, templateSlug, extended } = params;

  const base = {
    user_id: userId,
    name: planNameFor(day),
    description: day.rationale,
    focus: GOAL_TO_FOCUS[program.goal],
    modality: null,
    days_of_week: day.weekday === null ? [] : [day.weekday],
    estimated_minutes: day.estimatedMinutes,
    is_active: true,
    is_template: false,
  };

  if (!extended) return base;

  return {
    ...base,
    program_id: programId,
    program_name: limitText(program.name, 120),
    day_label: day.label,
    generated_by: templateSlug ? 'template' : program.source,
    rationale: day.rationale,
    level: program.level,
    environment: program.environment as TrainingEnvironment,
    template_slug: templateSlug ?? null,
    metadata: {
      patterns: day.exercises.map((exercise) => exercise.pattern),
      goal: program.goal,
      level: program.level,
      seed: program.seed,
      source: program.source,
    },
  };
}

function limitText(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

/**
 * Notas gravadas no exercício incluem a orientação de execução e as
 * alternativas compatíveis — assim elas aparecem também no modo de execução,
 * sem precisar de uma coluna nova.
 */
function notesWithAlternatives(exercise: GeneratedDay['exercises'][number]): string | null {
  const parts: string[] = [];
  if (exercise.notes) parts.push(exercise.notes);
  if (exercise.alternatives.length > 0) {
    parts.push(`Alternativas: ${exercise.alternatives.map((alt) => alt.name).join(', ')}.`);
  }
  return parts.length > 0 ? limitText(parts.join(' '), 500) : null;
}

function planNameFor(day: GeneratedDay): string {
  const prefix = day.label.length <= 2 ? `${day.label} · ` : '';
  return limitText(`${prefix}${day.name}`, 120);
}

/**
 * Grava o programa inteiro.
 *
 * Em caso de falha no meio do processo, remove o que já foi criado para não
 * deixar um programa pela metade na lista do usuário.
 */
export async function saveGeneratedProgram(params: {
  userId: string;
  program: GeneratedProgram;
  profile: PlanGenerationProfile;
  templateSlug?: string | null;
  replaceProgramId?: string | null;
}): Promise<SaveProgramResult> {
  const { userId, program, profile, templateSlug } = params;

  const validation = validateGeneratedProgram(program);
  if (!validation.ok || program.days.length === 0) {
    return {
      ok: false,
      error:
        validation.errors[0] ??
        'O plano gerado não passou na validação. Ajuste suas preferências e tente de novo.',
    };
  }

  const programId = crypto.randomUUID();
  const planIds: string[] = [];

  // Modo degradado quando a migração ainda não foi aplicada: o plano é salvo,
  // só sem os metadados de programa. Melhor entregar o treino do que bloquear.
  const { capabilities } = await getSchemaCapabilities();
  const extended = capabilities.planProgramColumns;

  try {
    for (const day of program.days) {
      const { data: plan, error: planError } = await supabase
        .from('workout_plans')
        .insert(
          buildPlanRow({
            userId,
            program,
            day,
            programId,
            templateSlug,
            extended,
          }),
        )
        .select('*')
        .single();

      if (planError || !plan) throw planError ?? new Error('Plano não retornado');

      const savedPlan = plan as WorkoutPlan;
      planIds.push(savedPlan.id);

      const rows = day.exercises.map((exercise, index) => ({
        plan_id: savedPlan.id,
        exercise_id: exercise.exerciseId,
        position: index,
        sets: exercise.sets,
        reps: limitText(exercise.reps, 40),
        duration_seconds: exercise.durationSeconds,
        rest_seconds: exercise.restSeconds,
        intensity: intensityFor(profile),
        notes: notesWithAlternatives(exercise),
      }));

      const { error: itemsError } = await supabase.from('workout_exercises').insert(rows);
      if (itemsError) throw itemsError;
    }

    // Se era uma substituição, remove o programa antigo só depois do novo estar pronto.
    if (params.replaceProgramId && extended) {
      await supabase.from('workout_plans').delete().eq('program_id', params.replaceProgramId);
    }

    return {
      ok: true,
      degraded: !extended,
      saved: { programId, planIds, name: program.name },
    };
  } catch (error) {
    console.error('[ATHLETIX] Falha ao salvar programa:', error);

    if (planIds.length > 0) {
      await supabase.from('workout_plans').delete().in('id', planIds);
    }

    const message = error instanceof Error ? error.message : String(error);
    const missingMigration =
      /column .*metadata|column .*program_id|column .*generated_by|does not exist|schema cache/i.test(message);

    return {
      ok: false,
      error: missingMigration
        ? 'Seu banco ainda não tem a migração de personalização. Aplique supabase/migrations/20260201000000_training_profile.sql e tente novamente.'
        : 'Não foi possível salvar o plano. Nada foi perdido: tente novamente em instantes.',
    };
  }
}

function intensityFor(profile: PlanGenerationProfile): 'low' | 'moderate' | 'high' | 'max' {
  if (profile.level === 'advanced' && (profile.goal === 'strength' || profile.goal === 'hypertrophy')) {
    return 'high';
  }
  if (profile.goal === 'mobility' || profile.goal === 'active_routine') return 'low';
  return 'moderate';
}

/* ─── Leitura ──────────────────────────────────────────────────────────────── */

export interface PlanWithExercises extends WorkoutPlan {
  exercises: (Exercise & {
    /** id da linha em `workout_exercises` (usado para trocar/remover). */
    itemId: string;
    /** id do exercício no catálogo. */
    exerciseId: string;
    position: number;
    sets: number;
    reps: string;
    rest_seconds: number;
    duration_seconds: number | null;
    notes: string | null;
    weight_kg: number | null;
    intensity: string | null;
  })[];
}

/** Carrega um plano com os exercícios reais (para o treinador e o builder). */
export async function loadPlanWithExercises(planId: string): Promise<PlanWithExercises | null> {
  const [planRes, itemsRes] = await Promise.all([
    supabase.from('workout_plans').select('*').eq('id', planId).maybeSingle(),
    supabase.from('workout_exercises').select('*').eq('plan_id', planId).order('position'),
  ]);

  if (!planRes.data) return null;

  const itemRows = itemsRes.data ?? [];
  const exerciseIds = [...new Set(itemRows.map((row) => String(row.exercise_id)))];

  const { data: exerciseRows } = exerciseIds.length
    ? await supabase.from('exercises').select('*').in('id', exerciseIds)
    : { data: [] as Exercise[] };

  const byId = new Map((exerciseRows ?? []).map((exercise) => [exercise.id, exercise]));

  return {
    ...(planRes.data as WorkoutPlan),
    exercises: itemRows
      .map((row) => {
        const exercise = byId.get(String(row.exercise_id));
        if (!exercise) return null;
        return {
          ...exercise,
          itemId: String(row.id),
          exerciseId: String(row.exercise_id),
          position: Number(row.position),
          sets: Number(row.sets),
          reps: String(row.reps),
          rest_seconds: Number(row.rest_seconds),
          duration_seconds: row.duration_seconds === null ? null : Number(row.duration_seconds),
          notes: (row.notes as string | null) ?? null,
          weight_kg: row.weight_kg === null ? null : Number(row.weight_kg),
          intensity: (row.intensity as string | null) ?? null,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null),
  };
}

/* ─── Edição ───────────────────────────────────────────────────────────────── */

/** Troca um exercício do plano mantendo posição e metadados do dia. */
export async function replacePlanExercise(params: {
  itemId: string;
  exercise: CatalogExercise;
  profile: PlanGenerationProfile;
  intensity: 'low' | 'moderate' | 'high' | 'max';
}): Promise<{ ok: boolean; error?: string }> {
  const { itemId, exercise, profile, intensity } = params;

  const prescription =
    exercise.pattern === 'mobility'
      ? { sets: 2, reps: '30–45 s', rest: 20, duration: 40 }
      : exercise.pattern === 'cardio'
        ? { sets: 1, reps: '12 min', rest: 0, duration: 720 }
        : exercise.pattern === 'core'
          ? { sets: 3, reps: '12–15', rest: 45, duration: 40 }
          : {
              sets: profile.level === 'beginner' ? 3 : profile.level === 'intermediate' ? 3 : 4,
              reps: profile.goal === 'strength' ? '4–6' : '8–12',
              rest: profile.goal === 'strength' ? 150 : 90,
              duration: null,
            };

  const { error } = await supabase
    .from('workout_exercises')
    .update({
      exercise_id: exercise.id,
      sets: prescription.sets,
      reps: prescription.reps,
      rest_seconds: prescription.rest,
      duration_seconds: prescription.duration,
      intensity,
      notes: exercise.instructions ? limitText(exercise.instructions, 500) : null,
    })
    .eq('id', itemId);

  if (error) {
    return { ok: false, error: 'Não foi possível trocar o exercício agora.' };
  }

  return { ok: true };
}

export interface RegenerateDayResult {
  ok: boolean;
  day?: GeneratedDay;
  error?: string;
}

/**
 * Regenera a sessão a partir dos padrões de movimento salvos em `metadata`.
 * Se o plano foi criado manualmente (sem metadata), usa os padrões dos
 * exercícios atuais como referência.
 */
export async function regeneratePlanDay(params: {
  plan: WorkoutPlan;
  profile: PlanGenerationProfile;
  catalog: CatalogExercise[];
  seed?: string;
}): Promise<RegenerateDayResult> {
  const { plan, profile, catalog } = params;

  const { data: items, error: itemsError } = await supabase
    .from('workout_exercises')
    .select('exercise_id, position')
    .eq('plan_id', plan.id)
    .order('position');

  if (itemsError) {
    return { ok: false, error: 'Não foi possível ler o plano atual.' };
  }

  const currentIds = (items ?? []).map((item) => String(item.exercise_id));

  const { data: currentExercises } = currentIds.length
    ? await supabase.from('exercises').select('id, primary_muscle, name').in('id', currentIds)
    : { data: [] };

  const byId = new Map((currentExercises ?? []).map((exercise) => [exercise.id, exercise]));

  const metadata = (plan.metadata ?? {}) as { patterns?: MovementPattern[] };
  const patterns: MovementPattern[] = Array.isArray(metadata.patterns) && metadata.patterns.length > 0
    ? metadata.patterns
    : currentIds
        .map((id) => {
          const exercise = byId.get(id);
          if (!exercise) return null;
          const match = catalog.find((item) => item.id === id);
          return match?.pattern ?? null;
        })
        .filter((pattern): pattern is MovementPattern => Boolean(pattern));

  if (patterns.length === 0) {
    return {
      ok: false,
      error: 'Este plano não tem metadados suficientes para regenerar. Use o construtor de treino.',
    };
  }

  const day = regenerateDay({
    profile,
    catalog,
    patterns,
    label: plan.day_label ?? 'A',
    name: plan.name,
    weekday: plan.days_of_week?.[0] ?? null,
    seed: params.seed ?? `${plan.id}-${Date.now()}`,
    // Evita devolver exatamente os mesmos exercícios.
    avoidExerciseIds: currentIds,
  });

  if (day.exercises.length === 0) {
    return {
      ok: false,
      error: 'Não encontramos alternativas compatíveis com seus equipamentos para este dia.',
    };
  }

  // Troca atômica na prática:
  //  1. move os itens atuais para posições altas (não colidem com 0..n-1);
  //  2. insere os novos;
  //  3. apaga os antigos.
  // Se a inserção falhar, restauramos as posições originais e nada é perdido.
  const { data: fullItems } = await supabase
    .from('workout_exercises')
    .select('id, position')
    .eq('plan_id', plan.id)
    .order('position');

  const previousState = (fullItems ?? []).map((item) => ({
    id: String(item.id),
    position: Number(item.position),
  }));
  const oldIds = previousState.map((item) => item.id);

  for (const [index, item] of previousState.entries()) {
    await supabase
      .from('workout_exercises')
      .update({ position: 1000 + index })
      .eq('id', item.id);
  }

  const rows = day.exercises.map((exercise, index) => ({
    plan_id: plan.id,
    exercise_id: exercise.exerciseId,
    position: index,
    sets: exercise.sets,
    reps: limitText(exercise.reps, 40),
    duration_seconds: exercise.durationSeconds,
    rest_seconds: exercise.restSeconds,
    notes: notesWithAlternatives(exercise),
  }));

  const { error: insertError } = await supabase.from('workout_exercises').insert(rows);

  if (insertError) {
    // Restaura o treino anterior exatamente como estava.
    for (const item of previousState) {
      await supabase
        .from('workout_exercises')
        .update({ position: item.position })
        .eq('id', item.id);
    }
    return {
      ok: false,
      error: 'Não foi possível regenerar este dia. Seu treino original continua intacto.',
    };
  }

  if (oldIds.length > 0) {
    await supabase.from('workout_exercises').delete().in('id', oldIds);
  }

  const { capabilities } = await getSchemaCapabilities();

  await supabase
    .from('workout_plans')
    .update(
      capabilities.planProgramColumns
        ? {
            description: day.rationale,
            estimated_minutes: day.estimatedMinutes,
            metadata: {
              ...metadata,
              patterns: day.exercises.map((exercise) => exercise.pattern),
            },
          }
        : {
            // Sem a migração, só os campos originais são atualizados.
            description: day.rationale,
            estimated_minutes: day.estimatedMinutes,
          },
    )
    .eq('id', plan.id);

  return { ok: true, day };
}

/** Remove um programa inteiro (todos os dias). */
export async function deleteProgram(programId: string): Promise<{ ok: boolean; error?: string }> {
  const { capabilities } = await getSchemaCapabilities();

  if (!capabilities.planProgramColumns) {
    return { ok: false, error: 'Exclua os dias individualmente em Treinos (migração pendente).' };
  }

  const { error } = await supabase.from('workout_plans').delete().eq('program_id', programId);
  if (error) return { ok: false, error: 'Não foi possível excluir o programa agora.' };
  return { ok: true };
}
