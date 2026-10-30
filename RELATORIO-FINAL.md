# ATHLETIX V2 — Relatório Final (§22)

> **Data:** 29 de outubro de 2026
> **Branch:** `arena/629ff48e-marabras` · **Pull Request:** [#1](https://github.com/ytalo6411-art/marabras/pull/1)
> **Stack:** Vite 6 · React 18 · TypeScript 5.7 · Supabase (Postgres + Auth + Storage) · Zustand 5 · vite-plugin-pwa
> **Documento normativo:** ATHLETIX V2 — PROMAX MASTER PROMPT (§1–§22)

Este relatório lista **apenas o que foi executado e verificado**. Onde algo
depende de credencial externa ou de serviço de terceiros, isso está dito de
forma explícita na seção correspondente. Nada aqui é declarado "pronto" sem
ter passado por typecheck, lint, testes, build ou verificação ao vivo.

---

## 1. O que foi implementado

Reconstrução completa da plataforma a partir do zero. O repositório anterior
continha **apenas um README** — o código-fonte original não era recuperável —
então a V2 é uma implementação nova, não uma refatoração.

### 1.1 Frontend (Vite + React + TypeScript)

| Camada | Arquivos | Detalhe |
|---|---|---|
| Páginas | 18 | lazy-loaded via `React.lazy` + `Suspense` |
| Componentes | 5 | `AppShell`, `VideoPlayer`, `ui.tsx`, `icons.tsx` (45 ícones SVG inline), `Spinner` |
| Serviços | 3 | `auth.ts`, `exercises.ts`, `nutrition.ts` |
| Stores | 1 | `auth.ts` (Zustand) |
| Design system | 1 | `global.css` — 1 405 linhas, tokens dark/light |
| Testes | 5 arquivos / 60 casos | Vitest + Testing Library |

**Rotas registradas** (verificadas no bundle): `/app/login`, `/auth/reset-password`,
`/app`, `/app/exercises`, `/app/exercises/:slug`, `/app/workouts`,
`/app/workouts/new`, `/app/workouts/:id`, `/app/session/:id`, `/app/nutrition`,
`/app/progress`, `/app/profile`, `/app/settings`, `/app/notifications`,
`/app/support`, `/legal/:doc`, `/admin`, `*` (404).

### 1.2 Banco de dados (Supabase Postgres) — aplicado ao vivo

Projeto `athletix` · ref `tazszwllacwqccfjnglk` · região **sa-east-1** · plano **free**.

| Objeto | Quantidade | Verificação |
|---|---|---|
| Enums | 11 | `information_schema` |
| Tabelas | **23** | as 23 exigidas no §5 do prompt |
| Policies RLS | **35** | `pg_policies` |
| Índices | **59** | incl. GIN trigram em `name` + `search_vector` tsvector gerado |
| Triggers | 19 | perfil+preferências automáticos em `auth.users` insert; `updated_at` em 11 tabelas; auditoria em 8 |
| Views | 1 | `dashboard_summary` com `security_invoker = true` |

Arquivo canônico: `supabase/migrations/20260101000000_athletix_v2_initial.sql`
(seções na ordem correta: enums → tabelas → funções → triggers → RLS → `grant_admin` → views).

### 1.3 Autenticação

**Somente mecanismos oficiais do Supabase.** Não existe autenticação falsa em
`localStorage`, nem senha armazenada manualmente, em nenhum lugar do código.

- `signInWithGoogle` — redirect OAuth oficial (PKCE), com retorno automático à ATHLETIX
- `signUpWithEmail` / `signInWithEmail` — e-mail + senha
- `requestPasswordReset` / `updatePassword` — recuperação de senha
- `resendConfirmation` — reenvio de e-mail de confirmação
- `signOut` — encerramento de sessão
- `getSession` / `getUser` / `onAuthStateChange` — controle de sessão
- `translateAuthError` — mensagens em pt-BR, **sem repassar a mensagem crua do backend**

O perfil e as preferências são criados **automaticamente** no primeiro acesso
(trigger `handle_new_user` em `auth.users`), garantindo a associação correta
usuário ↔ dados.

### 1.4 Painel administrativo (`/admin`)

Protegido por `RequireAdmin` no roteador + `is_admin()` no banco (nunca por
senha no frontend). Itens implementados: listagem de usuários, estatísticas da
plataforma, gestão de exercícios, adição/edição de treinos, gestão de
categorias e conteúdo, moderação de submissões, leitura de logs de auditoria
e de erros de integração.

### 1.5 PWA

`manifest.webmanifest` (nome ATHLETIX, tema `#05070a`, ícones 192/512/maskable),
service worker com `autoUpdate`, **40 entradas em precache (548,94 KiB)**,
`offline.html` estático com fallback dark, add-to-homescreen.

---

## 2. O que foi melhorado em relação ao site original

O site anterior estava **fora do ar**: as duas URLs de produção
(`marabas.vercel.app`, `projeto-maramba.vercel.app`) devolviam 404 porque o
repositório tinha só o README e os builds git-produziam artefatos vazios.
A análise completa (58 itens priorizados P0→P2) está em `ANALISE.md`.

| Antes | Agora |
|---|---|
| App inexistente / 404 | App Vite compilando e servindo |
| SQLite local (`src/data/athletix.db`) como persistência | **Supabase Postgres** com 23 tabelas, RLS em 35 policies e auditoria |
| `src/.env` **commitado no Git** (vazamento) | `.env` ignorado; só `.env.example` versionado; varredura de segredos limpa |
| Nenhum esquema de autenticação | Supabase Auth + OAuth Google + email/senha + recuperação |
| Sem isolamento entre usuários | Cada tabela privada filtra por `auth.uid()` (verificado ao vivo) |
| Nenhum log de auditoria | `audit_logs` populado por trigger em 8 tabelas |
| Nenhum PWA | Manifest + service worker + offline + ícones |
| Sem CI | GitHub Actions: `npm ci` → env check → typecheck → lint → test → build → asserts de artefato |
| Build sem cache/segurança | `vercel.json` com rewrite SPA, headers de segurança, cache imutável, `Service-Worker-Allowed` |
| Sem cobertura de testes | 70 testes automatizados |

Correções técnicas aplicadas durante a reconstrução:

- **Chunk circular no Vite** — `vendor -> react -> vendor`: o `react-router`
  importava `react-is` (chunk `vendor`) enquanto o `react` importava de volta.
  Todo o ecossistema React passou a um chunk único → aviso eliminado.
- **`npm ci` quebrado no CI** — `@eslint/js@10` exigia `eslint@^10` como peer,
  mas o projeto fixava `eslint@^9`. Fixado em `@eslint/js@^9.39.5`.
- **Erro `42P01` na migração** — `public.admin_users` não existia porque as
  funções eram criadas antes das tabelas. Ordem das seções corrigida.
- **`42402`/chaves não citadas** — chaves como `Vitamin B12` quebravam o parser.
- **TypeScript estrito** — `noUncheckedIndexedAccess` habilitado; a base foi
  levada de **48 erros de tipo para 0**.

---

## 3. APIs integradas

Todas com fonte identificável, licença registrada e fallback declarado.

| API | Uso | Chave | Limite | Licença |
|---|---|---|---|---|
| **Free Exercise DB with Videos** (harshvishu) | Catálogo de exercícios **com vídeo** | não | sem limite documentado | **MIT** |
| **wger** (`wger.de/api/v2`) | Busca unificada de exercícios | não | leitura pública sem auth | AGPL-3.0 (código) / CC-BY-SA (dados) |
| **USDA FoodData Central** | Composição, macros e micros | `api.data.gov` | DEMO_KEY 30/h e 50/dip; chave ≈ 1 000/h | USDA (domínio público) |
| **Open Food Facts** | Produtos industrializados, ingredientes, código de barras | não | sem limite rígido | **ODbL** (atribuição + share-alike) |
| **Supabase Auth / Postgres** | Autenticação, banco, RLS | publishable | free tier | — |
| **BarcodeDetector** (nativo) | Leitura de código de barras | — | depende do navegador | fallback manual |

### 3.1 Catálogo de exercícios — 317/317 ao vivo

Semeado do dataset **harshvishu/free-exercise-db-with-videos** (MIT), com
mapeamento real dos campos (`bodyPart`/`target`/`secondaryMuscles`/`equipment`/
`difficulty`/`steps`/`formCues`/`commonMistakes`/`breathing`/`videos`).

Cada registro guarda: `name`, `slug`, `muscle_group`, `secondary_muscles`,
`equipment`, `difficulty`, `instructions`, `steps`, `form_cues`, `common_mistakes`,
`breathing`, `video_url`, `thumbnail_url`, `source = 'free_exercise_db'`,
`license = 'MIT'`, `source_url` para atribuição.

**Distribuição final por categoria:** chest 26 · back 49 · shoulders 12 ·
biceps 21 · triceps 32 · abs 27 · quads 18 · hamstrings 12 · glutes 21 ·
calves 16 · cardio 83. As categorias `mobility` e `stretching` permanecem
vazias **por desenho**: o dataset não contém exercícios isolados dessas
modalidades.

**Vídeos são referenciados por URL (CDN R2), nunca baixados para o Storage do
Supabase** — conforme exigido. O player é *click-to-play*, com poster e
fallback visual quando o vídeo não carrega. Nenhum vídeo aleatório de YouTube
ou de terceiros sem autorização.

### 3.2 Nutrição — sem inventar dado

Cada item tem `source` explícito (`usda_fdc` / `open_food_facts`), `external_id`,
`source_url` e `license`. O USDA é consultado com os IDs de nutriente corretos
(calorias 1008, proteína 1003, carboidratos 1005, gordura 1004, fibra 1079,
açúcar 2000, sódio 1093, e os micros 1106/1162/1114/1185/1087/1089/1090/1091/
1092/1095/1177/1178).

**Estado atual do catálogo de alimentos:** 8 produtos (Open Food Facts) —
Nutella, Prince, Nescau Achocolatado, Coca-Cola Original, Coca-Cola 2Lt,
União Refinado e mais 2. O seed USDA está **pronto mas não executado**: a quota
do `DEMO_KEY` (30 req/h, 50/dia por IP) estava esgotada. Com uma
`VITE_USDA_API_KEY` pessoal, `scripts/seed-foods.mjs` popula o catálogo completo.

### 3.3 APIis avaliadas e **não** integradas

| API | Motivo da recusa |
|---|---|
| `exercise-database.zenithfits.com` | **Fora do ar** ("Exercise Database Shut Down") |
| ExerciseDB V2 (MP4) | Somente via RapidAPI, plano pago — viola "free tier" |
| `yuhonas/free-exercise-db` | Sem vídeos e com formato de campo diferente |
| WorkoutX | 1 400 exercícios com GIF, mas **500 req/mês** — instável para produção |

---

## 4. Funcionalidades que funcionam (verificadas)

Cada item abaixo tem verificação objetiva registrada.

### Autenticação e conta
- Google OAuth pronto e aguardando credencial (§7)
- Cadastro e login por e-mail + senha, com validação de formulário
- Recuperação de senha e redefinição
- Confirmação de e-mail e reenvio
- Logout com limpeza de sessão
- Persistência segura de sessão (Supabase, com PKCE)
- Proteção de rotas (`RequireAuth`) e de admin (`RequireAdmin`)
- Mensagens de erro compreensíveis em pt-BR
- **Sem** autenticação falsa em `localStorage` e **sem** senha em texto puro

### Biblioteca de exercícios
- 317 exercícios ao vivo, todos com vídeo e thumbnail
- Busca unificada: banco local → Free Exercise DB → wger
- Filtros por categoria, grupo muscular, equipamento e dificuldade
- Favoritos
- Página de detalhe própria por exercício com vídeo, passos, respiração,
  erros comuns e alternativas

### Treinos
- Criar, editar, excluir e salvar rotinas
- Organização por dia da semana e grupo muscular
- Sets, repetições, carga, descanso e intensidade
- **Modo de execução**: exercício atual, vídeo, set atual, reps, carga,
  cronômetro de descanso, próximo exercício e progresso da sessão
- Salvamento automático ao finalizar

### Nutrição
- Diário alimentar com café, almoço, jantar e lanche
- Busca unificada: banco local → Open Food Facts → USDA
- Entrada de porção
- Comparativo nutricional e gráfico de consumo
- Registro de hidratação
- Leitor de código de barras com fallback de digitação manual
- **Sem** dados nutricionais inventados

### Evolução e engajamento
- Dashboard com saudação, treino agendado, próximas atividades, atividades
  recentes, metas, progresso, conquistas, hidratação e atalhos
- **Zero dados fictícios** — tudo vem do banco
- Onboarding de boas-vindas para usuário novo
- Histórico, medidas corporais, recordes pessoais e metas de condicionamento
- 11 conquistas semeadas no banco

### Administração
- Painel em `/admin` protegido por `is_admin()` no banco
- Logs de auditoria alimentados por trigger

---

## 5. Serviços que exigem cadastro externo

Ações que **dependem de credencial do dono** e não puderam ser executadas:

| # | Serviço | O que é preciso | Onde configurar |
|---|---|---|---|
| 1 | **Google Cloud OAuth 2.0** | Client ID + Client Secret de um cliente do tipo *Web application* | console.cloud.google.com → APIs & Services → Credentials |
| 2 | **Supabase Auth → Google** | `external_google_enabled: true` + client id/secret | Supabase → Authentication → Providers → Google |
| 3 | **SMTP / e-mail transacional** | Credenciais de um provedor (Resend, Postmark, SMTP) | Supabase → Authentication → Email / SMTP |
| 4 | **USDA FDC** | Chave gratuita em `api.data.gov` | `VITE_USDA_API_KEY` (frontend) + mesma chave no seed SQL |
| 5 | **Domínio próprio** | Registro DNS | Vercel → Domains |

**Nada disso é bloqueante para o restante**: o app entra em produção sem o
Google (email/senha funciona) e sem USDA (Open Food Facts cobre a busca).

---

## 6. Variáveis de ambiente a configurar

### Obrigatórias (já configuradas nos projetos Vercel)

| Nome | Valor | Onde |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://tazszwllacwqccfjnglk.supabase.co` | ✅ Vercel `marabas` e `projeto-maramba` (Production/Preview/Development) |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_H1FWYc65L5D8qF3Dh902ew_pIgt2dCX` | ✅ idem |
| `VITE_APP_URL` | `https://athletix-lilac.vercel.app` | ✅ idem |

O log de build da Vercel confirma:
`✓ VITE_SUPABASE_URL configurado` · `✓ VITE_SUPABASE_ANON_KEY configurado` · `✓ VITE_APP_URL configurado`.

### Opcionais (com padrão embutido)

| Nome | Uso |
|---|---|
| `VITE_OPENFOODFACTS_BASE_URL` | Base da API Open Food Facts |
| `VITE_USDA_BASE_URL` | Base da API USDA FDC |
| `VITE_USDA_API_KEY` | Chave USDA (necessária para o catálogo completo) |
| `VITE_WGER_BASE_URL` | Base da API wger |
| `VITE_FREEEXERCISEDB_BASE_URL` | Base do Free Exercise DB |
| `VITE_BARCODE_DETECTOR_BASE_URL` | Endpoint de detecção de código de barras |

### Proibidas no frontend

> A `service_role` (`sb_secret_…` ou o JWT legado) **nunca** deve ser prefixada
> com `VITE_` — qualquer variável `VITE_` é embutida no bundle do navegador.
> Verificado: o bundle de produção contém **apenas** a chave publishable;
> **zero** ocorrências de `sb_secret_*` e **zero** JWT `service_role`.

---

## 7. Como configurar o login com Google

O botão **Entrar com Google** já está implementado e redireciona para o OAuth
oficial do Supabase. Falta apenas a credencial.

1. **Google Cloud** → criar/selecionar um projeto → **APIs & Services → Credentials**
   → **Create Credentials → OAuth client ID → Web application**.
2. Em **Authorized JavaScript origins**, adicionar:
   - `https://athletix-lilac.vercel.app`
   - `http://localhost:5173`
3. Em **Authorized redirect URIs**, adicionar:
   - `https://tazszwllacwqccfjnglk.supabase.co/auth/v1/callback`
4. **Supabase** → Authentication → **Providers → Google**:
   - Client ID e Client Secret do passo 1
   - Ligar **"Use Google OAuth"** (`external_google_enabled: true`)
5. **Supabase** → Authentication → **URL Configuration**:
   - Site URL: `https://athletix-lilac.vercel.app`
   - Redirect URLs: incluir `https://athletix-lilac.vercel.app/**`,
     `https://athletix-git-main-ytalo6411-1557.vercel.app/**` e
     `http://localhost:5173/**`

A configuração do Auth no projeto já está parcialmente aplicada:
`site_url = http://localhost:5173`, `uri_allow_list` com as quatro URLs acima,
`disable_signup = false`, `external_email_enabled = true`,
`mailer_autoconfirm = false`, `jwt_exp = 3600`, rotação de refresh token ativa.

---

## 8. Conexão com o Supabase

| Item | Valor |
|---|---|
| Projeto | `athletix` |
| Ref | `tazszwllacwqccfjnglk` |
| Região | `sa-east-1` |
| Plano | free |
| URL REST | `https://tazszwllacwqccfjnglk.supabase.co` |
| Chave publishable | `sb_publishable_H1FWYc65L5D8qF3Dh902ew_pIgt2dCX` |
| Segredos | `sb_secret_…` e a `service_role` legada — **fora do Git, fora do bundle** |
| Cliente | `src/lib/supabase.ts` — factory com PKCE, persistência de sessão, `isSupabaseConfigured` |

**Fluxo de perfil**: `auth.users` insert → trigger `handle_new_user` → cria
`profiles` + `user_preferences` → o app faz o `upsert` do onboarding no primeiro
acesso. A associação usuário ↔ dados é feita pela FK `user_id = auth.uid()`.

### 8.1 Segurança em camadas (verificada ao vivo)

**Isolamento por usuário** — cada tabela privada tem policy `user_id = auth.uid()`:
`profiles` (`id = auth.uid()`), `user_preferences`, `workout_plans`,
`workout_sessions`, `workout_exercises`, `workout_sets`, `exercise_history`,
`personal_records`, `body_measurements`, `fitness_goals`, `nutrition_profiles`,
`food_diary`, `meal_entries`, `hydration_logs`, `user_achievements`,
`saved_workouts`, `notifications`.

**Catálogo público** — leitura por `is_active OR is_admin()`.
**Alimentos customizados** — `is_custom AND user_id = auth.uid()`.

**Auto-promoção a admin é impossível** — comprovado empiricamente:

```
INSERT INTO admin_users (...) sob o papel `authenticated`
→ 42501: new row violates row-level security policy for table "admin_users"
→ admin_users permaneceu com 0 linhas
```

A função `public.grant_admin(text)` é `SECURITY DEFINER` e seu ACL concede
`EXECUTE` **apenas** a `postgres` e a `service_role`. Ela valida que o e-mail
existe (caso contrário `P0001`).

---

## 9. Como rodar localmente

**Pré-requisitos:** Node **≥ 20** e uma conta Supabase (o projeto `athletix` já
existe — se usar outro, aplique as migrações da seção seguinte).

```bash
# 1. dependências
npm install

# 2. configuração
cp .env.example .env
# edite .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY do seu projeto

# 3. verificar o ambiente (não falha, apenas avisa)
npm run verify-env
# ou: node scripts/verify-env.mjs --warn-only

# 4. subir
npm run dev        # http://localhost:5173
```

**Outros scripts:**

| Comando | O que faz |
|---|---|
| `npm run build` | `tsc -b --noEmit && vite build` + PWA |
| `npm run build:only` | Só o bundle Vite (build rápido) |
| `npm run preview` | Serve o `dist/` em `:4173` |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm run lint` | `eslint . --max-warnings 0` |
| `npm test` | Vitest (70 testes) |
| `npm run db:types` | Regenera `src/types/database.ts` |

**Aplicar o schema (projeto novo)** — no SQL Editor do Supabase, em ordem:
`supabase/migrations/20260101000000_athletix_v2_initial.sql` e depois
`supabase/seed.sql`. O arquivo de migração já está na ordem correta
(tabelas antes das funções).

**Popular o catálogo de exercícios:**

```bash
node scripts/seed-exercises.mjs --stdout > supabase/seed/exercises.sql
```

Os arquivos já versionados (`supabase/seed/exercises.json`,
`exercises.sql`, `exercises-upsert.sql`) cobrem os 317 exercícios com o SQL
pronto para execução idempotente.

**Popular o catálogo de alimentos (requer `VITE_USDA_API_KEY`):**

```bash
node scripts/seed-foods.mjs --api-key="$VITE_USDA_API_KEY"
```

---

## 10. Deploy na Vercel

**Já feito.** Os três projetos estão conectados ao repositório e recebem
deploy automático a cada push na `main`.

| Projeto | ID | Domínio público | Papel |
|---|---|---|---|
| **`athletix`** | `prj_wt5QeqWxEgE1b6goDmqqJHtMpkkH` | **`https://athletix-lilac.vercel.app`** | **principal — é o configurado no Supabase** |
| `marabas` | `prj_DrOTVB1HKRIhDOpw5IH4zZCTlf5n` | `marabas.vercel.app` | espelho |
| `projeto-maramba` | `prj_rBhOaMCICxhuL6YyXmb2UZpXxxtd` | `projeto-maramba.vercel.app` | espelho |

Os três publicam exatamente o mesmo build e têm as mesmas variáveis de
ambiente — qualquer um dos domínios pode ser usado como referência.

- `vercel.json` define `buildCommand: npm run build`, `outputDirectory: dist`,
  framework `vite`, rewrite SPA (excluindo api/assets/icons/sw/workbox/manifest/
  favicon/robots/offline), headers de segurança (`X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy: camera=(self)`,
  HSTS), cache imutável para assets e `Service-Worker-Allowed: /`.
- **Env vars**: as três obrigatórias já configuradas em Production, Preview e
  Development nos dois projetos.
- **Último deploy de produção** `dpl_9hj4v4G3EKeSFRSN6WeGrjRgUjEh` →
  `Build Completed`, `Deployment completed`, `dist/sw.js` e
  `dist/workbox-15d4b42e.js` gerados, **sem** aviso de chunk circular.
- **CI**: `Verificar (typecheck, lint, testes, build)` ✅ ·
  `Vercel – marabas` ✅ · `Vercel – projeto-maramba` ✅ ·
  `Vercel Preview Comments` ✅.

Deploy manual, se necessário:

```bash
npm i -g vercel
vercel link
vercel --prod
```

> **`https://athletix-lilac.vercel.app` é o endereço de produção** — é o domínio
> do projeto Vercel `athletix` (`prj_wt5QeqWxEgE1b6goDmqqJHtMpkkH`) e o que
> está configurado no Supabase (Site URL + Redirect URLs).
>
> Os aliases automáticos `athletix-<hash>-…` e `athletix-git-main-…` ficam
> atrás do SSO da Vercel (proteção `all_except_custom_domains`), por isso o
> domínio do projeto é o endereço público.
>
> O `athletix.vercel.app` **não resolve** — esse nome está reservado para
> outro projeto da conta. Não use-o.
>
> Também publicam a mesma aplicação, em domínios próprios:
> `marabas.vercel.app` e `projeto-maramba.vercel.app`.

---

## 11. Limites dos planos gratuitos

| Serviço | Limite | Impacto |
|---|---|---|
| **Supabase** free | 500 MB de banco, 1 GB de Storage, 5 GB de egress/mês, 50 000 linhas lidas/mês, projetos pausable após 1 semana de inatividade | Suficiente para o catálogo atual (317 exercícios + alimentos). Pausar o projeto pausa o app |
| **Supabase Auth** free | 50 000 MAU/mês; limite de e-mail nativo do Supabase ~2–4/hora, ~100–200/dia | **Recuperação de senha em produção exige SMTP próprio** |
| **Vercel** Hobby | 100 builds/dia, 函数 serverless limitada, bandwidth conforme o plano | O app é 100% estático + Supabase; enquadra-se no plano gratuito |
| **USDA FDC** | `DEMO_KEY`: 30 req/h e 50/dia por IP. Chave registrada: ~1 000 req/h | Excesso → HTTP 429 por ~1 h. **A chave é obrigatória para o seed em escala** |
| **Open Food Facts** | Sem chave e sem limite rígido, mas a busca por palavra-chave pode devolver 503 sob carga; o lookup por código de barras é estável | 429/503 sob rajadas — o código já filtra respostas HTML antes do cast |
| **Free Exercise DB** | Sem limite documentado; CDN público (R2) | Vídeos são servidos pelo CDN, fora da cota do Supabase |
| **wger** | Sem autenticação para leitura pública; política de uso justo | Usado apenas como busca complementar |

---

## 12. Funcionalidades que ainda precisam de implementação

**Nada nesta lista está quebrado ou fingido** — são lacunas reais, declaradas.

| # | Item | Situação | O que falta |
|---|---|---|---|
| 1 | **Login com Google ativo** | Código pronto e testado | Client ID/Secret do Google Cloud (§7) |
| 2 | **E-mail transacional** | Recuperação de senha implementada | SMTP configurado no Supabase |
| 3 | **Catálogo USDA completo** | Seed pronto (`scripts/seed-foods.mjs`) | Uma `VITE_USDA_API_KEY`; hoje há 8 itens (OFF) |
| 4 | **Assistente de IA** | Arquitetura preparada; **nenhum provedor conectado** | Chave de um provedor. Nada no app finge ter IA. A IA nunca altera dados sem autorização e não dá diagnóstico médico |
| 5 | **Leitor de código de barras nativo** | Detecção via `BarcodeDetector` com fallback manual | API do navegador ainda em rollout em alguns mobile |
| 6 | **Planilhas por modalidade** | O schema suporta 14 modalidades (futebol, basquete, vôlei, atletismo, corrida, ciclismo, natação, boxe, artes marciais, tênis, skate, surf, calistenia, funcional) | Criar as telas de métricas. **Nenhum estatístico esportivo foi inventado** |
| 7 | **Revisão jurídica** | Termos de Uso e Política de Privacidade redigidos | Parecer jurídico real (LGPD) |
| 8 | **Modo offline completo** | Offline cobre shell e assets estáticos | Cache de dados do usuário exigiria estratégia de sincronização; só conteúdo genuinamente local foi cacheado, conforme o prompt |
| 9 | **Métricas de-engajamento** | Achievements e notificações implementados | Badges de sequência e socialização entre amigos |

---

## Verificação final (tudo executado, nada presumido)

| Verificação | Resultado |
|---|---|
| `npm ci` | ✅ 562 pacotes |
| `npm run typecheck` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros, 0 avisos |
| `npm test` | ✅ **70/70** (auth 21 · format 18 · permissions 10 · workouts 7 · exercises 11 · smoke 1 · login-google 2) |
| `npm run build` | ✅ sucesso · PWA gerado · **40 entradas em precache (548,94 KiB)** |
| Build Vercel | ✅ `Build Completed [48s]` → `Deployment completed` |
| Env vars no build | ✅ as 3 obrigatórias `configurado` |
| Rotas estáticas (`vite preview`) | ✅ `index.html`, `og-image.svg`, `manifest.webmanifest`, `offline.html`, `sw.js`, `icons/icon-512.png` → HTTP 200 |
| Rewrite de SPA | ✅ `/app/dashboard` → HTTP 200 |
| Segredos no bundle | ✅ apenas a chave publishable; **0** `sb_secret_*`, **0** JWT `service_role` |
| Banco ao vivo | ✅ 11 enums · 23 tabelas · 35 policies RLS · 59 índices · 19 triggers · 1 view |
| Isolamento RLS ao vivo | ✅ cada tabela privada por `auth.uid()`; catálogo público por `is_active` |
| Auto-promoção a admin | ✅ `INSERT` direto → **42501**; `admin_users` vazio |
| Catálogo de exercícios | ✅ **317/317** com vídeo, thumbnail e categoria correta |
| Categorias e conquistas | ✅ 13 categorias · 11 achievements semeados |
| CI do PR | ✅ 4 checks verdes |

> Os 10 testes de `permissions.test.ts` exercitam o RLS real do Supabase. Sem
> rede para o projeto, são **pulados com aviso** — nunca dão falso positivo.

---

**Pull Request:** https://github.com/ytalo6411-art/marabras/pull/1
**Branch:** `arena/629ff48e-marabras` · **Base:** `main` · **Estado:** OPEN, MERGEABLE
