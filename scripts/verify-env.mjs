#!/usr/bin/env node
/**
 * Verifica se as variáveis de ambiente obrigatórias estão presentes.
 *
 * Uso:
 *   node scripts/verify-env.mjs            # falha (exit 1) se algo obrigatório faltar
 *   node scripts/verify-env.mjs --warn-only # apenas avisa (usado no postinstall)
 *
 * Nunca imprime valores de segredos — apenas nomes e status.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const isWarnOnly = process.argv.includes('--warn-only');

/**
 * Carrega o arquivo .env para process.env.
 *
 * O Vite já faz isso por conta própria ao buildar, mas este script roda
 * isolado (npm run verify-env, postinstall) e sem o Vite no meio — sem esta
 * etapa ele reportaria falso negativo mesmo com o .env correto em disco.
 */
function loadEnvFile(path) {
  let raw;
  try {
    raw = readFileSync(path, 'utf8');
  } catch {
    return; // sem .env — segue com o ambiente do processo
  }

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    if (!key || key in process.env) continue; // já definido no ambiente tem prioridade

    let value = trimmed.slice(eq + 1).trim();
    // remove aspas envolventes, se houver
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length > 1) ||
      (value.startsWith("'") && value.endsWith("'") && value.length > 1)
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadEnvFile(resolve(process.cwd(), '.env'));

/** Variáveis obrigatórias para o app funcionar. */
const REQUIRED = [
  ['VITE_SUPABASE_URL', 'URL do projeto Supabase (Settings → API → Project URL)'],
  ['VITE_SUPABASE_ANON_KEY', 'Chave anon pública do Supabase (Settings → API → anon public)'],
];

/**
 * Variáveis opcionais. Ausência não quebra o app, mas desabilita a feature.
 */
const OPTIONAL = [
  ['VITE_OPENFOODFACTS_BASE_URL', 'Base da API Open Food Facts (padrão já embutido)'],
  ['VITE_WGER_BASE_URL', 'Base da API wger (padrão já embutido)'],
  ['VITE_USDA_BASE_URL', 'Base da API USDA FoodData Central (padrão já embutido)'],
  ['VITE_FREEEXERCISEDB_BASE_URL', 'Base do Free Exercise DB (padrão já embutido)'],
  ['VITE_BARCODE_DETECTOR_BASE_URL', 'Endpoint de detecção de código de barras (opcional)'],
  ['VITE_APP_URL', 'URL pública do app (usada nos callbacks OAuth e PWA)'],
];

const env = process.env;

let missingRequired = 0;

console.log('\n  ATHLETIX — verificação de ambiente\n  ' + '─'.repeat(52));

for (const [key, hint] of REQUIRED) {
  const present = Boolean(env[key] && env[key].trim());
  if (!present) missingRequired++;
  console.log(`  ${present ? '✓' : '✗'} ${key.padEnd(34)} ${present ? 'configurado' : `AUSENTE — ${hint}`}`);
}

for (const [key, hint] of OPTIONAL) {
  const present = Boolean(env[key] && env[key].trim());
  console.log(`  ${present ? '✓' : '·'} ${key.padEnd(34)} ${present ? 'configurado' : `opcional — ${hint}`}`);
}

console.log('  ' + '─'.repeat(52));

if (missingRequired === 0) {
  console.log('  Tudo certo. Pode iniciar: npm run dev\n');
  process.exit(0);
}

const message = `Faltam ${missingRequired} variável(is) obrigatória(s). Copie .env.example para .env e preencha.`;

if (isWarnOnly) {
  console.log(`  ⚠ ${message}\n  (aviso apenas — continuing)\n`);
  process.exit(0);
}

console.error(`  ✗ ${message}\n`);
process.exit(1);
