-- ATHLETIX PROMAX V10. Additive, reversible-by-design schema extension.
-- Existing rows and identifiers are preserved. Apply before deploying V10.
begin;

alter table public.workout_sessions
  add column if not exists exercise_snapshot jsonb not null default '[]'::jsonb,
  add column if not exists client_state jsonb not null default '{}'::jsonb;
alter table public.meal_entries
  add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.nutrition_profiles
  add column if not exists questionnaire jsonb not null default '{}'::jsonb;
alter table public.food_database
  add column if not exists image_url text,
  add column if not exists category text,
  add column if not exists keywords text[] not null default '{}';

create table if not exists public.nutrition_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.nutrition_plans enable row level security;
revoke all on public.nutrition_plans from anon;
grant select, insert, update, delete on public.nutrition_plans to authenticated;
drop policy if exists nutrition_plans_own on public.nutrition_plans;
create policy nutrition_plans_own on public.nutrition_plans
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop trigger if exists trg_nutrition_plans_updated on public.nutrition_plans;
create trigger trg_nutrition_plans_updated before update on public.nutrition_plans
  for each row execute function public.set_updated_at();

-- Protect history from a repeated finish/retry. Existing duplicate data, if any,
-- intentionally aborts the migration instead of silently deleting user records.
do $$
begin
  if exists (select 1 from public.exercise_history where session_id is not null
             group by session_id, exercise_id having count(*) > 1) then
    raise exception 'Duplicate exercise history: resolve existing duplicates before V10';
  end if;
end $$;
create unique index if not exists exercise_history_session_exercise_unique
  on public.exercise_history(session_id, exercise_id) where session_id is not null;

-- SECURITY INVOKER: all reads/writes remain subject to the existing own-only RLS.
-- One transaction prevents a completed session with missing history/records.
create or replace function public.complete_workout_session(p_session_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  s public.workout_sessions%rowtype;
  aggregate record;
  volume numeric := 0;
  elapsed integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into s from public.workout_sessions
    where id = p_session_id and user_id = auth.uid() for update;
  if not found then raise exception 'Session not found'; end if;
  if s.status = 'completed' then return to_jsonb(s); end if;
  if s.status <> 'in_progress' then raise exception 'Session is not active'; end if;
  if not exists (select 1 from public.workout_sets
                 where session_id = s.id and completed and reps is not null and reps > 0) then
    raise exception 'Complete at least one set before finishing';
  end if;

  for aggregate in
    select exercise_id, max(weight_kg) as best_weight, max(reps) as best_reps,
      sum(coalesce(weight_kg, 0) * reps) as volume
    from public.workout_sets
    where session_id = s.id and completed and reps is not null and reps > 0
    group by exercise_id
  loop
    volume := volume + aggregate.volume;
    insert into public.exercise_history
      (user_id, exercise_id, session_id, best_weight_kg, best_reps, total_volume_kg)
    values (auth.uid(), aggregate.exercise_id, s.id, aggregate.best_weight,
            aggregate.best_reps, aggregate.volume)
    on conflict (session_id, exercise_id) where session_id is not null
    do update set best_weight_kg = excluded.best_weight_kg,
      best_reps = excluded.best_reps, total_volume_kg = excluded.total_volume_kg;

    if aggregate.best_weight > 0 then
      insert into public.personal_records
        (user_id, exercise_id, record_type, value, unit, session_id)
      values (auth.uid(), aggregate.exercise_id, 'weight', aggregate.best_weight, 'kg', s.id)
      on conflict (user_id, exercise_id, record_type)
      do update set value = excluded.value, achieved_at = now(), session_id = excluded.session_id
        where excluded.value > public.personal_records.value;
    end if;
  end loop;

  elapsed := greatest(0, least(86400, floor(extract(epoch from (now() - coalesce(s.started_at, now()))))::integer));
  update public.workout_sessions set status = 'completed', completed_at = now(),
    duration_seconds = elapsed, total_volume_kg = volume,
    client_state = coalesce(client_state, '{}'::jsonb) - 'restUntil' - 'paused'
  where id = s.id and user_id = auth.uid()
  returning * into s;
  return to_jsonb(s);
end;
$$;
revoke execute on function public.complete_workout_session(uuid) from public, anon;
grant execute on function public.complete_workout_session(uuid) to authenticated;

-- Account deletion never requires a service-role key in the browser.
create or replace function public.delete_own_account()
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke execute on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;

create or replace function public.add_meal_entries(p_diary_id uuid, p_meal_type text, p_entries jsonb)
returns setof public.meal_entries language plpgsql security invoker set search_path=public as $$
declare item jsonb; entry public.meal_entries%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not exists(select 1 from public.food_diary where id=p_diary_id and user_id=auth.uid()) then
    raise exception 'Diary not found';
  end if;
  if p_meal_type not in ('breakfast','lunch','dinner','snack','pre_workout','post_workout') then
    raise exception 'Invalid meal type';
  end if;
  if jsonb_typeof(p_entries)<>'array' or jsonb_array_length(p_entries) not between 1 and 30 then
    raise exception 'Invalid meal entries';
  end if;
  for item in select * from jsonb_array_elements(p_entries) loop
    if jsonb_typeof(item)<>'object' or coalesce(length(trim(item->>'food_name')),0) not between 1 and 200 then raise exception 'Invalid food'; end if;
    if (item->>'grams')::numeric <= 0 or (item->>'grams')::numeric > 5000 then raise exception 'Invalid portion'; end if;
    insert into public.meal_entries(diary_id,meal_type,food_id,food_name,quantity,serving_size_g,
      calories,protein_g,carbs_g,fat_g,source,metadata,eaten_at)
    values(p_diary_id,p_meal_type::public.meal_type,nullif(item->>'food_id','')::uuid,item->>'food_name',
      (item->>'grams')::numeric/100,100,(item->>'calories')::numeric,
      (item->>'protein_g')::numeric,(item->>'carbs_g')::numeric,(item->>'fat_g')::numeric,
      (item->>'source')::public.source_type,coalesce(item->'metadata','{}'::jsonb),now()) returning * into entry;
    return next entry;
  end loop;
end; $$;
revoke execute on function public.add_meal_entries(uuid,text,jsonb) from public,anon;
grant execute on function public.add_meal_entries(uuid,text,jsonb) to authenticated;
commit;
