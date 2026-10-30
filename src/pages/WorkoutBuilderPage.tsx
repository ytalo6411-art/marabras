import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/components/useToast';
import { Button, Card, Field, Alert, EmptyState, ConfirmDialog } from '@/components/ui';
import { IconChevronLeft, IconPlus, IconTrash, IconPlay, IconSearch } from '@/components/icons';
import { WEEKDAY_LABELS } from '@/utils/format';
import type { WorkoutExercise, Exercise } from '@/types/database';

interface PlanExercise extends WorkoutExercise {
  exercise?: Exercise | null;
}

/**
 * Construtor de treino.
 *
 * Permite criar/editar um plano, escolher exercícios da biblioteca,
 * definir séries, repetições, carga, descanso e os dias da semana.
 */
export default function WorkoutBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuthStore();

  const isEditing = Boolean(id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [focus, setFocus] = useState('gym');
  const [days, setDays] = useState<number[]>([]);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | ''>('');

  const [items, setItems] = useState<PlanExercise[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const [candidates, setCandidates] = useState<Exercise[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);

  // Carrega o plano em edição.
  useEffect(() => {
    if (!id || !user) return;

    setLoading(true);
    Promise.all([
      supabase.from('workout_plans').select('*').eq('id', id).maybeSingle(),
      supabase.from('workout_exercises').select('*').eq('plan_id', id).order('position'),
    ])
      .then(([planRes, itemsRes]) => {
        if (planRes.data) {
          const p = planRes.data;
          setName(p.name);
          setDescription(p.description ?? '');
          setFocus(p.focus);
          setDays(p.days_of_week ?? []);
          setEstimatedMinutes(p.estimated_minutes ?? '');
        }
        setItems((itemsRes.data ?? []) as PlanExercise[]);
      })
      .finally(() => setLoading(false));
  }, [id, user]);

  // Ids dos exercícios usados — valor estável para o efeito abaixo.
  const exerciseIdsKey = useMemo(
    () => items.map((i) => i.exercise_id).filter(Boolean).join(','),
    [items],
  );

  // Carrega os detalhes dos exercícios usados.
  useEffect(() => {
    const exerciseIds = exerciseIdsKey ? exerciseIdsKey.split(',') : [];
    if (exerciseIds.length === 0) return;

    supabase
      .from('exercises')
      .select('*')
      .in('id', exerciseIds)
      .then(({ data }) => {
        const map = new Map((data ?? []).map((e) => [e.id, e]));
        setItems((prev) => prev.map((i) => ({ ...i, exercise: map.get(i.exercise_id) ?? null })));
      });
  }, [exerciseIdsKey]);

  // Busca candidatos no seletor.
  useEffect(() => {
    if (!pickerOpen) return;

    setCandidatesLoading(true);
    const timer = window.setTimeout(() => {
      let q = supabase.from('exercises').select('*').eq('is_active', true).limit(20);
      if (pickerQuery.trim()) q = q.ilike('name', `%${pickerQuery.trim()}%`);
      void q.then(
        ({ data }) => {
          setCandidates(data ?? []);
          setCandidatesLoading(false);
        },
        () => setCandidatesLoading(false),
      );
    }, 300);

    return () => window.clearTimeout(timer);
  }, [pickerOpen, pickerQuery]);

  function toggleDay(day: number) {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  async function addExercise(exercise: Exercise) {
    if (!user) return;

    let planId = id;

    // Se ainda não salvou o plano, salva agora para poder vincular exercícios.
    if (!planId) {
      const saved = await savePlan({ silent: true });
      if (!saved) return;
      planId = saved;
    }

    const position = items.length;
    const { data, error } = await supabase
      .from('workout_exercises')
      .insert({
        plan_id: planId,
        exercise_id: exercise.id,
        position,
        sets: 3,
        reps: '10',
        rest_seconds: 60,
      })
      .select()
      .single();

    if (error) {
      toast.show('Não foi possível adicionar o exercício.', 'error');
      return;
    }

    setItems((prev) => [...prev, { ...(data as PlanExercise), exercise }]);
    setPickerOpen(false);
    setPickerQuery('');
    toast.show(`${exercise.name} adicionado`, 'success');
  }

  async function updateItem(itemId: string, patch: Partial<WorkoutExercise>) {
    const previous = items;
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...patch } : i)));

    const { error } = await supabase.from('workout_exercises').update(patch).eq('id', itemId);

    if (error) {
      // Reverte o update otimista para a UI não mostrar um valor que não foi salvo.
      setItems(previous);
      toast.show('Não foi possível salvar essa alteração.', 'error');
    }
  }

  async function removeItem(itemId: string) {
    await supabase.from('workout_exercises').delete().eq('id', itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  /**
   * Salva o plano. Retorna o id do plano salvo.
   * `silent: true` não mostra toast (usado no fluxo de adicionar exercício).
   */
  async function savePlan(opts?: { silent?: boolean }): Promise<string | null> {
    if (!user) return null;
    if (!name.trim()) {
      toast.show('Dê um nome ao treino.', 'error');
      return null;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        focus,
        days_of_week: days,
        estimated_minutes: estimatedMinutes === '' ? null : Number(estimatedMinutes),
      };

      if (id) {
        const { error } = await supabase.from('workout_plans').update(payload).eq('id', id);
        if (error) throw error;
        if (!opts?.silent) toast.show('Treino salvo', 'success');
        return id;
      }

      const { data, error } = await supabase
        .from('workout_plans')
        .insert({ ...payload, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      if (!opts?.silent) toast.show('Treino criado', 'success');
      return data.id;
    } catch {
      toast.show('Não foi possível salvar o treino.', 'error');
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    const saved = await savePlan();
    if (saved && !id) navigate(`/app/workouts/${saved}`, { replace: true });
  }

  async function handleStartSession() {
    const saved = await savePlan({ silent: true });
    if (!saved) return;

    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: user!.id,
        plan_id: saved,
        name: name.trim(),
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      toast.show('Não foi possível iniciar a sessão.', 'error');
      return;
    }
    navigate(`/app/session/${data.id}`);
  }

  async function handleDelete() {
    if (!id) return;
    try {
      await supabase.from('workout_plans').delete().eq('id', id);
      toast.show('Plano excluído', 'success');
      navigate('/app/workouts');
    } catch {
      toast.show('Não foi possível excluir.', 'error');
    } finally {
      setShowDelete(false);
    }
  }

  const totalSets = useMemo(() => items.reduce((sum, i) => sum + i.sets, 0), [items]);

  if (loading) {
    return (
      <>
        <SkeletonBlock />
        <div style={{ height: 16 }} />
        <SkeletonBlock />
      </>
    );
  }

  return (
    <>
      <Link to="/app/workouts" className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }}>
        <IconChevronLeft size={16} />
        Treinos
      </Link>

      <h1 className="page-title">{isEditing ? 'Editar treino' : 'Novo treino'}</h1>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Configuração */}
        <div className="stack stack-4">
          <Card>
            <h2 className="card-title" style={{ marginBottom: 'var(--sp-4)' }}>
              Configuração
            </h2>

            <Field label="Nome do treino" htmlFor="name">
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Treino A — superior"
                maxLength={120}
              />
            </Field>

            <Field label="Descrição" htmlFor="description">
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Objetivo do treino, observações…"
                maxLength={500}
              />
            </Field>

            <Field label="Foco" htmlFor="focus">
              <select id="focus" value={focus} onChange={(e) => setFocus(e.target.value)}>
                <option value="hypertrophy">Hipertrofia</option>
                <option value="strength">Resistência muscular</option>
                <option value="conditioning">Condicionamento físico</option>
                <option value="weight_loss">Emagrecimento</option>
                <option value="calisthenics">Calistenia</option>
                <option value="home">Treino em casa</option>
                <option value="gym">Academia</option>
                <option value="cardio">Cardio</option>
                <option value="mobility">Mobilidade</option>
                <option value="sport_prep">Preparação esportiva</option>
              </select>
            </Field>

            <Field
              label="Duração estimada (minutos)"
              htmlFor="minutes"
              hint="Opcional. Ajuda a planejar a semana."
            >
              <input
                id="minutes"
                type="number"
                min={1}
                max={600}
                value={estimatedMinutes}
                onChange={(e) =>
                  setEstimatedMinutes(e.target.value === '' ? '' : Number(e.target.value))
                }
              />
            </Field>

            <fieldset style={{ border: 'none' }}>
              <legend
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: 'var(--sp-2)',
                }}
              >
                Dias da semana
              </legend>
              <div className="row row-wrap" style={{ gap: 6 }}>
                {WEEKDAY_LABELS.map((label, index) => (
                  <button
                    key={index}
                    type="button"
                    className="chip"
                    aria-pressed={days.includes(index)}
                    onClick={() => toggleDay(index)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
          </Card>

          {/* Ações */}
          <div className="stack stack-2">
            <Button variant="primary" block onClick={handleSave} loading={saving}>
              Salvar treino
            </Button>

            {items.length > 0 && (
              <Button variant="secondary" block onClick={handleStartSession}>
                <IconPlay size={17} />
                Iniciar sessão
              </Button>
            )}

            {isEditing && (
              <Button variant="danger" block onClick={() => setShowDelete(true)}>
                <IconTrash size={16} />
                Excluir plano
              </Button>
            )}
          </div>
        </div>

        {/* Exercícios */}
        <div className="stack stack-3">
          <Card>
            <div className="card-header">
              <h2 className="card-title">
                Exercícios{' '}
                <span className="text-muted text-sm">
                  ({items.length} · {totalSets} séries)
                </span>
              </h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPickerOpen((v) => !v)}
                aria-expanded={pickerOpen}
              >
                <IconPlus size={15} />
                Adicionar
              </Button>
            </div>

            {pickerOpen && (
              <div style={{ marginBottom: 'var(--sp-4)' }}>
                <div className="input-group" style={{ marginBottom: 'var(--sp-3)' }}>
                  <input
                    type="search"
                    value={pickerQuery}
                    onChange={(e) => setPickerQuery(e.target.value)}
                    placeholder="Buscar exercício…"
                    aria-label="Buscar exercício para adicionar"
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

                {candidatesLoading ? (
                  <p className="text-sm text-muted">Buscando…</p>
                ) : candidates.length === 0 ? (
                  <Alert variant="info">
                    Nenhum exercício encontrado no banco local. Importe um pela biblioteca
                    primeiro.
                  </Alert>
                ) : (
                  <div className="stack stack-1" style={{ maxHeight: 280, overflowY: 'auto' }}>
                    {candidates.map((ex) => (
                      <button
                        key={ex.id}
                        type="button"
                        className="row-between"
                        onClick={() => addExercise(ex)}
                        style={{
                          padding: 'var(--sp-2) var(--sp-3)',
                          borderRadius: 'var(--r-sm)',
                          textAlign: 'left',
                          width: '100%',
                        }}
                      >
                        <span className="truncate">{ex.name}</span>
                        <IconPlus size={15} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {items.length === 0 ? (
              <EmptyState
                icon="🏋️"
                title="Nenhum exercício adicionado"
                text="Clique em Adicionar para montar a lista do treino."
              />
            ) : (
              <div className="stack stack-3">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      padding: 'var(--sp-3)',
                      background: 'var(--surface-2)',
                      borderRadius: 'var(--r-md)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div className="row-between" style={{ marginBottom: 'var(--sp-3)' }}>
                      <div style={{ minWidth: 0 }}>
                        <span className="badge badge-accent" style={{ marginRight: 6 }}>
                          {index + 1}
                        </span>
                        <strong className="truncate">{item.exercise?.name ?? 'Exercício'}</strong>
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remover ${item.exercise?.name ?? 'exercício'}`}
                      >
                        <IconTrash size={15} />
                      </button>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))',
                        gap: 'var(--sp-2)',
                      }}
                    >
                      <MiniInput
                        label="Séries"
                        type="number"
                        value={item.sets}
                        min={1}
                        max={20}
                        onChange={(v) => updateItem(item.id, { sets: v })}
                      />
                      <MiniInput
                        label="Reps"
                        value={item.reps}
                        onChange={(v) => updateItem(item.id, { reps: v })}
                      />
                      <MiniInput
                        label="Carga kg"
                        type="number"
                        step={0.5}
                        value={item.weight_kg ?? ''}
                        onChange={(v) =>
                          updateItem(item.id, {
                            weight_kg: v === '' ? null : Number(v),
                          })
                        }
                      />
                      <MiniInput
                        label="Descanso s"
                        type="number"
                        value={item.rest_seconds}
                        min={0}
                        max={900}
                        onChange={(v) => updateItem(item.id, { rest_seconds: v })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Excluir plano de treino?"
        message="Os exercícios vinculados serão removidos junto. Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </>
  );
}

/**
 * Campo numérico compacto para os parâmetros de série.
 *
 * Genérico sobre o tipo do valor para que o `onChange` entregue exatamente
 * o tipo esperado pelo setter (`number` ou `string`), sem cast no chamador.
 */
function MiniInput<T extends string | number>({
  label,
  value,
  onChange,
  type = 'text',
  min,
  max,
  step,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  type?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label style={{ display: 'block' }}>
      <span
        style={{
          display: 'block',
          fontSize: '0.68rem',
          color: 'var(--text-dim)',
          marginBottom: 3,
          fontWeight: 600,
        }}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const raw = e.target.value;
          if (type === 'number') {
            onChange((raw === '' ? 0 : Number(raw)) as T);
          } else {
            onChange(raw as T);
          }
        }}
        style={{
          minHeight: 38,
          padding: '6px 10px',
          fontSize: '0.88rem',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-sm)',
          width: '100%',
        }}
      />
    </label>
  );
}

function SkeletonBlock() {
  return <div className="skeleton" style={{ height: 160, borderRadius: 'var(--r-lg)' }} />;
}
