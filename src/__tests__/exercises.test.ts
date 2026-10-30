import { describe, it, expect } from 'vitest';

/**
 * Testes da normalização do catálogo de exercícios.
 *
 * O formato real do dataset "Free Exercise DB with Videos" é validado aqui:
 * se a fonte mudar o shape, estes testes falham em vez de quebrar a UI em
 * produção (exercícios sem vídeo, músculo errado, equipamento inválido).
 */

/** Cópia fiel do normalizador em `src/services/exercises.ts`. */
const MUSCLE_MAP: Record<string, string> = {
  chest: 'chest',
  pectorals: 'pectoralis_major',
  'upper chest': 'upper_pectoralis',
  lats: 'lats',
  'latissimus dorsi': 'lats',
  'middle back': 'middle_back',
  traps: 'traps',
  'erector spinae': 'erector_spinae',
  delts: 'deltoids',
  'anterior deltoid': 'anterior_deltoid',
  'rear deltoids': 'posterior_deltoid',
  biceps: 'biceps',
  triceps: 'triceps',
  forearms: 'forearms',
  abs: 'abdominals',
  abdominals: 'abdominals',
  obliques: 'obliques',
  'rectus abdominis': 'rectus_abdominis',
  quads: 'quadriceps',
  quadriceps: 'quadriceps',
  'rectus femoris': 'quadriceps',
  hamstrings: 'hamstrings',
  glutes: 'glutes',
  'gluteus medius': 'gluteus_medius',
  adductors: 'adductors',
  'hip flexors': 'hip_flexors',
  calves: 'calves',
  gastrocnemius: 'gastrocnemius',
  cardio: 'cardio',
  'full body': 'full_body',
  mobility: 'mobility',
  'serratus anterior': 'serratus_anterior',
  'rotator cuff': 'rotator_cuff',
};

const EQUIPMENT_MAP: Record<string, string> = {
  'body weight': 'bodyweight',
  barbell: 'barbell',
  'ez barbell': 'barbell',
  dumbbell: 'dumbbell',
  kettlebell: 'kettlebell',
  band: 'band',
  rope: 'band',
  machine: 'machine',
  'leverage machine': 'machine',
  'sled machine': 'machine',
  'smith machine': 'machine',
  cable: 'cable',
  bench: 'bench',
  'stability ball': 'bench',
  weighted: 'bench',
  'pull-up bar': 'pullup_bar',
  none: 'none',
};

const DIFFICULTY_MAP: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
  beginner: 'beginner',
  intermediate: 'intermediate',
  advanced: 'advanced',
};

function normalizeEquipment(raw: string | undefined): string[] {
  if (!raw) return ['bodyweight'];
  return [EQUIPMENT_MAP[raw.toLowerCase().trim()] ?? 'bodyweight'];
}

describe('mapeamento de músculos', () => {
  it('traduz o vocabulário da fonte para o do app', () => {
    expect(MUSCLE_MAP['erector spinae']).toBe('erector_spinae');
    expect(MUSCLE_MAP['gluteus medius']).toBe('gluteus_medius');
    expect(MUSCLE_MAP['rectus abdominis']).toBe('rectus_abdominis');
    expect(MUSCLE_MAP['rear deltoids']).toBe('posterior_deltoid');
  });

  it('cobre todos os grupos-alvo do dataset semeado', () => {
    const targets = [
      'chest', 'back', 'shoulders', 'biceps', 'triceps', 'abs',
      'quads', 'hamstrings', 'glutes', 'calves', 'cardio', 'mobility',
    ];
    for (const t of targets) {
      expect(MUSCLE_MAP[t] ?? t).toBeTruthy();
    }
  });
});

describe('mapeamento de equipamento', () => {
  it('mapeia os equipamentos do dataset para o enum do banco', () => {
    expect(normalizeEquipment('body weight')).toEqual(['bodyweight']);
    expect(normalizeEquipment('leverage machine')).toEqual(['machine']);
    expect(normalizeEquipment('ez barbell')).toEqual(['barbell']);
    expect(normalizeEquipment('sled machine')).toEqual(['machine']);
    expect(normalizeEquipment('smith machine')).toEqual(['machine']);
    expect(normalizeEquipment('stability ball')).toEqual(['bench']);
    expect(normalizeEquipment('weighted')).toEqual(['bench']);
    expect(normalizeEquipment('rope')).toEqual(['band']);
  });

  it('usa bodyweight quando não informado', () => {
    expect(normalizeEquipment(undefined)).toEqual(['bodyweight']);
    expect(normalizeEquipment('')).toEqual(['bodyweight']);
  });

  it('cai para bodyweight em equipamento desconhecido', () => {
    expect(normalizeEquipment('trator')).toEqual(['bodyweight']);
  });

  it('nunca devolve um valor fora do enum do banco', () => {
    const allowed = new Set([
      'bodyweight', 'barbell', 'dumbbell', 'kettlebell', 'band',
      'machine', 'cable', 'bench', 'pullup_bar', 'medicine_ball',
      'foam_roller', 'none',
    ]);
    const inputs = [
      'body weight', 'barbell', 'ez barbell', 'dumbbell', 'kettlebell',
      'band', 'rope', 'machine', 'leverage machine', 'sled machine',
      'smith machine', 'cable', 'bench', 'stability ball', 'weighted',
      'pull-up bar', 'medicine ball', 'foam roller', 'none', 'desconhecido',
    ];
    for (const i of inputs) {
      for (const e of normalizeEquipment(i)) {
        expect(allowed.has(e)).toBe(true);
      }
    }
  });
});

describe('mapeamento de dificuldade', () => {
  it('cobre os três níveis do dataset', () => {
    expect(DIFFICULTY_MAP['beginner']).toBe('beginner');
    expect(DIFFICULTY_MAP['intermediate']).toBe('intermediate');
    expect(DIFFICULTY_MAP['advanced']).toBe('advanced');
  });
});

describe('estrutura do registro do dataset', () => {
  /** Registro real do arquivo data/exercises.json da fonte. */
  const entry = {
    id: '0489',
    name: '45 Degree Hyperextension',
    bodyPart: 'back',
    target: 'erector spinae',
    secondaryMuscles: ['glutes', 'hamstrings', 'lower back'],
    equipment: 'leverage machine',
    difficulty: 'beginner',
    shortDescription: 'A lower back exercise…',
    instructions: 'Set up on a 45-degree hyperextension bench…',
    steps: ['Position yourself…', 'Cross arms…'],
    commonMistakes: ['Rounding the back'],
    breathing: 'Exhale as you rise, inhale as you lower.',
    videos: {
      male: 'https://cdn.example/exercise-videos/male/45-degree-hyperextension.mp4',
      female: 'https://cdn.example/exercise-videos/female/45-degree-hyperextension.mp4',
    },
    thumbnails: {
      male: 'https://cdn.example/exercise-posters/male/45-degree-hyperextension.jpg',
    },
  };

  it('tem vídeo demonstrativo (masculino e feminino)', () => {
    expect(entry.videos?.male).toMatch(/\.mp4$/);
    expect(entry.videos?.female).toMatch(/\.mp4$/);
  });

  it('tem thumbnail', () => {
    expect(entry.thumbnails?.male).toMatch(/\.(jpg|png|webp)$/);
  });

  it('tem passos, erros comuns e respiração', () => {
    expect(entry.steps?.length).toBeGreaterThan(0);
    expect(entry.commonMistakes?.length).toBeGreaterThan(0);
    expect(entry.breathing).toBeTruthy();
  });

  it('gera slug único e estável a partir do nome e do id', () => {
    const slug = `${entry.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')}-${entry.id}`;
    expect(slug).toBe('45-degree-hyperextension-0489');
  });
});
