import { test, expect, type Page } from '@playwright/test';
const userId='10000000-0000-4000-8000-000000000001';
const exerciseId='10000000-0000-4000-8000-000000000002';
const planId='10000000-0000-4000-8000-000000000003';
const sessionId='10000000-0000-4000-8000-000000000004';
const exercise={id:exerciseId,name:'Agachamento livre',slug:'squat',primary_muscle:'quadriceps',secondary_muscles:['glutes'],equipment:['bodyweight'],difficulty:'beginner',instructions:'Pés firmes. Desça com controle.',is_active:true,source:'manual',alternatives:[]};
const item={id:'item',plan_id:planId,exercise_id:exerciseId,position:0,sets:2,reps:'10',weight_kg:0,rest_seconds:90,duration_seconds:null,notes:null,exercise};
async function fixture(page:Page){
 let nutritionProfile:unknown=null;let nutritionPlan:unknown=null;let savesState=false;
 await page.addInitScript(({userId})=>{localStorage.setItem('athletix:locale','pt-BR');localStorage.setItem('sb-test-auth-token',JSON.stringify({access_token:'test-only',token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,refresh_token:'test-only',user:{id:userId,aud:'authenticated',role:'authenticated',email:'test@example.invalid',app_metadata:{},user_metadata:{},created_at:new Date().toISOString()}}));},{userId});
 await page.route('https://test.supabase.co/**',async route=>{
  const req=route.request();const url=new URL(req.url());const table=url.pathname.split('/rest/v1/')[1];
  if(url.pathname.includes('/auth/'))return route.fulfill({json:url.pathname.endsWith('settings')?{external:{}}:{access_token:'test-only',token_type:'bearer',expires_in:3600,refresh_token:'test-only',user:{id:userId,aud:'authenticated',role:'authenticated',email:'test@example.invalid',app_metadata:{},user_metadata:{},created_at:new Date().toISOString()}}});
  if(url.pathname.includes('/rest/v1/rpc/resolve_content_report'))return route.fulfill({json:req.postDataJSON().p_report_id});
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
  if(table==='athlete_profiles')body=req.method()==='GET'?[]:{user_id:userId,...(req.postDataJSON()??{})};
  if(table==='athlete_directory')body=[{user_id:'other-user',handle:'marina',display_name:'Marina Souza',bio:'Corredora',goals:'10 km',avatar_url:null,show_workouts:true,show_progress:false}];
  if(table==='shared_workouts')body=[{id:'shared-1',user_id:'other-user',title:'Treino de força — iniciante',description:'Rotina de 3 dias',snapshot:{days:[{label:'A',name:'Corpo inteiro',exercises:[{name:'Agachamento livre',slug:'squat',sets:3,reps:'8–12',restSeconds:90,primaryMuscle:'quadriceps'}]}]},is_public:true,like_count:2,comment_count:1,created_at:new Date().toISOString()}];
  if(table==='workout_likes')body=[];
  if(table==='workout_saves'&&req.method()==='POST')savesState=true;
  if(table==='workout_saves'&&req.method()==='DELETE')savesState=false;
  if(table==='workout_saves')body=req.method()==='POST'?[{workout_id:'shared-1',user_id:userId}]:req.method()==='DELETE'?[]:(savesState?[{workout_id:'shared-1',created_at:new Date().toISOString()}]:[]);
  if(table==='athlete_public_progress')body=[{user_id:'other-user',sessions_completed:12,sessions_last_30d:4,athlete_since:'2026-01-01T00:00:00Z'}];
  if(table==='admin_content_reports')body=[{id:'r1',reason:'spam',details:'Link de venda',status:'open',created_at:new Date().toISOString(),workout_id:'shared-1',reported_user_id:null,workout_title:'Treino de força — iniciante',workout_is_public:true,workout_author_id:'other-user',reporter_handle:'marina',reported_handle:'marina'}];
  if(table==='workout_comments')body=[{id:'c1',user_id:'other-user',body:'Boa rotina!',created_at:new Date().toISOString()}];
  if(table==='athlete_blocks')body=[];
  if(table==='content_reports')body=req.method()==='POST'?{id:'r1'}:[];
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

test('tema: claro, escuro e sistema aplicam em toda a interface, sem flash', async ({ page }) => {
  await fixture(page);
  await page.goto('/app/login');

  // Login é rota pública: precisa obedecer ao tema como qualquer tela.
  await page.evaluate(() => localStorage.setItem('athletix-theme', 'light'));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.evaluate(() => localStorage.setItem('athletix-theme', 'dark'));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  // "system" segue o dispositivo e reage à mudança em tempo real.
  await page.evaluate(() => localStorage.setItem('athletix-theme', 'system'));
  await page.emulateMedia({ colorScheme: 'light' });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  // O tema também vale dentro da área autenticada.
  await page.evaluate(() => localStorage.setItem('athletix-theme', 'light'));
  await page.goto('/app');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('card do plano mostra os exercícios reais, não só o título', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await fixture(page);
  await page.goto('/app/workouts');

  // Bug corrigido: o dia aparecia sem nenhum exercício listado.
  await expect(page.getByRole('link', { name: /Agachamento livre/ }).first()).toBeVisible();
  await expect(page.getByText('2 × 10').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('catálogo e telas principais não têm overflow de 320 a 1440', async ({ page }) => {
  await fixture(page);
  for (const width of [320, 360, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/app', '/app/workouts', '/app/nutrition', '/app/settings']) {
      await page.goto(route);
      await page.waitForTimeout(120);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `overflow em ${route} @ ${width}px`).toBeLessThanOrEqual(1);
    }
  }
});

test('comunidade: feed, detalhe do treino, comentário e denúncia', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await fixture(page);

  await page.goto('/app/community');
  await expect(page.getByRole('heading', { name: 'Comunidade' })).toBeVisible();
  await expect(page.getByText('Treino de força — iniciante')).toBeVisible();

  // Abre a publicação e vê os exercícios reais do snapshot.
  await page.getByRole('link', { name: /Ver treino/ }).first().click();
  await expect(page.getByRole('link', { name: /Agachamento livre/ })).toBeVisible();
  await expect(page.getByText('3 × 8–12 · descanso 90s')).toBeVisible();
  await expect(page.getByText('Boa rotina!')).toBeVisible();

  // Denunciar abre modal com motivo e envio real.
  await page.getByRole('button', { name: 'Denunciar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Denunciar publicação' })).toBeVisible();
  await page.getByLabel('Motivo').selectOption('spam');
  await page.getByRole('button', { name: 'Enviar denúncia' }).click();
  await expect(page.getByText('Denúncia enviada. Nossa equipe vai analisar.')).toBeVisible();

  expect(errors).toEqual([]);
});

test('comunidade: busca de atletas e navegação inferior com 5 destinos', async ({ page }) => {
  await fixture(page);
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/app/community');

  await page.getByRole('tab', { name: 'Atletas' }).click();
  await page.getByLabel('Buscar atletas').fill('marina');
  await expect(page.getByText('Marina Souza')).toBeVisible();

  // Barra inferior: 5 destinos, sem overflow e com alvo de toque adequado.
  const nav = page.getByRole('navigation', { name: 'Navegação principal' }).last();
  await expect(nav).toBeVisible();
  const items = nav.getByRole('link');
  await expect(items).toHaveCount(5);
  for (let i = 0; i < 5; i++) {
    const box = await items.nth(i).boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
});

test('comunidade: salvar treino, aba Salvos e perfil público do atleta', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await fixture(page);
  await page.goto('/app/community');

  // Salvar é uma ação real: o botão muda de estado após confirmação do servidor.
  const save = page.getByRole('button', { name: 'Salvar treino' });
  await expect(save).toBeVisible();
  await save.click();
  await expect(page.getByText('Treino salvo')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remover dos salvos' })).toHaveAttribute('aria-pressed', 'true');

  // A aba Salvos lista o treino guardado.
  await page.getByRole('tab', { name: 'Salvos' }).click();
  await expect(page.getByText('Treino de força — iniciante')).toBeVisible();

  // Remover dos salvos esvazia a lista com estado vazio explicativo.
  await page.getByRole('button', { name: 'Remover dos salvos' }).click();
  await expect(page.getByRole('heading', { name: 'Nenhum treino salvo' })).toBeVisible();

  // O resultado de busca leva a um perfil público de verdade.
  await page.getByRole('tab', { name: 'Atletas' }).click();
  await page.getByLabel('Buscar atletas').fill('marina');
  await page.getByRole('link', { name: /Marina Souza/ }).click();
  await expect(page.getByRole('heading', { name: 'Marina Souza' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Treinos publicados' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Denunciar atleta' })).toBeVisible();

  expect(errors).toEqual([]);
});

test('comunidade: progresso público só aparece com opt-in e mostra apenas contagens', async ({ page }) => {
  await fixture(page);
  // O atleta da fixture tem show_progress:false — nada de consistência deve aparecer.
  await page.goto('/app/community/atleta/marina');
  await expect(page.getByRole('heading', { name: 'Marina Souza' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Consistência' })).toHaveCount(0);

  // Com opt-in, aparecem só as contagens agregadas, nunca carga ou medidas.
  await page.route('https://test.supabase.co/rest/v1/athlete_directory**', async (route) => {
    await route.fulfill({ json: [{ user_id: 'other-user', handle: 'marina', display_name: 'Marina Souza', bio: 'Corredora', goals: '10 km', avatar_url: null, show_workouts: true, show_progress: true }] });
  });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Consistência' })).toBeVisible();
  await expect(page.getByText('Treinos concluídos')).toBeVisible();
  await expect(page.getByText('12', { exact: true })).toBeVisible();
  await expect(page.getByText(/Cargas, peso, medidas e dieta não são compartilhados/)).toBeVisible();
});

test('moderação: admin vê a fila e resolve com confirmação do servidor', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await fixture(page);
  // O papel de admin vem do banco; a fixture responde como admin ativo.
  await page.route('https://test.supabase.co/rest/v1/admin_users**', async (route) => {
    await route.fulfill({ json: { user_id: userId, role: 'admin', active: true } });
  });
  await page.goto('/app/admin');
  await page.getByRole('button', { name: 'Denúncias' }).click();

  await expect(page.getByText('Link de venda')).toBeVisible();
  await expect(page.getByText('Spam ou propaganda')).toBeVisible();

  await page.getByRole('button', { name: 'Aceitar e ocultar treino' }).click();
  await expect(page.getByText('Denúncia aceita e conteúdo ocultado')).toBeVisible();
  // Só sai da fila depois da confirmação: a fila fica vazia com estado explicativo.
  await expect(page.getByRole('heading', { name: 'Nenhuma denúncia pendente' })).toBeVisible();

  expect(errors).toEqual([]);
});
