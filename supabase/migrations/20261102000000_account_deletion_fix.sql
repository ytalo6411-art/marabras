-- ══════════════════════════════════════════════════════════════════════════════
-- ATHLETIX — Correção da exclusão de conta (LGPD, direito ao esquecimento)
--
-- BUG CONFIRMADO EM PRODUÇÃO:
--   delete_own_account() apagava auth.users. O ON DELETE CASCADE removia
--   workout_plans / food_diary / etc., disparando audit_row_change(), que
--   inseria em audit_logs(user_id = auth.uid()). Como a linha de auth.users
--   já tinha sido removida, a FK audit_logs_user_id_fkey estourava:
--     ERROR 23503 ... Key (user_id)=(...) is not present in table "users"
--   e TODA a transação era revertida. A conta nunca era excluída.
--
-- CORREÇÃO:
--   • audit_row_change() resolve o autor com segurança: se o usuário não
--     existe mais (cascade de exclusão), grava user_id NULL em vez de quebrar.
--     A trilha de auditoria é preservada e a exclusão passa a funcionar.
--   • delete_own_account() apaga a identidade e DEVOLVE o id removido para o
--     cliente confirmar que o servidor realmente excluiu.
--   • Os arquivos de avatar são removidos pela Storage API antes do RPC:
--     storage.protect_delete() proíbe DELETE direto em storage.objects.
--
-- Migração idempotente e não destrutiva: nenhum dado existente é apagado.
-- ══════════════════════════════════════════════════════════════════════════════
begin;

-- ─── Auditoria resiliente a cascade ──────────────────────────────────────────
create or replace function public.audit_row_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  r jsonb;
  v_actor uuid;
begin
  r := to_jsonb(coalesce(new, old));
  v_actor := (select auth.uid());

  -- Durante a exclusão da conta o usuário já foi removido de auth.users.
  -- Registrar NULL mantém a trilha sem violar a FK nem reverter a exclusão.
  if v_actor is not null and not exists (
    select 1 from auth.users where id = v_actor
  ) then
    v_actor := null;
  end if;

  insert into public.audit_logs(user_id, table_name, action, row_id, metadata)
  values (
    v_actor,
    tg_table_name,
    lower(tg_op),
    coalesce((r->>'id')::uuid, (r->>'user_id')::uuid),
    jsonb_build_object('op', tg_op)
  );

  return coalesce(new, old);
end $$;

revoke execute on function public.audit_row_change() from public, anon, authenticated;

-- ─── Exclusão de conta de ponta a ponta ──────────────────────────────────────
-- Retorna o id efetivamente removido. O cliente só mostra sucesso quando o
-- servidor devolve o próprio id — nunca antes.
drop function if exists public.delete_own_account();

create function public.delete_own_account()
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
begin
  v_id := (select auth.uid());
  if v_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  -- NOTA: os arquivos de avatar são apagados pela Storage API pelo cliente
  -- antes desta chamada. storage.protect_delete() bloqueia DELETE direto em
  -- storage.objects, então tentar aqui abortaria a exclusão inteira.

  -- Remove a identidade. As FKs ON DELETE CASCADE cuidam de perfis,
  -- preferências, planos, sessões, histórico, nutrição e publicações.
  delete from auth.users where id = v_id;

  if not found then
    raise exception 'Account not found' using errcode = 'P0002';
  end if;

  return v_id;
end $$;

revoke execute on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;

commit;
