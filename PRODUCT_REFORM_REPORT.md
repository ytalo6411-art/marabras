# ATHLETIX — Reformulação de produto: relatório

Branch `arena/3d7cd59a-marabras` · PR #7 · 2026-11-01

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

| Suíte | Resultado |
|---|---|
| `npm run typecheck` / `typecheck:api` | PASS |
| `npm run lint` (0 warnings) | PASS |
| `npm test` | **220 passaram** |
| `npm run test:security` | 10 API/cliente + **36 cenários PostgreSQL** |
| `npm run test:db` | PASS |
| `npm run test:i18n` | **714 strings**, 4 idiomas |
| `npm run test:browser` | **8 fluxos** |
| `npm run build` | PASS, 50 entradas de precache |
| GitHub Actions CI | **PASS** |

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
3. **Produção** — o banco já está atualizado; o frontend/API precisa ser
   promovido. **Produção segue em `5bdfae9`** até você aprovar.
4. **`AI_API_KEY`** — ausente na Vercel; a IA responde 503 e o app usa o gerador
   por regras, que funciona sozinho.

---

## 8. O que **não** foi feito nesta rodada

Sendo explícito para não dar falsa impressão de conclusão:

- **Identidade visual nova** (logotipo/símbolo originais, nova tipografia): não
  foi criada. O design system existente foi estendido de forma consistente
  (novos componentes seguem os mesmos tokens), mas o logo continua o atual.
- **Instruções passo a passo em português**: os exercícios têm `steps`,
  `breathing` e `common_mistakes` da fonte, ainda **em inglês**. Traduzi os
  **nomes**; traduzir 317 conjuntos de instruções exige revisão técnica e não foi
  feito — não inventei texto para preencher.
- **Moderação administrativa de denúncias**: a tabela e a captura existem; a
  tela de fila para o moderador, não.
- **Reordenar dias do programa por arrastar**: dá para editar, trocar exercício
  e regenerar o dia; arrastar-e-soltar não foi implementado.

Não afirmo que o produto está "pronto" ou "seguro": o que está escrito acima como
verificado foi testado; o resto está listado como pendente.
