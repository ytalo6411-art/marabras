import { describe, it, expect } from 'vitest';
import { buildSessionInsert, sessionName } from '@/services/workoutSession';
import { databaseErrorMessage, isSchemaMissing, isPermissionDenied, isUniqueViolation } from '@/services/dbErrors';
import type { SessionExercise } from '@/services/workoutSession';

/**
 * Regressão do bug real de produção.
 *
 * "Não foi possível iniciar. Verifique os exercícios e a migração V10" NÃO era
 * problema de migração: `workout_sessions.name` é NOT NULL + CHECK sem default e
 * o insert não enviava `name`. O Postgres devolvia SQLSTATE 23502 e o catch
 * genérico culpava a V10, que estava aplicada.
 *
 * Reproduzido no banco real antes da correção:
 *   23502 | null value in column "name" of relation "workout_sessions"
 *           violates not-null constraint
 *
 * Estes testes travam os três campos que faltavam (name, status, started_at).
 * Sem eles, a sessão nascia 'planned', o progresso não sincronizava, a duração
 * fechava em 0 e complete_workout_session recusava com "Session is not active".
 */

const exercises = [
  { id: 'we-1', exercise_id: 'ex-1', sets: 3, exercise: { name: 'Agachamento' } },
] as unknown as SessionExercise[];

const base = { planId: 'plan-1', userId: 'user-1', planName: 'Treino A — Inferiores', exercises };

describe('abertura de sessão — campos obrigatórios do banco', () => {
  it('envia name (era a causa do SQLSTATE 23502)', () => {
    const payload = buildSessionInsert(base);
    expect(payload.name).toBe('Treino A — Inferiores');
    expect(payload.name.trim().length).toBeGreaterThan(0);
  });

  it('nasce in_progress, não no default planned', () => {
    // O default do banco é 'planned'; sem isto a sessão nunca ficava ativa.
    expect(buildSessionInsert(base).status).toBe('in_progress');
  });

  it('envia started_at para a duração não fechar em zero', () => {
    const payload = buildSessionInsert({ ...base, startedAt: '2026-11-02T12:00:00.000Z' });
    expect(payload.started_at).toBe('2026-11-02T12:00:00.000Z');
    expect(Number.isNaN(Date.parse(buildSessionInsert(base).started_at))).toBe(false);
  });

  it('preserva user_id, plan_id, snapshot e estado inicial', () => {
    const payload = buildSessionInsert(base);
    expect(payload.user_id).toBe('user-1');
    expect(payload.plan_id).toBe('plan-1');
    expect(payload.exercise_snapshot).toEqual(exercises);
    expect(payload.client_state).toEqual({ current: 0, restUntil: null, paused: false, remaining: 90 });
  });

  it('nunca envia total_volume_kg nem completed_at (calculados no servidor)', () => {
    const payload = buildSessionInsert(base);
    expect(payload).not.toHaveProperty('total_volume_kg');
    expect(payload).not.toHaveProperty('completed_at');
    expect(payload).not.toHaveProperty('duration_seconds');
  });
});

describe('sessionName — satisfaz NOT NULL + CHECK(length(trim(name))>0)', () => {
  it.each([
    ['Treino A', 'Treino A'],
    ['  Treino   B  ', 'Treino B'],
    ['', 'Treino'],
    ['   ', 'Treino'],
    [null, 'Treino'],
    [undefined, 'Treino'],
  ])('normaliza %j para %j', (input, expected) => {
    expect(sessionName(input as string | null | undefined)).toBe(expected);
  });

  it('limita o tamanho para não estourar o campo', () => {
    expect(sessionName('x'.repeat(500))).toHaveLength(120);
  });

  it('sempre produz nome não vazio após trim', () => {
    for (const value of ['', ' ', '\t\n', null, undefined]) {
      expect(sessionName(value as string | null).trim().length).toBeGreaterThan(0);
    }
  });
});

describe('mensagens de erro — a causa real não é escondida', () => {
  it('23502 não é relatado como migração pendente', () => {
    const message = databaseErrorMessage(
      { code: '23502', message: 'null value in column "name" violates not-null constraint' },
      'fallback',
    );
    expect(message).not.toMatch(/V10|migração/i);
    expect(message).toMatch(/obrigatório/i);
  });

  it('só fala de schema quando o banco confirma que falta tabela/coluna', () => {
    expect(isSchemaMissing({ code: '42P01' })).toBe(true);
    expect(isSchemaMissing({ code: 'PGRST205' })).toBe(true);
    expect(isSchemaMissing({ code: '23502' })).toBe(false);
    expect(databaseErrorMessage({ code: '42P01' }, 'x')).toMatch(/schema desatualizado/i);
  });

  it('distingue RLS de dado inválido', () => {
    expect(isPermissionDenied({ code: '42501' })).toBe(true);
    expect(databaseErrorMessage({ code: '42501' }, 'x')).toMatch(/permissão/i);
  });

  it('reconhece escrita concorrente para reaproveitar a sessão existente', () => {
    expect(isUniqueViolation({ code: '23505' })).toBe(true);
    expect(isUniqueViolation({ code: '23502' })).toBe(false);
  });

  it('erro de rede diz que nada foi perdido, sem culpar migração', () => {
    const message = databaseErrorMessage({ message: 'Failed to fetch' }, 'x');
    expect(message).toMatch(/conexão/i);
    expect(message).not.toMatch(/V10/i);
  });

  it('erro desconhecido usa o fallback em vez de inventar diagnóstico', () => {
    expect(databaseErrorMessage({ code: 'XX999' }, 'Não foi possível iniciar.')).toBe('Não foi possível iniciar.');
  });

  it('não vaza nome de coluna ou constraint para a tela', () => {
    const message = databaseErrorMessage({ code: '23502', message: 'column "name" of relation "workout_sessions"' }, 'x');
    expect(message).not.toContain('workout_sessions');
    expect(message).not.toContain('23502');
  });
});
