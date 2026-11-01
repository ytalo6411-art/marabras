-- ══════════════════════════════════════════════════════════════════════════════
-- ATHLETIX — Fotos de perfil (Storage) com isolamento por usuário
--
-- Bucket público para LEITURA (a foto aparece em perfis e comunidade), mas
-- escrita restrita à própria pasta: <user_id>/<arquivo>.
--
-- Sem estas políticas o upload falhava e o perfil não tinha como trocar a foto.
-- O caminho é validado no servidor pela primeira pasta do name — o cliente não
-- consegue escrever na pasta de outra pessoa mudando o corpo da requisição.
--
-- Limites: 2 MB, apenas JPEG/PNG/WebP. SVG é proibido (vetor pode conter script).
-- ══════════════════════════════════════════════════════════════════════════════
begin;

-- O schema `storage` só existe no Supabase. Em Postgres puro/CI (PGlite) este
-- bloco é ignorado em vez de quebrar a cadeia de migrações.
do $$
begin
  if not exists (select 1 from pg_namespace where nspname = 'storage') then
    raise notice 'Schema storage ausente — políticas de avatar ignoradas neste ambiente.';
    return;
  end if;

  execute $sql$
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Políticas idempotentes.
drop policy if exists avatars_public_read on storage.objects;
drop policy if exists avatars_insert_own on storage.objects;
drop policy if exists avatars_update_own on storage.objects;
drop policy if exists avatars_delete_own on storage.objects;

create policy avatars_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'avatars');

-- A primeira pasta precisa ser o próprio uid.
create policy avatars_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy avatars_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy avatars_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
$sql$;
end $$;

commit;
