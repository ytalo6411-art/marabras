-- ══════════════════════════════════════════════════════════════════════════════
-- ATHLETIX V2 — Migração inicial completa
-- Supabase PostgreSQL
--
-- Executar via: supabase db push   |   ou pelo SQL Editor do Supabase Dashboard
--
-- Contém: 23 tabelas, FKs, índices, constraints, RLS em todas as tabelas,
--          triggers de profile automático e auditoria.
-- ══════════════════════════════════════════════════════════════════════════════

-- ─── Extensões ─────────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto" with schema extensions;
create extension if not exists "pg_trgm" with schema extensions;

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. ENUMS
-- ══════════════════════════════════════════════════════════════════════════════

do $$ begin
  create type public.user_role as enum ('user', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.sex as enum ('male', 'female', 'other', 'prefer_not_to_say');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.gender as enum ('male', 'female', 'other', 'prefer_not_to_say');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.difficulty_level as enum ('beginner', 'intermediate', 'advanced');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.training_focus as enum (
    'hypertrophy', 'strength', 'conditioning', 'weight_loss',
    'calisthenics', 'home', 'gym', 'cardio', 'mobility', 'sport_prep'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.sport_modality as enum (
    'football', 'basketball', 'volleyball', 'athletics', 'running',
    'cycling', 'swimming', 'boxing', 'martial_arts', 'tennis',
    'skateboarding', 'surfing', 'calisthenics', 'functional'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.equipment as enum (
    'bodyweight', 'barbell', 'dumbbell', 'kettlebell', 'band',
    'machine', 'cable', 'bench', 'pullup_bar', 'medicine_ball',
    'foam_roller', 'none'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.session_status as enum ('planned', 'in_progress', 'completed', 'skipped');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.meal_type as enum ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.goal_status as enum ('active', 'completed', 'paused', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.source_type as enum ('wger', 'free_exercise_db', 'repdb', 'usda', 'open_food_facts', 'manual');
exception when duplicate_object then null; end $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. FUNÇÕES AUXILIARES
-- ══════════════════════════════════════════════════════════════════════════════

-- Retorna o role do usuário autenticado (looked up de admin_users).
-- SECURITY DEFINER evita recursão de RLS ao consultar admin_users.
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.admin_users where user_id = auth.uid()),
    'user'::public.user_role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid() and role = 'admin' and active = true
  );
$$;

-- Trigger: cria profile + preferences automaticamente no primeiro login.
-- É o que faz "entrar com Google e já ter perfil" funcionar sem passo extra.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name',
             new.raw_user_meta_data ->> 'name',
             split_part(coalesce(new.email, ''), '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  -- Preferências de notificação herdadas de raw_user_meta_data (Google).
  update public.user_preferences
  set notify_workout_reminders = coalesce(
        (new.raw_user_meta_data ->> 'notify_workout_reminders')::boolean,
        true
      )
  where user_id = new.id;

  return new;
end;
$$;

-- Trigger: mantém updated_at sempre atualizado.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger: registra alterações em tabelas auditadas.
create or replace function public.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_table text := tg_table_name;
  v_action text;
  v_row_id  uuid;
begin
  v_action := lower(tg_op);

  if tg_op = 'DELETE' then
    v_row_id := coalesce((to_jsonb(old) ->> 'id')::uuid, (to_jsonb(old) ->> 'user_id')::uuid);
  else
    v_row_id := coalesce((to_jsonb(new) ->> 'id')::uuid, (to_jsonb(new) ->> 'user_id')::uuid);
  end if;

  insert into public.audit_logs (user_id, table_name, action, row_id, metadata)
  values (
    auth.uid(),
    v_table,
    v_action,
    v_row_id,
    jsonb_build_object('op', tg_op)
  );

  return coalesce(new, old);
end;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. TABELAS
-- ══════════════════════════════════════════════════════════════════════════════

-- ─── 3.1 profiles ────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  full_name text,
  avatar_url text,
  phone text,
  birth_date date,
  gender public.gender,
  height_cm numeric(5,2) check (height_cm is null or (height_cm > 0 and height_cm <= 300)),
  weight_kg numeric(5,2) check (weight_kg is null or (weight_kg > 0 and weight_kg <= 500)),
  bio text check (bio is null or length(bio) <= 1000),
  country text,
  city text,
  is_minor boolean not null default false,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil público do usuário. Gerado automaticamente no primeiro login.';

-- ─── 3.2 user_preferences ────────────────────────────────────────────────────
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferred_modality public.sport_modality,
  preferred_units text not null default 'metric' check (preferred_units in ('metric', 'imperial')),
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  notify_workout_reminders boolean not null default true,
  notify_achievements boolean not null default true,
  notify_goal_updates boolean not null default true,
  weekly_goal_sessions integer not null default 3 check (weekly_goal_sessions between 0 and 14),
  weekly_goal_minutes integer not null default 150 check (weekly_goal_minutes between 0 and 10080),
  daily_calorie_target integer check (daily_calorie_target is null or daily_calorie_target between 800 and 6000),
  protein_target_g numeric(6,2) check (protein_target_g is null or protein_target_g >= 0),
  water_target_ml integer not null default 2000 check (water_target_ml between 500 and 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── 3.3 fitness_goals ───────────────────────────────────────────────────────
create table if not exists public.fitness_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) > 0 and length(title) <= 120),
  description text,
  goal_type text not null check (goal_type in ('weight', 'strength', 'endurance', 'skill', 'habit', 'competition')),
  target_value numeric(10,2),
  target_unit text,
  current_value numeric(10,2),
  start_value numeric(10,2),
  start_date date not null default current_date,
  target_date date,
  status public.goal_status not null default 'active',
  -- Nutrição: menores nunca recebem metas de déficit automático.
  is_calorie_restricted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint goals_target_date_order check (target_date is null or target_date >= start_date)
);

create index if not exists idx_fitness_goals_user on public.fitness_goals(user_id, status);

-- ─── 3.4 exercise_categories ────────────────────────────────────────────────
create table if not exists public.exercise_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_pt text not null,
  name_en text,
  muscle_group text not null,
  icon text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

insert into public.exercise_categories (slug, name_pt, name_en, muscle_group, display_order) values
  ('chest', 'Peito', 'Chest', 'chest', 1),
  ('back', 'Costas', 'Back', 'back', 2),
  ('shoulders', 'Ombros', 'Shoulders', 'shoulders', 3),
  ('biceps', 'Bíceps', 'Biceps', 'biceps', 4),
  ('triceps', 'Tríceps', 'Triceps', 'triceps', 5),
  ('abs', 'Abdômen', 'Abs', 'core', 6),
  ('quads', 'Quadríceps', 'Quadriceps', 'quads', 7),
  ('hamstrings', 'Posterior de coxa', 'Hamstrings', 'hamstrings', 8),
  ('glutes', 'Glúteos', 'Glutes', 'glutes', 9),
  ('calves', 'Panturrilhas', 'Calves', 'calves', 10),
  ('cardio', 'Cardio', 'Cardio', 'cardio', 11),
  ('mobility', 'Mobilidade', 'Mobility', 'mobility', 12),
  ('stretching', 'Alongamento', 'Stretching', 'stretching', 13)
on conflict (slug) do nothing;

-- ─── 3.5 exercises ───────────────────────────────────────────────────────────
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  external_id text,
  source public.source_type not null default 'manual',
  name text not null check (length(trim(name)) > 0),
  name_en text,
  slug text not null unique,
  description text,
  instructions text,
  steps text[],
  breathing text,
  common_mistakes text[],
  difficulty public.difficulty_level not null default 'beginner',
  primary_muscle text not null,
  secondary_muscles text[] not null default '{}',
  equipment public.equipment[] not null default '{bodyweight}',
  category_id uuid references public.exercise_categories(id) on delete set null,
  video_url text,
  thumbnail_url text,
  image_url text,
  source_url text,
  attribution text,
  license text,
  alternatives text[] not null default '{}',
  is_active boolean not null default true,
  search_vector tsvector generated always as (
    setweight(to_tsvector('portuguese', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(primary_muscle, '')), 'C')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_exercises_muscle on public.exercises(primary_muscle);
create index if not exists idx_exercises_category on public.exercises(category_id);
create index if not exists idx_exercises_difficulty on public.exercises(difficulty);
create index if not exists idx_exercises_active on public.exercises(is_active);
create index if not exists idx_exercises_search on public.exercises using gin(search_vector);
create index if not exists idx_exercises_external on public.exercises(source, external_id);
create index if not exists idx_exercises_name_trgm on public.exercises using gin(name extensions.gin_trgm_ops);

-- ─── 3.6 workout_plans ───────────────────────────────────────────────────────
create table if not exists public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) > 0 and length(name) <= 120),
  description text,
  focus public.training_focus not null default 'gym',
  modality public.sport_modality,
  days_of_week integer[] not null default '{}',
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes between 1 and 600),
  is_active boolean not null default true,
  is_template boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plans_days_valid check (
    days_of_week <@ ARRAY[0,1,2,3,4,5,6]::integer[]
  )
);

create index if not exists idx_workout_plans_user on public.workout_plans(user_id, is_active);

-- ─── 3.7 workout_exercises (itens do plano) ─────────────────────────────────
create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.workout_plans(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  position integer not null default 0,
  sets integer not null default 3 check (sets between 1 and 20),
  reps text not null default '10' check (length(reps) <= 40),
  weight_kg numeric(6,2) check (weight_kg is null or weight_kg >= 0),
  duration_seconds integer check (duration_seconds is null or duration_seconds between 5 and 7200),
  rest_seconds integer not null default 60 check (rest_seconds between 0 and 900),
  tempo text check (tempo is null or length(tempo) <= 20),
  intensity text check (intensity is null or intensity in ('low', 'moderate', 'high', 'max')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, position)
);

create index if not exists idx_workout_exercises_plan on public.workout_exercises(plan_id, position);

-- ─── 3.8 workout_sessions (execuções reais) ──────────────────────────────────
create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.workout_plans(id) on delete set null,
  name text not null check (length(trim(name)) > 0),
  status public.session_status not null default 'planned',
  started_at timestamptz,
  completed_at timestamptz,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  total_volume_kg numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_workout_sessions_user_date on public.workout_sessions(user_id, created_at desc);
create index if not exists idx_workout_sessions_status on public.workout_sessions(user_id, status);

-- ─── 3.9 workout_sets (séries individuais) ───────────────────────────────────
create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  set_number integer not null check (set_number between 1 and 50),
  reps integer check (reps is null or reps between 0 and 1000),
  weight_kg numeric(6,2) check (weight_kg is null or weight_kg >= 0),
  duration_seconds integer check (duration_seconds is null or duration_seconds between 0 and 7200),
  rir numeric(3,1) check (rir is null or (rir >= 0 and rir <= 10)),
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (session_id, exercise_id, set_number)
);

create index if not exists idx_workout_sets_session on public.workout_sets(session_id);

-- ─── 3.10 exercise_history ───────────────────────────────────────────────────
create table if not exists public.exercise_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  session_id uuid references public.workout_sessions(id) on delete set null,
  performed_at timestamptz not null default now(),
  best_weight_kg numeric(6,2),
  best_reps integer,
  total_volume_kg numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_exercise_history_user_ex on public.exercise_history(user_id, exercise_id, performed_at desc);

-- ─── 3.11 personal_records ───────────────────────────────────────────────────
create table if not exists public.personal_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  record_type text not null check (record_type in ('weight', 'reps', 'volume', 'time', 'distance')),
  value numeric(12,2) not null,
  unit text not null,
  achieved_at timestamptz not null default now(),
  session_id uuid references public.workout_sessions(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, exercise_id, record_type)
);

create index if not exists idx_pr_user on public.personal_records(user_id, achieved_at desc);

-- ─── 3.12 body_measurements ─────────────────────────────────────────────────
create table if not exists public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_at date not null default current_date,
  weight_kg numeric(5,2) check (weight_kg is null or (weight_kg > 0 and weight_kg <= 500)),
  body_fat_percentage numeric(4,1) check (body_fat_percentage is null or (body_fat_percentage >= 0 and body_fat_percentage <= 70)),
  chest_cm numeric(5,1),
  waist_cm numeric(5,1),
  hip_cm numeric(5,1),
  arm_cm numeric(5,1),
  thigh_cm numeric(5,1),
  calf_cm numeric(5,1),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, measured_at)
);

create index if not exists idx_body_meas_user_date on public.body_measurements(user_id, measured_at desc);

-- ─── 3.13 nutrition_profiles ─────────────────────────────────────────────────
create table if not exists public.nutrition_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  activity_level text not null default 'moderate'
    check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'athlete')),
  dietary_style text not null default 'none'
    check (dietary_style in ('none', 'omnivore', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'low_carb', 'gluten_free', 'lactose_free')),
  allergies text[] not null default '{}',
  disliked_foods text[] not null default '{}',
  -- Segurança: menores não recebem restrição calórica automática.
  calorie_target integer check (calorie_target is null or (calorie_target between 1200 and 6000)),
  restriction_requires_professional boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── 3.14 food_database ──────────────────────────────────────────────────────
create table if not exists public.food_database (
  id uuid primary key default gen_random_uuid(),
  external_id text,
  source public.source_type not null default 'manual',
  name text not null check (length(trim(name)) > 0),
  brand text,
  barcode text,
  serving_size_g numeric(8,2) not null default 100,
  serving_label text,
  calories numeric(8,2) not null default 0 check (calories >= 0),
  protein_g numeric(8,2) not null default 0 check (protein_g >= 0),
  carbs_g numeric(8,2) not null default 0 check (carbs_g >= 0),
  fat_g numeric(8,2) not null default 0 check (fat_g >= 0),
  fiber_g numeric(8,2) not null default 0 check (fiber_g >= 0),
  sugar_g numeric(8,2) not null default 0 check (sugar_g >= 0),
  sodium_mg numeric(9,2) not null default 0 check (sodium_mg >= 0),
  vitamins jsonb not null default '{}'::jsonb,
  minerals jsonb not null default '{}'::jsonb,
  source_url text,
  is_custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_food_barcode on public.food_database(barcode) where barcode is not null;
create index if not exists idx_food_name_trgm on public.food_database using gin(name extensions.gin_trgm_ops);
create index if not exists idx_food_custom_user on public.food_database(user_id) where is_custom = true;

-- ─── 3.15 food_diary ─────────────────────────────────────────────────────────
create table if not exists public.food_diary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create index if not exists idx_food_diary_user_date on public.food_diary(user_id, entry_date desc);

-- ─── 3.16 meal_entries ───────────────────────────────────────────────────────
create table if not exists public.meal_entries (
  id uuid primary key default gen_random_uuid(),
  diary_id uuid not null references public.food_diary(id) on delete cascade,
  food_id uuid references public.food_database(id) on delete set null,
  meal_type public.meal_type not null,
  quantity numeric(8,2) not null default 1 check (quantity > 0 and quantity <= 100),
  serving_size_g numeric(8,2),
  -- Valores congelados no momento do registro: se a fonte corrigir o dado,
  -- o histórico do usuário não muda retroativamente.
  calories numeric(8,2) not null default 0,
  protein_g numeric(8,2) not null default 0,
  carbs_g numeric(8,2) not null default 0,
  fat_g numeric(8,2) not null default 0,
  food_name text not null,
  source public.source_type not null default 'manual',
  eaten_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_meal_entries_diary on public.meal_entries(diary_id, meal_type);

-- ─── 3.17 hydration_logs ─────────────────────────────────────────────────────
create table if not exists public.hydration_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  amount_ml integer not null check (amount_ml > 0 and amount_ml <= 5000),
  created_at timestamptz not null default now()
);

create index if not exists idx_hydration_user_date on public.hydration_logs(user_id, log_date desc);

-- ─── 3.18 achievements ───────────────────────────────────────────────────────
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  icon text,
  tier text not null default 'bronze' check (tier in ('bronze', 'silver', 'gold', 'platinum')),
  criteria_type text not null check (criteria_type in ('sessions', 'streak', 'volume', 'pr', 'nutrition', 'hydration', 'special')),
  criteria_value integer not null default 1 check (criteria_value > 0),
  points integer not null default 10 check (points >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.achievements (slug, name, description, icon, tier, criteria_type, criteria_value, points) values
  ('first_session', 'Primeiro Passo', 'Complete sua primeira sessão de treino.', '🏋️', 'bronze', 'sessions', 1, 10),
  ('sessions_10', 'Dez Sessões', 'Complete 10 sessões de treino.', '💪', 'bronze', 'sessions', 10, 25),
  ('sessions_50', 'Meio Caminho', 'Complete 50 sessões de treino.', '🔥', 'silver', 'sessions', 50, 75),
  ('sessions_100', 'Cem', 'Complete 100 sessões de treino.', '⚡', 'gold', 'sessions', 100, 150),
  ('streak_7', 'Semana Perfeita', 'Treine 7 dias seguidos.', '📅', 'silver', 'streak', 7, 50),
  ('streak_30', 'Mês Consistente', 'Treine 30 dias seguidos.', '🏆', 'gold', 'streak', 30, 200),
  ('volume_10000', '10 Toneladas', 'Move 10.000 kg no total.', '🏗️', 'silver', 'volume', 10000, 60),
  ('volume_50000', '50 Toneladas', 'Move 50.000 kg no total.', '⛰️', 'gold', 'volume', 50000, 180),
  ('first_pr', 'Primeiro Recorde', 'Estabeleça seu primeiro recorde pessoal.', '🎯', 'bronze', 'pr', 1, 20),
  ('hydration_week', 'Hidratação Consistente', 'Beba sua meta de água por 7 dias.', '💧', 'bronze', 'hydration', 7, 30),
  ('nutrition_log_7', 'Diário Consistente', 'Registre refeições por 7 dias.', '🥗', 'bronze', 'nutrition', 7, 30)
on conflict (slug) do nothing;

-- ─── 3.19 user_achievements ──────────────────────────────────────────────────
create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  progress integer not null default 100 check (progress between 0 and 100),
  unique (user_id, achievement_id)
);

create index if not exists idx_user_achievements_user on public.user_achievements(user_id, unlocked_at desc);

-- ─── 3.20 notifications ──────────────────────────────────────────────────────
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  body text,
  type text not null default 'info' check (type in ('info', 'success', 'warning', 'error', 'achievement')),
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on public.notifications(user_id, is_read, created_at desc);

-- ─── 3.21 saved_workouts ─────────────────────────────────────────────────────
create table if not exists public.saved_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  description text,
  focus public.training_focus,
  modality public.sport_modality,
  payload jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_saved_workouts_user on public.saved_workouts(user_id, created_at desc);

-- ─── 3.22 admin_users ────────────────────────────────────────────────────────
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'admin',
  active boolean not null default true,
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  notes text
);

comment on table public.admin_users is
  'Administradores. Inserção feita apenas via procedure documentada (setup-admin.sql) — nunca pelo app.';

-- ─── 3.23 audit_logs ─────────────────────────────────────────────────────────
create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  table_name text not null,
  action text not null,
  row_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_user on public.audit_logs(user_id, created_at desc);
create index if not exists idx_audit_logs_table on public.audit_logs(table_name, created_at desc);

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. TRIGGERS
-- ══════════════════════════════════════════════════════════════════════════════

-- Profile automático no primeiro login (Google ou e-mail).
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at automático.
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles','user_preferences','fitness_goals','exercises','workout_plans',
    'workout_exercises','workout_sessions','body_measurements','nutrition_profiles',
    'food_database','food_diary'
  ] loop
    execute format('drop trigger if exists trg_%I_updated_at on public.%I', t, t);
    execute format(
      'create trigger trg_%I_updated_at before update on public.%I
         for each row execute function public.set_updated_at()', t, t
    );
  end loop;
end $$;

-- Auditoria nas tabelas sensíveis de usuário.
do $$
declare
  t text;
begin
  foreach t in array array[
    'workout_plans','workout_sessions','fitness_goals','body_measurements',
    'nutrition_profiles','food_diary','user_preferences','admin_users'
  ] loop
    execute format('drop trigger if exists trg_%I_audit on public.%I', t, t);
    execute format(
      'create trigger trg_%I_audit after insert or update or delete on public.%I
         for each row execute function public.audit_row_change()', t, t
    );
  end loop;
end $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. ROW LEVEL SECURITY
--
-- Regras gerais:
--   • Leitura pública: exercises, exercise_categories, achievements, food_database
--   • Escrita pública: apenas exercises/achievements (admin) e food_database (custom do próprio user)
--   • Dados privados: cada usuário só vê e mexe nos seus próprios registros
--   • Admin: acesso via public.is_admin(), que lê admin_users com SECURITY DEFINER
-- ══════════════════════════════════════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.fitness_goals enable row level security;
alter table public.exercise_categories enable row level security;
alter table public.exercises enable row level security;
alter table public.workout_plans enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_sets enable row level security;
alter table public.exercise_history enable row level security;
alter table public.personal_records enable row level security;
alter table public.body_measurements enable row level security;
alter table public.nutrition_profiles enable row level security;
alter table public.food_database enable row level security;
alter table public.food_diary enable row level security;
alter table public.meal_entries enable row level security;
alter table public.hydration_logs enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.notifications enable row level security;
alter table public.saved_workouts enable row level security;
alter table public.admin_users enable row level security;
alter table public.audit_logs enable row level security;

-- ─── profiles ────────────────────────────────────────────────────────────────
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── user_preferences ────────────────────────────────────────────────────────
drop policy if exists prefs_own on public.user_preferences;
create policy prefs_own on public.user_preferences
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─── fitness_goals ───────────────────────────────────────────────────────────
drop policy if exists goals_own on public.fitness_goals;
create policy goals_own on public.fitness_goals
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─── exercise_categories ─────────────────────────────────────────────────────
drop policy if exists categories_read on public.exercise_categories;
create policy categories_read on public.exercise_categories
  for select using (true);

drop policy if exists categories_admin_write on public.exercise_categories;
create policy categories_admin_write on public.exercise_categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── exercises ───────────────────────────────────────────────────────────────
drop policy if exists exercises_read on public.exercises;
create policy exercises_read on public.exercises
  for select using (is_active or public.is_admin());

drop policy if exists exercises_admin_write on public.exercises;
create policy exercises_admin_write on public.exercises
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── workout_plans ───────────────────────────────────────────────────────────
drop policy if exists plans_own on public.workout_plans;
create policy plans_own on public.workout_plans
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists plans_admin_read on public.workout_plans;
create policy plans_admin_read on public.workout_plans
  for select using (public.is_admin());

-- ─── workout_exercises (via plano) ───────────────────────────────────────────
drop policy if exists plan_exercises_own on public.workout_exercises;
create policy plan_exercises_own on public.workout_exercises
  for all using (
    exists (select 1 from public.workout_plans p where p.id = plan_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.workout_plans p where p.id = plan_id and p.user_id = auth.uid())
  );

-- ─── workout_sessions ────────────────────────────────────────────────────────
drop policy if exists sessions_own on public.workout_sessions;
create policy sessions_own on public.workout_sessions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists sessions_admin_read on public.workout_sessions;
create policy sessions_admin_read on public.workout_sessions
  for select using (public.is_admin());

-- ─── workout_sets (via sessão) ───────────────────────────────────────────────
drop policy if exists sets_own on public.workout_sets;
create policy sets_own on public.workout_sets
  for all using (
    exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid())
  );

-- ─── exercise_history ────────────────────────────────────────────────────────
drop policy if exists history_own on public.exercise_history;
create policy history_own on public.exercise_history
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─── personal_records ────────────────────────────────────────────────────────
drop policy if exists pr_own on public.personal_records;
create policy pr_own on public.personal_records
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─── body_measurements ───────────────────────────────────────────────────────
drop policy if exists measurements_own on public.body_measurements;
create policy measurements_own on public.body_measurements
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─── nutrition_profiles ──────────────────────────────────────────────────────
drop policy if exists nutrition_profile_own on public.nutrition_profiles;
create policy nutrition_profile_own on public.nutrition_profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─── food_database (global + custom do próprio usuário) ──────────────────────
drop policy if exists food_read on public.food_database;
create policy food_read on public.food_database
  for select using (is_custom = false or user_id = auth.uid() or public.is_admin());

drop policy if exists food_insert_custom on public.food_database;
create policy food_insert_custom on public.food_database
  for insert with check (
    (is_custom = true and user_id = auth.uid())
    or (is_custom = false and public.is_admin())
  );

drop policy if exists food_update_own_custom on public.food_database;
create policy food_update_own_custom on public.food_database
  for update using (is_custom = true and user_id = auth.uid()) with check (is_custom = true and user_id = auth.uid());

drop policy if exists food_delete_own_custom on public.food_database;
create policy food_delete_own_custom on public.food_database
  for delete using (is_custom = true and user_id = auth.uid());

drop policy if exists food_admin_all on public.food_database;
create policy food_admin_all on public.food_database
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── food_diary ──────────────────────────────────────────────────────────────
drop policy if exists diary_own on public.food_diary;
create policy diary_own on public.food_diary
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─── meal_entries (via diário) ───────────────────────────────────────────────
drop policy if exists meals_own on public.meal_entries;
create policy meals_own on public.meal_entries
  for all using (
    exists (select 1 from public.food_diary d where d.id = diary_id and d.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.food_diary d where d.id = diary_id and d.user_id = auth.uid())
  );

-- ─── hydration_logs ──────────────────────────────────────────────────────────
drop policy if exists hydration_own on public.hydration_logs;
create policy hydration_own on public.hydration_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─── achievements (globais) ──────────────────────────────────────────────────
drop policy if exists achievements_read on public.achievements;
create policy achievements_read on public.achievements
  for select using (true);

drop policy if exists achievements_admin_write on public.achievements;
create policy achievements_admin_write on public.achievements
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── user_achievements ───────────────────────────────────────────────────────
drop policy if exists user_achievements_own on public.user_achievements;
create policy user_achievements_own on public.user_achievements
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─── notifications ───────────────────────────────────────────────────────────
drop policy if exists notifications_own on public.notifications;
create policy notifications_own on public.notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─── saved_workouts ──────────────────────────────────────────────────────────
drop policy if exists saved_workouts_own on public.saved_workouts;
create policy saved_workouts_own on public.saved_workouts
  for all using (user_id = auth.uid() or is_public) with check (user_id = auth.uid());

-- ─── admin_users ─────────────────────────────────────────────────────────────
drop policy if exists admin_users_read on public.admin_users;
create policy admin_users_read on public.admin_users
  for select using (public.is_admin() or user_id = auth.uid());

drop policy if exists admin_users_admin_write on public.admin_users;
create policy admin_users_admin_write on public.admin_users
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── audit_logs (append-only, leitura só admin) ──────────────────────────────
drop policy if exists audit_logs_admin_read on public.audit_logs;
create policy audit_logs_admin_read on public.audit_logs
  for select using (public.is_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. PROCEDURE SEGURA PARA CONCEDER ADMIN
--
-- NÃO use isso pelo app. Execute manualmente no SQL Editor do Supabase
-- com o e-mail do dono. Ver docs/ADMIN.md.
-- ══════════════════════════════════════════════════════════════════════════════

create or replace function public.grant_admin(user_email text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  select id into v_id from auth.users where email = lower(trim(user_email));
  if v_id is null then
    raise exception 'Usuário com e-mail % não encontrado', user_email;
  end if;

  insert into public.admin_users (user_id, role, active)
  values (v_id, 'admin', true)
  on conflict (user_id) do update set role = 'admin', active = true;

  return v_id;
end;
$$;

revoke execute on function public.grant_admin(text) from public, anon, authenticated;
grant execute on function public.grant_admin(text) to service_role;

-- ══════════════════════════════════════════════════════════════════════════════
-- 7. VIEWS DE APOIO
-- ══════════════════════════════════════════════════════════════════════════════

create or replace view public.dashboard_summary
with (security_invoker = true)
as
select
  (select count(*) from public.workout_sessions
     where user_id = auth.uid() and status = 'completed') as total_sessions,
  (select count(*) from public.workout_sessions
     where user_id = auth.uid() and status = 'completed'
       and completed_at >= date_trunc('week', now())) as sessions_this_week,
  (select count(*) from public.workout_sessions
     where user_id = auth.uid() and status = 'completed'
       and completed_at >= date_trunc('month', now())) as sessions_this_month,
  (select coalesce(sum(total_volume_kg), 0) from public.workout_sessions
     where user_id = auth.uid() and status = 'completed') as total_volume_kg,
  (select count(*) from public.hydration_logs
     where user_id = auth.uid() and log_date = current_date) as hydration_logs_today,
  (select coalesce(sum(amount_ml), 0) from public.hydration_logs
     where user_id = auth.uid() and log_date = current_date) as hydration_ml_today,
  (select count(*) from public.user_achievements
     where user_id = auth.uid()) as achievements_count,
  (select count(*) from public.notifications
     where user_id = auth.uid() and is_read = false) as unread_notifications;

-- ══════════════════════════════════════════════════════════════════════════════
-- FIM DA MIGRAÇÃO
-- ══════════════════════════════════════════════════════════════════════════════
