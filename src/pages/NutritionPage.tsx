import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import { useToast, Button, Card, EmptyState, SkeletonList } from '@/components/ui';
import { IconPlus, IconWater, IconTrash, IconBarcode, IconSearch } from '@/components/icons';
import { todayISO, formatNumber } from '@/utils/format';
import type { FoodDiary, MealEntry, MealType } from '@/types/database';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Café da manhã',
  lunch: 'Almoço',
  dinner: 'Jantar',
  snack: 'Lanche',
  pre_workout: 'Pré-treino',
  post_workout: 'Pós-treino',
};

const MEAL_ORDER: MealType[] = [
  'breakfast',
  'pre_workout',
  'lunch',
  'snack',
  'post_workout',
  'dinner',
];

/**
 * Diário alimentar.
 *
 * Registro de refeições com valores congelados no momento do lançamento
 * (se a fonte corrigir o dado, o histórico não muda retroativamente).
 */
export default function NutritionPage() {
  const { user, preferences } = useAuthStore();
  const toast = useToast();

  const [date, setDate] = useState(todayISO());
  const [diary, setDiary] = useState<FoodDiary | null>(null);
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerMeal, setPickerMeal] = useState<MealType | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<
    { key: string; name: string; calories: number; proteinG: number; source: string }[]
  >([]);
  const [searching, setSearching] = useState(false);

  async function load() {
    if (!user) return;
    setLoading(true);
    try {
      const { data: diaryRow } = await supabase
        .from('food_diary')
        .select('*')
        .eq('user_id', user.id)
        .eq('entry_date', date)
        .maybeSingle();

      if (!diaryRow) {
        // Cria o diário do dia se ainda não existir.
        const { data: created } = await supabase
          .from('food_diary')
          .insert({ user_id: user.id, entry_date: date })
          .select()
          .single();
        setDiary(created);
        setEntries([]);
        return;
      }

      setDiary(diaryRow);
      const { data: mealRows } = await supabase
        .from('meal_entries')
        .select('*')
        .eq('diary_id', diaryRow.id)
        .order('created_at', { ascending: true });

      setEntries(mealRows ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, user]);

  // Busca de alimentos com debounce.
  useEffect(() => {
    if (!pickerMeal) return;

    const timer = window.setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setSearching(true);
      try {
        const { searchFoods } = await import('@/services/nutrition');
        const foods = await searchFoods({ query, limit: 12 });
        setResults(
          foods.map((f) => ({
            key: f.key,
            name: f.brand ? `${f.name} — ${f.brand}` : f.name,
            calories: f.calories,
            proteinG: f.proteinG,
            source: f.source,
          })),
        );
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query, pickerMeal]);

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein_g,
      carbs: acc.carbs + e.carbs_g,
      fat: acc.fat + e.fat_g,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const calorieTarget = preferences?.daily_calorie_target ?? null;

  async function addFood(name: string, calories: number, proteinG: number) {
    if (!diary || !pickerMeal) return;
    try {
      await supabase.from('meal_entries').insert({
        diary_id: diary.id,
        meal_type: pickerMeal,
        quantity: 1,
        calories,
        protein_g: proteinG,
        carbs_g: 0,
        fat_g: 0,
        food_name: name,
        source: 'manual',
        eaten_at: new Date().toISOString(),
      });
      toast.show('Alimento registrado', 'success');
      await load();
    } catch {
      toast.show('Não foi possível registrar.', 'error');
    }
  }

  async function removeEntry(entryId: string) {
    await supabase.from('meal_entries').delete().eq('id', entryId);
    await load();
  }

  return (
    <>
      <h1 className="page-title">Nutrição</h1>
      <p className="page-subtitle">Diário alimentar e informações nutricionais.</p>

      {/* Seletor de data */}
      <div className="row row-wrap" style={{ marginBottom: 'var(--sp-4)' }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Data do diário"
          style={{ minHeight: 44, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0 12px', color: 'var(--text)' }}
        />
        {date !== todayISO() && (
          <Button variant="ghost" size="sm" onClick={() => setDate(todayISO())}>
            Hoje
          </Button>
        )}
      </div>

      {/* Totais */}
      <div className="stat-grid" style={{ marginBottom: 'var(--sp-5)' }}>
        <div className="stat">
          <div className="stat-label">Calorias</div>
          <div className="stat-value">{formatNumber(totals.calories)}</div>
          {calorieTarget && (
            <div className="stat-delta">meta: {calorieTarget} kcal</div>
          )}
        </div>
        <div className="stat">
          <div className="stat-label">Proteína</div>
          <div className="stat-value">{formatNumber(totals.protein)}g</div>
        </div>
        <div className="stat">
          <div className="stat-label">Carboidrato</div>
          <div className="stat-value">{formatNumber(totals.carbs)}g</div>
        </div>
        <div className="stat">
          <div className="stat-label">Gordura</div>
          <div className="stat-value">{formatNumber(totals.fat)}g</div>
        </div>
      </div>

      {loading ? (
        <SkeletonList count={3} height={90} />
      ) : (
        <div className="stack stack-3">
          {MEAL_ORDER.map((meal) => {
            const mealEntries = entries.filter((e) => e.meal_type === meal);
            if (mealEntries.length === 0 && meal !== 'breakfast') return null;

            return (
              <Card key={meal}>
                <div className="card-header">
                  <h2 className="card-title">{MEAL_LABELS[meal]}</h2>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setPickerMeal(pickerMeal === meal ? null : meal);
                      setQuery('');
                    }}
                  >
                    <IconPlus size={15} />
                    Adicionar
                  </Button>
                </div>

                {pickerMeal === meal && (
                  <div style={{ marginBottom: 'var(--sp-4)' }}>
                    <div className="input-group" style={{ marginBottom: 'var(--sp-3)' }}>
                      <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar alimento (USDA, Open Food Facts)…"
                        aria-label="Buscar alimento"
                        autoFocus
                        style={{ paddingLeft: 42 }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          left: 13,
                          display: 'grid',
                          placeItems: 'center',
                          color: 'var(--text-dim)',
                          pointerEvents: 'none',
                        }}
                      >
                        <IconSearch size={17} />
                      </span>
                    </div>

                    <div className="row row-wrap" style={{ marginBottom: 'var(--sp-2)' }}>
                      <Button variant="ghost" size="sm">
                        <IconBarcode size={15} />
                        Ler código de barras
                      </Button>
                    </div>

                    {searching ? (
                      <p className="text-sm text-muted">Buscando…</p>
                    ) : results.length > 0 ? (
                      <div className="stack stack-1" style={{ maxHeight: 260, overflowY: 'auto' }}>
                        {results.map((r) => (
                          <button
                            key={r.key}
                            type="button"
                            className="row-between"
                            onClick={() => addFood(r.name, r.calories, r.proteinG)}
                            style={{
                              padding: 'var(--sp-2) var(--sp-3)',
                              borderRadius: 'var(--r-sm)',
                              textAlign: 'left',
                              width: '100%',
                            }}
                          >
                            <span className="truncate">{r.name}</span>
                            <span className="badge">{formatNumber(r.calories)} kcal</span>
                          </button>
                        ))}
                      </div>
                    ) : query.trim() ? (
                      <p className="text-sm text-muted">
                        Nenhum resultado. Verifique a grafia ou cadastre manualmente.
                      </p>
                    ) : (
                      <p className="text-sm text-muted">
                        Digite o nome do alimento para buscar nas bases oficiais.
                      </p>
                    )}
                  </div>
                )}

                {mealEntries.length === 0 ? (
                  <p className="text-sm text-dim">Nada registrado.</p>
                ) : (
                  <ul className="stack stack-2">
                    {mealEntries.map((e) => (
                      <li key={e.id} className="row-between">
                        <div style={{ minWidth: 0 }}>
                          <div className="truncate" style={{ fontWeight: 600 }}>
                            {e.food_name}
                          </div>
                          <div className="text-xs text-muted">
                            {formatNumber(e.calories)} kcal · {formatNumber(e.protein_g)}g prot
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => removeEntry(e.id)}
                          aria-label={`Remover ${e.food_name}`}
                        >
                          <IconTrash size={15} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}

          {entries.length === 0 && (
            <EmptyState
              icon="🥗"
              title="Nenhum alimento registrado hoje"
              text="Registre suas refeições para acompanhar a evolução nutricional."
            />
          )}
        </div>
      )}

      <p className="text-xs text-dim" style={{ marginTop: 'var(--sp-5)' }}>
        <IconWater size={12} style={{ verticalAlign: '-2px' }} /> Dados nutricionais
        provenientes de USDA FoodData Central e Open Food Facts. Valores são
       informativos e não substituem acompanhamento nutricional profissional.
      </p>
    </>
  );
}
