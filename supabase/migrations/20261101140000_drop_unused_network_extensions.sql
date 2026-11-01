-- ATHLETIX AppSec: remove unused database HTTP egress extensions.
-- The app never calls http/pg_net. Their supabase_admin-owned grants could not
-- be revoked by the postgres migration role, so drop the unused extensions.
-- RESTRICT aborts if any dependent object exists; nothing is silently cascaded.
begin;
drop extension if exists http restrict;
drop extension if exists pg_net restrict;
commit;
