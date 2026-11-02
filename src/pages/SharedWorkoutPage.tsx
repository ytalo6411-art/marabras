import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/components/useToast';
import { Alert, Avatar, Button, Card, EmptyState, Field, SkeletonList } from '@/components/ui';
import { ExerciseLine } from '@/components/training';
import { IconChevronLeft, IconTrash, IconFlag, IconBlock, IconComment, IconBookmark, IconBookmarkFilled } from '@/components/icons';
import { ReportDialog, WorkoutAuthor } from '@/components/community';
import {
  addComment,
  blockAthlete,
  deleteComment,
  loadComments,
  loadSharedWorkout,
  loadMySaves,
  toggleSave,
  reportContent,
  unpublishWorkout,
  type ReportReason,
  type SharedWorkout,
  type WorkoutComment,
} from '@/services/community';
import { formatDate } from '@/utils/format';

/** Treino publicado por outro atleta: leitura, comentários e denúncias. */
export default function SharedWorkoutPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const toast = useToast();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState<SharedWorkout | null>(null);
  const [comments, setComments] = useState<WorkoutComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [item, list] = await Promise.all([loadSharedWorkout(id), loadComments(id)]);
      setWorkout(item);
      setComments(list);
      if (item && user) {
        setSaved((await loadMySaves(user.id, [item.id])).has(item.id));
      }
    } catch {
      setError('Não foi possível carregar este treino.');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => { void load(); }, [load]);

  async function handleComment() {
    if (!id || !user || sending) return;
    setSending(true);
    const result = await addComment(id, user.id, body);
    if (!result.ok) {
      toast.show(result.error ?? 'Não foi possível comentar.', 'error');
      setSending(false);
      return;
    }
    setBody('');
    setComments(await loadComments(id));
    setSending(false);
  }

  async function handleDeleteComment(commentId: string) {
    const result = await deleteComment(commentId);
    if (!result.ok) { toast.show(result.error ?? 'Erro ao remover.', 'error'); return; }
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
  }

  async function handleUnpublish() {
    if (!id) return;
    const result = await unpublishWorkout(id);
    if (!result.ok) { toast.show(result.error ?? 'Erro ao remover.', 'error'); return; }
    toast.show('Publicação removida', 'success');
    navigate('/app/community');
  }

  async function handleBlock() {
    if (!user || !workout) return;
    const result = await blockAthlete(user.id, workout.user_id);
    if (!result.ok) { toast.show(result.error ?? 'Erro ao bloquear.', 'error'); return; }
    toast.show('Atleta bloqueado. Você não verá mais o conteúdo dele.', 'success');
    navigate('/app/community');
  }

  async function handleSave() {
    if (!user || !workout || saving) return;
    setSaving(true);
    const result = await toggleSave(workout.id, user.id, saved);
    setSaving(false);
    if (!result.ok) { toast.show(result.error ?? 'Não foi possível salvar.', 'error'); return; }
    setSaved(!saved);
    toast.show(saved ? 'Removido dos salvos' : 'Treino salvo', 'success');
  }

  async function handleReport(reason: ReportReason, details: string) {
    if (!user || !workout || reporting) return;
    setReporting(true);
    const result = await reportContent({
      reporterId: user.id,
      workoutId: workout.id,
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

  if (!workout) {
    return (
      <EmptyState
        icon={<IconComment size={28} />}
        title="Treino indisponível"
        text="Esta publicação foi removida, tornou-se privada ou não está disponível para você."
        action={<Link to="/app/community" className="btn btn-primary">Voltar à comunidade</Link>}
      />
    );
  }

  const isOwner = user?.id === workout.user_id;
  const days = workout.snapshot?.days ?? [];

  return (
    <>
      <Link to="/app/community" className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }}>
        <IconChevronLeft size={16} />
        Comunidade
      </Link>

      <Card style={{ marginBottom: 'var(--sp-4)' }}>
        <div style={{ marginBottom: 'var(--sp-3)' }}>
          <WorkoutAuthor workout={workout} />
        </div>

        <h1 className="page-title" style={{ fontSize: '1.4rem' }}>{workout.title}</h1>
        {workout.description && <p className="text-muted">{workout.description}</p>}

        <div className="row row-wrap" style={{ gap: 'var(--sp-2)', marginTop: 'var(--sp-4)' }}>
          {isOwner ? (
            <Button variant="danger" size="sm" onClick={() => void handleUnpublish()}>
              <IconTrash size={15} />
              Remover publicação
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void handleSave()}
                loading={saving}
                aria-pressed={saved}
              >
                {saved ? <IconBookmarkFilled size={15} /> : <IconBookmark size={15} />}
                {saved ? 'Salvo' : 'Salvar'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setReportOpen(true)}>
                <IconFlag size={15} />
                Denunciar
              </Button>
              <Button variant="ghost" size="sm" onClick={() => void handleBlock()}>
                <IconBlock size={15} />
                Bloquear atleta
              </Button>
            </>
          )}
        </div>
      </Card>

      <div className="stack stack-4">
        {days.map((day, dayIndex) => (
          <Card key={`${day.label}-${dayIndex}`}>
            <h2 className="card-title">{day.name || day.label}</h2>
            <p className="text-xs text-dim" style={{ marginBottom: 'var(--sp-3)' }}>
              {day.exercises.length} exercício(s)
            </p>
            <ol className="plan-day__exercises">
              {day.exercises.map((exercise, index) => (
                <li key={`${exercise.slug}-${index}`}>
                  <ExerciseLine
                    index={index + 1}
                    name={exercise.name}
                    detail={`${exercise.sets} × ${exercise.reps} · descanso ${exercise.restSeconds}s`}
                    href={`/app/exercises/${exercise.slug}`}
                  />
                </li>
              ))}
            </ol>
          </Card>
        ))}

        <Card>
          <h2 className="card-title" style={{ marginBottom: 'var(--sp-3)' }}>
            Comentários ({comments.length})
          </h2>

          {comments.length === 0 ? (
            <p className="text-sm text-muted">Nenhum comentário ainda. Seja o primeiro.</p>
          ) : (
            <div className="stack stack-3" style={{ marginBottom: 'var(--sp-4)' }}>
              {comments.map((comment) => (
                <div key={comment.id} className="row" style={{ gap: 'var(--sp-3)', alignItems: 'flex-start' }}>
                  <Avatar name={comment.author?.display_name} src={comment.author?.avatar_url} size="md" />
                  <div className="grow" style={{ minWidth: 0 }}>
                    <strong className="text-sm">{comment.author?.display_name ?? 'Atleta'}</strong>
                    <p className="text-xs text-dim">{formatDate(comment.created_at)}</p>
                    <p className="text-sm" style={{ marginTop: 4, overflowWrap: 'anywhere' }}>{comment.body}</p>
                  </div>
                  {user?.id === comment.user_id && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => void handleDeleteComment(comment.id)}
                      aria-label="Remover meu comentário"
                    >
                      <IconTrash size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <Field label="Seu comentário" htmlFor="comment-body" hint="Máximo de 500 caracteres.">
            <textarea
              id="comment-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Comente com respeito."
            />
          </Field>
          <Button onClick={() => void handleComment()} loading={sending} disabled={body.trim().length === 0}>
            Enviar comentário
          </Button>
        </Card>
      </div>

      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={(reason, details) => void handleReport(reason, details)}
        loading={reporting}
        target="workout"
      />
    </>
  );
}
