/**
 * Publicar um programa de treino na comunidade.
 *
 * Mostra exatamente o que será compartilhado antes de enviar: nome dos
 * exercícios, séries, repetições e descanso. Carga pessoal, notas, peso e
 * histórico NÃO entram no snapshot (ver buildSnapshot).
 */

import { useMemo, useState } from 'react';
import { Alert, Button, Field, Modal } from './ui';
import { useToast } from './useToast';
import { publishWorkout, type SharedWorkoutSnapshot } from '@/services/community';
import { buildSnapshot } from '@/services/community';
import type { PlanWithExercises } from '@/services/planPersistence';

export function PublishWorkoutDialog({
  open,
  onClose,
  userId,
  plans,
  defaultTitle,
  onPublished,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  plans: PlanWithExercises[];
  defaultTitle: string;
  onPublished: (id: string) => void;
}) {
  const toast = useToast();
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');

  const snapshot: SharedWorkoutSnapshot = useMemo(() => buildSnapshot(plans), [plans]);
  const total = snapshot.days.reduce((sum, day) => sum + day.exercises.length, 0);

  async function publish() {
    if (publishing) return;
    setPublishing(true);
    setError('');

    const result = await publishWorkout({ userId, title, description, plans });
    setPublishing(false);

    if (!result.ok || !result.data) {
      setError(result.error ?? 'Não foi possível publicar.');
      return;
    }
    toast.show('Treino publicado na comunidade', 'success');
    onPublished(result.data);
  }

  return (
    <Modal
      open={open}
      onClose={publishing ? () => {} : onClose}
      title="Publicar treino na comunidade"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={publishing}>Cancelar</Button>
          <Button onClick={() => void publish()} loading={publishing} disabled={total === 0}>
            Publicar
          </Button>
        </>
      }
    >
      <div className="stack stack-3">
        <Alert variant="info">
          Serão compartilhados apenas o nome dos exercícios, séries, repetições e descanso.
          Suas cargas, notas, peso, medidas e histórico continuam privados.
        </Alert>

        {error && <Alert variant="error">{error}</Alert>}

        <Field label="Título" htmlFor="publish-title">
          <input
            id="publish-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            disabled={publishing}
          />
        </Field>

        <Field label="Descrição (opcional)" htmlFor="publish-description" hint="Máximo de 1000 caracteres.">
          <textarea
            id="publish-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={1000}
            rows={3}
            disabled={publishing}
            placeholder="Conte o contexto do treino, se quiser."
          />
        </Field>

        <div>
          <h3 className="section-title">O que será publicado</h3>
          <p className="text-sm text-muted">
            {snapshot.days.length} dia(s) · {total} exercício(s)
          </p>
          {total === 0 && (
            <Alert variant="warning">Este programa não tem exercícios para publicar.</Alert>
          )}
        </div>
      </div>
    </Modal>
  );
}
