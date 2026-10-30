import { beforeEach, describe, expect, it } from 'vitest';
import { isMissingSchemaError } from '@/services/dbCapabilities';
import {
  answersToRow,
  clearLocalDraft,
  loadLocalDraft,
  saveLocalDraft,
  EMPTY_ANSWERS,
  type QuestionnaireAnswers,
} from '@/services/trainingProfile';
import { buildPlanRow } from '@/services/planPersistence';
import { generateProgram, type PlanGenerationProfile } from '@/services/planGenerator';
import { testCatalog } from './plan-generator.test';

/**
 * Testes do modo degradado (migração ainda não aplicada no banco).
 *
 * Cenário real: o app publicado antes do `db push`. Nada deve quebrar; o que
 * não pode é fingir que salvou na conta quando salvou só no dispositivo.
 */

const ANSWERS: QuestionnaireAnswers = {
  ...EMPTY_ANSWERS,
  experience: 'intermediate',
  goals: ['hypertrophy'],
  goalPriority: 'hypertrophy',
  environment: 'home_equipment',
  equipment: ['bodyweight', 'dumbbell'],
  sessionsPerWeek: 3,
  minutesPerSession: 45,
  preferredDays: [1, 3, 5],
};

const PROFILE: PlanGenerationProfile = {
  level: 'intermediate',
  goal: 'hypertrophy',
  secondaryGoals: [],
  environment: 'home_equipment',
  equipment: ['bodyweight', 'dumbbell'],
  sessionsPerWeek: 3,
  minutesPerSession: 45,
  preferredDays: [1, 3, 5],
  splitPreference: 'coach_choice',
  priorityMuscles: [],
  avoidedExercises: [],
  preferredTraining: [],
  limitations: [],
  guidancePreference: 'both',
};

describe('detecção de schema pendente', () => {
  it('reconhece os erros que significam "migração não aplicada"', () => {
    const messages = [
      'relation "public.training_profiles" does not exist',
      'Could not find the table \'public.training_profiles\' in the schema cache',
      'column workout_plans.program_id does not exist',
      'column "metadata" does not exist',
      'PGRST205',
      'PGRST204',
      '42P01',
      '42703',
    ];

    for (const message of messages) {
      expect(isMissingSchemaError(message)).toBe(true);
    }
  });

  it('não confunde erro de permissão ou de rede com schema pendente', () => {
    const messages = [
      'permission denied for table training_profiles',
      'new row violates row-level security policy',
      'Failed to fetch',
      'JWT expired',
      '',
    ];

    for (const message of messages) {
      expect(isMissingSchemaError(message)).toBe(false);
    }
  });
});

describe('rascunho local do questionário', () => {
  const userId = 'user-local-1';

  beforeEach(() => {
    clearLocalDraft(userId);
    localStorage.clear();
  });

  it('salva e recupera as respostas validadas', () => {
    expect(saveLocalDraft(userId, ANSWERS)).toBe(true);

    const recovered = loadLocalDraft(userId);
    expect(recovered?.experience).toBe('intermediate');
    expect(recovered?.goals).toEqual(['hypertrophy']);
    expect(recovered?.sessionsPerWeek).toBe(3);
  });

  it('ignora rascunho corrompido em vez de quebrar a tela', () => {
    localStorage.setItem(`athletix:training-draft:${userId}`, '{isso não é json');
    expect(loadLocalDraft(userId)).toBeNull();
  });

  it('ignora rascunho fora do vocabulário conhecido', () => {
    localStorage.setItem(
      `athletix:training-draft:${userId}`,
      JSON.stringify({ ...ANSWERS, sessionsPerWeek: 99 }),
    );
    expect(loadLocalDraft(userId)).toBeNull();
  });

  it('limpa o rascunho quando o usuário exclui as preferências', () => {
    saveLocalDraft(userId, ANSWERS);
    clearLocalDraft(userId);
    expect(loadLocalDraft(userId)).toBeNull();
  });

  it('monta uma linha compatível com a tabela a partir do rascunho', () => {
    const row = answersToRow(userId, ANSWERS);
    expect(row.user_id).toBe(userId);
    expect(row.equipment).toEqual(['bodyweight', 'dumbbell']);
    expect(row.completed_at).toBeTruthy();
    expect(row.questionnaire).toBeTruthy();
  });
});

describe('gravação do plano com e sem migração', () => {
  const program = generateProgram({
    profile: PROFILE,
    catalog: testCatalog(),
    seed: 'schema-test',
  });
  const day = program.days[0]!;

  it('sem migração: grava só colunas do schema original e sem metadados', () => {
    const row = buildPlanRow({
      userId: 'u1',
      program,
      day,
      programId: 'prog-1',
      templateSlug: null,
      extended: false,
    });

    expect(row.program_id).toBeUndefined();
    expect(row.metadata).toBeUndefined();
    expect(row.generated_by).toBeUndefined();
    // O essencial continua presente para o treino funcionar.
    expect(row.name).toBeTruthy();
    expect(row.description).toBeTruthy();
    expect(row.focus).toBe('hypertrophy');
    expect(row.days_of_week).toEqual(day.weekday === null ? [] : [day.weekday]);
  });

  it('com migração: grava programa, rótulo do dia, origem e padrões', () => {
    const row = buildPlanRow({
      userId: 'u1',
      program,
      day,
      programId: 'prog-1',
      templateSlug: 'hipertrofia-academia-abc',
      extended: true,
    });

    expect(row.program_id).toBe('prog-1');
    expect(row.program_name).toBe(program.name);
    expect(row.day_label).toBe(day.label);
    expect(row.generated_by).toBe('template');
    expect(row.level).toBe('intermediate');

    const metadata = row.metadata as { patterns: string[] };
    expect(metadata.patterns).toEqual(day.exercises.map((exercise) => exercise.pattern));
  });

  it('mantém a origem "rules" quando não veio de modelo nem de IA', () => {
    const row = buildPlanRow({
      userId: 'u1',
      program,
      day,
      programId: 'prog-2',
      templateSlug: null,
      extended: true,
    });

    expect(row.generated_by).toBe('rules');
  });
});

describe('aviso de migração na interface', () => {
  it('mostra instrução e link do SQL quando o schema está pendente', async () => {
    const { render, screen } = await import('@testing-library/react');
    const { SchemaMigrationNotice } = await import('@/components/SchemaMigrationNotice');

    render(
      <SchemaMigrationNotice
        capabilities={{
          trainingProfiles: false,
          planProgramColumns: false,
          checkedAt: Date.now(),
        }}
      />,
    );

    expect(screen.getByText(/falta aplicar a migração de personalização/i)).toBeInTheDocument();
    expect(screen.getByText(/saved neste dispositivo|neste dispositivo/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /baixar \.sql/i })).toHaveAttribute(
      'href',
      '/sql/20260201000000_training_profile.sql',
    );
  });

  it('não aparece quando as capacidades estão completas', async () => {
    const { render } = await import('@testing-library/react');
    const { SchemaMigrationNotice } = await import('@/components/SchemaMigrationNotice');

    const { container } = render(
      <SchemaMigrationNotice
        capabilities={{
          trainingProfiles: true,
          planProgramColumns: true,
          checkedAt: Date.now(),
        }}
      />,
    );

    expect(container.innerHTML).toBe('');
  });

  it('não aparece enquanto a checagem está em andamento (null)', async () => {
    const { render } = await import('@testing-library/react');
    const { SchemaMigrationNotice } = await import('@/components/SchemaMigrationNotice');

    const { container } = render(<SchemaMigrationNotice capabilities={null} />);
    expect(container.innerHTML).toBe('');
  });
});
