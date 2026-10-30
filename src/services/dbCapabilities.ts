/**
 * Detecção de capacidades do schema.
 *
 * O app pode ser publicado antes da migração ser aplicada no Supabase. Em vez
 * de falhar com erro genérico ("algo deu errado"), ele descobre o que existe de
 * verdade no banco e se adapta:
 *
 *  • `trainingProfiles` — a tabela `training_profiles` existe?
 *  • `planProgramColumns` — `workout_plans` tem `program_id` / `metadata`?
 *
 * A checagem é feita no máximo uma vez por sessão (cache em memória +
 * sessionStorage), usando `head: true` para não trafegar dados.
 */

import { supabase } from '@/lib/supabase';

export interface SchemaCapabilities {
  trainingProfiles: boolean;
  planProgramColumns: boolean;
  checkedAt: number;
}

export interface SchemaCapabilityResult {
  capabilities: SchemaCapabilities;
  /** true quando conseguimos falar com o banco (mesmo que falte schema). */
  reachable: boolean;
}

const STORAGE_KEY = 'athletix:schema-capabilities';
const CACHE_TTL = 5 * 60 * 1000;

let cache: SchemaCapabilityResult | null = null;
let inFlight: Promise<SchemaCapabilityResult> | null = null;

/** Erros do PostgREST/Postgres que significam "schema ainda não migrado". */
export function isMissingSchemaError(message: unknown): boolean {
  const text = typeof message === 'string' ? message : '';
  return /does not exist|schema cache|PGRST20[2458]|42P01|42703|undefined table|undefined column/i.test(text);
}

function readSessionCache(): SchemaCapabilityResult | null {
  if (typeof sessionStorage === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as SchemaCapabilities;
    if (!parsed || typeof parsed.checkedAt !== 'number') return null;
    if (Date.now() - parsed.checkedAt > CACHE_TTL) return null;

    return {
      capabilities: parsed,
      reachable: true,
    };
  } catch {
    return null;
  }
}

function writeSessionCache(capabilities: SchemaCapabilities) {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(capabilities));
  } catch {
    // Modo privado / cota cheia: cache em memória ainda funciona.
  }
}

async function probeTrainingProfiles(): Promise<boolean> {
  const { error } = await supabase
    .from('training_profiles')
    .select('user_id', { head: true, count: 'exact' })
    .limit(1);

  if (!error) return true;
  if (isMissingSchemaError(error.message)) return false;

  // Sem conexão ou sem sessão: não dá para afirmar que falta schema.
  throw error;
}

async function probePlanColumns(): Promise<boolean> {
  const { error } = await supabase
    .from('workout_plans')
    .select('id, program_id, metadata', { head: true })
    .limit(1);

  if (!error) return true;
  if (isMissingSchemaError(error.message)) return false;

  throw error;
}

/**
 * Resolve as capacidades. Nunca lança: em falha de rede assume o cenário mais
 * conservador (schema completo) para não degradar o app sem motivo.
 */
export async function getSchemaCapabilities(force = false): Promise<SchemaCapabilityResult> {
  if (!force) {
    if (cache && Date.now() - cache.capabilities.checkedAt < CACHE_TTL) return cache;

    const fromSession = readSessionCache();
    if (fromSession) {
      cache = fromSession;
      return fromSession;
    }
  }

  if (inFlight) return inFlight;

  inFlight = (async (): Promise<SchemaCapabilityResult> => {
    try {
      const [trainingProfiles, planProgramColumns] = await Promise.all([
        probeTrainingProfiles(),
        probePlanColumns(),
      ]);

      const capabilities: SchemaCapabilities = {
        trainingProfiles,
        planProgramColumns,
        checkedAt: Date.now(),
      };

      cache = { capabilities, reachable: true };
      writeSessionCache(capabilities);
      return cache;
    } catch {
      // Não sabemos → assume o schema completo e deixa o fluxo normal tratar
      // o erro (as mensagens específicas aparecem só quando o banco confirma).
      const capabilities: SchemaCapabilities = {
        trainingProfiles: true,
        planProgramColumns: true,
        checkedAt: Date.now(),
      };

      cache = { capabilities, reachable: false };
      return cache;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

/** Invalida o cache (chamado depois de aplicar a migração e recarregar). */
export function clearSchemaCapabilities() {
  cache = null;
  inFlight = null;
  if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(STORAGE_KEY);
}

export const MIGRATION_FILE = '20260201000000_training_profile.sql';
export const MIGRATION_URL = `/sql/${MIGRATION_FILE}`;

/** Caminho SQL completo, para copiar/baixar direto da interface. */
export async function fetchMigrationSql(): Promise<string> {
  const response = await fetch(MIGRATION_URL);
  if (!response.ok) throw new Error('Não foi possível carregar o arquivo SQL.');
  return response.text();
}
