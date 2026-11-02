import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CatalogExercise } from '@/services/catalog';
import { findAlternatives } from '@/services/catalog';
import type { PlanGenerationProfile } from '@/services/planGenerator';
import { BASE_PROFILE, testCatalog } from './plan-generator.test';

/**
 * Regressão do terceiro bug real, encontrado pela matriz de perfis.
 *
 * `findAlternatives` aceitava um substituto se QUALQUER equipamento dele
 * existisse no perfil (`.some`). "Supino com barra e banco" entrava como
 * alternativa para quem só tem banco; a validação do plano, que exige TODOS
 * (`.every`), então recusava o programa inteiro com "Alternativa incompatível
 * com o perfil" — 173 combinações da matriz falhavam.
 *
 * A troca manual (Coach → trocar exercício) tinha a mesma regra frouxa na tela
 * e nenhuma na persistência: dava para gravar exercício sem equipamento, acima
 * do nível (inclusive advanced para menor de 18) ou contraindicado.
 */

const update = vi.fn();
const eq = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: { from: () => ({ update: (payload: unknown) => ({ eq: (col: string, val: string) => eq(payload, col, val) }) }) },
}));

vi.mock('@/services/dbCapabilities', () => ({
  getSchemaCapabilities: async () => ({ planProgramColumns: true }),
}));

function ex(over: Partial<CatalogExercise> & { id: string; name: string }): CatalogExercise {
  return {
    slug: over.id,
    primaryMuscle: 'pectoralis_major',
    secondaryMuscles: [],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    pattern: 'push_horizontal',
    instructions: 'Execução controlada.',
    source: 'manual',
    inDatabase: true,
    ...over,
  };
}

describe('findAlternatives: equipamento precisa estar todo disponível', () => {
  const target = ex({ id: 'target', name: 'Supino reto', equipment: ['barbell', 'bench'] });

  it('não oferece exercício que exige equipamento ausente', () => {
    const needsBarbell = ex({ id: 'needs-barbell', name: 'Supino inclinado', equipment: ['barbell', 'bench'] });
    const result = findAlternatives(target, [target, needsBarbell], { equipment: ['bench', 'bodyweight'] });
    expect(result.map((e) => e.id)).not.toContain('needs-barbell');
  });

  it('oferece substituto realmente executável', () => {
    const doable = ex({ id: 'pushup', name: 'Flexão de braço', equipment: ['bodyweight'] });
    const benchOnly = ex({ id: 'bench-press-db', name: 'Supino com halteres', equipment: ['dumbbell', 'bench'] });
    const result = findAlternatives(target, [target, doable, benchOnly], {
      equipment: ['bodyweight', 'dumbbell', 'bench'],
    });
    expect(result.map((e) => e.id).sort()).toEqual(['bench-press-db', 'pushup']);
  });

  it('peso do corpo está sempre disponível, mesmo com perfil vazio', () => {
    const pushup = ex({ id: 'pushup', name: 'Flexão', equipment: ['bodyweight'] });
    expect(findAlternatives(target, [target, pushup], { equipment: [] }).map((e) => e.id)).toEqual(['pushup']);
  });

  it('mantém as demais regras: mesmo padrão, nível permitido, sem o próprio exercício', () => {
    const squat = ex({ id: 'squat', name: 'Agachamento', pattern: 'squat' });
    const advanced = ex({ id: 'adv', name: 'Avançado', difficulty: 'advanced' });
    const ok = ex({ id: 'ok', name: 'Ok' });
    const result = findAlternatives(target, [target, squat, advanced, ok], {
      equipment: ['bodyweight'],
      difficulties: ['beginner'],
    });
    expect(result.map((e) => e.id)).toEqual(['ok']);
  });

  it('toda alternativa devolvida passa na regra da validação do plano', () => {
    // A propriedade que faltava: gerar e validar usam a MESMA regra.
    const equipment = ['bodyweight', 'dumbbell', 'bench'];
    const pool = [
      target,
      ex({ id: 'a', name: 'A', equipment: ['barbell'] }),
      ex({ id: 'b', name: 'B', equipment: ['dumbbell', 'bench'] }),
      ex({ id: 'c', name: 'C', equipment: ['cable'] }),
      ex({ id: 'd', name: 'D', equipment: ['bodyweight'] }),
    ];
    for (const alt of findAlternatives(target, pool, { equipment })) {
      const missing = alt.equipment.filter((e) => e !== 'bodyweight' && !equipment.includes(e));
      expect(missing, alt.name).toEqual([]);
    }
  });
});

describe('replacePlanExercise valida antes de gravar', () => {
  beforeEach(() => {
    update.mockReset();
    eq.mockReset();
    eq.mockResolvedValue({ error: null });
  });

  const profile = (): PlanGenerationProfile => ({
    ...BASE_PROFILE,
    equipment: ['bodyweight', 'bench'],
    level: 'beginner',
  });

  async function swap(exercise: CatalogExercise, over: Partial<PlanGenerationProfile> = {}) {
    const { replacePlanExercise } = await import('@/services/planPersistence');
    return replacePlanExercise({
      itemId: 'item-1',
      exercise,
      profile: { ...profile(), ...over },
      intensity: 'moderate',
    });
  }

  it('recusa exercício que exige equipamento indisponível, sem gravar', async () => {
    const result = await swap(ex({ id: 'x', name: 'Com barra', equipment: ['barbell'] }));
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/equipamento/i);
    expect(eq).not.toHaveBeenCalled();
  });

  it('recusa exercício acima do nível do iniciante, sem gravar', async () => {
    const result = await swap(ex({ id: 'x', name: 'Difícil', difficulty: 'intermediate' }));
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/nível/i);
    expect(eq).not.toHaveBeenCalled();
  });

  it('menor de idade não recebe advanced nem pela troca manual', async () => {
    const result = await swap(
      ex({ id: 'x', name: 'Avançado', difficulty: 'advanced' }),
      { level: 'advanced', ageRange: '16_17' },
    );
    expect(result.ok).toBe(false);
    expect(eq).not.toHaveBeenCalled();
  });

  it('respeita a lista de exercícios que o usuário pediu para evitar', async () => {
    const result = await swap(
      ex({ id: 'x', name: 'Agachamento livre', primaryMuscle: 'quadriceps', pattern: 'squat' }),
      { avoidedExercises: ['Agachamento livre'] },
    );
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/limitaç/i);
    expect(eq).not.toHaveBeenCalled();
  });

  it('respeita limitações físicas: joelho sensível recusa salto', async () => {
    const result = await swap(
      ex({ id: 'jump', name: 'Salto no caixote', primaryMuscle: 'quadriceps', pattern: 'squat' }),
      { limitations: ['knee'] },
    );
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/limitaç/i);
    expect(eq).not.toHaveBeenCalled();
  });

  it('respeita limitações físicas: ombro sensível recusa desenvolvimento', async () => {
    const result = await swap(
      ex({ id: 'press', name: 'Desenvolvimento militar', pattern: 'push_vertical', primaryMuscle: 'deltoids' }),
      { limitations: ['shoulder'] },
    );
    expect(result.ok).toBe(false);
    expect(eq).not.toHaveBeenCalled();
  });

  it('grava quando o exercício é compatível', async () => {
    const result = await swap(ex({ id: 'ok', name: 'Flexão', equipment: ['bodyweight'] }));
    expect(result.ok).toBe(true);
    expect(eq).toHaveBeenCalledTimes(1);
    const [payload, column, value] = eq.mock.calls[0]!;
    expect(column).toBe('id');
    expect(value).toBe('item-1');
    expect(payload).toMatchObject({ exercise_id: 'ok' });
  });

  it('troca para menor de idade não prescreve faixa de força máxima', async () => {
    const result = await swap(
      ex({ id: 'ok', name: 'Flexão', equipment: ['bodyweight'] }),
      { ageRange: '16_17', goal: 'strength', level: 'intermediate' },
    );
    expect(result.ok).toBe(true);
    const payload = eq.mock.calls[0]![0] as { sets: number; reps: string };
    expect(payload.sets).toBeLessThanOrEqual(3);
    expect(payload.reps).not.toBe('4–6');
  });

  it('usa o catálogo real: toda alternativa de todo exercício é executável', () => {
    const catalog = testCatalog();
    const equipment = ['bodyweight', 'band', 'dumbbell', 'bench'];
    for (const exercise of catalog) {
      for (const alt of findAlternatives(exercise, catalog, { equipment, limit: 3 })) {
        const missing = alt.equipment.filter((e) => e !== 'bodyweight' && !equipment.includes(e));
        expect(missing, `${exercise.name} -> ${alt.name}`).toEqual([]);
      }
    }
  });
});
