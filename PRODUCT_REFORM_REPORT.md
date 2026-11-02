# ATHLETIX — Reformulação de produto: relatório

Rodada 1: branch `arena/3d7cd59a-marabras` · PR #7 (merged em `595ec9d`)
Rodada 2: branch `arena/694978dc-marabras` · 2026-11-02 — fecha as lacunas listadas na seção 8 anterior

Trabalho feito **no produto existente**, sem reescrever a stack (React 18 + TS +
Vite + Supabase + Zustand + PWA). Cada bug crítico foi **reproduzido antes** de
ser corrigido. Onde falta configuração externa, isso está dito explicitamente —
nada foi simulado.

---

## 1. Causas raiz encontradas e corrigidas

### 1.1 Exclusão de conta nunca funcionava — **crítico, corrigido e verificado ao vivo**

Reprodução no banco real, antes de mudar código:

```
ERROR 23503: insert or update on table "audit_logs" violates foreign key
constraint "audit_logs_user_id_fkey"
DETAIL: Key (user_id)=(...) is not present in table "users".
```

`delete_own_account()` apagava `auth.users`. O `ON DELETE CASCADE` removia
`workout_plans`, `food_diary` etc., disparando `audit_row_change()`, que inseria
em `audit_logs` com `user_id = auth.uid()` — mas o usuário já não existia. A FK
estourava e **a transação inteira era revertida**. A UI ainda mostrava erro
genérico, sem dizer que nada tinha sido removido.

Correção:
- `audit_row_change()` resolve o autor para `NULL` quando o usuário já foi
  removido, preservando a trilha sem abortar a exclusão.
- A RPC passou a **retornar o id removido**; o cliente só declara sucesso quando
  o servidor devolve o próprio id.
- Reautenticação com senha para contas e-mail/senha; arquivos de avatar removidos
  pela **Storage API** (DELETE direto em `storage.objects` é bloqueado por
  `storage.protect_delete()` — descoberto ao testar).
- Diálogo próprio com confirmação digitada, senha, loading e erro; não fecha em
  falha.

Verificado ao vivo em transação com `ROLLBACK` (nenhum dado real tocado):
`deleted_id` retornado corretamente.

### 1.2 O plano parecia "sem exercícios" — **corrigido**

O motor gerava e gravava os itens, mas o `PlanDayCard` mostrava **apenas título e
botões**. O usuário gerava, via o card e não via treino — parecia falha de
geração. Agora o card lista os exercícios reais (nome, séries × reps, link para o
detalhe), com estados de carregando/erro/vazio.

### 1.3 Taxonomia classificado exercícios errado — **corrigido**

Executando o motor contra o catálogo real de 317 exercícios:

| Exercício | Músculo | Antes (errado) | Agora |
|---|---|---|---|
| Bench Dips | tríceps | `push_horizontal` | `elbow_extension` |
| Bench Pull-Up | dorsais | `push_horizontal` | `pull_vertical` |
| Bench Crunch | reto abdominal | `push_horizontal` | `core` |
| Band Prone Leg Curl | posterior | `elbow_flexion` | `hinge` |
| Calf Stretch with Rope | panturrilha | `calves` | `mobility` |

As regras genéricas `bench` e `curl` casavam antes do movimento real. Reordenei
por especificidade. Isso corrigia exercícios errados nos dias e slots vazios.
12 casos viraram teste de regressão.

### 1.4 Tema "Sistema" não fazia nada — **corrigido**

`AppShell` só conhecia `light|dark` e o tema só existia dentro da área logada —
login e recuperação eram sempre escuros. Criado `ThemeProvider` global (montado
fora das rotas) + `public/theme-init.js` que resolve o tema **antes do primeiro
paint**. É arquivo externo de propósito: `script-src 'self'` já o autoriza, sem
precisar de hash na CSP a cada edição. "Sistema" agora acompanha o dispositivo em
tempo real.

### 1.5 Google OAuth — **código pronto; falta configuração externa**

O provedor está `external_google_enabled: false` no Supabase. Não inventei
credenciais. Implementado:
- Retorno do OAuth tratado: cancelamento e erros viram mensagem clara em
  português, lidos da query **e** do fragmento, sem expor a descrição crua do
  provedor, e removidos da URL para não reaparecer em reload.
- `redirectTo` usa a origem atual (preview volta para preview).
- **`docs/GOOGLE_OAUTH_SETUP.md`** com o passo a passo exato no Google Cloud e no
  Supabase, allowlist de redirect, variáveis e roteiro de teste manual.

A mensagem "Google indisponível" **permanece** — ela sai sozinha quando o
provedor for realmente ativado, porque é derivada de `/auth/v1/settings`.

---

## 2. Catálogo em português — 317/317

`name` passou a ser pt-BR; `name_en` guarda o original. Cada nome foi revisado
contra **o movimento real e o músculo-alvo**, não traduzido palavra por palavra.

A primeira tentativa (composição automática) foi **descartada** porque produzia
erros inaceitáveis — "Band One-Leg Kickback" (glúteo) virava "tríceps coice".
O mapeamento final é explícito e validado por teste.

Exemplos:
- `45 Degree Hyperextension` → **Hiperextensão lombar no banco 45°**
- `Barbell Drag Curl` → **Rosca arrastada com barra**
- `Band Seated Row` → **Remada sentada com elástico**
- `Band One-Leg Kickback` → **Extensão de quadril unilateral com elástico**

Teste garante que nenhum nome mistura equipamentos incompatíveis
(ex.: "na polia com halteres"). Aplicado ao vivo; 317 registros, 0 em inglês
("Burpee" é o mesmo termo em pt-BR).

---

## 3. Comunidade de atletas — nova, com privacidade por padrão

Banco aplicado ao vivo, RLS verificada tabela por tabela.

- `athlete_profiles` (**privado por padrão**), `shared_workouts`, curtidas,
  comentários, bloqueios e denúncias.
- `athlete_directory` seleciona **coluna por coluna**, nunca `select *`: e-mail,
  peso, altura, nascimento e telefone não têm como vazar por ali.
- Publicar exige perfil público; voltar a privado **esconde as publicações na
  hora**.
- Bloqueio corta visibilidade **nos dois sentidos**.
- Contadores são do servidor: o grant de UPDATE é por coluna, então nem o dono
  consegue inflar as próprias curtidas (esse furo foi pego pelo teste).
- Publicação usa **snapshot**: só nome do exercício, séries, reps e descanso.
  Carga pessoal, notas, peso, medidas e histórico ficam de fora. O diálogo mostra
  exatamente o que será compartilhado antes de enviar.

Telas: feed, busca de atletas, detalhe do treino publicado, comentários,
denúncia, bloqueio e o cartão de privacidade em Configurações.

---

## 4. Perfil, fotos e navegação

- Bucket `avatars` com políticas por usuário (`<uid>/arquivo`), 2 MB,
  JPEG/PNG/WebP. **SVG recusado** (vetor pode carregar script).
- Adicionar, trocar e remover foto com estados reais; versões antigas limpas.
- Barra inferior com os 5 destinos pedidos (Início, Treinos, Exercícios, Nutrição,
  Perfil); secundários no menu Explorar. Rótulos cabem em 320px; alvos ≥44px
  verificados por teste.
- `EmptyState` aceita ícone vetorial; criados ícones de comunidade (sem emojis).

---

## 5. Testes executados

| Suíte | Resultado (rodada 2) |
|---|---|
| `npm run typecheck` / `typecheck:api` | PASS |
| `npm run lint` (0 warnings) | PASS |
| `npm test` | **273 passaram** (21 arquivos) |
| `npm run test:security` | 10 API/cliente + **41 cenários PostgreSQL** |
| `npm run test:i18n` | **745 strings**, 4 idiomas |
| `npm run test:browser` | **12 fluxos** |
| `npm run build` | PASS, 53 entradas de precache, **0 scripts inline** |

Cobertura nova: 12 casos de taxonomia, 3 de catálogo pt-BR, 7 de geração com
perfis distintos, 10 de conta/foto, 7 de retorno OAuth, 7 cenários de
privacidade/IDOR da comunidade, 3 fluxos de navegador (tema, card do plano,
comunidade) e overflow em **320/360/390/430/768/1024/1440px**.

Os testes de banco usam dois usuários isolados + anon sobre as migrações reais,
não mocks.

---

## 6. Arquivos principais alterados

**Migrações** (todas aplicadas ao vivo):
`20261102000000_account_deletion_fix.sql`, `20261102010000_exercises_pt_br.sql`,
`20261102020000_avatar_storage.sql`, `20261102030000_community.sql`

**Novos**: `src/lib/theme.ts`, `src/components/ThemeProvider.tsx`,
`themeContext.ts`, `public/theme-init.js`, `src/services/account.ts`,
`src/services/avatar.ts`, `src/services/community.ts`,
`src/services/oauthCallback.ts`, `src/components/DeleteAccountDialog.tsx`,
`AvatarEditor.tsx`, `CommunityPrivacyCard.tsx`, `PublishWorkoutDialog.tsx`,
`src/pages/CommunityPage.tsx`, `SharedWorkoutPage.tsx`,
`src/data/exerciseNamesPt.json`, `scripts/translate-exercises.mjs`,
`docs/GOOGLE_OAUTH_SETUP.md`

**Alterados**: `exerciseTaxonomy.ts`, `training.tsx`, `AppShell.tsx`,
`SettingsPage.tsx`, `ProfilePage.tsx`, `WorkoutsPage.tsx`, `LoginPage.tsx`,
`App.tsx`, `main.tsx`, `index.html`, `lib/supabase.ts`, `ui.tsx`, `icons.tsx`,
`global.css`, os 3 dicionários de i18n, `e2e/app.spec.ts`,
`scripts/test-security-database.mjs`

---

## 7. O que ainda depende de você

1. **Google OAuth** — seguir `docs/GOOGLE_OAUTH_SETUP.md`. Falta criar o Client
   ID/Secret no Google Cloud e ativá-los no Supabase. Não posso fazer isso sem
   suas credenciais, e não inventei nenhuma.
2. **Supabase Auth (painel)** — senha mínima 12 no servidor (hoje 6), HIBP,
   CAPTCHA, reautenticação para trocar senha, timeouts de sessão e SMTP próprio.
   A UI já exige 12, mas isso é UX, não fronteira de segurança.
3. **Produção** — a rodada 1 já foi merged e promovida (`595ec9d`). O banco
   desta rodada está aplicado; o frontend da rodada 2 precisa ser merged.
4. **`AI_API_KEY`** — ausente na Vercel; a IA responde 503 e o app usa o gerador
   por regras, que funciona sozinho.

---

## 8. Rodada 2 — lacunas da rodada 1 fechadas

Tudo abaixo estava listado como "não feito" e agora está implementado e testado.

### 8.1 Comunidade completada

| Item | Estado |
|---|---|
| Salvar treino de outro atleta | `workout_saves` + aba **Salvos**. Lista **privada**: nem o autor descobre quem salvou. |
| Perfil público do atleta | Rota `/app/community/atleta/:handle`, com treinos publicados e denúncia do atleta. |
| Privacidade por tipo | `show_workouts` e `show_progress` agora têm efeito **em RLS**, não só na tela. Desligar esconde na hora. |
| Progresso público | View `athlete_public_progress`: **só contagens agregadas** (concluídos, últimos 30d). Nunca carga, peso, medida, volume ou dieta. |
| Denunciar atleta | Botão no perfil; grava `reported_user_id`. |
| Paginação do feed | Cursor por `created_at` + "Carregar mais treinos". |
| Fila de moderação | Aba **Denúncias** no admin. `resolve_content_report()` é admin-only, valida a decisão, retorna o id e deixa trilha em `audit_logs`. |

Publicar agora exige perfil público **e** `show_workouts` no `WITH CHECK` — o
servidor recusa publicação feita por fora da interface, não só o botão.

### 8.2 Instruções dos exercícios em pt-BR — 317/317

`description`, `steps`, `breathing` e `common_mistakes` traduzidos e revisados
movimento por movimento. O original da fonte foi **preservado antes** de qualquer
UPDATE, em `description_en`, `instructions_en`, `steps_en`, `breathing_en` e
`common_mistakes_en`. A coluna `content_pt_ready` marca o que tem tradução
revisada, para a interface dizer a verdade sobre o idioma em vez de adivinhar.
Verificado ao vivo: **317 traduzidos, 317 com original preservado**.

### 8.3 Identidade visual

- **Marca original** (`BrandMark.tsx`): "A" de ascensão cuja travessa é uma barra
  de halteres, com o ápice marcando o próximo degrau. Mesmo laranja/lima do
  produto. Aplicada no shell, login, cadastro e recuperação; favicon, OG image e
  os 3 PNGs do PWA regenerados por `scripts/build-brand-icons.mjs` (sem
  dependência nova — o ambiente não tem rasterizador SVG).
- **Emojis eliminados**: eram 47 ocorrências em 16 arquivos; hoje **0** no código
  da aplicação. Objetivos e ambientes do questionário usam chaves de ícone
  resolvidas para vetor (`optionIcons.tsx`); chips e toasts usam `IconCheck`.
- **Tooltip acessível**: portal (não é cortado por `overflow` de card/modal),
  abre em hover **e** foco, fecha com Escape, ligado por `aria-describedby`.
  Substituiu o `title=` nativo do badge de origem do plano, que teclado e toque
  não alcançavam.
- **Reordenar dias do programa**: arrastar para ponteiro **e** botões
  cima/baixo com alvo 44×44 para teclado/toque. Reordenar troca os slots de
  `days_of_week` no banco — não é ordem só em memória. A lista é recarregada do
  servidor e falha parcial é reportada como falha.

### 8.4 Cobertura nova

`community.test.ts`, `exercise-content-pt.test.ts` (15), `admin-role-race.test.ts`
(5), `program-day-order.test.ts` (11, incluindo falha parcial de gravação) e 4
fluxos de navegador: salvar/aba Salvos/perfil, progresso público com e sem
opt-in, fila de moderação, e reordenar dias com reload.

---

## 9. O que continua pendente

Nada abaixo é código faltando — é configuração externa ou decisão sua:

1. **Google OAuth** — `external_google_enabled: false`. Falta Client ID/Secret
   (`docs/GOOGLE_OAUTH_SETUP.md`). Não inventei credenciais.
2. **Supabase Auth** — servidor ainda com senha mínima **6** (a UI exige 12),
   HIBP/CAPTCHA/reautenticação/timeouts desligados e sem SMTP próprio. Posso
   aplicar via conector se você autorizar.
3. **`AI_API_KEY`** — ausente na Vercel; `/api/ai/*` responde 503 e o gerador por
   regras cobre o fluxo sozinho.
4. **Tipografia** — a marca é nova; a família tipográfica continua a mesma.

Não afirmo que o produto está "pronto" ou "seguro": o que está marcado como
verificado foi executado; o resto está acima.

---

## 10. Rodada 3 — "Não foi possível iniciar" corrigido na causa

Relato: **"Não foi possível iniciar. Verifique os exercícios e a migração V10."**
A mensagem sugeria V10/catálogo. A investigação mostrou que **nenhum dos dois era
o problema** — e que a mensagem genérica estava escondendo quatro defeitos
distintos. Todos foram corrigidos na origem e cobertos por teste.

### 10.1 Causa real nº 1 — `name` ausente no INSERT da sessão

A tabela `public.workout_sessions` tem `name text NOT NULL` com
`CHECK (length(trim(name)) > 0)`. O `startSession()` montava o payload **sem
`name`**, então o Postgres recusava com `SQLSTATE 23502`.

Provado no banco real, dentro de transação com rollback (sem deixar dado):

| Momento | Resultado |
| --- | --- |
| Payload antigo | `SQLSTATE=23502 · null value in column "name"` |
| Payload corrigido | `INSERT OK · status=in_progress · started_at preenchido` |

V10 estava aplicada e correta; RLS, grants e catálogo **não** eram a causa.

Dois defeitos na mesma função, que apareceriam logo depois:

- **`status` não era enviado** → nascia `'planned'` (default da coluna). A sessão
  ficava invisível para retomar, o sincronismo de progresso não a reconhecia e a
  conclusão falhava com "Session is not active".
- **`started_at` não era enviado** → duração calculada sempre 0.

Correção: `src/services/workoutSession.ts` reescrito com `sessionName()` (nome
derivado do plano, com fallback e limite de 120 caracteres) e
`buildSessionInsert()`, que envia `name`, `status: 'in_progress'` e `started_at`.
`findOpenSession()` passou a usar `created_at desc` + `limit(1)` + `maybeSingle`,
e um `23505` (duas abas iniciando juntas) recupera a sessão existente em vez de
estourar erro.

**Banco:** `supabase/migrations/20261103030000_session_start_fix.sql` cria o
índice único parcial `workout_sessions_one_open_per_plan` em
`(user_id, plan_id) where status = 'in_progress' and plan_id is not null`.
A migração **aborta** se já existirem duplicatas, em vez de apagar dado.
Nenhum `NOT NULL` ou `CHECK` foi removido — a restrição estava certa; o código
estava errado. Aplicada e registrada no banco (`session_start_fix`).

### 10.2 Causa real nº 2 — questionário travava na etapa 1

Descoberto pelo novo teste de navegador do fluxo completo. Campos que a tela
chama de **opcionais** (gênero, altura, peso) chegavam `undefined`: o
`refreshProfile` cria a profile de fallback só com `id/email/full_name/avatar_url`,
e o `load()` do onboarding copiava esses `undefined` por cima do `null` seguro.
O schema aceitava `null`, mas não ausência.

Resultado: a etapa 1 não avançava **para usuário novo**, com o texto cru do Zod
em inglês na tela (`gender: Invalid option: expected one of ...`).

Correção em três camadas: normalização `?? null` na origem, campos opcionais
tolerando ausência no schema (`.default(null)`, cobre rascunhos antigos) e
mensagens por campo em português. **As faixas de valor continuam validadas** —
altura 90–250, peso 25–400; nada foi afrouxado para o teste passar.

### 10.3 Causa real nº 3 — alternativas com equipamento indisponível

A matriz de perfis (480 combinações) revelou que `findAlternatives` aceitava um
substituto se **qualquer** equipamento dele existisse no perfil (`.some`),
enquanto a validação do plano exige **todos** (`.every`). "Supino com barra e
banco" era oferecido a quem só tem banco — e a validação então recusava o
programa inteiro: **173 combinações falhavam**.

A troca manual (Treinador → trocar exercício) tinha a mesma regra frouxa na tela
e **nenhuma** na persistência: dava para gravar exercício sem equipamento,
acima do nível, ou contraindicado pelas limitações.

Correção: regra única de equipamento em `findAlternatives`, no seletor do
`CoachPage` e em `replacePlanExercise`, que agora valida **antes** de gravar.
A prescrição da troca passou a reaproveitar `prescriptionsFor` do gerador — a
tabela própria anterior podia trocar por 4×4–6 (faixa de força) para um
adolescente de 16 anos.

### 10.4 Causa real nº 4 — validação sem perfil e erro cru na tela

`validateGeneratedProgram` aceita um `profile` que liga as checagens de
equipamento, nível, dia e duração, mas os dois fluxos principais chamavam **sem
ele**: só a saída da IA era conferida contra o perfil. Plano por regras passava
sem checagem. Além disso, o erro de schema voltava como texto cru do Zod e era
exibido direto em `errors[0]`.

Correção: `profile` passado nos dois call sites; erro de schema passa a ser
mensagem acionável em português, com o detalhe técnico no console em DEV.

### 10.5 Personalização — o que passou a ter efeito real

- **Idade:** `ageRange` era coletado, tipado e **nunca lido**. Menor de 18 agora
  não recebe dificuldade avançada (nem pela troca manual), tem séries limitadas
  a 3, repetições 10–15, descanso 75 s, no máximo 5 exercícios e aviso de
  supervisão. Sem promessa de resultado.
- **Altura e peso:** eram coletados, salvos e **descartados** em `toPlanProfile`.
  Agora chegam à geração com um efeito limitado e explícito: preferência suave
  por baixo impacto para iniciante com massa corporal alta para a estatura.
  É desempate no score (−10), **nunca filtro** — o plano não esvazia, nenhuma
  meta de peso ou caloria é derivada disso, e **não se aplica a menores** (ponto
  de corte de IMC adulto não vale para adolescente).
- **Sexo:** continua com **zero** uso na seleção de exercícios. Não há filtro
  estereotipado por gênero, e um teste garante isso.

### 10.6 Prévia do plano antes de salvar

`handleGenerate` salvava direto em `workout_plans`. Agora para em
`src/components/ProgramPreview.tsx`: dias em acordeão, séries × reps, descanso,
alternativas, grupos trabalhados, avisos e o "porquê" do plano. **Nada é gravado**
até "Salvar este plano"; descartar volta ao questionário e qualquer resposta
editada invalida a prévia. O teste de navegador verifica as duas metades: zero
inserts antes de confirmar, inserts reais depois.

### 10.7 Catálogo — verificado, não precisou de seed

317 exercícios ativos, **0** sem dificuldade/equipamento/músculo, 317 com
conteúdo em português, 31 músculos, 3 níveis (236 iniciante — 85 só peso do
corpo —, 74 intermediário, 7 avançado). Cobertura suficiente inclusive para
quem treina em casa sem equipamento. Nenhum exercício foi inventado.

### 10.8 Testes executados nesta rodada

| Verificação | Resultado |
| --- | --- |
| `npm test` (unitário) | **881 testes / 27 arquivos** |
| Matriz de perfis (objetivo × ambiente × nível × dias × tempo) | **480 combinações**, plano válido em todas |
| `npm run test:browser` (Playwright) | **13/13 fluxos** |
| `npm run test:security` (PGlite, migrações reais) | **49 cenários** |
| `npm run test:i18n` | **750 strings**, 0 faltando |
| `npm run lint` | 0 avisos |
| `npx tsc -b --noEmit` + `typecheck:api` | sem erro |
| `npm run build` | OK, PWA 54 arquivos |
| Banco real | insert da sessão provado; índice e migração confirmados |

O teste de sessão usa o **payload real do cliente** e o fixture de
`workout_sessions` agora recusa POST sem `name`/`status`/`started_at`. Como
controle negativo, remover `name` do código faz o teste de navegador falhar —
ou seja, ele pega a regressão, não passa por acaso.

### 10.9 Arquivos alterados nesta rodada

Novos: `src/services/dbErrors.ts`, `src/components/ProgramPreview.tsx`,
`supabase/migrations/20261103030000_session_start_fix.sql` e 6 arquivos de teste
(`workout-session-start`, `plan-age-safety`, `plan-profile-matrix`,
`questionnaire-optional-fields`, `exercise-substitution-safety`,
`plan-anthropometry`).

Alterados: `workoutSession.ts`, `planGenerator.ts`, `planPersistence.ts`,
`catalog.ts`, `trainingProfile.ts`, `OnboardingPage.tsx`, `CoachPage.tsx`,
`WorkoutsPage.tsx`, `WorkoutBuilderPage.tsx`, `WorkoutSessionPage.tsx`,
`NutritionPage.tsx`, `components/training.tsx`, `styles/global.css`,
`i18n/patterns.ts`, `i18n/locales/{en,es,fr}.ts`,
`scripts/test-security-database.mjs`, `e2e/app.spec.ts`.

### 10.10 Limite do que foi testado

Os fluxos de navegador rodam contra um Supabase simulado por fixture de rede —
exercitam o cliente real, o payload real e a interface real, mas não o banco
remoto. A parte do banco foi verificada separadamente: reprodução e prova do
insert no projeto real (com rollback) e as 49 verificações de segurança
reaplicando as migrações de verdade. Conclusão de sessão, RLS e isolamento entre
usuários estão cobertos por esses dois lados, não por um teste só.
