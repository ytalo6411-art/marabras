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
  if(table==='workout_sessions'){
   if(req.method()==='POST'){
    // O fixture reproduz as constraints reais de public.workout_sessions.
    // Antes ele devolvia {id} para qualquer payload, e foi assim que 12 testes
    // de navegador passaram enquanto produção quebrava com SQLSTATE 23502.
    const payload=req.postDataJSON()??{};
    const violations:string[]=[];
    if(typeof payload.name!=='string'||payload.name.trim().length===0)violations.push('23502: null value in column "name" violates not-null constraint');
    if(payload.status!=='in_progress')violations.push('session must start in_progress');
    if(typeof payload.started_at!=='string'||Number.isNaN(Date.parse(payload.started_at)))violations.push('started_at missing');
    if(payload.user_id!==userId)violations.push('42501: row-level security');
    if(violations.length)return route.fulfill({status:400,json:{code:'23502',message:violations.join('; ')}});
    body={id:sessionId,...payload};
   } else body=url.searchParams.has('status')&&url.searchParams.has('plan_id')?[]:({id:sessionId,user_id:userId,plan_id:planId,name:'Treino A',status:'in_progress',exercise_snapshot:[item],client_state:{},started_at:new Date().toISOString(),total_volume_kg:0});
  }
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
  // São 28 navegações (7 larguras x 4 rotas). O padrão de 30 s ficava no limite e
  // gerava falha intermitente sem overflow real; o orçamento reflete o trabalho.
  test.setTimeout(90_000);
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

test('programa: reordenar dias grava no servidor e sobrevive ao reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await fixture(page);

  // Programa ABC de verdade: três dias com dias da semana distintos.
  const dayRows = [
    { id: 'day-a', user_id: userId, name: 'A · Empurrar', day_label: 'A', days_of_week: [1] },
    { id: 'day-b', user_id: userId, name: 'B · Puxar', day_label: 'B', days_of_week: [3] },
    { id: 'day-c', user_id: userId, name: 'C · Pernas', day_label: 'C', days_of_week: [5] },
  ].map((row) => ({
    ...row, program_id: 'prog-abc', program_name: 'Programa ABC',
    estimated_minutes: 45, is_active: true, generated_by: 'rules', focus: 'hypertrophy',
  }));

  const patches: { id: string; days: number[] }[] = [];
  await page.route('https://test.supabase.co/rest/v1/workout_plans**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (req.method() === 'PATCH') {
      const id = url.searchParams.get('id')?.replace('eq.', '') ?? '';
      const days = (req.postDataJSON() as { days_of_week: number[] }).days_of_week;
      patches.push({ id, days });
      const row = dayRows.find((r) => r.id === id);
      if (row) row.days_of_week = days;
      return route.fulfill({ status: 200, json: [] });
    }
    // A lista é ordenada pelo servidor; aqui devolvemos na ordem salva.
    const sorted = [...dayRows].sort((a, b) => a.days_of_week[0] - b.days_of_week[0]);
    return route.fulfill({ status: 200, json: sorted, headers: { 'content-range': '0-2/3' } });
  });

  await page.goto('/app/workouts');
  await page.getByRole('button', { name: 'Reordenar dias' }).click();

  // Ordem inicial: A, B, C. Mover B para cima deve trocá-lo com A.
  const labels = page.locator('.plan-day-slot__controls .truncate');
  await expect(labels.nth(0)).toContainText('A');
  await expect(labels.nth(1)).toContainText('B');

  await page.getByRole('button', { name: 'Mover B para cima' }).click();
  await expect(page.getByText('Ordem dos dias salva')).toBeVisible();

  // Foram gravados os dois slots que mudaram — não a lista inteira.
  expect(patches).toEqual([
    { id: 'day-b', days: [1] },
    { id: 'day-a', days: [3] },
  ]);

  // Depois de recarregar, a ordem vem do banco: B antes de A.
  await page.reload();
  await page.getByRole('button', { name: 'Reordenar dias' }).click();
  await expect(labels.nth(0)).toContainText('B');
  await expect(labels.nth(1)).toContainText('A');

  // Os extremos não oferecem movimento impossível.
  await expect(page.getByRole('button', { name: 'Mover B para cima' })).toBeDisabled();

  expect(errors).toEqual([]);
});

test('questionário gera prévia, não salva antes de confirmar e persiste ao confirmar', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  // Catálogo próprio: o fixture padrão tem 1 exercício, insuficiente para um
  // programa semanal. Todos bodyweight/beginner para casar com o perfil abaixo.
  const muscles = ['quadriceps', 'pectoralis_major', 'lats', 'glutes', 'rectus_abdominis', 'deltoids', 'hamstrings', 'biceps'];
  const names = ['Agachamento livre', 'Flexão de braço', 'Remada invertida', 'Ponte de glúteos', 'Prancha', 'Elevação lateral', 'Avanço', 'Rosca direta'];
  const catalog = names.map((name, i) => ({
    ...exercise,
    id: `20000000-0000-4000-8000-0000000000${String(i + 10).padStart(2, '0')}`,
    slug: `cat-${i}`,
    name,
    primary_muscle: muscles[i],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  }));

  let profileSaved = false;
  const planInserts: Record<string, unknown>[] = [];
  const exerciseInserts: unknown[] = [];

  await fixture(page);
  await page.route('https://test.supabase.co/rest/v1/exercises*', (route) =>
    route.fulfill({ json: catalog, headers: { 'content-range': `0-${catalog.length - 1}/${catalog.length}` } }));
  await page.route('https://test.supabase.co/rest/v1/training_profiles*', async (route) => {
    if (['POST', 'PATCH'].includes(route.request().method())) profileSaved = true;
    return route.fulfill({ status: route.request().method() === 'GET' ? 200 : 201, json: [] });
  });
  await page.route('https://test.supabase.co/rest/v1/exercise_history*', (route) => route.fulfill({ json: [] }));
  await page.route('https://test.supabase.co/rest/v1/workout_plans*', async (route) => {
    if (route.request().method() === 'POST') {
      const payload = route.request().postDataJSON();
      planInserts.push(payload);
      return route.fulfill({ status: 201, json: [{ id: `30000000-0000-4000-8000-0000000000${String(planInserts.length).padStart(2, '0')}`, user_id: userId, ...payload }] });
    }
    return route.fulfill({ json: [] });
  });
  await page.route('https://test.supabase.co/rest/v1/workout_exercises*', async (route) => {
    if (route.request().method() === 'POST') exerciseInserts.push(route.request().postDataJSON());
    return route.fulfill({ status: 201, json: [] });
  });

  await page.goto('/app/onboarding?restart=1');

  // Etapa 1 — experiência.
  await page.getByRole('button', { name: /Nunca treinei/ }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Etapa 2 — objetivo.
  await page.getByRole('button', { name: /Ganhar massa muscular/ }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Etapa 3 — casa sem equipamento (não exige marcar equipamento).
  await page.getByRole('button', { name: /Casa sem equipamentos/ }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Etapas 4, 5 e 6 — defaults já válidos.
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Etapa 7 — gerar.
  await page.getByRole('button', { name: 'Gerar plano', exact: true }).click();

  // A prévia aparece e NADA foi gravado em workout_plans ainda.
  await expect(page.getByRole('heading', { name: 'Seu plano está pronto' })).toBeVisible();
  await expect(page.getByText('PRÉVIA DO SEU PLANO')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Salvar este plano' })).toBeVisible();
  expect(profileSaved).toBe(true);
  expect(planInserts).toHaveLength(0);

  // A prévia mostra exercício real com série/reps, não só o título do dia.
  await expect(page.getByText(/Agachamento livre|Flexão de braço|Prancha/).first()).toBeVisible();
  await expect(page.getByText(/^\d+ × /).first()).toBeVisible();

  // Confirmar grava o programa e seus exercícios.
  await page.getByRole('button', { name: 'Salvar este plano' }).click();
  // O plano é inserido antes dos exercícios: esperar só o plano criava corrida.
  await expect.poll(() => planInserts.length).toBeGreaterThan(0);
  await expect.poll(() => exerciseInserts.length).toBeGreaterThan(0);
  await expect(page).toHaveURL(/\/app\/workouts/);

  expect(errors).toEqual([]);
});
