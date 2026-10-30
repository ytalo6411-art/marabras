/**
 * Gerador de planos de treino do ATHLETIX.
 *
 * Determinístico por construção: mesma entrada + mesma semente = mesmo plano.
 * Não usa aleatoriedade — escolhas são pontuadas com regras explícitas e
 * desempate estável por hash, para que o plano seja auditável e testável.
 *
 * O que este motor considera:
 *  • objetivo principal e secundários (séries, repetições, descanso);
 *  • nível de experiência (volume e dificuldade máxima aceita);
 *  • frequência semanal e tempo por sessão (quantidade de exercícios e divisão);
 *  • equipamentos disponíveis e ambiente;
 *  • grupos musculares prioritários;
 *  • exercícios a evitar e limitações declaradas (adaptação, não tratamento);
 *  • histórico recente (evita repetir o mesmo exercício na mesma semana).
 *
 * A saída passa por um schema Zod antes de ser usada/gravada.
 */

import { z } from 'zod';
import type {
  AgeRange,
  DifficultyLevel,
  GuidancePreference,
  PreferredTraining,
  SplitPreference,
  TrainingEnvironment,
  TrainingGoal,
} from '@/types/database';
import {
  LIMITATION_OPTIONS,
  allowedDifficulties,
  levelFromExperience,
  muscleGroup,
  type MovementPattern,
} from '@/data/exerciseTaxonomy';
import { filterCatalog, findAlternatives, type CatalogExercise } from '@/services/catalog';

/* ─── Entrada normalizada ──────────────────────────────────────────────────── */

export interface PlanGenerationProfile {
  level: DifficultyLevel;
  goal: TrainingGoal;
  secondaryGoals: TrainingGoal[];
  environment: TrainingEnvironment;
  equipment: string[];
  sessionsPerWeek: number;
  minutesPerSession: number;
  preferredDays: number[];
  splitPreference: SplitPreference;
  priorityMuscles: string[];
  avoidedExercises: string[];
  preferredTraining: PreferredTraining[];
  limitations: string[];
  guidancePreference: GuidancePreference;
  ageRange?: AgeRange | null;
}

export interface PlanGenerationHistoryEntry {
  exerciseId: string;
  performedAt: string;
}

export interface GeneratePlanOptions {
  profile: PlanGenerationProfile;
  catalog: CatalogExercise[];
  /** Sessões concluídas recentes (últimos ~14 dias). */
  history?: PlanGenerationHistoryEntry[];
  /** Semente estável (normalmente o id do usuário + semana). */
  seed?: string;
  /** Origem declarada — nunca dizemos 'ai' sem IA real. */
  source?: 'rules' | 'ai';
  /** Restringe a um dia específico (usado em "regenerar sessão"). */
  onlyDay?: { label: string; slots: MovementPattern[] };
}

/* ─── Saída ────────────────────────────────────────────────────────────────── */

export interface GeneratedAlternative {
  exerciseId: string;
  name: string;
}

export interface GeneratedExercise {
  exerciseId: string;
  name: string;
  primaryMuscle: string;
  pattern: MovementPattern;
  equipment: string[];
  sets: number;
  reps: string;
  restSeconds: number;
  durationSeconds: number | null;
  notes: string | null;
  videoUrl: string | null;
  alternatives: GeneratedAlternative[];
}

export interface GeneratedDay {
  label: string;
  name: string;
  weekday: number | null;
  estimatedMinutes: number;
  muscles: string[];
  rationale: string;
  exercises: GeneratedExercise[];
}

export interface GeneratedProgram {
  name: string;
  goal: TrainingGoal;
  level: DifficultyLevel;
  environment: TrainingEnvironment;
  split: 'full_body' | 'split';
  days: GeneratedDay[];
  rationale: string[];
  warnings: string[];
  source: 'rules' | 'ai';
  seed: string;
}

/* ─── Schema de validação ──────────────────────────────────────────────────── */

export const generatedExerciseSchema = z.object({
  exerciseId: z.string().min(1, 'exerciseId obrigatório'),
  name: z.string().min(1).max(160),
  primaryMuscle: z.string().min(1),
  pattern: z.string().min(1),
  equipment: z.array(z.string()).min(1),
  sets: z.number().int().min(1).max(20),
  reps: z.string().min(1).max(40),
  restSeconds: z.number().int().min(0).max(900),
  durationSeconds: z.number().int().min(0).max(7200).nullable(),
  notes: z.string().max(500).nullable(),
  videoUrl: z.string().url().nullable(),
  alternatives: z
    .array(z.object({ exerciseId: z.string().min(1), name: z.string().min(1) }))
    .max(4),
});

export const generatedDaySchema = z.object({
  label: z.string().min(1).max(24),
  name: z.string().min(1).max(120),
  weekday: z.number().int().min(0).max(6).nullable(),
  estimatedMinutes: z.number().int().min(10).max(180),
  muscles: z.array(z.string()),
  rationale: z.string().min(1).max(700),
  exercises: z.array(generatedExerciseSchema).min(1).max(12),
});

export const generatedProgramSchema = z.object({
  name: z.string().min(1).max(120),
  goal: z.enum([
    'hypertrophy', 'strength', 'conditioning', 'endurance',
    'mobility', 'fat_loss', 'active_routine', 'sport_performance',
  ]),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  environment: z.enum(['gym', 'home_equipment', 'home_bodyweight', 'outdoor', 'other']),
  split: z.enum(['full_body', 'split']),
  days: z.array(generatedDaySchema).min(1).max(7),
  rationale: z.array(z.string().max(700)).min(1).max(12),
  warnings: z.array(z.string().max(400)).max(12),
  source: z.enum(['rules', 'ai']),
  seed: z.string(),
});

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

/**
 * Valida o plano gerado (por regras ou por IA) antes de gravar.
 *
 * Além do schema, checa invariantes que o schema não expressa: exercício
 * precisa existir no catálogo, não pode repetir no mesmo dia e o dia não pode
 * ficar vazio.
 */
export function validateGeneratedProgram(
  program: unknown,
  catalog?: CatalogExercise[],
): ValidationResult {
  const parsed = generatedProgramSchema.safeParse(program);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    };
  }

  const errors: string[] = [];
  const knownIds = catalog ? new Set(catalog.map((e) => e.id)) : null;

  for (const day of parsed.data.days) {
    const seen = new Set<string>();
    for (const exercise of day.exercises) {
      if (seen.has(exercise.exerciseId)) {
        errors.push(`Exercício repetido no dia ${day.label}: ${exercise.name}`);
      }
      seen.add(exercise.exerciseId);

      if (knownIds && knownIds.size > 0 && !knownIds.has(exercise.exerciseId)) {
        errors.push(`Exercício fora do catálogo no dia ${day.label}: ${exercise.name}`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

/* ─── Utilidades determinísticas ───────────────────────────────────────────── */

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/* ─── Divisão semanal ──────────────────────────────────────────────────────── */

type SplitKind = 'full_body' | 'upper_lower' | 'push_pull_legs' | 'ppl_x2' | 'body_part_5';

interface DaySlot {
  pattern: MovementPattern;
  muscles?: string[];
}

interface DayTemplate {
  label: string;
  name: string;
  slots: DaySlot[];
}

const UPPER_SLOTS: DaySlot[] = [
  { pattern: 'push_horizontal', muscles: ['pectoralis_major', 'upper_pectoralis'] },
  { pattern: 'pull_horizontal', muscles: ['middle_back', 'lats', 'rhomboids'] },
  { pattern: 'push_vertical', muscles: ['deltoids', 'anterior_deltoid'] },
  { pattern: 'pull_vertical', muscles: ['lats'] },
  { pattern: 'elbow_flexion', muscles: ['biceps'] },
  { pattern: 'elbow_extension', muscles: ['triceps'] },
  { pattern: 'core', muscles: ['abdominals', 'obliques'] },
];

const LOWER_SLOTS: DaySlot[] = [
  { pattern: 'squat', muscles: ['quadriceps', 'glutes'] },
  { pattern: 'hinge', muscles: ['hamstrings', 'glutes'] },
  { pattern: 'lunge', muscles: ['quadriceps', 'glutes'] },
  { pattern: 'calves', muscles: ['calves'] },
  { pattern: 'core', muscles: ['abdominals'] },
];

const PUSH_SLOTS: DaySlot[] = [
  { pattern: 'push_horizontal', muscles: ['pectoralis_major', 'upper_pectoralis'] },
  { pattern: 'push_vertical', muscles: ['deltoids', 'anterior_deltoid'] },
  { pattern: 'shoulder_isolation', muscles: ['deltoids'] },
  { pattern: 'elbow_extension', muscles: ['triceps'] },
  { pattern: 'core', muscles: ['abdominals'] },
];

const PULL_SLOTS: DaySlot[] = [
  { pattern: 'pull_vertical', muscles: ['lats'] },
  { pattern: 'pull_horizontal', muscles: ['middle_back', 'rhomboids', 'traps'] },
  { pattern: 'elbow_flexion', muscles: ['biceps', 'brachialis'] },
  { pattern: 'shoulder_isolation', muscles: ['posterior_deltoid'] },
  { pattern: 'core', muscles: ['obliques'] },
];

const LEGS_SLOTS: DaySlot[] = [
  { pattern: 'squat', muscles: ['quadriceps'] },
  { pattern: 'hinge', muscles: ['hamstrings', 'glutes'] },
  { pattern: 'lunge', muscles: ['glutes', 'quadriceps'] },
  { pattern: 'calves', muscles: ['calves', 'soleus'] },
  { pattern: 'core', muscles: ['abdominals'] },
];

const FULL_BODY_SLOTS: DaySlot[] = [
  { pattern: 'squat', muscles: ['quadriceps', 'glutes'] },
  { pattern: 'push_horizontal', muscles: ['pectoralis_major'] },
  { pattern: 'pull_horizontal', muscles: ['middle_back', 'lats'] },
  { pattern: 'hinge', muscles: ['hamstrings', 'glutes'] },
  { pattern: 'pull_vertical', muscles: ['lats'] },
  { pattern: 'push_vertical', muscles: ['deltoids'] },
  { pattern: 'core', muscles: ['abdominals'] },
];

const ARMS_SHOULDER_SLOTS: DaySlot[] = [
  { pattern: 'push_vertical', muscles: ['deltoids'] },
  { pattern: 'shoulder_isolation', muscles: ['deltoids'] },
  { pattern: 'elbow_flexion', muscles: ['biceps'] },
  { pattern: 'elbow_extension', muscles: ['triceps'] },
  { pattern: 'core', muscles: ['abdominals'] },
];

const CORE_CARDIO_SLOTS: DaySlot[] = [
  { pattern: 'core', muscles: ['abdominals', 'obliques'] },
  { pattern: 'core', muscles: ['obliques', 'transverse_abdominis'] },
  { pattern: 'cardio', muscles: ['cardiovascular'] },
  { pattern: 'mobility', muscles: ['mobility'] },
];

function chooseSplit(profile: PlanGenerationProfile): SplitKind {
  const days = profile.sessionsPerWeek;

  if (profile.splitPreference === 'full_body') return 'full_body';
  if (days <= 2) return 'full_body';

  if (profile.splitPreference === 'split') {
    if (days === 3) return 'push_pull_legs';
    if (days === 4) return 'upper_lower';
    if (days === 5) return 'body_part_5';
    return 'ppl_x2';
  }

  // coach_choice: usa a divisão que cabe na rotina e no nível.
  const compoundGoal = profile.goal === 'hypertrophy' || profile.goal === 'strength';
  if (days === 3) {
    return compoundGoal && profile.level !== 'beginner' ? 'push_pull_legs' : 'full_body';
  }
  if (days === 4) return 'upper_lower';
  if (days === 5) return 'body_part_5';
  return 'ppl_x2';
}

function buildDayTemplates(profile: PlanGenerationProfile, split: SplitKind): DayTemplate[] {
  const days = profile.sessionsPerWeek;

  if (split === 'full_body') {
    return Array.from({ length: days }, (_, index) => ({
      label: days === 1 ? 'Corpo inteiro' : `Corpo inteiro ${String.fromCharCode(65 + index)}`,
      name: `Treino de corpo inteiro ${days > 1 ? index + 1 : ''}`.trim(),
      slots: FULL_BODY_SLOTS,
    }));
  }

  if (split === 'upper_lower') {
    const templates: DayTemplate[] = [
      { label: 'A', name: 'Superior — empurrar e puxar', slots: UPPER_SLOTS },
      { label: 'B', name: 'Inferior — força e unilateral', slots: LOWER_SLOTS },
      { label: 'C', name: 'Superior — variação', slots: [...UPPER_SLOTS].reverse() },
      { label: 'D', name: 'Inferior — posterior e core', slots: [...LOWER_SLOTS].reverse() },
    ];
    return repeatToLength(templates, days);
  }

  if (split === 'push_pull_legs') {
    const templates: DayTemplate[] = [
      { label: 'A', name: 'Empurrar — peito, ombro e tríceps', slots: PUSH_SLOTS },
      { label: 'B', name: 'Puxar — costas e bíceps', slots: PULL_SLOTS },
      { label: 'C', name: 'Pernas — quadríceps, posterior e glúteos', slots: LEGS_SLOTS },
    ];
    return repeatToLength(templates, days);
  }

  if (split === 'body_part_5') {
    const templates: DayTemplate[] = [
      { label: 'A', name: 'Peito e tríceps', slots: PUSH_SLOTS },
      { label: 'B', name: 'Costas e bíceps', slots: PULL_SLOTS },
      { label: 'C', name: 'Pernas', slots: LEGS_SLOTS },
      { label: 'D', name: 'Ombros e braços', slots: ARMS_SHOULDER_SLOTS },
      { label: 'E', name: 'Core e condicionamento', slots: CORE_CARDIO_SLOTS },
    ];
    return repeatToLength(templates, days);
  }

  // ppl_x2 (6 dias) — repete push/pull/legs com variação de seleção.
  const templates: DayTemplate[] = [
    { label: 'A', name: 'Empurrar I', slots: PUSH_SLOTS },
    { label: 'B', name: 'Puxar I', slots: PULL_SLOTS },
    { label: 'C', name: 'Pernas I', slots: LEGS_SLOTS },
    { label: 'D', name: 'Empurrar II', slots: [...PUSH_SLOTS].reverse() },
    { label: 'E', name: 'Puxar II', slots: [...PULL_SLOTS].reverse() },
    { label: 'F', name: 'Pernas II', slots: [...LEGS_SLOTS].reverse() },
  ];
  return repeatToLength(templates, days);
}

function repeatToLength(templates: DayTemplate[], length: number): DayTemplate[] {
  return Array.from({ length }, (_, index) => {
    const base = templates[index % templates.length];
    return base ?? templates[0] ?? { label: 'A', name: 'Treino', slots: FULL_BODY_SLOTS };
  });
}

/* ─── Parâmetros de volume ─────────────────────────────────────────────────── */

interface VolumePrescription {
  sets: number;
  reps: string;
  restSeconds: number;
}

function prescriptionsFor(
  goal: TrainingGoal,
  level: DifficultyLevel,
  pattern: MovementPattern,
): VolumePrescription {
  const levelBump = level === 'advanced' ? 1 : level === 'intermediate' ? 0 : -1;

  if (pattern === 'mobility') {
    return { sets: 2, reps: '30–45 s', restSeconds: 20 };
  }

  if (pattern === 'cardio') {
    const minutes = goal === 'endurance' ? 20 : goal === 'fat_loss' || goal === 'conditioning' ? 12 : 8;
    return { sets: 1, reps: `${minutes} min`, restSeconds: 0 };
  }

  switch (goal) {
    case 'strength':
      return { sets: clamp(4 + levelBump, 3, 5), reps: '4–6', restSeconds: 150 };
    case 'hypertrophy':
      return { sets: clamp(3 + levelBump, 2, 5), reps: '8–12', restSeconds: 90 };
    case 'conditioning':
      return { sets: clamp(3 + levelBump, 2, 4), reps: '12–15', restSeconds: 40 };
    case 'endurance':
      return { sets: clamp(3 + levelBump, 2, 4), reps: '12–20', restSeconds: 40 };
    case 'fat_loss':
      return { sets: clamp(3 + levelBump, 2, 4), reps: '12–15', restSeconds: 45 };
    case 'mobility':
      return { sets: 2, reps: '30–45 s', restSeconds: 25 };
    case 'sport_performance':
      return { sets: clamp(3 + levelBump, 2, 4), reps: '6–10', restSeconds: 90 };
    case 'active_routine':
    default:
      return { sets: clamp(2 + levelBump, 2, 4), reps: '10–12', restSeconds: 60 };
  }
}

function exerciseCountFor(profile: PlanGenerationProfile): number {
  const byTime =
    profile.minutesPerSession <= 25
      ? 4
      : profile.minutesPerSession <= 35
        ? 4
        : profile.minutesPerSession <= 45
          ? 5
          : profile.minutesPerSession <= 60
            ? 6
            : profile.minutesPerSession <= 75
              ? 7
              : 8;

  const levelCap = profile.level === 'beginner' ? 5 : profile.level === 'intermediate' ? 6 : 8;
  return clamp(Math.min(byTime, levelCap), 3, 8);
}

/* ─── Seleção de exercícios ────────────────────────────────────────────────── */

function isAvoided(exercise: CatalogExercise, profile: PlanGenerationProfile): boolean {
  const nameKey = normalize(exercise.name);
  const slugKey = normalize(exercise.slug);

  for (const avoided of profile.avoidedExercises) {
    const avoidedKey = normalize(avoided);
    if (!avoidedKey) continue;
    if (nameKey.includes(avoidedKey) || slugKey.includes(avoidedKey) || avoidedKey.includes(nameKey)) {
      return true;
    }
  }

  for (const limitation of profile.limitations) {
    const definition = LIMITATION_OPTIONS.find((l) => l.value === limitation);
    if (!definition) continue;
    if (definition.avoidNameTerms.some((term) => term.test(exercise.name))) return true;
  }

  return false;
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function scoreExercise(
  exercise: CatalogExercise,
  slot: DaySlot,
  profile: PlanGenerationProfile,
  usedIds: Set<string>,
  seed: string,
): number {
  let score = 0;

  if (usedIds.has(exercise.id)) score -= 40;

  if (slot.muscles?.includes(exercise.primaryMuscle)) score += 14;
  if (slot.muscles?.some((m) => exercise.secondaryMuscles.includes(m))) score += 4;

  if (profile.priorityMuscles.includes(exercise.primaryMuscle)) score += 26;
  if (profile.priorityMuscles.some((m) => exercise.secondaryMuscles.includes(m))) score += 8;

  // Nível: usa exercícios compatíveis, sem "esconder" os mais leves.
  if (exercise.difficulty === profile.level) score += 6;
  else if (exercise.difficulty === 'beginner') score += 3;

  // Preferência de modalidade.
  const bodyweight = exercise.equipment.every((eq) => eq === 'bodyweight' || eq === 'band');
  if (profile.preferredTraining.includes('calisthenics') && bodyweight) score += 12;
  if (profile.preferredTraining.includes('strength_training') && !bodyweight) score += 6;
  if (profile.preferredTraining.includes('cardio') && exercise.pattern === 'cardio') score += 12;
  if (profile.preferredTraining.includes('mobility') && exercise.pattern === 'mobility') score += 12;

  // Objetivo secundário: se um padrão ajuda um objetivo secundário, pequeno bônus.
  if (profile.goal === 'mobility' && exercise.pattern === 'mobility') score += 10;
  if (profile.goal === 'endurance' && exercise.pattern === 'cardio') score += 8;
  if (profile.goal === 'fat_loss' && exercise.pattern === 'cardio') score += 6;

  // Vídeo demonstrativo é útil, mas não decide sozinho.
  if (exercise.videoUrl) score += 2;

  // Desempate determinístico.
  score += hashString(`${seed}:${exercise.id}:${slot.pattern}`) % 7;

  return score;
}

function pickForSlot(
  slot: DaySlot,
  profile: PlanGenerationProfile,
  catalog: CatalogExercise[],
  usedIds: Set<string>,
  seed: string,
): CatalogExercise | null {
  const allowed = new Set(allowedDifficulties(profile.level));
  const equipment = new Set(profile.equipment.length ? profile.equipment : ['bodyweight']);

  const candidates = filterCatalog(catalog, {
    patterns: [slot.pattern],
    difficulties: [...allowed],
    inDatabaseOnly: true,
  }).filter((exercise) => {
    if (isAvoided(exercise, profile)) return false;
    // O exercício pode usar qualquer equipamento disponível; peso do corpo sempre vale.
    return exercise.equipment.some((eq) => equipment.has(eq) || eq === 'bodyweight');
  });

  if (candidates.length === 0) return null;

  let best: CatalogExercise | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const candidate of candidates) {
    const score = scoreExercise(candidate, slot, profile, usedIds, seed);
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  return best;
}

function cueFor(exercise: CatalogExercise, goal: TrainingGoal): string {
  const base = exercise.instructions?.split(/(?<=\.)\s/)[0]?.trim();
  const goalCue: Record<TrainingGoal, string> = {
    hypertrophy: 'Controle a fase de descida (2–3 s) e pare 1–2 repetições antes da falha.',
    strength: 'Priorize técnica e amplitude; aumente a carga só quando as repetições ficarem fáceis.',
    conditioning: 'Mantenha o ritmo constante e reduza o descanso apenas se a execução continuar limpa.',
    endurance: 'Respire de forma ritmada e mantenha a técnica mesmo nas últimas repetições.',
    mobility: 'Vá até onde for confortável, sem dor, e respire fundo em cada posição.',
    fat_loss: 'Trabalhe em ritmo que permita conversar com esforço; constância vale mais que intensidade máxima.',
    active_routine: 'Faça o movimento com calma; terminar bem é melhor que terminar cansado.',
    sport_performance: 'Execute com intenção e velocidade controlada na subida.',
  };

  return [base, goalCue[goal]].filter(Boolean).join(' ');
}

/* ─── Geração ──────────────────────────────────────────────────────────────── */

function estimateMinutes(exercises: GeneratedExercise[]): number {
  const workSeconds = exercises.reduce((total, exercise) => {
    const work = exercise.durationSeconds ?? exercise.sets * 40;
    const rest = exercise.restSeconds * Math.max(0, exercise.sets - 1);
    return total + work + rest;
  }, 0);

  // 8 min de aquecimento/transições.
  return clamp(Math.round(workSeconds / 60) + 8, 10, 180);
}

/**
 * Monta a lista de exercícios de um dia a partir dos slots de padrão.
 * Reutilizado pela geração do programa e pela regeneração de uma sessão.
 */
function buildExercisesForSlots(
  slots: DaySlot[],
  profile: PlanGenerationProfile,
  available: CatalogExercise[],
  usedIds: Set<string>,
  seed: string,
  maxExercises: number,
): GeneratedExercise[] {
  const exercises: GeneratedExercise[] = [];

  for (const slot of slots) {
    if (exercises.length >= maxExercises) break;

    const chosen = pickForSlot(slot, profile, available, usedIds, seed);
    if (!chosen) continue;

    // Evita o mesmo exercício duas vezes no mesmo dia.
    if (exercises.some((item) => item.exerciseId === chosen.id)) continue;

    const prescription = prescriptionsFor(profile.goal, profile.level, chosen.pattern);
    const durationSeconds =
      chosen.pattern === 'cardio'
        ? prescription.reps.includes('min')
          ? Number.parseInt(prescription.reps, 10) * 60
          : 600
        : chosen.pattern === 'mobility' || chosen.pattern === 'core'
          ? 40
          : null;

    const alternatives = findAlternatives(chosen, available, {
      equipment: profile.equipment.length ? profile.equipment : ['bodyweight'],
      difficulties: allowedDifficulties(profile.level),
      limit: 3,
    }).map((alt) => ({ exerciseId: alt.id, name: alt.name }));

    exercises.push({
      exerciseId: chosen.id,
      name: chosen.name,
      primaryMuscle: chosen.primaryMuscle,
      pattern: chosen.pattern,
      equipment: chosen.equipment,
      sets: prescription.sets,
      reps: prescription.reps,
      restSeconds: prescription.restSeconds,
      durationSeconds: durationSeconds ?? null,
      notes: cueFor(chosen, profile.goal),
      videoUrl: chosen.videoUrl ?? null,
      alternatives,
    });

    usedIds.add(chosen.id);
  }

  return exercises;
}

/**
 * Regenera UM dia preservando o resto do programa.
 *
 * Mantém os mesmos padrões de movimento do dia original (a estrutura do treino
 * não muda), mas escolhe outros exercícios — útil quando o usuário troca de
 * academia, não tem o equipamento ou simplesmente quer variar.
 */
export function regenerateDay(options: {
  profile: PlanGenerationProfile;
  catalog: CatalogExercise[];
  patterns: MovementPattern[];
  label: string;
  name: string;
  weekday: number | null;
  seed: string;
  avoidExerciseIds?: string[];
}): GeneratedDay {
  const { profile, catalog, patterns, label, name, weekday } = options;
  const available = catalog.filter((exercise) => exercise.inDatabase);
  const usedIds = new Set<string>(options.avoidExerciseIds ?? []);

  const slots: DaySlot[] = patterns.map((pattern) => ({
    pattern,
    muscles: undefined,
  }));

  const exercises = buildExercisesForSlots(
    slots,
    profile,
    available,
    usedIds,
    options.seed,
    exerciseCountFor(profile),
  );

  return {
    label,
    name,
    weekday,
    estimatedMinutes: estimateMinutes(exercises),
    muscles: [...new Set(exercises.map((exercise) => exercise.primaryMuscle))],
    rationale: `Variação do dia ${label} com os mesmos padrões de movimento, mantendo o restante do plano intacto.`,
    exercises,
  };
}

export function generateProgram(options: GeneratePlanOptions): GeneratedProgram {
  const { profile, catalog, history = [] } = options;
  const seed = options.seed ?? 'athletix';
  const source = options.source ?? 'rules';
  const warnings: string[] = [];
  const rationale: string[] = [];

  const available = catalog.filter((exercise) => exercise.inDatabase);

  if (available.length === 0) {
    return {
      name: 'Plano indisponível',
      goal: profile.goal,
      level: profile.level,
      environment: profile.environment,
      split: 'full_body',
      days: [],
      rationale: ['O catálogo de exercícios ainda não está disponível.'],
      warnings: [
        'Não foi possível montar o plano: o catálogo de exercícios está vazio ou fora do ar.',
      ],
      source,
      seed,
    };
  }

  // Exercícios feitos nos últimos 14 dias entram como "recentes", mas não são
  // proibidos: apenas perdem prioridade na escolha.
  const recentIds = new Set(
    history
      .filter((entry) => Date.now() - new Date(entry.performedAt).getTime() < 14 * 86_400_000)
      .map((entry) => entry.exerciseId),
  );

  const splitKind = chooseSplit(profile);
  const dayTemplates = buildDayTemplates(profile, splitKind);
  const perSession = exerciseCountFor(profile);
  const usedIds = new Set<string>(recentIds);
  const days: GeneratedDay[] = [];

  for (const template of dayTemplates) {
    const isCoreCardio = template.slots.every((slot) => slot.pattern === 'core' || slot.pattern === 'cardio' || slot.pattern === 'mobility');

    // Músculos prioritários ganham um slot extra quando sobrou espaço.
    const slots: DaySlot[] = [...template.slots];
    const extraMuscle = profile.priorityMuscles[0];
    if (extraMuscle) {
      const pattern = patternForMuscle(extraMuscle);
      if (pattern && !slots.some((slot) => slot.pattern === pattern)) {
        // Entra depois dos movimentos compostos principais, não no fim da
        // lista: com sessões curtas, o slot extra precisa caber no orçamento
        // de exercícios do dia.
        slots.splice(Math.min(3, slots.length), 0, { pattern, muscles: [extraMuscle] });
      }
    }

    const exercises = buildExercisesForSlots(slots, profile, available, usedIds, seed, perSession);

    if (exercises.length === 0) {
      warnings.push(
        `Não encontramos exercícios compatíveis com os equipamentos informados para o dia ${template.label}.`,
      );
      continue;
    }

    const weekday = weekdayForDay(profile.preferredDays, days.length, profile.sessionsPerWeek);
    const muscles = [...new Set(exercises.map((exercise) => muscleGroup(exercise.primaryMuscle)))];
    const estimatedMinutes = isCoreCardio
      ? clamp(profile.minutesPerSession, 15, 60)
      : estimateMinutes(exercises);

    days.push({
      label: template.label,
      name: template.name,
      weekday,
      estimatedMinutes,
      muscles: [...new Set(exercises.map((exercise) => exercise.primaryMuscle))],
      rationale: dayRationale(template, exercises, profile, muscles),
      exercises,
    });
  }

  if (profile.limitations.length > 0) {
    const adaptations = profile.limitations
      .map((value) => LIMITATION_OPTIONS.find((l) => l.value === value)?.adaptation)
      .filter((text): text is string => Boolean(text));

    if (adaptations.length > 0) {
      rationale.push(`Adaptações aplicadas: ${adaptations.join(' ')}`);
    }

    if (
      profile.limitations.some(
        (value) => LIMITATION_OPTIONS.find((l) => l.value === value)?.suggestsProfessional,
      )
    ) {
      warnings.push(
        'Você indicou uma limitação que merece avaliação profissional. Este plano é uma adaptação de treino, não diagnóstico nem reabilitação.',
      );
    }
  }

  if (profile.sessionsPerWeek >= 6 && profile.level === 'beginner') {
    warnings.push(
      'Seis dias por semana é bastante para quem está começando. Se a recuperação ficar ruim, reduza para 3–4 dias.',
    );
  }

  if (!profile.equipment.includes('bodyweight') && profile.equipment.length > 0) {
    warnings.push(
      'Adicionamos o peso do corpo como opção: ele é sempre válido e ajuda em dias sem equipamento.',
    );
  }

  const splitLabel = splitKind === 'full_body' ? 'corpo inteiro' : dayTemplates.map((d) => d.label).join('·');
  const programName = `${goalShortName(profile.goal)} — ${splitLabel}`;

  rationale.unshift(
    `Plano de ${goalShortName(profile.goal).toLowerCase()} em ${days.length} ${days.length === 1 ? 'sessão' : 'sessões'} por semana (${splitKind === 'full_body' ? 'corpo inteiro' : `divisão ${splitLabel}`}), nível ${levelName(profile.level)}.`,
  );

  rationale.push(
    `Sessões de aproximadamente ${profile.minutesPerSession} min, com ${perSession} exercícios por dia. Os descansos seguem o objetivo (${profile.goal === 'strength' ? '2–3 min' : profile.goal === 'hypertrophy' ? '60–90 s' : '30–60 s'}).`,
  );

  if (profile.priorityMuscles.length > 0) {
    rationale.push(
      `Priorizamos ${profile.priorityMuscles.slice(0, 3).map(muscleLabelFor).join(', ')} — sempre respeitando o volume total da semana.`,
    );
  }

  rationale.push(
    'Nada aqui é aleatório: cada exercício foi escolhido pelo padrão de movimento, equipamento disponível e nível, sem repetir o mesmo estímulo em excesso.',
  );

  if (source === 'rules') {
    rationale.push(
      'Este plano foi montado por regras de treinamento e pelo catálogo real do ATHLETIX — nenhum modelo de IA externo foi usado.',
    );
  }

  return {
    name: programName,
    goal: profile.goal,
    level: profile.level,
    environment: profile.environment,
    split: splitKind === 'full_body' ? 'full_body' : 'split',
    days,
    rationale,
    warnings,
    source,
    seed,
  };
}

function patternForMuscle(muscle: string): MovementPattern | null {
  const map: Record<string, MovementPattern> = {
    pectoralis_major: 'push_horizontal',
    upper_pectoralis: 'push_horizontal',
    lats: 'pull_vertical',
    middle_back: 'pull_horizontal',
    deltoids: 'push_vertical',
    posterior_deltoid: 'shoulder_isolation',
    biceps: 'elbow_flexion',
    triceps: 'elbow_extension',
    quadriceps: 'squat',
    hamstrings: 'hinge',
    glutes: 'hinge',
    abdominals: 'core',
    obliques: 'core',
    calves: 'calves',
  };
  return map[muscle] ?? null;
}

function weekdayForDay(preferredDays: number[], index: number, sessionsPerWeek: number): number | null {
  if (preferredDays.length >= sessionsPerWeek) {
    return preferredDays[index] ?? null;
  }

  // Distribuição padrão: seg/qua/sex para 3 dias, ter/qui para 2, etc.
  const defaults: Record<number, number[]> = {
    1: [1],
    2: [1, 4],
    3: [1, 3, 5],
    4: [1, 2, 4, 5],
    5: [1, 2, 3, 4, 5],
    6: [1, 2, 3, 4, 5, 6],
    7: [1, 2, 3, 4, 5, 6],
  };
  return defaults[clamp(sessionsPerWeek, 1, 7)]?.[index] ?? null;
}

function dayRationale(
  template: DayTemplate,
  exercises: GeneratedExercise[],
  profile: PlanGenerationProfile,
  groups: string[],
): string {
  const groupLabel: Record<string, string> = {
    push: 'empurrar',
    pull: 'puxar',
    legs: 'pernas',
    core: 'core',
    cardio: 'cardio',
    mobility: 'mobilidade',
  };

  const patterns = [...new Set(exercises.map((exercise) => exercise.pattern))].length;
  return `${template.name}: ${exercises.length} exercícios cobrindo ${patterns} padrões de movimento (${groups
    .map((group) => groupLabel[group] ?? group)
    .join(', ')}). Seleção compatível com ${profile.equipment.length ? 'seus equipamentos' : 'peso do corpo'} e com o nível ${levelName(profile.level)}.`;
}

function goalShortName(goal: TrainingGoal): string {
  const labels: Record<TrainingGoal, string> = {
    hypertrophy: 'Hipertrofia',
    strength: 'Força',
    conditioning: 'Condicionamento',
    endurance: 'Resistência',
    mobility: 'Mobilidade',
    fat_loss: 'Condicionamento e gordura',
    active_routine: 'Rotina ativa',
    sport_performance: 'Desempenho esportivo',
  };
  return labels[goal];
}

function levelName(level: DifficultyLevel): string {
  return level === 'advanced' ? 'avançado' : level === 'intermediate' ? 'intermediário' : 'iniciante';
}

function muscleLabelFor(muscle: string): string {
  const labels: Record<string, string> = {
    pectoralis_major: 'peitoral',
    upper_pectoralis: 'peitoral superior',
    lats: 'dorsais',
    middle_back: 'meio das costas',
    deltoids: 'ombros',
    posterior_deltoid: 'deltoide posterior',
    biceps: 'bíceps',
    triceps: 'tríceps',
    quadriceps: 'quadríceps',
    hamstrings: 'posterior de coxa',
    glutes: 'glúteos',
    abdominals: 'abdômen',
    obliques: 'oblíquos',
    calves: 'panturrilhas',
  };
  return labels[muscle] ?? muscle.replace(/_/g, ' ');
}

/** Constrói o perfil de geração a partir do perfil persistido (com defaults). */
export function toGenerationProfile(input: {
  experience: Parameters<typeof levelFromExperience>[0];
  goals: TrainingGoal[];
  goalPriority?: TrainingGoal | null;
  environment: TrainingEnvironment | null;
  equipment: string[];
  sessionsPerWeek: number | null;
  minutesPerSession: number | null;
  preferredDays: number[];
  splitPreference: SplitPreference | null;
  priorityMuscles: string[];
  avoidedExercises: string[];
  preferredTraining: PreferredTraining[];
  limitations: string[];
  guidancePreference: GuidancePreference | null;
  ageRange?: AgeRange | null;
}): PlanGenerationProfile {
  const goals = input.goals.length > 0 ? input.goals : (['active_routine'] as TrainingGoal[]);
  const goal = input.goalPriority ?? goals[0] ?? 'active_routine';

  return {
    level: levelFromExperience(input.experience),
    goal,
    secondaryGoals: goals.filter((item) => item !== goal),
    environment: input.environment ?? 'home_equipment',
    equipment: input.equipment.length > 0 ? input.equipment : ['bodyweight'],
    sessionsPerWeek: clamp(input.sessionsPerWeek ?? 3, 1, 6),
    minutesPerSession: clamp(input.minutesPerSession ?? 45, 10, 120),
    preferredDays: input.preferredDays,
    splitPreference: input.splitPreference ?? 'coach_choice',
    priorityMuscles: input.priorityMuscles,
    avoidedExercises: input.avoidedExercises,
    preferredTraining: input.preferredTraining,
    limitations: input.limitations,
    guidancePreference: input.guidancePreference ?? 'both',
    ageRange: input.ageRange ?? null,
  };
}
