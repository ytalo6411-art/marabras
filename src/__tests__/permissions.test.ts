import { describe, it, expect, beforeAll } from 'vitest';
import { supabase } from '@/lib/supabase';

/**
 * Testes de permissão/RLS contra a API REST real do Supabase.
 *
 * Usa a chave anônima (publishable). Como as políticas de RLS são aplicadas
 * no banco, um cliente anônimo não consegue ler dados de terceiros — e é
 * exatamente isso que estes testes verificam.
 *
 * IMPORTANTE: o projeto do Supabase precisa ser alcançável a partir do
 * ambiente de execução. Em sandboxes com egress restrito a rede o teste
 * é detectado como indisponível e pulado (sem falhar a suíte), com um
 * aviso explícito no console.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let reachable = false;

beforeAll(async () => {
  if (!SUPABASE_URL || !ANON_KEY) {
    console.warn(
      '[permissões] VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY ausentes — testes de RLS pulados.',
    );
    return;
  }

  // Probe curto: se a rede estiver bloqueada, aborta em vez de estourar timeout.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/exercise_categories?select=id&limit=1`, {
      headers: { apikey: ANON_KEY },
      signal: controller.signal,
    });
    reachable = res.ok;
    if (!reachable) {
      console.warn(`[permissões] Supabase respondeu ${res.status} — testes de RLS pulados.`);
    }
  } catch {
    console.warn(
      '[permissões] Supabase inacessível a partir deste ambiente (rede bloqueada?) — testes de RLS pulados.',
    );
  } finally {
    clearTimeout(timer);
  }
}, 15_000);

describe('RLS — isolamento de dados', () => {
  it('não expõe perfis de outros usuários para um cliente anônimo', async () => {
    if (!reachable) return;

    const { data, error } = await supabase.from('profiles').select('id').limit(5);

    if (error) {
      expect(error.code).toMatch(/42501|403|PGRST301/i);
    } else {
      expect(data ?? []).toEqual([]);
    }
  });

  it('não permite listar registros de treino de terceiros', async () => {
    if (!reachable) return;

    const { data, error } = await supabase.from('workout_sessions').select('id').limit(5);

    if (error) {
      expect(error.code).toMatch(/42501|403|PGRST301/i);
    } else {
      expect(data ?? []).toEqual([]);
    }
  });

  it('não permite ler o diário alimentar de terceiros', async () => {
    if (!reachable) return;

    const { data, error } = await supabase.from('food_diary').select('id').limit(5);

    if (error) {
      expect(error.code).toMatch(/42501|403|PGRST301/i);
    } else {
      expect(data ?? []).toEqual([]);
    }
  });

  it('não permite ler a tabela de administradores', async () => {
    if (!reachable) return;

    const { data, error } = await supabase.from('admin_users').select('user_id').limit(5);

    if (error) {
      expect(error.code).toMatch(/42501|403|PGRST301/i);
    } else {
      expect(data ?? []).toEqual([]);
    }
  });

  it('não permite ler o log de auditoria', async () => {
    if (!reachable) return;

    const { data, error } = await supabase.from('audit_logs').select('id').limit(5);

    if (error) {
      expect(error.code).toMatch(/42501|403|PGRST301/i);
    } else {
      expect(data ?? []).toEqual([]);
    }
  });
});

describe('RLS — escrita protegida', () => {
  it('recusa INSERT de perfil em nome de outro usuário', async () => {
    if (!reachable) return;

    const { error } = await supabase.from('profiles').insert({
      id: '00000000-0000-0000-0000-000000000000',
      full_name: 'Teste Invasão',
    });

    expect(error).not.toBeNull();
  });

  it('recusa DELETE na tabela de exercícios', async () => {
    if (!reachable) return;

    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', '00000000-0000-0000-0000-000000000000');

    expect(error).not.toBeNull();
  });
});

describe('catálogo público de exercícios', () => {
  it('permite listar exercises ativos para leitura anônima', async () => {
    if (!reachable) return;

    const { error } = await supabase
      .from('exercises')
      .select('id')
      .eq('is_active', true)
      .limit(1);

    expect(error).toBeNull();
  });

  it('permite listar as categorias de exercício', async () => {
    if (!reachable) return;

    const { data, error } = await supabase
      .from('exercise_categories')
      .select('id, name')
      .limit(20);

    expect(error).toBeNull();
    expect((data ?? []).length).toBeGreaterThan(0);
  });

  it('as 13 categorias esperadas estão semeadas', async () => {
    if (!reachable) return;

    const { data, error } = await supabase.from('exercise_categories').select('id');

    expect(error).toBeNull();
    expect((data ?? []).length).toBe(13);
  });
});
