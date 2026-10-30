#!/usr/bin/env node
/**
 * Script de seed do catálogo de exercícios.
 *
 * Fonte: Free Exercise DB with Videos (MIT)
 *   https://github.com/harshvishu/free-exercise-db-with-videos
 *   317 exercícios · 593 vídeos demonstrativos (masculino e feminino)
 *
 * O que este script faz:
 *  1. Baixa o `data/exercises.json` da fonte.
 *  2. Normaliza os campos para o esquema `public.exercises` (enums do banco).
 *  3. Agrupa os exercícios nas 13 categorias de músculo do ATHLETIX.
 *  4. Gera SQL idempotente (`ON CONFLICT (slug) DO UPDATE`) em
 *     `supabase/seed/exercises.sql`.
 *
 * Os vídeos NÃO são baixados para o Supabase Storage: as URLs apontam para
 * o CDN público da fonte e o player carrega sob demanda (requisito do
 * projeto: não baixar todos os vídeos para o storage).
 *
 * Uso:
 *   node scripts/seed-exercises.mjs                 # gera supabase/seed/exercises.sql
 *   node scripts/seed-exercises.mjs --stdout        # imprime o SQL
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const SOURCE_URL =
  process.env.EXERCISES_SOURCE_URL ||
  'https://raw.githubusercontent.com/harshvishu/free-exercise-db-with-videos/main/data/exercises.json';
const SOURCE_REPO = 'https://github.com/harshvishu/free-exercise-db-with-videos';
const SOURCE_LICENSE = 'MIT';

/* ────────────────────────────────────────────────────────────────────────────
   Mapeamentos
   ──────────────────────────────────────────────────────────────────────────── */

/** equipment → enum `equipment` do banco. */
const EQUIPMENT = {
  'body weight': 'bodyweight',
  band: 'band',
  barbell: 'barbell',
  cable: 'cable',
  dumbbell: 'dumbbell',
  'ez barbell': 'barbell',
  kettlebell: 'kettlebell',
  'leverage machine': 'machine',
  rope: 'band',
  'sled machine': 'machine',
  'smith machine': 'machine',
  'stability ball': 'bench',
  weighted: 'bench',
  none: 'none',
  bodyweight: 'bodyweight',
  bench: 'bench',
  'medicine ball': 'medicine_ball',
  'foam roller': 'foam_roller',
  'pull-up bar': 'pullup_bar',
};

/**
 * Mapeia o grupo muscular para as 13 categorias do ATHLETIX.
 * A categoria é a "região" principal; o músculo alvo fica em primary_muscle.
 */
/**
 * Mapeia o grupo muscular da fonte para o `slug` de uma das 13 categorias
 * do ATHLETIX. A categoria é a região principal; o músculo alvo fica em
 * `primary_muscle`.
 */
const CATEGORY_BY_TARGET = [
  ['chest', 'chest'],
  ['pectoral', 'chest'],
  ['back', 'back'],
  ['shoulder', 'shoulders'],
  ['deltoid', 'shoulders'],
  ['biceps', 'biceps'],
  ['triceps', 'triceps'],
  ['forearm', 'triceps'],
  ['glute', 'glutes'],
  ['hamstring', 'hamstrings'],
  ['quadriceps', 'quads'],
  ['calf', 'calves'],
  ['abdominal', 'abs'],
  ['oblique', 'abs'],
  ['trap', 'back'],
  ['lat', 'back'],
  ['rhomboid', 'back'],
  ['spinal', 'back'],
  ['erector', 'back'],
  ['cardiovascular', 'cardio'],
  ['full body', 'cardio'],
  ['neck', 'shoulders'],
  ['calf', 'calves'],
  ['gastrocnemius', 'calves'],
  ['soleus', 'calves'],
  ['tibialis', 'calves'],
  ['adductors', 'quads'],
  ['abductors', 'glutes'],
  ['stretch', 'stretching'],
  ['mobility', 'stretching'],
];

function categoryFor(target) {
  const t = (target ?? '').toLowerCase();
  for (const [needle, category] of CATEGORY_BY_TARGET) {
    if (t.includes(needle)) return category;
  }
  return 'cardio';
}

function normalizeMuscle(raw) {
  if (!raw) return '';
  const map = {
    abs: 'abdominals',
    abdominals: 'abdominals',
    'rectus abdominis': 'rectus_abdominis',
    obliques: 'obliques',
    'lower abs': 'abdominals',
    'lower abdominals': 'abdominals',
    'transverse abdominis': 'transverse_abdominis',
    delts: 'deltoids',
    deltoids: 'deltoids',
    'anterior deltoid': 'anterior_deltoid',
    'posterior deltoid': 'posterior_deltoid',
    'rear deltoids': 'posterior_deltoid',
    'anterior deltoids': 'anterior_deltoid',
    'posterior deltoids': 'posterior_deltoid',
    traps: 'traps',
    trapezius: 'traps',
    'upper trapezius': 'traps',
    'middle trapezius': 'traps',
    'lower trapezius': 'traps',
    lats: 'lats',
    'latissimus dorsi': 'lats',
    'middle back': 'middle_back',
    'upper back': 'upper_back',
    rhomboids: 'rhomboids',
    rhoboids: 'rhomboids',
    'spinal erectors': 'erector_spinae',
    erectors: 'erector_spinae',
    'erector spinae': 'erector_spinae',
    'spine erectors': 'erector_spinae',
    spine: 'erector_spinae',
    pectorals: 'pectoralis_major',
    'pectoralis major': 'pectoralis_major',
    'upper pectorals': 'upper_pectoralis',
    'upper chest': 'upper_pectoralis',
    'upper pectorals': 'upper_pectoralis',
    biceps: 'biceps',
    'biceps brachii': 'biceps',
    brachialis: 'brachialis',
    triceps: 'triceps',
    'triceps brachii': 'triceps',
    forearms: 'forearms',
    'forearm extensors': 'forearms',
    'flexor carpi radialis': 'forearms',
    'flexor carpi ulnaris': 'forearms',
    brachioradialis: 'forearms',
    'core': 'core',
    'core stabilizers': 'core',
    quads: 'quadriceps',
    quadriceps: 'quadriceps',
    'rectus femoris': 'quadriceps',
    'vastus medialis': 'quadriceps',
    glutes: 'glutes',
    'gluteus maximus': 'glutes',
    'gluteus medius': 'gluteus_medius',
    'gluteus minimus': 'gluteus_minimus',
    hamstrings: 'hamstrings',
    calves: 'calves',
    gastrocnemius: 'gastrocnemius',
    soleus: 'soleus',
    tibialis: 'tibialis_anterior',
    'ankle stabilizers': 'ankle_stabilizers',
    'lower back': 'lower_back',
    adductors: 'adductors',
    abductors: 'abductors',
    'hip flexors': 'hip_flexors',
    iliopsoas: 'hip_flexors',
    piriformis: 'piriformis',
    'tensor fasciae latae': 'tensor_fasciae_latae',
    'serratus anterior': 'serratus_anterior',
    'rotator cuff': 'rotator_cuff',
    infraspinatus: 'infraspinatus',
    'teres major': 'teres_major',
    rhomboid: 'rhomboids',
    'upper pectorals': 'upper_pectoralis',
  };
  const key = raw.toLowerCase().trim();
  return map[key] ?? key.replace(/[^a-z0-9]+/g, '_');
}

/** difficulty → enum `difficulty_level`. */
const DIFFICULTY = {
  beginner: 'beginner',
  intermediate: 'intermediate',
  advanced: 'advanced',
};

/** Slug estável e único. */
function slugify(name, id) {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-${id}`;
}

/** Escapa uma string para literal SQL. */
function sqlText(value) {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

/** Escapa um array de texto para literal SQL. */
function sqlTextArray(values) {
  if (!values || values.length === 0) return "'{}'::text[]";
  const items = values.map((v) => sqlText(v)).join(', ');
  return `ARRAY[${items}]::text[]`;
}

/* ────────────────────────────────────────────────────────────────────────────
   Execução
   ──────────────────────────────────────────────────────────────────────────── */

async function main() {
  const stdout = process.argv.includes('--stdout');

  console.log(`Baixando catálogo de ${SOURCE_URL} …`);
  let raw;
  if (SOURCE_URL.startsWith('file://')) {
    // Permite usar uma cópia local do catálogo (ex.: ambiente sem egress).
    const { readFile } = await import('node:fs/promises');
    const path = fileURLToPath(SOURCE_URL);
    raw = JSON.parse(await readFile(path, 'utf8'));
  } else {
    const res = await fetch(SOURCE_URL);
    if (!res.ok) {
      throw new Error(`Falha ao baixar o catálogo: HTTP ${res.status}`);
    }
    raw = await res.json();
  }
  console.log(`Recebidos ${raw.length} exercícios.`);

  // Normaliza.
  const rows = raw.map((e) => {
    const category = categoryFor(e.target);
    const equipment = EQUIPMENT[(e.equipment ?? '').toLowerCase()] ?? 'bodyweight';
    const primary = normalizeMuscle(e.target) || 'full_body';
    const secondary = [
      ...new Set(
        (e.secondaryMuscles ?? [])
          .map(normalizeMuscle)
          .filter((m) => m && m !== primary),
      ),
    ];

    return {
      slug: slugify(e.name, e.id),
      name: e.name,
      description: e.shortDescription ?? null,
      instructions: e.instructions ?? null,
      steps: e.steps ?? [],
      breathing: e.breathing ?? null,
      common_mistakes: e.commonMistakes ?? [],
      difficulty: DIFFICULTY[(e.difficulty ?? '').toLowerCase()] ?? 'beginner',
      primary_muscle: primary,
      secondary_muscles: secondary,
      equipment: [equipment],
      category,
      video_url: e.videos?.male ?? e.videos?.female ?? null,
      video_url_female: e.videos?.female ?? null,
      thumbnail_url: e.thumbnails?.male ?? e.thumbnails?.female ?? null,
      source_url: `${SOURCE_REPO}/blob/main/data/exercises.json`,
      attribution: 'Free Exercise DB with Videos',
      license: SOURCE_LICENSE,
    };
  });

  // Relatório.
  const byCategory = {};
  for (const r of rows) byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
  console.log('\nDistribuição por categoria:');
  for (const [cat, count] of Object.entries(byCategory).sort()) {
    console.log(`  ${cat.padEnd(24)} ${count}`);
  }
  console.log(`\nCom vídeo: ${rows.filter((r) => r.video_url).length}/${rows.length}`);

  // Gera o SQL.
  const lines = [];
  lines.push('-- ─────────────────────────────────────────────────────────────────');
  lines.push('-- Seed do catálogo de exercícios — ATHLETIX V2');
  lines.push('-- Gerado por scripts/seed-exercises.mjs (NÃO edite à mão).');
  lines.push('--');
  lines.push(`-- Fonte: ${SOURCE_REPO}`);
  lines.push(`-- Licença: ${SOURCE_LICENSE} — ${rows.length} exercícios`);
  lines.push('--');
  lines.push('-- Os vídeos são referenciados por URL pública e carregados sob demanda.');
  lines.push('-- Nada é enviado ao Supabase Storage.');
  lines.push('-- ─────────────────────────────────────────────────────────────────');
  lines.push('');
  lines.push('BEGIN;');
  lines.push('');

  for (const r of rows) {
    lines.push(
      `INSERT INTO public.exercises (slug, name, description, instructions, steps, breathing, common_mistakes, difficulty, primary_muscle, secondary_muscles, equipment, category_id, video_url, thumbnail_url, source_url, attribution, license, source, is_active)`,
    );
    lines.push(
      `VALUES (${sqlText(r.slug)}, ${sqlText(r.name)}, ${sqlText(r.description)}, ${sqlText(r.instructions)}, ${sqlTextArray(r.steps)}, ${sqlText(r.breathing)}, ${sqlTextArray(r.common_mistakes)}, ${sqlText(r.difficulty)}::difficulty_level, ${sqlText(r.primary_muscle)}, ${sqlTextArray(r.secondary_muscles)}, ${sqlTextArray(r.equipment)}, (SELECT id FROM public.exercise_categories WHERE slug = ${sqlText(r.category)}), ${sqlText(r.video_url)}, ${sqlText(r.thumbnail_url)}, ${sqlText(r.source_url)}, ${sqlText(r.attribution)}, ${sqlText(r.license)}, 'free_exercise_db'::source_type, true)`,
    );
    lines.push(
      `ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, instructions = EXCLUDED.instructions, steps = EXCLUDED.steps, breathing = EXCLUDED.breathing, common_mistakes = EXCLUDED.common_mistakes, difficulty = EXCLUDED.difficulty, primary_muscle = EXCLUDED.primary_muscle, secondary_muscles = EXCLUDED.secondary_muscles, equipment = EXCLUDED.equipment, category_id = EXCLUDED.category_id, video_url = EXCLUDED.video_url, thumbnail_url = EXCLUDED.thumbnail_url, updated_at = now();`,
    );
    lines.push('');
  }

  lines.push('COMMIT;');
  lines.push('');

  const sql = lines.join('\n');

  if (stdout) {
    process.stdout.write(sql);
    return;
  }

  const outPath = resolve(ROOT, 'supabase/seed/exercises.sql');
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, sql, 'utf8');
  console.log(`\nSQL gravado em supabase/seed/exercises.sql (${rows.length} exercícios).`);
}

main().catch((err) => {
  console.error('Falha ao gerar o seed:', err.message);
  process.exit(1);
});
