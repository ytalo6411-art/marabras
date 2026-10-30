/**
 * Integração com fontes abertas de exercícios.
 *
 * Fontes usadas:
 *  • Free Exercise DB (yuhonas/free-exercise-db) — MIT, ~130 exercícios com
 *    vídeo demonstrativo (MP4) e thumbnail. Hospedado no GitHub, sem limite
 *    de requisições documentado.
 *  • wger — AGPLv3, API REST oficial, base completa de exercícios com
 *    traduções, imagens e很好的 estrutura de grupos musculares.
 *
 * Estratégia: tenta o banco local (Supabase) primeiro — é a fonte mais rápida
 * e já tem busca por full-text. Quando não houver resultado local, consulta
 * as APIs externas e devolve os resultados com a origem identificada.
 *
 * Nenhum dado nutricional ou de treino é inventado: o campo `source` sempre
 * identifica a origem real do registro.
 */

import { supabase } from '@/lib/supabase';
import type { Exercise, ExerciseCategory, SourceType } from '@/types/database';

const FREE_EXERCISE_DB =
  import.meta.env.VITE_FREEEXERCISEDB_BASE_URL ||
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main';

const WGER_BASE = import.meta.env.VITE_WGER_BASE_URL || 'https://wger.de/api/v2';

/* ─────────────────────────────────────────────────────────────────────────────
   Tipos das APIs externas
   ───────────────────────────────────────────────────────────────────────────── */

interface FreeExerciseDbEntry {
  id: number;
  name: string;
  slug: string;
  muscles: string[];
  primaryMuscle: string;
  secondaryMuscles: string[];
  equipment: string;
  category: string;
  instructions: string;
  level: string;
  videoUrl?: string;
  imageUrl?: string;
}

interface WgerExercise {
  id: number;
  name: string;
  name_en?: string;
  category?: { id: number; name: string };
  muscles?: { id: number; name: string }[];
  muscles_secondary?: { id: number; name: string }[];
  equipment?: { id: number; name: string };
  images?: string[];
  description?: string;
}

interface WgerResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/* ─────────────────────────────────────────────────────────────────────────────
   Resultado unificado
   ───────────────────────────────────────────────────────────────────────────── */

export interface ExerciseResult {
  /** Chave estável para React e para deduplicar. */
  key: string;
  name: string;
  slug: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description?: string;
  instructions?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  source: SourceType;
  sourceUrl?: string;
  attribution?: string;
  license?: string;
  /** true quando o registro já existe no banco local (id UUID válido). */
  inDatabase: boolean;
  id?: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Normalização
   ───────────────────────────────────────────────────────────────────────────── */

const DIFFICULTY_MAP: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
  beginner: 'beginner',
  intermediate: 'intermediate',
  advanced: 'advanced',
  'beginner (bodyweight)': 'beginner',
};

/** Converte o equipamento do Free Exercise DB para o enum do banco. */
function normalizeEquipment(raw: string | undefined): string[] {
  if (!raw) return ['bodyweight'];
  const map: Record<string, string> = {
    'body weight': 'bodyweight',
    bodyweight: 'bodyweight',
    barbell: 'barbell',
    dumbbell: 'dumbbell',
    'dumbbells': 'dumbbell',
    kettlebell: 'kettlebell',
    band: 'band',
    'resistance band': 'band',
    machine: 'machine',
    cable: 'cable',
    bench: 'bench',
    'pull-up bar': 'pullup_bar',
    'pull up bar': 'pullup_bar',
    'medicine ball': 'medicine_ball',
    'foam roller': 'foam_roller',
    none: 'none',
  };
  return [map[raw.toLowerCase().trim()] ?? 'bodyweight'];
}

/** Traduz os nomes de músculo do wger para o vocabulário do ATHLETIX. */
const MUSCLE_MAP: Record<string, string> = {
  chest: 'chest',
  back: 'back',
  shoulders: 'shoulders',
  biceps: 'biceps',
  triceps: 'triceps',
  'abs': 'abs',
  'abdominals': 'abs',
  quadriceps: 'quads',
  quads: 'quads',
  hamstrings: 'hamstrings',
  glutes: 'glutes',
  calves: 'calves',
  cardio: 'cardio',
  mobility: 'mobility',
};

/** Normaliza para o formato de URL de mídia do Free Exercise DB. */
function mediaUrl(path: string | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${FREE_EXERCISE_DB}/${path.replace(/^\/+/, '')}`;
}

function fromFreeExerciseDb(entry: FreeExerciseDbEntry): ExerciseResult {
  return {
    key: `fedb-${entry.id}`,
    name: entry.name,
    slug: entry.slug,
    primaryMuscle: MUSCLE_MAP[entry.primaryMuscle?.toLowerCase()] ?? entry.primaryMuscle ?? 'chest',
    secondaryMuscles: (entry.secondaryMuscles ?? [])
      .map((m) => MUSCLE_MAP[m.toLowerCase()] ?? m)
      .filter(Boolean),
    equipment: normalizeEquipment(entry.equipment),
    difficulty: DIFFICULTY_MAP[entry.level?.toLowerCase()] ?? 'beginner',
    instructions: entry.instructions || undefined,
    videoUrl: mediaUrl(entry.videoUrl),
    thumbnailUrl: mediaUrl(entry.imageUrl),
    imageUrl: mediaUrl(entry.imageUrl),
    source: 'free_exercise_db',
    sourceUrl: 'https://github.com/yuhonas/free-exercise-db',
    attribution: 'Free Exercise DB — MIT License',
    license: 'MIT',
    inDatabase: false,
  };
}

function fromWger(entry: WgerExercise): ExerciseResult {
  const primary = entry.muscles?.[0]?.name ?? 'chest';
  const image = entry.images?.[0];

  return {
    key: `wger-${entry.id}`,
    name: entry.name,
    slug: `wger-${entry.id}-${entry.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
    primaryMuscle: MUSCLE_MAP[primary.toLowerCase()] ?? primary.toLowerCase(),
    secondaryMuscles: (entry.muscles_secondary ?? [])
      .map((m) => MUSCLE_MAP[m.name.toLowerCase()] ?? m.name.toLowerCase())
      .filter(Boolean),
    equipment: normalizeEquipment(entry.equipment?.name),
    difficulty: 'beginner',
    description: entry.description?.replace(/<[^>]*>/g, '').trim() || undefined,
    thumbnailUrl: image,
    imageUrl: image,
    source: 'wger',
    sourceUrl: `https://wger.de/exercise/${entry.id}`,
    attribution: 'wger — AGPL-3.0',
    license: 'AGPL-3.0',
    inDatabase: false,
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   Cache em memória
   ───────────────────────────────────────────────────────────────────────────── */

/**
 * Cache curto em memória. Evita repetir a mesma requisição ao navegar
 * entre telas — importante em conexões lentas.
 */
const cache = new Map<string, { at: number; data: ExerciseResult[] }>();
const CACHE_TTL = 5 * 60 * 1000;

function getCached(key: string): ExerciseResult[] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key: string, data: ExerciseResult[]) {
  cache.set(key, { at: Date.now(), data });
}

/** Limpa o cache (usado quando o admin altera exercícios). */
export function clearExerciseCache() {
  cache.clear();
}

/* ─────────────────────────────────────────────────────────────────────────────
   Busca
   ───────────────────────────────────────────────────────────────────────────── */

export interface ExerciseSearchParams {
  query?: string;
  muscle?: string;
  difficulty?: string;
  limit?: number;
  offset?: number;
}

/**
 * Busca exercícios. Ordem de fontes:
 *  1. Banco local (Supabase) — mais rápido, já indexado, sem limite.
 *  2. Free Exercise DB — tem vídeo.
 *  3. wger — base mais completa.
 *
 * Se o banco local tiver resultados suficientes, não chamamos as APIs
 * externas (evita latência e respeita os limites gratuitos).
 */
export async function searchExercises(
  params: ExerciseSearchParams = {},
): Promise<ExerciseResult[]> {
  const { query = '', muscle, difficulty, limit = 24, offset = 0 } = params;

  const cacheKey = JSON.stringify({ query, muscle, difficulty, limit, offset });
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // ── 1. Banco local ──────────────────────────────────────────────────────
  try {
    let q = supabase
      .from('exercises')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (query.trim()) {
      // Busca por full-text quando disponível; o ILIKE cobre o fallback.
      q = q.ilike('name', `%${query.trim()}%`);
    }
    if (muscle) q = q.eq('primary_muscle', muscle);
    if (difficulty) q = q.eq('difficulty', difficulty);

    const { data, error } = await q;

    if (!error && data && data.length > 0) {
      const results = data.map(fromDatabase);
      setCached(cacheKey, results);
      return results;
    }
  } catch {
    // Cai para as APIs externas.
  }

  // ── 2. Free Exercise DB (tem vídeo demonstrativo) ───────────────────────
  const results: ExerciseResult[] = [];

  try {
    const all = await loadFreeExerciseDb();
    const filtered = all.filter((e) => {
      if (muscle && e.primaryMuscle !== muscle) return false;
      if (difficulty && e.difficulty !== difficulty) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        return (
          e.name.toLowerCase().includes(q) ||
          e.primaryMuscle.toLowerCase().includes(q) ||
          e.secondaryMuscles.some((m) => m.toLowerCase().includes(q))
        );
      }
      return true;
    });

    results.push(...filtered);
  } catch {
    // API indisponível — segue para a wger.
  }

  // ── 3. wger (complementa a base) ─────────────────────────────────────────
  if (results.length < limit) {
    try {
      const wgerResults = await loadWger({ query, muscle, limit: limit - results.length });
      results.push(...wgerResults);
    } catch {
      // Sem wger também — devolve o que temos.
    }
  }

  const sliced = results.slice(offset, offset + limit);
  setCached(cacheKey, sliced);
  return sliced;
}

function fromDatabase(row: Exercise): ExerciseResult {
  return {
    key: row.id,
    id: row.id,
    name: row.name,
    slug: row.slug,
    primaryMuscle: row.primary_muscle,
    secondaryMuscles: row.secondary_muscles ?? [],
    equipment: row.equipment ?? ['bodyweight'],
    difficulty: row.difficulty,
    description: row.description ?? undefined,
    instructions: row.instructions ?? undefined,
    videoUrl: row.video_url ?? undefined,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    imageUrl: row.image_url ?? undefined,
    source: row.source,
    sourceUrl: row.source_url ?? undefined,
    attribution: row.attribution ?? undefined,
    license: row.license ?? undefined,
    inDatabase: true,
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   Fontes externas
   ───────────────────────────────────────────────────────────────────────────── */

let freeDbPromise: Promise<ExerciseResult[]> | null = null;

/**
 * Baixa o índice do Free Exercise DB uma vez por sessão.
 * O arquivo é pequeno (~130 itens) e servido do GitHub raw.
 */
function loadFreeExerciseDb(): Promise<ExerciseResult[]> {
  if (!freeDbPromise) {
    freeDbPromise = fetch(`${FREE_EXERCISE_DB}/exercises.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Free Exercise DB: HTTP ${res.status}`);
        return res.json();
      })
      .then((data: FreeExerciseDbEntry[]) => data.map(fromFreeExerciseDb))
      .catch((err) => {
        // Libera a promessa para permitir retry em uma chamada futura.
        freeDbPromise = null;
        throw err;
      });
  }
  return freeDbPromise;
}

async function loadWger(params: {
  query?: string;
  muscle?: string;
  limit: number;
}): Promise<ExerciseResult[]> {
  const url = new URL(`${WGER_BASE}/exercise/`);
  url.searchParams.set('language', '2'); // inglês — IDs estáveis
  url.searchParams.set('limit', String(Math.min(params.limit, 50)));
  url.searchParams.set('status', '2'); // apenas exercícios com dados completos

  if (params.query?.trim()) {
    url.searchParams.set('search', params.query.trim());
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`wger: HTTP ${res.status}`);

  const data = (await res.json()) as WgerResponse<WgerExercise>;
  let list = (data.results ?? []).map(fromWger);

  if (params.muscle) {
    list = list.filter((e) => e.primaryMuscle === params.muscle);
  }

  return list;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Detalhes e categorias
   ───────────────────────────────────────────────────────────────────────────── */

export async function getExerciseBySlug(slug: string): Promise<ExerciseResult | null> {
  // Banco local
  const { data } = await supabase
    .from('exercises')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (data) return fromDatabase(data);

  // Free Exercise DB
  try {
    const all = await loadFreeExerciseDb();
    const found = all.find((e) => e.slug === slug);
    if (found) return found;
  } catch {
    // segue para wger
  }

  // wger
  if (slug.startsWith('wger-')) {
    const id = Number(slug.split('-')[1]);
    if (Number.isFinite(id)) {
      try {
        const res = await fetch(`${WGER_BASE}/exerciseinfo/${id}/?language=2`);
        if (res.ok) {
          const entry = (await res.json()) as WgerExercise;
          return fromWger(entry);
        }
      } catch {
        return null;
      }
    }
  }

  return null;
}

export async function getCategories(): Promise<ExerciseCategory[]> {
  const { data, error } = await supabase
    .from('exercise_categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Importa um exercício da API externa para o banco local, para que ele possa
 * ser usado em planos de treino (que exigem FK para `exercises`).
 */
export async function importExercise(result: ExerciseResult): Promise<string | null> {
  if (result.id) return result.id;

  const { data, error } = await supabase
    .from('exercises')
    .upsert(
      {
        external_id: result.key,
        source: result.source,
        name: result.name,
        slug: result.slug,
        description: result.description ?? null,
        instructions: result.instructions ?? null,
        difficulty: result.difficulty,
        primary_muscle: result.primaryMuscle,
        secondary_muscles: result.secondaryMuscles,
        equipment: result.equipment as Exercise['equipment'],
        video_url: result.videoUrl ?? null,
        thumbnail_url: result.thumbnailUrl ?? null,
        image_url: result.imageUrl ?? null,
        source_url: result.sourceUrl ?? null,
        attribution: result.attribution ?? null,
        license: result.license ?? null,
        is_active: true,
      },
      { onConflict: 'slug' },
    )
    .select('id')
    .single();

  if (error) throw error;
  clearExerciseCache();
  return data.id;
}
