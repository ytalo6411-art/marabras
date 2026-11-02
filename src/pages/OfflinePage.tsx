import { Button } from '@/components/ui';

import { IconWifiOff } from '@/components/icons';
/**
 * Página exibida quando o app está offline e não há nada em cache.
 * Registrada pelo Service Worker como fallback do `navigateFallback`.
 */
export default function OfflinePage() {
  return (
    <div className="offline-page">
      <div className="stack stack-4" style={{ maxWidth: 400, textAlign: 'center' }}>
        <div style={{ display: 'grid', placeItems: 'center', color: 'var(--text-dim)' }} aria-hidden="true">
          <IconWifiOff size={44} />
        </div>
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          Você está offline
        </h1>
        <p className="text-muted">
          Sem conexão com a internet. As páginas já visitadas continuam disponíveis.
        </p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
