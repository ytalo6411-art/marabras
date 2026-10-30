# ATHLETIX — Diagnóstico técnico e plano de execução

> Documento de engenharia da evolução "Athletix ProMax". Base: commit `d13d41d` (main).
> Tudo abaixo foi verificado no código do repositório — não é suposição.

---

## 1. Inventário do que existe hoje

### Stack e build

| Item | Estado |
| --- | --- |
| Framework | Vite 6 + React 18 + TypeScript strict (`noUncheckedIndexedAccess`) |
| Roteamento | `react-router-dom` 6, rotas lazy com `Suspense` |
| Estado | Zustand (`src/stores/auth.ts`) |
| Backend | Supabase (Postgres + Auth + RLS), SDK JS direto no browser |
| PWA | `vite-plugin-pwa` (autoUpdate, cache de imagens/fontes, offline.html) |
| Testes | Vitest + Testing Library — **70 testes passando** em 7 arquivos |
| Deploy | Vercel (`vercel.json`: rewrites SPA, headers de segurança, cache imutável de assets) |

### Páginas e rotas

`/app/login`, `/auth/reset-password`, `/app` (dashboard), `/app/exercises`,
`/app/exercises/:slug`, `/app/workouts`, `/app/workouts/new`, `/app/workouts/:id`,
`/app/session/:id`, `/app/nutrition`, `/app/progress`, `/app/profile`,
`/app/settings`, `/app/notifications`, `/app/admin`, `/app/support`, `/legal/:doc`.

Guards: `RequireAuth` e `RequireAdmin` — o admin é decidido no banco
(`public.is_admin()`), não no front.

### Banco (23 tabelas, todas com RLS)

`profiles`, `user_preferences`, `fitness_goals`, `exercise_categories`,
`exercises` (317 registros semeados), `workout_plans`, `workout_exercises`,
`workout_sessions`, `workout_sets`, `exercise_history`, `personal_records`,
`body_measurements`, `nutrition_profiles`, `food_database`, `food_diary`,
`meal_entries`, `hydration_logs`, `achievements`, `user_achievements`,
`notifications`, `saved_workouts`, `admin_users`, `audit_logs` (+ view
`dashboard_summary` com `security_invoker`).

### APIs e integrações já presentes

| Integração | Uso no código | Autenticação | Limites / licença | Tratamento de erro |
| --- | --- | --- | --- | --- |
| **Supabase** | Auth, dados, RLS | anon key (pública) + JWT do usuário | Plano free: 500 MB DB, 5 GB egress | try/catch + estados de UI |
| **Free Exercise DB with Videos** (GitHub raw) | Catálogo com vídeo MP4, thumb, passos, erros comuns | nenhuma | MIT, sem rate limit declarado (CDN GitHub) | fallback para wger |
| **wger** | Catálogo complementar, imagens | nenhuma (leitura) | AGPL-3.0 nos dados; API pública, cota não publicada | ignora falha e devolve o que tem |
| **Open Food Facts** | Alimentos industrializados / código de barras | nenhuma | ODbL; 100 req/min (fair use), 10 req/min para busca | fallback USDA |
| **USDA FoodData Central** | Composição nutricional oficial | API key opcional (DEMO_KEY: 30 req/h) | domínio público | fallback banco local |
| **Barcode detector** | Env opcional ainda vazia | — | — | digitação manual |
| **Google OAuth** | Login | via Supabase provider | — | detecção de provider desabilitado |
| **IA / LLM** | **não existia** | — | — | — |

**Conclusões do inventário de APIs**

1. Não havia chamadas duplicadas por renderização: `searchExercises` já tem cache
   de memória de 5 min, e o nutrition já faz fallback em cascata.
2. Faltava uma camada central única: normalização/cache/timeout/telemetria estavam
   espalhados e não existia *timeout* em nenhuma chamada externa (uma API lenta
   podia travar a tela indefinidamente).
3. Não havia nenhum provedor de IA. Portanto a evolução precisava de um gerador
   **determinístico** de verdade — e não de uma tela dizendo "IA" sem IA.

---

## 2. Problemas identificados (verificados no código)

### Funcionais / produto

| # | Problema | Evidência | Impacto |
| --- | --- | --- | --- |
| 1 | Não existe onboarding de preferências | `profiles.onboarding_completed` só é marcado ao salvar o perfil (`ProfilePage`); nenhuma pergunta de objetivo, nível, equipamento ou disponibilidade é coletada | O app não consegue personalizar nada |
| 2 | Treinos 100% manuais | `WorkoutBuilderPage` exige escolher exercício por exercício | Barreira alta para usuário novo |
| 3 | Nenhuma geração de plano | Não há serviço de geração; `saved_workouts.payload` existe mas nunca é usado para gerar treino | — |
| 4 | Sem organização de catálogo de treinos | `workout_plans` só lista planos do usuário; não há biblioteca/modelos filtráveis por objetivo, nível, ambiente, equipamento, frequência | Descoberta ruim |
| 5 | Sem plano semanal agrupado | Cada plano é uma linha isolada; um split ABC gera 3 planos soltos, sem relação | Dashboard não consegue mostrar "meu plano" |
| 6 | Dashboard genérico | `DashboardPage` mostra "treino de hoje" via `days_of_week` e cards fixos; sem próximo treino recomendado, sem sequência de dias, sem CTA de personalização | Primeira sessão pouco acionável |
| 7 | Histórico só leitura | `WorkoutsPage` lista sessões; não é possível editar observação nem excluir registro | Requisito de "corrigir registros" não atendido |
| 8 | Nenhum "treinador" | Não existe área de explicação/ajuste do plano | — |

### Técnicos

| # | Problema | Evidência |
| --- | --- | --- |
| 9 | Sem timeout em `fetch` externo | `loadFreeExerciseDb`, `loadWger`, nutrition — `fetch` cru |
| 10 | Normalização de músculos/equipamentos duplicada | MAPs dentro de `exercises.ts` e de `nutrition.ts` |
| 11 | `searchExercises` não deduplica resultados de fontes diferentes | mesmo exercício pode aparecer como wger + local |
| 12 | Teste de geração inexistente | — |
| 13 | `WorkoutBuilderPage.updateItem` faz update otimista sem tratamento de erro | `catch {}` com comentário "revert não implementado" |
| 14 | `exercises.alternatives` existe no schema mas nunca é preenchido/usado | coluna órfã |

### Segurança / privacidade

- RLS está corretamente habilitada em todas as tabelas e todas as políticas usam
  `auth.uid()` ou `is_admin()`. Nenhum `service_role` no bundle (verificado:
  só `VITE_SUPABASE_ANON_KEY`).
- Faltava política para guardar preferências de treino (tabela não existia).
- Não havia endpoint server-side; qualquer chave de IA precisaria **obrigatoriamente**
  ficar fora do bundle (`VITE_` nunca).
- Export LGPD existe (`ProfilePage.exportData`) mas não exportava treinos/preferências.

### UX / acessibilidade

- Boa base: skip-link, `aria-*` em componentes, foco no `h1` na troca de rota,
  `prefers-reduced-motion`, tema claro/escuro, contrastes razoáveis.
- Faltas: wizard multi-etapa inexistente; nenhuma indicação de progresso de
  questionário; formulários sem validação progressiva fora do login; cards de
  treino sem hierarquia de "próxima ação"; chips de filtro sem contagem.

---

## 3. Plano de execução (e o que foi entregue em cada etapa)

### Etapa 1 — Diagnóstico e inventário
Este documento + inventário de APIs acima.

### Etapa 2 — Questionário e persistência do perfil
- Migração `20260201000000_training_profile.sql`:
  - tabela `training_profiles` (1:1 com `auth.users`) com RLS own-only,
    `questionnaire jsonb`, metas, equipamentos, limitações, versão e `completed_at`;
  - colunas novas em `workout_plans` (`program_id`, `program_name`, `day_label`,
    `generated_by`, `rationale`, `level`, `environment`, `template_slug`) —
    **aditivas**, nada é removido;
  - trigger `updated_at` + auditoria + índices.
- Página `/app/onboarding`: wizard de 7 etapas (perfil → objetivos → local e
  equipamentos → disponibilidade → preferências → segurança → revisão), com barra
  de progresso, voltar, validação por etapa, resumo editável e "pular".
- Serviço `src/services/trainingProfile.ts`: normalização/validação com Zod,
  leitura/gravação, sincronização com `profiles` e exclusão de dados (LGPD).
- Reabertura a qualquer momento (`/app/onboarding?restart=1`) e edição pelo Perfil.

### Etapa 3 — Organização e personalização dos treinos
- `src/data/exerciseTaxonomy.ts`: grupos musculares, padrões de movimento,
  nível, ambiente e tradução de vocabulário das fontes externas.
- `src/data/workoutTemplates.ts`: catálogo de modelos (objetivo, nível, ambiente,
  equipamento, frequência, duração, split AB/ABC/ABCD/corpo inteiro) — todos
  disponíveis para qualquer pessoa; as coleções "curadoria feminina/masculina"
  são apenas rótulos de apresentação, sem regra fisiológica por gênero.
- `src/services/planGenerator.ts`: motor de regras determinístico (padrões de
  movimento, volume por nível, descanso por objetivo, divisões semanais, tempo de
  sessão, equipamentos, exclusões e limitações, alternativas, progressão e
  justificativa). Saída validada por schema antes de gravar.
- `src/services/planPersistence.ts`: grava plano semanal (1 plano por dia de
  treino, agrupados por `program_id`), substitui exercício, regenera sessão e
  preserva o restante do plano.
- `/app/workouts` reorganizada em 3 abas: **Meu plano** (semana + próxima sessão),
  **Modelos** (catálogo filtrável + gerar), **Histórico** (agora editável).
- `/app/coach`: treinador — explicação do plano, ajustes e regeneração.
  Usa IA **somente** se o endpoint server-side estiver configurado; senão
  trabalha com o motor de regras e diz isso claramente na interface.

### Etapa 4 — Integrações e dados
- `src/services/http.ts`: `fetchWithTimeout`, retry com backoff e abort.
- `src/services/catalog.ts`: camada central de catálogo — fonte primária (Supabase),
  complemento (Free Exercise DB), fallback local determinístico
  (`src/data/exerciseFallback.ts`), cache com TTL + deduplicação por nome normalizado,
  filtros por músculo/equipamento/nível, paginação e telemetria de falha.
- APIs de exercícios/nutrição passam a usar os helpers (timeouts).
- Endpoints server-side (Vercel Functions): `api/ai/status.ts` e `api/ai/plan.ts`.
  A chave (`AI_API_KEY`) **nunca** vai ao navegador; o endpoint valida o JWT do
  Supabase antes de chamar o provedor e devolve 503 quando não configurado.

### Etapa 5 — UX/UI
- Preservados: preto/grafite, laranja `#ff4d2e`, lime/ciano, tipografia Archivo/Inter,
  `brand-mark`, header, bottom nav, cards, badges, chips.
- Novos padrões: `wizard`/`option-card`, `plan-day`, `week-strip`, `metric`,
  `timeline`, skeletons e estados vazios específicos. Sem neon, sem excesso de
  gradiente, com `prefers-reduced-motion` respeitado.

### Etapa 6 — Acompanhamento
- Dashboard: saudação, objetivo atual, próximo treino recomendado (com botão
  iniciar), plano semanal, sequência de dias ativos, recordes e atalhos.
- `/app/workouts` → Histórico: editar observação e excluir sessão (com confirmação).
- `/app/progress`: mantém gráficos atuais e adiciona comparação de período.

### Etapa 7 — Segurança e testes
- RLS own-only em `training_profiles`; `workout_plans` continua own-only.
- Nenhuma chave nova exposta ao cliente; `.env.example` documenta as variáveis
  server-side sem valor.
- Testes novos: gerador determinístico (equipamento/ nível/tempo/sem duplicatas),
  validação do questionário, normalização/deduplicação do catálogo, schema de
  resposta de IA, persistência (contrato) e migração de RLS.
- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` executados.

---

## 4. Riscos e limites assumidos

1. **Sem credenciais de IA** o produto não afirma usar IA: a UI mostra
   "plano gerado por regras" e o endpoint responde 503. Nenhuma chamada é feita.
2. **Sem seed do catálogo** (`scripts/seed-exercises.mjs`) a geração de plano não
   tem exercícios com FK válida — a UI explica isso com ação clara em vez de falhar.
3. **Vídeos** são do CDN da fonte (MIT), carregados sob demanda; o app não copia
   mídia para o Storage.
4. Dados de saúde: o questionário pede apenas limitações que mudam a seleção de
   exercícios e orienta procurar profissional quando há dor/lesão. Não há
   diagnóstico nem prescrição de reabilitação.
5. Migração é aditiva; nenhum dado, credencial ou política existente é removido.

---

## 5. Verificação executada (neste repositório)

| Comando | Resultado |
| --- | --- |
| `npm run typecheck` (`tsc -b --noEmit`) | ✅ 0 erros |
| `npm run lint` (`eslint . --max-warnings 0`) | ✅ 0 erros / 0 warnings |
| `npm test` (`vitest run`) | ✅ **12 arquivos, 121 testes** |
| `npm run build` (`tsc` + `vite build`) | ✅ build de produção + PWA gerados |

Testes novos cobrem:

- `plan-generator.test.ts` — frequência × dias, equipamento respeitado, nível,
  ausência de duplicatas no dia, determinismo, exercícios evitados, limitações,
  prioridade muscular, catálogo vazio, origem declarada como regras, regeneração,
  validação (exercício inventado/repetido/plano vazio).
- `training-profile.test.ts` — validação etapa por etapa, defaults seguros,
  conversão para o gerador, reconstrução da linha do banco, inferência de padrão
  e sequência de atividades.
- `catalog.test.ts` — normalização, deduplicação com prioridade ao banco,
  filtros, alternativas, fallback local, agrupamento semanal e próximo treino.
- `ai-coach.test.ts` — contrato de resposta da IA, rejeição de plano absurdo,
  exigência de token, detecção de "sem provedor" e respostas por regras.
- `onboarding-flow.test.tsx` — questionário de ponta a ponta em jsdom: bloqueio
  sem resposta, voltar/avançar, resumo final e erro claro quando o catálogo não
  está semeado.

### O que não pôde ser verificado aqui (e por quê)

1. **Banco real**: este ambiente não tem as credenciais do projeto Supabase.
   Portanto não foi possível rodar `supabase db push` nem executar consultas
   autenticadas. A migração é aditiva e idempotente (`create table if not exists`,
   `add column if not exists`, `drop policy if exists`), segura para reexecução.
2. **Isolamento entre usuários no banco**: as políticas RLS novas são
   `using (user_id = auth.uid()) with check (user_id = auth.uid())`; os testes de
   integração existentes (`permissions.test.ts`) apenas rodam quando
   `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` estão definidas. Rode
   `npm test` com as variáveis para exercitar RLS de verdade.
3. **Provedor de IA**: sem `AI_API_KEY`, os endpoints `/api/ai/*` respondem 503
   por design e a UI usa o motor de regras. O caminho de IA não foi executado
   por falta de chave.
4. **Seed do catálogo**: sem credenciais, `training_profiles` salva mas a geração
   mostra a mensagem de catálogo vazio (comportamento testado).

### Migração no banco real — aplicada e verificada (2026-10-30)

A migração aditiva `20260201000000_training_profile.sql` **foi aplicada** no
projeto Supabase de produção `tazszwllacwqccfjnglk` (região `sa-east-1`, PG 17)
e conferida com consultas reais no banco, não por inspeção de código.

| Verificação | Resultado |
| --- | --- |
| Tabela `public.training_profiles` | criada, RLS habilitada |
| Políticas | `training_profiles_own`, `training_profiles_admin_read` |
| Trigger | `trg_training_profiles_updated_at` |
| Função | `reset_training_profile()` (SECURITY DEFINER, só `authenticated`) |
| Colunas novas em `workout_plans` | 9 (`program_id`, `program_name`, `day_label`, `generated_by`, `rationale`, `level`, `environment`, `template_slug`, `metadata`) + índice |
| Dados existentes | preservados: 317 exercícios, 2 usuários, 1 sessão |

Testes de isolamento executados no banco (todos em transação com `ROLLBACK`,
sem persistir nada):

| Cenário | Resultado |
| --- | --- |
| Usuário A lê `training_profiles` | vê **1** linha (só a própria) |
| Usuário A grava o próprio questionário | grava e lê de volta (experiência, objetivos, dias) |
| Usuário A tenta inserir linha do usuário B | bloqueado: `42501 new row violates row-level security policy` |
| Usuário A tenta atualizar linha do usuário B | afeta 0 linhas (sem vazamento) |
| `anon` lê perfis / planos / sessões | 0 linhas; 317 exercícios do catálogo público |
| `anon` tenta inserir perfil | bloqueado por RLS (`42501`) |
| `anon` executa `reset_training_profile()` | sem permissão |
| `reset_training_profile()` pelo dono | apaga só o próprio perfil |
| Regenerar exercícios do dia | 4 exercícios, posições `0,1,2,3`, 0 sobras |
| Apagar o plano do dia (regeneração total) | sessão concluída **preservada**, `plan_id` vira `NULL`, 0 exercícios órfãos |

Consequência prática: o app **não entra mais em modo degradado** em produção —
`dbCapabilities` detecta o schema completo e o `SchemaMigrationNotice` não aparece.
O caminho local (`localStorage`, `storage: 'local'`, `buildPlanRow({extended:false})`)
continua existindo apenas como rede de segurança para quem rodar o projeto contra
um banco sem a migração; ele não deve ser exercitado em produção.

### Como aplicar em outro ambiente (sem CLI)

`scripts/apply-migrations.mjs` aplica as migrações via Management API:
`npm run db:check`, `npm run db:apply`, `npm run db:selftest`. Alternativas: CLI
`supabase db push` ou colar o SQL no SQL Editor (`public/sql/…sql` também está
disponível para download dentro do app).

Configurar IA (opcional) na Vercel: `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`.
Sem essas variáveis, nada quebra — o produto apenas declara que usa regras.
`npm run seed:exercises` mantém o catálogo de 317 exercícios.
