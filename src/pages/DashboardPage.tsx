import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import { Button, Card, EmptyState, Progress, Skeleton } from '@/components/ui';
import {
  IconDumbbell,
  IconWater,
  IconTrophy,
  IconFlame,
  IconPlus,
  IconChevronRight,
  IconSparkles,
  IconTarget,
} from '@/components/icons';
import type { DashboardSummary, WorkoutSession, PersonalRecord } from '@/types/database';
import { formatDate, formatRelative, formatDuration } from '@/utils/format';

/**
 * Dashboard principal.
 *
 * Regra do projeto: nada de dado fictício. Todos os números vêm do banco
 * real. Quando o usuário é novo, mostramos um onboarding orientando a
 * configuração inicial em vez de um painel vazio com zeros.
 */
export default function DashboardPage() {
  const { profile, preferences, user } = useAuthStore();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayPlan, setTodayPlan] = useState<{ name: string; id: string } | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [summaryRes, sessionsRes, prRes, plansRes] = await Promise.all([
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
        supabase.from('workout_plans').select('id, name, days_of_week').eq('is_active', true),
      ]);

      setSummary(summaryRes.data ?? null);
      setRecentSessions(sessionsRes.data ?? []);
      setRecords(prRes.data ?? []);

      // Treino programado para hoje (dias 0=domingo … 6=sábado).
      const today = new Date().getDay();
      const match = (plansRes.data ?? []).find((p) => p.days_of_week?.includes(today));
      setTodayPlan(match ? { name: match.name, id: match.id } : null);
    } catch {
      // Mantém o estado anterior; a UI mostra skeletons/fallbacks.
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const firstName = (profile?.full_name || '').split(' ')[0] || 'atleta';
  const isNewUser = !profile?.onboarding_completed;

  const waterTarget = preferences?.water_target_ml ?? 2000;
  const waterNow = summary?.hydration_ml_today ?? 0;
  const weeklyGoal = preferences?.weekly_goal_sessions ?? 3;

  function greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  if (loading) {
    return (
      <>
        <h1 className="page-title">{greeting()}, {firstName}</h1>
        <p className="page-subtitle">Carregando seu panorama…</p>
        <div className="stat-grid" style={{ marginBottom: 'var(--sp-5)' }}>
          {[0, 1, 2, 3].map((i) => (
            <div className="stat" key={i}>
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

  // ── Onboarding: usuário novo ────────────────────────────────────────────
  if (isNewUser) {
    return (
      <>
        <h1 className="page-title">{greeting()}, {firstName}</h1>
        <p className="page-subtitle">Vamos configurar sua base. Leva dois minutos.</p>

        <Card style={{ marginBottom: 'var(--sp-4)' }}>
          <div className="row" style={{ marginBottom: 'var(--sp-3)' }}>
            <span className="auth-feature__icon">
              <IconSparkles size={18} />
            </span>
            <div>
              <h2 className="card-title">Bem-vindo à ATHLETIX</h2>
              <p className="text-sm text-muted">
                Complete o perfil para desbloquear metas, treinos e evolução.
              </p>
            </div>
          </div>

          <div className="stack stack-3">
            <Link to="/app/profile" className="btn btn-primary btn-block">
              <IconTarget size={18} />
              1. Completar perfil
            </Link>
            <Link to="/app/workouts/new" className="btn btn-secondary btn-block">
              <IconDumbbell size={18} />
              2. Montar meu primeiro treino
            </Link>
            <Link to="/app/exercises" className="btn btn-secondary btn-block">
              <IconChevronRight size={18} />
              3. Explorar a biblioteca de exercícios
            </Link>
          </div>
        </Card>

        <p className="text-sm text-dim">
          Se preferir, entre com Google e a gente puxa o básico do seu perfil — mas o
          primeiro ajuste de metas é sempre seu.
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="page-title">{greeting()}, {firstName}</h1>
      <p className="page-subtitle">{formatDate(new Date(), { long: true })}</p>

      {/* Números principais */}
      <div className="stat-grid" style={{ marginBottom: 'var(--sp-5)' }}>
        <div className="stat">
          <div className="stat-label">Treinos na semana</div>
          <div className="stat-value">{summary?.sessions_this_week ?? 0}</div>
          <div className="stat-delta">meta: {weeklyGoal}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Sessões totais</div>
          <div className="stat-value">{summary?.total_sessions ?? 0}</div>
          <div className="stat-delta">no histórico</div>
        </div>
        <div className="stat">
          <div className="stat-label">Volume total</div>
          <div className="stat-value">
            {Math.round((summary?.total_volume_kg ?? 0) / 100) / 10}t
          </div>
          <div className="stat-delta">levantado</div>
        </div>
        <div className="stat">
          <div className="stat-label">Conquistas</div>
          <div className="stat-value">{summary?.achievements_count ?? 0}</div>
          <div className="stat-delta">desbloqueadas</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Treino de hoje */}
        <Card>
          <div className="card-header">
            <h2 className="card-title">
              <IconDumbbell size={18} style={{ verticalAlign: '-3px', marginRight: 6 }} />
              Treino de hoje
            </h2>
          </div>

          {todayPlan ? (
            <div className="stack stack-3">
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{todayPlan.name}</div>
                <p className="text-sm text-muted">Programado para hoje</p>
              </div>
              <Link to={`/app/workouts/${todayPlan.id}`} className="btn btn-primary btn-block">
                Abrir treino
              </Link>
            </div>
          ) : (
            <EmptyState
              icon="📋"
              title="Nenhum treino programado hoje"
              text="Monte um plano e defina os dias da semana para receber lembretes."
              action={
                <Link to="/app/workouts/new" className="btn btn-secondary">
                  <IconPlus size={16} />
                  Criar plano
                </Link>
              }
            />
          )}
        </Card>

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
                  {Math.round((waterNow / waterTarget) * 100)}%
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
            <Link to="/app/workouts" className="btn btn-ghost btn-sm">
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
              {recentSessions.map((s) => (
                <li key={s.id} className="row-between" style={{ paddingBlock: 'var(--sp-2)' }}>
                  <div style={{ minWidth: 0 }}>
                    <div className="truncate" style={{ fontWeight: 600 }}>
                      {s.name}
                    </div>
                    <div className="text-xs text-muted">
                      {s.completed_at ? formatRelative(s.completed_at) : '—'} ·{' '}
                      {formatDuration(s.duration_seconds)}
                    </div>
                  </div>
                  <span className="badge">{Math.round(s.total_volume_kg)} kg</span>
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
              {records.map((r) => (
                <li key={r.id} className="row-between">
                  <span className="text-sm">{r.record_type}</span>
                  <span className="badge badge-lime">
                    {r.value} {r.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
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
