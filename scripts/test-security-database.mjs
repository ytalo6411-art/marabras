import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';

const db = new PGlite();
process.on('uncaughtException',async error=>{console.error(error.message,error.internalQuery??'');await db.close();process.exit(1);});
// Match Supabase's exposed-schema grants, not a superuser test connection.
await db.exec(`
  create schema auth; create schema extensions;
  create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
  create role anon nologin; create role authenticated nologin; create role service_role nologin;
  grant usage on schema public,auth to anon,authenticated,service_role;
  alter default privileges for role postgres in schema public grant all on tables to anon,authenticated,service_role;
  alter default privileges for role postgres in schema public grant execute on functions to public,anon,authenticated,service_role;
`);
const files=readdirSync('supabase/migrations').sort().filter(f=>f.endsWith('.sql'));
for(const file of files){
  const sql=readFileSync(`supabase/migrations/${file}`,'utf8').replace(/^create extension.*$/gm,'').replace(/^create index.*gin_trgm_ops.*$/gm,'');
  await db.exec(sql);
  console.log('Migration OK:',file);
}
const A='10000000-0000-4000-8000-000000000001',B='10000000-0000-4000-8000-000000000002';
const EX='10000000-0000-4000-8000-000000000003',PLAN='10000000-0000-4000-8000-000000000004';
const SESSION='10000000-0000-4000-8000-000000000005',DIARY='10000000-0000-4000-8000-000000000006';
const SAVED='10000000-0000-4000-8000-000000000007',FOOD='10000000-0000-4000-8000-000000000008';
await db.exec(`insert into auth.users(id,email) values('${A}','alice@test.invalid'),('${B}','bob@test.invalid');
  insert into public.exercises(id,name,slug,primary_muscle) values('${EX}','Squat','squat','quads');
  insert into public.workout_plans(id,user_id,name) values('${PLAN}','${A}','Private plan');
  insert into public.workout_sessions(id,user_id,plan_id,name,status,started_at) values('${SESSION}','${A}','${PLAN}','Private session','in_progress',now());
  insert into public.food_diary(id,user_id,entry_date) values('${DIARY}','${A}',current_date);
  insert into public.saved_workouts(id,user_id,name,is_public) values('${SAVED}','${A}','Public template',true);
  insert into public.food_database(id,user_id,name,is_custom) values('${FOOD}','${A}','Private food',true);
  insert into public.training_profiles(user_id,questionnaire) values('${A}','{}'::jsonb);
  insert into public.nutrition_profiles(user_id,notes) values('${A}','Private allergy');
  insert into public.body_measurements(user_id,weight_kg) values('${A}',70);
  insert into public.nutrition_plans(user_id,plan) values('${A}','[]');
`);
async function as(id,sql,params=[]){
  return db.transaction(async tx=>{
    await tx.exec(`set local role ${id===null?'anon':'authenticated'}; select set_config('request.jwt.claim.sub','${id??''}',true);`);
    try{return await tx.query(sql,params);}catch(e){e.message+=` SQL: ${sql}`;throw e;}
  });
}
const rejects=async(id,sql,params=[])=>{try{await assert.rejects(()=>as(id,sql,params));}catch(e){e.message+=` SQL: ${sql}`;throw e;}};
let assertions=0;
async function check(fn){try{await fn();assertions++;}catch(e){e.message+=` Scenario ${assertions+1}`;throw e;}}

// Regression: the original ALL policy permitted writes through is_public.
await check(async()=>{
  const before=await db.query("select with_check from pg_policies where policyname='saved_workouts_owner'");
  assert.match(before.rows[0].with_check,/auth.uid/);
  assert.equal((await as(B,'update public.saved_workouts set name=$1 where id=$2',['stolen',SAVED])).affectedRows,0);
  assert.equal((await as(B,'delete from public.saved_workouts where id=$1',[SAVED])).affectedRows,0);
  assert.equal((await as(B,'select name from public.saved_workouts where id=$1',[SAVED])).rows[0].name,'Public template');
});
const privateTables=['workout_plans','workout_sessions','training_profiles','nutrition_profiles','nutrition_plans','food_diary','body_measurements','profiles','user_preferences'];
for(const table of privateTables){
  const ownerCol=table==='profiles'?'id':'user_id';
  await check(async()=>{assert.equal((await as(B,`select * from public.${table} where ${ownerCol}=$1`,[A])).rows.length,0);await rejects(null,`select * from public.${table}`);});
  await check(async()=>{await rejects(null,`insert into public.${table} default values`);});
}
await check(async()=>{
  assert.equal((await as(B,'update public.profiles set full_name=$1 where id=$2',['stolen',A])).affectedRows,0);
  assert.equal((await as(B,'delete from public.training_profiles where user_id=$1',[A])).affectedRows,0);
  assert.equal((await as(B,"update public.workout_sessions set status='completed' where id=$1",[SESSION])).affectedRows,0);
  await rejects(B,'select public.complete_workout_session($1)',[SESSION]);
  await rejects(null,'select public.reset_training_profile()');
  assert.equal((await as(A,'select count(*)::int n from public.training_profiles where user_id=$1',[A])).rows[0].n,1); // A's profile unaffected by B's own reset
});
await check(async()=>{
  await rejects(B,"insert into public.workout_sessions(user_id,plan_id,name) values($1,$2,'cross-tenant')",[B,PLAN]);
  await rejects(B,"insert into public.exercise_history(user_id,exercise_id,session_id) values($1,$2,$3)",[B,EX,SESSION]);
  await rejects(B,"insert into public.personal_records(user_id,exercise_id,record_type,value,unit,session_id) values($1,$2,'weight',10,'kg',$3)",[B,EX,SESSION]);
  await rejects(B,"select * from public.add_meal_entries($1,'lunch',$2::jsonb)",[DIARY,JSON.stringify([{food_name:'x',grams:100,calories:0,protein_g:0,carbs_g:0,fat_g:0,source:'manual'}])]);
});
// A must not attach B's private food to A's diary, even with a guessed UUID.
await check(async()=>{
  const payload=JSON.stringify([{food_id:FOOD,food_name:'x',grams:100,calories:0,protein_g:0,carbs_g:0,fat_g:0,source:'manual'}]);
  // Switch food ownership to B, then use A's valid diary.
  await db.query("update public.food_database set user_id=$1 where id=$2",[B,FOOD]);
  await rejects(A,"select * from public.add_meal_entries($1,'lunch',$2::jsonb)",[DIARY,payload]);
  await db.query("update public.food_database set user_id=$1 where id=$2",[A,FOOD]);
});
await check(async()=>{
  for(const patch of [{grams:'100; drop table profiles'},{grams:'1e309'},{calories:'NaN'},{source:"manual'),(select '"},{food_id:'not-a-uuid'},{metadata:[]}]){
    const item={food_name:'safe parameter',grams:100,calories:1,protein_g:1,carbs_g:1,fat_g:1,source:'manual',...patch};
    await rejects(A,"select * from public.add_meal_entries($1,'lunch',$2::jsonb)",[DIARY,JSON.stringify([item])]);
  }
  assert.equal((await as(A,'select count(*)::int n from public.meal_entries')).rows[0].n,0);
});
await check(async()=>{
  for(const table of ['admin_users','audit_logs','ai_usage']){
    if(table==='ai_usage') await rejects(B,'select * from public.ai_usage');
    else assert.equal((await as(B,`select * from public.${table}`)).rows.length,0);
    await rejects(B,`insert into public.${table} default values`);
    await rejects(B,`update public.${table} set id=id` .replace('set id=id','set user_id=user_id'));
    await rejects(B,`delete from public.${table}`);
  }
  await rejects(B,"select public.grant_admin('bob@test.invalid')");
  await rejects(B,"insert into public.admin_users(user_id,role,active) values($1,'admin',true)",[B]);
  assert.equal((await as(B,'update public.exercises set name=$1 where id=$2',['defaced',EX])).affectedRows,0);
  await rejects(null,'update public.exercises set name=$1 where id=$2',['defaced',EX]);
});
await check(async()=>{
  // HTTP/net extensions are absent in PGlite; if present their ACLs must deny API roles.
  const http=await db.query("select proname,proacl from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','net') and proname in ('http','http_get','http_post','http_put','http_patch','http_delete','http_head')");
  for(const f of http.rows){const acl=(f.proacl??[]).join(',');assert.ok(!/anon=|authenticated=/.test(acl),`${f.proname} exposed`);}
  const funcs=await db.query("select proname,prosecdef,proconfig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and prosecdef");
  for(const f of funcs.rows)assert.ok(f.proconfig?.some(x=>x==='search_path=""'),`${f.proname} search_path`);
});
await check(async()=>{
  const request='20000000-0000-4000-8000-000000000001';
  const first=(await as(A,'select public.reserve_ai_request($1,$2,$3)',[request,'chat',1000])).rows[0].reserve_ai_request;
  assert.equal(first.allowed,true); const secret=first.secret;
  // A fresh connection models another serverless instance sharing the same DB.
  assert.equal((await as(A,'select public.reserve_ai_request($1,$2,$3)',['20000000-0000-4000-8000-000000000002','chat',1000])).rows[0].reserve_ai_request.reason,'busy');
  assert.equal((await as(A,'select public.reserve_ai_request($1,$2,$3)',[request,'chat',1000])).rows[0].reserve_ai_request.reason,'duplicate');
  await as(B,'select public.finish_ai_request($1,$2,$3,$4)',[request,secret,0,true]);
  assert.equal((await db.query('select finished_at is null as pending from public.ai_usage where request_id=$1',[request])).rows[0].pending,true);
  await as(A,'select public.finish_ai_request($1,$2,$3,$4)',[request,secret,100,true]);
  assert.equal((await as(B,'select public.reserve_ai_request($1,$2,$3)',['20000000-0000-4000-8000-000000000003','chat',1000])).rows[0].reserve_ai_request.allowed,true);
  await rejects(null,'select public.reserve_ai_request($1,$2,$3)',['20000000-0000-4000-8000-000000000004','chat',1000]);
  await rejects(A,'select * from public.ai_usage');
});
await check(async()=>{
  assert.equal((await as(B,'select * from public.admin_user_directory')).rows.length,0);
  await db.query("insert into public.admin_users(user_id,role,active) values($1,'admin',true)",[A]);
  const rows=(await as(A,'select id from public.admin_user_directory')).rows;
  assert.ok(rows.some(r=>r.id===B));
  assert.equal((await as(B,'update public.exercises set name=$1 where id=$2',['defaced',EX])).affectedRows,0);
  await as(A,'update public.exercises set name=$1 where id=$2',['Squat',EX]);
  await db.query('delete from public.admin_users where user_id=$1',[A]);
});
await check(async()=>{
  await as(A,'insert into public.workout_sets(session_id,exercise_id,set_number,reps,weight_kg,completed) values($1,$2,1,10,50,true)',[SESSION,EX]);
  await as(A,'select public.complete_workout_session($1)',[SESSION]);
  await as(A,'select public.complete_workout_session($1)',[SESSION]);
  assert.equal((await as(A,'select count(*)::int n from public.exercise_history')).rows[0].n,1);
  assert.equal((await as(B,'select count(*)::int n from public.exercise_history')).rows[0].n,0);
});
// Regression: account deletion used to abort because audit_row_change() wrote
// audit_logs.user_id after auth.users was already gone (FK 23503), rolling the
// whole delete back. A dedicated user keeps the other fixtures intact.
await check(async()=>{
  const C='10000000-0000-4000-8000-00000000000c';
  const CPLAN='10000000-0000-4000-8000-00000000000d';
  await db.exec(`insert into auth.users(id,email) values('${C}','carol@test.invalid');
    insert into public.workout_plans(id,user_id,name) values('${CPLAN}','${C}','Carol plan');
    insert into public.food_diary(id,user_id,entry_date) values('10000000-0000-4000-8000-00000000000e','${C}',current_date);
    insert into public.training_profiles(user_id,questionnaire) values('${C}','{}'::jsonb);`);
  await rejects(null,'select public.delete_own_account()');
  // The RPC takes no target id: it can only ever resolve to auth.uid(), so B
  // has no way to name C's account. C deletes only its own rows.
  const removed=(await as(C,'select public.delete_own_account()')).rows[0].delete_own_account;
  assert.equal(removed,C,'server must confirm the deleted id');
  assert.equal((await db.query('select count(*)::int n from auth.users where id=$1',[C])).rows[0].n,0);
  for(const table of ['workout_plans','food_diary','training_profiles','profiles','user_preferences']){
    const col=table==='profiles'?'id':'user_id';
    assert.equal((await db.query(`select count(*)::int n from public.${table} where ${col}=$1`,[C])).rows[0].n,0,`${table} must cascade`);
  }
  // B and A are untouched by C's deletion.
  assert.equal((await db.query('select count(*)::int n from auth.users where id=$1',[A])).rows[0].n,1);
  assert.equal((await db.query('select count(*)::int n from public.workout_plans where id=$1',[PLAN])).rows[0].n,1);
});
// ─── Comunidade: privacidade por padrão e anti-IDOR ──────────────────────────
const W1='10000000-0000-4000-8000-000000000010';
await db.exec(`insert into public.athlete_profiles(user_id,handle,display_name) values('${A}','alice','Alice');`);

await check(async()=>{
  // Perfil nasce privado: B não vê A mesmo sabendo o id.
  assert.equal((await as(B,'select * from public.athlete_profiles where user_id=$1',[A])).rows.length,0);
  assert.equal((await as(B,'select * from public.athlete_directory where user_id=$1',[A])).rows.length,0);
  await rejects(null,'select * from public.athlete_profiles');
  // B não cria perfil em nome de A.
  await rejects(B,"insert into public.athlete_profiles(user_id,handle,display_name) values($1,'steal','X')",[A]);
});

await check(async()=>{
  // A torna público: agora B vê, mas só as colunas da view.
  await as(A,'update public.athlete_profiles set is_public=true, show_workouts=true where user_id=$1',[A]);
  assert.equal((await as(B,'select * from public.athlete_directory where user_id=$1',[A])).rows.length,1);
  const cols=(await db.query("select column_name from information_schema.columns where table_name='athlete_directory'")).rows.map(r=>r.column_name);
  for(const forbidden of ['email','weight_kg','height_cm','birth_date','phone','is_minor']){
    assert.ok(!cols.includes(forbidden),`view pública não pode expor ${forbidden}`);
  }
  // B não edita o perfil de A.
  assert.equal((await as(B,"update public.athlete_profiles set display_name='hacked' where user_id=$1",[A])).affectedRows,0);
});

await check(async()=>{
  await as(A,"insert into public.shared_workouts(id,user_id,title,snapshot) values($1,$2,'Treino A','{\"days\":[]}'::jsonb)",[W1,A]);
  assert.equal((await as(B,'select id from public.shared_workouts where id=$1',[W1])).rows.length,1);
  // B não edita nem apaga publicação de A, mesmo com o id correto.
  assert.equal((await as(B,"update public.shared_workouts set title='hacked' where id=$1",[W1])).affectedRows,0);
  assert.equal((await as(B,'delete from public.shared_workouts where id=$1',[W1])).affectedRows,0);
  // B não publica em nome de A.
  await rejects(B,"insert into public.shared_workouts(user_id,title,snapshot) values($1,'fake','{}'::jsonb)",[A]);
  await rejects(null,'select * from public.shared_workouts');
});

await check(async()=>{
  // Tornar o perfil privado esconde as publicações imediatamente.
  await as(A,'update public.athlete_profiles set is_public=false where user_id=$1',[A]);
  assert.equal((await as(B,'select id from public.shared_workouts where id=$1',[W1])).rows.length,0);
  assert.equal((await as(A,'select id from public.shared_workouts where id=$1',[W1])).rows.length,1);
  await as(A,'update public.athlete_profiles set is_public=true where user_id=$1',[A]);
});

await check(async()=>{
  // Curtir/comentar é permitido; contadores são do servidor.
  await as(B,'insert into public.workout_likes(workout_id,user_id) values($1,$2)',[W1,B]);
  assert.equal((await as(A,'select like_count from public.shared_workouts where id=$1',[W1])).rows[0].like_count,1);
  // Nem o dono pode inflar os próprios contadores (coluna sem grant de UPDATE).
  await rejects(A,'update public.shared_workouts set like_count=999 where id=$1',[W1]);
  assert.equal((await as(B,"update public.shared_workouts set title='hacked' where id=$1",[W1])).affectedRows,0);
  await as(B,"insert into public.workout_comments(workout_id,user_id,body) values($1,$2,'Bom treino')",[W1,B]);
  assert.equal((await as(A,'select comment_count from public.shared_workouts where id=$1',[W1])).rows[0].comment_count,1);
  // Comentário ofensivo: A não edita o texto de B, mas B pode apagar o seu.
  assert.equal((await as(A,"update public.workout_comments set body='x' where workout_id=$1",[W1])).affectedRows,0);
  // Like em nome de terceiro é recusado.
  await rejects(B,'insert into public.workout_likes(workout_id,user_id) values($1,$2)',[W1,A]);
});

await check(async()=>{
  // Bloqueio corta a visibilidade nos dois sentidos.
  await as(B,'insert into public.athlete_blocks(blocker_id,blocked_id) values($1,$2)',[B,A]);
  assert.equal((await as(B,'select id from public.shared_workouts where id=$1',[W1])).rows.length,0);
  assert.equal((await as(B,'select user_id from public.athlete_directory where user_id=$1',[A])).rows.length,0);
  assert.equal((await as(A,'select id from public.shared_workouts where id=$1',[W1])).rows.length,1);
  await rejects(B,'insert into public.athlete_blocks(blocker_id,blocked_id) values($1,$1)',[B]);
  await as(B,'delete from public.athlete_blocks where blocker_id=$1 and blocked_id=$2',[B,A]);
});

await check(async()=>{
  // Denúncia: só o autor e o admin leem.
  await as(B,"insert into public.content_reports(reporter_id,workout_id,reason) values($1,$2,'spam')",[B,W1]);
  assert.equal((await as(B,'select count(*)::int n from public.content_reports')).rows[0].n,1);
  assert.equal((await as(A,'select count(*)::int n from public.content_reports')).rows[0].n,0);
  await rejects(B,"insert into public.content_reports(reporter_id,workout_id,reason) values($1,$2,'spam')",[A,W1]);
  await rejects(null,'select * from public.content_reports');
});

console.log(`PASS: ${assertions} security scenarios; two isolated users + anon; actual migrations, grants, cross-tenant IDs, public-row writes, admin boundaries, malicious JSON, quotas/replay across separate transactions, account deletion cascade, community privacy and anti-IDOR.`);
await db.close();
