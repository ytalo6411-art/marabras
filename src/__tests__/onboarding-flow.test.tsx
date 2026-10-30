import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OnboardingPage from '@/pages/OnboardingPage';

/**
 * Teste do questionário de personalização do início ao fim.
 *
 * Percorre as 7 etapas como um usuário faria, incluindo:
 *  • bloqueio quando falta resposta obrigatória;
 *  • avanço e retorno entre etapas;
 *  • resumo final com as respostas;
 *  • tentativa de geração sem catálogo (erro claro, sem plano inventado).
 */

const AUTH_STATE = {
  user: { id: 'user-1', email: 'ana@example.com' },
  profile: {
    id: 'user-1',
    email: 'ana@example.com',
    full_name: 'Ana Souza',
    avatar_url: null,
    phone: null,
    birth_date: null,
    gender: null,
    height_cm: null,
    weight_kg: null,
    bio: null,
    country: null,
    city: null,
    is_minor: false,
    onboarding_completed: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  preferences: null,
  refreshProfile: vi.fn(async () => undefined),
};

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => AUTH_STATE,
}));

const saveTrainingProfile = vi.fn(async () => ({ ok: true }));
const loadTrainingProfile = vi.fn(async () => null);
const loadRecentExerciseHistory = vi.fn(async () => []);
const saveGeneratedProgram = vi.fn(async () => ({ ok: true }));

vi.mock('@/services/trainingProfile', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/trainingProfile')>();
  return {
    ...actual,
    saveTrainingProfile: (...args: unknown[]) => saveTrainingProfile(...(args as [])),
    loadTrainingProfile: () => loadTrainingProfile(),
    loadRecentExerciseHistory: () => loadRecentExerciseHistory(),
  };
});

vi.mock('@/services/catalog', () => ({
  loadExerciseCatalog: async () => ({
    exercises: [],
    source: 'empty',
    needsSeed: true,
    loadedAt: Date.now(),
  }),
}));

vi.mock('@/services/planPersistence', () => ({
  saveGeneratedProgram: (...args: unknown[]) => saveGeneratedProgram(...(args as [])),
}));

vi.mock('@/services/aiCoach', () => ({
  getAiStatus: async () => ({ available: false, model: null, checkedAt: Date.now() }),
  requestAiPlan: async () => ({ available: false }),
}));

vi.mock('@/components/useToast', () => ({
  useToast: () => ({ show: vi.fn() }),
}));

function renderWizard() {
  return render(
    <MemoryRouter initialEntries={['/app/onboarding']}>
      <OnboardingPage />
    </MemoryRouter>,
  );
}

async function next() {
  fireEvent.click(screen.getByRole('button', { name: /^continuar$/i }));
}

describe('questionário de personalização', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('scrollTo', vi.fn());
  });

  it('começa na etapa 1 e bloqueia avanço sem experiência', async () => {
    renderWizard();

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /como está seu treino hoje/i })).toBeInTheDocument(),
    );

    await next();

    expect(await screen.findByText(/conte como está sua experiência/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /como está seu treino hoje/i })).toBeInTheDocument();
  });

  it('permite voltar e corrigir respostas', async () => {
    renderWizard();

    await screen.findByRole('heading', { name: /como está seu treino hoje/i });
    fireEvent.click(screen.getByRole('button', { name: /nunca treinei/i }));
    await next();

    expect(
      await screen.findByRole('heading', { name: /quais são seus objetivos/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^voltar$/i }));
    expect(
      await screen.findByRole('heading', { name: /como está seu treino hoje/i }),
    ).toBeInTheDocument();
  });

  it('percorre as 7 etapas, mostra o resumo e falha com mensagem clara sem catálogo', async () => {
    renderWizard();

    await screen.findByRole('heading', { name: /como está seu treino hoje/i });
    fireEvent.click(screen.getByRole('button', { name: /nunca treinei/i }));
    await next();

    // Etapa 2: objetivo + prioridade automática no primeiro selecionado.
    await screen.findByRole('heading', { name: /quais são seus objetivos/i });
    fireEvent.click(screen.getByRole('button', { name: /ganhar massa muscular/i }));
    await next();

    // Etapa 3: ambiente sem equipamento.
    await screen.findByRole('heading', { name: /onde você vai treinar/i });
    fireEvent.click(screen.getByRole('button', { name: /casa sem equipamentos/i }));
    await next();

    // Etapa 4: disponibilidade (defaults já válidos).
    await screen.findByRole('heading', { name: /quanto tempo você tem de verdade/i });
    await next();

    // Etapa 5: preferências (opcionais).
    await screen.findByRole('heading', { name: /o que você gosta de treinar/i });
    await next();

    // Etapa 6: segurança (sem limitações).
    await screen.findByRole('heading', { name: /segurança e adaptações/i });
    await next();

    // Etapa 7: revisão.
    await screen.findByRole('heading', { name: /confira antes de gerar/i });
    expect(screen.getByText(/casa sem equipamentos/i)).toBeInTheDocument();
    expect(screen.getAllByText(/ganhar massa muscular/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /gerar meu plano/i }));

    // Preferências são salvas mesmo quando o catálogo está vazio…
    await waitFor(() => expect(saveTrainingProfile).toHaveBeenCalledTimes(1));

    // …e o usuário recebe uma explicação, não um plano fictício.
    expect(await screen.findByText(/catálogo de exercícios ainda não foi semeado/i)).toBeInTheDocument();
    expect(saveGeneratedProgram).not.toHaveBeenCalled();
  });
});
