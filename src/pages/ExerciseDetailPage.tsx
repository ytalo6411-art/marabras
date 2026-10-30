import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getExerciseBySlug, importExercise, type ExerciseResult } from '@/services/exercises';
import { useToast } from '@/components/useToast';
import { Button, Skeleton, Alert } from '@/components/ui';
import VideoPlayer from '@/components/VideoPlayer';
import { IconChevronLeft, IconPlus } from '@/components/icons';

const MUSCLE_LABELS: Record<string, string> = {
  chest: 'Peito',
  back: 'Costas',
  shoulders: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  abs: 'Abdômen',
  core: 'Core',
  quads: 'Quadríceps',
  hamstrings: 'Posterior de coxa',
  glutes: 'Glúteos',
  calves: 'Panturrilhas',
  cardio: 'Cardio',
  mobility: 'Mobilidade',
  stretching: 'Alongamento',
};

const EQUIPMENT_LABELS: Record<string, string> = {
  bodyweight: 'Peso corporal',
  barbell: 'Barra',
  dumbbell: 'Halteres',
  kettlebell: 'Kettlebell',
  band: 'Elástico',
  machine: 'Máquina',
  cable: 'Polia',
  bench: 'Banco',
  pullup_bar: 'Barra de pull-up',
  medicine_ball: 'Medicine ball',
  foam_roller: 'Rolo de espuma',
  none: 'Nenhum',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

const SOURCE_LABELS: Record<string, string> = {
  free_exercise_db: 'Free Exercise DB',
  wger: 'wger',
  repdb: 'RepDB',
  manual: 'Cadastro manual',
};

/** Detalhes do exercício: vídeo, instruções, musculatura e alternativas. */
export default function ExerciseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const toast = useToast();

  const [exercise, setExercise] = useState<ExerciseResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getExerciseBySlug(slug)
      .then((ex) => {
        setExercise(ex);
        if (!ex) setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleAddToPlan() {
    if (!exercise) return;
    setAdding(true);
    try {
      await importExercise(exercise);
      toast.show('Exercício adicionado. Agora monte seu treino.', 'success');
    } catch {
      toast.show('Não foi possível salvar o exercício.', 'error');
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <>
        <Skeleton height={24} width="40%" />
        <div style={{ height: 16 }} />
        <Skeleton height={280} />
        <div style={{ height: 16 }} />
        <Skeleton height={120} />
      </>
    );
  }

  if (notFound || !exercise) {
    return (
      <>
        <Link to="/app/exercises" className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
          <IconChevronLeft size={16} />
          Voltar à biblioteca
        </Link>
        <Alert variant="warning">
          Exercício não encontrado. Ele pode ter sido removido ou renomeado.
        </Alert>
      </>
    );
  }

  const instructions = exercise.instructions
    ? exercise.instructions.split('\n').filter((l) => l.trim())
    : [];

  return (
    <>
      <Link to="/app/exercises" className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }}>
        <IconChevronLeft size={16} />
        Biblioteca
      </Link>

      <h1 className="page-title">{exercise.name}</h1>

      <div className="row row-wrap" style={{ marginBottom: 'var(--sp-4)' }}>
        <span className="badge badge-accent">
          {MUSCLE_LABELS[exercise.primaryMuscle] ?? exercise.primaryMuscle}
        </span>
        <span className="badge">
          {DIFFICULTY_LABELS[exercise.difficulty] ?? exercise.difficulty}
        </span>
        {exercise.equipment.map((e) => (
          <span key={e} className="badge badge-cyan">
            {EQUIPMENT_LABELS[e] ?? e}
          </span>
        ))}
      </div>

      {/* Vídeo sob demanda */}
      <div style={{ marginBottom: 'var(--sp-5)' }}>
        <VideoPlayer
          src={exercise.videoUrl}
          poster={exercise.thumbnailUrl ?? exercise.imageUrl}
          title={exercise.name}
        />
      </div>

      {/* Músculos secundários */}
      {exercise.secondaryMuscles.length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--sp-4)' }}>
          <h2 className="card-title" style={{ marginBottom: 'var(--sp-2)' }}>
            Músculos secundários
          </h2>
          <div className="row row-wrap">
            {exercise.secondaryMuscles.map((m) => (
              <span key={m} className="badge">
                {MUSCLE_LABELS[m] ?? m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Instruções */}
      {instructions.length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--sp-4)' }}>
          <h2 className="card-title" style={{ marginBottom: 'var(--sp-3)' }}>
            Como executar
          </h2>
          <ol className="stack stack-2" style={{ counterReset: 'step' }}>
            {instructions.map((line, i) => (
              <li key={i} className="row" style={{ alignItems: 'flex-start' }}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {i + 1}
                </span>
                <span className="text-muted">{line}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {exercise.description && (
        <div className="card" style={{ marginBottom: 'var(--sp-4)' }}>
          <h2 className="card-title" style={{ marginBottom: 'var(--sp-2)' }}>
            Sobre o exercício
          </h2>
          <p className="text-muted">{exercise.description}</p>
        </div>
      )}

      {/* Ação */}
      <Button
        variant="primary"
        size="lg"
        block
        onClick={handleAddToPlan}
        loading={adding}
        style={{ marginBottom: 'var(--sp-4)' }}
      >
        <IconPlus size={18} />
        Usar em um treino
      </Button>

      {/* Procedência — transparência sobre a origem dos dados */}
      <p className="text-xs text-dim">
        Fonte: {SOURCE_LABELS[exercise.source] ?? exercise.source}
        {exercise.license ? ` · Licença ${exercise.license}` : ''}
        {exercise.sourceUrl && (
          <>
            {' · '}
            <a
              href={exercise.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}
            >
              ver original
            </a>
          </>
        )}
      </p>
    </>
  );
}
