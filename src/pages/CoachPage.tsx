import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/useToast';
import { Alert, Button, Card, EmptyState, Field, Modal, SkeletonList } from '@/components/ui';
import { ExerciseLine, PlanSourceBadge } from '@/components/training';
import {
  IconSparkles,
  IconChevronDown,
  IconRefresh,
  IconEdit,
  IconSend,
  IconShield,
} from '@/components/icons';
import type { TrainingProfile, WorkoutPlan } from '@/types/database';
import {
  ENVIRONMENT_LABELS,
  GOAL_LABELS,
  LEVEL_LABELS,
  allowedDifficulties,
  muscleLabel,
} from '@/data/exerciseTaxonomy';
import { planWeekdayLabel } from '@/services/trainingOverview';
import { answersFromRow, loadTrainingProfile, toPlanProfile } from '@/services/trainingProfile';
import { loadExerciseCatalog, type CatalogExercise } from '@/services/catalog';
import {
  loadPlanWithExercises,
  regeneratePlanDay,
  replacePlanExercise,
  type PlanWithExercises,
} from '@/services/planPersistence';
import { askCoach, getAiStatus, localCoachAnswer, type AiStatus } from '@/services/aiCoach';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  origin: 'ai' | 'rules' | 'error';
}

const SUGGESTIONS = [
  'Por que esse treino foi escolhido?',
  'Quanto tempo de descanso devo usar?',
  'Como progrido a carga?',
  'O que faço se sentir dor?',
];

/**
 * Treinador.
 *
 * Explica o plano real do usuário e permite ajustes (regenerar um dia, trocar um
 * exercício). A IA é OPCIONAL: quando não há provedor configurado no servidor, a
 * interface mostra claramente "treinador por regras" e usa respostas derivadas
 * das regras do próprio plano.
 */
export default function CoachPage() {
  const { user, refreshProfile } = useAuthStore();
  const toast = useToast();

  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [trainingRow, setTrainingRow] = useState<TrainingProfile | null>(null);
  const [catalogState, setCatalogState] = useState<{ exercises: CatalogExercise[]; source: string } | null>(null);
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const [openPlanId, setOpenPlanId] = useState<string | null>(null);
  const [planDetail, setPlanDetail] = useState<PlanWithExercises | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const [swapItemId, setSwapItemId] = useState<string | null>(null);
  const [swapTarget, setSwapTarget] = useState<PlanWithExercises['exercises'][number] | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messageId = useRef(0);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const trainingProfile = await loadTrainingProfile(user.id);

      const [plansRes, catalog] = await Promise.all([
        supabase.from('workout_plans').select('*').eq('is_active', true).order('created_at', { ascending: true }),
        loadExerciseCatalog(),
        getAiStatus().then(setAiStatus),
      ]);

      setPlans((plansRes.data ?? []) as WorkoutPlan[]);
      setTrainingRow(trainingProfile);
      setCatalogState(catalog);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const answers = useMemo(() => answersFromRow(trainingRow), [trainingRow]);
  const generationProfile = useMemo(() => toPlanProfile(answers), [answers]);
  const groups = useMemo(() => {
    const map = new Map<string, { name: string; plans: WorkoutPlan[] }>();
    for (const plan of plans) {
      const key = plan.program_id ?? '__manual__';
      const entry = map.get(key) ?? {
        name: plan.program_name ?? 'Planos avulsos',
        plans: [],
      };
      entry.plans.push(plan);
      map.set(key, entry);
    }
    return [...map.entries()].map(([programId, value]) => ({ programId, ...value }));
  }, [plans]);

  async function openPlan(planId: string) {
    if (openPlanId === planId) {
      setOpenPlanId(null);
      setPlanDetail(null);
      return;
    }

    setOpenPlanId(planId);
    setPlanDetail(null);
    setDetailLoading(true);
    try {
      const detail = await loadPlanWithExercises(planId);
      setPlanDetail(detail);
    } finally {
      setDetailLoading(false);
    }
  }

  async function regenerate(plan: WorkoutPlan) {
    if (regeneratingId) return;
    if (!catalogState || catalogState.exercises.length === 0) {
      toast.show('Catálogo de exercícios indisponível.', 'error');
      return;
    }

    setRegeneratingId(plan.id);
    try {
      const result = await regeneratePlanDay({
        plan,
        profile: generationProfile,
        catalog: catalogState.exercises,
      });

      if (!result.ok) {
        toast.show(result.error ?? 'Não foi possível regenerar este dia.', 'error');
        return;
      }

      toast.show('Dia regenerado mantendo o restante do plano ✓', 'success');
      if (openPlanId === plan.id) {
        const detail = await loadPlanWithExercises(plan.id);
        setPlanDetail(detail);
      }
      await load();
    } finally {
      setRegeneratingId(null);
    }
  }

  const swapOptions = useMemo(() => {
    if (!swapTarget || !catalogState) return [];
    const swapPattern =
      catalogState.exercises.find((exercise) => exercise.id === swapTarget.id)?.pattern ??
      (catalogState.exercises.find((exercise) => exercise.primaryMuscle === swapTarget.primary_muscle)
        ?.pattern ?? null);
    if (!swapPattern) return [];
    const allowed = allowedDifficulties(generationProfile.level);
    const equipment = generationProfile.equipment;

    return catalogState.exercises
      .filter((exercise) => exercise.inDatabase)
      .filter((exercise) => exercise.id !== swapTarget.id)
      .filter((exercise) => exercise.pattern === swapPattern)
      .filter((exercise) => allowed.includes(exercise.difficulty))
      .filter((exercise) => exercise.equipment.some((eq) => equipment.includes(eq) || eq === 'bodyweight'))
      .slice(0, 12);
  }, [swapTarget, catalogState, generationProfile]);

  async function confirmSwap(exercise: CatalogExercise) {
    if (!swapItemId) return;
    const result = await replacePlanExercise({
      itemId: swapItemId,
      exercise,
      profile: generationProfile,
      intensity: generationProfile.level === 'advanced' ? 'high' : 'moderate',
    });

    if (!result.ok) {
      toast.show(result.error ?? 'Não foi possível trocar o exercício.', 'error');
      return;
    }

    toast.show('Exercício trocado ✓', 'success');
    setSwapTarget(null);
    setSwapItemId(null);
    if (openPlanId) {
      const detail = await loadPlanWithExercises(openPlanId);
      setPlanDetail(detail);
    }
  }

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || asking) return;

    const userMessage: ChatMessage = {
      id: ++messageId.current,
      role: 'user',
      text: clean,
      origin: 'rules',
    };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setAsking(true);

    const context = {
      goal: GOAL_LABELS[generationProfile.goal] ?? generationProfile.goal,
      level: LEVEL_LABELS[generationProfile.level],
      sessionsPerWeek: generationProfile.sessionsPerWeek,
      minutesPerSession: generationProfile.minutesPerSession,
      equipment: generationProfile.equipment,
      limitations: generationProfile.limitations,
      dayNames: plans.map((plan) => plan.name),
      planRationale: plans.map((plan) => plan.rationale).filter(Boolean).slice(0, 5),
    };

    try {
      const ai = await askCoach({ question: clean, context });

      if (ai.available && ai.answer) {
        setMessages((prev) => [
          ...prev,
          { id: ++messageId.current, role: 'assistant', text: ai.answer ?? '', origin: 'ai' },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: ++messageId.current,
          role: 'assistant',
          text: localCoachAnswer(clean, context),
          origin: 'rules',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: ++messageId.current,
          role: 'assistant',
          text: 'Não consegui responder agora. Tente novamente em instantes.',
          origin: 'error',
        },
      ]);
    } finally {
      setAsking(false);
    }
  }

  if (loading) {
    return (
      <>
        <h1 className="page-title">Treinador</h1>
        <SkeletonList count={3} height={140} />
      </>
    );
  }

  const hasProgram = plans.length > 0;
  const isAi = Boolean(aiStatus?.available);

  return (
    <>
      <div className="row row-between row-wrap" style={{ marginBottom: 'var(--sp-4)' }}>
        <div>
          <h1 className="page-title">Treinador</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Entenda as escolhas do seu plano e ajuste o que precisar.
          </p>
        </div>
        <Link to="/app/onboarding?restart=1" className="btn btn-secondary btn-sm">
          <IconEdit size={15} />
          Refazer personalização
        </Link>
      </div>

      <div className={`engine-banner ${isAi ? 'engine-banner--ai' : ''}`} role="status">
        <span className="engine-banner__icon" aria-hidden="true">
          {isAi ? <IconSparkles size={18} /> : <IconShield size={18} />}
        </span>
        <div>
          <strong>{isAi ? 'IA configurada neste projeto' : 'Treinador por regras'}</strong>
          <p className="text-sm text-muted" style={{ margin: 0 }}>
            {isAi
              ? `Provedor disponível (${aiStatus?.model ?? 'modelo padrão'}). As respostas são validadas antes de virar plano — nada de exercício inventado.`
              : 'Nenhum provedor de IA está configurado no servidor. As explicações abaixo vêm das regras de treinamento e do seu plano real — chamamos isso de treinador por regras, não de IA.'}
          </p>
        </div>
      </div>

      {!hasProgram ? (
        <EmptyState
          icon="🧭"
          title="Nenhum plano para analisar ainda"
          text="Gere seu plano personalizado e volte aqui para ver a justificativa de cada escolha."
          action={
            <Link to="/app/onboarding" className="btn btn-primary">
              <IconSparkles size={16} />
              Personalizar meu treino
            </Link>
          }
        />
      ) : (
        <div className="stack stack-5">
          <Card>
            <div className="row row-between row-wrap" style={{ marginBottom: 'var(--sp-3)' }}>
              <div>
                <h2 className="card-title">Seu perfil de treino</h2>
                <p className="text-sm text-muted">
                  Objetivo principal: <strong>{GOAL_LABELS[generationProfile.goal]}</strong> ·
                  Nível {LEVEL_LABELS[generationProfile.level]} ·{' '}
                  {ENVIRONMENT_LABELS[generationProfile.environment]}
                </p>
              </div>
              <span className="badge badge-accent">
                {generationProfile.sessionsPerWeek}× / semana · {generationProfile.minutesPerSession} min
              </span>
            </div>

            <div className="row row-wrap" style={{ gap: 6 }}>
              {generationProfile.priorityMuscles.map((muscle) => (
                <span key={muscle} className="badge badge-lime">
                  prioridade: {muscleLabel(muscle)}
                </span>
              ))}
              {generationProfile.limitations.length > 0 && (
                <span className="badge badge-warning">adaptações ativas</span>
              )}
            </div>

            {generationProfile.limitations.length > 0 && (
              <p className="text-sm text-muted" style={{ marginTop: 'var(--sp-3)' }}>
                As limitações marcadas apenas removem padrões de movimento da seleção automática.
                Elas não substituem avaliação de um profissional de saúde.
              </p>
            )}
          </Card>

          {groups.map((group) => (
            <Card key={group.programId}>
              <div className="row row-between row-wrap" style={{ marginBottom: 'var(--sp-3)' }}>
                <div>
                  <h2 className="card-title">{group.name}</h2>
                  <p className="text-sm text-muted">
                    {group.plans.length} dia(s) ·{' '}
                    {group.plans
                      .map((plan) => plan.day_label ?? '—')
                      .join(' · ')}
                  </p>
                </div>
                <div className="row row-wrap" style={{ gap: 6 }}>
                  {group.plans[0] && <PlanSourceBadge source={group.plans[0].generated_by} />}
                </div>
              </div>

              {group.plans[0]?.rationale && (
                <p className="text-sm text-muted" style={{ marginBottom: 'var(--sp-3)' }}>
                  {group.plans[0].rationale}
                </p>
              )}

              <div className="stack stack-2">
                {group.plans.map((plan) => (
                  <div key={plan.id} className="coach-day">
                    <div className="row row-between row-wrap">
                      <button
                        type="button"
                        className="coach-day__toggle"
                        aria-expanded={openPlanId === plan.id}
                        onClick={() => void openPlan(plan.id)}
                      >
                        <span className="badge badge-accent">{plan.day_label ?? 'Dia'}</span>
                        <span className="coach-day__name">{plan.name}</span>
                        <span className="text-xs text-muted">
                          {planWeekdayLabel(plan)}
                          {plan.estimated_minutes ? ` · ${plan.estimated_minutes} min` : ''}
                        </span>
                        <IconChevronDown
                          size={16}
                          style={{
                            transform: openPlanId === plan.id ? 'rotate(180deg)' : 'none',
                            transition: 'transform var(--dur) var(--ease)',
                          }}
                        />
                      </button>

                      <div className="row" style={{ gap: 6 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void regenerate(plan)}
                          loading={regeneratingId === plan.id}
                          aria-label={`Regenerar o dia ${plan.name}`}
                        >
                          <IconRefresh size={15} />
                          Regenerar
                        </Button>
                        <Link to={`/app/workouts/${plan.id}`} className="btn btn-secondary btn-sm">
                          Editar
                        </Link>
                      </div>
                    </div>

                    {openPlanId === plan.id && (
                      <div className="coach-day__detail">
                        {detailLoading ? (
                          <SkeletonList count={2} height={56} />
                        ) : planDetail ? (
                          <>
                            {planDetail.rationale && (
                              <p className="text-sm text-muted">{planDetail.rationale}</p>
                            )}
                            <ol className="exercise-lines">
                              {planDetail.exercises.map((exercise, index) => (
                                <li key={exercise.itemId}>
                                  <ExerciseLine
                                    index={index + 1}
                                    name={exercise.name}
                                    detail={`${exercise.sets}× ${exercise.reps} · descanso ${exercise.rest_seconds}s · ${(exercise.equipment ?? [])
                                      .map((eq) => eq.replace('_', ' '))
                                      .join(', ') || 'peso do corpo'}`}
                                    href={`/app/exercises/${exercise.slug}`}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    aria-label={`Trocar ${exercise.name}`}
                                    onClick={() => {
                                      setSwapItemId(exercise.itemId);
                                      setSwapTarget(exercise);
                                    }}
                                  >
                                    Trocar
                                  </Button>
                                </li>
                              ))}
                            </ol>
                          </>
                        ) : (
                          <Alert variant="error">Não foi possível carregar este dia.</Alert>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}

          <Card>
            <div className="row row-between row-wrap" style={{ marginBottom: 'var(--sp-3)' }}>
              <h2 className="card-title">
                <IconSparkles size={17} style={{ verticalAlign: '-3px', marginRight: 6 }} />
                Pergunte ao treinador
              </h2>
              <span className={`badge ${isAi ? 'badge-cyan' : ''}`}>
                {isAi ? 'respostas por IA' : 'respostas por regras'}
              </span>
            </div>

            <div className="chat" aria-live="polite">
              {messages.length === 0 ? (
                <div className="chat__empty">
                  <p className="text-sm text-muted">
                    Pergunte sobre descanso, progressão, substituições ou o que fazer em caso de dor.
                  </p>
                  <div className="chips chips--wrap">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        className="chip"
                        onClick={() => void send(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="chat__messages">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`chat__bubble chat__bubble--${message.role} ${
                        message.origin === 'error' ? 'chat__bubble--error' : ''
                      }`}
                    >
                      {message.origin === 'ai' && (
                        <span className="chat__tag badge badge-cyan">IA</span>
                      )}
                      {message.origin === 'rules' && message.role === 'assistant' && (
                        <span className="chat__tag badge">regras</span>
                      )}
                      <p>{message.text}</p>
                    </div>
                  ))}
                  {asking && (
                    <div className="chat__bubble chat__bubble--assistant">
                      <span className="spinner" aria-hidden="true" />
                      <span>Pensando…</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <form
              className="chat__form"
              onSubmit={(event) => {
                event.preventDefault();
                void send(question);
              }}
            >
              <Field label="Sua pergunta" htmlFor="coach-question">
                <textarea
                  id="coach-question"
                  rows={2}
                  value={question}
                  maxLength={600}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Ex.: posso trocar o agachamento por outra coisa?"
                />
              </Field>
              <Button type="submit" loading={asking} disabled={question.trim().length < 2}>
                <IconSend size={16} />
                Enviar
              </Button>
            </form>
          </Card>
        </div>
      )}

      <Modal
        open={Boolean(swapTarget)}
        onClose={() => {
          setSwapTarget(null);
          setSwapItemId(null);
        }}
        title={`Trocar ${swapTarget?.name ?? 'exercício'}`}
      >
        <p className="text-sm text-muted" style={{ marginBottom: 'var(--sp-3)' }}>
          Alternativas do mesmo padrão de movimento, compatíveis com seus equipamentos e nível.
        </p>

        {swapOptions.length === 0 ? (
          <Alert variant="warning">
            Nenhuma alternativa compatível encontrada. Tente editar o treino no construtor ou
            ajustar os equipamentos do seu perfil.
          </Alert>
        ) : (
          <div className="stack stack-2">
            {swapOptions.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                className="swap-option"
                onClick={() => void confirmSwap(exercise)}
              >
                <span className="grow">
                  <strong>{exercise.name}</strong>
                  <span className="text-xs text-muted">
                    {muscleLabel(exercise.primaryMuscle)} · {exercise.difficulty} ·{' '}
                    {exercise.equipment.join(', ')}
                  </span>
                </span>
                <IconEdit size={16} aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
      </Modal>

      <p className="text-xs text-dim" style={{ marginTop: 'var(--sp-4)' }}>
        O treinador não substitui acompanhamento profissional. Em caso de dor, lesão ou condição de
        saúde, procure avaliação.{' '}
        <button
          type="button"
          className="link-btn"
          onClick={() => {
            void refreshProfile();
            toast.show('Perfil atualizado', 'success');
          }}
        >
          Atualizar perfil
        </button>
      </p>
    </>
  );
}
