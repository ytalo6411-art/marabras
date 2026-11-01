import { test, expect, type Page } from '@playwright/test';
const userId='10000000-0000-4000-8000-000000000001';
const exerciseId='10000000-0000-4000-8000-000000000002';
const planId='10000000-0000-4000-8000-000000000003';
const sessionId='10000000-0000-4000-8000-000000000004';
const exercise={id:exerciseId,name:'Agachamento livre',slug:'squat',primary_muscle:'quadriceps',secondary_muscles:['glutes'],equipment:['bodyweight'],difficulty:'beginner',instructions:'Pés firmes. Desça com controle.',is_active:true,source:'manual',alternatives:[]};
const item={id:'item',plan_id:planId,exercise_id:exerciseId,position:0,sets:2,reps:'10',weight_kg:0,rest_seconds:90,duration_seconds:null,notes:null,exercise};
async function fixture(page:Page){
 let nutritionProfile:unknown=null;let nutritionPlan:unknown=null;
 await page.addInitScript(({userId})=>{localStorage.setItem('athletix:locale','pt-BR');localStorage.setItem('sb-test-auth-token',JSON.stringify({access_token:'test-only',token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,refresh_token:'test-only',user:{id:userId,aud:'authenticated',role:'authenticated',email:'test@example.invalid',app_metadata:{},user_metadata:{},created_at:new Date().toISOString()}}));},{userId});
 await page.route('https://test.supabase.co/**',async route=>{
  const req=route.request();const url=new URL(req.url());const table=url.pathname.split('/rest/v1/')[1];
  if(url.pathname.includes('/auth/'))return route.fulfill({json:url.pathname.endsWith('settings')?{external:{}}:{access_token:'test-only',token_type:'bearer',expires_in:3600,refresh_token:'test-only',user:{id:userId,aud:'authenticated',role:'authenticated',email:'test@example.invalid',app_metadata:{},user_metadata:{},created_at:new Date().toISOString()}}});
  let body:unknown=[];
  if(table==='nutrition_profiles'&&['POST','PATCH'].includes(req.method())){const v=req.postDataJSON();nutritionProfile=Array.isArray(v)?v[0]:v;body=nutritionProfile;}
  if(table==='nutrition_plans'&&['POST','PATCH'].includes(req.method())){const v=req.postDataJSON();nutritionPlan=Array.isArray(v)?v[0]:v;body=nutritionPlan;}
  if(table==='exercises')body=req.method()==='GET'&&url.searchParams.has('id')?[exercise]:exercise;
  if(table==='workout_plans')body=url.searchParams.has('is_active')?[{id:planId,user_id:userId,name:'Treino A',days_of_week:[1],estimated_minutes:30,is_active:true}]:{id:planId,user_id:userId,name:'Treino A',days_of_week:[1],estimated_minutes:30,is_active:true};
  if(table==='workout_exercises')body=[item];
  if(table==='workout_sessions')body=url.searchParams.has('status')&&req.method()==='GET'&&url.searchParams.has('plan_id')?[]:req.method()==='POST'?{id:sessionId}:({id:sessionId,user_id:userId,plan_id:planId,status:'in_progress',exercise_snapshot:[item],client_state:{},started_at:new Date().toISOString(),total_volume_kg:0});
  if(table==='workout_sets')body=req.method()==='POST'?{id:'set',...req.postDataJSON()}:[];
  if(table==='nutrition_profiles'&&req.method()==='GET')body=nutritionProfile;
  if(table==='nutrition_plans'&&req.method()==='GET')body=nutritionPlan;
  if(table==='food_diary')body=null;
  if(table==='meal_entries')body=[];
  if(table==='food_database')body=[];
  if(req.headers().prefer?.includes('return=representation')&&req.method()==='POST'&&!Array.isArray(body))body=[body];
  return route.fulfill({status:req.method()==='POST'?201:200,json:body,headers:{'content-range':'0-0/1'}});
 });
}
test('login: four languages, persistence and no horizontal overflow',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,360,390,430,768,1024,1440]){
  await page.setViewportSize({width,height:850});await page.goto('/app/login');await expect(page.getByRole('heading',{name:/Entrar na ATHLETIX|Log in to ATHLETIX/})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow at ${width}`).toBe(true);
 }
 await page.getByRole('combobox',{name:'Idioma'}).selectOption('fr');await expect(page.getByRole('button',{name:'Se connecter',exact:true})).toBeVisible();
 await page.reload();await expect(page.getByRole('combobox',{name:'Langue'}).first()).toHaveValue('fr');
 await page.getByRole('combobox').selectOption('es');await expect(page.getByRole('button',{name:'Entrar',exact:true})).toBeVisible();
 await page.getByRole('combobox').selectOption('en');await expect(page.getByRole('button',{name:'Log in',exact:true})).toBeVisible();
 expect(errors).toEqual([]);
});
test('authenticated shell, meal assembly and optional barcode fixture',async({page})=>{
 await fixture(page);await page.goto('/app/nutrition');await expect(page.getByRole('heading',{name:'Coma bem. Sem complicar.'})).toBeVisible();
 await page.getByRole('tab',{name:'Preferências',exact:true}).click();await page.getByLabel('Preferência alimentar').selectOption('vegan');await page.getByRole('button',{name:'Salvar e montar sugestões'}).click();
 await expect(page.getByRole('heading',{name:'Arroz, lentilha e batata-doce'}).first()).toBeVisible();
 await page.getByRole('tab',{name:'Meu diário'}).click();await page.getByRole('button',{name:'Adicionar',exact:true}).first().click();
 await page.getByRole('button',{name:/Banana/}).first().click();await page.getByRole('button',{name:/1 unidade média/}).click();await expect(page.getByLabel('Quantidade em gramas')).toHaveValue('118');
 await page.getByRole('button',{name:'Voltar à busca'}).click();await page.getByText('Código de barras opcional',{exact:true}).click();await expect(page.getByLabel('Código de barras',{exact:true})).toBeVisible();
 for(const width of [320,360,390,430,768,1024,1440]){await page.setViewportSize({width,height:850});const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,els:[...document.querySelectorAll('*')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>({tag:e.tagName,cls:e.className,right:e.getBoundingClientRect().right,width:e.getBoundingClientRect().width})).slice(0,25)}));expect(overflow.scroll,JSON.stringify(overflow)).toBeLessThanOrEqual(width+1);}
});
test('start is not completion; set saves, survives reload, rest pauses',async({page})=>{
 await fixture(page);let completed=false;let savedSet:Record<string,unknown>|null=null;
 await page.route('https://test.supabase.co/rest/v1/rpc/complete_workout_session',async route=>{completed=true;return route.fulfill({json:{id:sessionId,status:'completed',duration_seconds:60,total_volume_kg:0}});});
 await page.route('https://test.supabase.co/rest/v1/workout_sets*',async route=>{if(route.request().method()==='POST'){savedSet=route.request().postDataJSON();return route.fulfill({status:201,json:[{id:'set',...savedSet}]});}return route.fulfill({json:savedSet?[savedSet]:[]});});
 await page.goto('/app/workouts');await page.getByRole('button',{name:'Iniciar',exact:true}).first().click();await expect(page.getByRole('heading',{name:'Agachamento livre'})).toBeVisible();expect(completed).toBe(false);await expect(page.getByRole('button',{name:'Encerrar e salvar'})).toBeDisabled();
 await page.getByLabel('Repetições da série 1',{exact:true}).fill('12');await page.getByRole('button',{name:'Concluir série 1',exact:true}).click();await expect(page.getByRole('button',{name:'Desmarcar série 1'})).toBeVisible();expect(savedSet).toMatchObject({reps:12,completed:true});
 await page.getByRole('button',{name:'Pausar',exact:true}).click();const time=await page.getByRole('timer').textContent();await page.waitForTimeout(1100);expect(await page.getByRole('timer').textContent()).toBe(time);
 await page.reload();await expect(page.getByLabel('Repetições da série 1',{exact:true})).toHaveValue('12');await expect(page.getByRole('button',{name:'Desmarcar série 1'})).toBeVisible();expect(completed).toBe(false);
 await page.getByRole('button',{name:'Encerrar e salvar'}).click();await expect(page.getByRole('heading',{name:'Treino concluído!'})).toBeVisible();expect(completed).toBe(true);
});
