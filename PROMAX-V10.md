# ATHLETIX — PROMAX V10 · relatório de entrega

Data: 01/11/2026.Branch: `arena/3ea1a3bb-marabras`.

## Escopo e diagnóstico

Foi preservada a aplicação React/TypeScript/Vite existente, com Supabase Auth/Postgres/RLS, Zustand, Zod e Vercel Functions. A correção não substituiu o produto por uma maquete nem criou autenticação simulada no código de produção.

Problemas tratados: navegação e sobreposição em telas estreitas; filtros de equipamento; detalhes por UUID; geração sem respeitar integralmente restrições/tempo; início de treino confundido com conclusão; progresso de sessão não persistido; nutrição dependente de busca externa/câmera; ausência de montagem visual; tradução incompleta; erros silenciosos; e conclusão de sessão sem atomicidade.

## Implementado

- Shell responsivo, menu móvel, foco visível, skip link, diálogos com contenção de foco/Escape e bloqueio de rolagem aninhado, áreas de toque e espaço para navegação inferior/safe-area.
- Biblioteca com busca, músculo, dificuldade, equipamento, paginação, retry, detalhes e importação para o construtor. Fotografias locais são referências ilustrativas identificadas; vídeos só carregam após clique.
- Questionário e gerador determinístico por catálogo com IDs reais: frequência, divisão, nível, equipamento, prioridades, limitações, recuperação, aquecimento e progressão. Tempo inclui aquecimento/transições. Alternativas passam pelo mesmo contrato de segurança.
- IA opcional: chave somente no servidor, JWT, limite de requisições, contrato Zod, IDs fechados e validação cliente/servidor. Sem chave, o produto declara geração por regras. Respostas incompatíveis são rejeitadas, não apresentadas como válidas.
- Sessão: snapshot dos exercícios, séries persistidas, carga/repetições, descanso com prazo absoluto/pausa, navegação, retomada e resumo. Iniciar não conclui. A conclusão exige série positiva salva e usa RPC transacional/idempotente, atualizando histórico e recordes. Estado local é apenas espelho; o banco é canônico na retomada.
- Nutrição: preferências, restrições/alergias, ingredientes disponíveis e tempo; receitas ilustradas com porções, preparo e substituições por peso. Sugestão não é consumo: registrar exige ação explícita. Diário por data e totais derivados dos registros. Busca textual/categoria/ingrediente, código de barras digitado opcional e cadastro pelo rótulo. Fontes e estimativas são identificadas; nutrientes externos ausentes não viram medições.
- pt-BR padrão, inglês, espanhol e francês com seletor persistente, atualização ao vivo e retomada após reload. Dicionários centralizados, padrões interpolados e aviso para conteúdo de fonte sem tradução revisada. Termos/privacidade traduzidos como minuta sujeita a revisão jurídica.
- Exclusão da própria conta por RPC autenticada, sem chave administrativa no navegador; confirmação textual e feedback de erro.

## Banco e compatibilidade

Migração: `supabase/migrations/20261101000000_promax_v10.sql`.

Aplicada no projeto Supabase existente em 01/11/2026, em transação, após preflight sem duplicatas. A verificação posterior encontrou duas colunas de sessão, três RPCs, política own-only de planos nutricionais e índice único de histórico. Contagens preservadas: **317 exercícios, 8 alimentos, 2 sessões**. Nenhuma conta ou sessão de usuário foi criada/alterada durante os testes.

A migração adiciona colunas/tabela e funções; não faz backfill destrutivo. Se houver histórico duplicado em outro ambiente, ela aborta em vez de escolher/apagar registros. A política e os privilégios da nova tabela são explícitos. Funções de conclusão/refeições são security invoker; exclusão de conta é security definer restrita a `auth.uid()` e execute apenas para autenticados.

PGlite executa os arquivos de migração e testa isolamento, conclusão vazia/idempotente, histórico/recordes, porções fracionárias, rollback de refeição e planos privados. Ele não substitui um ensaio completo do ambiente gerenciado: extensões opcionais de busca e papéis/auth são adaptados no harness. A aplicação real foi verificada separadamente por consultas de catálogo e contagens.

## Verificação executada

| Verificação | Resultado |
|---|---|
| TypeScript app e API | aprovado |
| ESLint com zero warnings | aprovado |
| Vitest | 14 arquivos, 176 testes aprovados |
| Migrações/RLS/transações em PGlite | aprovado |
| Extração/coverage de textos JSX | 647 candidatos; traduções ou invariantes explícitos |
| Build Vite/PWA | aprovado |
| Chromium/Playwright | 3 fluxos aprovados |
| Larguras | 320, 360, 390, 430, 768, 1024, 1440 px; sem overflow horizontal nos fluxos testados |
| Git diff whitespace | aprovado |

Os fluxos de navegador cobrem login/quatro idiomas/reload; shell autenticado, preferências veganas, montagem/porção e código opcional; início sem conclusão, salvamento de série, reload, pausa de descanso e encerramento explícito. As requisições Supabase desses testes são **fixtures isoladas**, não uma simulação apresentada como produção. Não foram usadas credenciais de usuários reais.

Comandos: `npm run typecheck`, `npm run typecheck:api`, `npm run lint`, `npm test`, `npm run test:db`, `npm run test:i18n`, `npm run test:browser`, `npm run build`. CI foi ampliado para incluir banco, tradução e navegador.

## Limites e dependências externas

- IA não foi configurada nem cobrada: requer `AI_API_KEY`, modelo e endpoint compatível no servidor. O fluxo real do provedor não foi validado com uma chave.
- Google OAuth, entrega de e-mails, domínios e limites Supabase/Vercel dependem das contas externas existentes. Não foram criados usuários para testar autenticação real.
- Busca externa pode falhar/ter limites; catálogo local, busca textual e cadastro manual continuam disponíveis. Não há promessa de preços regionais em tempo real: orçamento prioriza receitas, não inventa cotações.
- Nem todo texto histórico/administrativo ou registro de terceiro possui tradução humana revisada. O fallback é explícito; não se afirma tradução integral de 317 fichas externas.
- Fotos de refeições são ilustrativas; créditos e diferenças estão em `public/CREDITS.md`. USDA SR28 é uma referência histórica, não análise laboratorial do alimento do usuário.
- Termos/privacidade precisam de revisão jurídica antes de uso comercial. Sugestões não são diagnóstico, reabilitação ou prescrição clínica.

Rollback de frontend pode ser feito pelo deployment anterior na Vercel. Não remover as colunas/funções V10 como primeiro passo: versões anteriores não dependem delas, e removê-las apagaria estados novos. Backup/restore do banco deve seguir o procedimento do provedor.
