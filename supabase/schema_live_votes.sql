-- ============================================================
-- TERROR EN CORTO — conteo de votos en vivo
-- Ejecutar en el SQL editor del proyecto de Supabase
-- ============================================================

-- Supabase Realtime solo transmite postgres_changes a través del
-- RLS de SELECT de quien escucha. contest_votes solo deja ver los
-- votos propios (o todos, si eres admin) — así que suscribirse
-- directo a esa tabla no serviría para mostrarle a todo el mundo
-- un contador en vivo, y ampliar su política de SELECT filtraría
-- qué corto votó cada quien mientras la votación sigue abierta.
--
-- En vez de eso: se guarda un total agregado en contests.vote_count
-- (sin desglose por corto), que ya es públicamente visible por la
-- política "concursos visibles para todos". Un trigger lo mantiene
-- al día y Realtime transmite ese UPDATE a cualquiera.

alter table public.contests add column if not exists vote_count integer not null default 0;

-- por si ya hay votos registrados antes de correr este script
update public.contests c
set vote_count = (select count(*) from public.contest_votes v where v.contest_id = c.id);

create function public.bump_contest_vote_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.contests set vote_count = vote_count + 1 where id = new.contest_id;
  elsif tg_op = 'DELETE' then
    update public.contests set vote_count = greatest(vote_count - 1, 0) where id = old.contest_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger trg_bump_contest_vote_count
  after insert or delete on public.contest_votes
  for each row execute procedure public.bump_contest_vote_count();

alter publication supabase_realtime add table public.contests;
