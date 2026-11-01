-- ══════════════════════════════════════════════════════════════════════════════
-- ATHLETIX — Comunidade: completar o que faltava
--
-- 1. Salvar treino de outro atleta (bookmark privado).
-- 2. Privacidade POR TIPO aplicada no servidor: `show_workouts` e `show_progress`
--    passam a ter efeito real em RLS/views, não só na interface.
-- 3. Progresso público = APENAS contagens agregadas. Nunca carga, peso, medidas,
--    volume, dieta, datas de sessões individuais ou nomes de planos privados.
-- 4. Moderação: fila legível só por admin + resolução com trilha de auditoria.
--
-- Tudo aditivo e idempotente. Nenhuma linha existente é apagada.
-- ══════════════════════════════════════════════════════════════════════════════
begin;

-- ─── 1.Salvar treinos de terceiros ──────────────────────────────────────────
create table if not exists public.workout_saves (
  workout_id uuid not null references public.shared_workouts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (workout_id, user_id)
);
create index if not exists workout_saves_user_idx
  on public.workout_saves(user_id, created_at desc);

alter table public.workout_saves enable row level security;

alter table public.shared_workouts
  add column if not exists save_count integer not null default 0;

-- A lista de salvos é PRIVADA: nem o autor do treino descobre quem salvou.
drop policy if exists workout_saves_read on public.workout_saves;
create policy workout_saves_read on public.workout_saves
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Só é possível salvar o que a política de leitura já deixa ver. O `exists`
-- consulta shared_workouts sob a RLS do próprio usuário, então salvar por id
-- adivinhado de treino privado/bloqueado falha no WITH CHECK.
drop policy if exists workout_saves_write on public.workout_saves;
create policy workout_saves_write on public.workout_saves
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.shared_workouts w where w.id = workout_id)
  );

drop policy if exists workout_saves_delete on public.workout_saves;
create policy workout_saves_delete on public.workout_saves
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ─── 2. Privacidade por tipo, no servidor ────────────────────────────────────
-- Antes: publicar exigia apenas perfil público; `show_workouts` era decorativo.
-- Agora desligar "treinos" esconde as publicações imediatamente, e o admin
-- consegue ler para moderar.
drop policy if exists shared_workouts_read on public.shared_workouts;
create policy shared_workouts_read on public.shared_workouts
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or public.is_admin()
    or (
      is_public
      and not public.is_blocked(user_id, (select auth.uid()))
      and exists (
        select 1 from public.athlete_profiles ap
        where ap.user_id = shared_workouts.user_id
          and ap.is_public
          and ap.show_workouts
      )
    )
  );

-- Publicar exige perfil público + permissão de treinos. Assim o servidor recusa
-- publicação feita por fora da interface, não só o botão.
drop policy if exists shared_workouts_write on public.shared_workouts;
drop policy if exists shared_workouts_insert on public.shared_workouts;
drop policy if exists shared_workouts_update on public.shared_workouts;
drop policy if exists shared_workouts_delete on public.shared_workouts;

create policy shared_workouts_insert on public.shared_workouts
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.athlete_profiles ap
      where ap.user_id = (select auth.uid()) and ap.is_public and ap.show_workouts
    )
  );

create policy shared_workouts_update on public.shared_workouts
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy shared_workouts_delete on public.shared_workouts
  for delete to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

-- Desligar um tipo não pode travar o outro: perfil público sem treinos continua
-- válido, e o dono sempre edita o próprio perfil.
drop policy if exists athlete_profiles_write on public.athlete_profiles;
drop policy if exists athlete_profiles_insert on public.athlete_profiles;
drop policy if exists athlete_profiles_update on public.athlete_profiles;
drop policy if exists athlete_profiles_delete on public.athlete_profiles;

create policy athlete_profiles_insert on public.athlete_profiles
  for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy athlete_profiles_update on public.athlete_profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy athlete_profiles_delete on public.athlete_profiles
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ─── 3. Progresso público: só agregados, e só com opt-in ─────────────────────
-- SECURITY DEFINER porque workout_sessions é privada ao dono. A segurança vem
-- do WHERE (perfil público + show_progress + sem bloqueio) e da lista explícita
-- de colunas. Nenhum valor de carga, peso, medida ou volume é selecionado.
create or replace view public.athlete_public_progress as
  select
    ap.user_id,
    count(ws.id) filter (where ws.status = 'completed')::integer as sessions_completed,
    count(ws.id) filter (
      where ws.status = 'completed' and ws.completed_at >= now() - interval '30 days'
    )::integer as sessions_last_30d,
    ap.created_at as athlete_since
  from public.athlete_profiles ap
  left join public.workout_sessions ws on ws.user_id = ap.user_id
  where ap.is_public
    and ap.show_progress
    and not public.is_blocked(ap.user_id, (select auth.uid()))
  group by ap.user_id, ap.created_at;

-- ─── 4. Moderação ───────────────────────────────────────────────────────────
-- Fila legível apenas por admin. View DEFINER com WHERE is_admin(), no mesmo
-- padrão de admin_user_directory.
drop view if exists public.admin_content_reports;
create view public.admin_content_reports as
  select
    r.id,
    r.reason,
    r.details,
    r.status,
    r.created_at,
    r.workout_id,
    r.reported_user_id,
    w.title as workout_title,
    w.is_public as workout_is_public,
    w.user_id as workout_author_id,
    reporter.handle as reporter_handle,
    target.handle as reported_handle
  from public.content_reports r
  left join public.shared_workouts w on w.id = r.workout_id
  left join public.athlete_profiles reporter on reporter.user_id = r.reporter_id
  left join public.athlete_profiles target
    on target.user_id = coalesce(r.reported_user_id, w.user_id)
  where public.is_admin();

-- Resolução da denúncia. Só admin; decide e optionally derruba o conteúdo.
-- Retorna o id resolvido para o cliente confirmar sucesso com prova do servidor.
create or replace function public.resolve_content_report(
  p_report_id uuid,
  p_decision text,
  p_hide_content boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_workout uuid;
  v_actor uuid := auth.uid();
begin
  if not public.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if p_decision not in ('reviewed','dismissed') then
    raise exception 'invalid_decision' using errcode = '22023';
  end if;

  select workout_id into v_workout
  from public.content_reports where id = p_report_id;
  if not found then
    raise exception 'report_not_found' using errcode = 'P0002';
  end if;

  update public.content_reports set status = p_decision where id = p_report_id;

  -- Derrubar é sempre reversível pelo autor: só muda a visibilidade.
  if p_hide_content and v_workout is not null then
    update public.shared_workouts set is_public = false where id = v_workout;
  end if;

  insert into public.audit_logs(user_id, table_name, action, row_id, metadata)
  values (
    v_actor, 'content_reports', 'resolve', p_report_id,
    jsonb_build_object('decision', p_decision, 'hidden', p_hide_content, 'workout_id', v_workout)
  );

  return p_report_id;
end $$;

revoke execute on function public.resolve_content_report(uuid, text, boolean) from public, anon;
grant execute on function public.resolve_content_report(uuid, text, boolean) to authenticated;

-- ─── Contadores: agora incluem saves ─────────────────────────────────────────
create or replace function public.sync_workout_counters()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_workout uuid := coalesce(new.workout_id, old.workout_id);
begin
  if tg_table_name = 'workout_likes' then
    update public.shared_workouts set like_count = (
      select count(*) from public.workout_likes where workout_id = v_workout
    ) where id = v_workout;
  elsif tg_table_name = 'workout_saves' then
    update public.shared_workouts set save_count = (
      select count(*) from public.workout_saves where workout_id = v_workout
    ) where id = v_workout;
  else
    update public.shared_workouts set comment_count = (
      select count(*) from public.workout_comments where workout_id = v_workout
    ) where id = v_workout;
  end if;
  return coalesce(new, old);
end $$;
revoke execute on function public.sync_workout_counters() from public, anon, authenticated;

drop trigger if exists trg_workout_saves_count on public.workout_saves;
create trigger trg_workout_saves_count after insert or delete on public.workout_saves
  for each row execute function public.sync_workout_counters();

-- ─── Grants (deny-by-default) ────────────────────────────────────────────────
revoke all on public.workout_saves from public, anon;
grant select, insert, delete on public.workout_saves to authenticated;

grant select on public.athlete_public_progress to authenticated;
grant select on public.admin_content_reports to authenticated;

-- O status da denúncia pertence à moderação, não a quem denunciou.
revoke update (status) on public.content_reports from authenticated;

commit;