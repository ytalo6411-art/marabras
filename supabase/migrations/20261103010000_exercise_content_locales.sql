-- ══════════════════════════════════════════════════════════════════════════════
-- ATHLETIX — Conteúdo dos exercícios: original preservado + pt-BR
--
-- Mesmo padrão já usado em `name`/`name_en`: a coluna principal passa a guardar
-- o texto em português e a coluna `_en` preserva o original da fonte, para
-- auditoria e para os idiomas que ainda não têm tradução revisada.
--
-- Aditivo e idempotente: nenhuma linha é apagada e o original é copiado antes
-- de qualquer UPDATE de tradução.
-- ══════════════════════════════════════════════════════════════════════════════
begin;

-- Marca explícita de tradução revisada. A interface usa isto para dizer a verdade
-- sobre o idioma do conteúdo, em vez de adivinhar comparando strings.
alter table public.exercises
  add column if not exists content_pt_ready boolean not null default false;

alter table public.exercises
  add column if not exists description_en text,
  add column if not exists instructions_en text,
  add column if not exists steps_en text[],
  add column if not exists breathing_en text,
  add column if not exists common_mistakes_en text[];

-- Preserva o original apenas uma vez. O `where ... is null` torna a migração
-- segura para reexecução: nunca sobrescreve o backup com texto já traduzido.
update public.exercises set description_en = description
  where description_en is null and description is not null;
update public.exercises set instructions_en = instructions
  where instructions_en is null and instructions is not null;
update public.exercises set steps_en = steps
  where steps_en is null and steps is not null;
update public.exercises set breathing_en = breathing
  where breathing_en is null and breathing is not null;
update public.exercises set common_mistakes_en = common_mistakes
  where common_mistakes_en is null and common_mistakes is not null;

commit;