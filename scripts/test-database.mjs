import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';
const db=new PGlite();
await db.exec(`create schema auth; create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}'); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; create role anon nologin; create role authenticated nologin; create role service_role nologin; create schema extensions; grant usage on schema public,auth to authenticated,anon; grant select on auth.users to authenticated; alter default privileges in schema public grant all on tables to authenticated; alter default privileges in schema public grant execute on functions to authenticated;`);
for(const file of readdirSync('supabase/migrations').sort().filter(f=>f.endsWith('.sql'))){
 // PGlite lacks pg_trgm; only its optional search index is omitted. Tables, RLS,
 // constraints and all V10 functions run unchanged. Never use this adapter in production.
 const sql=readFileSync('supabase/migrations/'+file,'utf8').replace(/^create extension.*$/gm,'').replace(/^create index.*gin_trgm_ops.*$/gm,'');
 try { await db.exec(sql); } catch(e) { console.error(file,e.message);process.exitCode=1;await db.close();process.exit(1); } console.log('Migration OK:',file);
}
const a='00000000-0000-4000-8000-000000000001',b='00000000-0000-4000-8000-000000000002',ex='00000000-0000-4000-8000-000000000003',s='00000000-0000-4000-8000-000000000004';
await db.exec(`insert into auth.users(id,email) values('${a}','a@test.invalid'),('${b}','b@test.invalid'); insert into public.exercises(id,name,slug,primary_muscle) values('${ex}','Squat','squat','quads'); insert into public.workout_sessions(id,user_id,name,status,started_at) values('${s}','${a}','Test','in_progress',now());`);
const as=async(id,sql,params=[])=>{try { await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${id}',false);`);return await db.query(sql,params)} catch(e) { throw new Error(e.message); } finally{await db.exec('reset role;')}};
assert.equal((await as(b,`select * from public.workout_sessions where id='${s}'`)).rows.length,0);
await assert.rejects(()=>as(b,`select public.complete_workout_session('${s}')`));
await assert.rejects(()=>as(a,`select public.complete_workout_session('${s}')`));
assert.equal((await as(a,'select status from public.workout_sessions')).rows[0].status,'in_progress');
await as(a,`insert into public.workout_sets(session_id,exercise_id,set_number,reps,weight_kg,completed) values('${s}','${ex}',1,10,50,true)`);
await as(a,`select public.complete_workout_session('${s}')`);await as(a,`select public.complete_workout_session('${s}')`);
assert.equal((await as(a,'select count(*)::int as n from public.exercise_history')).rows[0].n,1);
assert.equal((await as(a,'select total_volume_kg::float as v from public.workout_sessions')).rows[0].v,500);
assert.equal((await as(a,'select value::float as v from public.personal_records')).rows[0].v,50);
await as(a,`insert into public.food_diary(id,user_id,entry_date) values('${ex}','${a}',current_date)`);
await as(a,`select * from public.add_meal_entries('${ex}','lunch','[{"food_name":"Rice","grams":158,"calories":205.4,"protein_g":4.25,"carbs_g":44.51,"fat_g":0.44,"source":"usda","metadata":{"grams":158}}]'::jsonb)`);
assert.equal((await as(a,'select quantity::float as q from public.meal_entries')).rows[0].q,1.58);
await assert.rejects(()=>as(a,`select * from public.add_meal_entries('${ex}','lunch','[{"food_name":"Valid","grams":100,"calories":100,"protein_g":1,"carbs_g":1,"fat_g":1,"source":"manual"},{"food_name":"Invalid","grams":-1,"calories":100,"protein_g":1,"carbs_g":1,"fat_g":1,"source":"manual"}]'::jsonb)`));
assert.equal((await as(a,'select count(*)::int as n from public.meal_entries')).rows[0].n,1);
assert.equal((await as(b,'select count(*)::int as n from public.meal_entries')).rows[0].n,0);
await as(a,`insert into public.nutrition_plans(user_id,plan) values('${a}','[]')`);
assert.equal((await as(b,'select count(*)::int as n from public.nutrition_plans')).rows[0].n,0);
console.log('PASS: actual migrations, ownership isolation, empty completion rejection, atomic/idempotent completion, history/PR, fractional portions, meal rollback, private nutrition plans.');
await db.close();
