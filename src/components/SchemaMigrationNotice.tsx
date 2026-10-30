import { useEffect, useRef, useState } from 'react';
import { Alert, Button } from '@/components/ui';
import { IconCheck, IconDownload, IconShield } from '@/components/icons';
import {
  MIGRATION_FILE,
  MIGRATION_URL,
  fetchMigrationSql,
  type SchemaCapabilities,
} from '@/services/dbCapabilities';

/**
 * Aviso de schema pendente.
 *
 * Aparece apenas quando o banco confirma que falta a migração de
 * personalização. Explica o que acontece (o que funciona e o que não funciona),
 * mostra o comando exato e permite copiar/baixar o SQL — sem pedir nenhuma
 * credencial no navegador.
 */
export function SchemaMigrationNotice({
  capabilities,
  compact,
}: {
  capabilities: SchemaCapabilities | null;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  if (!capabilities) return null;
  if (capabilities.trainingProfiles && capabilities.planProgramColumns) return null;

  const missing = [
    !capabilities.trainingProfiles ? 'tabela `training_profiles`' : null,
    !capabilities.planProgramColumns ? 'colunas de programa em `workout_plans`' : null,
  ].filter(Boolean);

  async function copySql() {
    setCopyError(null);
    try {
      const sql = await fetchMigrationSql();

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(sql);
      } else {
        // Fallback para navegadores sem Clipboard API (http, WebViews antigos).
        const area = document.createElement('textarea');
        area.value = sql;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        document.body.removeChild(area);
      }

      setCopied(true);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 4000);
    } catch {
      setCopyError('Não foi possível copiar automaticamente. Use o botão de download.');
    }
  }

  return (
    <Alert variant="warning">
      <div className="schema-notice">
        <p>
          <strong>Falta aplicar a migração de personalização no banco.</strong> Enquanto isso, o app
          funciona em modo local:
        </p>

        {!compact && (
          <ul className="schema-notice__list">
            <li>
              <IconShield size={14} aria-hidden="true" />
              O questionário é salvo <strong>neste dispositivo</strong> e o plano é gerado normalmente.
            </li>
            <li>
              <IconShield size={14} aria-hidden="true" />
              O que não fica disponível: sincronizar as preferências na sua conta, agrupar os dias em
              um programa semanal e regenerar um dia usando os metadados salvos.
            </li>
            <li>
              <IconShield size={14} aria-hidden="true" />
              Nada é apagado: ao aplicar a migração, os próximos salvamentos vão para o banco.
            </li>
          </ul>
        )}

        <p className="text-sm text-muted">
          Falta: {missing.join(' e ')}.
        </p>

        <pre className="schema-notice__code">
          {`SUPABASE_ACCESS_TOKEN=<seu-token> node scripts/apply-migrations.mjs \\\n  --project-ref <ref-do-projeto>`}
        </pre>

        <p className="text-xs text-dim">
          Alternativa sem CLI/token: Supabase Dashboard → SQL Editor → cole o conteúdo de{' '}
          <code>supabase/migrations/{MIGRATION_FILE}</code>. O arquivo é idempotente
          (<code>if not exists</code>) — pode rodar mais de uma vez.
        </p>

        <div className="row row-wrap" style={{ gap: 8 }}>
          <Button variant="secondary" size="sm" onClick={() => void copySql()}>
            {copied ? <IconCheck size={15} /> : <IconDownload size={15} />}
            {copied ? 'SQL copiado' : 'Copiar SQL da migração'}
          </Button>

          <a className="btn btn-ghost btn-sm" href={MIGRATION_URL} download={MIGRATION_FILE}>
            <IconDownload size={15} />
            Baixar .sql
          </a>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
            title="Recarregar depois de aplicar a migração"
          >
            Já apliquei — recarregar
          </Button>
        </div>

        {copyError && <p className="text-xs text-dim">{copyError}</p>}
      </div>
    </Alert>
  );
}
