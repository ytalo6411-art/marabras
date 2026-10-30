/**
 * Catálogo de modelos de treino do ATHLETIX.
 *
 * Cada modelo é um PRESET DE RESTRIÇÕES (objetivo, nível, ambiente,
 * equipamento, frequência, duração e divisão semanal). Os exercícios não são
 * fixos: o gerador escolhe, no catálogo real, os que cabem no perfil e nos
 * equipamentos de quem está usando.
 *
 * Sobre as coleções "curadoria":
 *   • `women_curated` / `men_curated` são apenas uma forma de organizar a
 *     vitrine (nomes e ênfases), não uma regra fisiológica. Todo modelo aparece
 *     para todo mundo — quem escolhe é o usuário.
 */

import type {
  DifficultyLevel,
  PreferredTraining,
  TrainingEnvironment,
  TrainingGoal,
} from '@/types/database';

export interface WorkoutTemplate {
  slug: string;
  name: string;
  tagline: string;
  /** Nível mínimo recomendado — iniciantes continuam podendo escolher. */
  level: DifficultyLevel;
  goal: TrainingGoal;
  secondaryGoals?: TrainingGoal[];
  environment: TrainingEnvironment;
  /** Equipamentos que o gerador pode usar neste modelo. */
  equipment: string[];
  daysPerWeek: number;
  minutesPerSession: number;
  split: 'full_body' | 'split' | 'coach_choice';
  preferredTraining?: PreferredTraining[];
  /** Músculos com prioridade na seleção. */
  emphasis?: string[];
  /** Apenas vitrine: não restringe o acesso. */
  audience: 'all' | 'women_curated' | 'men_curated';
  highlights: string[];
  note?: string;
}

export const TRAINING_FOCUS_LABELS: Record<TrainingGoal, string> = {
  hypertrophy: 'Hipertrofia',
  strength: 'Força',
  conditioning: 'Condicionamento',
  endurance: 'Resistência',
  mobility: 'Mobilidade',
  fat_loss: 'Redução de gordura',
  active_routine: 'Rotina ativa',
  sport_performance: 'Esporte',
};

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    slug: 'primeiro-treino-em-casa',
    name: 'Primeiro treino em casa',
    tagline: 'Corpo inteiro, sem equipamento, direto no chão da sala.',
    level: 'beginner',
    goal: 'active_routine',
    secondaryGoals: ['conditioning'],
    environment: 'home_bodyweight',
    equipment: ['bodyweight'],
    daysPerWeek: 3,
    minutesPerSession: 30,
    split: 'full_body',
    preferredTraining: ['calisthenics'],
    audience: 'all',
    highlights: ['Sem equipamento', '3× por semana', 'Sessões de 30 min'],
  },
  {
    slug: 'hipertrofia-academia-abc',
    name: 'Hipertrofia — ABC na academia',
    tagline: 'Empurrar, puxar e pernas em três sessões bem distribuídas.',
    level: 'intermediate',
    goal: 'hypertrophy',
    environment: 'gym',
    equipment: ['bodyweight', 'dumbbell', 'barbell', 'machine', 'cable', 'bench', 'pullup_bar'],
    daysPerWeek: 3,
    minutesPerSession: 60,
    split: 'split',
    preferredTraining: ['strength_training'],
    audience: 'all',
    highlights: ['Split ABC', 'Academia completa', 'Volume moderado-alto'],
  },
  {
    slug: 'hipertrofia-academia-abcd',
    name: 'Hipertrofia — ABCD superior/inferior',
    tagline: 'Quatro dias alternando parte superior e inferior.',
    level: 'intermediate',
    goal: 'hypertrophy',
    secondaryGoals: ['strength'],
    environment: 'gym',
    equipment: ['bodyweight', 'dumbbell', 'barbell', 'machine', 'cable', 'bench', 'pullup_bar'],
    daysPerWeek: 4,
    minutesPerSession: 55,
    split: 'split',
    preferredTraining: ['strength_training'],
    audience: 'all',
    highlights: ['Split ABCD', '4× por semana', 'Boa recuperação entre sessões'],
  },
  {
    slug: 'forca-base',
    name: 'Força base',
    tagline: 'Levantamentos principais com descanso longo e técnica primeiro.',
    level: 'intermediate',
    goal: 'strength',
    environment: 'gym',
    equipment: ['bodyweight', 'barbell', 'dumbbell', 'bench', 'pullup_bar'],
    daysPerWeek: 3,
    minutesPerSession: 50,
    split: 'full_body',
    preferredTraining: ['strength_training'],
    audience: 'all',
    highlights: ['3× por semana', 'Séries de 4–6 repetições', 'Descanso de 2–3 min'],
  },
  {
    slug: 'corpo-inteiro-express',
    name: 'Corpo inteiro express',
    tagline: 'Duas ou três sessões curtas para quem tem agenda apertada.',
    level: 'beginner',
    goal: 'active_routine',
    secondaryGoals: ['conditioning'],
    environment: 'home_equipment',
    equipment: ['bodyweight', 'dumbbell', 'band'],
    daysPerWeek: 2,
    minutesPerSession: 25,
    split: 'full_body',
    preferredTraining: ['mixed'],
    audience: 'all',
    highlights: ['Sessões de 25 min', 'Casa com pouco equipamento', 'Fácil de manter'],
  },
  {
    slug: 'condicionamento-e-perda-de-gordura',
    name: 'Condicionamento e gordura corporal',
    tagline: 'Circuito de força + cardio, com descanso curto.',
    level: 'beginner',
    goal: 'fat_loss',
    secondaryGoals: ['conditioning', 'endurance'],
    environment: 'home_equipment',
    equipment: ['bodyweight', 'dumbbell', 'band', 'kettlebell'],
    daysPerWeek: 4,
    minutesPerSession: 40,
    split: 'full_body',
    preferredTraining: ['mixed', 'cardio'],
    audience: 'all',
    highlights: ['4× por semana', 'Descanso curto', 'Sem promessa de prazo'],
    note: 'Redução de gordura depende de alimentação, sono e constância — o treino é uma parte.',
  },
  {
    slug: 'calistenia-progressiva',
    name: 'Calistenia progressiva',
    tagline: 'Peso do corpo com progressão por variação e alavanca.',
    level: 'beginner',
    goal: 'hypertrophy',
    secondaryGoals: ['strength'],
    environment: 'outdoor',
    equipment: ['bodyweight', 'pullup_bar', 'bench'],
    daysPerWeek: 3,
    minutesPerSession: 40,
    split: 'split',
    preferredTraining: ['calisthenics'],
    audience: 'all',
    highlights: ['Parque ou casa', 'Progressão por variação', 'Trabalha o corpo todo'],
  },
  {
    slug: 'mobilidade-e-controle',
    name: 'Mobilidade e controle',
    tagline: 'Sessões curtas de amplitude, respiração e estabilidade.',
    level: 'beginner',
    goal: 'mobility',
    environment: 'home_bodyweight',
    equipment: ['bodyweight', 'foam_roller', 'band'],
    daysPerWeek: 3,
    minutesPerSession: 20,
    split: 'full_body',
    preferredTraining: ['mobility'],
    audience: 'all',
    highlights: ['20 min', 'Sem impacto', 'Complementa qualquer plano'],
  },
  {
    slug: 'corrida-e-forca',
    name: 'Corrida + força',
    tagline: 'Duas sessões de força para sustentar o volume de corrida.',
    level: 'intermediate',
    goal: 'endurance',
    secondaryGoals: ['strength', 'sport_performance'],
    environment: 'outdoor',
    equipment: ['bodyweight', 'dumbbell', 'band', 'bench'],
    daysPerWeek: 3,
    minutesPerSession: 45,
    split: 'full_body',
    preferredTraining: ['mixed', 'cardio'],
    audience: 'all',
    highlights: ['Força para corredores', 'Core e panturrilha incluídos', 'Cardio complementar'],
  },
  {
    slug: 'superior-e-bracos',
    name: 'Superior e braços',
    tagline: 'Empurrar, puxar e braços com foco em execução.',
    level: 'intermediate',
    goal: 'hypertrophy',
    environment: 'gym',
    equipment: ['bodyweight', 'dumbbell', 'barbell', 'cable', 'machine', 'bench'],
    daysPerWeek: 4,
    minutesPerSession: 50,
    split: 'split',
    preferredTraining: ['strength_training'],
    emphasis: ['biceps', 'triceps', 'deltoids', 'lats'],
    audience: 'men_curated',
    highlights: ['Curadoria de vitrine', 'Disponível para qualquer perfil', 'Foco em braços'],
  },
  {
    slug: 'pernas-e-gluteos',
    name: 'Pernas e glúteos',
    tagline: 'Agachamento, dobradiça e unilateral com progressão.',
    level: 'intermediate',
    goal: 'hypertrophy',
    secondaryGoals: ['strength'],
    environment: 'gym',
    equipment: ['bodyweight', 'dumbbell', 'barbell', 'machine', 'cable', 'bench', 'band'],
    daysPerWeek: 3,
    minutesPerSession: 55,
    split: 'split',
    preferredTraining: ['strength_training'],
    emphasis: ['glutes', 'quadriceps', 'hamstrings'],
    audience: 'women_curated',
    highlights: ['Curadoria de vitrine', 'Disponível para qualquer perfil', 'Foco em membros inferiores'],
  },
  {
    slug: 'core-e-condicionamento',
    name: 'Core e condicionamento',
    tagline: 'Tronco estável, respiração e fôlego em sessões de 30 minutos.',
    level: 'beginner',
    goal: 'conditioning',
    secondaryGoals: ['mobility', 'endurance'],
    environment: 'home_bodyweight',
    equipment: ['bodyweight', 'band'],
    daysPerWeek: 3,
    minutesPerSession: 30,
    split: 'full_body',
    preferredTraining: ['calisthenics', 'cardio'],
    emphasis: ['abdominals', 'obliques'],
    audience: 'all',
    highlights: ['Sem equipamento', 'Core + cardio', 'Baixo impacto'],
  },
  {
    slug: 'atleta-avancado-ppl',
    name: 'Atleta avançado — PPL 6×',
    tagline: 'Push/Pull/Legs duas vezes na semana, com volume alto.',
    level: 'advanced',
    goal: 'hypertrophy',
    secondaryGoals: ['strength'],
    environment: 'gym',
    equipment: ['bodyweight', 'dumbbell', 'barbell', 'machine', 'cable', 'bench', 'pullup_bar', 'kettlebell'],
    daysPerWeek: 6,
    minutesPerSession: 70,
    split: 'split',
    preferredTraining: ['strength_training'],
    audience: 'all',
    highlights: ['6× por semana', 'Volume alto', 'Requer recuperação e sono'],
    note: 'Só faz sentido com experiência consolidada e recuperação adequada.',
  },
  {
    slug: 'desempenho-esportivo',
    name: 'Desempenho esportivo',
    tagline: 'Potência, unilateral e core para o seu esporte.',
    level: 'intermediate',
    goal: 'sport_performance',
    secondaryGoals: ['strength', 'conditioning'],
    environment: 'gym',
    equipment: ['bodyweight', 'dumbbell', 'barbell', 'kettlebell', 'medicine_ball', 'bench', 'band'],
    daysPerWeek: 4,
    minutesPerSession: 50,
    split: 'split',
    preferredTraining: ['mixed'],
    audience: 'all',
    highlights: ['4× por semana', 'Trabalho unilateral', 'Cardio alático leve'],
  },
];

export const TEMPLATE_FILTERS = {
  goal: Object.keys(TRAINING_FOCUS_LABELS) as TrainingGoal[],
  level: ['beginner', 'intermediate', 'advanced'] as DifficultyLevel[],
  environment: ['gym', 'home_equipment', 'home_bodyweight', 'outdoor', 'other'] as TrainingEnvironment[],
};

export function findTemplate(slug: string): WorkoutTemplate | undefined {
  return WORKOUT_TEMPLATES.find((t) => t.slug === slug);
}
