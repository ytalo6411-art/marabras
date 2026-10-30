/**
 * Tipos do banco de dados ATHLETIX.
 *
 * Gerados a partir do schema real do Supabase. Para regenerar:
 *   npm run db:types
 *   (requer a CLI do Supabase: npm i -g supabase)
 *
 * Mantidos à mão para que o typecheck funcione sem a CLI instalada.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = 'user' | 'admin';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type TrainingFocus =
  | 'hypertrophy' | 'strength' | 'conditioning' | 'weight_loss'
  | 'calisthenics' | 'home' | 'gym' | 'cardio' | 'mobility' | 'sport_prep';
export type SportModality =
  | 'football' | 'basketball' | 'volleyball' | 'athletics' | 'running'
  | 'cycling' | 'swimming' | 'boxing' | 'martial_arts' | 'tennis'
  | 'skateboarding' | 'surfing' | 'calisthenics' | 'functional';
export type Equipment =
  | 'bodyweight' | 'barbell' | 'dumbbell' | 'kettlebell' | 'band'
  | 'machine' | 'cable' | 'bench' | 'pullup_bar' | 'medicine_ball'
  | 'foam_roller' | 'none';
export type SessionStatus = 'planned' | 'in_progress' | 'completed' | 'skipped';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'archived';
export type SourceType =
  | 'wger' | 'free_exercise_db' | 'repdb' | 'usda' | 'open_food_facts' | 'manual';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  birth_date: string | null;
  gender: Gender | null;
  height_cm: number | null;
  weight_kg: number | null;
  bio: string | null;
  country: string | null;
  city: string | null;
  is_minor: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreference {
  user_id: string;
  preferred_modality: SportModality | null;
  preferred_units: 'metric' | 'imperial';
  theme: 'light' | 'dark' | 'system';
  notify_workout_reminders: boolean;
  notify_achievements: boolean;
  notify_goal_updates: boolean;
  weekly_goal_sessions: number;
  weekly_goal_minutes: number;
  daily_calorie_target: number | null;
  protein_target_g: number | null;
  water_target_ml: number;
  created_at: string;
  updated_at: string;
}

export interface FitnessGoal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  goal_type: 'weight' | 'strength' | 'endurance' | 'skill' | 'habit' | 'competition';
  target_value: number | null;
  target_unit: string | null;
  current_value: number | null;
  start_value: number | null;
  start_date: string;
  target_date: string | null;
  status: GoalStatus;
  is_calorie_restricted: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExerciseCategory {
  id: string;
  slug: string;
  name_pt: string;
  name_en: string | null;
  muscle_group: string;
  icon: string | null;
  display_order: number;
  created_at: string;
}

export interface Exercise {
  id: string;
  external_id: string | null;
  source: SourceType;
  name: string;
  name_en: string | null;
  slug: string;
  description: string | null;
  instructions: string | null;
  steps: string[] | null;
  breathing: string | null;
  common_mistakes: string[] | null;
  difficulty: DifficultyLevel;
  primary_muscle: string;
  secondary_muscles: string[] | null;
  equipment: Equipment[] | null;
  category_id: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  image_url: string | null;
  source_url: string | null;
  attribution: string | null;
  license: string | null;
  alternatives: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  focus: TrainingFocus;
  modality: SportModality | null;
  days_of_week: number[];
  estimated_minutes: number | null;
  is_active: boolean;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  plan_id: string;
  exercise_id: string;
  position: number;
  sets: number;
  reps: string;
  weight_kg: number | null;
  duration_seconds: number | null;
  rest_seconds: number;
  tempo: string | null;
  intensity: 'low' | 'moderate' | 'high' | 'max' | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  plan_id: string | null;
  name: string;
  status: SessionStatus;
  started_at: string | null;
  completed_at: string | null;
  duration_seconds: number | null;
  total_volume_kg: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSet {
  id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  reps: number | null;
  weight_kg: number | null;
  duration_seconds: number | null;
  rir: number | null;
  completed: boolean;
  created_at: string;
}

export interface PersonalRecord {
  id: string;
  user_id: string;
  exercise_id: string;
  record_type: 'weight' | 'reps' | 'volume' | 'time' | 'distance';
  value: number;
  unit: string;
  achieved_at: string;
  session_id: string | null;
  created_at: string;
}

export interface BodyMeasurement {
  id: string;
  user_id: string;
  measured_at: string;
  weight_kg: number | null;
  body_fat_percentage: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  arm_cm: number | null;
  thigh_cm: number | null;
  calf_cm: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NutritionProfile {
  user_id: string;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
  dietary_style:
    | 'none' | 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian'
    | 'keto' | 'low_carb' | 'gluten_free' | 'lactose_free';
  allergies: string[];
  disliked_foods: string[];
  calorie_target: number | null;
  restriction_requires_professional: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FoodItem {
  id: string;
  external_id: string | null;
  source: SourceType;
  name: string;
  brand: string | null;
  barcode: string | null;
  serving_size_g: number;
  serving_label: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  vitamins: Json;
  minerals: Json;
  source_url: string | null;
  is_custom: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface FoodDiary {
  id: string;
  user_id: string;
  entry_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MealEntry {
  id: string;
  diary_id: string;
  food_id: string | null;
  meal_type: MealType;
  quantity: number;
  serving_size_g: number | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  food_name: string;
  source: SourceType;
  eaten_at: string | null;
  created_at: string;
}

export interface HydrationLog {
  id: string;
  user_id: string;
  log_date: string;
  amount_ml: number;
  created_at: string;
}

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string | null;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  criteria_type: 'sessions' | 'streak' | 'volume' | 'pr' | 'nutrition' | 'hydration' | 'special';
  criteria_value: number;
  points: number;
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress: number;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement';
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface SavedWorkout {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  focus: TrainingFocus | null;
  modality: SportModality | null;
  payload: Json;
  is_public: boolean;
  created_at: string;
}

export interface AdminUser {
  user_id: string;
  role: UserRole;
  active: boolean;
  granted_by: string | null;
  granted_at: string;
  notes: string | null;
}

export interface AuditLog {
  id: number;
  user_id: string | null;
  table_name: string;
  action: string;
  row_id: string | null;
  metadata: Json;
  ip_address: string | null;
  created_at: string;
}

export interface DashboardSummary {
  total_sessions: number;
  sessions_this_week: number;
  sessions_this_month: number;
  total_volume_kg: number;
  hydration_logs_today: number;
  hydration_ml_today: number;
  achievements_count: number;
  unread_notifications: number;
}
