# ATHLETIX V2

Plataforma esportiva completa: biblioteca de exercícios com vídeos demonstrativos,
montagem e execução de treinos, diário nutricional com fonte verificável, evolução
do atleta e painel administrativo — com login pelo Google e banco de dados no
Supabase.

**Stack:** Vite 6 · React 18 · TypeScript (strict) · Supabase JS · Zustand · PWA

---

## Sumário

- [O que está pronto](#o-que-está-pronto)
- [Como rodar localmente](#como-rodar-localmente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Login com Google (OAuth)](#login-com-google-oauth)
- [Banco de dados e migrações](#banco-de-dados-e-migrações)
- [Como tornar alguém administrador](#como-tornar-alguém-administrador)
- [Deploy na Vercel](#deploy-na-vercel)
- [Fontes de dados](#fontes-de-dados)
- [Testes](#testes)
- [Limites dos planos gratuitos](#limites-dos-planos-gratuitos)
- [O que ainda precisa de implementação](#o-que-ainda-precisa-de-implementação)
- [Estado da verificação](#estado-da-verificação)

> 📄 **[Relatório Final (§22)](RELATORIO-FINAL.md)** — as 12 seções do master
> prompt: o que foi implementado, o que foi melhorado, APIs integradas,
> funcionalidades verificadas, serviços que exigem cadastro externo, variáveis
> de ambiente, setup do Google OAuth, conexão com o Supabase, run local,
> deploy na Vercel, limites dos planos gratuitos e o que ainda falta.

---

## O que está pronto

### Autenticação
- **Login com Google** como caminho principal (OAuth oficial do Supabase, fluxo PKCE).
- E-mail + senha com cadastro, login, **confirmação de e-mail** e **recuperação de senha**.
- Sessão persistente com renovação automática e rotação de refresh token.
- Criação automática de `profiles` e `user_preferences` no primeiro acesso (trigger no banco).
- Guarda de rotas (`RequireAuth` / `RequireAdmin`), mensagens de erro em pt-BR.
- **Sem autenticação local**: nada de `localStorage` simulando login.

### Biblioteca de exercícios
- **317 exercícios** com vídeo demonstrativo real (masculino e feminino), thumbnail,
  instruções passo a passo, cues de execução, erros comuns e orientação de respiração.
- Busca com *debounce*, filtro por músculo e dificuldade, paginação.
- Detalhe com vídeo sob demanda, atribuição e licença visíveis.

### Treinos
- Criar, editar, duplicar e excluir planos; organizar por dia da semana.
- Seletor de exercícios com busca; séries, reps, carga e descanso por exercício.
- **Modo de execução**: exercício atual, vídeo, série/reps/carga, **cronômetro de descanso**
  (com pausa e pular), próximo exercício e progresso da sessão.
- Salvamento automático ao finalizar: `workout_sessions`, `workout_sets`,
  `exercise_history` e `personal_records`.

### Nutrição
- Diário alimentar por data, com seis refeições (café, pré-treino, almoço, lanche,
  pós-treino, jantar).
- Busca em três fontes com fallback automático: banco local → **Open Food Facts** → **USDA**.
- Leitura de **código de barras** (quando a câmera está disponível).
- Registro manual e de alimentos personalizados por usuário.
- Macro totais, histórico, comparativo e registro de hidratação.
- **A origem de cada dado é sempre exibida.** Nada de valores nutricionais inventados.

### Evolução
- Gráfico de volume (SVG próprio, sem dependência), barras de sessões semanais,
  medidas corporais e recordes pessoais.

### Painel administrativo (`/admin`)
- Estatísticas da plataforma, listagem de usuários, catálogo de exercícios,
  log de auditoria e gestão de conteúdo.
- Acesso controlado por **RLS + `is_admin()` no banco** — o front-end não decide
  quem é admin.

### Outros
- Dashboard com dados reais (nada de números fictícios) e fluxo de boas-vindas.
- Perfil com metas, export JSON (LGPD) e Configurações com exclusão de conta.
- PWA instalável, service worker, página offline.
- Notificações, central de suporte, Termos de Uso e Política de Privacidade.

---

## Como rodar localmente

Requisitos: **Node.js 20+** e uma conta no Supabase (o projeto já está configurado —
veja `.env.example`).

```bash
npm install
cp .env.example .env      # preencha com as chaves do seu projeto
npm run dev               # http://localhost:5173
```

Outros comandos:

```bash
npm run typecheck         # tsc --noEmit (strict)
npm run lint              # eslint
npm test                  # vitest (unit + integração)
npm run build             # build de produção + service worker
npm run preview           # serve o build (porta 4173)
npm run db:types          # regenera os tipos do banco a partir do Supabase
```

### Verificação de ambiente

`npm install` executa `scripts/verify-env.mjs`, que verifica se as variáveis
obrigatórias existem **sem imprimir valores** (apenas nomes e status).

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_SUPABASE_URL` | sim | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | sim | Chave **publishable**/anônima (safe para o browser) |
| `VITE_APP_URL` | não | URL do app, usada nos redirecionamentos OAuth |
| `VITE_USDA_API_KEY` | não | Chave da USDA FoodData Central (gratuita) |
| `VITE_OPENFOODFACTS_BASE_URL` | não | Padrão: `https://world.openfoodfacts.org` |
| `VITE_USDA_BASE_URL` | não | Padrão: `https://api.nal.usda.gov/fdc` |
| `VITE_WGER_BASE_URL` | não | Padrão: `https://wger.de/api/v2` |
| `VITE_FREEEXERCISEDB_BASE_URL` | não | URL do dataset de exercícios com vídeos |
| `VITE_BARCODE_DETECTOR_BASE_URL` | não | Endpoint alternativo de leitura de código de barras |

> **Nunca** prefixe uma `service_role` com `VITE_`. Variáveis com esse prefixo são
> embutidas no bundle do navegador. O `service_role` só deve existir em variáveis
> de ambiente do servidor (Vercel) e jamais em código do front-end.

---

## Login com Google (OAuth)

O código do botão "Entrar com Google" **já está pronto** — o que falta é a
configuração do provedor no Supabase, que exige credenciais que só o dono da
conta Google Cloud pode criar.

### 1. Criar o projeto no Google Cloud

1. Acesse <https://console.cloud.google.com/> e crie um projeto novo.
2. Ative a **OAuth 2.0 Client ID** em *APIs & Services → Credentials*.
3. Crie um cliente do tipo **Web application**.

### 2. Preencher as URIs

| Campo | Valor |
|---|---|
| **Authorized JavaScript origins** | `http://localhost:5173` e `https://athletix.vercel.app` |
| **Authorized redirect URIs** | `https://tazszwllacwqccfjnglk.supabase.co/auth/v1/callback` |

> O redirect do Google **precisa** ser exatamente a URL de callback do Supabase.
> Para produção em outro domínio, acrescente a variante
> `https://<seu-ref>.supabase.co/auth/v1/callback`.

### 3. Habilitar no Supabase

- **Authentication → Providers → Google**: ative e informe
  - *Client ID*: o ID do passo 2
  - *Client Secret*: o secret do passo 2
- **Authentication → URL Configuration**:
  - *Site URL*: `https://athletix.vercel.app` (ou `http://localhost:5173` em dev)
  - *Redirect URLs*: inclua `http://localhost:5173/**`, `http://localhost:4173/**`,
    `https://athletix.vercel.app/**` e o callback do Supabase.

### 4. Confirmar que está funcionando

Clique em "Entrar com Google". O fluxo redireciona para o Google, volta para o
ATHLETIX e o perfil é criado automaticamente no primeiro acesso.

Sem o Google configurado, o login por e-mail e senha continua funcionando — o
botão apenas informa que o provedor não está habilitado.

---

## Banco de dados e migrações

Projeto Supabase: `athletix` — ref `tazszwllacwqccfjnglk` (região `sa-east-1`).

**23 tabelas**, **35 políticas de RLS**, **59 índices**, **19 triggers**, 1 view
(`dashboard_summary`), 11 enums.

### Estrutura

| Área | Tabelas |
|---|---|
| Usuário | `profiles`, `user_preferences`, `fitness_goals`, `body_measurements` |
| Exercícios | `exercises`, `exercise_categories`, `exercise_history`, `personal_records` |
| Treinos | `workout_plans`, `workout_exercises`, `workout_sessions`, `workout_sets`, `saved_workouts` |
| Nutrição | `nutrition_profiles`, `food_database`, `food_diary`, `meal_entries`, `hydration_logs` |
| Sistema | `achievements`, `user_achievements`, `notifications`, `admin_users`, `audit_logs` |

### Aplicar as migrações

```bash
supabase link --project-ref tazszwllacwqccfjnglk
supabase db push          # aplica supabase/migrations/*.sql
supabase db reset         # recria localmente do zero (com seed)
```

Os arquivos em `supabase/migrations/` estão na **ordem correta de aplicação**
(tabelas → funções → triggers → RLS). O seed do catálogo de exercícios está em
`supabase/seed/exercises.json` e `supabase/seed/exercises.sql`.

### Segurança em camadas

- **RLS em todas as tabelas com dados de usuário.** A regra é sempre
  `user_id = auth.uid()` — a checagem acontece **no banco**, não no front-end.
- `is_admin()` é uma função `SECURITY DEFINER` que lê `admin_users`.
- `public.grant_admin(text)` é executável **apenas** por `service_role`
  (`anon` e `authenticated` não têm o privilégio) — usuário não se auto-promove.
- Triggers de auditoria registram alterações em 8 tabelas.
- `updated_at` é mantido automaticamente em 11 tabelas.

Verificação rápida:

```sql
-- deve retornar 0 linhas para um cliente anônimo
SELECT * FROM public.workout_sessions;
-- deve falhar com 42501
INSERT INTO public.admin_users (user_id, role, granted_by)
VALUES (gen_random_uuid(), 'admin', gen_random_uuid());
```

---

## Como tornar alguém administrador

**Não existe senha de admin no front-end** e o usuário não consegue se
promover. A promoção é feita pelo dono do projeto, no servidor.

### Opção A — SQL Editor do Supabase (mais simples)

1. Abra o projeto em <https://supabase.com/dashboard> → **SQL Editor**.
2. O usuário precisa existir. Encontre o `id`:

   ```sql
   SELECT id, email, raw_user_meta_data->>'full_name' AS nome
   FROM auth.users
   WHERE email = 'voce@email.com';
   ```

3. Conceda o papel:

   ```sql
   SELECT public.grant_admin('voce@email.com');
   ```

   A função valida se o e-mail existe e cria o registro em `admin_users`.

### Opção B — API de Management com a `service_role`

```bash
curl -X POST "https://<ref>.supabase.co/rest/v1/rpc/grant_admin" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user_email":"voce@email.com"}'
```

### Verificar

```sql
SELECT user_id, role, granted_at FROM public.admin_users;
```

O usuário passa a enxergar `/admin` na próxima navegação.

> A `service_role` **nunca** deve ir para o front-end nem para o GitHub.

---

## Deploy na Vercel

O `vercel.json` já define `buildCommand`, `outputDirectory`, os *rewrites* de SPA,
os cabeçalhos de segurança e o cache de assets.

### 1. Conectar o repositório

Na Vercel: **Add New → Project** → importe `ytalo6411-art/marabras`. O framework
é detectado como **Vite**.

### 2. Variáveis de ambiente (obrigatórias em produção)

| Nome | Valor | Status |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://tazszwllacwqccfjnglk.supabase.co` | ✅ já configurada |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_H1FWYc65L5D8qF3Dh902ew_pIgt2dCX` | ✅ já configurada |
| `VITE_APP_URL` | `https://athletix.vercel.app` | ✅ já configurada |
| `VITE_USDA_API_KEY` | *(opcional)* chave da USDA | ⚠️ não configurada |

> As três variáveis obrigatórias já foram cadastradas nos projetos Vercel
> `marabas` e `projeto-maramba`, em **Production**, **Preview** e
> **Development**. O log de build confirma:
> `✓ VITE_SUPABASE_URL configurado / ✓ VITE_SUPABASE_ANON_KEY configurado`.
>
> Só a chave **publishable** (`sb_publishable_…`) é usada no frontend — ela é
> pública por design e protegida pelo RLS. A `service_role` **nunca** deve ser
> prefixada com `VITE_`; nenhum segredo é gravado no bundle do navegador.
>
> No Vercel, Production / Preview / Development têm listas de variáveis
> separadas — preencha **Production** e **Preview**.

### 3. Atualizar o Supabase

Depois do primeiro deploy, volte ao Supabase → **Authentication → URL Configuration**
e troque o *Site URL* por `https://athletix.vercel.app`, adicionando o domínio às
*Redirect URLs*. Depois ative o Google (seção acima) com a origem de produção.

### 4. Deploy

```bash
npm i -g vercel
vercel link
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_APP_URL production
vercel --prod
```

---

## Fontes de dados

| Fonte | Uso | Chave | Limite | Licença |
|---|---|---|---|---|
| **Free Exercise DB with Videos** | 317 exercícios + 593 vídeos demonstrativos | não | sem limite documentado | MIT |
| **wger** | Exercícios e nutrição (fallback) | não | sem limite publicado | AGPL-3.0 (código) / CC-BY-SA (dados) |
| **Open Food Facts** | Produtos industrializados, código de barras | não | sem limite rígido (search retorna 503 com frequência) | ODbL — atribuição obrigatória |
| **USDA FoodData Central** | Alimentos básicos, micros | **sim** (gratuita) | DEMO_KEY: 30/h e 50/dia · chave registrada: ~1.000/h | Domínio público |

Regras seguidas:

- **O dado sempre mostra a origem.** `source` e `source_url` viajam junto do registro.
- **Os vídeos não vão para o Supabase Storage.** As URLs apontam para o CDN público
  e o player carrega sob demanda (clique para tocar, sem *autoplay*).
- **Fallback em cadeia.** Se a USDA cai, o app usa Open Food Facts; se a OFF falha,
  o app usa o banco local e a entrada manual.
- **Nada é inventado.** Se a fonte não tem o dado, o campo fica vazio — não é
  preenchido com estimativa inventada.

### Obrigação de atribuição (Open Food Facts / ODbL)

A interface exibe a origem de cada alimento. Para distribuição pública com base
de dados derivada, a ODbL exige compartilhamento sob a mesma licença — confirme
com o jurídico antes de publicar um fork do banco.

---

## Testes

```bash
npm test
```

**60 testes** cobrindo:

- **Autenticação** — tradução de erros, login Google (redirecionamento correto),
  login por e-mail, cadastro, recuperação de senha, e a garantia de que a
  mensagem crua do backend **nunca** chega ao usuário.
- **Catálogo de exercícios** — normalização do dataset (músculo, equipamento,
  dificuldade, presença de vídeo/thumbnail), para que uma mudança de formato na
  fonte quebre os testes em vez da UI em produção.
- **RLS e permissões** — cliente anônimo não lê perfis, sessões, diário alimentar,
  `admin_users` nem `audit_logs`; escrita não autorizada é recusada.
  *Os testes de integração detectam o Supabase inacessível e são pulados com
  aviso explícito, para que a suíte continue rodando offline.*
- **Regras de treino** — payload do plano/exercício e cálculo de volume.
- **Formatadores** — datas, durações, números e percentuais em pt-BR.

---

## Limites dos planos gratuitos

Não assuma que "gratuito" é "ilimitado".

| Serviço | Plano | Limite relevante |
|---|---|---|
| Supabase | Free | 500 MB de banco · 1 GB de egress/mês · 5 GB de storage · pausas após 1 h de inatividade · 2 projetos |
| Vercel | Hobby | 100 GB de bandwidth/mês · funções serverless com limites de duração |
| USDA | DEMO_KEY | 30 req/h e 50 req/dia (por IP) — **use uma chave registrada** |
| Open Food Facts | — | sem limite rígido; o *search* retorna 503 com frequência (o *lookup* por código de barras é estável) |
| Free Exercise DB | — | sem limite publicado |

Consequências práticas já tratadas no código: cache em memória de 5 min nas
buscas, *debounce* na digitação, paginação, carregamento sob demanda de vídeos e
skeletons de carregamento.

---

## O que ainda precisa de implementação

Os itens abaixo **não** estão prontos e não devem ser tratados como funcionais:

1. **Google OAuth habilitado** — o código está pronto; falta a credencial do dono
   (§ "Login com Google"). Sem ela, o botão avisa que o provedor não está ativo.
2. **E-mail transacional** — a recuperação de senha precisa de SMTP configurado
   no Supabase (o padrão tem limite baixo).
3. **Catálogo grande de alimentos** — o seed local tem 8 produtos com código de
   barras. Com uma `VITE_USDA_API_KEY`, `scripts/seed-foods.mjs` popula o catálogo
   completo de alimentos básicos.
4. **Assistente de IA** — a arquitetura está preparada (sem chave no front-end),
   mas **não há provedor configurado**. Nada no app finge ter IA ativa.
5. **Leitor de código de barras nativo** — depende de `BarcodeDetector` no
   navegador; há fallback para digitação manual.
6. **Métricas por modalidade esportiva** — o schema suporta 14 modalidades,
   mas as planilhas por esporte ainda não foram criadas.
7. **Revisão jurídica** — Termos de Uso e Política de Privacidade são uma base
   de trabalho redigida, **não** parecer jurídico.

---

## Estado da verificação

O que foi **executado e passou** (nada aqui é presumido):

| Verificação | Resultado |
|---|---|
| `npm ci` | 562 pacotes, sucesso |
| `npm run typecheck` | 0 erros |
| `npm run lint` | 0 erros, 0 avisos |
| `npm test` | **60/60** (auth 14, format 18, permissions 10, workouts 7, exercises 11) |
| `npm run build` | sucesso, PWA gerado, **40 entradas em precache (548,94 KiB)** |
| Build na Vercel | `Build Completed [48s]`, `Deployment completed` |
| Env vars no build | `✓ VITE_SUPABASE_URL` / `✓ VITE_SUPABASE_ANON_KEY` / `✓ VITE_APP_URL` |
| Rotas estáticas (`vite preview`) | `index.html`, `og-image.svg`, `manifest.webmanifest`, `offline.html`, `sw.js`, `icons/icon-512.png` → HTTP 200 |
| Rewrite de SPA | `/app/dashboard` → HTTP 200 |
| Segredos no bundle | nenhum `sb_secret_*`, nenhum JWT `service_role`; apenas a chave publishable |
| Banco (Supabase, ao vivo) | 11 enums · 23 tabelas · 35 policies RLS · 59 índices · 19 triggers · 1 view |
| Isolamento RLS (ao vivo) | cada tabela privada filtra por `auth.uid()`; catálogo público por `is_active` |
| Auto-promoção a admin | `INSERT` direto → `42501` (policy RLS bloqueia); `admin_users` permaneceu vazio |
| Catálogo de exercícios (ao vivo) | **317/317** com vídeo, thumbnail e categoria correta |
| CI do PR | `Verificar (typecheck, lint, testes, build)` ✅ · `Vercel – marabas` ✅ · `Vercel – projeto-maramba` ✅ · `Vercel Preview Comments` ✅ |

> Os 10 testes de `permissions.test.ts` exercitam o RLS real do Supabase; quando
> a rede para o projeto não está disponível, eles são **pulados com aviso** em
> vez de dar falso positivo.

---

## Estrutura

```
src/
  components/    AppShell, VideoPlayer, ui.tsx, icons.tsx
  lib/           supabase.ts (cliente + PKCE)
  pages/         15 telas (lazy-loaded)
  services/      auth.ts, exercises.ts, nutrition.ts
  stores/        auth.ts (Zustand)
  styles/        global.css (design system)
  types/         database.ts
  __tests__/     auth, format, permissions, workouts, exercises
supabase/
  migrations/    schema completo (tabelas → RLS)
  seed/          catálogo de exercícios + alimentos
scripts/         verify-env.mjs, seed-exercises.mjs, seed-foods.mjs
public/          favicon.svg, og-image.svg, offline.html, icons/
```

---

## Licença

Código do ATHLETIX: MIT.
Dados de terceiros mantêm suas próprias licenças (ver "Fontes de dados").
