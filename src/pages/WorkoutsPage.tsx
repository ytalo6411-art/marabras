import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import { Button, Card, EmptyState, SkeletonList } from '@/components/ui';
import { IconPlus, IconDumbbell, IconClock, IconTrash, IconChevronRight } from '@/components/icons';
import { WEEKDAY_LABELS, formatRelative } from '@/utils/format';
import type { WorkoutPlan, WorkoutSession } from '@/types/database';

/** Lista de planos de treino e histórico de sessões. */
export default function WorkoutsPage() {
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'plans' | 'history'>('plans');

  async function load() {
    if (!user) return;
    setLoading(true);

    try {
      const [plansRes, sessionsRes] = await Promise.all([
        supabase
          .from('workout_plans')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('workout_sessions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30),
      ]);

      setPlans(plansRes.data ?? []);
      setSessions(sessionsRes.data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [user]);

  async function deletePlan(id: string) {
    if (!confirm('Excluir este plano de treino? Essa ação não pode ser desfeita.')) return;
    try {
      await supabase.from('workout_plans').delete().eq('id', id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // erro silencioso; a lista permanece consistente após reload
    }
  }

  return (
    <>
      <h1 className="page-title">Treinos</h1>
      <p className="page-subtitle">Seus planos e o histórico de sessões.</p>

      <div className="row row-between" style={{ marginBottom: 'var(--sp-4)' }}>
        <div className="chips" style={{ marginBottom: 0 }}>
          <button
            type="button"
            className="chip"
            aria-pressed={tab === 'plans'}
            onClick={() => setTab('plans')}
          >
            Planos ({plans.length})
          </button>
          <button
            type="button"
            className="chip"
            aria-pressed={tab === 'history'}
            onClick={() => setTab('history')}
          >
            Histórico
          </button>
        </div>

        <Link to="/app/workouts/new" className="btn btn-primary btn-sm">
          <IconPlus size={16} />
          Novo
        </Link>
      </div>

      {loading ? (
        <SkeletonList count={3} height={100} />
      ) : tab === 'plans' ? (
        plans.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Nenhum plano ainda"
            text="Monte sua primeira rotina: escolha exercícios, séries, repetições e descanso."
            action={
              <Link to="/app/workouts/new" className="btn btn-primary">
                <IconPlus size={16} />
                Criar plano
              </Link>
            }
          />
        ) : (
          <div className="stack stack-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="card-interactive">
                <div className="row-between">
                  <Link to={`/app/workouts/${plan.id}`} className="grow">
                    <div className="row-between" style={{ marginBottom: 4 }}>
                      <h2 className="card-title">{plan.name}</h2>
                      <IconChevronRight size={18} />
                    </div>
                    {plan.description && (
                      <p className="text-sm text-muted" style={{ marginBottom: 8 }}>
                        {plan.description}
                      </p>
                    )}
                    <div className="row row-wrap" style={{ gap: 6 }}>
                      <span className="badge badge-accent">{plan.focus}</span>
                      {plan.estimated_minutes && (
                        <span className="badge">
                          <IconClock size={12} style={{ verticalAlign: '-2px' }} />{' '}
                          {plan.estimated_minutes} min
                        </span>
                      )}
                      {plan.days_of_week?.map((d) => (
                        <span key={d} className="badge badge-cyan">
                          {WEEKDAY_LABELS[d]}
                        </span>
                      ))}
                    </div>
                  </Link>
                </div>

                <div className="row" style={{ marginTop: 'var(--sp-3)' }}>
                  <Link to={`/app/workouts/${plan.id}`} className="btn btn-secondary btn-sm grow">
                    <IconDumbbell size={15} />
                    Abrir
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deletePlan(plan.id)}
                    aria-label={`Excluir plano ${plan.name}`}
                  >
                    <IconTrash size={15} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : sessions.length === 0 ? (
        <EmptyState
          icon="📊"
          title="Sem sessões registradas"
          text="Finalize um treino para começar seu histórico."
        />
      ) : (
        <div className="stack stack-2">
          {sessions.map((s) => (
            <Card key={s.id}>
              <div className="row-between">
                <div style={{ minWidth: 0 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <strong className="truncate">{s.name}</strong>
                    <span
                      className={`badge ${
                        s.status === 'completed'
                          ? 'badge-success'
                          : s.status === 'in_progress'
                            ? 'badge-warning'
                            : ''
                      }`}
                    >
                      {s.status === 'completed'
                        ? 'Concluído'
                        : s.status === 'in_progress'
                          ? 'Em andamento'
                          : s.status === 'skipped'
                            ? 'Pulado'
                            : 'Planejado'}
                    </span>
                  </div>
                  <div className="text-xs text-muted" style={{ marginTop: 4 }}>
                    {s.completed_at ? formatRelative(s.completed_at) : 'não iniciada'} ·{' '}
                    {Math.round(s.total_volume_kg)} kg de volume
                  </div>
                </div>
                {s.status === 'in_progress' && (
                  <Link to={`/app/session/${s.id}`} className="btn btn-primary btn-sm">
                    Continuar
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
