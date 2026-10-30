-- ══════════════════════════════════════════════════════════════════════════════
-- ATHLETIX — Perfil de treino (onboarding inteligente) e metadados de plano
--
-- Migração ADITIVA: nenhuma tabela, coluna, política ou dado existente é
-- removido. Executar depois da migração inicial:
--   supabase db push   |   ou SQL Editor do Supabase Dashboard
--
-- Conteúdo:
--   1. tabela public.training_profiles (1:1 com auth.users) + índices
--   2. colunas de metadados em public.workout_plans (programa, nível, ambiente,
--      origem do plano, justificativa)
--   3. RLS own-only em training_profiles (+ leitura de admin)
--   4. triggers de updated_at e auditoria
--   5. RPC de exclusão dos dados de personalização (LGPD)
-- ══════════════════════════════════════════════════════════════════════════════

-- ─── 1. training_profiles ────────────────────────────────────────────────────
-- Guarda as respostas do questionário de personalização. Tudo é opcional: o
-- usuário pode responder só o que quiser e refazer depois. O campo
-- `questionnaire` preserva a resposta bruta (versionada) para auditoria e para
-- futuras migrações de formato, enquanto as colunas normalizadas são o que o
-- gerador de treinos consome.
create table if not exists public.training_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,

  -- Etapa 1 — perfil
  experience text check (
    experience is null or experience in ('never', 'beginner', 'intermediate', 'advanced')
  ),
  age_range text check (
    age_range is null or age_range in ('16_17', '18_24', '25_34', '35_44', '45_54', '55_64', '65_plus')
  ),

  -- Etapa 2 — objetivos (o primeiro item é o prioritário)
  goals text[] not null default '{}',
  goal_priority text check (
    goal_priority is null or goal_priority in (
      'hypertrophy', 'strength', 'conditioning', 'endurance', 'mobility',
      'fat_loss', 'active_routine', 'sport_performance'
    )
  ),

  -- Etapa 3 — local e equipamentos
  environment text check (
    environment is null or environment in ('gym', 'home_equipment', 'home_bodyweight', 'outdoor', 'other')
  ),
  equipment text[] not null default '{}',

  -- Etapa 4 — disponibilidade
  sessions_per_week integer check (sessions_per_week is null or sessions_per_week between 1 and 7),
  minutes_per_session integer check (minutes_per_session is null or minutes_per_session between 10 and 180),
  preferred_days integer[] not null default '{}',
  session_length_preference text check (
    session_length_preference is null or session_length_preference in ('short', 'moderate', 'long')
  ),

  -- Etapa 5 — preferências
  priority_muscles text[] not null default '{}',
  avoided_exercises text[] not null default '{}',
  preferred_training text[] not null default '{}', -- strength_training | calisthenics | cardio | mixed | mobility
  split_preference text check (
    split_preference is null or split_preference in ('full_body', 'split', 'coach_choice')
  ),
  guidance_preference text check (
    guidance_preference is null or guidance_preference in ('video', 'text', 'both')
  ),

  -- Etapa 6 — segurança (opcional; nunca diagnóstico)
  limitations text[] not null default '{}',
  needs_professional_guidance boolean not null default false,
  safety_acknowledged boolean not null default false,

  -- Etapa 7 — confirmação / versionamento
  questionnaire jsonb not null default '{}'::jsonb,
  schema_version integer not null default 1,
  completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Só aceita valores que o app conhece; nada de texto livre em enum.
  constraint training_profiles_goals_valid check (
    goals <@ array[
      'hypertrophy', 'strength', 'conditioning', 'endurance', 'mobility',
      'fat_loss', 'active_routine', 'sport_performance'
    ]::text[]
  ),
  constraint training_profiles_equipment_valid check (
    equipment <@ array[
      'bodyweight', 'dumbbell', 'barbell', 'machine', 'cable', 'band',
      'kettlebell', 'bench', 'pullup_bar', 'medicine_ball', 'foam_roller'
    ]::text[]
  ),
  constraint training_profiles_days_valid check (
    preferred_days <@ array[0, 1, 2, 3, 4, 5, 6]::integer[]
  ),
  constraint training_profiles_guidance_valid check (
    guidance_preference is null or guidance_preference in ('video', 'text', 'both')
  )
);

comment on table public.training_profiles is
  'Respostas do questionário de personalização (onboarding). Dados privados do usuário; RLS own-only.';
comment on column public.training_profiles.questionnaire is
  'Resposta bruta versionada do questionário. As colunas normalizadas são a fonte do gerador de treinos.';

create index if not exists idx_training_profiles_goal
  on public.training_profiles(goal_priority)
  where goal_priority is not null;

-- ─── 2. workout_plans: metadados do programa semanal ────────────────────────
-- `program_id` agrupa os planos de um mesmo programa gerado (ex.: split ABC =
-- 3 planos, um por dia). Isso permite regenerar uma sessão sem perder o resto.
alter table public.workout_plans
  add column if not exists program_id uuid,
  add column if not exists program_name text,
  add column if not exists day_label text,
  add column if not exists generated_by text
    check (generated_by is null or generated_by in ('manual', 'rules', 'ai', 'template')),
  add column if not exists rationale text,
  add column if not exists level text
    check (level is null or level in ('beginner', 'intermediate', 'advanced')),
  add column if not exists environment text,
  add column if not exists template_slug text,
  -- Metadados do dia (padrões de movimento, objetivo, nível, origem) usados
  -- para regenerar a sessão sem perder o restante do programa.
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists idx_workout_plans_program
  on public.workout_plans(user_id, program_id)
  where program_id is not null;

-- ─── 3. RLS ─────────────────────────────────────────────────────────────────
alter table public.training_profiles enable row level security;

drop policy if exists training_profiles_own on public.training_profiles;
create policy training_profiles_own on public.training_profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Admin pode ler para suporte (nunca escrever em nome do usuário).
drop policy if exists training_profiles_admin_read on public.training_profiles;
create policy training_profiles_admin_read on public.training_profiles
  for select using (public.is_admin());

-- ─── 4. Triggers ────────────────────────────────────────────────────────────
drop trigger if exists trg_training_profiles_updated_at on public.training_profiles;
create trigger trg_training_profiles_updated_at
  before update on public.training_profiles
  for each row execute function public.set_updated_at();

-- ─── 5. Exclusão dos dados de personalização (LGPD) ─────────────────────────
-- Remove o questionário. Os planos existentes permanecem (são histórico do
-- usuário); quem quiser apagar tudo usa a exclusão de conta em Configurações.
create or replace function public.reset_training_profile()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Não autenticado';
  end if;

  update public.profiles
    set onboarding_completed = false
  where id = auth.uid();

  delete from public.training_profiles where user_id = auth.uid();
end;
$$;

revoke execute on function public.reset_training_profile() from public, anon;
grant execute on function public.reset_training_profile() to authenticated;

-- ══════════════════════════════════════════════════════════════════════════════
-- FIM DA MIGRAÇÃO
-- ══════════════════════════════════════════════════════════════════════════════
