import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import { Button, Card, EmptyState, SkeletonList } from '@/components/ui';
import { IconCheck } from '@/components/icons';
import { formatRelative } from '@/utils/format';
import type { AppNotification } from '@/types/database';

/** Central de notificações. */
export default function NotificationsPage() {
  const { user, refreshUnreadCount } = useAuthStore();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function markAllRead() {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    await load();
    await refreshUnreadCount();
  }

  return (
    <>
      <div className="row-between" style={{ marginBottom: 'var(--sp-4)' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>
            Notificações
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Lembretes, conquistas e avisos.
          </p>
        </div>
        {items.some((i) => !i.is_read) && (
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            <IconCheck size={15} />
            Marcar todas
          </Button>
        )}
      </div>

      {loading ? (
        <SkeletonList count={4} height={70} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="Nenhuma notificação"
          text="Conquistas, lembretes e avisos aparecem aqui."
        />
      ) : (
        <div className="stack stack-2">
          {items.map((n) => (
            <Card
              key={n.id}
              style={
                !n.is_read
                  ? { borderLeft: '3px solid var(--accent)' }
                  : { opacity: 0.65 }
              }
            >
              <div className="row" style={{ alignItems: 'flex-start' }}>
                <span
                  aria-hidden="true"
                  style={{ fontSize: '1.2rem', lineHeight: 1.2 }}
                >
                  {n.type === 'achievement'
                    ? '🏆'
                    : n.type === 'success'
                      ? '✅'
                      : n.type === 'warning'
                        ? '⚠️'
                        : n.type === 'error'
                          ? '⛔'
                          : 'ℹ️'}
                </span>
                <div className="grow">
                  <div style={{ fontWeight: 600 }}>{n.title}</div>
                  {n.body && (
                    <p className="text-sm text-muted" style={{ marginTop: 2 }}>
                      {n.body}
                    </p>
                  )}
                  <div className="text-xs text-dim" style={{ marginTop: 4 }}>
                    {formatRelative(n.created_at)}
                  </div>
                </div>
                {!n.is_read && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={async () => {
                      await supabase
                        .from('notifications')
                        .update({ is_read: true })
                        .eq('id', n.id);
                      await load();
                      await refreshUnreadCount();
                    }}
                    aria-label="Marcar como lida"
                  >
                    <IconCheck size={15} />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
