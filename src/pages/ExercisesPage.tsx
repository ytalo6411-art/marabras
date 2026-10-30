import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchExercises, getCategories, type ExerciseResult } from '@/services/exercises';
import { Button, EmptyState, SkeletonList } from '@/components/ui';
import { IconSearch, IconX } from '@/components/icons';
import type { ExerciseCategory } from '@/types/database';

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

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

/**
 * Biblioteca de exercícios.
 *
 * Busca com debounce (não dispara requisição a cada tecla), paginação por
 * "carregar mais" e filtro por grupo muscular e dificuldade.
 */
export default function ExercisesPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [muscle, setMuscle] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const PAGE_SIZE = 24;

  // Debounce de 350 ms na busca.
  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedQuery(query);
      setPage(0);
    }, 350);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    searchExercises({
      query: debouncedQuery,
      muscle: muscle ?? undefined,
      difficulty: difficulty ?? undefined,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    })
      .then((data) => {
        if (cancelled) return;
        setResults((prev) => (page === 0 ? data : [...prev, ...data]));
      })
      .catch(() => {
        if (cancelled) return;
        setError('Não foi possível carregar os exercícios. Tente novamente.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, muscle, difficulty, page]);

  const activeFilters = useMemo(
    () => [muscle, difficulty].filter(Boolean).length,
    [muscle, difficulty],
  );

  function clearFilters() {
    setMuscle(null);
    setDifficulty(null);
    setQuery('');
  }

  return (
    <>
      <h1 className="page-title">Biblioteca de exercícios</h1>
      <p className="page-subtitle">
        Vídeos demonstrativos e instruções de {results.length > 0 ? 'centenas de' : ''}{' '}
        exercícios com fontes abertas.
      </p>

      {/* Busca */}
      <div className="input-group" style={{ marginBottom: 'var(--sp-4)' }}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome ou grupo muscular…"
          aria-label="Buscar exercícios"
          style={{ paddingLeft: 44, paddingRight: query ? 44 : 16 }}
        />
        <span
          style={{
            position: 'absolute',
            left: 14,
            display: 'grid',
            placeItems: 'center',
            color: 'var(--text-dim)',
            pointerEvents: 'none',
          }}
        >
          <IconSearch size={18} />
        </span>
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="Limpar busca">
            <IconX size={16} />
          </button>
        )}
      </div>

      {/* Filtros por grupo muscular */}
      <div className="chips" role="group" aria-label="Filtrar por grupo muscular">
        <button
          type="button"
          className="chip"
          aria-pressed={muscle === null}
          onClick={() => {
            setMuscle(null);
            setPage(0);
          }}
        >
          Todos
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className="chip"
            aria-pressed={muscle === c.muscle_group}
            onClick={() => {
              setMuscle(muscle === c.muscle_group ? null : c.muscle_group);
              setPage(0);
            }}
          >
            {c.name_pt}
          </button>
        ))}
      </div>

      {/* Dificuldade */}
      <div className="chips" role="group" aria-label="Filtrar por dificuldade">
        <button
          type="button"
          className="chip"
          aria-pressed={difficulty === null}
          onClick={() => {
            setDifficulty(null);
            setPage(0);
          }}
        >
          Qualquer nível
        </button>
        {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className="chip"
            aria-pressed={difficulty === value}
            onClick={() => {
              setDifficulty(difficulty === value ? null : value);
              setPage(0);
            }}
          >
            {label}
          </button>
        ))}
        {activeFilters > 0 && (
          <button type="button" className="chip" onClick={clearFilters}>
            Limpar filtros
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          <span>{error}</span>
        </div>
      )}

      {loading && page === 0 ? (
        <SkeletonList count={6} height={120} />
      ) : results.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="Nenhum exercício encontrado"
          text="Tente outro termo ou limpe os filtros."
          action={
            <Button variant="secondary" onClick={clearFilters}>
              Limpar busca
            </Button>
          }
        />
      ) : (
        <>
          <div className="exercise-grid">
            {results.map((ex) => (
              <Link
                key={ex.key}
                to={`/app/exercises/${ex.slug}`}
                className="exercise-card"
                aria-label={`Ver detalhes de ${ex.name}`}
              >
                <div className="exercise-card__thumb">
                  {ex.thumbnailUrl ? (
                    <img
                      src={ex.thumbnailUrl}
                      alt=""
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span style={{ fontSize: '1.6rem' }} aria-hidden="true">
                      🏋️
                    </span>
                  )}
                </div>
                <div className="exercise-card__body">
                  <div className="exercise-card__name">{ex.name}</div>
                  <div className="row row-wrap" style={{ gap: 4 }}>
                    <span className="badge">{MUSCLE_LABELS[ex.primaryMuscle] ?? ex.primaryMuscle}</span>
                    {ex.videoUrl && <span className="badge badge-accent">vídeo</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {results.length >= PAGE_SIZE && (
            <div className="center" style={{ marginTop: 'var(--sp-5)' }}>
              <Button variant="secondary" onClick={() => setPage((p) => p + 1)} loading={loading}>
                Carregar mais
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
