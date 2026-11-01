-- ATHLETIX AppSec: deny-by-default grants, ownership boundaries and distributed AI quotas.
-- No user rows are rewritten. Run the isolated PostgreSQL security suite before applying.
begin;

-- The application never calls database HTTP helpers. Do not expose an SSRF primitive.
do $$
declare f record;
begin
  if exists(select 1 from pg_extension where extname='http') then
    for f in select p.oid::regprocedure as signature from pg_proc p
      join pg_namespace n on n.oid=p.pronamespace where n.nspname='public'
      and p.proname in ('http','http_get','http_post','http_put','http_patch','http_delete','http_head','http_header','http_set_curlopt','http_reset_curlopt','http_list_curlopt','urlencode','bytea_to_text','text_to_bytea') loop
      execute format('revoke all on function %s from public, anon, authenticated',f.signature);
    end loop;
  end if;
  if exists(select 1 from pg_extension where extname='pg_net') then
    revoke all on schema net from public, anon, authenticated;
    for f in select p.oid::regprocedure as signature from pg_proc p
      join pg_namespace n on n.oid=p.pronamespace where n.nspname='net' loop
      execute format('revoke all on function %s from public, anon, authenticated',f.signature);
    end loop;
  end if;
end $$;

-- Supabase's historical ALL grants are unnecessary when RLS is the only boundary.
-- Keep service_role/owner privileges intact; explicitly grant the API surface below.
do $$
declare t record;
begin
  for t in select c.relkind,c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind in ('r','p','v','m') loop
    execute format('revoke all on public.%I from public, anon, authenticated',t.relname);
  end loop;
end $$;
alter default privileges for role postgres in schema public revoke all on tables from public, anon, authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from public, anon, authenticated;

grant select on public.exercises,public.exercise_categories,public.achievements to anon,authenticated;
grant insert,update,delete on public.exercises,public.exercise_categories,public.achievements to authenticated;
grant select on public.food_database to anon,authenticated;
grant insert,update,delete on public.food_database to authenticated;
grant select on public.dashboard_summary to authenticated;
grant select,insert,update,delete on public.profiles,public.user_preferences,public.fitness_goals,
  public.training_profiles,public.workout_plans,public.workout_exercises,public.workout_sessions,
  public.workout_sets,public.exercise_history,public.personal_records,public.body_measurements,
  public.nutrition_profiles,public.nutrition_plans,public.food_diary,public.meal_entries,
  public.hydration_logs,public.user_achievements,public.notifications to authenticated;
grant select,insert,update,delete on public.saved_workouts to authenticated;
grant select on public.admin_users,public.audit_logs to authenticated;

-- A permissive ALL policy accidentally gave UPDATE/DELETE access to public rows.
drop policy if exists saved_workouts_own on public.saved_workouts;
drop policy if exists saved_workouts_owner on public.saved_workouts;
create policy saved_workouts_owner on public.saved_workouts for all to authenticated
  using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
drop policy if exists saved_workouts_public_read on public.saved_workouts;
create policy saved_workouts_public_read on public.saved_workouts for select to authenticated
  using (is_public=true);

-- Explicit API roles prevent future policies from accidentally applying to anon.
do $$
declare p record;
begin
  for p in select schemaname,tablename,policyname from pg_policies where schemaname='public'
    and policyname<>'saved_workouts_owner' and policyname<>'saved_workouts_public_read' loop
    execute format('alter policy %I on public.%I to authenticated',p.policyname,p.tablename);
  end loop;
  for p in select tablename,policyname from pg_policies where schemaname='public'
    and tablename in ('exercises','exercise_categories','achievements','food_database') and cmd='SELECT' loop
    execute format('alter policy %I on public.%I to anon,authenticated',p.policyname,p.tablename);
  end loop;
end $$;
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert to authenticated
  with check (id=(select auth.uid()));

-- Support admins do not need health questionnaires or direct writes to user profiles.
drop policy if exists training_profiles_admin_read on public.training_profiles;
drop policy if exists profiles_admin_all on public.profiles;
drop view if exists public.admin_user_directory;
create view public.admin_user_directory as
  select id,email,full_name,avatar_url,created_at,is_minor,onboarding_completed
  from public.profiles where public.is_admin();
grant select on public.admin_user_directory to authenticated;
revoke insert,update,delete on public.profiles from authenticated;
grant insert,update on public.profiles to authenticated;
revoke update on public.profiles from authenticated;
grant update (full_name,avatar_url,phone,birth_date,gender,height_cm,weight_kg,bio,country,city,is_minor,onboarding_completed) on public.profiles to authenticated;
revoke insert on public.profiles from authenticated;
grant insert (id,email,full_name,avatar_url) on public.profiles to authenticated;
-- Existing admin SELECT policies are retained only for the existing support directory.
-- Admin role provisioning is service-role-only; no client-side role elevation.
revoke insert,update,delete on public.admin_users,public.audit_logs from authenticated;

-- Abort (rollback) if existing rows already violate the ownership rules below.
-- No user data is rewritten or silently dropped.
do $$
begin
  if exists(select 1 from public.workout_sessions s join public.workout_plans p on p.id=s.plan_id where p.user_id<>s.user_id)
    or exists(select 1 from public.exercise_history h join public.workout_sessions s on s.id=h.session_id where s.user_id<>h.user_id)
    or exists(select 1 from public.personal_records r join public.workout_sessions s on s.id=r.session_id where s.user_id<>r.user_id)
    or exists(select 1 from public.meal_entries m join public.food_database f on f.id=m.food_id where f.is_custom and f.user_id is distinct from (select d.user_id from public.food_diary d where d.id=m.diary_id)) then
    raise exception 'Existing cross-tenant references detected; resolve before hardening';
  end if;
end $$;

-- Cross-tenant FK validation: UUID possession is not authorization.
create or replace function public.appsec_check_ownership() returns trigger
language plpgsql security invoker set search_path='' as $$
declare valid boolean; r jsonb; v_user uuid; v_parent uuid;
begin
  r:=pg_catalog.to_jsonb(new); v_user:=(r->>'user_id')::uuid;
  if tg_table_name='workout_sessions' and r->>'plan_id' is not null then
    v_parent:=(r->>'plan_id')::uuid;
    select exists(select 1 from public.workout_plans where id=v_parent and user_id=v_user) into valid;
  elsif tg_table_name in ('exercise_history','personal_records') and r->>'session_id' is not null then
    v_parent:=(r->>'session_id')::uuid;
    select exists(select 1 from public.workout_sessions where id=v_parent and user_id=v_user) into valid;
  elsif tg_table_name='meal_entries' and r->>'food_id' is not null then
    v_parent:=(r->>'food_id')::uuid;
    select exists(select 1 from public.food_database f where f.id=v_parent and
      (f.is_custom=false or f.user_id=(select auth.uid()))) into valid;
  else valid:=true;
  end if;
  if not valid then raise exception 'Related record not found or access denied' using errcode='42501'; end if;
  return new;
end $$;
revoke execute on function public.appsec_check_ownership() from public,anon,authenticated;
do $$
declare t text;
begin
  foreach t in array array['workout_sessions','exercise_history','personal_records','meal_entries'] loop
    execute format('drop trigger if exists appsec_ownership on public.%I',t);
    execute format('create trigger appsec_ownership before insert or update on public.%I for each row execute function public.appsec_check_ownership()',t);
  end loop;
end $$;

create or replace function public.complete_workout_session(p_session_id uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare s public.workout_sessions%rowtype; aggregate record; volume numeric:=0; elapsed integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into s from public.workout_sessions where id=p_session_id and user_id=auth.uid() for update;
  if not found then raise exception 'Session not found'; end if;
  if s.status='completed' then return pg_catalog.to_jsonb(s); end if;
  if s.status<>'in_progress' then raise exception 'Session is not active'; end if;
  if not exists(select 1 from public.workout_sets where session_id=s.id and completed and reps is not null and reps>0) then
    raise exception 'Complete at least one set before finishing'; end if;
  for aggregate in
    select exercise_id, max(weight_kg) best_weight, max(reps) best_reps, sum(coalesce(weight_kg,0)*reps) volume
    from public.workout_sets where session_id=s.id and completed and reps is not null and reps>0 group by exercise_id
  loop
    volume:=volume+aggregate.volume;
    insert into public.exercise_history(user_id,exercise_id,session_id,best_weight_kg,best_reps,total_volume_kg)
      values(auth.uid(),aggregate.exercise_id,s.id,aggregate.best_weight,aggregate.best_reps,aggregate.volume)
      on conflict (session_id,exercise_id) where session_id is not null
      do update set best_weight_kg=excluded.best_weight_kg,best_reps=excluded.best_reps,total_volume_kg=excluded.total_volume_kg;
    if aggregate.best_weight>0 then
      insert into public.personal_records(user_id,exercise_id,record_type,value,unit,session_id)
        values(auth.uid(),aggregate.exercise_id,'weight',aggregate.best_weight,'kg',s.id)
        on conflict (user_id,exercise_id,record_type)
        do update set value=excluded.value,achieved_at=pg_catalog.now(),session_id=excluded.session_id
          where excluded.value>public.personal_records.value;
    end if;
  end loop;
  elapsed:=greatest(0,least(86400,pg_catalog.floor(extract(epoch from (pg_catalog.now()-coalesce(s.started_at,pg_catalog.now()))))::integer));
  update public.workout_sessions set status='completed',completed_at=pg_catalog.now(),duration_seconds=elapsed,total_volume_kg=volume,
    client_state=coalesce(client_state,'{}'::jsonb)-'restUntil'-'paused'
    where id=s.id and user_id=auth.uid() returning * into s;
  return pg_catalog.to_jsonb(s);
end $$;
revoke execute on function public.complete_workout_session(uuid) from public,anon;
grant execute on function public.complete_workout_session(uuid) to authenticated;

-- Deny-by-default function EXECUTE: revoke legacy PUBLIC/API grants on all
-- non-extension public functions, then re-grant only the app RPC surface.
do $$
declare f record;
begin
  for f in select p.oid::regprocedure sig from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.prokind in ('f','p')
      and not exists(select 1 from pg_depend d where d.objid=p.oid and d.deptype='e') loop
    execute format('revoke execute on function %s from public, anon, authenticated',f.sig);
  end loop;
end $$;
grant execute on function public.is_admin() to anon,authenticated;
grant execute on function public.complete_workout_session(uuid),public.delete_own_account(),
  public.add_meal_entries(uuid,text,jsonb),public.reset_training_profile() to authenticated;

-- Empty search_path + qualified names for privileged functions. Trigger helpers are
-- not RPCs. Their bodies continue to use only the authenticated subject.
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.admin_users where user_id=(select auth.uid()) and role='admin' and active=true);
$$;
create or replace function public.current_user_role() returns public.user_role language sql stable security definer set search_path='' as $$
  select coalesce((select role from public.admin_users where user_id=(select auth.uid()) and active=true),'user'::public.user_role);
$$;
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.profiles(id,email,full_name,avatar_url) values(new.id,coalesce(new.email,''),
    left(coalesce(new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'name',split_part(coalesce(new.email,''),'@',1)),200),
    case when coalesce(new.raw_user_meta_data->>'avatar_url','') ~ '^https://' then left(new.raw_user_meta_data->>'avatar_url',2048) else null end)
    on conflict(id) do nothing;
  insert into public.user_preferences(user_id) values(new.id) on conflict(user_id) do nothing;
  return new;
end $$;
create or replace function public.audit_row_change() returns trigger language plpgsql security definer set search_path='' as $$
declare r jsonb;
begin
  r:=to_jsonb(coalesce(new,old));
  insert into public.audit_logs(user_id,table_name,action,row_id,metadata)
    values((select auth.uid()),tg_table_name,lower(tg_op),coalesce((r->>'id')::uuid,(r->>'user_id')::uuid),jsonb_build_object('op',tg_op));
  return coalesce(new,old);
end $$;
create or replace function public.set_updated_at() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at=pg_catalog.now();return new;end $$;
create or replace function public.grant_admin(user_email text) returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid;
begin
  select id into v_id from auth.users where email=lower(trim(user_email));
  if v_id is null then raise exception 'Account not found'; end if;
  insert into public.admin_users(user_id,role,active,granted_by) values(v_id,'admin',true,auth.uid())
    on conflict(user_id) do update set role='admin',active=true,granted_by=auth.uid();
  return v_id;
end $$;
create or replace function public.reset_training_profile() returns void language plpgsql security definer set search_path='' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required';end if;
  update public.profiles set onboarding_completed=false where id=(select auth.uid());
  delete from public.training_profiles where user_id=(select auth.uid());
end $$;
revoke execute on function public.handle_new_user(),public.audit_row_change(),public.set_updated_at(),public.current_user_role() from public,anon,authenticated;
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon,authenticated;
revoke execute on function public.grant_admin(text) from public,anon,authenticated;
grant execute on function public.grant_admin(text) to service_role;

-- Validate JSON before casting. Parameterized/typed values, never dynamic SQL.
create or replace function public.add_meal_entries(p_diary_id uuid,p_meal_type text,p_entries jsonb)
returns setof public.meal_entries language plpgsql security invoker set search_path='' as $$
declare item jsonb;entry public.meal_entries%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication required';end if;
  if not exists(select 1 from public.food_diary where id=p_diary_id and user_id=(select auth.uid())) then raise exception 'Diary not found';end if;
  if p_meal_type not in ('breakfast','lunch','dinner','snack','pre_workout','post_workout') then raise exception 'Invalid meal type';end if;
  if jsonb_typeof(p_entries)<>'array' or jsonb_array_length(p_entries) not between 1 and 30 then raise exception 'Invalid meal entries';end if;
  for item in select * from pg_catalog.jsonb_array_elements(p_entries) loop
    if jsonb_typeof(item)<>'object' or coalesce(length(trim(item->>'food_name')),0) not between 1 and 200
      or jsonb_typeof(item->'metadata') not in ('object','null')
      or pg_catalog.octet_length(item::text)>16000 then raise exception 'Invalid food';end if;
    if item->>'grams' !~ '^[0-9]+([.][0-9]{1,2})?$' or (item->>'grams')::numeric<=0 or (item->>'grams')::numeric>5000 then raise exception 'Invalid portion';end if;
    if item->>'food_id' is not null and item->>'food_id' !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' then raise exception 'Invalid food ID';end if;
    if item->>'source' not in ('wger','free_exercise_db','repdb','usda','open_food_facts','manual') then raise exception 'Invalid source';end if;
    if exists(select 1 from unnest(array['calories','protein_g','carbs_g','fat_g']) k
      where item->>k is null or item->>k !~ '^[0-9]+([.][0-9]{1,2})?$' or (item->>k)::numeric>100000) then raise exception 'Invalid nutrition values';end if;
    insert into public.meal_entries(diary_id,meal_type,food_id,food_name,quantity,serving_size_g,calories,protein_g,carbs_g,fat_g,source,metadata,eaten_at)
      values(p_diary_id,p_meal_type::public.meal_type,nullif(item->>'food_id','')::uuid,item->>'food_name',
      (item->>'grams')::numeric/100,100,(item->>'calories')::numeric,(item->>'protein_g')::numeric,
      (item->>'carbs_g')::numeric,(item->>'fat_g')::numeric,(item->>'source')::public.source_type,
      coalesce(item->'metadata','{}'::jsonb),pg_catalog.now()) returning * into entry;
    return next entry;
  end loop;
end $$;
revoke execute on function public.add_meal_entries(uuid,text,jsonb) from public,anon;
grant execute on function public.add_meal_entries(uuid,text,jsonb) to authenticated;

-- Shared atomic quota/lease: survives cold starts and concurrent serverless instances.
create table if not exists public.ai_usage (
  user_id uuid references auth.users(id) on delete cascade,
  request_id uuid not null,
  endpoint text not null check(endpoint in ('plan','chat')),
  reserved_tokens integer not null check(reserved_tokens between 1 and 12000),
  lease_secret uuid not null default pg_catalog.gen_random_uuid(),
  actual_tokens integer check(actual_tokens between 0 and 24000),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  finished_at timestamptz,
  primary key(user_id,request_id)
);
alter table public.ai_usage enable row level security;
revoke all on public.ai_usage from public,anon,authenticated;
create index if not exists ai_usage_created on public.ai_usage(created_at);
create or replace function public.reserve_ai_request(p_request_id uuid,p_endpoint text,p_tokens integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=(select auth.uid());recent integer;daily integer;tokens integer;active integer;secret uuid;
begin
  if uid is null then raise exception 'Authentication required';end if;
  if p_endpoint not in ('plan','chat') or p_tokens is null or p_tokens not between 1 and 12000 then raise exception 'Invalid quota request';end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(uid::text,17));
  if exists(select 1 from public.ai_usage where user_id=uid and request_id=p_request_id) then return jsonb_build_object('allowed',false,'reason','duplicate');end if;
  delete from public.ai_usage where created_at<pg_catalog.now()-interval '8 days';
  select count(*) filter(where created_at>pg_catalog.now()-interval '1 hour'),count(*),
    coalesce(sum(coalesce(actual_tokens,reserved_tokens)),0)::integer,
    count(*) filter(where finished_at is null and expires_at>pg_catalog.now())
    into recent,daily,tokens,active from public.ai_usage where user_id=uid and created_at>pg_catalog.now()-interval '1 day';
  if active>=1 then return jsonb_build_object('allowed',false,'reason','busy');end if;
  if recent>=(case when p_endpoint='plan' then 8 else 30 end) or daily>=(case when p_endpoint='plan' then 20 else 60 end) or tokens+p_tokens>60000 then
    return jsonb_build_object('allowed',false,'reason','quota');end if;
  insert into public.ai_usage(user_id,request_id,endpoint,reserved_tokens,expires_at)
    values(uid,p_request_id,p_endpoint,p_tokens,pg_catalog.now()+interval '65 seconds') returning lease_secret into secret;
  return jsonb_build_object('allowed',true,'secret',secret);
end $$;
create or replace function public.finish_ai_request(p_request_id uuid,p_secret uuid,p_tokens integer,p_success boolean)
returns void language plpgsql security definer set search_path='' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required';end if;
  update public.ai_usage set finished_at=pg_catalog.now(),
    actual_tokens=greatest(reserved_tokens,least(24000,greatest(coalesce(p_tokens,0),0)))
    where user_id=(select auth.uid()) and request_id=p_request_id and lease_secret=p_secret and finished_at is null;
end $$;
drop function if exists public.finish_ai_request(uuid,integer,boolean);
revoke execute on function public.reserve_ai_request(uuid,text,integer),public.finish_ai_request(uuid,uuid,integer,boolean) from public,anon;
grant execute on function public.reserve_ai_request(uuid,text,integer),public.finish_ai_request(uuid,uuid,integer,boolean) to authenticated;
commit;
