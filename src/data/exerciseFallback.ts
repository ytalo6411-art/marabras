/**
 * Catálogo local de emergência.
 *
 * Usado apenas quando o Supabase está inacessível (rede/projeto fora do ar).
 * São movimentos de peso corporal consolidados, com descrição própria — nenhum
 * vídeo, imagem ou atribuição é inventado.
 *
 * IMPORTANTE: estes exercícios NÃO têm UUID do banco, então não podem ser
 * gravados em `workout_exercises` (que exige FK). Eles servem para o usuário
 * continuar consultando o catálogo e para explicar o que fazer quando a conexão
 * voltar.
 */

import type { DifficultyLevel } from '@/types/database';

export interface FallbackExercise {
  slug: string;
  name: string;
  primary_muscle: string;
  secondary_muscles: string[];
  equipment: string[];
  difficulty: DifficultyLevel;
  instructions: string;
}

export const FALLBACK_EXERCISES: FallbackExercise[] = [
  {
    slug: 'fallback-flexao',
    name: 'Flexão de braços',
    primary_muscle: 'pectoralis_major',
    secondary_muscles: ['triceps', 'anterior_deltoid', 'core'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions:
      'Mãos na largura dos ombros, corpo alinhado da cabeça aos calcanhares. Desça o peito até perto do chão e empurre. Apoie os joelhos se precisar reduzir a carga.',
  },
  {
    slug: 'fallback-agachamento-livre',
    name: 'Agachamento livre',
    primary_muscle: 'quadriceps',
    secondary_muscles: ['glutes', 'hamstrings', 'core'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions:
      'Pés na largura dos ombros, pontas levemente para fora. Desça o quadril para trás e para baixo mantendo o tronco firme. Suba empurrando o chão.',
  },
  {
    slug: 'fallback-ponte-gluteos',
    name: 'Ponte de glúteos',
    primary_muscle: 'glutes',
    secondary_muscles: ['hamstrings', 'core'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions:
      'Deitado, pés apoiados e joelhos dobrados. Empurre o chão com os calcanhares e eleve o quadril, contraindo os glúteos no topo. Desça com controle.',
  },
  {
    slug: 'fallback-prancha',
    name: 'Prancha frontal',
    primary_muscle: 'rectus_abdominis',
    secondary_muscles: ['obliques', 'core', 'anterior_deltoid'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions:
      'Apoie antebraços e pontas dos pés, alinhando cabeça, quadris e calcanhares. Contraia o abdômen e respire de forma curta e constante.',
  },
  {
    slug: 'fallback-remada-elastico',
    name: 'Remada com elástico',
    primary_muscle: 'middle_back',
    secondary_muscles: ['lats', 'biceps', 'rhomboids'],
    equipment: ['band'],
    difficulty: 'beginner',
    instructions:
      'Prenda o elástico à frente na altura do peito. Puxe os cotovelos para trás mantendo as escápulas juntas, sem balançar o tronco.',
  },
  {
    slug: 'fallback-elevacao-quadril-unilateral',
    name: 'Elevação de quadril unilateral',
    primary_muscle: 'glutes',
    secondary_muscles: ['hamstrings', 'core'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    instructions:
      'Deitado com um pé apoiado e o outro elevado, suba o quadril empurrando com o calcanhar de apoio. Desça devagar sem deixar o quadril cair.',
  },
  {
    slug: 'fallback-afundo',
    name: 'Afundo alternado',
    primary_muscle: 'quadriceps',
    secondary_muscles: ['glutes', 'hamstrings', 'core'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions:
      'Dê um passo à frente e desça até os dois joelhos dobrarem perto de 90°. Empurre com a perna da frente para voltar. Mantenha o tronco ereto.',
  },
  {
    slug: 'fallback-mountain-climber',
    name: 'Escalador (mountain climber)',
    primary_muscle: 'core',
    secondary_muscles: ['cardiovascular', 'hip_flexors'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions:
      'Na posição de prancha alta, alterne os joelhos em direção ao peito em ritmo constante. Evite elevar o quadril.',
  },
  {
    slug: 'fallback-puxada-elastico',
    name: 'Puxada com elástico',
    primary_muscle: 'lats',
    secondary_muscles: ['biceps', 'middle_back'],
    equipment: ['band'],
    difficulty: 'beginner',
    instructions:
      'Prenda o elástico acima da cabeça. Puxe os cotovelos para baixo e para trás, aproximando as escápulas. Volte controlando.',
  },
  {
    slug: 'fallback-superman',
    name: 'Superman',
    primary_muscle: 'erector_spinae',
    secondary_muscles: ['glutes', 'hamstrings'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions:
      'Deitado de bruços, eleve braços e pernas ao mesmo tempo com controle, sem forçar a lombar. Segure por 2 segundos e desça.',
  },
  {
    slug: 'fallback-flexao-diamante',
    name: 'Flexão diamante',
    primary_muscle: 'triceps',
    secondary_muscles: ['pectoralis_major', 'anterior_deltoid'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    instructions:
      'Mãos próximas formando um triângulo sob o peito. Mantenha os cotovelos próximos ao tronco durante a descida.',
  },
  {
    slug: 'fallback-prancha-lateral',
    name: 'Prancha lateral',
    primary_muscle: 'obliques',
    secondary_muscles: ['core', 'abductors'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions:
      'Apoie o antebraço alinhado ao ombro e empilhe os pés. Eleve o quadril formando uma linha reta. Troque de lado.',
  },
  {
    slug: 'fallback-agachamento-bulgaro',
    name: 'Agachamento búlgaro',
    primary_muscle: 'quadriceps',
    secondary_muscles: ['glutes', 'hamstrings'],
    equipment: ['bodyweight', 'bench'],
    difficulty: 'intermediate',
    instructions:
      'Com o pé de trás apoiado em um banco, desça o joelho de trás em direção ao chão mantendo o tronco estável. Use apoio para equilíbrio.',
  },
  {
    slug: 'fallback-panturrilha',
    name: 'Elevação de panturrilha em pé',
    primary_muscle: 'calves',
    secondary_muscles: ['soleus'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions:
      'Em pé, suba nas pontas dos pés o mais alto que conseguir e desça devagar até alongar a panturrilha. Apoie em uma parede se precisar.',
  },
  {
    slug: 'fallback-good-morning-peso-corporal',
    name: 'Bom dia com peso corporal',
    primary_muscle: 'hamstrings',
    secondary_muscles: ['glutes', 'erector_spinae'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions:
      'Em pé, joelhos levemente flexionados, leve o quadril para trás inclinando o tronco com a coluna neutra. Volte contraindo glúteos.',
  },
  {
    slug: 'fallback-remada-invertida',
    name: 'Remada invertida',
    primary_muscle: 'middle_back',
    secondary_muscles: ['biceps', 'lats'],
    equipment: ['bodyweight', 'pullup_bar'],
    difficulty: 'intermediate',
    instructions:
      'Sob uma barra baixa, segure e puxe o peito até a barra mantendo o corpo reto. Ajuste a dificuldade pela altura da barra.',
  },
  {
    slug: 'fallback-elevacao-lateral-elastico',
    name: 'Elevação lateral com elástico',
    primary_muscle: 'deltoids',
    secondary_muscles: ['upper_back'],
    equipment: ['band'],
    difficulty: 'beginner',
    instructions:
      'Pise no elástico e eleve os braços lateralmente até a altura dos ombros, sem encolher os ombros.',
  },
  {
    slug: 'fallback-rosca-elasticos',
    name: 'Rosca com elástico',
    primary_muscle: 'biceps',
    secondary_muscles: ['forearms'],
    equipment: ['band'],
    difficulty: 'beginner',
    instructions:
      'Pise no elástico e flexione os cotovelos mantendo os braços junto ao tronco. Desça controlando a volta.',
  },
  {
    slug: 'fallback-triceps-banco',
    name: 'Tríceps no banco',
    primary_muscle: 'triceps',
    secondary_muscles: ['anterior_deltoid'],
    equipment: ['bodyweight', 'bench'],
    difficulty: 'beginner',
    instructions:
      'Mãos no banco atrás do corpo, cotovelos dobrando para descer o quadril. Empurre para voltar sem encostar o corpo.',
  },
  {
    slug: 'fallback-abdominal-bicicleta',
    name: 'Abdominal bicicleta',
    primary_muscle: 'obliques',
    secondary_muscles: ['rectus_abdominis'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions:
      'Deitado, alterne cotovelo direito com joelho esquerdo em rotação controlada. Não puxe a cabeça com as mãos.',
  },
  {
    slug: 'fallback-agachamento-isometrico-parede',
    name: 'Agachamento isométrico na parede',
    primary_muscle: 'quadriceps',
    secondary_muscles: ['glutes', 'core'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions:
      'Costas apoiadas na parede, quadris e joelhos em cerca de 90°. Mantenha a posição respirando de forma constante.',
  },
  {
    slug: 'fallback-caminhada',
    name: 'Caminhada rápida',
    primary_muscle: 'cardiovascular',
    secondary_muscles: ['quadriceps', 'calves'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions:
      'Caminhe em ritmo que ainda permita conversar. Aqueça 5 minutos, mantenha o ritmo escolhido e reduza no final.',
  },
  {
    slug: 'fallback-mobilidade-quadril',
    name: 'Mobilidade de quadril em quatro apoios',
    primary_muscle: 'mobility',
    secondary_muscles: ['hip_flexors', 'glutes'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions:
      'Em quatro apoios, desenhe círculos amplos com o joelho, sem forçar a lombar. Faça dos dois lados.',
  },
  {
    slug: 'fallback-alongamento-peitoral',
    name: 'Alongamento de peitoral na parede',
    primary_muscle: 'mobility',
    secondary_muscles: ['pectoralis_major'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions:
      'Apoie o antebraço na parede e gire o tronco para o lado oposto até sentir alongar o peito. Sem dor aguda.',
  },
];
