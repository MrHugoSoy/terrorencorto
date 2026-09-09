-- ============================================================
-- TERROR EN CORTO — conteo de votos del concurso
-- Ejecutar en el SQL editor del proyecto de Supabase
-- ============================================================

-- contest_votes tiene RLS que solo deja ver los votos propios (o
-- todos, si eres admin). Nadie puede sumar votos por entrada desde
-- el cliente. Esta función expone el conteo agregado:
--   - al admin siempre, para decidir al ganador con datos reales
--   - a cualquiera, pero solo cuando la votación de ese concurso
--     ya cerró (evita mostrar resultados parciales que sesguen el
--     voto mientras está abierta)

create function public.get_contest_results(p_contest_id uuid)
returns table(entry_id uuid, votes bigint)
language sql
security definer
stable
as $$
  select cv.entry_id, count(*)::bigint as votes
  from public.contest_votes cv
  join public.contests c on c.id = cv.contest_id
  where cv.contest_id = p_contest_id
    and (
      public.is_admin()
      or not (c.is_active and (c.ends_at is null or c.ends_at > now()))
    )
  group by cv.entry_id;
$$;
