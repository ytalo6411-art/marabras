import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  addComment,
  blockAthlete,
  buildSnapshot,
  loadAthleteByHandle,
  loadMySaves,
  loadPublicProgress,
  loadSavedWorkouts,
  normalizeHandle,
  reportContent,
  resolveReport,
  toggleSave,
  validateHandle,
} from '@/services/community';
import { countExercises } from '@/data/community';
import { supabase } from '@/lib/supabase';
import type { PlanWithExercises } from '@/services/planPersistence';

/**
 * Mock encadeável do PostgREST. Cada método devolve o próprio builder e o
 * `then` resolve a resposta configurada, como o cliente real (que é thenable).
 * A autorização é do servidor — aqui testamos contrato, ordem e tratamento de
 * erro; o isolamento real está em scripts/test-security-database.mjs.
 */
type Response = { data?: unknown; error?: { message: string } | null };

const responses = new Map<string, Response>();
const chains = new Map<string, Record<string, ReturnType<typeof vi.fn>>>();

function chainFor(table: string) {
  const response = responses.get(table) ?? { data: [], error: null };
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const method of ['select', 'eq', 'in', 'order', 'limit', 'lt', 'or', 'insert', 'delete', 'update', 'upsert']) {
    chain[method] = vi.fn(() => chain);
  }
  chain.maybeSingle = vi.fn(() => Promise.resolve(response));
  chain.single = vi.fn(() => Promise.resolve(response));
  // Thenable: permite `await builder` sem método terminal.
  (chain as unknown as { then: unknown }).then = (resolve: (value: Response) => unknown) =>
    Promise.resolve(response).then(resolve);
  chains.set(table, chain);
  return chain;
}

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => chainFor(table)),
    rpc: vi.fn(),
  },
  APP_URL: 'http://localhost:5173',
  isSupabaseConfigured: true,
  SUPABASE_URL: 'https://project.supabase.co',
  SUPABASE_ANON_KEY: 'anon-test',
}));

const ME = '10000000-0000-4000-8000-000000000001';
const OTHER = '10000000-0000-4000-8000-000000000002';

beforeEach(() => {
  vi.clearAllMocks();
  responses.clear();
  chains.clear();
});

describe('handle do atleta', () => {
  it('normaliza acento, caixa e caracteres inválidos', () => {
    expect(normalizeHandle('  João_Silva!  ')).toBe('joao_silva');
    expect(normalizeHandle('Marina.Souza')).toBe('marinasouza');
  });

  it('recusa handle curto ou longo demais', () => {
    expect(validateHandle('ab')).toMatch(/3 a 30/);
    expect(validateHandle('a'.repeat(31))).toMatch(/3 a 30/);
    expect(validateHandle('marina_10k')).toBeNull();
  });
});

describe('snapshot publicado', () => {
  it('copia só o necessário e nunca carga pessoal, notas ou medidas', () => {
    const plans = [{
      id: 'plan-1',
      name: 'Treino A',
      day_label: 'A',
      exercises: [{
        id: 'item-1',
        name: 'Agachamento livre',
        slug: 'squat',
        sets: 3,
        reps: '8–12',
        rest_seconds: 90,
        primary_muscle: 'quadriceps',
        weight_kg: 80,
        notes: 'dor no joelho esquerdo',
      }],
    }] as unknown as PlanWithExercises[];

    const snapshot = buildSnapshot(plans);
    const serialized = JSON.stringify(snapshot);

    expect(snapshot.days).toHaveLength(1);
    expect(snapshot.days[0]?.exercises[0]).toEqual({
      name: 'Agachamento livre',
      slug: 'squat',
      sets: 3,
      reps: '8–12',
      restSeconds: 90,
      primaryMuscle: 'quadriceps',
    });
    // Nada de carga, nota privada ou identificação de conta no payload público.
    expect(serialized).not.toContain('weight_kg');
    expect(serialized).not.toContain('80');
    expect(serialized).not.toContain('joelho');
    expect(serialized).not.toContain('notes');
    expect(serialized).not.toContain(ME);
  });

  it('tolera plano sem exercícios sem inventar conteúdo', () => {
    const snapshot = buildSnapshot([
      { id: 'p', name: 'Vazio', day_label: null, exercises: [] },
    ] as unknown as PlanWithExercises[]);
    expect(snapshot.days[0]?.exercises).toEqual([]);
    expect(countExercises({ snapshot } as never)).toBe(0);
  });
});

describe('salvar treinos', () => {
  it('salva inserindo a própria linha e remove por workout + usuário', async () => {
    responses.set('workout_saves', { data: [], error: null });

    expect((await toggleSave('w1', ME, false)).ok).toBe(true);
    expect(chains.get('workout_saves')?.insert).toHaveBeenCalledWith({ workout_id: 'w1', user_id: ME });

    expect((await toggleSave('w1', ME, true)).ok).toBe(true);
    expect(chains.get('workout_saves')?.delete).toHaveBeenCalled();
    // Precisa dos dois filtros, senão apagaria saves de outros usuários.
    expect(chains.get('workout_saves')?.eq).toHaveBeenCalledWith('user_id', ME);
  });

  it('explica quando o treino deixou de estar visível, sem fingir sucesso', async () => {
    responses.set('workout_saves', { data: null, error: { message: 'row-level security' } });
    const result = await toggleSave('w1', ME, false);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/privado/i);
  });

  it('não consulta o banco para uma lista vazia de ids', async () => {
    const saved = await loadMySaves(ME, []);
    expect(saved.size).toBe(0);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('devolve apenas os ids que o servidor retornou', async () => {
    responses.set('workout_saves', { data: [{ workout_id: 'w2' }], error: null });
    const saved = await loadMySaves(ME, ['w1', 'w2']);
    expect(saved.has('w2')).toBe(true);
    expect(saved.has('w1')).toBe(false);
  });

  it('preserva a ordem de salvamento e omite o que ficou privado', async () => {
    responses.set('workout_saves', {
      data: [{ workout_id: 'w2' }, { workout_id: 'w1' }, { workout_id: 'w3' }],
      error: null,
    });
    // w3 não volta: tornou-se privado depois de salvo. Não deve aparecer quebrado.
    responses.set('shared_workouts', {
      data: [{ id: 'w1', user_id: OTHER, title: 'Um' }, { id: 'w2', user_id: OTHER, title: 'Dois' }],
      error: null,
    });
    responses.set('athlete_directory', {
      data: [{ user_id: OTHER, handle: 'marina', display_name: 'Marina' }],
      error: null,
    });

    const list = await loadSavedWorkouts(ME);
    expect(list.map((item) => item.id)).toEqual(['w2', 'w1']);
    expect(list[0]?.author?.display_name).toBe('Marina');
  });

  it('lista vazia não dispara consulta de treinos', async () => {
    responses.set('workout_saves', { data: [], error: null });
    expect(await loadSavedWorkouts(ME)).toEqual([]);
    expect(supabase.from).toHaveBeenCalledTimes(1);
  });
});

describe('perfil público do atleta', () => {
  it('normaliza o handle antes de buscar e não consulta handle vazio', async () => {
    expect(await loadAthleteByHandle('!!!')).toBeNull();
    expect(supabase.from).not.toHaveBeenCalled();

    responses.set('athlete_directory', {
      data: { user_id: OTHER, handle: 'marina', display_name: 'Marina' },
      error: null,
    });
    const athlete = await loadAthleteByHandle('  Marina  ');
    expect(athlete?.handle).toBe('marina');
    expect(chains.get('athlete_directory')?.eq).toHaveBeenCalledWith('handle', 'marina');
  });

  it('perfil invisível devolve null em vez de objeto vazio', async () => {
    responses.set('athlete_directory', { data: null, error: null });
    expect(await loadAthleteByHandle('privado')).toBeNull();
  });

  it('progresso público traz apenas contagens', async () => {
    responses.set('athlete_public_progress', {
      data: { user_id: OTHER, sessions_completed: 12, sessions_last_30d: 4, athlete_since: '2026-01-01' },
      error: null,
    });
    const progress = await loadPublicProgress(OTHER);
    expect(progress?.sessions_completed).toBe(12);
    expect(Object.keys(progress ?? {}).sort()).toEqual(
      ['athlete_since', 'sessions_completed', 'sessions_last_30d', 'user_id'].sort(),
    );
  });

  it('sem opt-in de progresso o servidor não devolve linha', async () => {
    responses.set('athlete_public_progress', { data: null, error: null });
    expect(await loadPublicProgress(OTHER)).toBeNull();
  });
});

describe('denúncias e moderação', () => {
  it('exige um alvo: treino ou atleta', async () => {
    const result = await reportContent({ reporterId: ME, reason: 'spam' });
    expect(result.ok).toBe(false);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('denuncia atleta sem treino associado', async () => {
    responses.set('content_reports', { data: [], error: null });
    const result = await reportContent({ reporterId: ME, reportedUserId: OTHER, reason: 'harassment' });
    expect(result.ok).toBe(true);
    expect(chains.get('content_reports')?.insert).toHaveBeenCalledWith(
      expect.objectContaining({ reported_user_id: OTHER, workout_id: null, reason: 'harassment' }),
    );
  });

  it('limita os detalhes a 500 caracteres', async () => {
    responses.set('content_reports', { data: [], error: null });
    await reportContent({ reporterId: ME, workoutId: 'w1', reason: 'other', details: 'x'.repeat(900) });
    const payload = chains.get('content_reports')?.insert?.mock.calls[0]?.[0] as { details: string } | undefined;
    expect(payload?.details).toHaveLength(500);
  });

  it('só confirma resolução quando o servidor devolve o próprio id', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: 'r1', error: null } as never);
    expect((await resolveReport('r1', 'reviewed', true)).ok).toBe(true);
    expect(supabase.rpc).toHaveBeenCalledWith('resolve_content_report', {
      p_report_id: 'r1',
      p_decision: 'reviewed',
      p_hide_content: true,
    });
  });

  it('não declara sucesso se o servidor recusar ou devolver id diferente', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: { message: 'not_authorized' } } as never);
    expect((await resolveReport('r1', 'reviewed', false)).ok).toBe(false);

    vi.mocked(supabase.rpc).mockResolvedValue({ data: 'outro-id', error: null } as never);
    expect((await resolveReport('r1', 'reviewed', false)).ok).toBe(false);
  });
});

describe('comentários e bloqueio', () => {
  it('recusa comentário vazio ou acima de 500 caracteres', async () => {
    expect((await addComment('w1', ME, '   ')).ok).toBe(false);
    expect((await addComment('w1', ME, 'x'.repeat(501))).ok).toBe(false);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('apara o comentário antes de enviar', async () => {
    responses.set('workout_comments', { data: [], error: null });
    expect((await addComment('w1', ME, '  Boa rotina!  ')).ok).toBe(true);
    expect(chains.get('workout_comments')?.insert).toHaveBeenCalledWith(
      expect.objectContaining({ body: 'Boa rotina!' }),
    );
  });

  it('não permite bloquear a si mesmo', async () => {
    const result = await blockAthlete(ME, ME);
    expect(result.ok).toBe(false);
    expect(supabase.from).not.toHaveBeenCalled();
  });
});