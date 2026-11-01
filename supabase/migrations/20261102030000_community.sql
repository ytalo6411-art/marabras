-- ══════════════════════════════════════════════════════════════════════════════
-- ATHLETIX — Comunidade de atletas
--
-- PRINCÍPIO: nada é público por padrão. O usuário publica o que quiser, e só.
--
-- O que NUNCA vaza, mesmo em perfil público:
--   peso, altura, medidas, IMC, dieta, diário alimentar, e-mail, data de
--   nascimento, limitações/lesões, histórico privado e dados de conta.
--   A view pública seleciona explicitamente coluna por coluna — não usa
--   `select *`, então adicionar coluna privada em `profiles` não a expõe.
--
-- Anti-IDOR: toda leitura passa por RLS no servidor. Trocar o id na URL não
-- dá acesso a nada que o usuário não possa ver.
-- ══════════════════════════════════════════════════════════════════════════════
begin;

-- ─── Perfil público (opt-in) ─────────────────────────────────────────────────
create table if not exists public.athlete_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  handle text not null unique,
  display_name text not null,
  bio text,
  goals text,
  is_public boolean not null default false,
  show_workouts boolean not null default false,
  show_progress boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint athlete_handle_format check (handle ~ '^[a-z0-9_]{3,30}$'),
  constraint athlete_display_name_len check (length(trim(display_name)) between 1 and 60),
  constraint athlete_bio_len check (bio is null or length(bio) <= 300),
  constraint athlete_goals_len check (goals is null or length(goals) <= 200)
);

alter table public.athlete_profiles enable row level security;

-- ─── Publicações de treino (opt-in por publicação) ───────────────────────────
create table if not exists public.shared_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  -- Cópia do treino no momento da publicação: editar o plano privado depois
  -- não altera o que foi publicado, e apagar o plano não quebra a publicação.
  snapshot jsonb not null,
  is_public boolean not null default true,
  like_count integer not null default 0,
  comment_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shared_title_len check (length(trim(title)) between 1 and 120),
  constraint shared_desc_len check (description is null or length(description) <= 1000),
  constraint shared_snapshot_is_object check (jsonb_typeof(snapshot) = 'object'),
  constraint shared_snapshot_size check (length(snapshot::text) <= 100000)
);

create index if not exists shared_workouts_feed_idx
  on public.shared_workouts(is_public, created_at desc);
create index if not exists shared_workouts_user_idx on public.shared_workouts(user_id);

alter table public.shared_workouts enable row level security;

-- ─── Curtidas ────────────────────────────────────────────────────────────────
create table if not exists public.workout_likes (
  workout_id uuid not null references public.shared_workouts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (workout_id, user_id)
);
alter table public.workout_likes enable row level security;

-- ─── Comentários ─────────────────────────────────────────────────────────────
create table if not exists public.workout_comments (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.shared_workouts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint comment_len check (length(trim(body)) between 1 and 500)
);
create index if not exists workout_comments_idx on public.workout_comments(workout_id, created_at);
alter table public.workout_comments enable row level security;

-- ─── Bloqueios ───────────────────────────────────────────────────────────────
create table if not exists public.athlete_blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint no_self_block check (blocker_id <> blocked_id)
);
alter table public.athlete_blocks enable row level security;

-- ─── Denúncias ───────────────────────────────────────────────────────────────
create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  workout_id uuid references public.shared_workouts(id) on delete cascade,
  reported_user_id uuid references auth.users(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  constraint report_target check (workout_id is not null or reported_user_id is not null),
  constraint report_reason check (reason in ('spam','harassment','inappropriate','dangerous','other')),
  constraint report_status check (status in ('open','reviewed','dismissed')),
  constraint report_details_len check (details is null or length(details) <= 500)
);
alter table public.content_reports enable row level security;

-- ─── Helper: bloqueio em qualquer direção ────────────────────────────────────
create or replace function public.is_blocked(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(
    select 1 from public.athlete_blocks
    where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  );
$$;
revoke execute on function public.is_blocked(uuid, uuid) from public;
grant execute on function public.is_blocked(uuid, uuid) to anon, authenticated;

-- ─── Políticas: perfil público ───────────────────────────────────────────────
drop policy if exists athlete_profiles_read on public.athlete_profiles;
drop policy if exists athlete_profiles_write on public.athlete_profiles;

create policy athlete_profiles_read on public.athlete_profiles
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or (is_public and not public.is_blocked(user_id, (select auth.uid())))
  );

create policy athlete_profiles_write on public.athlete_profiles
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ─── Políticas: publicações ──────────────────────────────────────────────────
drop policy if exists shared_workouts_read on public.shared_workouts;
drop policy if exists shared_workouts_write on public.shared_workouts;

create policy shared_workouts_read on public.shared_workouts
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or (
      is_public
      and not public.is_blocked(user_id, (select auth.uid()))
      -- Publicar treino exige perfil público: evita publicar sem querer
      -- aparecer e mantém a autoria always identificável.
      and exists (
        select 1 from public.athlete_profiles ap
        where ap.user_id = shared_workouts.user_id and ap.is_public
      )
    )
  );

create policy shared_workouts_write on public.shared_workouts
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ─── Políticas: curtidas e comentários ───────────────────────────────────────
drop policy if exists workout_likes_read on public.workout_likes;
drop policy if exists workout_likes_write on public.workout_likes;

create policy workout_likes_read on public.workout_likes
  for select to authenticated
  using (exists (select 1 from public.shared_workouts w where w.id = workout_id));

create policy workout_likes_write on public.workout_likes
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.shared_workouts w where w.id = workout_id)
  );

drop policy if exists workout_comments_read on public.workout_comments;
drop policy if exists workout_comments_write on public.workout_comments;

create policy workout_comments_read on public.workout_comments
  for select to authenticated
  using (exists (select 1 from public.shared_workouts w where w.id = workout_id));

create policy workout_comments_write on public.workout_comments
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.shared_workouts w where w.id = workout_id)
  );

-- ─── Políticas: bloqueio e denúncia ──────────────────────────────────────────
drop policy if exists athlete_blocks_own on public.athlete_blocks;
create policy athlete_blocks_own on public.athlete_blocks
  for all to authenticated
  using (blocker_id = (select auth.uid()))
  with check (blocker_id = (select auth.uid()));

drop policy if exists content_reports_insert on public.content_reports;
drop policy if exists content_reports_read on public.content_reports;

create policy content_reports_insert on public.content_reports
  for insert to authenticated
  with check (reporter_id = (select auth.uid()));

-- Quem denuncia vê apenas as próprias denúncias; moderação usa a view de admin.
create policy content_reports_read on public.content_reports
  for select to authenticated
  using (reporter_id = (select auth.uid()) or public.is_admin());

-- ─── Diretório público: colunas explícitas, nunca select * ───────────────────
-- View de DEFINER (como admin_user_directory) porque `profiles` tem RLS
-- restrita ao próprio dono e o join não retornaria o avatar de terceiros.
-- A segurança vem do WHERE, que replica a política: só perfil público e sem
-- bloqueio em qualquer direção. Nenhuma coluna privada é selecionada, então
-- adicionar coluna sensível em `profiles` não a expõe aqui.
drop view if exists public.athlete_directory;
create view public.athlete_directory as
  select
    ap.user_id,
    ap.handle,
    ap.display_name,
    ap.bio,
    ap.goals,
    ap.show_workouts,
    ap.show_progress,
    p.avatar_url,
    ap.created_at
  from public.athlete_profiles ap
  join public.profiles p on p.id = ap.user_id
  where ap.is_public
    and not public.is_blocked(ap.user_id, (select auth.uid()));

-- ─── Contadores mantidos no servidor ─────────────────────────────────────────
create or replace function public.sync_workout_counters()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_table_name = 'workout_likes' then
    update public.shared_workouts set like_count = (
      select count(*) from public.workout_likes where workout_id = coalesce(new.workout_id, old.workout_id)
    ) where id = coalesce(new.workout_id, old.workout_id);
  else
    update public.shared_workouts set comment_count = (
      select count(*) from public.workout_comments where workout_id = coalesce(new.workout_id, old.workout_id)
    ) where id = coalesce(new.workout_id, old.workout_id);
  end if;
  return coalesce(new, old);
end $$;
revoke execute on function public.sync_workout_counters() from public, anon, authenticated;

drop trigger if exists trg_workout_likes_count on public.workout_likes;
create trigger trg_workout_likes_count after insert or delete on public.workout_likes
  for each row execute function public.sync_workout_counters();

drop trigger if exists trg_workout_comments_count on public.workout_comments;
create trigger trg_workout_comments_count after insert or delete on public.workout_comments
  for each row execute function public.sync_workout_counters();

drop trigger if exists trg_athlete_profiles_updated on public.athlete_profiles;
create trigger trg_athlete_profiles_updated before update on public.athlete_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_shared_workouts_updated on public.shared_workouts;
create trigger trg_shared_workouts_updated before update on public.shared_workouts
  for each row execute function public.set_updated_at();

-- ─── Grants explícitos (deny-by-default, como no resto do projeto) ───────────
revoke all on public.athlete_profiles, public.shared_workouts, public.workout_likes,
  public.workout_comments, public.athlete_blocks, public.content_reports
  from public, anon;

grant select, insert, update, delete on public.athlete_profiles to authenticated;
grant select, insert, delete on public.shared_workouts to authenticated;
-- Contadores pertencem ao servidor: sem isso o dono poderia inflar as próprias
-- curtidas com um UPDATE. Os triggers usam SECURITY DEFINER e continuam podendo gravar.
grant update (title, description, snapshot, is_public) on public.shared_workouts to authenticated;
grant select, insert, delete on public.workout_likes to authenticated;
grant select, insert, update, delete on public.workout_comments to authenticated;
grant select, insert, delete on public.athlete_blocks to authenticated;
grant select, insert on public.content_reports to authenticated;
grant update (status) on public.content_reports to authenticated;
grant select on public.athlete_directory to authenticated;

commit;
