import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/components/useToast';
import { Alert, Button, EmptyState, Field, SkeletonList } from '@/components/ui';
import { IconSearch, IconUsers, IconBookmark } from '@/components/icons';
import { AthleteResultCard, SharedWorkoutCard } from '@/components/community';
import {
  loadFeed,
  loadMyLikes,
  loadMySaves,
  loadSavedWorkouts,
  searchAthletes,
  toggleLike,
  toggleSave,
  type AthleteCard,
  type SharedWorkout,
} from '@/services/community';

type Tab = 'feed' | 'salvos' | 'atletas';

const PAGE_SIZE = 20;

const TABS: { value: Tab; label: string }[] = [
  { value: 'feed', label: 'Treinos publicados' },
  { value: 'salvos', label: 'Salvos' },
  { value: 'atletas', label: 'Atletas' },
];

/**
 * Comunidade.
 *
 * Só aparece conteúdo que o autor publicou voluntariamente. Perfis privados e
 * treinos não publicados nunca chegam ao cliente — a filtragem é do servidor.
 * "Salvos" é uma lista privada: ninguém vê o que você guardou.
 */
export default function CommunityPage() {
  const { user } = useAuthStore();
  const toast = useToast();

  const [tab, setTab] = useState<Tab>('feed');
  const [feed, setFeed] = useState<SharedWorkout[]>([]);
  const [saved, setSaved] = useState<SharedWorkout[]>([]);
  const [athletes, setAthletes] = useState<AthleteCard[]>([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [saves, setSaves] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
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
        const items = await loadFeed(PAGE_SIZE);
        setFeed(items);
        setHasMore(items.length === PAGE_SIZE);
        const ids = items.map((item) => item.id);
        const [likes, mySaves] = await Promise.all([
          loadMyLikes(user.id, ids),
          loadMySaves(user.id, ids),
        ]);
        setLiked(likes);
        setSaves(mySaves);
      } else if (tab === 'salvos') {
        const items = await loadSavedWorkouts(user.id);
        setSaved(items);
        setSaves(new Set(items.map((item) => item.id)));
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

  /** Cursor por data: continua de onde parou, sem repetir nem pular publicações. */
  async function loadMore() {
    if (loadingMore || feed.length === 0) return;
    setLoadingMore(true);
    try {
      const cursor = feed[feed.length - 1]?.created_at;
      if (!cursor) return;
      const items = await loadFeed(PAGE_SIZE, cursor);
      setHasMore(items.length === PAGE_SIZE);
      setFeed((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        return [...prev, ...items.filter((item) => !seen.has(item.id))];
      });
      if (user && items.length > 0) {
        const ids = items.map((item) => item.id);
        const [likes, mySaves] = await Promise.all([
          loadMyLikes(user.id, ids),
          loadMySaves(user.id, ids),
        ]);
        setLiked((prev) => new Set([...prev, ...likes]));
        setSaves((prev) => new Set([...prev, ...mySaves]));
      }
    } catch {
      toast.show('Não foi possível carregar mais treinos.', 'error');
    } finally {
      setLoadingMore(false);
    }
  }

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
    const bump = (item: SharedWorkout) => item.id === workout.id
      ? { ...item, like_count: item.like_count + (wasLiked ? -1 : 1) }
      : item;
    setFeed((prev) => prev.map(bump));
    setSaved((prev) => prev.map(bump));

    const result = await toggleLike(workout.id, user.id, wasLiked);
    if (!result.ok) {
      setLiked((prev) => {
        const next = new Set(prev);
        if (wasLiked) next.add(workout.id); else next.delete(workout.id);
        return next;
      });
      const revert = (item: SharedWorkout) => item.id === workout.id
        ? { ...item, like_count: item.like_count + (wasLiked ? 1 : -1) }
        : item;
      setFeed((prev) => prev.map(revert));
      setSaved((prev) => prev.map(revert));
      toast.show(result.error ?? 'Não foi possível curtir.', 'error');
    }
    setBusyId(null);
  }

  async function handleSave(workout: SharedWorkout) {
    if (!user || busyId) return;
    const wasSaved = saves.has(workout.id);
    setBusyId(workout.id);

    const result = await toggleSave(workout.id, user.id, wasSaved);
    if (!result.ok) {
      toast.show(result.error ?? 'Não foi possível salvar.', 'error');
      setBusyId(null);
      return;
    }
    setSaves((prev) => {
      const next = new Set(prev);
      if (wasSaved) next.delete(workout.id); else next.add(workout.id);
      return next;
    });
    // Na aba Salvos, remover tira o card da lista imediatamente.
    if (wasSaved) setSaved((prev) => prev.filter((item) => item.id !== workout.id));
    toast.show(wasSaved ? 'Removido dos salvos' : 'Treino salvo', 'success');
    setBusyId(null);
  }

  const list = tab === 'salvos' ? saved : feed;

  return (
    <>
      <h1 className="page-title">Comunidade</h1>
      <p className="page-subtitle">
        Estude treinos que outros atletas escolheram publicar. Seus dados privados nunca aparecem aqui.
      </p>

      <div className="chips" role="tablist" aria-label="Seções da comunidade" style={{ marginBottom: 'var(--sp-4)' }}>
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            className="chip"
            aria-selected={tab === item.value}
            onClick={() => setTab(item.value)}
          >
            {item.label}
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
      ) : tab === 'atletas' ? (
        athletes.length === 0 ? (
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
              <AthleteResultCard key={athlete.user_id} athlete={athlete} />
            ))}
          </div>
        )
      ) : list.length === 0 ? (
        tab === 'salvos' ? (
          <EmptyState
            icon={<IconBookmark size={28} />}
            title="Nenhum treino salvo"
            text="Toque em Salvar em qualquer treino publicado para guardá-lo aqui. Sua lista é privada."
            action={<Button variant="secondary" onClick={() => setTab('feed')}>Ver treinos publicados</Button>}
          />
        ) : (
          <EmptyState
            icon={<IconUsers size={28} />}
            title="Ainda não há treinos publicados"
            text="Seja o primeiro: publique um treino seu em Treinos e ele aparece aqui. Nada é compartilhado automaticamente."
            action={<Link to="/app/workouts" className="btn btn-primary">Ver meus treinos</Link>}
          />
        )
      ) : (
        <>
          <div className="stack stack-4">
            {list.map((workout) => (
              <SharedWorkoutCard
                key={workout.id}
                workout={workout}
                liked={liked.has(workout.id)}
                saved={saves.has(workout.id)}
                busy={busyId === workout.id}
                onLike={() => void handleLike(workout)}
                onSave={() => void handleSave(workout)}
              />
            ))}
          </div>
          {tab === 'feed' && hasMore && (
            <div style={{ marginTop: 'var(--sp-4)', textAlign: 'center' }}>
              <Button variant="secondary" onClick={() => void loadMore()} loading={loadingMore}>
                Carregar mais treinos
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}