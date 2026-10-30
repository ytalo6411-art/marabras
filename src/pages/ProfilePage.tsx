import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/components/useToast';
import { Button, Card, Field, Avatar, Alert } from '@/components/ui';
import { IconEdit, IconTarget, IconDownload, IconTrash } from '@/components/icons';
import { formatDate } from '@/utils/format';
import type { FitnessGoal } from '@/types/database';

/** Perfil do usuário: dados pessoais, avatar e objetivos. */
export default function ProfilePage() {
  const { profile, user, refreshProfile } = useAuthStore();
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [goals, setGoals] = useState<FitnessGoal[]>([]);

  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');

  const [newGoal, setNewGoal] = useState({ title: '', goalType: 'strength', targetValue: '' });

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? '');
    setBirthDate(profile.birth_date ?? '');
    setHeight(profile.height_cm ? String(profile.height_cm) : '');
    setWeight(profile.weight_kg ? String(profile.weight_kg) : '');
    setBio(profile.bio ?? '');
    setCity(profile.city ?? '');
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('fitness_goals')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => setGoals(data ?? []));
  }, [user]);

  /** Determina se o usuário é menor de idade a partir da data de nascimento. */
  function isMinor(birth: string): boolean {
    if (!birth) return false;
    const b = new Date(birth);
    if (Number.isNaN(b.getTime())) return false;
    const now = new Date();
    let age = now.getFullYear() - b.getFullYear();
    const m = now.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
    return age < 18;
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      const minor = isMinor(birthDate);

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim() || null,
          birth_date: birthDate || null,
          height_cm: height ? Number(height) : null,
          weight_kg: weight ? Number(weight) : null,
          bio: bio.trim() || null,
          city: city.trim() || null,
          is_minor: minor,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      toast.show('Perfil atualizado', 'success');
      setEditing(false);
    } catch {
      toast.show('Não foi possível salvar o perfil.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function addGoal() {
    if (!user || !newGoal.title.trim()) return;
    try {
      await supabase.from('fitness_goals').insert({
        user_id: user.id,
        title: newGoal.title.trim(),
        goal_type: newGoal.goalType,
        target_value: newGoal.targetValue ? Number(newGoal.targetValue) : null,
        status: 'active',
      });
      setNewGoal({ title: '', goalType: 'strength', targetValue: '' });
      const { data } = await supabase
        .from('fitness_goals')
        .select('*')
        .eq('status', 'active');
      setGoals(data ?? []);
      toast.show('Objetivo criado', 'success');
    } catch {
      toast.show('Não foi possível criar o objetivo.', 'error');
    }
  }

  async function deleteGoal(id: string) {
    await supabase.from('fitness_goals').delete().eq('id', id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  /** Exporta os dados do usuário (LGPD — direito de portabilidade). */
  async function exportData() {
    if (!user) return;
    toast.show('Preparando a exportação…', 'info');

    try {
      const tables = [
        'profiles',
        'fitness_goals',
        'workout_plans',
        'workout_sessions',
        'body_measurements',
        'food_diary',
        'hydration_logs',
        'personal_records',
      ];

      const dump: Record<string, unknown> = {};

      for (const table of tables) {
        const { data } = await supabase.from(table).select('*');
        dump[table] = data ?? [];
      }

      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `athletix-dados-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.show('Dados exportados', 'success');
    } catch {
      toast.show('Não foi possível exportar os dados.', 'error');
    }
  }

  const minor = profile?.is_minor ?? isMinor(profile?.birth_date ?? '');

  return (
    <>
      <h1 className="page-title">Perfil</h1>

      <Card style={{ marginBottom: 'var(--sp-4)' }}>
        <div className="row" style={{ marginBottom: 'var(--sp-4)' }}>
          <Avatar
            name={profile?.full_name}
            src={profile?.avatar_url}
            size="xl"
          />
          <div className="grow">
            <h2 className="card-title">{profile?.full_name ?? 'Seu nome'}</h2>
            <p className="text-sm text-muted">{profile?.email}</p>
            <p className="text-xs text-dim">
              Membro desde {profile ? formatDate(profile.created_at) : '—'}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setEditing((v) => !v)}
          >
            <IconEdit size={15} />
            {editing ? 'Cancelar' : 'Editar'}
          </Button>
        </div>

        {editing ? (
          <div>
            <Field label="Nome" htmlFor="p-name">
              <input
                id="p-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={120}
              />
            </Field>

            <Field
              label="Data de nascimento"
              htmlFor="p-birth"
              hint={
                minor
                  ? 'Você é menor de idade. As opções de restrição calórica ficam bloqueadas por segurança.'
                  : undefined
              }
            >
              <input
                id="p-birth"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
              <Field label="Altura (cm)" htmlFor="p-height">
                <input
                  id="p-height"
                  type="number"
                  min={50}
                  max={300}
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </Field>
              <Field label="Peso (kg)" htmlFor="p-weight">
                <input
                  id="p-weight"
                  type="number"
                  step={0.1}
                  min={20}
                  max={500}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </Field>
            </div>

            <Field label="Cidade" htmlFor="p-city">
              <input
                id="p-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                maxLength={100}
              />
            </Field>

            <Field label="Sobre você" htmlFor="p-bio">
              <textarea
                id="p-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={1000}
                placeholder="Sua modalidade, experiência, objetivos…"
              />
            </Field>

            <Button variant="primary" block onClick={handleSave} loading={saving}>
              Salvar alterações
            </Button>
          </div>
        ) : (
          <div className="stack stack-2">
            <Row label="Altura" value={profile?.height_cm ? `${profile.height_cm} cm` : '—'} />
            <Row label="Peso" value={profile?.weight_kg ? `${profile.weight_kg} kg` : '—'} />
            <Row label="Cidade" value={profile?.city ?? '—'} />
            <Row label="Bio" value={profile?.bio ?? '—'} />
          </div>
        )}
      </Card>

      {minor && (
        <Alert variant="info">
          <strong>Conta de menor de idade.</strong> Restrições calóricas automáticas e
          metas agressivas de emagrecimento ficam desabilitadas. Recomendamos acompanhamento
          com profissional de educação física e nutrição.
        </Alert>
      )}

      {/* Objetivos */}
      <Card style={{ marginBottom: 'var(--sp-4)' }}>
        <div className="card-header">
          <h2 className="card-title">
            <IconTarget size={18} style={{ verticalAlign: '-3px', marginRight: 6 }} />
            Objetivos
          </h2>
        </div>

        {goals.length === 0 ? (
          <p className="text-sm text-muted" style={{ marginBottom: 'var(--sp-4)' }}>
            Você ainda não definiu objetivos. Defina um para acompanhar o progresso.
          </p>
        ) : (
          <ul className="stack stack-2" style={{ marginBottom: 'var(--sp-4)' }}>
            {goals.map((g) => (
              <li key={g.id} className="row-between">
                <div style={{ minWidth: 0 }}>
                  <div className="truncate" style={{ fontWeight: 600 }}>
                    {g.title}
                  </div>
                  <div className="text-xs text-muted">
                    {g.goal_type}
                    {g.target_value ? ` · alvo: ${g.target_value}${g.target_unit ?? ''}` : ''}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => deleteGoal(g.id)}
                  aria-label={`Excluir objetivo ${g.title}`}
                >
                  <IconTrash size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="stack stack-2">
          <input
            type="text"
            value={newGoal.title}
            onChange={(e) => setNewGoal((g) => ({ ...g, title: e.target.value }))}
            placeholder="Novo objetivo (ex.: Aguentar 10 km)"
            aria-label="Título do novo objetivo"
          />
          <div className="row row-wrap">
            <select
              value={newGoal.goalType}
              onChange={(e) => setNewGoal((g) => ({ ...g, goalType: e.target.value }))}
              aria-label="Tipo do objetivo"
              style={{ minHeight: 44, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0 10px', color: 'var(--text)' }}
            >
              <option value="strength">Força</option>
              <option value="endurance">Resistência</option>
              <option value="skill">Habilidade</option>
              <option value="habit">Hábito</option>
              <option value="weight">Peso</option>
              <option value="competition">Competição</option>
            </select>
            <input
              type="number"
              value={newGoal.targetValue}
              onChange={(e) => setNewGoal((g) => ({ ...g, targetValue: e.target.value }))}
              placeholder="Valor"
              aria-label="Valor alvo"
              style={{ width: 110, minHeight: 44, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0 10px', color: 'var(--text)' }}
            />
            <Button variant="secondary" onClick={addGoal} disabled={!newGoal.title.trim()}>
              <IconTarget size={16} />
              Adicionar
            </Button>
          </div>
        </div>
      </Card>

      {/* Privacidade */}
      <Card>
        <h2 className="card-title" style={{ marginBottom: 'var(--sp-3)' }}>
          Seus dados
        </h2>
        <p className="text-sm text-muted" style={{ marginBottom: 'var(--sp-3)' }}>
          Seus dados de treino e nutrição são privados por padrão. Você pode exportar tudo
          que registrou a qualquer momento.
        </p>
        <Button variant="secondary" onClick={exportData}>
          <IconDownload size={16} />
          Exportar meus dados
        </Button>
      </Card>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="row-between">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
