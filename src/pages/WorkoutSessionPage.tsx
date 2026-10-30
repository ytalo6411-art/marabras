import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import { useToast, Button, Card, Alert } from '@/components/ui';
import VideoPlayer from '@/components/VideoPlayer';
import { IconChevronLeft, IconCheck, IconTimer, IconPlay, IconPause, IconX } from '@/components/icons';
import { formatClock, formatDuration } from '@/utils/format';
import type { WorkoutSession, WorkoutExercise, Exercise } from '@/types/database';

/**
 * Exercício dentro de uma sessão em execução.
 *
 * Não estende `WorkoutExercise` porque aqui `sets` é a lista de séries
 * registradas (array), enquanto no plano é a quantidade de séries (number).
 */
interface SessionExercise
  extends Omit<WorkoutExercise, 'sets'> {
  exercise: Exercise | null;
  /** Séries registradas nesta sessão, indexadas por número da série. */
  sets: { setNumber: number; reps: number | null; weight: number | null; done: boolean }[];
}

/**
 * Modo de execução do treino.
 *
 * Mostra o exercício atual, vídeo, série atual, carga, cronômetro de descanso
 * e o próximo exercício. Ao terminar, salva automaticamente os dados da sessão.
 *
 * O cronômetro usa timestamp absoluto como fonte de verdade — assim ele não
 * "perde" tempo quando a aba vai para segundo plano ou o navegador ajusta o
 * intervalo do `setInterval`.
 */
export default function WorkoutSessionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuthStore();

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finished, setFinished] = useState(false);

  // Cronômetro de descanso: timestamp de término, não contador regressivo.
  const [restUntil, setRestUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [paused, setPaused] = useState(false);

  const startRef = useRef<number>(Date.now());

  // ── Carregamento ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id || !user) return;

    setLoading(true);
    Promise.all([
      supabase.from('workout_sessions').select('*').eq('id', id).maybeSingle(),
      supabase.from('workout_exercises').select('*').eq('plan_id', '').eq('session_id', id),
    ])
      .then(async ([sessionRes]) => {
        if (!sessionRes.data) return;
        setSession(sessionRes.data);
        startRef.current = sessionRes.data.started_at
          ? new Date(sessionRes.data.started_at).getTime()
          : Date.now();

        // Busca os exercícios do plano vinculado.
        const planId = sessionRes.data.plan_id;
        if (!planId) return;

        const { data: planItems } = await supabase
          .from('workout_exercises')
          .select('*')
          .eq('plan_id', planId)
          .order('position');

        const exerciseIds = (planItems ?? []).map((i) => i.exercise_id);
        const { data: exRows } = exerciseIds.length
          ? await supabase.from('exercises').select('*').in('id', exerciseIds)
          : { data: [] as Exercise[] };

        const exMap = new Map((exRows ?? []).map((e) => [e.id, e]));

        setExercises(
          (planItems ?? []).map((item) => ({
            ...item,
            exercise: exMap.get(item.exercise_id) ?? null,
            sets: Array.from({ length: item.sets }, (_, i) => ({
              setNumber: i + 1,
              reps: null,
              weight: item.weight_kg,
              done: false,
            })),
          })),
        );
      })
      .finally(() => setLoading(false));
  }, [id, user]);

  // ── Cronômetro ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (restUntil === null) return;
    const id2 = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id2);
  }, [restUntil]);

  // Avisa quando o descanso termina.
  useEffect(() => {
    if (restUntil !== null && now >= restUntil && !paused) {
      setRestUntil(null);
      toast.show('Descanso encerrado. Vamos lá!', 'success');
      if ('vibrate' in navigator) navigator.vibrate?.(120);
    }
  }, [now, restUntil, paused, toast]);

  const current = exercises[currentIndex];
  const restRemaining = restUntil !== null ? Math.max(0, Math.ceil((restUntil - now) / 1000)) : 0;

  // ── Ações ───────────────────────────────────────────────────────────────
  const updateSet = useCallback(
    (exerciseIndex: number, setIndex: number, patch: Partial<SessionExercise['sets'][number]>) => {
      setExercises((prev) =>
        prev.map((ex, i) =>
          i !== exerciseIndex
            ? ex
            : { ...ex, sets: ex.sets.map((s, j) => (j === setIndex ? { ...s, ...patch } : s)) },
        ),
      );
    },
    [],
  );

  async function completeSet() {
    if (!current) return;

    const set = current.sets[currentSet];
    if (!set) return;

    updateSet(currentIndex, currentSet, { done: !set.done });

    // Grava a série no banco (upsert por session+exercise+set_number).
    if (!set.done && id) {
      try {
        await supabase.from('workout_sets').upsert(
          {
            session_id: id,
            exercise_id: current.exercise_id,
            set_number: set.setNumber,
            reps: set.reps ?? parseInt(current.reps, 10) ?? null,
            weight_kg: set.weight,
            completed: true,
          },
          { onConflict: 'session_id,exercise_id,set_number' },
        );
      } catch {
        // Falha no save da série não impede continuar o treino.
      }
    }

    const allDone = current.sets.every((s, j) => (j === currentSet ? !set.done : s.done));
    if (allDone) {
      // Avança para o próximo exercício.
      if (currentIndex < exercises.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setCurrentSet(0);
        const nextRest = exercises[currentIndex + 1]?.rest_seconds ?? 60;
        setRestUntil(Date.now() + nextRest * 1000);
        setNow(Date.now());
      } else {
        await finishSession();
      }
    } else {
      // Avança para a próxima série.
      const nextIndex = current.sets.findIndex((s, j) => j > currentSet && !s.done);
      if (nextIndex !== -1) {
        setCurrentSet(nextIndex);
        const nextRest = current.rest_seconds ?? 60;
        setRestUntil(Date.now() + nextRest * 1000);
        setNow(Date.now());
      }
    }
  }

  async function finishSession() {
    if (!id || !session) return;
    setSaving(true);

    try {
      const duration = Math.round((Date.now() - startRef.current) / 1000);

      // Volume total = soma de (reps × carga) das séries concluídas.
      const volume = exercises.reduce((sum, ex) => {
        return (
          sum +
          ex.sets
            .filter((s) => s.done)
            .reduce((sSum, s) => sSum + (s.reps ?? 0) * (s.weight ?? 0), 0)
        );
      }, 0);

      await supabase
        .from('workout_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          duration_seconds: duration,
          total_volume_kg: Math.round(volume * 100) / 100,
        })
        .eq('id', id);

      // Registra o histórico por exercício e atualiza recordes pessoais.
      for (const ex of exercises) {
        const completed = ex.sets.filter((s) => s.done);
        if (completed.length === 0) continue;

        const bestWeight = Math.max(...completed.map((s) => s.weight ?? 0));
        const exVolume = completed.reduce((s, x) => s + (x.reps ?? 0) * (x.weight ?? 0), 0);

        await supabase.from('exercise_history').insert({
          user_id: user!.id,
          exercise_id: ex.exercise_id,
          session_id: id,
          best_weight_kg: bestWeight || null,
          best_reps: Math.max(...completed.map((s) => s.reps ?? 0)) || null,
          total_volume_kg: Math.round(exVolume * 100) / 100,
        });

        if (bestWeight > 0) {
          // Só grava se for um novo recorde — caso contrário preserva o melhor.
          const { data: existing } = await supabase
            .from('personal_records')
            .select('id, value')
            .eq('user_id', user!.id)
            .eq('exercise_id', ex.exercise_id)
            .eq('record_type', 'weight')
            .maybeSingle();

          if (!existing) {
            await supabase.from('personal_records').insert({
              user_id: user!.id,
              exercise_id: ex.exercise_id,
              record_type: 'weight',
              value: bestWeight,
              unit: 'kg',
              session_id: id,
            });
          } else if (bestWeight > existing.value) {
            await supabase
              .from('personal_records')
              .update({
                value: bestWeight,
                achieved_at: new Date().toISOString(),
                session_id: id,
              })
              .eq('id', existing.id);
          }
        }
      }

      setFinished(true);
      toast.show('Treino concluído e salvo!', 'success');
    } catch {
      toast.show('Houve um problema ao salvar. Tente novamente.', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="stack stack-4">
        <div className="skeleton" style={{ height: 240, borderRadius: 'var(--r-lg)' }} />
        <div className="skeleton" style={{ height: 120, borderRadius: 'var(--r-lg)' }} />
      </div>
    );
  }

  if (!session || exercises.length === 0) {
    return (
      <>
        <Alert variant="warning">
          Esta sessão não tem exercícios registrados. Abra um plano de treino para começar.
        </Alert>
        <Link to="/app/workouts" className="btn btn-secondary" style={{ marginTop: 16 }}>
          <IconChevronLeft size={16} />
          Voltar aos treinos
        </Link>
      </>
    );
  }

  if (finished) {
    return (
      <>
        <Card>
          <div className="center" style={{ padding: 'var(--sp-6) 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--sp-3)' }} aria-hidden="true">
              🎉
            </div>
            <h1 className="page-title">Treino concluído!</h1>
            <p className="page-subtitle">
              Seus dados foram salvos automaticamente e os recordes foram atualizados.
            </p>
            <div className="row" style={{ justifyContent: 'center' }}>
              <Button variant="primary" onClick={() => navigate('/app')}>
                Ir para o painel
              </Button>
              <Button variant="secondary" onClick={() => navigate('/app/progress')}>
                Ver evolução
              </Button>
            </div>
          </div>
        </Card>
      </>
    );
  }

  const set = current?.sets[currentSet];

  return (
    <>
      {/* Progresso */}
      <div className="row-between" style={{ marginBottom: 'var(--sp-4)' }}>
        <div>
          <div className="eyebrow">
            Exercício {currentIndex + 1} de {exercises.length}
          </div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            {current?.exercise?.name ?? 'Exercício'}
          </h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            if (confirm('Encerrar a sessão sem salvar?')) {
              await supabase
                .from('workout_sessions')
                .update({ status: 'skipped' })
                .eq('id', id!);
              navigate('/app/workouts');
            }
          }}
          aria-label="Encerrar sessão"
        >
          <IconX size={18} />
        </Button>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Vídeo e instruções */}
        <div className="stack stack-4">
          <div>
            <VideoPlayer
              src={current?.exercise?.video_url}
              poster={current?.exercise?.thumbnail_url ?? current?.exercise?.image_url}
              title={current?.exercise?.name ?? 'Exercício'}
            />
          </div>

          {current?.exercise?.instructions && (
            <Card>
              <h2 className="card-title" style={{ marginBottom: 'var(--sp-2)' }}>
                Como executar
              </h2>
              <p className="text-sm text-muted" style={{ whiteSpace: 'pre-line' }}>
                {current.exercise.instructions}
              </p>
            </Card>
          )}
        </div>

        {/* Controle */}
        <div className="stack stack-4">
          {/* Cronômetro de descanso */}
          {restUntil !== null && (
            <Card
              style={{
                borderColor: 'var(--accent)',
                background: 'var(--accent-soft)',
              }}
            >
              <div className="row-between">
                <div className="row">
                  <IconTimer size={22} />
                  <div>
                    <div className="text-sm" style={{ fontWeight: 700 }}>
                      Descanso
                    </div>
                    <div className="text-xs text-muted">
                      {paused ? 'pausado' : 'prepare-se para a próxima série'}
                    </div>
                  </div>
                </div>
                <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                  {formatClock(restRemaining)}
                </div>
              </div>
              <div className="row" style={{ marginTop: 'var(--sp-3)' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPaused((p) => !p)}
                  aria-label={paused ? 'Retomar descanso' : 'Pausar descanso'}
                >
                  {paused ? <IconPlay size={15} /> : <IconPause size={15} />}
                  {paused ? 'Retomar' : 'Pausar'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRestUntil(null)}
                >
                  Pular
                </Button>
              </div>
            </Card>
          )}

          {/* Série atual */}
          <Card>
            <div className="card-header">
              <h2 className="card-title">
                Série {currentSet + 1} de {current?.sets.length}
              </h2>
              <span className="badge">{current?.reps} reps</span>
            </div>

            <div className="stack stack-3">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--sp-3)',
                }}
              >
                <label>
                  <span className="field-hint" style={{ display: 'block', marginBottom: 4 }}>
                    Repetições
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={1000}
                    value={set?.reps ?? ''}
                    placeholder={current?.reps ?? '10'}
                    onChange={(e) =>
                      updateSet(currentIndex, currentSet, {
                        reps: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                    style={{ width: '100%' }}
                  />
                </label>

                <label>
                  <span className="field-hint" style={{ display: 'block', marginBottom: 4 }}>
                    Carga (kg)
                  </span>
                  <input
                    type="number"
                    step={0.5}
                    min={0}
                    value={set?.weight ?? ''}
                    placeholder={String(current?.weight_kg ?? '0')}
                    onChange={(e) =>
                      updateSet(currentIndex, currentSet, {
                        weight: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                    style={{ width: '100%' }}
                  />
                </label>
              </div>

              <Button variant="primary" size="lg" block onClick={completeSet}>
                <IconCheck size={18} />
                {set?.done ? 'Desmarcar série' : 'Concluir série'}
              </Button>

              {/* Lista de séries do exercício */}
              <div className="row row-wrap" style={{ gap: 6 }}>
                {current?.sets.map((s, i) => (
                  <button
                    key={s.setNumber}
                    type="button"
                    className="chip"
                    aria-pressed={i === currentSet}
                    onClick={() => setCurrentSet(i)}
                    style={
                      s.done
                        ? { borderColor: 'var(--success)', color: 'var(--success)' }
                        : undefined
                    }
                  >
                    {s.setNumber}
                    {s.done ? ' ✓' : ''}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Próximo */}
          {(() => {
            const next = exercises[currentIndex + 1];
            if (!next) return null;
            return (
              <Card>
                <div className="text-xs text-muted" style={{ marginBottom: 4 }}>
                  A SEGUIR
                </div>
                <div className="row-between">
                  <strong>{next.exercise?.name ?? 'Próximo exercício'}</strong>
                  <span className="badge">{next.sets.length} séries</span>
                </div>
              </Card>
            );
          })()}

          {/* Progresso da sessão */}
          <div className="row-between text-sm text-muted">
            <span>
              Tempo: {formatDuration(Math.round((Date.now() - startRef.current) / 1000))}
            </span>
            <span>
              {exercises.filter((e) => e.sets.every((s) => s.done)).length}/{exercises.length}{' '}
              exercícios
            </span>
          </div>

          <Button variant="secondary" block onClick={finishSession} loading={saving}>
            Encerrar e salvar
          </Button>
        </div>
      </div>
    </>
  );
}
