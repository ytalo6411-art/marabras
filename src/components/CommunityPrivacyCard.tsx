/**
 * Configuração do perfil público.
 *
 * Deixa explícito o que é compartilhado. O padrão é privado: enquanto o usuário
 * não ligar "perfil público", nada aparece na comunidade.
 */

import { useEffect, useState } from 'react';
import { Alert, Button, Card, Field } from './ui';
import { IconGlobe, IconLock, IconBlock } from './icons';
import { useAuthStore } from '@/stores/auth';
import { useToast } from './useToast';
import {
  loadBlocked,
  loadMyAthleteProfile,
  normalizeHandle,
  saveAthleteProfile,
  unblockAthlete,
  validateHandle,
  type AthleteProfile,
} from '@/services/community';

export function CommunityPrivacyCard({ userId }: { userId: string }) {
  const { profile } = useAuthStore();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState<string[]>([]);
  const [form, setForm] = useState<Omit<AthleteProfile, 'user_id'>>({
    handle: '',
    display_name: '',
    bio: '',
    goals: '',
    is_public: false,
    show_workouts: false,
    show_progress: false,
  });

  useEffect(() => {
    let active = true;
    void (async () => {
      const [existing, blockedIds] = await Promise.all([
        loadMyAthleteProfile(userId),
        loadBlocked(userId),
      ]);
      if (!active) return;
      if (existing) {
        setForm({
          handle: existing.handle,
          display_name: existing.display_name,
          bio: existing.bio ?? '',
          goals: existing.goals ?? '',
          is_public: existing.is_public,
          show_workouts: existing.show_workouts,
          show_progress: existing.show_progress,
        });
      } else {
        setForm((prev) => ({ ...prev, display_name: profile?.full_name ?? '' }));
      }
      setBlocked(blockedIds);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [userId, profile?.full_name]);

  const handleInvalid = form.handle ? validateHandle(form.handle) : null;

  async function save() {
    if (saving) return;
    setSaving(true);
    setError('');
    const result = await saveAthleteProfile(userId, form);
    if (!result.ok) {
      setError(result.error ?? 'Não foi possível salvar.');
      setSaving(false);
      return;
    }
    toast.show('Perfil da comunidade salvo', 'success');
    setSaving(false);
  }

  async function unblock(id: string) {
    const result = await unblockAthlete(userId, id);
    if (!result.ok) { toast.show(result.error ?? 'Erro ao desbloquear.', 'error'); return; }
    setBlocked((prev) => prev.filter((value) => value !== id));
    toast.show('Atleta desbloqueado', 'success');
  }

  if (loading) {
    return <Card><p className="text-sm text-muted">Carregando configurações da comunidade…</p></Card>;
  }

  return (
    <Card>
      <h2 className="card-title" style={{ marginBottom: 'var(--sp-2)' }}>
        {form.is_public ? <IconGlobe size={17} /> : <IconLock size={17} />} Perfil na comunidade
      </h2>
      <p className="text-sm text-muted" style={{ marginBottom: 'var(--sp-4)' }}>
        Seu perfil é <strong>{form.is_public ? 'público' : 'privado'}</strong>. Peso, medidas,
        dieta, diário alimentar, e-mail e data de nascimento nunca são compartilhados.
      </p>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="stack stack-3">
        <Field
          label="Nome de usuário"
          htmlFor="athlete-handle"
          hint="Letras minúsculas, números e sublinhado. Aparece como @usuario."
        >
          <input
            id="athlete-handle"
            type="text"
            value={form.handle}
            onChange={(event) => setForm({ ...form, handle: normalizeHandle(event.target.value) })}
            maxLength={30}
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="meu_usuario"
            aria-invalid={Boolean(handleInvalid)}
            aria-describedby={handleInvalid ? 'handle-error' : undefined}
          />
        </Field>
        {handleInvalid && <p className="field-error" id="handle-error" role="alert">{handleInvalid}</p>}

        <Field label="Nome de exibição" htmlFor="athlete-name">
          <input
            id="athlete-name"
            type="text"
            value={form.display_name}
            onChange={(event) => setForm({ ...form, display_name: event.target.value })}
            maxLength={60}
          />
        </Field>

        <Field label="Apresentação (opcional)" htmlFor="athlete-bio" hint="Máximo de 300 caracteres.">
          <textarea
            id="athlete-bio"
            value={form.bio ?? ''}
            onChange={(event) => setForm({ ...form, bio: event.target.value })}
            maxLength={300}
            rows={3}
            placeholder="Conte um pouco sobre você, se quiser."
          />
        </Field>

        <Field label="Objetivos (opcional)" htmlFor="athlete-goals" hint="Máximo de 200 caracteres.">
          <input
            id="athlete-goals"
            type="text"
            value={form.goals ?? ''}
            onChange={(event) => setForm({ ...form, goals: event.target.value })}
            maxLength={200}
            placeholder="Ex.: correr 10 km, treinar 4x por semana"
          />
        </Field>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.is_public}
            onChange={(event) => setForm({ ...form, is_public: event.target.checked })}
          />
          <span>
            Tornar meu perfil público
            <span className="field-hint">Outros atletas poderão ver seu nome, foto e apresentação.</span>
          </span>
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.show_workouts}
            onChange={(event) => setForm({ ...form, show_workouts: event.target.checked })}
            disabled={!form.is_public}
          />
          <span>
            Permitir que eu publique treinos
            <span className="field-hint">Cada treino ainda precisa ser publicado individualmente por você. Desligar esconde os já publicados.</span>
          </span>
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.show_progress}
            onChange={(event) => setForm({ ...form, show_progress: event.target.checked })}
            disabled={!form.is_public}
          />
          <span>
            Mostrar minha consistência
            <span className="field-hint">Compartilha apenas a contagem de treinos concluídos. Nunca carga, peso, medidas ou dieta.</span>
          </span>
        </label>

        <Button onClick={() => void save()} loading={saving} disabled={Boolean(handleInvalid) || !form.handle}>
          Salvar perfil da comunidade
        </Button>
      </div>

      {blocked.length > 0 && (
        <div style={{ marginTop: 'var(--sp-5)' }}>
          <h3 className="section-title"><IconBlock size={15} /> Atletas bloqueados</h3>
          <div className="stack stack-2">
            {blocked.map((id) => (
              <div key={id} className="row row-between">
                <span className="text-sm text-muted truncate">{id}</span>
                <Button variant="ghost" size="sm" onClick={() => void unblock(id)}>Desbloquear</Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
