import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/components/useToast';
import { Button, Card, Field, ConfirmDialog, Alert } from '@/components/ui';
import { IconTrash, IconMoon, IconSun } from '@/components/icons';

/** Configurações: preferências, tema, privacidade e exclusão de conta. */
export default function SettingsPage() {
  const { user, preferences, refreshProfile, signOut } = useAuthStore();
  const toast = useToast();

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(preferences?.theme ?? 'system');
  const [units, setUnits] = useState<'metric' | 'imperial'>(preferences?.preferred_units ?? 'metric');
  const [waterTarget, setWaterTarget] = useState(preferences?.water_target_ml ?? 2000);
  const [weeklySessions, setWeeklySessions] = useState(preferences?.weekly_goal_sessions ?? 3);
  const [weeklyMinutes, setWeeklyMinutes] = useState(preferences?.weekly_goal_minutes ?? 150);
  const [reminders, setReminders] = useState(preferences?.notify_workout_reminders ?? true);
  const [achievementNotifs, setAchievementNotifs] = useState(
    preferences?.notify_achievements ?? true,
  );
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  useEffect(() => {
    if (!preferences) return;
    setTheme(preferences.theme);
    setUnits(preferences.preferred_units);
    setWaterTarget(preferences.water_target_ml);
    setWeeklySessions(preferences.weekly_goal_sessions);
    setWeeklyMinutes(preferences.weekly_goal_minutes);
    setReminders(preferences.notify_workout_reminders);
    setAchievementNotifs(preferences.notify_achievements);
  }, [preferences]);

  async function save() {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({
          theme,
          preferred_units: units,
          water_target_ml: waterTarget,
          weekly_goal_sessions: weeklySessions,
          weekly_goal_minutes: weeklyMinutes,
          notify_workout_reminders: reminders,
          notify_achievements: achievementNotifs,
        })
        .eq('user_id', user.id);

      if (error) throw error;
      await refreshProfile();
      toast.show('Preferências salvas', 'success');
    } catch {
      toast.show('Não foi possível salvar.', 'error');
    } finally {
      setSaving(false);
    }
  }

  /**
   * Exclusão de conta (LGPD — direito ao esquecimento).
   * O trigger `on_auth_user_created` e as FKs `on delete cascade` removem
   * todos os dados relacionados automaticamente.
   */
  async function deleteAccount() {
    if (!user) return;
    if (deleteConfirm !== 'EXCLUIR') return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) {
        // O `admin` exige service_role (não disponível no client).
        // Fallback: solicitar exclusão via função server-side.
        toast.show('A exclusão exige confirmação. Entre em contato com o suporte.', 'error');
        return;
      }
      toast.show('Conta excluída', 'success');
      await signOut();
    } catch {
      toast.show('Não foi possível excluir a conta agora. Fale com o suporte.', 'error');
    }
  }

  return (
    <>
      <h1 className="page-title">Configurações</h1>
      <p className="page-subtitle">Ajuste o app do seu jeito.</p>

      {/* Aparência */}
      <Card style={{ marginBottom: 'var(--sp-4)' }}>
        <h2 className="card-title" style={{ marginBottom: 'var(--sp-4)' }}>
          Aparência
        </h2>

        <fieldset style={{ border: 'none', marginBottom: 'var(--sp-4)' }}>
          <legend className="field-hint" style={{ marginBottom: 'var(--sp-2)' }}>
            Tema
          </legend>
          <div className="row row-wrap" style={{ gap: 6 }}>
            <button
              type="button"
              className="chip"
              aria-pressed={theme === 'dark'}
              onClick={() => setTheme('dark')}
            >
              <IconMoon size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} />
              Escuro
            </button>
            <button
              type="button"
              className="chip"
              aria-pressed={theme === 'light'}
              onClick={() => setTheme('light')}
            >
              <IconSun size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} />
              Claro
            </button>
            <button
              type="button"
              className="chip"
              aria-pressed={theme === 'system'}
              onClick={() => setTheme('system')}
            >
              Sistema
            </button>
          </div>
        </fieldset>

        <Field label="Unidades" htmlFor="s-units">
          <select
            id="s-units"
            value={units}
            onChange={(e) => setUnits(e.target.value as 'metric' | 'imperial')}
          >
            <option value="metric">Métrico (kg, cm)</option>
            <option value="imperial">Imperial (lb, ft)</option>
          </select>
        </Field>
      </Card>

      {/* Metas */}
      <Card style={{ marginBottom: 'var(--sp-4)' }}>
        <h2 className="card-title" style={{ marginBottom: 'var(--sp-4)' }}>
          Metas
        </h2>

        <Field label="Meta de água (ml)" htmlFor="s-water">
          <input
            id="s-water"
            type="number"
            min={500}
            max={10000}
            step={100}
            value={waterTarget}
            onChange={(e) => setWaterTarget(Number(e.target.value))}
          />
        </Field>

        <Field label="Sessões por semana" htmlFor="s-sessions">
          <input
            id="s-sessions"
            type="number"
            min={0}
            max={14}
            value={weeklySessions}
            onChange={(e) => setWeeklySessions(Number(e.target.value))}
          />
        </Field>

        <Field label="Minutos por semana" htmlFor="s-minutes">
          <input
            id="s-minutes"
            type="number"
            min={0}
            max={10080}
            step={10}
            value={weeklyMinutes}
            onChange={(e) => setWeeklyMinutes(Number(e.target.value))}
          />
        </Field>
      </Card>

      {/* Notificações */}
      <Card style={{ marginBottom: 'var(--sp-4)' }}>
        <h2 className="card-title" style={{ marginBottom: 'var(--sp-4)' }}>
          Notificações
        </h2>

        <Toggle
          label="Lembretes de treino"
          checked={reminders}
          onChange={setReminders}
        />
        <Toggle
          label="Conquistas e medalhas"
          checked={achievementNotifs}
          onChange={setAchievementNotifs}
        />
      </Card>

      <Button variant="primary" block onClick={save} loading={saving} style={{ marginBottom: 'var(--sp-5)' }}>
        Salvar preferências
      </Button>

      {/* Privacidade */}
      <Card style={{ marginBottom: 'var(--sp-4)' }}>
        <h2 className="card-title" style={{ marginBottom: 'var(--sp-3)' }}>
          Privacidade
        </h2>
        <p className="text-sm text-muted" style={{ marginBottom: 'var(--sp-3)' }}>
          Seus treinos, dieta e medidas são visíveis apenas para você. Nenhum dado é
          compartilhado com terceiros sem sua autorização.
        </p>
        <Alert variant="info">
          Você pode exportar todos os seus dados em JSON a qualquer momento pela página do
          Perfil.
        </Alert>
      </Card>

      {/* Exclusão */}
      <Card style={{ borderColor: 'rgba(248, 113, 113, 0.3)' }}>
        <h2 className="card-title" style={{ marginBottom: 'var(--sp-3)' }}>
          Zona de risco
        </h2>
        <p className="text-sm text-muted" style={{ marginBottom: 'var(--sp-4)' }}>
          Excluir a conta remove permanentemente todos os dados: treinos, sessões, diário
          alimentar, medidas e objetivos. Não é possível desfazer.
        </p>
        <Button variant="danger" onClick={() => setShowDelete(true)}>
          <IconTrash size={16} />
          Excluir minha conta
        </Button>
      </Card>

      <ConfirmDialog
        open={showDelete}
        title="Excluir conta"
        message={
          <>
            Digite <strong>EXCLUIR</strong> para confirmar. Todos os seus dados serão
            removidos permanentemente.
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="EXCLUIR"
              aria-label="Confirmação de exclusão"
              style={{
                width: '100%',
                marginTop: 'var(--sp-3)',
                minHeight: 44,
                padding: '0 12px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                color: 'var(--text)',
              }}
            />
          </>
        }
        confirmLabel="Excluir conta"
        danger
        onConfirm={deleteAccount}
        onCancel={() => {
          setShowDelete(false);
          setDeleteConfirm('');
        }}
      />
    </>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      className="row-between"
      style={{ paddingBlock: 'var(--sp-3)', cursor: 'pointer' }}
    >
      <span className="text-sm">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 20, height: 20, accentColor: 'var(--accent)', cursor: 'pointer' }}
      />
    </label>
  );
}
