/**
 * Integração opcional com um provedor de IA (server-side).
 *
 * Regras de honestidade do projeto:
 *  • a chave do provedor NUNCA fica no navegador — ela existe só nas variáveis
 *    de ambiente do servidor (Vercel Function em `/api/ai/*`);
 *  • se o endpoint responder 503 (não configurado), a UI diz claramente que o
 *    plano foi gerado por REGRAS e não por IA;
 *  • toda resposta do provedor é validada por schema antes de ser usada;
 *  • a IA recebe apenas os campos necessários (nada de e-mail, nome ou dados
 *    médicos além das limitações declaradas).
 */

import { supabase } from '@/lib/supabase';
import { getJson, postJson, HttpError } from '@/services/http';
import {
  generatedProgramSchema,
  validateGeneratedProgram,
  type GeneratedProgram,
  type PlanGenerationProfile,
} from '@/services/planGenerator';
import type { CatalogExercise } from '@/services/catalog';

export interface AiStatus {
  available: boolean;
  model: string | null;
  checkedAt: number;
  reason?: string;
}

let statusCache: AiStatus | null = null;
const STATUS_TTL = 5 * 60 * 1000;

/**
 * Consulta (uma vez por sessão) se o servidor tem um provedor configurado.
 * Nunca lança: qualquer falha significa "não disponível".
 */
export async function getAiStatus(force = false): Promise<AiStatus> {
  if (!force && statusCache && Date.now() - statusCache.checkedAt < STATUS_TTL) {
    return statusCache;
  }

  try {
    const data = await getJson<{ configured?: boolean; model?: string | null }>(
      '/api/ai/status',
      { timeoutMs: 6000, retries: 0 },
    );
    statusCache = {
      available: Boolean(data.configured),
      model: data.model ?? null,
      checkedAt: Date.now(),
    };
  } catch {
    statusCache = {
      available: false,
      model: null,
      checkedAt: Date.now(),
      reason: 'Não foi possível verificar o serviço de IA.',
    };
  }

  return statusCache;
}

async function accessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export interface AiPlanResult {
  available: boolean;
  program?: GeneratedProgram;
  reason?: string;
}

/** Envia o catálogo relevante (sem dados pessoais) e o perfil para a IA. */
function sanitizeProfile(profile: PlanGenerationProfile) {
  return {
    level: profile.level,
    goal: profile.goal,
    secondaryGoals: profile.secondaryGoals,
    environment: profile.environment,
    equipment: profile.equipment,
    sessionsPerWeek: profile.sessionsPerWeek,
    minutesPerSession: profile.minutesPerSession,
    preferredDays: profile.preferredDays,
    splitPreference: profile.splitPreference,
    priorityMuscles: profile.priorityMuscles,
    avoidedExercises: profile.avoidedExercises,
    preferredTraining: profile.preferredTraining,
    limitations: profile.limitations,
  };
}

/**
 * Pede um plano à IA. Devolve `available: false` quando não há provedor —
 * nesse caso o chamador usa o gerador determinístico.
 */
export async function requestAiPlan(params: {
  profile: PlanGenerationProfile;
  catalog: CatalogExercise[];
  seed: string;
}): Promise<AiPlanResult> {
  const status = await getAiStatus();
  if (!status.available) {
    return { available: false, reason: 'Nenhum provedor de IA configurado no servidor.' };
  }

  const token = await accessToken();
  if (!token) {
    return { available: false, reason: 'Sessão expirada. Entre novamente para usar a IA.' };
  }

  // Só exercícios compatíveis: reduz custo e evita sugestões impossíveis.
  const candidates = params.catalog
    .filter((exercise) => exercise.inDatabase)
    .filter((exercise) => exercise.equipment.some((eq) => params.profile.equipment.includes(eq) || eq === 'bodyweight'))
    .slice(0, 120)
    .map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      muscle: exercise.primaryMuscle,
      equipment: exercise.equipment,
      difficulty: exercise.difficulty,
      pattern: exercise.pattern,
    }));

  try {
    const response = await postJson<{ program?: unknown; error?: string }>(
      '/api/ai/plan',
      {
        token,
        profile: sanitizeProfile(params.profile),
        candidates,
        seed: params.seed,
      },
      { timeoutMs: 45_000 },
    );

    if (!response.program) {
      return { available: false, reason: response.error ?? 'A IA não devolveu um plano.' };
    }

    const parsed = generatedProgramSchema.safeParse(response.program);
    if (!parsed.success) {
      return { available: false, reason: 'A resposta da IA não passou na validação de formato.' };
    }

    const validated = validateGeneratedProgram(parsed.data, params.catalog);
    if (!validated.ok) {
      return {
        available: false,
        reason: `A IA sugeriu exercícios fora do catálogo (${validated.errors[0]}).`,
      };
    }

    // O schema já validou formato e o teste de catálogo acima garante que os
    // exercícios existem. O `pattern` é texto no schema (para não quebrar se a
    // IA devolver um valor novo) e aqui é seguro tratá-lo como MovementPattern.
    return { available: true, program: parsed.data as unknown as GeneratedProgram };
  } catch (error) {
    const message =
      error instanceof HttpError && error.status === 401
        ? 'Sua sessão expirou. Entre novamente para usar a IA.'
        : 'O serviço de IA não respondeu. O plano por regras continua funcionando.';
    return { available: false, reason: message };
  }
}

export interface CoachAnswer {
  available: boolean;
  answer?: string;
  reason?: string;
}

/**
 * Pergunta ao treinador. Quando não há IA, devolve `available: false` e a UI
 * mostra respostas baseadas nas regras do plano (nunca texto fingindo ser IA).
 */
export async function askCoach(params: {
  question: string;
  context: Record<string, unknown>;
}): Promise<CoachAnswer> {
  const status = await getAiStatus();
  if (!status.available) {
    return { available: false, reason: 'Nenhum provedor de IA configurado.' };
  }

  const token = await accessToken();
  if (!token) return { available: false, reason: 'Sessão expirada.' };

  try {
    const response = await postJson<{ answer?: string; error?: string }>('/api/ai/chat', {
      token,
      question: params.question,
      context: params.context,
    }, { timeoutMs: 30_000 });

    if (!response.answer) {
      return { available: false, reason: response.error ?? 'Sem resposta.' };
    }

    return { available: true, answer: response.answer };
  } catch {
    return { available: false, reason: 'O serviço de IA não respondeu.' };
  }
}

/**
 * Respostas determinísticas do treinador (fallback transparente).
 *
 * Baseadas nas regras do próprio plano e em princípios gerais de treinamento.
 * Não são diagnóstico, não prometem prazo e não fingem ser IA.
 */
export function localCoachAnswer(
  question: string,
  context: {
    goal?: string;
    level?: string;
    sessionsPerWeek?: number;
    minutesPerSession?: number;
    dayNames?: string[];
  },
): string {
  const text = question.toLowerCase();

  if (/descanso|intervalo|pausa/.test(text)) {
    return 'O descanso entre séries segue o objetivo: força costuma pedir 2 a 3 minutos; hipertrofia, 60 a 90 segundos; condicionamento e perda de gordura, 30 a 60 segundos. Cada exercício do seu plano mostra o intervalo recomendado — use-o como ponto de partida, não como regra absoluta.';
  }

  if (/progress|aument|subir|carga/.test(text)) {
    return 'Progressão saudável é gradual: quando você completa todas as séries no topo da faixa de repetições com técnica consistente em duas sessões seguidas, aumente a carga em um passo pequeno (2–5% ou o menor incremento disponível). Se a técnica piorar, volte um passo. Não existe prazo garantido de resultado.';
  }

  if (/dor|lesão|lesao|machuc|sensível|sensivel/.test(text)) {
    return 'Dor aguda, que piora durante o movimento ou persiste depois do treino, não é algo para "treinar por cima". Pare o exercício, registre a observação na sessão e procure um profissional de saúde para avaliação. Este app não faz diagnóstico nem prescreve reabilitação.';
  }

  if (/falt|perd|pul|semana|rotina|tempo/.test(text)) {
    return 'Se a semana apertar, faça a versão curta: mantenha os exercícios principais (os primeiros do dia) e reduza séries. Duas sessões bem-feitas valem mais que quatro pela metade. O importante é retomar no próximo dia previsto.';
  }

  if (/substitu|trocar|equipamento|aparelho/.test(text)) {
    return 'Todo exercício do plano tem alternativas ligadas ao mesmo padrão de movimento. No treinador você pode trocar qualquer exercício por uma alternativa compatível com seus equipamentos — o restante do plano permanece igual.';
  }

  if (/hipertrofia|massa|músculo|musculo/.test(text)) {
    return 'Para hipertrofia, o plano combina volume progressivo, proximidade da falha controlada e recuperação. O ganho depende de treino consistente, alimentação suficiente (incluindo proteína), sono e tempo — não há garantia de prazo.';
  }

  if (/força|forca/.test(text)) {
    return 'Força se constrói com séries mais pesadas, poucas repetições e descanso maior, com foco em técnica. O plano atual usa essa estrutura e uma progressão gradual de carga.';
  }

  const goal = context.goal ?? 'seu objetivo';
  const sessions = context.sessionsPerWeek ?? 3;
  const minutes = context.minutesPerSession ?? 45;

  return `Seu plano atual tem ${sessions} sessões por semana, de aproximadamente ${minutes} minutos, voltado para ${goal}. Os exercícios foram escolhidos pelos padrões de movimento, equipamentos e nível ${context.level ?? 'informado'}. Se a dúvida for sobre um exercício específico, abra o treino e veja instruções, erros comuns e alternativas.`;
}
