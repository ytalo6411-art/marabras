/**
 * Perfil de treino (respostas do questionário de personalização).
 *
 * Duas camadas:
 *  1. `QuestionnaireAnswers` — o formato que o wizard manipula;
 *  2. `training_profiles` — a tabela no Supabase (1:1 com auth.users, RLS own).
 *
 * Toda gravação é validada com Zod ANTES de ir para o banco. Nada de escrever
 * valor fora do vocabulário conhecido.
 */

import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import type {
  AgeRange,
  Equipment,
  Gender,
  GuidancePreference,
  PreferredTraining,
  SessionLengthPreference,
  SplitPreference,
  TrainingEnvironment,
  TrainingExperience,
  TrainingGoal,
  TrainingProfile,
} from '@/types/database';
import { toGenerationProfile, type PlanGenerationProfile } from '@/services/planGenerator';
import { getSchemaCapabilities, isMissingSchemaError } from '@/services/dbCapabilities';
import { ENVIRONMENT_EQUIPMENT, levelFromExperience } from '@/data/exerciseTaxonomy';

/* ─── Formato do questionário ──────────────────────────────────────────────── */

export interface QuestionnaireAnswers {
  experience: TrainingExperience | null;
  ageRange: AgeRange | null;
  /** Opcional. Nunca é usado para determinar exercícios. */
  gender: Gender | null;
  heightCm: number | null;
  weightKg: number | null;
  goals: TrainingGoal[];
  goalPriority: TrainingGoal | null;
  environment: TrainingEnvironment | null;
  equipment: string[];
  sessionsPerWeek: number;
  minutesPerSession: number;
  preferredDays: number[];
  sessionLengthPreference: SessionLengthPreference | null;
  priorityMuscles: string[];
  avoidedExercises: string[];
  preferredTraining: PreferredTraining[];
  splitPreference: SplitPreference | null;
  guidancePreference: GuidancePreference | null;
  limitations: string[];
  needsProfessionalGuidance: boolean;
  safetyAcknowledged: boolean;
}

export const EMPTY_ANSWERS: QuestionnaireAnswers = {
  experience: null,
  ageRange: null,
  gender: null,
  heightCm: null,
  weightKg: null,
  goals: [],
  goalPriority: null,
  environment: null,
  equipment: [],
  sessionsPerWeek: 3,
  minutesPerSession: 45,
  preferredDays: [1, 3, 5],
  sessionLengthPreference: 'moderate',
  priorityMuscles: [],
  avoidedExercises: [],
  preferredTraining: [],
  splitPreference: 'coach_choice',
  guidancePreference: 'both',
  limitations: [],
  needsProfessionalGuidance: false,
  safetyAcknowledged: false,
};

export const QUESTIONNAIRE_STEPS = [
  { id: 1, title: 'Perfil', description: 'Só o essencial para calibrar o treino.' },
  { id: 2, title: 'Objetivos', description: 'O que você quer alcançar primeiro?' },
  { id: 3, title: 'Local e equipamentos', description: 'Onde você vai treinar.' },
  { id: 4, title: 'Disponibilidade', description: 'Quanto tempo você tem de verdade.' },
  { id: 5, title: 'Preferências', description: 'O que você gosta (e não gosta) de fazer.' },
  { id: 6, title: 'Segurança', description: 'Adaptações e cuidados.' },
  { id: 7, title: 'Revisão', description: 'Confira antes de gerar o plano.' },
] as const;

/* ─── Validação ────────────────────────────────────────────────────────────── */

const experienceSchema = z.enum(['never', 'beginner', 'intermediate', 'advanced']);
const ageRangeSchema = z.enum(['16_17', '18_24', '25_34', '35_44', '45_54', '55_64', '65_plus']);
const goalSchema = z.enum([
  'hypertrophy', 'strength', 'conditioning', 'endurance',
  'mobility', 'fat_loss', 'active_routine', 'sport_performance',
]);
const environmentSchema = z.enum(['gym', 'home_equipment', 'home_bodyweight', 'outdoor', 'other']);
const preferredTrainingSchema = z.enum([
  'strength_training', 'calisthenics', 'cardio', 'mixed', 'mobility',
]);

export const questionnaireSchema = z.object({
  experience: experienceSchema.nullable(),
  ageRange: ageRangeSchema.nullable(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).nullable(),
  heightCm: z.number().min(90).max(250).nullable(),
  weightKg: z.number().min(25).max(400).nullable(),
  goals: z.array(goalSchema).max(5),
  goalPriority: goalSchema.nullable(),
  environment: environmentSchema.nullable(),
  equipment: z.array(z.string().min(1)).max(12),
  sessionsPerWeek: z.number().int().min(1).max(7),
  minutesPerSession: z.number().int().min(10).max(180),
  preferredDays: z.array(z.number().int().min(0).max(6)).max(7),
  sessionLengthPreference: z.enum(['short', 'moderate', 'long']).nullable(),
  priorityMuscles: z.array(z.string()).max(8),
  avoidedExercises: z.array(z.string().max(80)).max(20),
  preferredTraining: z.array(preferredTrainingSchema).max(5),
  splitPreference: z.enum(['full_body', 'split', 'coach_choice']).nullable(),
  guidancePreference: z.enum(['video', 'text', 'both']).nullable(),
  limitations: z.array(z.string()).max(8),
  needsProfessionalGuidance: z.boolean(),
  safetyAcknowledged: z.boolean(),
});

const STEP_FIELDS: Record<number, (keyof QuestionnaireAnswers)[]> = {
  1: ['experience'],
  2: ['goals', 'goalPriority'],
  3: ['environment'],
  4: ['sessionsPerWeek', 'minutesPerSession'],
  5: [],
  6: [],
  7: [],
};

export interface StepValidation {
  ok: boolean;
  errors: string[];
}

/**
 * Valida só o que a etapa exige. O usuário pode avançar sem preencher itens
 * opcionais — o gerador usa defaults sensatos e o resumo mostra o que ficou
 * em branco.
 */
export function validateStep(step: number, answers: QuestionnaireAnswers): StepValidation {
  const errors: string[] = [];

  if (step === 1 && !answers.experience) {
    errors.push('Conte como está sua experiência atual com exercícios.');
  }

  if (step === 2 && answers.goals.length === 0) {
    errors.push('Escolha pelo menos um objetivo.');
  }

  if (step === 2 && answers.goals.length > 0 && !answers.goalPriority) {
    errors.push('Defina qual objetivo é a prioridade.');
  }

  if (step === 3) {
    if (!answers.environment) {
      errors.push('Escolha onde você vai treinar.');
    }
    if (answers.environment && !['home_bodyweight', 'other'].includes(answers.environment) && answers.equipment.length === 0) {
      errors.push('Marque os equipamentos disponíveis (mesmo que seja só o peso do corpo).');
    }
  }

  if (step === 4) {
    if (answers.sessionsPerWeek < 1) errors.push('Escolha ao menos um dia por semana.');
    if (answers.minutesPerSession < 10) errors.push('Informe ao menos 10 minutos por sessão.');
  }

  if (step === 6 && answers.limitations.length > 0 && !answers.safetyAcknowledged) {
    errors.push('Confirme que entendeu o aviso de segurança para continuar.');
  }

  const required = STEP_FIELDS[step] ?? [];
  if (required.length > 0) {
    const parsed = questionnaireSchema.safeParse(answers);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push(`${issue.path.join('.')}: ${issue.message}`);
      }
    }
  }

  return { ok: errors.length === 0, errors: [...new Set(errors)] };
}

/** Primeira etapa que ainda falta preencher (usada para retomar o wizard). */
export function firstIncompleteStep(answers: QuestionnaireAnswers): number {
  for (let step = 1; step <= 6; step++) {
    if (!validateStep(step, answers).ok) return step;
  }
  return 7;
}

/* ─── Conversões ───────────────────────────────────────────────────────────── */

export function answersFromRow(row: TrainingProfile | null): QuestionnaireAnswers {
  if (!row) return EMPTY_ANSWERS;

  const raw = (row.questionnaire ?? {}) as Partial<QuestionnaireAnswers>;

  return {
    ...EMPTY_ANSWERS,
    ...raw,
    experience: row.experience ?? raw.experience ?? null,
    ageRange: row.age_range ?? raw.ageRange ?? null,
    goals: (row.goals as TrainingGoal[]) ?? [],
    goalPriority: row.goal_priority ?? raw.goalPriority ?? null,
    environment: row.environment ?? raw.environment ?? null,
    equipment: row.equipment ?? [],
    sessionsPerWeek: row.sessions_per_week ?? EMPTY_ANSWERS.sessionsPerWeek,
    minutesPerSession: row.minutes_per_session ?? EMPTY_ANSWERS.minutesPerSession,
    preferredDays: row.preferred_days ?? EMPTY_ANSWERS.preferredDays,
    sessionLengthPreference: row.session_length_preference ?? raw.sessionLengthPreference ?? null,
    priorityMuscles: row.priority_muscles ?? [],
    avoidedExercises: row.avoided_exercises ?? [],
    preferredTraining: (row.preferred_training as PreferredTraining[]) ?? [],
    splitPreference: row.split_preference ?? raw.splitPreference ?? null,
    guidancePreference: row.guidance_preference ?? raw.guidancePreference ?? null,
    limitations: row.limitations ?? [],
    needsProfessionalGuidance: row.needs_professional_guidance,
    safetyAcknowledged: row.safety_acknowledged,
    gender: raw.gender ?? null,
    heightCm: raw.heightCm ?? null,
    weightKg: raw.weightKg ?? null,
  };
}

/**
 * Normaliza o equipamento a partir do ambiente quando o usuário não marcou nada.
 * Home sem equipamento = peso do corpo; academia = tudo (ele escolheu academia).
 */
export function effectiveEquipment(answers: QuestionnaireAnswers): Equipment[] {
  const chosen = answers.equipment.filter(Boolean);
  if (chosen.length > 0) {
    return chosen as Equipment[];
  }
  const environment = answers.environment ?? 'home_equipment';
  return ENVIRONMENT_EQUIPMENT[environment] as Equipment[];
}

export function toPlanProfile(answers: QuestionnaireAnswers): PlanGenerationProfile {
  return toGenerationProfile({
    experience: answers.experience,
    goals: answers.goals,
    goalPriority: answers.goalPriority,
    environment: answers.environment,
    equipment: effectiveEquipment(answers),
    sessionsPerWeek: answers.sessionsPerWeek,
    minutesPerSession: answers.minutesPerSession,
    preferredDays: answers.preferredDays,
    splitPreference: answers.splitPreference,
    priorityMuscles: answers.priorityMuscles,
    avoidedExercises: answers.avoidedExercises,
    preferredTraining: answers.preferredTraining,
    limitations: answers.limitations,
    guidancePreference: answers.guidancePreference,
    ageRange: answers.ageRange,
  });
}

export function generationProfileFromRow(row: TrainingProfile | null): PlanGenerationProfile {
  return toPlanProfile(answersFromRow(row));
}

export function levelLabelFromAnswers(answers: QuestionnaireAnswers): string {
  const level = levelFromExperience(answers.experience);
  return level === 'advanced' ? 'Avançado' : level === 'intermediate' ? 'Intermediário' : 'Iniciante';
}

/* ─── Persistência ─────────────────────────────────────────────────────────── */

export interface SaveTrainingProfileResult {
  ok: boolean;
  error?: string;
  data?: TrainingProfile;
  /**
   * 'database' = salvo na conta; 'local' = salvo neste dispositivo porque a
   * migração ainda não foi aplicada no banco.
   */
  storage: 'database' | 'local';
}

const LOCAL_DRAFT_PREFIX = 'athletix:training-draft:';

function localDraftKey(userId: string): string {
  return `${LOCAL_DRAFT_PREFIX}${userId}`;
}

/** Rascunho local (usado só enquanto a tabela não existe no banco). */
export function saveLocalDraft(userId: string, answers: QuestionnaireAnswers): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    localStorage.setItem(localDraftKey(userId), JSON.stringify(answers));
    return true;
  } catch {
    return false;
  }
}

export function loadLocalDraft(userId: string): QuestionnaireAnswers | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(localDraftKey(userId));
    if (!raw) return null;
    const parsed = questionnaireSchema.safeParse(JSON.parse(raw));
    return parsed.success ? (parsed.data as QuestionnaireAnswers) : null;
  } catch {
    return null;
  }
}

export function clearLocalDraft(userId: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(localDraftKey(userId));
  } catch {
    // Ignora: não é crítico.
  }
}

/** Converte as respostas no formato da tabela (usado no banco e no modo local). */
export function answersToRow(userId: string, answers: QuestionnaireAnswers): TrainingProfile {
  const now = new Date().toISOString();

  return {
    user_id: userId,
    experience: answers.experience,
    age_range: answers.ageRange,
    goals: answers.goals,
    goal_priority: answers.goalPriority,
    environment: answers.environment,
    equipment: effectiveEquipment(answers),
    sessions_per_week: answers.sessionsPerWeek,
    minutes_per_session: answers.minutesPerSession,
    preferred_days: answers.preferredDays,
    session_length_preference: answers.sessionLengthPreference,
    priority_muscles: answers.priorityMuscles,
    avoided_exercises: answers.avoidedExercises,
    preferred_training: answers.preferredTraining,
    split_preference: answers.splitPreference,
    guidance_preference: answers.guidancePreference,
    limitations: answers.limitations,
    needs_professional_guidance: answers.needsProfessionalGuidance,
    safety_acknowledged: answers.safetyAcknowledged,
    questionnaire: answers as unknown as TrainingProfile['questionnaire'],
    schema_version: 1,
    completed_at: now,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Carrega o perfil de treino do usuário autenticado.
 *
 * Se a tabela ainda não existir (migração pendente), devolve o rascunho salvo
 * neste dispositivo — a pessoa continua vendo o próprio questionário em vez de
 * uma tela vazia.
 */
export async function loadTrainingProfile(userId: string): Promise<TrainingProfile | null> {
  const { capabilities } = await getSchemaCapabilities();

  if (!capabilities.trainingProfiles) {
    const draft = loadLocalDraft(userId);
    return draft ? answersToRow(userId, draft) : null;
  }

  const { data, error } = await supabase
    .from('training_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[ATHLETIX] Não foi possível ler training_profiles:', error.message);
    if (isMissingSchemaError(error.message)) {
      const draft = loadLocalDraft(userId);
      return draft ? answersToRow(userId, draft) : null;
    }
    return null;
  }

  if (data) return data as TrainingProfile;

  // Banco sem linha, mas existe rascunho local (ex.: respondeu antes da migração).
  const draft = loadLocalDraft(userId);
  return draft ? answersToRow(userId, draft) : null;
}

/**
 * Salva (upsert) o questionário e sincroniza o que também pertence a `profiles`.
 * A validação acontece aqui: mesmo que a UI erre, o banco não recebe lixo.
 */
export async function saveTrainingProfile(
  userId: string,
  answers: QuestionnaireAnswers,
): Promise<SaveTrainingProfileResult> {
  const parsed = questionnaireSchema.safeParse(answers);
  if (!parsed.success) {
    return {
      ok: false,
      storage: 'database',
      error: parsed.error.issues[0]?.message ?? 'Respostas inválidas.',
    };
  }

  const { capabilities } = await getSchemaCapabilities();

  // Migração pendente: guarda neste dispositivo e segue com a geração do plano.
  if (!capabilities.trainingProfiles) {
    const saved = saveLocalDraft(userId, answers);
    return saved
      ? { ok: true, storage: 'local' }
      : {
          ok: false,
          storage: 'local',
          error: 'Não foi possível salvar suas preferências neste dispositivo (armazenamento indisponível).',
        };
  }

  const payload = {
    user_id: userId,
    experience: answers.experience,
    age_range: answers.ageRange,
    goals: answers.goals,
    goal_priority: answers.goalPriority,
    environment: answers.environment,
    equipment: effectiveEquipment(answers),
    sessions_per_week: answers.sessionsPerWeek,
    minutes_per_session: answers.minutesPerSession,
    preferred_days: answers.preferredDays,
    session_length_preference: answers.sessionLengthPreference,
    priority_muscles: answers.priorityMuscles,
    avoided_exercises: answers.avoidedExercises,
    preferred_training: answers.preferredTraining,
    split_preference: answers.splitPreference,
    guidance_preference: answers.guidancePreference,
    limitations: answers.limitations,
    needs_professional_guidance: answers.needsProfessionalGuidance,
    safety_acknowledged: answers.safetyAcknowledged,
    questionnaire: answers,
    schema_version: 1,
    completed_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('training_profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('[ATHLETIX] Falha ao salvar training_profiles:', error.message);

    if (isMissingSchemaError(error.message)) {
      // Schema mudou entre a checagem e a escrita: cai para o modo local.
      const saved = saveLocalDraft(userId, answers);
      if (saved) return { ok: true, storage: 'local' };
    }

    return {
      ok: false,
      storage: 'database',
      error: 'Não foi possível salvar suas preferências. Verifique a conexão e tente novamente.',
    };
  }

  // Sincronizado no banco: o rascunho local não é mais necessário.
  clearLocalDraft(userId);

  // Sincroniza dados básicos do perfil (opcionais).
  const profilePatch: Record<string, unknown> = { onboarding_completed: true };
  if (answers.gender) profilePatch.gender = answers.gender;
  if (answers.heightCm) profilePatch.height_cm = answers.heightCm;
  if (answers.weightKg) profilePatch.weight_kg = answers.weightKg;
  if (answers.ageRange === '16_17') profilePatch.is_minor = true;
  else if (answers.ageRange) profilePatch.is_minor = false;

  const { error: profileError } = await supabase
    .from('profiles')
    .update(profilePatch)
    .eq('id', userId);

  if (profileError) {
    console.warn('[ATHLETIX] Preferências salvas, mas o perfil não foi sincronizado:', profileError.message);
  }

  return { ok: true, storage: 'database', data: data as TrainingProfile };
}

/** Remove as preferências de personalização (LGPD — direito de exclusão). */
export async function deleteTrainingProfile(
  userId?: string,
): Promise<{ ok: boolean; error?: string }> {
  if (userId) clearLocalDraft(userId);

  const { capabilities } = await getSchemaCapabilities();
  if (!capabilities.trainingProfiles) {
    // Nada no banco além do flag em `profiles`.
    if (userId) {
      await supabase.from('profiles').update({ onboarding_completed: false }).eq('id', userId);
    }
    return { ok: true };
  }

  const { error } = await supabase.rpc('reset_training_profile');

  if (error && userId) {
    // Fallback: se a RPC ainda não existir no banco, apaga a própria linha.
    // A RLS garante que só a linha do usuário autenticado pode ser afetada.
    const { error: deleteError } = await supabase
      .from('training_profiles')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      return { ok: false, error: 'Não foi possível remover suas preferências agora.' };
    }

    await supabase.from('profiles').update({ onboarding_completed: false }).eq('id', userId);
  }

  if (error && !userId) {
    return {
      ok: false,
      error: 'Não foi possível remover suas preferências agora. Tente de novo em instantes.',
    };
  }

  return { ok: true };
}

/**
 * Histórico recente para o gerador evitar repetir os mesmos exercícios.
 * Falha silenciosa: histórico é otimização, não requisito.
 */
export async function loadRecentExerciseHistory(
  userId: string,
  days = 14,
): Promise<{ exerciseId: string; performedAt: string }[]> {
  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  const { data, error } = await supabase
    .from('exercise_history')
    .select('exercise_id, performed_at')
    .eq('user_id', userId)
    .gte('performed_at', since)
    .order('performed_at', { ascending: false })
    .limit(120);

  if (error || !data) return [];

  return data.map((row) => ({
    exerciseId: String(row.exercise_id),
    performedAt: String(row.performed_at),
  }));
}
