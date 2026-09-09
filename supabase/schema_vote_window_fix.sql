-- ============================================================
-- TERROR EN CORTO — solo se puede votar mientras el concurso está abierto
-- Ejecutar en el SQL editor del proyecto de Supabase
-- ============================================================

-- La política de INSERT en contest_votes (ver schema_concurso.sql)
-- solo verifica auth.uid() = user_id. La app (app/api/concurso/votar)
-- ya valida que el concurso esté activo y no vencido, y que la
-- entrada pertenezca a ese concurso — pero eso es solo una capa de
-- aplicación: cualquiera con sesión válida podría llamar a Supabase
-- directo desde el navegador y saltarse esa validación. Este patch
-- mueve la misma regla a la base de datos.

drop policy "usuarios autenticados votan" on public.contest_votes;

create policy "usuarios autenticados votan solo si el concurso esta abierto"
  on public.contest_votes for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.contests c
      where c.id = contest_votes.contest_id
        and c.is_active
        and (c.ends_at is null or c.ends_at > now())
    )
    and exists (
      select 1 from public.contest_entries e
      where e.id = contest_votes.entry_id
        and e.contest_id = contest_votes.contest_id
    )
  );
