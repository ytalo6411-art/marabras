import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/components/useToast';
import { Alert, Avatar, Button, Card, EmptyState, Field, SkeletonList } from '@/components/ui';
import { IconSearch, IconUsers, IconHeart, IconComment } from '@/components/icons';
import {
  loadFeed,
  loadMyLikes,
  searchAthletes,
  toggleLike,
  type AthleteCard,
  type SharedWorkout,
} from '@/services/community';
import { formatDate } from '@/utils/format';

type Tab = 'feed' | 'atletas';

/**
 * Comunidade.
 *
 * Só aparece conteúdo que o autor publicou voluntariamente. Perfis privados e
 * treinos não publicados nunca chegam ao cliente — a filtragem é do servidor.
 */
export default function CommunityPage() {
  const { user } = useAuthStore();
  const toast = useToast();

  const [tab, setTab] = useState<Tab>('feed');
  const [feed, setFeed] = useState<SharedWorkout[]>([]);
  const [athletes, setAthletes] = useState<AthleteCard[]>([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      if (tab === 'feed') {
        const items = await loadFeed();
        setFeed(items);
        setLiked(await loadMyLikes(user.id, items.map((item) => item.id)));
      } else {
        setAthletes(await searchAthletes(debounced));
      }
    } catch {
      setError('Não foi possível carregar a comunidade. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [tab, debounced, user]);

  useEffect(() => { void load(); }, [load]);

  async function handleLike(workout: SharedWorkout) {
    if (!user || busyId) return;
    const wasLiked = liked.has(workout.id);
    setBusyId(workout.id);

    // Otimista, mas revertido se o servidor recusar.
    setLiked((prev) => {
      const next = new Set(prev);
      if (wasLiked) next.delete(workout.id); else next.add(workout.id);
      return next;
    });
    setFeed((prev) => prev.map((item) => item.id === workout.id
      ? { ...item, like_count: item.like_count + (wasLiked ? -1 : 1) }
      : item));

    const result = await toggleLike(workout.id, user.id, wasLiked);
    if (!result.ok) {
      setLiked((prev) => {
        const next = new Set(prev);
        if (wasLiked) next.add(workout.id); else next.delete(workout.id);
        return next;
      });
      setFeed((prev) => prev.map((item) => item.id === workout.id
        ? { ...item, like_count: item.like_count + (wasLiked ? 1 : -1) }
        : item));
      toast.show(result.error ?? 'Não foi possível curtir.', 'error');
    }
    setBusyId(null);
  }

  const exerciseCount = useMemo(
    () => (workout: SharedWorkout) =>
      (workout.snapshot?.days ?? []).reduce((total, day) => total + (day.exercises?.length ?? 0), 0),
    [],
  );

  return (
    <>
      <h1 className="page-title">Comunidade</h1>
      <p className="page-subtitle">
        Estude treinos que outros atletas escolheram publicar. Seus dados privados nunca aparecem aqui.
      </p>

      <div className="chips" role="tablist" aria-label="Seções da comunidade" style={{ marginBottom: 'var(--sp-4)' }}>
        {([['feed', 'Treinos publicados'], ['atletas', 'Atletas']] as [Tab, string][]).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            className="chip"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'atletas' && (
        <Field label="Buscar atletas" htmlFor="athlete-search">
          <div className="input-group">
            <input
              id="athlete-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nome ou @usuário"
              maxLength={60}
              style={{ paddingLeft: 42 }}
            />
            <span className="input-group__icon" aria-hidden="true"><IconSearch size={17} /></span>
          </div>
        </Field>
      )}

      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <SkeletonList count={3} height={120} />
      ) : tab === 'feed' ? (
        feed.length === 0 ? (
          <EmptyState
            icon={<IconUsers size={28} />}
            title="Ainda não há treinos publicados"
            text="Seja o primeiro: publique um treino seu em Treinos e ele aparece aqui. Nada é compartilhado automaticamente."
            action={<Link to="/app/workouts" className="btn btn-primary">Ver meus treinos</Link>}
          />
        ) : (
          <div className="stack stack-4">
            {feed.map((workout) => (
              <Card key={workout.id}>
                <div className="row row-wrap" style={{ gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
                  <Avatar name={workout.author?.display_name} src={workout.author?.avatar_url} size="md" />
                  <div className="grow" style={{ minWidth: 0 }}>
                    <strong className="truncate">{workout.author?.display_name ?? 'Atleta'}</strong>
                    <p className="text-xs text-dim">
                      {workout.author?.handle ? `@${workout.author.handle} · ` : ''}
                      {formatDate(workout.created_at)}
                    </p>
                  </div>
                </div>

                <h2 className="card-title">{workout.title}</h2>
                {workout.description && (
                  <p className="text-sm text-muted" style={{ marginTop: 6 }}>{workout.description}</p>
                )}

                <div className="row row-wrap" style={{ gap: 6, marginTop: 'var(--sp-3)' }}>
                  <span className="badge">{workout.snapshot?.days?.length ?? 0} dia(s)</span>
                  <span className="badge">{exerciseCount(workout)} exercícios</span>
                </div>

                <div className="row row-wrap" style={{ gap: 'var(--sp-2)', marginTop: 'var(--sp-3)' }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleLike(workout)}
                    disabled={busyId === workout.id}
                    aria-pressed={liked.has(workout.id)}
                    aria-label={liked.has(workout.id) ? 'Remover curtida' : 'Curtir treino'}
                  >
                    <IconHeart size={15} />
                    {workout.like_count}
                  </Button>
                  <Link to={`/app/community/${workout.id}`} className="btn btn-secondary btn-sm">
                    <IconComment size={15} />
                    Ver treino · {workout.comment_count}
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : athletes.length === 0 ? (
        <EmptyState
          icon={<IconUsers size={28} />}
          title={debounced ? 'Nenhum atleta encontrado' : 'Nenhum perfil público ainda'}
          text={debounced
            ? 'Tente outro nome ou @usuário.'
            : 'Perfis são privados por padrão. Crie o seu em Perfil para aparecer aqui.'}
          action={<Link to="/app/profile" className="btn btn-primary">Configurar meu perfil</Link>}
        />
      ) : (
        <div className="stack stack-3">
          {athletes.map((athlete) => (
            <Card key={athlete.user_id}>
              <div className="row" style={{ gap: 'var(--sp-3)' }}>
                <Avatar name={athlete.display_name} src={athlete.avatar_url} size="md" />
                <div className="grow" style={{ minWidth: 0 }}>
                  <strong className="truncate">{athlete.display_name}</strong>
                  <p className="text-xs text-dim">@{athlete.handle}</p>
                  {athlete.goals && <p className="text-sm text-muted" style={{ marginTop: 4 }}>{athlete.goals}</p>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
