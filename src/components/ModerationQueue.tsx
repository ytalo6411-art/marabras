/**
 * Fila de moderação de denúncias.
 *
 * O acesso é do servidor: `admin_content_reports` só devolve linhas para quem
 * passa em `public.is_admin()`, e a resolução passa por uma RPC que revalida o
 * papel. Esconder o botão não é a proteção — a política é.
 *
 * Derrubar conteúdo é reversível: muda `is_public`, não apaga o treino.
 */

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Card, EmptyState, SkeletonList } from './ui';
import { IconFlag, IconShield } from './icons';
import { useToast } from './useToast';
import { REPORT_REASONS } from '@/data/community';
import {
  loadReportQueue,
  resolveReport,
  type ModerationReport,
  type ReportStatus,
} from '@/services/community';
import { formatDate } from '@/utils/format';

const FILTERS: { value: ReportStatus; label: string }[] = [
  { value: 'open', label: 'Pendentes' },
  { value: 'reviewed', label: 'Aceitas' },
  { value: 'dismissed', label: 'Arquivadas' },
];

function reasonLabel(value: string): string {
  return REPORT_REASONS.find((item) => item.value === value)?.label ?? value;
}

export function ModerationQueue() {
  const toast = useToast();
  const [status, setStatus] = useState<ReportStatus>('open');
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setReports(await loadReportQueue(status));
    } catch {
      setError('Não foi possível carregar a fila de denúncias.');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { void load(); }, [load]);

  async function resolve(report: ModerationReport, decision: 'reviewed' | 'dismissed', hide: boolean) {
    if (busyId) return;
    setBusyId(report.id);
    const result = await resolveReport(report.id, decision, hide);
    setBusyId(null);
    if (!result.ok) {
      toast.show(result.error ?? 'Não foi possível resolver.', 'error');
      return;
    }
    // Só remove da lista depois da confirmação do servidor.
    setReports((prev) => prev.filter((item) => item.id !== report.id));
    toast.show(
      hide ? 'Denúncia aceita e conteúdo ocultado' : decision === 'reviewed' ? 'Denúncia aceita' : 'Denúncia arquivada',
      'success',
    );
  }

  return (
    <>
      <div className="chips" role="tablist" aria-label="Estado das denúncias" style={{ marginBottom: 'var(--sp-4)' }}>
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            role="tab"
            className="chip"
            aria-selected={status === filter.value}
            onClick={() => setStatus(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <SkeletonList count={3} height={120} />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={<IconShield size={28} />}
          title={status === 'open' ? 'Nenhuma denúncia pendente' : 'Nada neste filtro'}
          text={status === 'open' ? 'A fila está limpa. Novas denúncias aparecem aqui.' : undefined}
        />
      ) : (
        <div className="stack stack-3">
          {reports.map((report) => (
            <Card key={report.id}>
              <div className="row row-wrap" style={{ gap: 'var(--sp-2)', marginBottom: 'var(--sp-2)' }}>
                <span className="badge badge-warning">
                  <IconFlag size={12} />
                  {reasonLabel(report.reason)}
                </span>
                <span className="badge">{report.workout_id ? 'Treino' : 'Atleta'}</span>
                <span className="text-xs text-dim">{formatDate(report.created_at)}</span>
              </div>

              {report.workout_title && (
                <p className="text-sm">
                  <strong>Treino:</strong>{' '}
                  {report.workout_is_public === false ? (
                    <span className="text-muted">{report.workout_title} (já oculto)</span>
                  ) : (
                    <Link to={`/app/community/${report.workout_id}`}>{report.workout_title}</Link>
                  )}
                </p>
              )}
              {report.reported_handle && (
                <p className="text-sm">
                  <strong>Atleta:</strong>{' '}
                  <Link to={`/app/community/atleta/${report.reported_handle}`}>@{report.reported_handle}</Link>
                </p>
              )}
              {report.details && (
                <p className="text-sm text-muted" style={{ marginTop: 'var(--sp-2)', overflowWrap: 'anywhere' }}>
                  {report.details}
                </p>
              )}
              <p className="text-xs text-dim" style={{ marginTop: 'var(--sp-2)' }}>
                Denunciado por {report.reporter_handle ? `@${report.reporter_handle}` : 'conta removida'}
              </p>

              {status === 'open' && (
                <div className="row row-wrap" style={{ gap: 'var(--sp-2)', marginTop: 'var(--sp-3)' }}>
                  {report.workout_id && report.workout_is_public !== false && (
                    <Button
                      variant="danger"
                      size="sm"
                      loading={busyId === report.id}
                      disabled={Boolean(busyId) && busyId !== report.id}
                      onClick={() => void resolve(report, 'reviewed', true)}
                    >
                      Aceitar e ocultar treino
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={busyId === report.id}
                    disabled={Boolean(busyId) && busyId !== report.id}
                    onClick={() => void resolve(report, 'reviewed', false)}
                  >
                    Aceitar sem ocultar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={busyId === report.id}
                    disabled={Boolean(busyId) && busyId !== report.id}
                    onClick={() => void resolve(report, 'dismissed', false)}
                  >
                    Arquivar
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}