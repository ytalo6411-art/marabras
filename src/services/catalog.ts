/**
 * Camada central de catálogo de exercícios.
 *
 * Responsabilidades (e o que a diferencia de `services/exercises.ts`):
 *  • FONTE ÚNICA normalizada para o gerador de planos e para os pickers;
 *  • cache com TTL + deduplicação por nome normalizado;
 *  • fallback local quando o Supabase está fora do ar;
 *  • classificação por padrão de movimento (ver `data/exerciseTaxonomy`);
 *  • nenhuma chamada externa por renderização: quem quiser atualizar pede
 *    `force: true` de forma explícita.
 *
 * `services/exercises.ts` continua existindo e sendo usado pela biblioteca
 * (busca com full-text no banco + APIs externas). Aqui o foco é o catálogo
 * completo, leve e estável para montar treino.
 */

import { supabase } from '@/lib/supabase';
import { FALLBACK_EXERCISES } from '@/data/exerciseFallback';
import {
  inferMovementPattern,
  type MovementPattern,
} from '@/data/exerciseTaxonomy';
import type { DifficultyLevel, Equipment, SourceType } from '@/types/database';

export interface CatalogExercise {
  /** UUID do banco. Vazio ('') quando vem do fallback local. */
  id: string;
  slug: string;
  name: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  equipment: string[];
  difficulty: DifficultyLevel;
  pattern: MovementPattern;
  videoUrl?: string;
  thumbnailUrl?: string;
  instructions?: string;
  source: SourceType;
  inDatabase: boolean;
  attribution?: string;
}

export type CatalogSource = 'database' | 'fallback' | 'empty';

export interface CatalogSnapshot {
  exercises: CatalogExercise[];
  source: CatalogSource;
  /** true quando o banco respondeu mas a tabela está vazia (seed não rodado). */
  needsSeed: boolean;
  loadedAt: number;
}

const CACHE_TTL = 10 * 60 * 1000;
const MAX_ROWS = 1000;

let snapshot: CatalogSnapshot | null = null;
let inFlight: Promise<CatalogSnapshot> | null = null;

/** Cache de sessão (sobrevive a navegações, morre no reload). */
export function getCachedCatalog(maxAgeMs = CACHE_TTL): CatalogSnapshot | null {
  if (!snapshot) return null;
  if (Date.now() - snapshot.loadedAt > maxAgeMs) return null;
  return snapshot;
}

export function clearCatalogCache() {
  snapshot = null;
  inFlight = null;
}

/* ─── Normalização ─────────────────────────────────────────────────────────── */

/** Chave de deduplicação: nome sem acento, sem pontuação, minúsculo. */
export function normalizeNameKey(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Deduplica por nome normalizado + equipamento. Quando o mesmo movimento vem
 * de fontes diferentes, o registro do banco local vence (tem UUID utilizável
 * em plano e vídeo próprio).
 */
export function dedupeExercises(exercises: CatalogExercise[]): CatalogExercise[] {
  const byKey = new Map<string, CatalogExercise>();

  for (const exercise of exercises) {
    const key = `${normalizeNameKey(exercise.name)}|${[...exercise.equipment].sort().join(',')}`;
    const current = byKey.get(key);
    if (!current) {
      byKey.set(key, exercise);
      continue;
    }
    if (!current.inDatabase && exercise.inDatabase) {
      byKey.set(key, exercise);
    }
  }

  return [...byKey.values()];
}

function isDifficulty(value: unknown): value is DifficultyLevel {
  return value === 'beginner' || value === 'intermediate' || value === 'advanced';
}

/* ─── Fonte principal: Supabase ────────────────────────────────────────────── */

const DB_COLUMNS =
  'id, slug, name, primary_muscle, secondary_muscles, equipment, difficulty, ' +
  'video_url, thumbnail_url, instructions, source, attribution';

/** Linha crua da tabela `exercises` (o select é feito por string, sem tipos gerados). */
interface ExerciseRow {
  id: string;
  slug: string;
  name: string;
  primary_muscle: string;
  secondary_muscles: string[] | null;
  equipment: string[] | null;
  difficulty: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  instructions: string | null;
  source: string | null;
  attribution: string | null;
}

async function loadFromDatabase(): Promise<CatalogExercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select(DB_COLUMNS)
    .eq('is_active', true)
    .order('name', { ascending: true })
    .range(0, MAX_ROWS - 1);

  if (error) throw error;

  const rows = (data ?? []) as unknown as ExerciseRow[];

  return rows.map((row) => {
    const name = String(row.name);
    const primaryMuscle = String(row.primary_muscle ?? 'full_body');
    const difficulty = isDifficulty(row.difficulty) ? row.difficulty : 'beginner';
    const equipment = Array.isArray(row.equipment)
      ? (row.equipment as Equipment[]).map(String)
      : ['bodyweight'];

    return {
      id: String(row.id),
      slug: String(row.slug),
      name,
      primaryMuscle,
      secondaryMuscles: row.secondary_muscles ?? [],
      equipment,
      difficulty,
      pattern: inferMovementPattern(name, primaryMuscle),
      videoUrl: row.video_url ?? undefined,
      thumbnailUrl: row.thumbnail_url ?? undefined,
      instructions: row.instructions ?? undefined,
      source: (row.source as SourceType | null) ?? 'manual',
      inDatabase: true,
      attribution: row.attribution ?? undefined,
    };
  });
}

/* ─── Fallback local ───────────────────────────────────────────────────────── */

export function fallbackCatalog(): CatalogExercise[] {
  return FALLBACK_EXERCISES.map((e) => ({
    id: '',
    slug: e.slug,
    name: e.name,
    primaryMuscle: e.primary_muscle,
    secondaryMuscles: e.secondary_muscles,
    equipment: e.equipment,
    difficulty: e.difficulty,
    pattern: inferMovementPattern(e.name, e.primary_muscle),
    instructions: e.instructions,
    source: 'manual' as SourceType,
    inDatabase: false,
    attribution: 'Catálogo local ATHLETIX',
  }));
}

/* ─── Carregamento ─────────────────────────────────────────────────────────── */

export interface LoadCatalogOptions {
  /** Ignora o cache e consulta o banco de novo. */
  force?: boolean;
  /** Idade máxima aceitável do cache. */
  maxAgeMs?: number;
}

/**
 * Carrega o catálogo. Nunca lança: em falha devolve o fallback local e sinaliza
 * a degradação para a UI mostrar um aviso honesto.
 */
export async function loadExerciseCatalog(
  options: LoadCatalogOptions = {},
): Promise<CatalogSnapshot> {
  const cached = !options.force ? getCachedCatalog(options.maxAgeMs) : null;
  if (cached) return cached;

  if (inFlight) return inFlight;

  inFlight = (async (): Promise<CatalogSnapshot> => {
    try {
      const rows = await loadFromDatabase();
      const deduped = dedupeExercises(rows);

      const next: CatalogSnapshot = {
        exercises: deduped,
        source: deduped.length > 0 ? 'database' : 'empty',
        needsSeed: deduped.length === 0,
        loadedAt: Date.now(),
      };
      snapshot = next;
      return next;
    } catch (error) {
      console.warn('[ATHLETIX] Catálogo indisponível no banco, usando fallback local.', error);
      const next: CatalogSnapshot = {
        exercises: fallbackCatalog(),
        source: 'fallback',
        needsSeed: false,
        loadedAt: Date.now(),
      };
      snapshot = next;
      return next;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

/* ─── Consultas ────────────────────────────────────────────────────────────── */

export interface CatalogFilters {
  patterns?: MovementPattern[];
  muscles?: string[];
  equipment?: string[];
  difficulties?: DifficultyLevel[];
  inDatabaseOnly?: boolean;
  query?: string;
  limit?: number;
}

/**
 * Filtra o catálogo em memória. O gerador chama isso várias vezes por plano,
 * então precisa ser síncrono e barato.
 */
export function filterCatalog(
  exercises: CatalogExercise[],
  filters: CatalogFilters = {},
): CatalogExercise[] {
  const queryKey = filters.query ? normalizeNameKey(filters.query) : '';
  const patterns = filters.patterns ? new Set(filters.patterns) : null;
  const muscles = filters.muscles ? new Set(filters.muscles) : null;
  const equipment = filters.equipment ? new Set(filters.equipment) : null;
  const difficulties = filters.difficulties ? new Set(filters.difficulties) : null;

  const result = exercises.filter((exercise) => {
    if (filters.inDatabaseOnly && !exercise.inDatabase) return false;
    if (patterns && !patterns.has(exercise.pattern)) return false;
    if (muscles && !muscles.has(exercise.primaryMuscle)) return false;
    if (equipment && !exercise.equipment.some((eq) => equipment.has(eq))) return false;
    if (difficulties && !difficulties.has(exercise.difficulty)) return false;
    if (queryKey && !normalizeNameKey(exercise.name).includes(queryKey)) return false;
    return true;
  });

  return typeof filters.limit === 'number' ? result.slice(0, filters.limit) : result;
}

/**
 * Alternativas para um exercício: mesmo padrão de movimento, sem depender de
 * equipamento que o usuário não tem, mais leve em nível.
 */
export function findAlternatives(
  exercise: CatalogExercise,
  all: CatalogExercise[],
  opts: { equipment?: string[]; difficulties?: DifficultyLevel[]; limit?: number } = {},
): CatalogExercise[] {
  const { equipment, difficulties, limit = 3 } = opts;

  return all
    .filter((candidate) => {
      if (candidate.id === exercise.id) return false;
      if (candidate.pattern !== exercise.pattern) return false;
      if (equipment && !candidate.equipment.some((eq) => equipment.includes(eq))) return false;
      if (difficulties && !difficulties.includes(candidate.difficulty)) return false;
      return true;
    })
    .slice(0, limit);
}
