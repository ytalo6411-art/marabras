#!/usr/bin/env node
/**
 * Aplica as migrações do ATHLETIX no Supabase SEM precisar da CLI.
 *
 * Usa a API de Management do Supabase (endpoint oficial de execução de query).
 * O token é lido de variável de ambiente — nunca fica no repositório e nunca é
 * impresso no terminal.
 *
 * ── Uso ──────────────────────────────────────────────────────────────────────
 *   # 1. Gere um Personal Access Token em
 *   #    https://supabase.com/dashboard/account/tokens
 *   #    (escopo de conta; não é a service_role, não vai para o navegador)
 *
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/apply-migrations.mjs \
 *     --project-ref tazszwllacwqccfjnglk
 *
 *   # Só conferir o que falta, sem executar:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/apply-migrations.mjs \
 *     --project-ref tazszwllacwqccfjnglk --check
 *
 *   # Aplicar um arquivo específico:
 *   ... --only 20260201
 *
 * ── Garantias ────────────────────────────────────────────────────────────────
 *  • Os arquivos são executados em ordem alfabética (nome = timestamp).
 *  • As migrações do projeto são idempotentes (`if not exists`,
 *    `drop ... if exists`), então reexecutar é seguro.
 *  • `--check` só faz SELECT em catálogo: não altera nada.
 *  • Em caso de erro, o script para e mostra o arquivo/trecho que falhou.
 */

import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const API = 'https://api.supabase.com/v1';
const MIGRATIONS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'supabase', 'migrations');

function parseArgs(argv) {
  const args = { check: false, dryRun: false, only: null, projectRef: null };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--check') args.check = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--self-test') args.selfTest = true;
    else if (arg === '--only') args.only = argv[++i] ?? null;
    else if (arg === '--project-ref') args.projectRef = argv[++i] ?? null;
    else if (arg.startsWith('--project-ref=')) args.projectRef = arg.split('=')[1];
    else if (arg.startsWith('--only=')) args.only = arg.split('=')[1];
    else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  args.projectRef = args.projectRef ?? process.env.SUPABASE_PROJECT_REF ?? null;
  return args;
}

function printHelp() {
  console.log(`ATHLETIX — aplicador de migrações (Management API)

  node scripts/apply-migrations.mjs --project-ref <ref> [--check] [--dry-run] [--only <prefixo>]

  node scripts/apply-migrations.mjs --self-test      # valida o divisor de comandos (offline)

Variáveis de ambiente:
  SUPABASE_ACCESS_TOKEN  obrigatório (Personal Access Token: supabase.com/dashboard/account/tokens)
  SUPABASE_PROJECT_REF   alternativa a --project-ref

O token NÃO é gravado, logado nem enviado a nenhum lugar além de api.supabase.com.`);
}

function redact(value) {
  if (!value) return value;
  return `${value.slice(0, 6)}…(${value.length} chars)`;
}

async function runQuery({ token, projectRef, query, signal }) {
  const response = await fetch(`${API}/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
    signal,
  });

  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }

  if (!response.ok) {
    const message =
      body?.message ?? body?.error ?? (typeof body?.raw === 'string' ? body.raw : `HTTP ${response.status}`);
    throw new Error(`${message} (HTTP ${response.status})`);
  }

  return body;
}

/**
 * Divide um arquivo SQL em comandos, respeitando blocos `$$ … $$` (funções
 * PL/pgSQL), strings com escape e comentários. Usado só como fallback, quando o
 * servidor recusa múltiplos comandos em uma requisição.
 */
export function splitStatements(sql) {
  const statements = [];
  let current = '';
  let index = 0;

  while (index < sql.length) {
    const char = sql[index];
    const next = sql[index + 1];

    // Comentário de linha
    if (char === '-' && next === '-') {
      const end = sql.indexOf('\n', index);
      const stop = end === -1 ? sql.length : end + 1;
      current += sql.slice(index, stop);
      index = stop;
      continue;
    }

    // Comentário de bloco
    if (char === '/' && next === '*') {
      const end = sql.indexOf('*/', index + 2);
      const stop = end === -1 ? sql.length : end + 2;
      current += sql.slice(index, stop);
      index = stop;
      continue;
    }

    // Bloco dollar-quoted ($$ … $$ / $tag$ … $tag$)
    if (char === '$') {
      const match = /^\$[A-Za-z_]*\$/.exec(sql.slice(index));
      if (match) {
        const delimiter = match[0];
        const end = sql.indexOf(delimiter, index + delimiter.length);
        const stop = end === -1 ? sql.length : end + delimiter.length;
        current += sql.slice(index, stop);
        index = stop;
        continue;
      }
    }

    // String literal com aspas simples (suporta '' como escape)
    if (char === "'") {
      let cursor = index + 1;
      while (cursor < sql.length) {
        if (sql[cursor] === "'" && sql[cursor + 1] === "'") {
          cursor += 2;
          continue;
        }
        if (sql[cursor] === "'") {
          cursor += 1;
          break;
        }
        cursor += 1;
      }
      current += sql.slice(index, cursor);
      index = cursor;
      continue;
    }

    if (char === ';') {
      const statement = current.trim();
      if (statement && !/^\s*$/.test(statement)) statements.push(statement);
      current = '';
      index += 1;
      continue;
    }

    current += char;
    index += 1;
  }

  const tail = current.trim();
  if (tail) statements.push(tail);

  return statements.filter((statement) => {
    const withoutComments = statement
      .replace(/--[^\n]*/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim();
    return withoutComments.length > 0;
  });
}

async function readMigrations(only) {
  const files = (await readdir(MIGRATIONS_DIR)).filter((file) => file.endsWith('.sql')).sort();
  const filtered = only ? files.filter((file) => file.startsWith(only)) : files;

  return Promise.all(
    filtered.map(async (file) => ({
      file,
      sql: await readFile(path.join(MIGRATIONS_DIR, file), 'utf8'),
    })),
  );
}

/** Inspeção do estado real do banco (somente leitura). */
async function inspect({ token, projectRef }) {
  const query = `
    select
      to_regclass('public.training_profiles') is not null as has_training_profiles,
      exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'workout_plans' and column_name = 'program_id'
      ) as has_program_id,
      exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'workout_plans' and column_name = 'metadata'
      ) as has_metadata,
      (select count(*) from public.exercises where is_active) as active_exercises;
  `;

  const result = await runQuery({ token, projectRef, query });
  const row = Array.isArray(result) ? result[0] : (result?.result ?? result);
  return row ?? {};
}

function printInspection(row) {
  const check = (value) => (value === true ? '✔ aplicado' : '✘ ausente');

  console.log('');
  console.log('  Estado do banco:');
  console.log(`    training_profiles .......... ${check(row.has_training_profiles)}`);
  console.log(`    workout_plans.program_id ... ${check(row.has_program_id)}`);
  console.log(`    workout_plans.metadata ..... ${check(row.has_metadata)}`);
  if (row.active_exercises !== undefined && row.active_exercises !== null) {
    const count = Number(row.active_exercises);
    console.log(
      `    exercícios ativos .......... ${count > 0 ? `${count} ✔` : '0 ✘ (rode npm run seed:exercises)'}`,
    );
  }
  console.log('');
}

async function applyFile({ token, projectRef, file, sql }) {
  const query = `${sql}\n`;

  try {
    await runQuery({ token, projectRef, query });
    return { ok: true, mode: 'single-request' };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    // Alguns planos/proxies recusam múltiplos comandos por requisição.
    if (!/multiple commands|cannot insert multiple|syntax error at or near "create"/i.test(message)) {
      throw error;
    }

    const statements = splitStatements(sql);
    console.log(`    ↳ executando em ${statements.length} comandos separados…`);

    for (const [index, statement] of statements.entries()) {
      try {
        await runQuery({ token, projectRef, query: `${statement};` });
      } catch (statementError) {
        const detail = statementError instanceof Error ? statementError.message : String(statementError);
        throw new Error(`${file} falhou no comando ${index + 1}:\n${detail}\n\nTrecho:\n${statement.slice(0, 500)}`);
      }
    }

    return { ok: true, mode: 'split' };
  }
}

/**
 * Teste offline do divisor de comandos.
 *
 * Garante que blocos PL/pgSQL (`$$ … $$`), strings com `''` e comentários não
 * são cortados no meio — é exatamente o que quebraria a aplicação da migração
 * quando o servidor exige um comando por requisição.
 */
export function selfTest() {
  const cases = [
    {
      name: 'função PL/pgSQL com $$ não é dividida',
      sql: `create function f() returns void as $$ begin perform 1; end $$ language plpgsql;`,
      expected: 1,
    },
    {
      name: 'função com $$ e ; dentro do corpo',
      sql: `create function g() returns void as $$
begin
  update t set a = 1 where b = 2;
  delete from t where b = 3;
end;
$$ language plpgsql;
select 1;`,
      expected: 2,
    },
    {
      name: 'string com ponto e vírgula e aspas escapadas',
      sql: `insert into t values ('a;b', 'it''s; ok'); select 2;`,
      expected: 2,
    },
    {
      name: 'comentários de linha e bloco são preservados sem virar comando',
      sql: `-- comentário; com ponto e vírgula
/* bloco; com ponto e vírgula */
select 1;`,
      expected: 1,
    },
  ];

  let failures = 0;

  for (const testCase of cases) {
    const statements = splitStatements(testCase.sql);
    const ok = statements.length === testCase.expected;
    if (!ok) failures += 1;
    console.log(`${ok ? '✔' : '✘'} ${testCase.name} (${statements.length}/${testCase.expected})`);
  }

  if (failures > 0) {
    console.error(`\n✘ ${failures} caso(s) falharam.`);
    process.exit(1);
  }

  console.log('\n✔ Divisor de comandos validado.');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.selfTest) {
    selfTest();
    return;
  }

  const token = process.env.SUPABASE_ACCESS_TOKEN;

  if (!token) {
    console.error('✘ Defina SUPABASE_ACCESS_TOKEN (Personal Access Token do Supabase).');
    console.error('  https://supabase.com/dashboard/account/tokens');
    process.exit(1);
  }

  if (!args.projectRef) {
    console.error('✘ Informe o projeto com --project-ref <ref> (ou SUPABASE_PROJECT_REF).');
    process.exit(1);
  }

  console.log(`ATHLETIX — project-ref ${args.projectRef} · token ${redact(token)}`);

  const before = await inspect({ token, projectRef: args.projectRef }).catch((error) => {
    console.error(`✘ Não foi possível consultar o projeto: ${error.message}`);
    console.error('  Verifique o ref e se o token tem permissão na conta dona do projeto.');
    process.exit(1);
  });

  printInspection(before);

  if (args.check) {
    const pending = !before.has_training_profiles || !before.has_program_id || !before.has_metadata;
    console.log(pending ? '→ Há migração pendente. Rode sem --check para aplicar.' : '→ Schema em dia.');
    return;
  }

  const migrations = await readMigrations(args.only);
  if (migrations.length === 0) {
    console.error('✘ Nenhum arquivo de migração encontrado para o filtro informado.');
    process.exit(1);
  }

  for (const migration of migrations) {
    if (args.dryRun) {
      console.log(`• [dry-run] ${migration.file} (${migration.sql.length} bytes)`);
      continue;
    }

    process.stdout.write(`• aplicando ${migration.file} … `);
    try {
      const result = await applyFile({
        token,
        projectRef: args.projectRef,
        file: migration.file,
        sql: migration.sql,
      });
      console.log(result.mode === 'split' ? 'ok (comandos separados)' : 'ok');
    } catch (error) {
      console.log('falhou');
      console.error(`\n✘ ${error instanceof Error ? error.message : String(error)}\n`);
      console.error('  Nada foi publicado pelo app. Rode novamente após corrigir:');
      console.error('  as migrações usam "if not exists", então reexecutar é seguro.');
      process.exit(1);
    }
  }

  if (args.dryRun) return;

  const after = await inspect({ token, projectRef: args.projectRef });
  printInspection(after);

  const done = after.has_training_profiles && after.has_program_id && after.has_metadata;
  console.log(done ? '✔ Migração aplicada. O app já pode salvar o perfil de treino.' : '⚠ Ainda falta algo — confira as mensagens acima.');
}

// Só executa quando chamado direto (`node scripts/apply-migrations.mjs`).
// Isso permite importar `splitStatements` nos testes sem disparar o script.
const invokedDirectly =
  process.argv[1] !== undefined && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (invokedDirectly) {
  main().catch((error) => {
    console.error(`✘ Erro inesperado: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
}
