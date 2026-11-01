/**
 * Peças reutilizadas pela comunidade.
 *
 * O card de treino é o mesmo no feed, nos salvos e no perfil do atleta — assim
 * curtir/salvar têm o mesmo comportamento e o mesmo feedback em qualquer tela.
 * Nenhuma decisão de privacidade acontece aqui: o servidor já filtrou as linhas.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Button, Card, Field, Modal } from './ui';
import {
  IconHeart,
  IconComment,
  IconBookmark,
  IconBookmarkFilled,
} from './icons';
import type { AthleteCard, ReportReason, SharedWorkout } from '@/services/community';
import { REPORT_REASONS, countExercises } from '@/data/community';
import { formatDate } from '@/utils/format';

/** Autoria clicável: leva ao perfil público, nunca a dados privados. */
export function WorkoutAuthor({ workout }: { workout: SharedWorkout }) {
  const name = workout.author?.display_name ?? 'Atleta';
  const handle = workout.author?.handle;
  const inner = (
    <>
      <Avatar name={name} src={workout.author?.avatar_url} size="md" />
      <div className="grow" style={{ minWidth: 0 }}>
        <strong className="truncate">{name}</strong>
        <p className="text-xs text-dim">
          {handle ? `@${handle} · ` : ''}
          {formatDate(workout.created_at)}
        </p>
      </div>
    </>
  );

  if (!handle) {
    return <div className="row row-wrap" style={{ gap: 'var(--sp-3)' }}>{inner}</div>;
  }
  return (
    <Link
      to={`/app/community/atleta/${handle}`}
      className="row row-wrap community-author"
      style={{ gap: 'var(--sp-3)' }}
    >
      {inner}
    </Link>
  );
}

export function SharedWorkoutCard({
  workout,
  liked,
  saved,
  busy,
  onLike,
  onSave,
}: {
  workout: SharedWorkout;
  liked: boolean;
  saved: boolean;
  busy: boolean;
  onLike: () => void;
  onSave: () => void;
}) {
  return (
    <Card>
      <div style={{ marginBottom: 'var(--sp-3)' }}>
        <WorkoutAuthor workout={workout} />
      </div>

      <h2 className="card-title">{workout.title}</h2>
      {workout.description && (
        <p className="text-sm text-muted" style={{ marginTop: 6, overflowWrap: 'anywhere' }}>
          {workout.description}
        </p>
      )}

      <div className="row row-wrap" style={{ gap: 6, marginTop: 'var(--sp-3)' }}>
        <span className="badge">{workout.snapshot?.days?.length ?? 0} dia(s)</span>
        <span className="badge">{countExercises(workout)} exercícios</span>
      </div>

      <div className="row row-wrap" style={{ gap: 'var(--sp-2)', marginTop: 'var(--sp-3)' }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLike}
          disabled={busy}
          aria-pressed={liked}
          aria-label={liked ? 'Remover curtida' : 'Curtir treino'}
        >
          <IconHeart size={15} />
          {workout.like_count}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          disabled={busy}
          aria-pressed={saved}
          aria-label={saved ? 'Remover dos salvos' : 'Salvar treino'}
        >
          {saved ? <IconBookmarkFilled size={15} /> : <IconBookmark size={15} />}
          {saved ? 'Salvo' : 'Salvar'}
        </Button>
        <Link to={`/app/community/${workout.id}`} className="btn btn-secondary btn-sm">
          <IconComment size={15} />
          Ver treino · {workout.comment_count}
        </Link>
      </div>
    </Card>
  );
}

/** Resultado de busca: o card inteiro leva ao perfil público do atleta. */
export function AthleteResultCard({ athlete }: { athlete: AthleteCard }) {
  return (
    <Link to={`/app/community/atleta/${athlete.handle}`} className="card community-athlete-card">
      <div className="row" style={{ gap: 'var(--sp-3)' }}>
        <Avatar name={athlete.display_name} src={athlete.avatar_url} size="md" />
        <div className="grow" style={{ minWidth: 0 }}>
          <strong className="truncate">{athlete.display_name}</strong>
          <p className="text-xs text-dim">@{athlete.handle}</p>
          {athlete.goals && (
            <p className="text-sm text-muted" style={{ marginTop: 4, overflowWrap: 'anywhere' }}>
              {athlete.goals}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

/** Denúncia de treino ou de atleta, com o mesmo formulário nos dois casos. */
export function ReportDialog({
  open,
  onClose,
  onSubmit,
  loading,
  target,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, details: string) => void;
  loading: boolean;
  target: 'workout' | 'athlete';
}) {
  const [reason, setReason] = useState<ReportReason>('spam');
  const [details, setDetails] = useState('');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={target === 'workout' ? 'Denunciar publicação' : 'Denunciar atleta'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button
            variant="danger"
            onClick={() => onSubmit(reason, details)}
            loading={loading}
          >
            Enviar denúncia
          </Button>
        </>
      }
    >
      <div className="stack stack-3">
        <p className="text-sm text-muted">
          Denúncias são analisadas pela moderação. Quem denunciou não é identificado
          para o atleta denunciado.
        </p>
        <Field label="Motivo" htmlFor="report-reason">
          <select
            id="report-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value as ReportReason)}
          >
            {REPORT_REASONS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Detalhes (opcional)" htmlFor="report-details" hint="Máximo de 500 caracteres.">
          <textarea
            id="report-details"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            maxLength={500}
            rows={3}
          />
        </Field>
      </div>
    </Modal>
  );
}
