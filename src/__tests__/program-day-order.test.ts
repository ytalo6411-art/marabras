import { describe, expect, it, vi, beforeEach } from 'vitest';
import { planDayReorder, reorderProgramDays } from '@/services/planPersistence';
import { groupPrograms } from '@/services/trainingOverview';
import type { WorkoutPlan } from '@/types/database';

/**
 * Reordenar dias precisa mudar o que está no banco, não só a ordem na tela.
 * Estes testes cobrem a permutação pura e o contrato de gravação — inclusive
 * o caso que importa: falha do servidor não pode ser reportada como sucesso.
 */

const updateEq = vi.fn();
const update = vi.fn(() => ({ eq: updateEq }));

vi.mock('@/lib/supabase', () => ({
  supabase: { from: vi.fn(() => ({ update })) },
  APP_URL: 'http://localhost:5173',
  isSupabaseConfigured: true,
  SUPABASE_URL: 'https://project.supabase.co',
  SUPABASE_ANON_KEY: 'anon-test',
}));

type Day = Pick<WorkoutPlan, 'id' | 'days_of_week'>;

const days: Day[] = [
  { id: 'a', days_of_week: [1] },
  { id: 'b', days_of_week: [3] },
  { id: 'c', days_of_week: [5] },
];

beforeEach(() => {
  vi.clearAllMocks();
  updateEq.mockResolvedValue({ error: null });
});

describe('permutação dos dias', () => {
  it('mover para baixo troca os slots de dia da semana', () => {
    const changes = planDayReorder(days, 0, 1);
    expect(changes).toEqual([
      { id: 'b', daysOfWeek: [1] },
      { id: 'a', daysOfWeek: [3] },
      { id: 'c', daysOfWeek: [5] },
    ]);
  });

  it('mover para cima é o inverso e mantém os mesmos slots', () => {
    const changes = planDayReorder(days, 2, 0);
    expect(changes).toEqual([
      { id: 'c', daysOfWeek: [1] },
      { id: 'a', daysOfWeek: [3] },
      { id: 'b', daysOfWeek: [5] },
    ]);
    // Nenhum dia da semana é criado nem perdido.
    expect(changes?.flatMap((c) => c.daysOfWeek).sort()).toEqual([1, 3, 5]);
  });

  it('movimento para a mesma posição não gera escrita', () => {
    expect(planDayReorder(days, 1, 1)).toBeNull();
  });

  it('índice fora do intervalo é recusado', () => {
    expect(planDayReorder(days, -1, 1)).toBeNull();
    expect(planDayReorder(days, 0, 3)).toBeNull();
    expect(planDayReorder([], 0, 0)).toBeNull();
  });

  it('programa sem dias da semana definidos não é reordenável', () => {
    const noDays: Day[] = [
      { id: 'a', days_of_week: [] },
      { id: 'b', days_of_week: [3] },
    ];
    expect(planDayReorder(noDays, 0, 1)).toBeNull();
  });

  it('preserva dias múltiplos no mesmo slot', () => {
    const multi: Day[] = [
      { id: 'a', days_of_week: [1, 2] },
      { id: 'b', days_of_week: [4] },
    ];
    expect(planDayReorder(multi, 0, 1)).toEqual([
      { id: 'b', daysOfWeek: [1, 2] },
      { id: 'a', daysOfWeek: [4] },
    ]);
  });

  it('a nova ordem é a que groupPrograms exibe depois de recarregar', () => {
    const changes = planDayReorder(days, 0, 1) ?? [];
    // Simula o reload: o banco devolve as linhas com os novos dias.
    const reloaded = days.map((day) => ({
      ...planRow(day.id),
      days_of_week: changes.find((c) => c.id === day.id)?.daysOfWeek ?? day.days_of_week,
    }));
    const [group] = groupPrograms(reloaded);
    expect(group?.plans.map((p) => p.id)).toEqual(['b', 'a', 'c']);
  });
});

describe('persistência da ordem', () => {
  it('grava apenas os dias cujo slot mudou', async () => {
    const result = await reorderProgramDays(days, 0, 1);
    expect(result.ok).toBe(true);
    // 'c' continua na sexta: não deve ser regravado.
    expect(update).toHaveBeenCalledTimes(2);
    expect(update).toHaveBeenCalledWith({ days_of_week: [1] });
    expect(update).toHaveBeenCalledWith({ days_of_week: [3] });
  });

  it('não declara sucesso quando o servidor recusa a gravação', async () => {
    updateEq.mockResolvedValue({ error: { message: 'permission denied' } });
    const result = await reorderProgramDays(days, 0, 1);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Recarregue/);
  });

  it('falha parcial também é reportada como falha', async () => {
    updateEq
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: 'network' } });
    const result = await reorderProgramDays(days, 0, 1);
    expect(result.ok).toBe(false);
  });

  it('movimento inválido não chega ao banco', async () => {
    const result = await reorderProgramDays(days, 1, 1);
    expect(result.ok).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });
});

function planRow(id: string): WorkoutPlan {
  return {
    id,
    user_id: 'user-1',
    name: `Dia ${id.toUpperCase()}`,
    description: null,
    focus: 'hypertrophy',
    modality: null,
    days_of_week: [],
    estimated_minutes: 45,
    is_active: true,
    is_template: false,
    program_id: 'prog-1',
    program_name: 'ABC',
    day_label: id.toUpperCase(),
    generated_by: 'rules',
    rationale: null,
    level: 'beginner',
    environment: 'gym',
    template_slug: null,
    metadata: {},
    created_at: '2026-11-01T00:00:00.000Z',
    updated_at: '2026-11-01T00:00:00.000Z',
  };
}
