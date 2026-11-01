/**
 * Constrói a migration de conteúdo pt-BR dos exercícios a partir de traduções
 * revisadas manualmente em `src/data/exerciseContentPt.json`.
 *
 * Regras (não negociáveis):
 *  - Nada de tradução composicional por palavra: cada frase foi traduzida lendo
 *    o movimento real. Aqui só validamos e serializamos.
 *  - `content_pt_ready = true` SOMENTE quando os 4 campos estão completos e com
 *    a mesma aridade da fonte. traduction partielle => flag false.
 *  - `instructions` é reconstruído a partir dos passos traduzidos (join '\n'),
 *    para que a busca em português e o fallback de renderização funcionem.
 *  - Os originais em inglês ficam preservados nas colunas `*_en`.
 *
 * Uso: node scripts/build-exercise-translations.mjs [--check]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const seed = JSON.parse(readFileSync(join(root, 'supabase/seed/exercises.json'), 'utf8'));
const ptPath = join(root, 'src/data/exerciseContentPt.json');
const pt = existsSync(ptPath) ? JSON.parse(readFileSync(ptPath, 'utf8')) : {};

const bySlug = new Map(seed.map((r) => [r.slug, r]));
const errors = [];
const ready = [];

/** Detecta inglês residual óbvio sem tentar ser um detector de idioma. */
const ENGLISH_MARKERS = /\b(the|your|with|and|then|while|keep|hold|lower|raise|press|pull|push|bend|stand|sit|place|return|repeat|squeeze|shoulders|chest|elbows|knees|hips|back|arms|legs|feet|hands)\b/i;

/**
 * Estrangeirismos já consolidados no português do Brasil de academia. Ficam de
 * fora do detector porque traduzi-los pioraria o conteúdo — e os nomes revisados
 * em `exerciseNamesPt.json` já usam essas formas ("Leg press com pés juntos").
 * Só entram aqui termos que são o nome do aparelho/exercício, nunca frases.
 */
const ACCEPTED_LOANWORDS = /\b(leg\s+press|stiff|crossover|burpee|smith|scott)\b/gi;

function checkString(slug, field, en, value) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    errors.push(`${slug}.${field}: tradução vazia`);
    return;
  }
  if (value.trim() === String(en).trim()) {
    errors.push(`${slug}.${field}: idêntico ao inglês ("${value.slice(0, 50)}")`);
  }
  const scannable = value.replace(ACCEPTED_LOANWORDS, '');
  if (ENGLISH_MARKERS.test(scannable)) {
    const hit = scannable.match(ENGLISH_MARKERS)?.[0];
    errors.push(`${slug}.${field}: possível inglês residual ("${hit}") em "${value.slice(0, 70)}"`);
  }
}

function checkArray(slug, field, source, values) {
  const src = source ?? [];
  if (!Array.isArray(values)) {
    errors.push(`${slug}.${field}: esperado array`);
    return;
  }
  if (values.length !== src.length) {
    errors.push(`${slug}.${field}: ${values.length} itens, fonte tem ${src.length}`);
    return;
  }
  values.forEach((v, i) => checkString(slug, `${field}[${i}]`, src[i], v));
}

for (const [slug, tr] of Object.entries(pt)) {
  const row = bySlug.get(slug);
  if (!row) { errors.push(`${slug}: slug não existe no seed`); continue; }
  const before = errors.length;
  checkString(slug, 'description', row.description, tr.description);
  checkArray(slug, 'steps', row.steps, tr.steps);
  checkString(slug, 'breathing', row.breathing, tr.breathing);
  checkArray(slug, 'commonMistakes', row.common_mistakes, tr.commonMistakes);
  if (errors.length === before) ready.push({ slug, row, tr });
}

const totalChars = ready.reduce((a, { tr }) =>
  a + tr.description.length + tr.breathing.length +
  tr.steps.join('').length + tr.commonMistakes.join('').length, 0);

console.log(`Traduções completas e válidas: ${ready.length}/${seed.length}`);
console.log(`Caracteres pt-BR: ${totalChars.toLocaleString('pt-BR')}`);
if (errors.length) {
  console.error(`\n${errors.length} problema(s):`);
  for (const e of errors.slice(0, 40)) console.error('  - ' + e);
  if (errors.length > 40) console.error(`  … e mais ${errors.length - 40}`);
}
if (process.argv.includes('--check')) {
  process.exit(errors.length ? 1 : 0);
}
if (errors.length) {
  console.error('\nMigration NÃO gerada: corrija os problemas acima.');
  process.exit(1);
}
if (!ready.length) { console.log('Nada a gerar.'); process.exit(0); }

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const arr = (xs) => `array[${xs.map(q).join(', ')}]::text[]`;

const lines = [
  '-- Conteúdo pt-BR revisado dos exercícios.',
  '-- Gerado por scripts/build-exercise-translations.mjs — não editar à mão.',
  '-- Os originais permanecem em *_en (ver 20261103010000_exercise_content_locales.sql).',
  '-- content_pt_ready=true apenas para linhas com os 4 campos completos e revisados.',
  '',
  'begin;',
  '',
];
for (const { slug, tr } of ready) {
  lines.push(
    `update public.exercises set`,
    `  description = ${q(tr.description)},`,
    `  steps = ${arr(tr.steps)},`,
    `  breathing = ${q(tr.breathing)},`,
    `  common_mistakes = ${arr(tr.commonMistakes)},`,
    `  instructions = ${q(tr.steps.join('\n'))},`,
    `  content_pt_ready = true`,
    `where slug = ${q(slug)};`,
    '',
  );
}
lines.push('commit;', '');

const out = join(root, 'supabase/migrations/20261103020000_exercise_content_pt.sql');
writeFileSync(out, lines.join('\n'));
console.log(`\nGerado: ${out} (${ready.length} exercícios)`);
