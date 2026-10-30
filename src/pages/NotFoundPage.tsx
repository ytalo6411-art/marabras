import { Link } from 'react-router-dom';
import { IconHome } from '@/components/icons';

/** Página 404. */
export default function NotFoundPage() {
  return (
    <div className="offline-page">
      <div className="stack stack-4" style={{ maxWidth: 420, textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--accent)' }}>404</div>
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          Página não encontrada
        </h1>
        <p className="text-muted">
          O endereço que você tentou acessar não existe ou foi movido.
        </p>
        <Link to="/app" className="btn btn-primary btn-lg">
          <IconHome size={18} />
          Ir para o início
        </Link>
      </div>
    </div>
  );
}
