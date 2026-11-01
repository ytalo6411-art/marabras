/**
 * Confirmação de exclusão de conta.
 *
 * Substitui o ConfirmDialog genérico porque a exclusão exige mais que um clique:
 *  • digitar EXCLUIR (evita clique acidental);
 *  • reautenticar com a senha quando a conta usa e-mail/senha;
 *  • estado de carregamento e erro visíveis, sem fechar o modal em falha;
 *  • sucesso apenas depois da confirmação real do servidor.
 */

import { useEffect, useState } from 'react';
import { Button, Field, Modal, Alert } from './ui';
import { deleteAccount, hasPasswordIdentity } from '@/services/account';

export function DeleteAccountDialog({
  open,
  onClose,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  /** Chamado somente após o servidor confirmar a exclusão. */
  onDeleted: () => void | Promise<void>;
}) {
  const [confirmation, setConfirmation] = useState('');
  const [password, setPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setConfirmation('');
    setPassword('');
    setError('');
    let active = true;
    void hasPasswordIdentity().then((value) => { if (active) setNeedsPassword(value); });
    return () => { active = false; };
  }, [open]);

  const canConfirm =
    confirmation.trim().toUpperCase() === 'EXCLUIR' &&
    (!needsPassword || password.length > 0) &&
    !deleting;

  async function handleConfirm() {
    if (!canConfirm) return;
    setDeleting(true);
    setError('');

    const result = await deleteAccount(needsPassword ? password : undefined);

    if (!result.ok) {
      setError(result.error ?? 'Não foi possível excluir a conta.');
      setDeleting(false);
      return;
    }

    // Só aqui a conta realmente deixou de existir no servidor.
    await onDeleted();
    setDeleting(false);
  }

  return (
    <Modal
      open={open}
      onClose={deleting ? () => {} : onClose}
      title="Excluir conta permanentemente"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={deleting}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={() => void handleConfirm()} disabled={!canConfirm} loading={deleting}>
            {deleting ? 'Excluindo…' : 'Excluir conta'}
          </Button>
        </>
      }
    >
      <div className="stack stack-3">
        <Alert variant="warning">
          Esta ação remove permanentemente seus treinos, sessões, histórico, diário
          alimentar, medidas, objetivos e foto de perfil. Não é possível desfazer.
        </Alert>

        {error && <Alert variant="error">{error}</Alert>}

        <Field
          label="Digite EXCLUIR para confirmar"
          htmlFor="delete-confirmation"
          hint="Isso evita exclusões por clique acidental."
        >
          <input
            id="delete-confirmation"
            type="text"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
            autoCapitalize="characters"
            maxLength={10}
            disabled={deleting}
            placeholder="EXCLUIR"
          />
        </Field>

        {needsPassword && (
          <Field
            label="Sua senha atual"
            htmlFor="delete-password"
            hint="Confirme sua identidade antes de apagar a conta."
          >
            <input
              id="delete-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              maxLength={200}
              disabled={deleting}
            />
          </Field>
        )}
      </div>
    </Modal>
  );
}
