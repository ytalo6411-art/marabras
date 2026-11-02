/**
 * Taxonomia de treino do ATHLETIX.
 *
 * Converte o vocabulário dos catálogos (snake_case vindo do Free Exercise DB /
 * seed do Supabase) em padrões de movimento e grupos musculares utilizáveis
 * pelo gerador de planos.
 *
 * Regra do projeto: não existe "exercício masculino" ou "exercício feminino".
 * A seleção considera experiência, equipamento, objetivo e limitações — nunca
 * gênero.
 */

import type {
  AgeRange,
  DifficultyLevel,
  PreferredTraining,
  SessionLengthPreference,
  SplitPreference,
  TrainingEnvironment,
  TrainingExperience,
  TrainingGoal,
} from '@/types/database';

/* ─── Padrões de movimento ─────────────────────────────────────────────────── */

export type MovementPattern =
  | 'push_horizontal'
  | 'push_vertical'
  | 'pull_horizontal'
  | 'pull_vertical'
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'core'
  | 'elbow_flexion'
  | 'elbow_extension'
  | 'shoulder_isolation'
  | 'calves'
  | 'cardio'
  | 'mobility'
  | 'full_body';

export const MOVEMENT_LABELS: Record<MovementPattern, string> = {
  push_horizontal: 'Empurrar horizontal',
  push_vertical: 'Empurrar vertical',
  pull_horizontal: 'Puxar horizontal',
  pull_vertical: 'Puxar vertical',
  squat: 'Agachamento',
  hinge: 'Dobradiça de quadril',
  lunge: 'Avanço / unilateral',
  core: 'Core',
  elbow_flexion: 'Flexão de cotovelo',
  elbow_extension: 'Extensão de cotovelo',
  shoulder_isolation: 'Isolamento de ombro',
  calves: 'Panturrilhas',
  cardio: 'Cardio',
  mobility: 'Mobilidade',
  full_body: 'Corpo inteiro',
};

/* ─── Grupos musculares (nomes exibidos) ───────────────────────────────────── */

export interface MuscleMeta {
  label: string;
  /** Agrupamento amplo — usado para distribuir volume na semana. */
  group: 'push' | 'pull' | 'legs' | 'core' | 'cardio' | 'mobility';
}

export const MUSCLE_META: Record<string, MuscleMeta> = {
  pectoralis_major: { label: 'Peitoral', group: 'push' },
  upper_pectoralis: { label: 'Peitoral superior', group: 'push' },
  chest: { label: 'Peito', group: 'push' },
  anterior_deltoid: { label: 'Deltoide anterior', group: 'push' },
  deltoids: { label: 'Ombros', group: 'push' },
  shoulders: { label: 'Ombros', group: 'push' },
  triceps: { label: 'Tríceps', group: 'push' },
  serratus_anterior: { label: 'Serrátil', group: 'push' },
  lats: { label: 'Dorsais', group: 'pull' },
  back: { label: 'Costas', group: 'pull' },
  middle_back: { label: 'Meio das costas', group: 'pull' },
  upper_back: { label: 'Parte superior das costas', group: 'pull' },
  rhomboids: { label: 'Romboides', group: 'pull' },
  traps: { label: 'Trapézio', group: 'pull' },
  posterior_deltoid: { label: 'Deltoide posterior', group: 'pull' },
  biceps: { label: 'Bíceps', group: 'pull' },
  brachialis: { label: 'Braquial', group: 'pull' },
  forearms: { label: 'Antebraços', group: 'pull' },
  erector_spinae: { label: 'Eretores da espinha', group: 'pull' },
  lower_back: { label: 'Lombar', group: 'pull' },
  quadriceps: { label: 'Quadríceps', group: 'legs' },
  hamstrings: { label: 'Posterior de coxa', group: 'legs' },
  glutes: { label: 'Glúteos', group: 'legs' },
  gluteus_medius: { label: 'Glúteo médio', group: 'legs' },
  gluteus_minimus: { label: 'Glúteo mínimo', group: 'legs' },
  adductors: { label: 'Adutores', group: 'legs' },
  abductors: { label: 'Abdutores', group: 'legs' },
  hip_flexors: { label: 'Flexores do quadril', group: 'legs' },
  calves: { label: 'Panturrilhas', group: 'legs' },
  gastrocnemius: { label: 'Panturrilha (gastrocnêmio)', group: 'legs' },
  soleus: { label: 'Sóleo', group: 'legs' },
  tibialis_anterior: { label: 'Tibial anterior', group: 'legs' },
  abdominals: { label: 'Abdômen', group: 'core' },
  rectus_abdominis: { label: 'Reto abdominal', group: 'core' },
  obliques: { label: 'Oblíquos', group: 'core' },
  transverse_abdominis: { label: 'Transverso do abdômen', group: 'core' },
  core: { label: 'Core', group: 'core' },
  cardiovascular: { label: 'Cardiorrespiratório', group: 'cardio' },
  cardio: { label: 'Cardio', group: 'cardio' },
  mobility: { label: 'Mobilidade', group: 'mobility' },
  thoracic_spine: { label: 'Coluna torácica', group: 'mobility' },
  full_body: { label: 'Corpo inteiro', group: 'core' },
};

/** Nome exibível de um músculo vindo de qualquer fonte. */
export function muscleLabel(muscle: string): string {
  const meta = MUSCLE_META[muscle];
  if (meta) return meta.label;
  return muscle
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());
}

/** Grupo amplo usado na distribuição semanal de volume. */
export function muscleGroup(muscle: string): MuscleMeta['group'] {
  return MUSCLE_META[muscle]?.group ?? 'core';
}

/* ─── Inferência de padrão de movimento ────────────────────────────────────── */

const MUSCLE_TO_PATTERN: Record<string, MovementPattern> = {
  pectoralis_major: 'push_horizontal',
  upper_pectoralis: 'push_horizontal',
  chest: 'push_horizontal',
  anterior_deltoid: 'push_vertical',
  deltoids: 'push_vertical',
  shoulders: 'push_vertical',
  triceps: 'elbow_extension',
  serratus_anterior: 'push_horizontal',
  lats: 'pull_vertical',
  back: 'pull_horizontal',
  middle_back: 'pull_horizontal',
  upper_back: 'pull_horizontal',
  rhomboids: 'pull_horizontal',
  traps: 'pull_horizontal',
  posterior_deltoid: 'shoulder_isolation',
  biceps: 'elbow_flexion',
  brachialis: 'elbow_flexion',
  forearms: 'elbow_flexion',
  erector_spinae: 'hinge',
  lower_back: 'hinge',
  quadriceps: 'squat',
  hamstrings: 'hinge',
  glutes: 'hinge',
  gluteus_medius: 'lunge',
  gluteus_minimus: 'lunge',
  adductors: 'lunge',
  abductors: 'lunge',
  hip_flexors: 'core',
  calves: 'calves',
  gastrocnemius: 'calves',
  soleus: 'calves',
  tibialis_anterior: 'calves',
  abdominals: 'core',
  rectus_abdominis: 'core',
  obliques: 'core',
  transverse_abdominis: 'core',
  core: 'core',
  cardiovascular: 'cardio',
  cardio: 'cardio',
  mobility: 'mobility',
  thoracic_spine: 'mobility',
  full_body: 'full_body',
};

/**
 * Refina o padrão pelo nome do exercício. O músculo-alvo sozinho é ambíguo:
 * "leg extension" e "leg press" são ambos quadríceps, mas um é isolamento de
 * joelho e o outro é empurrar. O nome resolve isso.
 */
/**
 * A ORDEM IMPORTA: a primeira regra que casa vence. Por isso os padrões mais
 * específicos vêm antes dos genéricos.
 *
 * Bugs reais que esta ordem corrige (catálogo de 317 exercícios):
 *  • "Bench Dips" casava em `bench` → push_horizontal (é tríceps).
 *  • "Bench Pull-Up" casava em `bench` → push_horizontal (é dorsal).
 *  • "Bench Crunch" casava em `bench` → push_horizontal (é core).
 *  • "Band Prone Leg Curl" casava em `curl` → elbow_flexion (é posterior).
 *  • "Calf Stretch with Rope" casava em `calf` → calves (é mobilidade).
 * `bench`/`incline`/`decline` são qualificadores de banco, não o movimento.
 */
const NAME_RULES: { test: RegExp; pattern: MovementPattern }[] = [
  // 1. Mobilidade/alongamento antes de tudo: "Calf Stretch", "Chest Stretch".
  { test: /\b(stretch|alongamento|mobility|mobilidade|cat[- ]?cow|yoga|pose|postura)\b/i, pattern: 'mobility' },

  // 2. Cardio explícito.
  { test: /\b(run|running|corrida|bike|bicicleta|cycling|rower|remo erg|jump rope|corda|burpee|elliptical|elíptico|escada|stair|walk|caminhada|sprint|cardio|battling ropes)\b/i, pattern: 'cardio' },

  // 3. Core antes de empurrar: "Bench Crunch", "Exercise Ball Sit-Up".
  { test: /\b(plank|prancha|crunch|abdominal|sit[- ]?up|hollow|dead bug|russian twist|mountain climber|side bend|flexão lateral|standing lift|twist|leg raise|elevacao de pernas)\b/i, pattern: 'core' },

  // 4. Posterior de coxa: "leg curl" é joelho, não cotovelo.
  { test: /\b(leg curl|mesa flexora|cadeira flexora|flexora|nordic|good morning)\b/i, pattern: 'hinge' },

  // 5. Tríceps antes de peito: "Bench Dips", "Close-Grip Push-Up".
  { test: /\b(triceps|tríceps|skull|mergulho|dips?|close[- ]grip push[- ]?up|pushdown|kickback)\b/i, pattern: 'elbow_extension' },

  // 6. Puxar vertical antes de "row": "Bench Pull-Up", "Chin-ups".
  { test: /\b(pull[- ]?up|chin[- ]?up|lat pull|pulldown|pull[- ]down|barra fixa|puxada)\b/i, pattern: 'pull_vertical' },

  // 7. Remadas.
  { test: /\b(row|remada|shrug|encolhimento)\b/i, pattern: 'pull_horizontal' },

  // 8. Cadeia posterior.
  { test: /\b(deadlift|romanian|rdl|levantamento terra|stiff|hip thrust|glute bridge|ponte|elevacao pelvica|pull[- ]through|hyperextension|hiperextensao|back extension)\b/i, pattern: 'hinge' },

  // 9. Unilateral antes de agachamento: "Split Squat", "Barbell Lunge".
  { test: /\b(lunge|afundo|avanco|avanço|step[- ]?up|split squat|passada|bulgarian|búlgaro)\b/i, pattern: 'lunge' },

  // 10. Agachamento / empurrar com as pernas.
  { test: /\b(squat|agachamento|leg press|hack)\b/i, pattern: 'squat' },

  // 11. Panturrilhas (depois de stretch, que já saiu).
  { test: /\b(calf|panturrilha|gêmeos|gemeos|soleus|sóleo)\b/i, pattern: 'calves' },

  // 12. Isolamento de ombro antes de empurrar vertical.
  { test: /\b(lateral raise|front raise|reverse fly|rear delt|posterior delt|elevacao lateral|elevação lateral|crucifixo inverso|upright row|iron cross)\b/i, pattern: 'shoulder_isolation' },

  // 13. Empurrar vertical.
  { test: /\b(overhead press|shoulder press|military press|arnold press|desenvolvimento|behind[- ]the[- ]neck press)\b/i, pattern: 'push_vertical' },

  // 14. Empurrar horizontal. `bench` só vale acompanhado de press/fly.
  { test: /\b(push[- ]?up|chest press|bench press|fly|crucifixo|supino|flexao|flexão|crossover|close[- ]grip press|hammer press)\b/i, pattern: 'push_horizontal' },

  // 15. Flexão de cotovelo por último: "curl" genérico (rosca).
  { test: /\b(curl|rosca|wrist|punho)\b/i, pattern: 'elbow_flexion' },
];

export function inferMovementPattern(name: string, primaryMuscle: string): MovementPattern {
  const byName = NAME_RULES.find((rule) => rule.test.test(name));
  if (byName) return byName.pattern;
  return MUSCLE_TO_PATTERN[primaryMuscle] ?? 'full_body';
}

/* ─── Rótulos de opções do questionário ────────────────────────────────────── */

/**
 * Chave de ícone, não glifo. A camada de dados não depende de React: quem
 * renderiza resolve a chave para o componente vetorial em `optionIcons`.
 * Assim o questionário usa o mesmo traço do resto do produto, sem emoji.
 */
export type OptionIconName =
  | 'dumbbell' | 'barbell' | 'flame' | 'run' | 'mobility' | 'scale'
  | 'calendar' | 'bolt' | 'building' | 'home' | 'body' | 'tree' | 'map-pin';

export const EXPERIENCE_OPTIONS: {
  value: TrainingExperience;
  label: string;
  hint: string;
}[] = [
  { value: 'never', label: 'Nunca treinei', hint: 'Vou começar do zero, com calma.' },
  { value: 'beginner', label: 'Menos de 6 meses', hint: 'Já treinei algumas vezes.' },
  { value: 'intermediate', label: 'De 6 meses a 2 anos', hint: 'Já tenho rotina e técnica básica.' },
  { value: 'advanced', label: 'Mais de 2 anos', hint: 'Treino com constância e progressão.' },
];

export const GOAL_OPTIONS: {
  value: TrainingGoal;
  label: string;
  hint: string;
  icon: OptionIconName;
}[] = [
  { value: 'hypertrophy', label: 'Ganhar massa muscular', hint: 'Volume e progressão de carga', icon: 'dumbbell' },
  { value: 'strength', label: 'Desenvolver força', hint: 'Cargas altas, poucas repetições', icon: 'barbell' },
  { value: 'conditioning', label: 'Melhorar o condicionamento', hint: 'Fôlego e capacidade de trabalho', icon: 'flame' },
  { value: 'endurance', label: 'Aumentar a resistência', hint: 'Aguentar mais tempo e mais séries', icon: 'run' },
  { value: 'mobility', label: 'Melhorar a mobilidade', hint: 'Amplitude e controle articular', icon: 'mobility' },
  { value: 'fat_loss', label: 'Reduzir gordura corporal', hint: 'Com hábitos sustentáveis, sem dieta milagrosa', icon: 'scale' },
  { value: 'active_routine', label: 'Manter uma rotina ativa', hint: 'Consistência acima de intensidade', icon: 'calendar' },
  { value: 'sport_performance', label: 'Desempenho esportivo', hint: 'Força e potência para o seu esporte', icon: 'bolt' },
];

export const GOAL_LABELS: Record<TrainingGoal, string> = Object.fromEntries(
  GOAL_OPTIONS.map((g) => [g.value, g.label]),
) as Record<TrainingGoal, string>;

export const ENVIRONMENT_OPTIONS: {
  value: TrainingEnvironment;
  label: string;
  hint: string;
  icon: OptionIconName;
}[] = [
  { value: 'gym', label: 'Academia completa', hint: 'Máquinas, barras e halteres', icon: 'building' },
  { value: 'home_equipment', label: 'Casa com equipamentos', hint: 'Halteres, elásticos, barra', icon: 'home' },
  { value: 'home_bodyweight', label: 'Casa sem equipamentos', hint: 'Só o peso do corpo e um espaço', icon: 'body' },
  { value: 'outdoor', label: 'Parque / área externa', hint: 'Barras, escadas, pista', icon: 'tree' },
  { value: 'other', label: 'Outro ambiente', hint: 'Hotel, trabalho, espaço pequeno', icon: 'map-pin' },
];

export const ENVIRONMENT_LABELS: Record<TrainingEnvironment, string> = Object.fromEntries(
  ENVIRONMENT_OPTIONS.map((e) => [e.value, e.label]),
) as Record<TrainingEnvironment, string>;

export const EQUIPMENT_OPTIONS: { value: string; label: string }[] = [
  { value: 'bodyweight', label: 'Peso do corpo' },
  { value: 'dumbbell', label: 'Halteres' },
  { value: 'barbell', label: 'Barra e anilhas' },
  { value: 'machine', label: 'Máquinas' },
  { value: 'cable', label: 'Cabos / polia' },
  { value: 'band', label: 'Elásticos' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'bench', label: 'Banco' },
  { value: 'pullup_bar', label: 'Barra fixa' },
  { value: 'medicine_ball', label: 'Bola medicinal' },
  { value: 'foam_roller', label: 'Rolo de liberação' },
];

export const EQUIPMENT_LABELS: Record<string, string> = Object.fromEntries(
  EQUIPMENT_OPTIONS.map((e) => [e.value, e.label]),
);

export const AGE_RANGE_OPTIONS: { value: AgeRange; label: string }[] = [
  { value: '16_17', label: '16 a 17 anos' },
  { value: '18_24', label: '18 a 24 anos' },
  { value: '25_34', label: '25 a 34 anos' },
  { value: '35_44', label: '35 a 44 anos' },
  { value: '45_54', label: '45 a 54 anos' },
  { value: '55_64', label: '55 a 64 anos' },
  { value: '65_plus', label: '65 anos ou mais' },
];

export const PREFERRED_TRAINING_OPTIONS: {
  value: PreferredTraining;
  label: string;
  hint: string;
}[] = [
  { value: 'strength_training', label: 'Musculação', hint: 'Pesos, máquinas e halteres' },
  { value: 'calisthenics', label: 'Calistenia', hint: 'Peso do corpo e barras' },
  { value: 'cardio', label: 'Cardio', hint: 'Corrida, bike, circuito' },
  { value: 'mixed', label: 'Combinação', hint: 'Um pouco de cada' },
  { value: 'mobility', label: 'Mobilidade', hint: 'Alongamento e controle' },
];

export const SESSION_LENGTH_OPTIONS: {
  value: SessionLengthPreference;
  label: string;
  hint: string;
  minutes: number;
}[] = [
  { value: 'short', label: 'Curtos', hint: 'Até 30 minutos', minutes: 25 },
  { value: 'moderate', label: 'Moderados', hint: '30 a 50 minutos', minutes: 45 },
  { value: 'long', label: 'Longos', hint: '50 a 90 minutos', minutes: 70 },
];

export const SPLIT_OPTIONS: { value: SplitPreference; label: string; hint: string }[] = [
  { value: 'coach_choice', label: 'Escolha por mim', hint: 'O gerador decide a divisão ideal' },
  { value: 'full_body', label: 'Corpo inteiro', hint: 'Todo treino trabalha o corpo todo' },
  { value: 'split', label: 'Dividido por grupos', hint: 'AB, ABC, ABCD…' },
];

export const GUIDANCE_OPTIONS: {
  value: 'video' | 'text' | 'both';
  label: string;
}[] = [
  { value: 'both', label: 'Vídeo + instruções escritas' },
  { value: 'video', label: 'Prefiro vídeos' },
  { value: 'text', label: 'Prefiro ler as instruções' },
];

/* ─── Limitações e adaptações ──────────────────────────────────────────────── */

/**
 * Cada limitação é uma ADAPTAÇÃO de seleção de exercícios — não um diagnóstico
 * e não uma prescrição. O app nunca tenta reabilitar nada; ele só evita
 * padrões que costumam incomodar e sugere procurar um profissional.
 */
export interface Limitation {
  value: string;
  label: string;
  /** Padrões evitados na seleção automática. */
  avoidPatterns: MovementPattern[];
  /** Termos que, no nome do exercício, indicam risco para essa limitação. */
  avoidNameTerms: RegExp[];
  adaptation: string;
  suggestsProfessional: boolean;
}

export const LIMITATION_OPTIONS: Limitation[] = [
  {
    value: 'knee',
    label: 'Joelho sensível',
    avoidPatterns: [],
    avoidNameTerms: [/jump/i, /salto/i, /pistol/i, /deep/i, /sissy/i],
    adaptation: 'Priorizamos variações com amplitude controlada e apoio, sem saltos.',
    suggestsProfessional: true,
  },
  {
    value: 'lower_back',
    label: 'Lombar sensível',
    avoidPatterns: [],
    avoidNameTerms: [/good morning/i, /stiff/i, /deadlift/i, /levantamento terra/i, /bent[- ]?over/i],
    adaptation: 'Evitamos cargas altas em flexão de tronco e priorizamos apoio e máquinas.',
    suggestsProfessional: true,
  },
  {
    value: 'shoulder',
    label: 'Ombro sensível',
    avoidPatterns: [],
    avoidNameTerms: [/overhead/i, /military/i, /upright row/i, /behind[- ]?neck/i, /desenvolvimento/i],
    adaptation: 'Trocamos o trabalho acima da cabeça por variações em ângulo neutro.',
    suggestsProfessional: true,
  },
  {
    value: 'wrist',
    label: 'Punho sensível',
    avoidPatterns: [],
    avoidNameTerms: [/handstand/i, /planche/i, /wrist/i, /front lever/i],
    adaptation: 'Preferimos pegadas neutras e apoio em punho fechado ou antebraço.',
    suggestsProfessional: false,
  },
  {
    value: 'hip',
    label: 'Quadril sensível',
    avoidPatterns: [],
    avoidNameTerms: [/sumo/i, /deep squat/i, /split/i],
    adaptation: 'Reduzimos amplitude e evitamos posições de grande abertura.',
    suggestsProfessional: true,
  },
  {
    value: 'neck',
    label: 'Pescoço sensível',
    avoidPatterns: [],
    avoidNameTerms: [/neck/i, /pescoço/i, /shrug/i, /encolhimento/i],
    adaptation: 'Evitamos cargas que puxem a cabeça e o trapézio.',
    suggestsProfessional: false,
  },
  {
    value: 'pregnancy',
    label: 'Gestação',
    avoidPatterns: [],
    avoidNameTerms: [/crunch/i, /abdominal/i, /sit[- ]?up/i, /jump/i, /salto/i, /prone/i],
    adaptation: 'Evitamos compressão abdominal e impacto; procure orientação do seu obstetra.',
    suggestsProfessional: true,
  },
  {
    value: 'other',
    label: 'Outra limitação',
    avoidPatterns: [],
    avoidNameTerms: [],
    adaptation: 'Mantivemos o plano conservador. Ajuste o que incomodar no treinador.',
    suggestsProfessional: false,
  },
];

export const LIMITATION_LABELS: Record<string, string> = Object.fromEntries(
  LIMITATION_OPTIONS.map((l) => [l.value, l.label]),
);

/* ─── Nível ────────────────────────────────────────────────────────────────── */

export function levelFromExperience(experience: TrainingExperience | null): DifficultyLevel {
  switch (experience) {
    case 'intermediate':
      return 'intermediate';
    case 'advanced':
      return 'advanced';
    default:
      return 'beginner';
  }
}

export const LEVEL_LABELS: Record<DifficultyLevel, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

export const LEVEL_ORDER: Record<DifficultyLevel, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

/** Nível máximo de exercício aceito para cada nível de usuário. */
export function allowedDifficulties(level: DifficultyLevel): DifficultyLevel[] {
  if (level === 'advanced') return ['beginner', 'intermediate', 'advanced'];
  if (level === 'intermediate') return ['beginner', 'intermediate'];
  return ['beginner'];
}

/* ─── Equipamentos por ambiente ────────────────────────────────────────────── */

export const ENVIRONMENT_EQUIPMENT: Record<TrainingEnvironment, string[]> = {
  gym: [
    'bodyweight', 'dumbbell', 'barbell', 'machine', 'cable', 'band',
    'kettlebell', 'bench', 'pullup_bar', 'medicine_ball', 'foam_roller',
  ],
  home_equipment: ['bodyweight', 'dumbbell', 'band', 'bench', 'kettlebell', 'medicine_ball', 'foam_roller'],
  home_bodyweight: ['bodyweight', 'band'],
  outdoor: ['bodyweight', 'pullup_bar', 'band', 'bench'],
  other: ['bodyweight', 'band'],
};
