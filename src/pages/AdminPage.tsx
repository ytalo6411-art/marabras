import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import { Card, SkeletonList, Alert, EmptyState } from '@/components/ui';
import { IconShield, IconUsers, IconChart, IconDumbbell } from '@/components/icons';
import { formatDate, formatNumber } from '@/utils/format';
import type { Profile, AuditLog } from '@/types/database';

/**
 * Painel administrativo.
 *
 * O acesso é controlado por RLS: as tabelas de leitura administrativa exigem
 * `public.is_admin()`, que verifica `admin_users` via função SECURITY DEFINER.
 * Não existe senha fixa no frontend — o admin é uma linha em `admin_users`.
 */
export default function AdminPage() {
  const { isAdmin } = useAuthStore();
  const [tab, setTab] = useState<'overview' | 'users' | 'exercises' | 'audit'>('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    sessions: 0,
    exercises: 0,
    plans: 0,
    foodEntries: 0,
  });
  const [users, setUsers] = useState<Profile[]>([]);
  const [audit, setAudit] = useState<AuditLog[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);

    async function load() {
      try {
        const [usersRes, sessionsRes, exRes, plansRes, foodRes, auditRes] = await Promise.all([
          supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50),
          supabase.from('workout_sessions').select('id', { count: 'exact', head: true }),
          supabase.from('exercises').select('*', { count: 'exact', head: true }),
          supabase.from('workout_plans').select('id', { count: 'exact', head: true }),
          supabase.from('food_database').select('id', { count: 'exact', head: true }),
          supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50),
        ]);

        setUsers(usersRes.data ?? []);
        setAudit(auditRes.data ?? []);
        setStats({
          users: usersRes.data?.length ?? 0,
          sessions: sessionsRes.count ?? 0,
          exercises: exRes.count ?? 0,
          plans: plansRes.count ?? 0,
          foodEntries: foodRes.count ?? 0,
        });
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [isAdmin]);

  if (!isAdmin) {
    return <Alert variant="warning">Você não tem acesso a esta área.</Alert>;
  }

  return (
    <>
      <h1 className="page-title">
        <IconShield size={22} style={{ verticalAlign: '-4px', marginRight: 8 }} />
        Painel administrativo
      </h1>
      <p className="page-subtitle">Gestão e auditoria da plataforma.</p>

      <div className="chips">
        <button type="button" className="chip" aria-pressed={tab === 'overview'} onClick={() => setTab('overview')}>
          Visão geral
        </button>
        <button type="button" className="chip" aria-pressed={tab === 'users'} onClick={() => setTab('users')}>
          Usuários
        </button>
        <button type="button" className="chip" aria-pressed={tab === 'exercises'} onClick={() => setTab('exercises')}>
          Exercícios
        </button>
        <button type="button" className="chip" aria-pressed={tab === 'audit'} onClick={() => setTab('audit')}>
          Auditoria
        </button>
      </div>

      {loading ? (
        <SkeletonList count={4} height={90} />
      ) : tab === 'overview' ? (
        <div className="stat-grid">
          <div className="stat">
            <div className="stat-label">
              <IconUsers size={12} /> Usuários
            </div>
            <div className="stat-value">{stats.users}</div>
          </div>
          <div className="stat">
            <div className="stat-label">
              <IconDumbbell size={12} /> Exercícios
            </div>
            <div className="stat-value">{stats.exercises}</div>
          </div>
          <div className="stat">
            <div className="stat-label">
              <IconChart size={12} /> Planos
            </div>
            <div className="stat-value">{stats.plans}</div>
          </div>
          <div className="stat">
            <div className="stat-label">
              <IconChart size={12} /> Sessões
            </div>
            <div className="stat-value">{stats.sessions}</div>
          </div>
        </div>
      ) : tab === 'users' ? (
        users.length === 0 ? (
          <EmptyState icon="👥" title="Nenhum usuário" />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>E-mail</th>
                  <th>Cadastro</th>
                  <th>Onboarding</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.full_name ?? '—'}</td>
                    <td className="text-muted">{u.email}</td>
                    <td className="text-muted">{formatDate(u.created_at)}</td>
                    <td>
                      {u.onboarding_completed ? (
                        <span className="badge badge-success">Completo</span>
                      ) : (
                        <span className="badge">Pendente</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : tab === 'exercises' ? (
        <Card>
          <p className="text-sm text-muted">
            {formatNumber(stats.exercises)} exercícios cadastrados no banco. A biblioteca
            pública importa da Free Exercise DB e do wger sob demanda.
          </p>
        </Card>
      ) : audit.length === 0 ? (
        <EmptyState icon="📋" title="Sem registros de auditoria" />
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Quando</th>
                <th>Tabela</th>
                <th>Ação</th>
                <th>Usuário</th>
              </tr>
            </thead>
            <tbody>
              {audit.map((a) => (
                <tr key={a.id}>
                  <td className="text-muted">{formatDate(a.created_at)}</td>
                  <td>{a.table_name}</td>
                  <td>
                    <span className="badge">{a.action}</span>
                  </td>
                  <td className="text-muted mono">{a.user_id?.slice(0, 8) ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
