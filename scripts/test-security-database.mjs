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

// ─── Salvar treinos: bookmark privado, nunca um oráculo de privacidade ────────
await check(async()=>{
  await as(B,'insert into public.workout_saves(workout_id,user_id) values($1,$2)',[W1,B]);
  // Só o próprio usuário vê o que salvou: o autor não descobre quem salvou.
  assert.equal((await as(B,'select workout_id from public.workout_saves')).rows.length,1);
  assert.equal((await as(A,'select workout_id from public.workout_saves')).rows.length,0);
  await rejects(null,'select * from public.workout_saves');
  // Salvar em nome de terceiro é recusado.
  await rejects(B,'insert into public.workout_saves(workout_id,user_id) values($1,$2)',[W1,A]);
  // O contador é do servidor: nem o dono do treino infla.
  assert.equal((await as(A,'select save_count from public.shared_workouts where id=$1',[W1])).rows[0].save_count,1);
  await rejects(A,'update public.shared_workouts set save_count=999 where id=$1',[W1]);
  // B não apaga o save de A.
  await as(A,'insert into public.workout_saves(workout_id,user_id) values($1,$2)',[W1,A]);
  assert.equal((await as(B,'delete from public.workout_saves where user_id=$1',[A])).affectedRows,0);
});

await check(async()=>{
  // Não é possível salvar treino que a RLS de leitura esconde: perfil privado.
  await as(A,'update public.athlete_profiles set is_public=false where user_id=$1',[A]);
  await rejects(B,'insert into public.workout_saves(workout_id,user_id) values($1,$2)',[W1,B]);
  await as(A,'update public.athlete_profiles set is_public=true where user_id=$1',[A]);
  // Bloqueio também impede salvar.
  await as(B,'insert into public.athlete_blocks(blocker_id,blocked_id) values($1,$2)',[B,A]);
  await rejects(B,'insert into public.workout_saves(workout_id,user_id) values($1,$2)',[W1,B]);
  await as(B,'delete from public.athlete_blocks where blocker_id=$1 and blocked_id=$2',[B,A]);
});

// ─── Privacidade por tipo tem efeito no servidor, não só na UI ────────────────
await check(async()=>{
  // Desligar "treinos" esconde as publicações mesmo com perfil público.
  await as(A,'update public.athlete_profiles set show_workouts=false where user_id=$1',[A]);
  assert.equal((await as(B,'select id from public.shared_workouts where id=$1',[W1])).rows.length,0);
  assert.equal((await as(A,'select id from public.shared_workouts where id=$1',[W1])).rows.length,1);
  // E o servidor recusa nova publicação, não apenas o botão da interface.
  await rejects(A,"insert into public.shared_workouts(user_id,title,snapshot) values($1,'sem permissão','{\"days\":[]}'::jsonb)",[A]);
  await as(A,'update public.athlete_profiles set show_workouts=true where user_id=$1',[A]);
  assert.equal((await as(B,'select id from public.shared_workouts where id=$1',[W1])).rows.length,1);
  // Perfil privado também bloqueia publicação por fora da UI.
  await as(A,'update public.athlete_profiles set is_public=false where user_id=$1',[A]);
  await rejects(A,"insert into public.shared_workouts(user_id,title,snapshot) values($1,'privado','{\"days\":[]}'::jsonb)",[A]);
  await as(A,'update public.athlete_profiles set is_public=true where user_id=$1',[A]);
});

// ─── Progresso público: opt-in e somente agregados ───────────────────────────
await check(async()=>{
  // Sem opt-in explícito, nada aparece — nem para quem sabe o id.
  assert.equal((await as(B,'select * from public.athlete_public_progress where user_id=$1',[A])).rows.length,0);
  await as(A,'update public.athlete_profiles set show_progress=true where user_id=$1',[A]);
  const rows=(await as(B,'select * from public.athlete_public_progress where user_id=$1',[A])).rows;
  assert.equal(rows.length,1);
  assert.ok(rows[0].sessions_completed>=1,'contagem agregada deve refletir sessões concluídas');
  // Nenhuma coluna sensível pode existir na view pública.
  const cols=(await db.query("select column_name from information_schema.columns where table_name='athlete_public_progress'")).rows.map(r=>r.column_name);
  for(const forbidden of ['weight_kg','total_volume_kg','notes','name','started_at','completed_at','plan_id','email','birth_date']){
    assert.ok(!cols.includes(forbidden),`progresso público não pode expor ${forbidden}`);
  }
  // Desligar remove na hora; bloqueio corta nos dois sentidos.
  await as(A,'update public.athlete_profiles set show_progress=false where user_id=$1',[A]);
  assert.equal((await as(B,'select * from public.athlete_public_progress where user_id=$1',[A])).rows.length,0);
  await as(A,'update public.athlete_profiles set show_progress=true where user_id=$1',[A]);
  await as(B,'insert into public.athlete_blocks(blocker_id,blocked_id) values($1,$2)',[B,A]);
  assert.equal((await as(B,'select * from public.athlete_public_progress where user_id=$1',[A])).rows.length,0);
  await as(B,'delete from public.athlete_blocks where blocker_id=$1 and blocked_id=$2',[B,A]);
  await rejects(null,'select * from public.athlete_public_progress');
});

// ─── Moderação: fila e resolução são exclusivas do admin ─────────────────────
await check(async()=>{
  // Quem denunciou não lê a fila nem muda o status da própria denúncia.
  assert.equal((await as(B,'select * from public.admin_content_reports')).rows.length,0);
  await rejects(B,"update public.content_reports set status='dismissed' where reporter_id=$1",[B]);
  await rejects(B,"select public.resolve_content_report(id,'dismissed',false) from public.content_reports");
  await rejects(null,'select * from public.admin_content_reports');

  await db.query("insert into public.admin_users(user_id,role,active) values($1,'admin',true)",[A]);
  const queue=(await as(A,'select * from public.admin_content_reports')).rows;
  assert.ok(queue.length>=1,'admin deve ver a denúncia pendente');
  assert.ok(queue.some(r=>r.workout_id===W1));

  // Decisão inválida é recusada antes de gravar.
  await rejects(A,'select public.resolve_content_report($1,$2,false)',[queue[0].id,'banana']);
  const resolved=(await as(A,'select public.resolve_content_report($1,$2,$3)',[queue[0].id,'reviewed',true])).rows[0].resolve_content_report;
  assert.equal(resolved,queue[0].id,'servidor confirma o id resolvido');
  // Conteúdo derrubado fica invisível para terceiros, mas o autor ainda vê.
  assert.equal((await as(B,'select id from public.shared_workouts where id=$1',[W1])).rows.length,0);
  assert.equal((await as(A,'select id from public.shared_workouts where id=$1',[W1])).rows.length,1);
  // A decisão deixa trilha de auditoria.
  const audit=(await db.query("select metadata from public.audit_logs where action='resolve' and row_id=$1",[queue[0].id])).rows;
  assert.equal(audit.length,1);
  assert.equal(audit[0].metadata.decision,'reviewed');

  await db.query('delete from public.admin_users where user_id=$1',[A]);
  // Sem o papel, a fila volta a ficar invisível.
  assert.equal((await as(A,'select * from public.admin_content_reports')).rows.length,0);
  await as(A,'update public.shared_workouts set is_public=true where id=$1',[W1]);
});


/* ─── Regressão: abertura de sessão de treino (bug real de produção) ──────────
 * O cliente inseria a sessão sem `name`. O Postgres recusava com SQLSTATE 23502
 * e a interface respondia "verifique os exercícios e a migração V10" — a V10
 * estava aplicada; o campo obrigatório é que faltava. A constraint NÃO foi
 * relaxada para "fazer funcionar": estes cenários garantem que ela continua
 * de pé e que o payload correto passa.
 */
const PLAN2='10000000-0000-4000-8000-000000000020';
const SESS2='10000000-0000-4000-8000-000000000021';
await db.exec(`insert into public.workout_plans(id,user_id,name) values('${PLAN2}','${A}','Treino B');`);

// 1) Sem `name` o banco continua recusando: a validação não foi desativada.
await check(async()=>{
  let failed=false;
  try{
    await as(A,"insert into public.workout_sessions(user_id,plan_id,exercise_snapshot,client_state) values($1,$2,'[]'::jsonb,'{}'::jsonb)",[A,PLAN2]);
  }catch(e){
    failed=true;
    assert.match(e.message,/23502|null value|not-null/i,'a falha precisa ser de NOT NULL, não de permissão');
  }
  assert.ok(failed,'inserir sessão sem name deve falhar');
});

// 2) Payload corrigido (name + status + started_at) é aceito e nasce ativo.
await check(async()=>{
  await as(A,`insert into public.workout_sessions(id,user_id,plan_id,name,status,started_at,exercise_snapshot,client_state)
    values($1,$2,$3,$4,'in_progress',now(),'[]'::jsonb,'{"current":0,"restUntil":null,"paused":false,"remaining":90}'::jsonb)`,
    [SESS2,A,PLAN2,'Treino B']);
  const row=(await as(A,'select status::text as status, started_at, name from public.workout_sessions where id=$1',[SESS2])).rows[0];
  assert.equal(row.status,'in_progress','sessão precisa nascer ativa, não no default planned');
  assert.ok(row.started_at,'started_at é necessário para a duração não fechar em 0');
  assert.equal(row.name,'Treino B');
});

// 3) Nome em branco continua proibido pelo CHECK.
await check(async()=>{
  await rejects(A,`insert into public.workout_sessions(user_id,plan_id,name,status) values($1,$2,'   ','in_progress')`,[A,PLAN2]);
});

// 4) Uma única sessão aberta por plano: abertura concorrente não duplica treino.
await check(async()=>{
  let code=null;
  try{
    await as(A,`insert into public.workout_sessions(user_id,plan_id,name,status,started_at) values($1,$2,'Duplicada','in_progress',now())`,[A,PLAN2]);
  }catch(e){code=e.code??(/23505|duplicate key|unique/i.test(e.message)?'23505':null);}
  assert.equal(code,'23505','segunda sessão aberta para o mesmo plano deve violar o índice único');
  assert.equal((await as(A,"select id from public.workout_sessions where plan_id=$1 and status='in_progress'",[PLAN2])).rows.length,1);
});

// 5) Outro usuário não abre sessão no plano alheio (anti-IDOR na escrita).
await check(async()=>{
  const before=(await db.query('select count(*)::int as n from public.workout_sessions')).rows[0].n;
  try{
    await as(B,`insert into public.workout_sessions(user_id,plan_id,name,status) values($1,$2,'Roubo','in_progress')`,[B,PLAN2]);
  }catch{/* trigger de ownership ou RLS pode recusar de formas diferentes */}
  const after=(await db.query('select count(*)::int as n from public.workout_sessions')).rows[0].n;
  assert.equal(after,before,'B não pode criar sessão no plano de A');
});

// 6) Fluxo completo: série salva -> concluir -> histórico e recorde gerados.
await check(async()=>{
  await as(A,`insert into public.workout_sets(session_id,exercise_id,set_number,reps,weight_kg,completed)
    values($1,$2,1,10,50,true)`,[SESS2,EX]);
  const done=(await as(A,'select public.complete_workout_session($1) as r',[SESS2])).rows[0].r;
  assert.equal(done.status,'completed');
  assert.equal(Number(done.total_volume_kg),500,'volume = reps x carga');
  assert.ok(done.duration_seconds!==null,'duração calculada a partir de started_at');
  const hist=(await as(A,'select best_weight_kg,best_reps from public.exercise_history where session_id=$1',[SESS2])).rows;
  assert.equal(hist.length,1,'histórico do exercício precisa ser gravado na mesma transação');
  assert.equal(Number(hist[0].best_weight_kg),50);
  const pr=(await as(A,"select value from public.personal_records where exercise_id=$1 and record_type='weight'",[EX])).rows;
  assert.equal(Number(pr[0].value),50,'recorde pessoal registrado');
  // Repetir a conclusão é idempotente, não duplica histórico.
  await as(A,'select public.complete_workout_session($1)',[SESS2]);
  assert.equal((await as(A,'select id from public.exercise_history where session_id=$1',[SESS2])).rows.length,1);
});

// 7) Concluir sem nenhuma série é recusado (não existe treino vazio no histórico).
await check(async()=>{
  const empty='10000000-0000-4000-8000-000000000022';
  await as(A,`insert into public.workout_sessions(id,user_id,name,status,started_at) values($1,$2,'Vazia','in_progress',now())`,[empty,A]);
  await rejects(A,'select public.complete_workout_session($1)',[empty]);
});

// 8) B não vê nem conclui a sessão de A.
await check(async()=>{
  assert.equal((await as(B,'select id from public.workout_sessions where id=$1',[SESS2])).rows.length,0);
  await rejects(B,'select public.complete_workout_session($1)',[SESS2]);
});

console.log(`PASS: ${assertions} security scenarios; two isolated users + anon; actual migrations, grants, cross-tenant IDs, public-row writes, admin boundaries, malicious JSON, quotas/replay across separate transactions, account deletion cascade, community privacy, saves, per-type privacy, public progress aggregates, moderation queue and anti-IDOR, session start constraints and completion lifecycle.`);
await db.close();
