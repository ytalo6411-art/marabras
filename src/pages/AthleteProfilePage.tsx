import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/components/useToast';
import { Alert, Avatar, Button, Card, EmptyState, SkeletonList } from '@/components/ui';
import { IconChevronLeft, IconUsers, IconFlag, IconBlock, IconChart } from '@/components/icons';
import { ReportDialog } from '@/components/community';
import { countExercises } from '@/data/community';
import {
  blockAthlete,
  loadAthleteByHandle,
  loadAthleteWorkouts,
  loadPublicProgress,
  reportContent,
  type AthleteCard,
  type PublicAthleteProgress,
  type ReportReason,
  type SharedWorkout,
} from '@/services/community';
import { formatDate } from '@/utils/format';

/**
 * Perfil público de um atleta.
 *
 * Mostra apenas o que o dono tornou público: nome, foto, apresentação, objetivos,
 * treinos publicados (se "treinos" estiver ligado) e contagem de treinos
 * concluídos (se "progresso" estiver ligado). Peso, medidas, dieta, e-mail e
 * histórico privado não são consultados aqui — e a view do servidor nem os
 * seleciona, então não há como vazar por engano.
 */
export default function AthleteProfilePage() {
  const { handle } = useParams<{ handle: string }>();
  const { user } = useAuthStore();
  const toast = useToast();
  const navigate = useNavigate();

  const [athlete, setAthlete] = useState<AthleteCard | null>(null);
  const [workouts, setWorkouts] = useState<SharedWorkout[]>([]);
  const [progress, setProgress] = useState<PublicAthleteProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [reporting, setReporting] = useState(false);

  const load = useCallback(async () => {
    if (!handle) return;
    setLoading(true);
    setError('');
    try {
      const found = await loadAthleteByHandle(handle);
      setAthlete(found);
      if (!found) {
        setWorkouts([]);
        setProgress(null);
        return;
      }
      const [posts, stats] = await Promise.all([
        found.show_workouts ? loadAthleteWorkouts(found.user_id) : Promise.resolve([]),
        found.show_progress ? loadPublicProgress(found.user_id) : Promise.resolve(null),
      ]);
      setWorkouts(posts);
      setProgress(stats);
    } catch {
      setError('Não foi possível carregar este perfil. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }, [handle]);

  useEffect(() => { void load(); }, [load]);

  const isMe = Boolean(user && athlete && user.id === athlete.user_id);

  async function handleBlock() {
    if (!user || !athlete) return;
    const result = await blockAthlete(user.id, athlete.user_id);
    if (!result.ok) { toast.show(result.error ?? 'Erro ao bloquear.', 'error'); return; }
    toast.show('Atleta bloqueado. Você não verá mais o conteúdo dele.', 'success');
    navigate('/app/community');
  }

  async function handleReport(reason: ReportReason, details: string) {
    if (!user || !athlete || reporting) return;
    setReporting(true);
    const result = await reportContent({
      reporterId: user.id,
      reportedUserId: athlete.user_id,
      reason,
      details,
    });
    setReporting(false);
    if (!result.ok) { toast.show(result.error ?? 'Erro ao denunciar.', 'error'); return; }
    setReportOpen(false);
    toast.show('Denúncia enviada. Nossa equipe vai analisar.', 'success');
  }

  if (loading) return <SkeletonList count={3} height={110} />;
  if (error) return <Alert variant="error">{error}</Alert>;

  if (!athlete) {
    return (
      <EmptyState
        icon={<IconUsers size={28} />}
        title="Perfil indisponível"
        text="Este perfil é privado, foi removido ou não está disponível para você."
        action={<Link to="/app/community" className="btn btn-primary">Voltar à comunidade</Link>}
      />
    );
  }

  return (
    <>
      <Link to="/app/community" className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }}>
        <IconChevronLeft size={16} />
        Comunidade
      </Link>

      <Card style={{ marginBottom: 'var(--sp-4)' }}>
        <div className="row row-wrap" style={{ gap: 'var(--sp-4)' }}>
          <Avatar name={athlete.display_name} src={athlete.avatar_url} size="lg" />
          <div className="grow" style={{ minWidth: 0 }}>
            <h1 className="page-title" style={{ fontSize: '1.4rem', marginBottom: 2 }}>
              {athlete.display_name}
            </h1>
            <p className="text-sm text-dim">@{athlete.handle}</p>
          </div>
        </div>

        {athlete.bio && (
          <p className="text-sm" style={{ marginTop: 'var(--sp-3)', overflowWrap: 'anywhere' }}>
            {athlete.bio}
          </p>
        )}
        {athlete.goals && (
          <p className="text-sm text-muted" style={{ marginTop: 'var(--sp-2)', overflowWrap: 'anywhere' }}>
            <strong>Objetivos:</strong> {athlete.goals}
          </p>
        )}

        {!isMe && (
          <div className="row row-wrap" style={{ gap: 'var(--sp-2)', marginTop: 'var(--sp-4)' }}>
            <Button variant="ghost" size="sm" onClick={() => setReportOpen(true)}>
              <IconFlag size={15} />
              Denunciar atleta
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void handleBlock()}>
              <IconBlock size={15} />
              Bloquear atleta
            </Button>
          </div>
        )}
      </Card>

      {progress && (
        <Card style={{ marginBottom: 'var(--sp-4)' }}>
          <h2 className="card-title">
            <IconChart size={17} />
            Consistência
          </h2>
          <p className="text-xs text-dim" style={{ marginBottom: 'var(--sp-3)' }}>
            Este atleta escolheu compartilhar apenas a contagem de treinos. Cargas, peso,
            medidas e dieta não são compartilhados.
          </p>
          <div className="stat-grid">
            <div className="stat">
              <div className="stat-label">Treinos concluídos</div>
              <div className="stat-value">{progress.sessions_completed}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Últimos 30 dias</div>
              <div className="stat-value">{progress.sessions_last_30d}</div>
            </div>
          </div>
          <p className="text-xs text-dim" style={{ marginTop: 'var(--sp-3)' }}>
            Na comunidade desde {formatDate(progress.athlete_since)}.
          </p>
        </Card>
      )}

      <h2 className="section-title" style={{ marginBottom: 'var(--sp-3)' }}>Treinos publicados</h2>

      {!athlete.show_workouts ? (
        <Alert variant="info">Este atleta não compartilha treinos no momento.</Alert>
      ) : workouts.length === 0 ? (
        <EmptyState
          icon={<IconUsers size={28} />}
          title="Nenhum treino publicado"
          text="Este atleta ainda não publicou treinos."
        />
      ) : (
        <div className="stack stack-3">
          {workouts.map((workout) => (
            <Link key={workout.id} to={`/app/community/${workout.id}`} className="card community-athlete-card">
              <h3 className="card-title">{workout.title}</h3>
              {workout.description && (
                <p className="text-sm text-muted" style={{ marginTop: 4, overflowWrap: 'anywhere' }}>
                  {workout.description}
                </p>
              )}
              <div className="row row-wrap" style={{ gap: 6, marginTop: 'var(--sp-3)' }}>
                <span className="badge">{workout.snapshot?.days?.length ?? 0} dia(s)</span>
                <span className="badge">{countExercises(workout)} exercícios</span>
                <span className="badge">{formatDate(workout.created_at)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={(reason, details) => void handleReport(reason, details)}
        loading={reporting}
        target="athlete"
      />
    </>
  );
}