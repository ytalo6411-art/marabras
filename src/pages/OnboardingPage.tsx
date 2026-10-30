import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/components/useToast';
import { Alert, Button, Card, Field, Progress, Skeleton } from '@/components/ui';
import { OptionCard, OptionGrid } from '@/components/training';
import {
  IconChevronLeft,
  IconCheck,
  IconSparkles,
  IconTarget,
  IconDumbbell,
  IconClock,
  IconHeart,
  IconShield,
  IconEdit,
} from '@/components/icons';
import {
  AGE_RANGE_OPTIONS,
  ENVIRONMENT_EQUIPMENT,
  ENVIRONMENT_OPTIONS,
  EQUIPMENT_OPTIONS,
  EXPERIENCE_OPTIONS,
  GOAL_OPTIONS,
  GUIDANCE_OPTIONS,
  LIMITATION_OPTIONS,
  PREFERRED_TRAINING_OPTIONS,
  SESSION_LENGTH_OPTIONS,
  SPLIT_OPTIONS,
  muscleLabel,
} from '@/data/exerciseTaxonomy';
import {
  EMPTY_ANSWERS,
  QUESTIONNAIRE_STEPS,
  answersFromRow,
  firstIncompleteStep,
  loadRecentExerciseHistory,
  loadTrainingProfile,
  saveTrainingProfile,
  toPlanProfile,
  validateStep,
  type QuestionnaireAnswers,
} from '@/services/trainingProfile';
import { loadExerciseCatalog, type CatalogSnapshot } from '@/services/catalog';
import { generateProgram, validateGeneratedProgram, type GeneratedProgram } from '@/services/planGenerator';
import { saveGeneratedProgram } from '@/services/planPersistence';
import { getAiStatus, requestAiPlan } from '@/services/aiCoach';
import type { AgeRange, Gender, TrainingGoal } from '@/types/database';

const MUSCLE_CHOICES = [
  'pectoralis_major',
  'lats',
  'deltoids',
  'biceps',
  'triceps',
  'abdominals',
  'quadriceps',
  'hamstrings',
  'glutes',
  'calves',
];

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Questionário de personalização (onboarding inteligente).
 *
 * 7 etapas curtas, progresso visível, voltar sempre disponível e revisão final.
 * Tudo que é opcional está marcado como opcional — inclusive gênero, altura e
 * peso, que nunca determinam quais exercícios a pessoa recebe.
 */
export default function OnboardingPage() {
  const { user, profile, refreshProfile } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const restart = searchParams.get('restart') === '1';
  const requestedStep = Number(searchParams.get('step') ?? '0');

  const [answers, setAnswers] = useState<QuestionnaireAnswers>(EMPTY_ANSWERS);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState<string>('');
  const [catalogState, setCatalogState] = useState<CatalogSnapshot | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [avoidedInput, setAvoidedInput] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const row = await loadTrainingProfile(user.id);
      setHasProfile(Boolean(row && row.completed_at));

      const base = answersFromRow(row);
      setAnswers({
        ...base,
        gender: base.gender ?? (profile?.gender ?? null),
        heightCm: base.heightCm ?? profile?.height_cm ?? null,
        weightKg: base.weightKg ?? profile?.weight_kg ?? null,
      });

      if (!row && profile) {
        setAnswers((prev) => ({
          ...prev,
          gender: profile.gender,
          heightCm: profile.height_cm,
          weightKg: profile.weight_kg,
        }));
      }

      if (!restart) {
        const target = requestedStep >= 1 && requestedStep <= 7
          ? requestedStep
          : row?.completed_at
            ? 1
            : firstIncompleteStep(answersFromRow(row));
        setStep(target);
      } else {
        setStep(1);
      }

      // Catálogo é carregado em paralelo à leitura do perfil pelo usuário.
      void loadExerciseCatalog().then(setCatalogState);
    } finally {
      setLoading(false);
    }
  }, [user, profile, restart, requestedStep]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalSteps = QUESTIONNAIRE_STEPS.length;
  const progress = Math.round(((step - 1) / (totalSteps - 1)) * 100);

  function update<K extends keyof QuestionnaireAnswers>(key: K, value: QuestionnaireAnswers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setErrors([]);
  }

  function toggleGoal(goal: TrainingGoal) {
    setAnswers((prev) => {
      const goals = prev.goals.includes(goal)
        ? prev.goals.filter((item) => item !== goal)
        : prev.goals.length >= 5
          ? prev.goals
          : [...prev.goals, goal];

      const goalPriority =
        prev.goalPriority && goals.includes(prev.goalPriority)
          ? prev.goalPriority
          : (goals[0] ?? null);

      return { ...prev, goals, goalPriority };
    });
    setErrors([]);
  }

  function goNext() {
    const validation = validateStep(step, answers);
    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }
    setErrors([]);
    setStep((current) => Math.min(totalSteps, current + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    setErrors([]);
    setStep((current) => Math.max(1, current - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function jumpTo(target: number) {
    setErrors([]);
    setStep(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Valida todas as etapas e aponta a primeira com problema. */
  function validateAll(): boolean {
    for (let current = 1; current <= 6; current++) {
      const validation = validateStep(current, answers);
      if (!validation.ok) {
        setStep(current);
        setErrors(validation.errors);
        return false;
      }
    }
    return true;
  }

  async function handleGenerate() {
    if (!user || generating) return;
    if (!validateAll()) return;

    setGenerating(true);
    setErrors([]);

    try {
      setGenerationStage('Salvando suas preferências…');
      const saved = await saveTrainingProfile(user.id, answers);
      if (!saved.ok) {
        setErrors([saved.error ?? 'Não foi possível salvar suas preferências.']);
        return;
      }
      await refreshProfile();
      setHasProfile(true);

      setGenerationStage('Lendo o catálogo de exercícios…');
      const catalog = await loadExerciseCatalog({ force: true });

      if (catalog.exercises.length === 0) {
        setErrors([
          'O catálogo de exercícios ainda não foi semeado no banco. Rode "npm run seed:exercises" na raiz do projeto (usa as credenciais do Supabase) e tente novamente.',
        ]);
        return;
      }

      setGenerationStage('Montando seu plano semanal…');
      const planProfile = toPlanProfile(answers);
      const history = await loadRecentExerciseHistory(user.id);
      const seed = `${user.id}-${new Date().toISOString().slice(0, 10)}`;

      let program: GeneratedProgram | null = null;
      let usedAi = false;

      const ai = await getAiStatus();
      if (ai.available) {
        setGenerationStage('Consultando o treinador de IA e validando a resposta…');
        const aiResult = await requestAiPlan({
          profile: planProfile,
          catalog: catalog.exercises,
          seed,
        });
        if (aiResult.available && aiResult.program) {
          program = aiResult.program;
          usedAi = true;
        }
      }

      if (!program) {
        program = generateProgram({
          profile: planProfile,
          catalog: catalog.exercises,
          history,
          seed,
          source: 'rules',
        });
      }

      const validation = validateGeneratedProgram(program, catalog.exercises);
      if (!validation.ok || program.days.length === 0) {
        setErrors([
          validation.errors[0] ??
            'Não foi possível montar um plano com esses equipamentos. Tente marcar mais opções na etapa 3.',
        ]);
        return;
      }

      setGenerationStage('Salvando o plano…');
      const result = await saveGeneratedProgram({
        userId: user.id,
        program,
        profile: planProfile,
      });

      if (!result.ok) {
        setErrors([result.error ?? 'Não foi possível salvar o plano.']);
        return;
      }

      toast.show(
        usedAi ? 'Plano gerado com IA e validado ✓' : 'Plano personalizado criado ✓',
        'success',
      );
      navigate('/app/workouts?tab=plano');
    } catch (error) {
      console.error('[ATHLETIX] Erro ao gerar plano:', error);
      setErrors(['Algo deu errado ao montar o plano. Tente novamente em instantes.']);
    } finally {
      setGenerating(false);
      setGenerationStage('');
    }
  }

  const summary = useMemo(() => buildSummary(answers), [answers]);

  if (loading) {
    return (
      <>
        <h1 className="page-title">Personalização</h1>
        <Skeleton height={16} width="40%" />
        <div style={{ height: 16 }} />
        <Skeleton height={280} />
      </>
    );
  }

  return (
    <div className="wizard">
      <header className="wizard__header">
        <div className="row row-between" style={{ marginBottom: 'var(--sp-3)' }}>
          <div>
            <p className="eyebrow">Personalização</p>
            <h1 className="page-title" style={{ marginBottom: 4 }}>
              {QUESTIONNAIRE_STEPS[step - 1]?.title}
            </h1>
            <p className="page-subtitle" style={{ marginBottom: 0 }}>
              {QUESTIONNAIRE_STEPS[step - 1]?.description}
            </p>
          </div>
          <Link to="/app" className="btn btn-ghost btn-sm">
            Sair
          </Link>
        </div>

        <Progress value={progress} label={`Etapa ${step} de ${totalSteps}`} />
        <div className="wizard__steps" aria-hidden="true">
          {QUESTIONNAIRE_STEPS.map((item) => (
            <span
              key={item.id}
              className={`wizard__dot ${
                item.id === step ? 'wizard__dot--current' : item.id < step ? 'wizard__dot--done' : ''
              }`}
            >
              {item.id < step ? <IconCheck size={12} /> : item.id}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted">
          Etapa {step} de {totalSteps}
          {hasProfile ? ' · suas respostas anteriores estão preenchidas' : ''}
        </p>
      </header>

      {errors.length > 0 && (
        <div style={{ marginBottom: 'var(--sp-4)' }}>
          <Alert variant="error">{errors.join(' ')}</Alert>
        </div>
      )}

      <Card className="wizard__card">
        {step === 1 && (
          <section aria-labelledby="step1-title">
            <h2 id="step1-title" className="section-title">Como está seu treino hoje?</h2>
            <p className="text-sm text-muted" style={{ marginBottom: 'var(--sp-3)' }}>
              Isso define volume e complexidade dos exercícios — nada é decidido pelo seu gênero.
            </p>

            <OptionGrid>
              {EXPERIENCE_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  label={option.label}
                  hint={option.hint}
                  selected={answers.experience === option.value}
                  onClick={() => update('experience', option.value)}
                />
              ))}
            </OptionGrid>

            <div className="wizard__optional-grid">
              <Field label="Faixa etária (opcional)" htmlFor="age-range" hint="Ajuda a moderar volume e impacto.">
                <select
                  id="age-range"
                  value={answers.ageRange ?? ''}
                  onChange={(event) => update('ageRange', (event.target.value || null) as AgeRange | null)}
                >
                  <option value="">Prefiro não informar</option>
                  {AGE_RANGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Gênero (opcional)" htmlFor="gender" hint="Não muda quais exercícios você recebe.">
                <select
                  id="gender"
                  value={answers.gender ?? ''}
                  onChange={(event) => update('gender', (event.target.value || null) as Gender | null)}
                >
                  <option value="">Prefiro não informar</option>
                  <option value="female">Feminino</option>
                  <option value="male">Masculino</option>
                  <option value="other">Outro</option>
                  <option value="prefer_not_to_say">Prefiro não dizer</option>
                </select>
              </Field>

              <Field label="Altura em cm (opcional)" htmlFor="height">
                <input
                  id="height"
                  type="number"
                  inputMode="decimal"
                  min={90}
                  max={250}
                  placeholder="ex.: 172"
                  value={answers.heightCm ?? ''}
                  onChange={(event) =>
                    update('heightCm', event.target.value ? Number(event.target.value) : null)
                  }
                />
              </Field>

              <Field label="Peso em kg (opcional)" htmlFor="weight" hint="Usado no acompanhamento, não no tipo de exercício.">
                <input
                  id="weight"
                  type="number"
                  inputMode="decimal"
                  min={25}
                  max={400}
                  placeholder="ex.: 68"
                  value={answers.weightKg ?? ''}
                  onChange={(event) =>
                    update('weightKg', event.target.value ? Number(event.target.value) : null)
                  }
                />
              </Field>
            </div>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="step2-title">
            <h2 id="step2-title" className="section-title">Quais são seus objetivos?</h2>
            <p className="text-sm text-muted" style={{ marginBottom: 'var(--sp-3)' }}>
              Escolha até 5. Depois marque qual é a prioridade — o plano começa por ela.
            </p>

            <OptionGrid>
              {GOAL_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  icon={<span aria-hidden="true">{option.icon}</span>}
                  label={option.label}
                  hint={option.hint}
                  multiple
                  selected={answers.goals.includes(option.value)}
                  onClick={() => toggleGoal(option.value)}
                />
              ))}
            </OptionGrid>

            {answers.goals.length > 1 && (
              <fieldset className="wizard__fieldset">
                <legend>Qual é a prioridade?</legend>
                <div className="chips">
                  {answers.goals.map((goal) => {
                    const option = GOAL_OPTIONS.find((item) => item.value === goal);
                    return (
                      <button
                        key={goal}
                        type="button"
                        className="chip"
                        aria-pressed={answers.goalPriority === goal}
                        onClick={() => update('goalPriority', goal)}
                      >
                        {option?.label ?? goal}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="step3-title">
            <h2 id="step3-title" className="section-title">Onde você vai treinar?</h2>
            <p className="text-sm text-muted" style={{ marginBottom: 'var(--sp-3)' }}>
              Não presumimos que você tenha academia. O plano se adapta ao que existe.
            </p>

            <OptionGrid>
              {ENVIRONMENT_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  icon={<span aria-hidden="true">{option.icon}</span>}
                  label={option.label}
                  hint={option.hint}
                  selected={answers.environment === option.value}
                  onClick={() => {
                    update('environment', option.value);
                    if (answers.equipment.length <= 1) {
                      // Sugestão editável: o usuário pode desmarcar o que não tem.
                      update('equipment', ENVIRONMENT_EQUIPMENT[option.value].slice(0, 8));
                    }
                  }}
                />
              ))}
            </OptionGrid>

            <fieldset className="wizard__fieldset">
              <legend>Quais equipamentos você tem acesso?</legend>
              <div className="chips chips--wrap">
                {EQUIPMENT_OPTIONS.map((option) => {
                  const selected = answers.equipment.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className="chip"
                      aria-pressed={selected}
                      onClick={() =>
                        update(
                          'equipment',
                          selected
                            ? answers.equipment.filter((item) => item !== option.value)
                            : [...answers.equipment, option.value],
                        )
                      }
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <p className="field-hint">
                Sugerimos os equipamentos típicos do ambiente escolhido — desmarque o que você
                não tem. O peso do corpo é sempre considerado.
              </p>
            </fieldset>
          </section>
        )}

        {step === 4 && (
          <section aria-labelledby="step4-title">
            <h2 id="step4-title" className="section-title">Quanto tempo você tem de verdade?</h2>
            <p className="text-sm text-muted" style={{ marginBottom: 'var(--sp-3)' }}>
              É melhor um plano realista do que um plano ideal que não cabe na semana.
            </p>

            <fieldset className="wizard__fieldset">
              <legend>Dias por semana</legend>
              <div className="chips">
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="chip"
                    aria-pressed={answers.sessionsPerWeek === value}
                    onClick={() => update('sessionsPerWeek', value)}
                  >
                    {value}×
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="wizard__fieldset">
              <legend>Tempo por sessão</legend>
              <div className="chips">
                {[20, 30, 45, 60, 75, 90].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="chip"
                    aria-pressed={answers.minutesPerSession === value}
                    onClick={() => update('minutesPerSession', value)}
                  >
                    {value} min
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="wizard__fieldset">
              <legend>Dias mais convenientes (opcional)</legend>
              <div className="chips">
                {WEEKDAY_LABELS.map((label, index) => {
                  const selected = answers.preferredDays.includes(index);
                  return (
                    <button
                      key={label}
                      type="button"
                      className="chip"
                      aria-pressed={selected}
                      onClick={() =>
                        update(
                          'preferredDays',
                          selected
                            ? answers.preferredDays.filter((day) => day !== index)
                            : [...answers.preferredDays, index].sort(),
                        )
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="wizard__fieldset">
              <legend>Você prefere sessões…</legend>
              <OptionGrid>
                {SESSION_LENGTH_OPTIONS.map((option) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    hint={option.hint}
                    selected={answers.sessionLengthPreference === option.value}
                    onClick={() => {
                      update('sessionLengthPreference', option.value);
                      update('minutesPerSession', option.minutes);
                    }}
                  />
                ))}
              </OptionGrid>
            </fieldset>
          </section>
        )}

        {step === 5 && (
          <section aria-labelledby="step5-title">
            <h2 id="step5-title" className="section-title">O que você gosta de treinar?</h2>
            <p className="text-sm text-muted" style={{ marginBottom: 'var(--sp-3)' }}>
              Preferência não é regra — só ajuda a escolher melhor. Tudo é opcional.
            </p>

            <fieldset className="wizard__fieldset">
              <legend>Grupos musculares para priorizar</legend>
              <div className="chips chips--wrap">
                {MUSCLE_CHOICES.map((muscle) => {
                  const selected = answers.priorityMuscles.includes(muscle);
                  return (
                    <button
                      key={muscle}
                      type="button"
                      className="chip"
                      aria-pressed={selected}
                      onClick={() =>
                        update(
                          'priorityMuscles',
                          selected
                            ? answers.priorityMuscles.filter((item) => item !== muscle)
                            : [...answers.priorityMuscles, muscle],
                        )
                      }
                    >
                      {muscleLabel(muscle)}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="wizard__fieldset">
              <legend>Estilo de treino</legend>
              <OptionGrid>
                {PREFERRED_TRAINING_OPTIONS.map((option) => {
                  const selected = answers.preferredTraining.includes(option.value);
                  return (
                    <OptionCard
                      key={option.value}
                      label={option.label}
                      hint={option.hint}
                      multiple
                      selected={selected}
                      onClick={() =>
                        update(
                          'preferredTraining',
                          selected
                            ? answers.preferredTraining.filter((item) => item !== option.value)
                            : [...answers.preferredTraining, option.value],
                        )
                      }
                    />
                  );
                })}
              </OptionGrid>
            </fieldset>

            <fieldset className="wizard__fieldset">
              <legend>Como você prefere o plano?</legend>
              <OptionGrid>
                {SPLIT_OPTIONS.map((option) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    hint={option.hint}
                    selected={answers.splitPreference === option.value}
                    onClick={() => update('splitPreference', option.value)}
                  />
                ))}
              </OptionGrid>
            </fieldset>

            <fieldset className="wizard__fieldset">
              <legend>Instruções dos exercícios</legend>
              <div className="chips">
                {GUIDANCE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className="chip"
                    aria-pressed={answers.guidancePreference === option.value}
                    onClick={() => update('guidancePreference', option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <Field
              label="Exercícios que você quer evitar (opcional)"
              htmlFor="avoid-input"
              hint="Digite o nome e pressione Enter. Ex.: agachamento, corrida, burpee."
            >
              <div className="row" style={{ gap: 8 }}>
                <input
                  id="avoid-input"
                  value={avoidedInput}
                  onChange={(event) => setAvoidedInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') return;
                    event.preventDefault();
                    const value = avoidedInput.trim();
                    if (!value || answers.avoidedExercises.includes(value)) return;
                    update('avoidedExercises', [...answers.avoidedExercises, value]);
                    setAvoidedInput('');
                  }}
                  placeholder="Nome do exercício"
                />
                <Button
                  variant="secondary"
                  onClick={() => {
                    const value = avoidedInput.trim();
                    if (!value || answers.avoidedExercises.includes(value)) return;
                    update('avoidedExercises', [...answers.avoidedExercises, value]);
                    setAvoidedInput('');
                  }}
                >
                  Adicionar
                </Button>
              </div>
            </Field>

            {answers.avoidedExercises.length > 0 && (
              <div className="chips chips--wrap">
                {answers.avoidedExercises.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="chip chip-active"
                    aria-label={`Remover ${item} da lista`}
                    onClick={() =>
                      update(
                        'avoidedExercises',
                        answers.avoidedExercises.filter((entry) => entry !== item),
                      )
                    }
                  >
                    {item} ✕
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {step === 6 && (
          <section aria-labelledby="step6-title">
            <h2 id="step6-title" className="section-title">Segurança e adaptações</h2>
            <p className="text-sm text-muted" style={{ marginBottom: 'var(--sp-3)' }}>
              Isso não é diagnóstico. Serve só para evitar movimentos que costumam incomodar —
              se houver dor ou lesão, procure avaliação profissional.
            </p>

            <fieldset className="wizard__fieldset">
              <legend>Você tem alguma limitação hoje? (opcional)</legend>
              <OptionGrid>
                {LIMITATION_OPTIONS.map((option) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    hint={option.adaptation}
                    multiple
                    selected={answers.limitations.includes(option.value)}
                    onClick={() => {
                      const selected = answers.limitations.includes(option.value);
                      const limitations = selected
                        ? answers.limitations.filter((item) => item !== option.value)
                        : [...answers.limitations, option.value];
                      update('limitations', limitations);
                      update(
                        'needsProfessionalGuidance',
                        limitations.some(
                          (value) =>
                            LIMITATION_OPTIONS.find((item) => item.value === value)
                              ?.suggestsProfessional ?? false,
                        ),
                      );
                      if (limitations.length === 0) update('safetyAcknowledged', false);
                    }}
                  />
                ))}
              </OptionGrid>
            </fieldset>

            {answers.limitations.length > 0 && (
              <>
                <Alert variant="warning">
                  O ATHLETIX não faz diagnóstico nem reabilitação. Em caso de dor aguda, lesão
                  recente, gestação ou condição de saúde, procure um profissional antes de
                  começar.
                </Alert>

                <label className="checkbox-row" htmlFor="safety-ack" style={{ marginTop: 'var(--sp-3)' }}>
                  <input
                    id="safety-ack"
                    type="checkbox"
                    checked={answers.safetyAcknowledged}
                    onChange={(event) => update('safetyAcknowledged', event.target.checked)}
                  />
                  <span>Entendi e quero seguir com adaptações.</span>
                </label>
              </>
            )}

            {answers.limitations.length === 0 && (
              <p className="text-sm text-muted" style={{ marginTop: 'var(--sp-3)' }}>
                Sem limitações declaradas — seguimos com o plano padrão do seu nível.
              </p>
            )}
          </section>
        )}

        {step === 7 && (
          <section aria-labelledby="step7-title">
            <h2 id="step7-title" className="section-title">Confira antes de gerar</h2>
            <p className="text-sm text-muted" style={{ marginBottom: 'var(--sp-4)' }}>
              Você pode editar qualquer resposta depois — inclusive refazer o questionário.
            </p>

            <div className="summary-grid">
              {summary.map((group) => (
                <div key={group.title} className="summary-block">
                  <div className="row row-between">
                    <h3 className="summary-block__title">{group.title}</h3>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => jumpTo(group.step)}
                      aria-label={`Editar ${group.title}`}
                    >
                      <IconEdit size={14} />
                      Editar
                    </button>
                  </div>
                  <ul className="summary-list">
                    {group.items.map((item) => (
                      <li key={item}>
                        <IconCheck size={14} aria-hidden="true" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {catalogState && catalogState.source !== 'database' && (
              <Alert variant="warning">
                O catálogo de exercícios não está disponível agora
                {catalogState.source === 'fallback'
                  ? ' (usando dados locais de emergência).'
                  : '.'}{' '}
                Suas preferências serão salvas, mas o plano só será gerado quando o catálogo
                estiver acessível.
              </Alert>
            )}

            <div className="wizard__generate">
              <div>
                <h3 className="card-title">Pronto para montar seu plano</h3>
                <p className="text-sm text-muted">
                  O gerador usa regras de treinamento sobre o catálogo real de 317 exercícios.
                  Se houver IA configurada no servidor, ela participa e a resposta é validada
                  antes de salvar.
                </p>
              </div>
              <Button size="lg" onClick={() => void handleGenerate()} loading={generating}>
                <IconSparkles size={18} />
                {generating ? 'Gerando…' : 'Gerar meu plano'}
              </Button>
            </div>
          </section>
        )}
      </Card>

      {generating && (
        <div className="wizard__progress-live" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <span>{generationStage || 'Gerando seu plano…'}</span>
        </div>
      )}

      <nav className="wizard__nav" aria-label="Navegação do questionário">
        <Button variant="secondary" onClick={goBack} disabled={step === 1 || generating}>
          <IconChevronLeft size={16} />
          Voltar
        </Button>

        <div className="wizard__nav-icons" aria-hidden="true">
          <IconTarget size={16} />
          <IconDumbbell size={16} />
          <IconClock size={16} />
          <IconHeart size={16} />
          <IconShield size={16} />
        </div>

        {step < totalSteps ? (
          <Button onClick={goNext} disabled={generating}>
            Continuar
          </Button>
        ) : (
          <Button onClick={() => void handleGenerate()} loading={generating}>
            Gerar plano
          </Button>
        )}
      </nav>
    </div>
  );
}

interface SummaryGroup {
  title: string;
  step: number;
  items: string[];
}

function buildSummary(answers: QuestionnaireAnswers): SummaryGroup[] {
  const experience =
    EXPERIENCE_OPTIONS.find((option) => option.value === answers.experience)?.label ?? 'Não informado';
  const age = answers.ageRange
    ? (AGE_RANGE_OPTIONS.find((option) => option.value === answers.ageRange)?.label ?? '—')
    : 'Não informada';

  const goals = answers.goals.map(
    (goal) => GOAL_OPTIONS.find((option) => option.value === goal)?.label ?? goal,
  );
  const priority =
    GOAL_OPTIONS.find((option) => option.value === answers.goalPriority)?.label ?? '—';

  const environment =
    ENVIRONMENT_OPTIONS.find((option) => option.value === answers.environment)?.label ??
    'Não informado';
  const equipment = answers.equipment.length
    ? answers.equipment
        .map((value) => EQUIPMENT_OPTIONS.find((option) => option.value === value)?.label ?? value)
        .join(', ')
    : 'Peso do corpo';

  const days = answers.preferredDays.length
    ? answers.preferredDays.map((day) => WEEKDAY_LABELS[day] ?? '—').join(', ')
    : 'O gerador distribui';

  return [
    {
      title: 'Perfil',
      step: 1,
      items: [experience, `Faixa etária: ${age}`],
    },
    {
      title: 'Objetivos',
      step: 2,
      items: goals.length ? [...goals, `Prioridade: ${priority}`] : ['Nenhum objetivo marcado'],
    },
    {
      title: 'Local e equipamentos',
      step: 3,
      items: [environment, `Equipamentos: ${equipment}`],
    },
    {
      title: 'Disponibilidade',
      step: 4,
      items: [
        `${answers.sessionsPerWeek}× por semana`,
        `${answers.minutesPerSession} min por sessão`,
        `Dias: ${days}`,
      ],
    },
    {
      title: 'Preferências',
      step: 5,
      items: [
        answers.priorityMuscles.length
          ? `Prioridade: ${answers.priorityMuscles.map(muscleLabel).join(', ')}`
          : 'Sem grupo muscular prioritário',
        answers.preferredTraining.length
          ? answers.preferredTraining
              .map(
                (value) =>
                  PREFERRED_TRAINING_OPTIONS.find((option) => option.value === value)?.label ?? value,
              )
              .join(', ')
          : 'Estilo livre',
        SPLIT_OPTIONS.find((option) => option.value === answers.splitPreference)?.label ??
          'Divisão escolhida pelo gerador',
      ],
    },
    {
      title: 'Segurança',
      step: 6,
      items: answers.limitations.length
        ? answers.limitations.map(
            (value) => LIMITATION_OPTIONS.find((option) => option.value === value)?.label ?? value,
          )
        : ['Sem limitações declaradas'],
    },
  ];
}
