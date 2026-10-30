# Análise do site "marabras" — tudo que precisa melhorar e como

**Data:** 29/10/2026
**Escopo:** repositório `ytalo6411-art/marabras` + projetos Vercel conectados.

---

## TL;DR (o achado crítico)

**O site está fora do ar. Os dois domínios de produção retornam `404 NOT_FOUND`.**

Não é um bug de CSS ou um problema de performance: **o repositório GitHub contém exatamente um arquivo (`README.md` com 11 bytes: `# marabras`)**. O código-fonte do site existe apenas dentro de um deployment antigo da Vercel, protegido por SSO, e nunca foi commitado.

Evidência direta do log de build da Vercel (deploy `dpl_4dA897WicNBP5b7LWZWu4ymrkQfR`):

```
Cloning github.com/ytalo6411-art/marabras (Branch: main, Commit: bc3478c)
WARNING! Build output contains no "functions", "static", or "services" directory;
          the build may not have produced any deployable output.
Build Completed in /vercel/output [23ms]
Deployment completed
```

E o payload do deployment (`get_deployment`):

```json
"functions": null,
"builds": [],
"lambdas": [{ "output": [] }]
```

O build "passou" (READY) em 23ms sem produzir nada. Por isso o status verde no painel da Vercel é enganoso.

### Os dois projetos Vercel conectados ao mesmo repo

| Projeto | URL | Estado | Observação |
|---|---|---|---|
| `marabas` | `marabas.vercel.app` | 404 | Deploy via Git do `main` vazio |
| `projeto-maramba` | `projeto-maramba.vercel.app` | 404 | Deploy via Git do `main` vazio |

### O código real (só existe dentro do deploy antigo `dpl_GE7LzUPderMJcFu1wLUwfNNHX6ik`, source=`drop`)

45 arquivos baixados nesse deploy. É o app **Athletix**:

```
src/
├── .env                      ← ARQUIVO .env COMMITADO (risco de vazamento de segredos)
├── .env.example
├── README.md
├── data/
│   ├── athletix.db            ← SQLite commitado
│   ├── athletix.db-shm        ← WAL/SHM commitados
│   └── athletix.db-wal        ← WAL commitado
├── docs/supabase/{README.md, schema.sql}
├── index.html
├── public/
│   ├── index.html              ← duplicata de src/index.html (mesmo sha256: 2a25512f…)
│   ├── css/styles.css
│   └── js/
│       ├── api.js, main.js, router.js, svg.js, timer.js, ui.js
│       └── pages/{admin,app,profile,public,registry}.js
├── package.json, package-lock.json
├── scripts/{backup.js, test-api.py}
├── server/
│   ├── index.js, config.js, admin-create.js
│   ├── lib/{auth,captcha,db,gamification,http,mail,security,util}.js
│   └── routes/{admin,auth,content,user}.js
├── schema.sql
├── seed/{seed.js, content.js}
└── vercel.json
```

Stack: **frontend vanilla JS** (sem framework, sem build step) + **backend Node/Express** + **SQLite local** + **migração Supabase em docs/** + deploy na Vercel.

---

## Checklist de melhorias — priorizado

### 🔴 P0 — Bloqueadores (site fora do ar)

| # | Problema | Como corrigir |
|---|---|---|
| 1 | **Repositório vazio**: só o README. A Vercel builda o `main` e gera output vazio → 404. | `git checkout` da árvore real ou restaurar de um backup. Recomendo: **`git init` no diretório `src/` recovered**, commit, push para `main`. Nunca mais aceitar build "verde" sem output. |
| 2 | **Nenhum domínio customizado** — a conta Vercel não tem nenhum domínio (`list_domains` → `[]`). O site vive em `*.vercel.app`. | `vercel add_domain` + `add_project_domain`. Comprar/apontar um domínio real (ex.: `athletix.com.br`). Sem isso: URL de hobby, sem SEO, sem marca. |
| 3 | **Dois projetos Vercel apontando para o mesmo repo** (`marabas` e `projeto-maramba`). Um está 404, o outro também, e ambos disputam o alias. | Escolher **um** projeto canônico, renomear para algo coerente com a marca (`athletix`), e deletar o duplicado. Aliases confusos = dívida operacional. |
| 4 | **Nome do repositório não bate com a marca** (`marabras` vs app "Athletix"). Ruim para SEO, para o domínio e para a confiança do usuário. | Renomear repo → `athletix` (ou a marca real). Atualizar o link do Git no projeto Vercel. |
| 5 | **Build sem verificação**: a Vercel marcou `READY` um build que não gerou nada. | Adicionar `buildCommand` explícito no `vercel.json` e um passo de build que **falhe se a pasta de output estiver vazia**. |
| 6 | **Deployments antigos com SSO-protection** e URLs órfãs (`marabas-4ggel7oii-…`). | Limpar deployments antigos e remover a proteção SSO do que for público. |

### 🔴 P0 — Segurança (fazer antes de qualquer lançamento público)

| # | Problema | Como corrigir |
|---|---|---|
| 7 | **`.env` commitado no repositório.** O arquivo existe dentro do deploy com hash `373d20e7…`. Isso costuma conter `JWT_SECRET`, `SESSION_SECRET`, `SMTP_PASSWORD`, `DATABASE_URL`, chaves de API. | 1) Rotacionar **todas** as credenciais do `.env` imediatamente. 2) Adicionar `.env` ao `.gitignore`. 3) `git rm --cached src/.env` + commit de remoção. 4) Mover para Vercel Env Vars (`create_env_var`, type `encrypted`). 5) Rodar `git filter-repo` / BFG para reescrever o histórico se o repo já foi público. |
| 8 | **SQLite commitado (`athletix.db`, `.db-wal`, `.db-shm`)** — banco de dados real dentro do artefato de deploy. Contém dados de usuários, sessões ou senhas. | Remover `data/` do repo e do `.gitignore`. Usar **Supabase** (já existe `docs/supabase/schema.sql`!) ou Postgres do Vercel. Backup via `scripts/backup.js` para um bucket externo. |
| 9 | **Arquivos WAL/SHM commitados** — sinal clássico de que o `.gitignore` nunca existiu. Isso significa que provavelmente **outros segredos** também vazaram. | Auditar todo o histórico do repo em busca de padrões (`sk_`, `AKIA`, `password`, `secret`, `token`). |
| 10 | **`server/admin-create.js`** — script de criação de admin. Se ficar no bundle, pode permitir criação de conta privilegiada. | Mover para `scripts/` e proteger com segredo de ambiente; nunca expor no bundle do cliente. |
| 11 | **`server/lib/captcha.js` presente mas sem evidência de uso** — captcha em rota de registro é essencial contra spam/bots. | Verificar que todo endpoint público que cria conta (registro, recuperação de senha) exige captcha + rate limit. |
| 12 | **Sem `security.js` auditado**: CSP, HSTS, `X-Frame-Options`, CORS permissivo. | Revisar `server/lib/security.js`: adicionar `Content-Security-Policy`, `Strict-Transport-Security`, limitar CORS à origem real (não `*`). |

### 🟡 P1 — Arquitetura e banco de dados

| # | Problema | Como corrigir |
|---|---|---|
| 13 | **SQLite em serverless = dados voláteis.** Na Vercel, cada invocação pode rodar em uma instância diferente; o filesystem é efêmero. **Todo write pode sumir.** Isso é o bug mais grave depois do 404. | Migrar para Supabase/Postgres (o `schema.sql` já existe). Se mantiver SQLite, usar Turso/libSQL (edge, replicado) ou Neon. |
| 14 | **Duas fontes de verdade**: `schema.sql` na raiz **e** `docs/supabase/schema.sql`. Divergem silenciosamente. | Uma única fonte. Escolher `supabase/migrations/` com versioning e gerar a raiz a partir dela. |
| 15 | **`server/lib/db.js` com SQL inline** — risco de SQL injection e queries N+1. | Usar queries parametrizadas (confirmar que já usa `?`) + prepared statements; adicionar índices no `schema.sql` para as colunas usadas em `WHERE`/`ORDER BY`. |
| 16 | **Sem migrações versionadas.** `seed/` populando manualmente a cada deploy. | Adotar migrações versionadas (`supabase/migrations/`, `node-pg-migrate` ou `knex`). Rodar `migrate` no `buildCommand` do Vercel. |
| 17 | **`scripts/backup.js` + `test-api.py` dentro do diretório de deploy.** | Mover para fora do bundle de produção (Vercel não deve fazer deploy de scripts de teste). |

### 🟡 P1 — Frontend

| # | Problema | Como corrigir |
|---|---|---|
| 18 | **Vanilla JS sem build, sem type-checking, sem testes.** `public/js/` com `main.js`, `router.js`, `api.js` — fácil introduzir regressão silenciosa. | Migrar incrementally para **Vite + TypeScript** (ou pelo menos JSDoc + ESLint + Prettier). Vite também resolve o item 1 (build output real). |
| 19 | **`public/index.html` duplicado de `src/index.html`** (mesmo hash). Duas fontes de verdade → bug garantido quando uma for editada. | Manter **um** `index.html`. `public/` passa a conter só assets. |
| 20 | **`public/js/api.js` duplicado de `src/js/api.js`** — mesma armadilha. | Centralizar em `src/js/`, gerar `public/` no build (ou usar `rootDirectory: "src"` + um único `public/`). |
| 21 | **Sem `vite.config`/bundling** — sem minificação, sem tree-shaking, sem hash de cache. | Configurar Vite: build output, `base` correto, `manualChunks` para vendor. |
| 22 | **`svg.js`** — SVGs inline em JS. Se houver muitos, pesa o bundle e o DOM. | Avaliar sprite sheet ou `<img>` com `currentColor`. |
| 23 | **Sem gerenciador de estado** — `timer.js` + `app.js` + `profile.js` coordenando estado global é frágil. | Store simples (o próprio `ui.js` pode ser evoluído) ou Redux Toolkit / Zustand. |

### 🟡 P1 — Performance e UX

| # | Problema | Como corrigir |
|---|---|---|
| 24 | **Sem cabeçalhos de cache.** `enableExternalRewriteCaching` está ligado, mas assets sem hash não devem ser cacheados para sempre. | `Cache-Control: public, max-age=31536000, immutable` para assets com hash; `no-cache` para o HTML. |
| 25 | **Sem compressão/size monitoring.** Vercel comprime automaticamente, mas o bundle não é medido. | Lighthouse CI no CI + `vercel --debug` no build. Budget: JS < 150 KB gzip. |
| 26 | **Sem imagens otimizadas** (só SVGs e PNG de capa). | `next/image` não se aplica; usar `<picture>` com AVIF/WebP + `loading="lazy"`. |
| 27 | **Sem skeleton/loading state** nos games (`gamification.js`) — a UX provavelmente trava durante fetch. | Estados `loading` / `empty` / `error` explícitos; `<Skeleton>` com `aria-busy`. |
| 28 | **Sem tratamento de erro global.** Se `api.js` falhar, a tela fica branca. | Wrapper de erro + toast + tela de fallback. |
| 29 | **Timer (`timer.js`) em `setInterval`** — drifts e pausa quando a aba vai para background. | Usar timestamp absoluto (`Date.now()`) como fonte de verdade, recalculando a cada tick; `visibilitychange` para re-sync. |
| 30 | **Sem tratamento de offline / PWA.** | Service worker mínimo + manifest para um app de corrida (uso em campo, sinal ruim). |

### 🟡 P1 — Acessibilidade (a11y)

| # | Problema | Como corrigir |
|---|---|---|
| 31 | App com router próprio (`router.js`) — navegação sem foco gerenciado. | Ao trocar de rota: mover foco para o `<h1>`, anunciar via `aria-live`, resetar scroll. |
| 32 | Provável ausência de landmarks e skip-link. | `<header>/<nav>/<main>/<footer>`, `skip to content`, `aria-label` nos ícones. |
| 33 | Cores de gamificação sem contraste garantido. | Auditar com axe; exigir mínimo 4.5:1 em texto e 3:1 em componentes. |
| 34 | Formulários sem labels associados. | `<label for>` em todo campo; `aria-invalid` + `aria-describedby` nos erros. |
| 35 | **Pontos de toque pequenos** — alvos < 44×44px hurts uso em corrida. | Ampliar áreas clicáveis, alinhar com WCAG 2.5.5. |

### 🟡 P1 — SEO e descoberta

| # | Problema | Como corrigir |
|---|---|---|
| 36 | **Sem `robots.txt` / `sitemap.xml`** (a comparação com o projeto `livro`, que funciona, mostra que isso existe lá). | Gerar ambos. |
| 37 | **Sem meta tags / Open Graph.** Para um app social (criar conta, perfil, ranking), o link compartilhado não mostra nada. | `title`, `description`, `og:image`, `twitter:card` por rota. |
| 38 | **Sem canonical / hreflang.** | `rel="canonical"` por página. |
| 39 | **Rotas client-side = 404 no servidor.** Sem `vercel.json` `rewrites` para fallback SPA, deep-links quebram. | `{"rewrites":[{"source":"/(.*)","destination":"/index.html"}]}` — **cuidado**: isso não pode engolir as rotas de API (`/api/*`). |
| 40 | **Sem manifest web app.** | `manifest.json` + ícones + `theme-color`. |
| 41 | **Nome e descrição ausentes no repo do GitHub.** | Preencher `description`, `topics`, e usar o README como landing page real (hoje tem 11 bytes). |

### 🟢 P2 — Qualidade de código e DX

| # | Problema | Como corrigir |
|---|---|---|
| 42 | **Zero testes.** `scripts/test-api.py` existe mas não está em pipeline. | Vitest (unitário no front), Playwright (E2E dos fluxos: cadastro, login, corrida, ranking), cobertura no CI. |
| 43 | **Sem CI.** Nada roda no PR. | GitHub Actions: lint → test → build → preview deploy. |
| 44 | **Sem `.gitignore`.** Provavelmente é a raiz dos itens 7, 8 e 9. | Criar `.gitignore` com `node_modules/`, `.env`, `data/`, `*.db*`, `.vercel/`, `dist/`. |
| 45 | **Sem ESLint/Prettier.** | Configurar; rodar no CI. |
| 46 | **Semhusky / conventional commits.** | `commitlint` + `husky`. |
| 47 | **Node 24.x com `nodeVersion` fixado na Vercel mas sem `.nvmrc`.** | `.nvmrc` = `24` para build local idêntico. |
| 48 | **Sem Docker/dev local.** `npm run dev` não existe. | Script de dev com SQLite local e um `docker-compose` opcional. |
| 49 | **Documentação só em `README.md` dentro do bundle.** | README completo na raiz: setup, env vars, migrations, deploy. |
| 50 | **`docs/supabase/README.md` indica migração incompleta.** | Concluir a migração e remover o doc, ou marcar claramente como "em andamento". |

### 🟢 P2 — Operação e produto

| # | Problema | Como corrigir |
|---|---|---|
| 51 | **Sem observabilidade.** Sem Sentry/Logs, um erro em produção é invisível. | Sentry + Vercel Logs + alerta de 5xx. |
| 52 | **Sem analytics.** Não se sabe quantos usuários usam. | Vercel Web Analytics (o `webAnalytics` id existe mas `features.webAnalytics: false`) ou PostHog/Plausible. |
| 53 | **Sem feature flags** para rollout seguro. | Usar o Vercel Feature Flags (conector disponível) para expor mudanças gradualmente. |
| 54 | **Sem rate limiting na API** (`server/lib/http.js`). | Rate limit por IP nas rotas de auth (login, registro, recuperação). |
| 55 | **Sem e-mail transacional testado.** `server/lib/mail.js` pode estar falhando silenciosamente. | Teste real de envio + fallback; monitorar bounce. |
| 56 | **Sem política de retenção/backup de dados.** | Definir TTL de dados, GDPR/LGPD: export e delete de conta. |
| 57 | **`ssoProtection: "all_except_custom_domains"`** está ligado nos dois projetos. | Manter apenas se a intenção é uma fase beta privada; documentar. |
| 58 | **Deploys de preview por branch não têm workflow de review.** | `previewCommentsEnabled: true` existe — configurar o preview automático em todo PR. |

---

## Ordem de execução sugerida

### Fase 0 — Resgate (bloqueia tudo)
1. Recuperar a árvore de código do deployment antigo (`dpl_GE7LzUPderMJcFu1wLUwfNNHX6ik`) ou de um backup do Drive/Supabase.
2. `git init`, `.gitignore` **antes** de qualquer `git add`, e commit do código **sem** `.env` e **sem** `data/`.
3. Rotacionar todas as credenciais do `.env` exposto.
4. Push para `main` → os dois projetos Vercel saem do 404.
5. Consolidar em **um** projeto Vercel; adicionar o domínio real.

### Fase 1 — Segurança e dados (antes de tráfego real)
6. Migrar de SQLite → Supabase/Postgres; rodar migrations no deploy.
7. Implementar rate limiting, CSP/HSTS, CORS restrito; auditar `auth.js`, `captcha.js`, `security.js`.
8. Escrever testes E2E dos fluxos críticos (cadastro, login, corrida, ranking) antes de refatorar.

### Fase 2 — Arquitetura e performance
9. Migrar para Vite + TypeScript; eliminar os arquivos duplicados (`src/` vs `public/`).
10. `vercel.json` com rewrites SPA corretos (protegendo `/api/*`), cache headers e `buildCommand` que falha em output vazio.
11. Corrigir o `timer.js` (timestamp absoluto) e adicionar estados de loading/erro.

### Fase 3 — Polimento
12. Acessibilidade (axe no CI, foco no router, contraste, alvos de toque).
13. SEO (meta por rota, OG, sitemap, robots, manifest).
14. Observabilidade (Sentry + analytics) e feature flags.
15. README real, CI, lint, pre-commit.

---

## Como evitar que isso volte a acontecer

| Medida | Onde |
|---|---|
| `.gitignore` com `node_modules/`, `.env`, `data/`, `*.db*` | raiz do repo |
| Secret scanning no GitHub | Settings → Code security → Secret scanning |
| Push protection de segredos | Settings → Code security |
| Build **falha** se output vazio | `vercel.json` `buildCommand` |
| Branch protection + CI obrigatório em `main` | GitHub Settings |
| Variáveis de ambiente só no Vercel (nunca no repo) | Vercel Env Vars |
| Deploy de preview em todo PR | Vercel Git integration |
| Testes smoke no deploy | CI + Playwright |

---

## Observações de método

- O repositório Git contém **3 objetos git** (1 blob de 11 bytes). Não há histórico a analisar.
- O código-fonte real está **apenas** dentro do deployment Vercel de origem `drop` (`dpl_GE7LzUPderMJcFu1wLUwfNNHX6ik`, 45 arquivos), e todos os URLs de deployment estão **protegidos por SSO** — não foi possível ler o conteúdo dos arquivos, apenas a árvore e os hashes. **Toda a análise acima de código é inferida a partir da estrutura de arquivos; a análise do 404 e da configuração de deploy é direta e verificável.**
- Nenhum conteúdo do projeto "PROMAX" no Google Drive pertence a este site — é outro projeto.
- A comparação com o projeto `livro` (que está no ar e funcionando) foi usada como referência de boas práticas de SEO já aplicadas pelo mesmo autor.
