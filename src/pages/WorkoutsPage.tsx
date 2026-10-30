import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/components/useToast';
import {
  Alert,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Field,
  Modal,
  SkeletonList,
} from '@/components/ui';
import { PlanDayCard, PlanSourceBadge } from '@/components/training';
import {
  IconPlus,
  IconDumbbell,
  IconSparkles,
  IconTrash,
  IconEdit,
  IconChevronRight,
  IconPlay,
  IconClock,
  IconTarget,
} from '@/components/icons';
import { formatRelative } from '@/utils/format';
import { LEVEL_LABELS, ENVIRONMENT_LABELS, EQUIPMENT_LABELS } from '@/data/exerciseTaxonomy';
import {
  TRAINING_FOCUS_LABELS,
  WORKOUT_TEMPLATES,
  type WorkoutTemplate,
} from '@/data/workoutTemplates';
import type { TrainingProfile, WorkoutPlan, WorkoutSession } from '@/types/database';
import {
  deleteSession,
  groupPrograms,
  loadActivePlans,
  loadRecentSessions,
  pickNextWorkout,
  updateSessionNotes,
} from '@/services/trainingOverview';
import { answersFromRow, loadTrainingProfile, toPlanProfile } from '@/services/trainingProfile';
import { loadExerciseCatalog, type CatalogSnapshot } from '@/services/catalog';
import { generateProgram, validateGeneratedProgram } from '@/services/planGenerator';
import { deleteProgram, saveGeneratedProgram } from '@/services/planPersistence';

type Tab = 'plano' | 'modelos' | 'historico';

const TABS: { value: Tab; label: string }[] = [
  { value: 'plano', label: 'Meu plano' },
  { value: 'modelos', label: 'Modelos' },
  { value: 'historico', label: 'Histórico' },
];

/**
 * Área de treinos do ATHLETIX.
 *
 * Três camadas, nesta ordem de importância:
 *  1. Meu plano — o programa semanal real do usuário, com próximo treino;
 *  2. Modelos — catálogo filtrável de presets; usar um modelo gera um plano
 *     de verdade com exercícios do catálogo (não é lista estática);
 *  3. Histórico — sessões concluídas, agora editáveis e excluíveis.
 */
export default function WorkoutsPage() {
  const { user, profile } = useAuthStore();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = searchParams.get('tab');
  const [tab, setTab] = useState<Tab>(
    initialTab === 'modelos' || initialTab === 'historico' ? initialTab : 'plano',
  );

  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [trainingRow, setTrainingRow] = useState<TrainingProfile | null>(null);
  const [catalog, setCatalog] = useState<CatalogSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const [applyingTemplate, setApplyingTemplate] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const [deleteProgramTarget, setDeleteProgramTarget] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [deleteSessionTarget, setDeleteSessionTarget] = useState<WorkoutSession | null>(null);

  const [goalFilter, setGoalFilter] = useState<'all' | keyof typeof TRAINING_FOCUS_LABELS>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [environmentFilter, setEnvironmentFilter] = useState<'all' | WorkoutTemplate['environment']>('all');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [planRows, sessionRows, trainingProfile] = await Promise.all([
        loadActivePlans(),
        loadRecentSessions(30),
        loadTrainingProfile(user.id),
      ]);

      setPlans(planRows);
      setSessions(sessionRows);
      setTrainingRow(trainingProfile);

      // Catálogo é necessário apenas para gerar planos; não bloqueia a lista.
      void loadExerciseCatalog().then(setCatalog);
    } catch {
      toast.show('Não foi possível carregar seus treinos agora.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  function changeTab(next: Tab) {
    setTab(next);
    const params = new URLSearchParams(searchParams);
    params.set('tab', next);
    setSearchParams(params, { replace: true });
  }

  const groups = useMemo(() => groupPrograms(plans), [plans]);
  const nextWorkout = useMemo(() => pickNextWorkout(plans), [plans]);

  const profileAnswers = useMemo(() => answersFromRow(trainingRow), [trainingRow]);
  const planProfile = useMemo(() => toPlanProfile(profileAnswers), [profileAnswers]);

  const filteredTemplates = useMemo(
    () =>
      WORKOUT_TEMPLATES.filter((template) => {
        if (goalFilter !== 'all' && template.goal !== goalFilter) return false;
        if (levelFilter !== 'all' && template.level !== levelFilter) return false;
        if (environmentFilter !== 'all' && template.environment !== environmentFilter) return false;
        return true;
      }),
    [goalFilter, levelFilter, environmentFilter],
  );

  /* ─── Geração ──────────────────────────────────────────────────────────── */

  async function generateFromProfile(options?: { template?: WorkoutTemplate }) {
    if (!user || generating) return;
    setGenerationError(null);

    const snapshot = catalog ?? (await loadExerciseCatalog());
    setCatalog(snapshot);

    if (snapshot.exercises.length === 0) {
      setGenerationError(
        'O catálogo de exercícios ainda não foi semeado no banco. Sem catálogo não é possível criar um plano com exercícios válidos.',
      );
      return;
    }

    const template = options?.template;

    const generationProfile = template
      ? {
          ...planProfile,
          level: template.level,
          goal: template.goal,
          secondaryGoals: template.secondaryGoals ?? [],
          environment: template.environment,
          equipment: template.equipment,
          sessionsPerWeek: template.daysPerWeek,
          minutesPerSession: template.minutesPerSession,
          splitPreference: template.split,
          priorityMuscles: template.emphasis ?? planProfile.priorityMuscles,
          preferredTraining: template.preferredTraining ?? planProfile.preferredTraining,
        }
      : planProfile;

    if (template) setApplyingTemplate(template.slug);
    else setGenerating(true);

    try {
      const program = generateProgram({
        profile: generationProfile,
        catalog: snapshot.exercises,
        seed: `${user.id}-${template?.slug ?? 'profile'}-${Date.now()}`,
        source: 'rules',
      });

      if (template) {
        program.name = template.name;
        program.rationale.unshift(`Modelo "${template.name}" aplicado ao seu perfil.`);
      }

      const validation = validateGeneratedProgram(program, snapshot.exercises);
      if (!validation.ok || program.days.length === 0) {
        setGenerationError(
          validation.errors[0] ??
            'Nenhum exercício compatível com os equipamentos deste modelo. Ajuste suas preferências ou escolha outro modelo.',
        );
        return;
      }

      const result = await saveGeneratedProgram({
        userId: user.id,
        program,
        profile: generationProfile,
        templateSlug: template?.slug ?? null,
      });

      if (!result.ok) {
        setGenerationError(result.error ?? 'Não foi possível salvar o plano.');
        return;
      }

      toast.show('Plano criado com sucesso ✓', 'success');
      changeTab('plano');
      await load();
    } finally {
      setGenerating(false);
      setApplyingTemplate(null);
    }
  }

  /* ─── Ações de histórico ───────────────────────────────────────────────── */

  async function handleSaveNotes() {
    if (!editingSession) return;
    const result = await updateSessionNotes(editingSession.id, sessionNotes);
    if (!result.ok) {
      toast.show(result.error ?? 'Erro ao salvar.', 'error');
      return;
    }
    setSessions((prev) =>
      prev.map((session) =>
        session.id === editingSession.id ? { ...session, notes: sessionNotes.trim() || null } : session,
      ),
    );
    setEditingSession(null);
    toast.show('Observação salva', 'success');
  }

  async function handleDeleteSession() {
    if (!deleteSessionTarget) return;
    const result = await deleteSession(deleteSessionTarget.id);
    if (!result.ok) {
      toast.show(result.error ?? 'Erro ao excluir.', 'error');
      return;
    }
    setSessions((prev) => prev.filter((session) => session.id !== deleteSessionTarget.id));
    setDeleteSessionTarget(null);
    toast.show('Sessão excluída', 'success');
  }

  async function handleDeleteProgram() {
    if (!deleteProgramTarget) return;
    const result = await deleteProgram(deleteProgramTarget);
    setDeleteProgramTarget(null);
    if (!result.ok) {
      toast.show(result.error ?? 'Erro ao excluir programa.', 'error');
      return;
    }
    toast.show('Programa excluído', 'success');
    await load();
  }

  const hasPlan = plans.length > 0;

  /** Equipamentos que o modelo pede e o usuário não marcou no perfil. */
  function missingEquipment(template: WorkoutTemplate): string[] {
    return template.equipment
      .filter((equipment) => equipment !== 'bodyweight' && !planProfile.equipment.includes(equipment))
      .map((equipment) => EQUIPMENT_LABELS[equipment] ?? equipment);
  }

  return (
    <>
      <div className="row row-between row-wrap" style={{ marginBottom: 'var(--sp-4)' }}>
        <div>
          <h1 className="page-title">Treinos</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Seu programa semanal, modelos prontos e histórico de sessões.
          </p>
        </div>

        <div className="row" style={{ gap: 8 }}>
          <Link to="/app/coach" className="btn btn-secondary btn-sm">
            <IconSparkles size={15} />
            Treinador
          </Link>
          <Link to="/app/workouts/new" className="btn btn-primary btn-sm">
            <IconPlus size={16} />
            Montar manual
          </Link>
        </div>
      </div>

      <div className="chips" role="tablist" aria-label="Seções de treino">
        {TABS.map((item) => (
          <button
            key={item.value}
            role="tab"
            type="button"
            className="chip"
            aria-selected={tab === item.value}
            aria-pressed={tab === item.value}
            onClick={() => changeTab(item.value)}
          >
            {item.label}
            {item.value === 'plano' && plans.length > 0 ? ` (${plans.length})` : ''}
          </button>
        ))}
      </div>

      {generationError && (
        <div style={{ marginBottom: 'var(--sp-4)' }}>
          <Alert variant="error">{generationError}</Alert>
        </div>
      )}

      {loading ? (
        <SkeletonList count={3} height={110} />
      ) : tab === 'plano' ? (
        <section aria-label="Meu plano">
          {!hasPlan ? (
            <>
              <EmptyState
                icon="🎯"
                title="Você ainda não tem um plano"
                text="Responda ao questionário de personalização e receba um programa semanal montado a partir do seu objetivo, equipamentos e tempo disponível."
                action={
                  <Link to="/app/onboarding" className="btn btn-primary">
                    <IconSparkles size={17} />
                    Personalizar meu treino
                  </Link>
                }
              />

              <Card style={{ marginTop: 'var(--sp-4)' }}>
                <h2 className="card-title">Prefere começar por um modelo?</h2>
                <p className="text-sm text-muted" style={{ marginBottom: 'var(--sp-3)' }}>
                  Os modelos são presets de objetivo e frequência. Ao aplicar, o gerador escolhe
                  os exercícios do catálogo de acordo com o seu perfil.
                </p>
                <Button variant="secondary" onClick={() => changeTab('modelos')}>
                  Ver modelos <IconChevronRight size={16} />
                </Button>
              </Card>
            </>
          ) : (
            <div className="stack stack-5">
              {nextWorkout && (
                <div>
                  <h2 className="section-title">
                    <IconTarget size={17} style={{ verticalAlign: '-3px' }} /> Próximo treino
                  </h2>
                  <PlanDayCard plan={nextWorkout} emphasis />
                </div>
              )}

              {groups.map((group) => (
                <Card key={group.programId ?? 'manual'}>
                  <div className="row row-between row-wrap" style={{ marginBottom: 'var(--sp-3)' }}>
                    <div>
                      <h2 className="card-title">{group.name}</h2>
                      <div className="row row-wrap" style={{ gap: 6, marginTop: 6 }}>
                        {group.level && <span className="badge">{LEVEL_LABELS[group.level]}</span>}
                        {group.goal && (
                          <span className="badge badge-accent">
                            {TRAINING_FOCUS_LABELS[group.goal as keyof typeof TRAINING_FOCUS_LABELS] ??
                              group.goal}
                          </span>
                        )}
                        <PlanSourceBadge source={group.generatedBy} />
                        <span className="badge">{group.plans.length} dia(s)</span>
                      </div>
                    </div>

                    {group.programId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteProgramTarget(group.programId)}
                        aria-label={`Excluir programa ${group.name}`}
                      >
                        <IconTrash size={15} />
                        Excluir
                      </Button>
                    )}
                  </div>

                  <div className="plan-days">
                    {group.plans.map((plan) => (
                      <PlanDayCard key={plan.id} plan={plan} compact />
                    ))}
                  </div>
                </Card>
              ))}

              <Card>
                <div className="row row-between row-wrap">
                  <div>
                    <h2 className="card-title">Quer regenerar o programa?</h2>
                    <p className="text-sm text-muted">
                      Mantém suas preferências e cria uma nova semana. O programa atual continua
                      salvo até você excluir.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => void generateFromProfile()}
                    loading={generating}
                  >
                    <IconSparkles size={16} />
                    Gerar novo programa
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </section>
      ) : tab === 'modelos' ? (
        <section aria-label="Modelos de treino">
          <div className="filter-bar">
            <label className="filter-bar__field">
              <span>Objetivo</span>
              <select
                value={goalFilter}
                onChange={(event) => setGoalFilter(event.target.value as typeof goalFilter)}
              >
                <option value="all">Todos</option>
                {Object.entries(TRAINING_FOCUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="filter-bar__field">
              <span>Nível</span>
              <select
                value={levelFilter}
                onChange={(event) => setLevelFilter(event.target.value as typeof levelFilter)}
              >
                <option value="all">Todos</option>
                <option value="beginner">Iniciante</option>
                <option value="intermediate">Intermediário</option>
                <option value="advanced">Avançado</option>
              </select>
            </label>

            <label className="filter-bar__field">
              <span>Ambiente</span>
              <select
                value={environmentFilter}
                onChange={(event) =>
                  setEnvironmentFilter(event.target.value as typeof environmentFilter)
                }
              >
                <option value="all">Todos</option>
                {Object.entries(ENVIRONMENT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="text-sm text-muted" style={{ marginBottom: 'var(--sp-3)' }}>
            {filteredTemplates.length} modelo(s). Todos são acessíveis para qualquer pessoa —
            a marcação "curadoria" é só uma forma de organizar a vitrine, não uma regra de
            treino por gênero.
          </p>

          {filteredTemplates.length === 0 ? (
            <EmptyState
              icon="🔎"
              title="Nenhum modelo com esses filtros"
              text="Tente combinar outro objetivo, nível ou ambiente."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setGoalFilter('all');
                    setLevelFilter('all');
                    setEnvironmentFilter('all');
                  }}
                >
                  Limpar filtros
                </Button>
              }
            />
          ) : (
            <div className="template-grid">
              {filteredTemplates.map((template) => (
                <Card key={template.slug} className="template-card">
                  <div className="row row-between" style={{ alignItems: 'flex-start' }}>
                    <h2 className="card-title">{template.name}</h2>
                    <span className="badge badge-accent">
                      {TRAINING_FOCUS_LABELS[template.goal]}
                    </span>
                  </div>

                  <p className="text-sm text-muted" style={{ margin: 'var(--sp-2) 0 var(--sp-3)' }}>
                    {template.tagline}
                  </p>

                  <div className="row row-wrap" style={{ gap: 6 }}>
                    <span className="badge">{LEVEL_LABELS[template.level]}</span>
                    <span className="badge badge-cyan">
                      <IconClock size={12} style={{ verticalAlign: '-2px' }} />{' '}
                      {template.minutesPerSession} min
                    </span>
                    <span className="badge">{template.daysPerWeek}×/semana</span>
                    <span className="badge">{ENVIRONMENT_LABELS[template.environment]}</span>
                    {template.audience !== 'all' && <span className="badge badge-lime">curadoria</span>}
                  </div>

                  <ul className="template-card__highlights">
                    {template.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>

                  {missingEquipment(template).length > 0 && (
                    <p className="text-xs text-dim">
                      Este modelo usa equipamentos que você não marcou:{' '}
                      {missingEquipment(template).join(', ')}. O plano gerado seguirá o modelo —
                      ajuste suas preferências se não tiver acesso.
                    </p>
                  )}

                  {template.note && <p className="text-xs text-dim">{template.note}</p>}

                  <Button
                    variant="primary"
                    block
                    onClick={() => void generateFromProfile({ template })}
                    loading={applyingTemplate === template.slug}
                    disabled={generating || Boolean(applyingTemplate)}
                    style={{ marginTop: 'var(--sp-3)' }}
                  >
                    <IconDumbbell size={16} />
                    Usar este modelo
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section aria-label="Histórico de sessões">
          {sessions.length === 0 ? (
            <EmptyState
              icon="📊"
              title="Sem sessões registradas"
              text="Finalize um treino para começar seu histórico."
            />
          ) : (
            <div className="stack stack-2">
              {sessions.map((session) => (
                <Card key={session.id}>
                  <div className="row-between" style={{ gap: 'var(--sp-3)' }}>
                    <div style={{ minWidth: 0 }}>
                      <div className="row row-wrap" style={{ gap: 8 }}>
                        <strong className="truncate">{session.name}</strong>
                        <span
                          className={`badge ${
                            session.status === 'completed'
                              ? 'badge-success'
                              : session.status === 'in_progress'
                                ? 'badge-warning'
                                : ''
                          }`}
                        >
                          {session.status === 'completed'
                            ? 'Concluído'
                            : session.status === 'in_progress'
                              ? 'Em andamento'
                              : session.status === 'skipped'
                                ? 'Pulado'
                                : 'Planejado'}
                        </span>
                      </div>
                      <div className="text-xs text-muted" style={{ marginTop: 4 }}>
                        {session.completed_at ? formatRelative(session.completed_at) : 'não iniciada'} ·{' '}
                        {Math.round(session.total_volume_kg)} kg de volume
                      </div>
                      {session.notes && (
                        <p className="text-sm text-muted" style={{ marginTop: 6 }}>
                          “{session.notes}”
                        </p>
                      )}
                    </div>

                    <div className="row row-wrap" style={{ gap: 6 }}>
                      {session.status === 'in_progress' && (
                        <Link to={`/app/session/${session.id}`} className="btn btn-primary btn-sm">
                          <IconPlay size={14} />
                          Continuar
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Editar observação de ${session.name}`}
                        onClick={() => {
                          setEditingSession(session);
                          setSessionNotes(session.notes ?? '');
                        }}
                      >
                        <IconEdit size={15} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Excluir sessão ${session.name}`}
                        onClick={() => setDeleteSessionTarget(session)}
                      >
                        <IconTrash size={15} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Modal de observação */}
      <Modal
        open={Boolean(editingSession)}
        onClose={() => setEditingSession(null)}
        title="Observação da sessão"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingSession(null)}>
              Cancelar
            </Button>
            <Button onClick={() => void handleSaveNotes()}>Salvar</Button>
          </>
        }
      >
        <Field
          label="Como foi o treino?"
          htmlFor="session-notes"
          hint="Anote cargas, sensações ou o que quer ajustar na próxima sessão."
        >
          <textarea
            id="session-notes"
            rows={4}
            value={sessionNotes}
            onChange={(event) => setSessionNotes(event.target.value)}
            maxLength={1000}
          />
        </Field>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteProgramTarget)}
        title="Excluir programa"
        message="Todos os dias deste programa serão removidos. As sessões já concluídas no histórico são preservadas."
        confirmLabel="Excluir programa"
        danger
        onConfirm={() => void handleDeleteProgram()}
        onCancel={() => setDeleteProgramTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(deleteSessionTarget)}
        title="Excluir sessão"
        message="O registro da sessão e as séries registradas serão removidos do seu histórico. Essa ação não pode ser desfeita."
        confirmLabel="Excluir sessão"
        danger
        onConfirm={() => void handleDeleteSession()}
        onCancel={() => setDeleteSessionTarget(null)}
      />

      {trainingRow === null && profile?.onboarding_completed === false && tab === 'modelos' && (
        <p className="text-xs text-dim" style={{ marginTop: 'var(--sp-4)' }}>
          Dica: personalizar o perfil deixa os modelos mais precisos.{' '}
          <Link to="/app/onboarding">Responder questionário</Link>.
        </p>
      )}
    </>
  );
}
