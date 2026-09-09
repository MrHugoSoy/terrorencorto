-- ============================================================
-- TERROR EN CORTO — mensaje corto al votar
-- Ejecutar en el SQL editor del proyecto de Supabase
-- ============================================================

alter table public.contest_votes
  add column if not exists message text check (char_length(message) <= 140);

-- contest_votes solo deja ver los votos propios (o todos, si eres
-- admin) por RLS. Esta función expone públicamente solo el mensaje
-- + quién lo dejó, sin desglose de conteos ni de otros datos del
-- voto, para mostrar las reacciones bajo cada corto.

create function public.get_entry_messages(p_entry_id uuid)
returns table(username text, message text, created_at timestamptz)
language sql
security definer
stable
as $$
  select p.username, cv.message, cv.created_at
  from public.contest_votes cv
  join public.profiles p on p.id = cv.user_id
  where cv.entry_id = p_entry_id
    and cv.message is not null
    and length(trim(cv.message)) > 0
  order by cv.created_at desc;
$$;
