import { describe, expect, it, beforeEach, afterAll } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { vi } from 'vitest';
import seed from '../../supabase/seed/exercises.json';
import namesPt from '../data/exerciseNamesPt.json';
import contentPt from '../data/exerciseContentPt.json';
import { FALLBACK_EXERCISES } from '@/data/exerciseFallback';
import { getExerciseBySlug, importExercise } from '@/services/exercises';
import { writeLocale, getLocale } from '@/i18n/runtime';

/**
 * Regressão do problema relatado: só os NOMES dos exercícios estavam em
 * português. `steps`, `breathing` e `common_mistakes` continuavam em inglês,
 * então o iniciante via o título traduzido e a execução em outro idioma.
 *
 * Estes testes travam três coisas que podem regredir silenciosamente:
 *   1. a cobertura e a integridade das traduções (aridade igual à fonte);
 *   2. a migration gerada estar em sincronia com o JSON revisado — ela já
 *      ficou obsoleta no disco enquanto o JSON avançava;
 *   3. a seleção de idioma e o fallback, além do import não sobrescrever
 *      uma tradução revisada com o original em inglês da API.
 */

interface PtEntry {
  description: string;
  steps: string[];
  breathing: string;
  commonMistakes: string[];
}

const translations = contentPt as Record<string, PtEntry>;
const names = namesPt as { slug: string; name_en: string; name_pt: string }[];

function source(slug: string) {
  const row = seed.find((r) => r.slug === slug);
  if (!row) throw new Error(`slug ausente no seed: ${slug}`);
  return row;
}

function translation(slug: string): PtEntry {
  const entry = translations[slug];
  if (!entry) throw new Error(`slug sem tradução: ${slug}`);
  return entry;
}

/** Mesmos estrangeirismos aceitos pelo script gerador (nomes de aparelho). */
const LOANWORDS = /\b(leg\s+press|stiff|crossover|burpee|smith|scott)\b/gi;
const ENGLISH_MARKERS =
  /\b(the|your|with|and|then|while|keep|hold|lower|raise|press|pull|push|bend|stand|sit|place|return|repeat|squeeze|shoulders|chest|elbows|knees|hips|back|arms|legs|feet|hands)\b/i;
const NON_LATIN = /[^\u0020-\u024F\u2000-\u206F\u20A0-\u20CF]/;

function fieldsOf(slug: string): [string, string][] {
  const tr = translation(slug);
  return [
    ['description', tr.description],
    ['breathing', tr.breathing],
    ...tr.steps.map((v, i): [string, string] => [`steps[${i}]`, v]),
    ...tr.commonMistakes.map((v, i): [string, string] => [`commonMistakes[${i}]`, v]),
  ];
}

describe('cobertura pt-BR do catálogo de exercícios', () => {
  it('traduz todos os exercícios do seed', () => {
    const missing = seed.filter((r) => !translations[r.slug]).map((r) => r.slug);
    expect(missing).toEqual([]);
    expect(Object.keys(translations)).toHaveLength(seed.length);
  });

  it('não contém slug que não existe no catálogo', () => {
    const known = new Set(seed.map((r) => r.slug));
    expect(Object.keys(translations).filter((s) => !known.has(s))).toEqual([]);
  });

  it('preserva a quantidade de passos e de erros comuns da fonte', () => {
    const wrong = seed.flatMap((row) => {
      const tr = translation(row.slug);
      const issues: string[] = [];
      if (tr.steps.length !== row.steps.length) {
        issues.push(`${row.slug}.steps: ${tr.steps.length} vs ${row.steps.length}`);
      }
      if (tr.commonMistakes.length !== row.common_mistakes.length) {
        issues.push(`${row.slug}.commonMistakes: ${tr.commonMistakes.length} vs ${row.common_mistakes.length}`);
      }
      return issues;
    });
    expect(wrong).toEqual([]);
  });

  it('não deixa campo vazio nem cópia idêntica do inglês', () => {
    const problems: string[] = [];
    for (const row of seed) {
      const tr = translation(row.slug);
      const pairs: [string, string, string][] = [
        ['description', tr.description, row.description],
        ['breathing', tr.breathing, row.breathing],
        ...tr.steps.map((v, i): [string, string, string] => [`steps[${i}]`, v, row.steps[i] ?? '']),
        ...tr.commonMistakes.map((v, i): [string, string, string] => [
          `commonMistakes[${i}]`, v, row.common_mistakes[i] ?? '',
        ]),
      ];
      for (const [field, value, original] of pairs) {
        if (!value.trim()) problems.push(`${row.slug}.${field}: vazio`);
        if (value.trim() === original.trim()) problems.push(`${row.slug}.${field}: igual ao inglês`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('usa apenas o alfabeto latino (nenhum token de outro idioma colado)', () => {
    const problems = seed.flatMap((row) =>
      fieldsOf(row.slug)
        .filter(([, value]) => NON_LATIN.test(value))
        .map(([field, value]) => `${row.slug}.${field}: ${value.slice(0, 60)}`),
    );
    expect(problems).toEqual([]);
  });

  it('não deixa inglês residual nas frases', () => {
    const problems = seed.flatMap((row) =>
      fieldsOf(row.slug)
        .filter(([, value]) => ENGLISH_MARKERS.test(value.replace(LOANWORDS, '')))
        .map(([field, value]) => `${row.slug}.${field}: ${value.slice(0, 60)}`),
    );
    expect(problems).toEqual([]);
  });
});

describe('migration de conteúdo pt-BR', () => {
  const dir = join(process.cwd(), 'supabase/migrations');
  const file = '20261103020000_exercise_content_pt.sql';
  const sql = readFileSync(join(dir, file), 'utf8');
  const q = (value: string) => `'${value.replace(/'/g, "''")}'`;

  it('roda depois da migration que cria as colunas de idioma', () => {
    const locales = readdirSync(dir).find((f) => f.endsWith('_exercise_content_locales.sql'));
    expect(locales).toBeTruthy();
    expect(locales! < file).toBe(true);
  });

  it('está em sincronia com o JSON revisado (não obsoleta)', () => {
    const slugs = [...sql.matchAll(/^where slug = '(.+)';$/gm)].map((m) => m[1]);
    expect(slugs).toHaveLength(seed.length);
    expect(new Set(slugs).size).toBe(seed.length);
    expect(slugs.filter((s) => !translations[s ?? ''])).toEqual([]);

    // Cada bloco precisa refletir exatamente o texto revisado.
    const blocks = sql.split('update public.exercises set\n').slice(1);
    expect(blocks).toHaveLength(seed.length);
    const stale: string[] = [];
    for (const block of blocks) {
      const slug = block.match(/where slug = '(.+)';/)?.[1] ?? '';
      const tr = translation(slug);
      if (!block.includes(`description = ${q(tr.description)},`)) stale.push(`${slug}.description`);
      if (!block.includes(`breathing = ${q(tr.breathing)},`)) stale.push(`${slug}.breathing`);
      if (!block.includes(`instructions = ${q(tr.steps.join('\n'))},`)) stale.push(`${slug}.instructions`);
      if (!block.includes('content_pt_ready = true')) stale.push(`${slug}.content_pt_ready`);
      for (const step of tr.steps) {
        if (!block.includes(q(step))) stale.push(`${slug}.steps`);
      }
      for (const mistake of tr.commonMistakes) {
        if (!block.includes(q(mistake))) stale.push(`${slug}.commonMistakes`);
      }
    }
    expect([...new Set(stale)]).toEqual([]);
  });

  it('é transacional e não apaga linhas', () => {
    expect(sql).toMatch(/^begin;$/m);
    expect(sql).toMatch(/^commit;$/m);
    expect(sql).not.toMatch(/\bdelete\s+from\b/i);
    expect(sql).not.toMatch(/\bdrop\s+(table|column)\b/i);
  });
});

/* ── Seleção de idioma, fallback e import ───────────────────────────────────── */

interface Builder {
  select: (columns?: string) => Builder;
  eq: () => Builder;
  upsert: (payload: Record<string, unknown>) => Builder;
  maybeSingle: () => Promise<{ data: unknown; error: null }>;
  single: () => Promise<{ data: unknown; error: null }>;
}

const db = {
  row: null as Record<string, unknown> | null,
  existingId: null as string | null,
  upserted: null as Record<string, unknown> | null,
};

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => {
      let columns = '*';
      const builder: Builder = {
        select: (requested = '*') => { columns = requested; return builder; },
        eq: () => builder,
        upsert: (payload) => { db.upserted = payload; return builder; },
        maybeSingle: async () => ({
          data: columns === 'id' ? (db.existingId ? { id: db.existingId } : null) : db.row,
          error: null,
        }),
        single: async () => ({ data: { id: 'new-id' }, error: null }),
      };
      return builder;
    },
  },
}));

/** Um slug real do catálogo que não é interceptado pelo fallback local. */
const fallbackSlugs = new Set(FALLBACK_EXERCISES.map((e) => e.slug));
const SLUG = seed.find((r) => !fallbackSlugs.has(r.slug))?.slug ?? '';

function dbRow(translated: boolean): Record<string, unknown> {
  const row = source(SLUG);
  const tr = translation(SLUG);
  const namePt = names.find((n) => n.slug === SLUG)?.name_pt ?? row.name;
  return {
    id: '11111111-1111-4111-8111-111111111111',
    slug: SLUG,
    name: translated ? namePt : row.name,
    name_en: row.name,
    primary_muscle: row.primary_muscle,
    secondary_muscles: row.secondary_muscles,
    equipment: row.equipment,
    difficulty: row.difficulty,
    description: translated ? tr.description : null,
    description_en: row.description,
    instructions: translated ? tr.steps.join('\n') : null,
    instructions_en: row.instructions,
    steps: translated ? tr.steps : null,
    steps_en: row.steps,
    breathing: translated ? tr.breathing : null,
    breathing_en: row.breathing,
    common_mistakes: translated ? tr.commonMistakes : null,
    common_mistakes_en: row.common_mistakes,
    content_pt_ready: translated,
    source: 'free_exercise_db',
    is_active: true,
  };
}

const initialLocale = getLocale();

beforeEach(() => {
  db.row = dbRow(true);
  db.existingId = null;
  db.upserted = null;
  writeLocale('pt-BR');
});

afterAll(() => writeLocale(initialLocale));

describe('seleção de idioma do conteúdo', () => {
  it('entrega passos, respiração e erros em pt-BR', async () => {
    const result = await getExerciseBySlug(SLUG);
    const tr = translation(SLUG);
    expect(result?.steps).toEqual(tr.steps);
    expect(result?.breathing).toBe(tr.breathing);
    expect(result?.commonMistakes).toEqual(tr.commonMistakes);
    expect(result?.description).toBe(tr.description);
    expect(result?.contentPtReady).toBe(true);
  });

  it('entrega o nome original quando o idioma é inglês', async () => {
    writeLocale('en');
    const result = await getExerciseBySlug(SLUG);
    const row = source(SLUG);
    expect(result?.name).toBe(row.name);
    expect(result?.steps).toEqual(row.steps);
    expect(result?.breathing).toBe(row.breathing);
    expect(result?.commonMistakes).toEqual(row.common_mistakes);
  });

  it('cai no original quando a tradução ainda não existe, sem inventar texto', async () => {
    db.row = dbRow(false);
    const result = await getExerciseBySlug(SLUG);
    const row = source(SLUG);
    expect(result?.steps).toEqual(row.steps);
    expect(result?.breathing).toBe(row.breathing);
    expect(result?.contentPtReady).toBe(false);
  });

  it('não anuncia tradução revisada para conteúdo ainda em inglês', async () => {
    db.row = dbRow(false);
    writeLocale('pt-BR');
    const result = await getExerciseBySlug(SLUG);
    expect(result?.contentPtReady).toBe(false);
    expect(result?.inDatabase).toBe(true);
  });
});

describe('importação de exercício externo', () => {
  it('reusa o registro existente em vez de sobrescrever a tradução revisada', async () => {
    db.existingId = 'existing-id';
    const id = await importExercise({
      key: 'external-1',
      slug: SLUG,
      name: source(SLUG).name,
      primaryMuscle: 'pectoralis_major',
      secondaryMuscles: [],
      equipment: ['bodyweight'],
      difficulty: 'beginner',
      description: source(SLUG).description,
      instructions: source(SLUG).instructions,
      source: 'wger',
      inDatabase: false,
    });
    expect(id).toBe('existing-id');
    expect(db.upserted).toBeNull();
  });

  it('marca conteúdo novo como não traduzido e preserva o original', async () => {
    const id = await importExercise({
      key: 'external-2',
      slug: 'wger-999999',
      name: 'Brand New Movement',
      primaryMuscle: 'pectoralis_major',
      secondaryMuscles: [],
      equipment: ['bodyweight'],
      difficulty: 'beginner',
      description: 'An English description.',
      instructions: 'Do the movement.',
      steps: ['Stand up.', 'Move.'],
      breathing: 'Breathe out.',
      commonMistakes: ['Rushing.'],
      source: 'wger',
      inDatabase: false,
    });
    expect(id).toBe('new-id');
    expect(db.upserted?.content_pt_ready).toBe(false);
    expect(db.upserted?.description_en).toBe('An English description.');
    expect(db.upserted?.instructions_en).toBe('Do the movement.');
    expect(db.upserted?.steps_en).toEqual(['Stand up.', 'Move.']);
    expect(db.upserted?.breathing_en).toBe('Breathe out.');
    expect(db.upserted?.common_mistakes_en).toEqual(['Rushing.']);
  });
});
