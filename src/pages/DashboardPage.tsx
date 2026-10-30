import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import { Button, Card, EmptyState, Progress, Skeleton } from '@/components/ui';
import { PlanSourceBadge, WeekStrip } from '@/components/training';
import {
  IconDumbbell,
  IconWater,
  IconTrophy,
  IconFlame,
  IconPlus,
  IconSparkles,
  IconTarget,
  IconPlay,
  IconClock,
  IconChevronRight,
} from '@/components/icons';
import type {
  DashboardSummary,
  PersonalRecord,
  TrainingProfile,
  WorkoutPlan,
  WorkoutSession,
} from '@/types/database';
import { formatDate, formatRelative, formatDuration } from '@/utils/format';
import {
  WEEKDAYS_SHORT,
  loadActivePlans,
  loadStreak,
  pickNextWorkout,
  planWeekdayLabel,
  type ActivityStreak,
} from '@/services/trainingOverview';
import { answersFromRow, loadTrainingProfile } from '@/services/trainingProfile';
import { GOAL_LABELS, LEVEL_LABELS, levelFromExperience } from '@/data/exerciseTaxonomy';

/**
 * Dashboard principal.
 *
 * Regra do projeto: nada de dado fictício. Todos os números vêm do banco real.
 * Usuário novo recebe uma experiência de boas-vindas com ações claras em vez de
 * zeros sem contexto.
 */
export default function DashboardPage() {
  const { profile, preferences, user } = useAuthStore();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [trainingProfile, setTrainingProfile] = useState<TrainingProfile | null>(null);
  const [streak, setStreak] = useState<ActivityStreak>({ current: 0, last7: [], activeDates: [] });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [summaryRes, sessionsRes, prRes, planRows, profileRow, streakData] = await Promise.all([
        supabase.from('dashboard_summary').select('*').maybeSingle(),
        supabase
          .from('workout_sessions')
          .select('*')
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(5),
        supabase
          .from('personal_records')
          .select('*')
          .order('achieved_at', { ascending: false })
          .limit(3),
        loadActivePlans(),
        loadTrainingProfile(user.id),
        loadStreak(user.id),
      ]);

      setSummary((summaryRes.data as DashboardSummary | null) ?? null);
      setRecentSessions((sessionsRes.data ?? []) as WorkoutSession[]);
      setRecords((prRes.data ?? []) as PersonalRecord[]);
      setPlans(planRows);
      setTrainingProfile(profileRow);
      setStreak(streakData);
    } catch {
      // Mantém o estado anterior; a UI mostra estados vazios claros.
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const firstName = (profile?.full_name || '').split(' ')[0] || 'atleta';
  const hasTrainingProfile = Boolean(trainingProfile?.completed_at);
  const isNewUser = !profile?.onboarding_completed && !hasTrainingProfile;

  const nextWorkout = useMemo(() => pickNextWorkout(plans), [plans]);
  const answers = useMemo(() => answersFromRow(trainingProfile), [trainingProfile]);

  const waterTarget = preferences?.water_target_ml ?? 2000;
  const waterNow = summary?.hydration_ml_today ?? 0;
  const weeklyGoal = preferences?.weekly_goal_sessions ?? answers.sessionsPerWeek ?? 3;
  const sessionsThisWeek = summary?.sessions_this_week ?? 0;

  function greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  if (loading) {
    return (
      <>
        <h1 className="page-title">
          {greeting()}, {firstName}
        </h1>
        <p className="page-subtitle">Carregando seu panorama…</p>
        <div className="stat-grid" style={{ marginBottom: 'var(--sp-5)' }}>
          {[0, 1, 2, 3].map((index) => (
            <div className="stat" key={index}>
              <Skeleton height={12} width="55%" />
              <div style={{ height: 10 }} />
              <Skeleton height={26} width="70%" />
            </div>
          ))}
        </div>
        <Skeleton height={180} />
      </>
    );
  }

  /* ── Boas-vindas: usuário novo ─────────────────────────────────────────── */
  if (isNewUser) {
    return (
      <>
        <h1 className="page-title">
          {greeting()}, {firstName}
        </h1>
        <p className="page-subtitle">Vamos montar seu primeiro plano. Leva cerca de dois minutos.</p>

        <Card className="hero-card">
          <div className="row" style={{ marginBottom: 'var(--sp-3)' }}>
            <span className="auth-feature__icon">
              <IconSparkles size={18} />
            </span>
            <div>
              <h2 className="card-title">Bem-vindo à ATHLETIX</h2>
              <p className="text-sm text-muted">
                Responda ao questionário e receba um treino compatível com seu objetivo,
                equipamentos e tempo real.
              </p>
            </div>
          </div>

          <div className="stack stack-3">
            <Link to="/app/onboarding" className="btn btn-primary btn-block">
              <IconTarget size={18} />
              1. Personalizar meu treino
            </Link>
            <Link to="/app/exercises" className="btn btn-secondary btn-block">
              <IconDumbbell size={18} />
              2. Explorar a biblioteca de exercícios
            </Link>
            <Link to="/app/workouts?tab=modelos" className="btn btn-secondary btn-block">
              <IconChevronRight size={18} />
              3. Ver modelos prontos
            </Link>
          </div>
        </Card>

        <p className="text-sm text-dim" style={{ marginTop: 'var(--sp-4)' }}>
          Você pode montar um treino manualmente a qualquer momento em{' '}
          <Link to="/app/workouts/new">Treinos → Montar manual</Link>.
        </p>
      </>
    );
  }

  const remaining = Math.max(0, weeklyGoal - sessionsThisWeek);

  return (
    <>
      <h1 className="page-title">
        {greeting()}, {firstName}
      </h1>
      <p className="page-subtitle">{formatDate(new Date(), { long: true })}</p>

      {/* Objetivo atual + CTA principal */}
      <Card className="hero-card">
        <div className="hero-card__grid">
          <div>
            <p className="eyebrow">
              {hasTrainingProfile ? 'Seu objetivo atual' : 'Complete sua personalização'}
            </p>
            <h2 className="hero-card__title">
              {hasTrainingProfile
                ? GOAL_LABELS[answers.goals[0] ?? 'active_routine'] ?? 'Rotina ativa'
                : 'Descubra seu plano ideal'}
            </h2>
            <p className="text-sm text-muted">
              {hasTrainingProfile
                ? `Nível ${LEVEL_LABELS[levelFromExperience(answers.experience)].toLowerCase()} · ${answers.sessionsPerWeek}× por semana · ${answers.minutesPerSession} min por sessão.`
                : 'Responda 7 etapas curtas e receba um plano semanal de verdade.'}
            </p>

            <div className="row row-wrap" style={{ gap: 8, marginTop: 'var(--sp-3)' }}>
              {hasTrainingProfile ? (
                <Link to="/app/coach" className="btn btn-secondary btn-sm">
                  <IconSparkles size={15} />
                  Abrir treinador
                </Link>
              ) : (
                <Link to="/app/onboarding" className="btn btn-primary btn-sm">
                  <IconTarget size={15} />
                  Personalizar agora
                </Link>
              )}
              <Link to="/app/onboarding?restart=1" className="btn btn-ghost btn-sm">
                Ajustar preferências
              </Link>
            </div>
          </div>

          <div className="hero-card__side">
            <div className="metric">
              <span className="metric__value">
                {sessionsThisWeek}
                <span className="metric__unit">/{weeklyGoal}</span>
              </span>
              <span className="metric__label">treinos na semana</span>
            </div>
            <WeekStrip last7={streak.last7} streak={streak.current} />
          </div>
        </div>
      </Card>

      {remaining > 0 && sessionsThisWeek > 0 && (
        <p className="text-sm text-muted" style={{ marginBottom: 'var(--sp-4)' }}>
          Faltam {remaining} {remaining === 1 ? 'sessão' : 'sessões'} para bater sua meta semanal.
          Sem pressa — consistência vale mais que pressa.
        </p>
      )}

      {/* Próximo treino */}
      <Card style={{ marginBottom: 'var(--sp-4)' }}>
        <div className="card-header">
          <h2 className="card-title">
            <IconDumbbell size={18} style={{ verticalAlign: '-3px', marginRight: 6 }} />
            Próximo treino
          </h2>
          {nextWorkout?.generated_by && <PlanSourceBadge source={nextWorkout.generated_by} />}
        </div>

        {nextWorkout ? (
          <div className="next-workout">
            <div className="next-workout__info">
              <span className="badge badge-accent">{nextWorkout.day_label ?? 'Treino'}</span>
              <strong className="next-workout__name">
                {nextWorkout.name.replace(/^[A-F]\s·\s/, '')}
              </strong>
              <span className="text-sm text-muted">
                {planWeekdayLabel(nextWorkout)}
                {nextWorkout.estimated_minutes ? ` · ${nextWorkout.estimated_minutes} min` : ''}
                {nextWorkout.level ? ` · nível ${LEVEL_LABELS[nextWorkout.level].toLowerCase()}` : ''}
              </span>
            </div>
            <div className="row row-wrap" style={{ gap: 8 }}>
              <Link to={`/app/session/${nextWorkout.id}`} className="btn btn-primary">
                <IconPlay size={16} />
                Iniciar treino
              </Link>
              <Link to={`/app/workouts/${nextWorkout.id}`} className="btn btn-secondary">
                Ver detalhes
              </Link>
            </div>
          </div>
        ) : (
          <EmptyState
            icon="📋"
            title="Nenhum treino programado"
            text="Gere seu plano semanal para ter um treino recomendado todos os dias."
            action={
              <Link to="/app/onboarding" className="btn btn-primary">
                <IconSparkles size={16} />
                Gerar plano
              </Link>
            }
          />
        )}
      </Card>

      {/* Plano da semana */}
      <Card style={{ marginBottom: 'var(--sp-4)' }}>
        <div className="card-header">
          <h2 className="card-title">
            <IconTarget size={18} style={{ verticalAlign: '-3px', marginRight: 6 }} />
            Plano da semana
          </h2>
          <Link to="/app/workouts" className="btn btn-ghost btn-sm">
            Ver todos
          </Link>
        </div>

        {plans.length === 0 ? (
          <EmptyState
            icon="🗓️"
            title="Sua semana ainda está livre"
            text="Escolha um modelo ou personalize para receber a divisão semanal."
            action={
              <Link to="/app/workouts?tab=modelos" className="btn btn-secondary">
                <IconPlus size={16} />
                Ver modelos
              </Link>
            }
          />
        ) : (
          <ul className="week-plan">
            {plans.map((plan) => (
              <li key={plan.id} className="week-plan__item">
                <span className="week-plan__day">
                  {plan.days_of_week.length > 0
                    ? plan.days_of_week.map((day) => WEEKDAYS_SHORT[day]).join('/')
                    : '—'}
                </span>
                <span className="week-plan__name grow truncate">
                  {plan.name.replace(/^[A-F]\s·\s/, '')}
                </span>
                <span className="text-xs text-muted">
                  {plan.estimated_minutes ? `${plan.estimated_minutes} min` : ''}
                </span>
                <Link
                  to={`/app/session/${plan.id}`}
                  className="btn btn-ghost btn-sm"
                  aria-label={`Iniciar ${plan.name}`}
                >
                  <IconPlay size={14} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Números reais */}
      <div className="stat-grid" style={{ marginBottom: 'var(--sp-5)' }}>
        <div className="stat">
          <div className="stat-label">Treinos na semana</div>
          <div className="stat-value">{sessionsThisWeek}</div>
          <div className="stat-delta">meta: {weeklyGoal}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Sessões totais</div>
          <div className="stat-value">{summary?.total_sessions ?? 0}</div>
          <div className="stat-delta">
            <Link to="/app/progress">ver evolução</Link>
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Volume total</div>
          <div className="stat-value">{Math.round((summary?.total_volume_kg ?? 0) / 100) / 10}t</div>
          <div className="stat-delta">levantado</div>
        </div>
        <div className="stat">
          <div className="stat-label">Conquistas</div>
          <div className="stat-value">{summary?.achievements_count ?? 0}</div>
          <div className="stat-delta">desbloqueadas</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Hidratação */}
        <Card>
          <div className="card-header">
            <h2 className="card-title">
              <IconWater size={18} style={{ verticalAlign: '-3px', marginRight: 6 }} />
              Hidratação
            </h2>
            <span className="badge badge-cyan">{Math.round(waterTarget / 1000)}L meta</span>
          </div>

          <div className="stack stack-3">
            <div>
              <div className="row-between" style={{ marginBottom: 'var(--sp-2)' }}>
                <span className="stat-value">{waterNow} ml</span>
                <span className="text-sm text-muted">
                  {waterTarget > 0 ? Math.round((waterNow / waterTarget) * 100) : 0}%
                </span>
              </div>
              <Progress value={waterNow} max={waterTarget} tone="cyan" label="Hidratação diária" />
            </div>

            <div className="row row-wrap">
              {[250, 500].map((amount) => (
                <WaterButton key={amount} amount={amount} onDone={load} />
              ))}
            </div>
          </div>
        </Card>

        {/* Atividades recentes */}
        <Card>
          <div className="card-header">
            <h2 className="card-title">
              <IconFlame size={18} style={{ verticalAlign: '-3px', marginRight: 6 }} />
              Atividades recentes
            </h2>
            <Link to="/app/workouts?tab=historico" className="btn btn-ghost btn-sm">
              Ver todas
            </Link>
          </div>

          {recentSessions.length === 0 ? (
            <EmptyState
              icon="💪"
              title="Nenhum treino concluído ainda"
              text="Seu primeiro treino aparece aqui assim que você finalizar."
            />
          ) : (
            <ul className="stack stack-2">
              {recentSessions.map((session) => (
                <li key={session.id} className="row-between" style={{ paddingBlock: 'var(--sp-2)' }}>
                  <div style={{ minWidth: 0 }}>
                    <div className="truncate" style={{ fontWeight: 600 }}>
                      {session.name}
                    </div>
                    <div className="text-xs text-muted">
                      {session.completed_at ? formatRelative(session.completed_at) : '—'} ·{' '}
                      {formatDuration(session.duration_seconds)}
                    </div>
                  </div>
                  <span className="badge">{Math.round(session.total_volume_kg)} kg</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recordes */}
        <Card>
          <div className="card-header">
            <h2 className="card-title">
              <IconTrophy size={18} style={{ verticalAlign: '-3px', marginRight: 6 }} />
              Recordes pessoais
            </h2>
          </div>

          {records.length === 0 ? (
            <EmptyState
              icon="🎯"
              title="Sem recordes ainda"
              text="Seus melhores pesos e repetições aparecem aqui."
            />
          ) : (
            <ul className="stack stack-2">
              {records.map((record) => (
                <li key={record.id} className="row-between">
                  <span className="text-sm">{record.record_type}</span>
                  <span className="badge badge-lime">
                    {record.value} {record.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Sugestões de adaptação */}
        <Card>
          <div className="card-header">
            <h2 className="card-title">
              <IconSparkles size={18} style={{ verticalAlign: '-3px', marginRight: 6 }} />
              Sugestões para hoje
            </h2>
          </div>

          <ul className="suggestion-list">
            {nextWorkout ? (
              <li>
                <IconClock size={15} aria-hidden="true" />
                <span>
                  Reserve cerca de <strong>{nextWorkout.estimated_minutes ?? 45} minutos</strong> para
                  o próximo treino. Se o tempo apertar, mantenha os três primeiros exercícios.
                </span>
              </li>
            ) : (
              <li>
                <IconTarget size={15} aria-hidden="true" />
                <span>Defina os dias da semana do seu plano para receber um treino recomendado.</span>
              </li>
            )}

            {answers.limitations.length > 0 && (
              <li>
                <IconTarget size={15} aria-hidden="true" />
                <span>
                  Você marcou limitações: o plano já evita os padrões correspondentes. Se algo
                  incomodar, troque o exercício no{' '}
                  <Link to="/app/coach">treinador</Link>.
                </span>
              </li>
            )}

            <li>
              <IconDumbbell size={15} aria-hidden="true" />
              <span>
                Sem inspiração? Veja o{' '}
                <Link to="/app/exercises">catálogo de exercícios</Link> com vídeo e instruções.
              </span>
            </li>
          </ul>
        </Card>
      </div>
    </>
  );
}

/** Botão rápido de hidratação que registra no banco. */
function WaterButton({ amount, onDone }: { amount: number; onDone: () => void }) {
  const [saving, setSaving] = useState(false);

  async function add() {
    setSaving(true);
    try {
      const { user } = useAuthStore.getState();
      if (!user) return;
      await supabase.from('hydration_logs').insert({
        user_id: user.id,
        log_date: new Date().toISOString().slice(0, 10),
        amount_ml: amount,
      });
      onDone();
    } catch {
      // Falha silenciosa — o botão volta ao estado normal.
    } finally {
      setSaving(false);
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={add} loading={saving}>
      <IconWater size={15} />
      +{amount} ml
    </Button>
  );
}
