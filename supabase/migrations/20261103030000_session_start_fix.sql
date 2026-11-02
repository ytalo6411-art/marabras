-- ATHLETIX: correção da abertura de sessão de treino.
--
-- Causa real do erro "Não foi possível iniciar. Verifique os exercícios e a
-- migração V10": `workout_sessions.name` é NOT NULL + CHECK sem default, e o
-- cliente inseria a sessão sem `name`. O Postgres respondia SQLSTATE 23502 e a
-- interface culpava a migração V10, que estava aplicada corretamente.
--
-- A correção principal é no cliente (enviar name/status/started_at). Aqui NÃO
-- relaxamos a constraint: o nome continua obrigatório, porque sessão sem nome
-- quebraria histórico e exportação. Esta migração só adiciona a garantia de que
-- não existam duas sessões abertas para o mesmo plano, que é o que permite ao
-- cliente tratar abertura concorrente (duas abas) sem duplicar treino.
--
-- Aditiva e idempotente. Não altera nem apaga nenhuma linha existente.

begin;

-- Mesma convenção da V10: se houver dado conflitante, aborta em vez de escolher
-- silenciosamente qual sessão do usuário descartar.
do $$
begin
  if exists (
    select 1 from public.workout_sessions
    where status = 'in_progress' and plan_id is not null
    group by user_id, plan_id having count(*) > 1
  ) then
    raise exception 'Duplicate open workout sessions: resolve existing duplicates before applying session_start_fix';
  end if;
end $$;

create unique index if not exists workout_sessions_one_open_per_plan
  on public.workout_sessions(user_id, plan_id)
  where status = 'in_progress' and plan_id is not null;

commit;
