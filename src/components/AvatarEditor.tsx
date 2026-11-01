/**
 * Editor de foto de perfil: ver, trocar e remover.
 *
 * O input de arquivo fica oculto e é acionado por um botão real com rótulo —
 * nada de área clicável sem semântica. Estados de envio e erro são explícitos.
 */

import { useRef, useState } from 'react';
import { Avatar, Button, Alert } from './ui';
import { IconEdit, IconTrash } from './icons';
import { useAuthStore } from '@/stores/auth';
import { useToast } from './useToast';
import { uploadAvatar, removeAvatar, ACCEPTED_AVATAR_TYPES } from '@/services/avatar';

export function AvatarEditor({
  name,
  src,
  userId,
}: {
  name?: string | null;
  src?: string | null;
  userId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const toast = useToast();

  async function handleFile(file: File | undefined) {
    if (!file || busy) return;
    setBusy(true);
    setError('');

    const result = await uploadAvatar(userId, file);
    if (!result.ok) {
      setError(result.error ?? 'Não foi possível enviar a foto.');
      setBusy(false);
      return;
    }

    await refreshProfile();
    toast.show('Foto de perfil atualizada', 'success');
    setBusy(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function handleRemove() {
    if (busy) return;
    setBusy(true);
    setError('');

    const result = await removeAvatar(userId);
    if (!result.ok) {
      setError(result.error ?? 'Não foi possível remover a foto.');
      setBusy(false);
      return;
    }

    await refreshProfile();
    toast.show('Foto removida', 'success');
    setBusy(false);
  }

  return (
    <div className="avatar-editor">
      <Avatar name={name} src={src} size="xl" />

      <div className="avatar-editor__actions">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_AVATAR_TYPES.join(',')}
          className="sr-only"
          id="avatar-file"
          onChange={(event) => void handleFile(event.target.files?.[0])}
          disabled={busy}
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => inputRef.current?.click()}
          loading={busy}
          type="button"
        >
          <IconEdit size={15} />
          {src ? 'Trocar foto' : 'Adicionar foto'}
        </Button>

        {src && (
          <Button variant="ghost" size="sm" onClick={() => void handleRemove()} disabled={busy} type="button">
            <IconTrash size={15} />
            Remover
          </Button>
        )}
      </div>

      <p className="text-xs text-dim">JPG, PNG ou WebP de até 2 MB.</p>
      {error && <Alert variant="error">{error}</Alert>}
    </div>
  );
}
