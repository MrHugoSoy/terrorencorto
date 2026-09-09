-- ============================================================
-- TERROR EN CORTO — feed de votos en vivo
-- Ejecutar en el SQL editor del proyecto de Supabase
-- ============================================================

-- Igual que con vote_count (ver schema_live_votes.sql): contest_votes
-- solo deja ver los votos propios por RLS, así que Realtime no
-- transmitiría los votos de otros usuarios si nos suscribiéramos
-- directo a esa tabla. Esta tabla es un espejo público de solo
-- "usuario + mensaje + a qué corto votó", sin el resto de la fila
-- (nada que ya no sea público: el username y a qué corto se votó
-- se comparten intencionalmente al mostrar el feed).

create table public.contest_vote_feed (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid references public.contests(id) on delete cascade not null,
  entry_id uuid references public.contest_entries(id) on delete cascade not null,
  username text not null,
  message text,
  created_at timestamptz not null default now()
);

alter table public.contest_vote_feed enable row level security;

create policy "feed de votos visible para todos"
  on public.contest_vote_feed for select using (true);

create function public.push_vote_to_feed()
returns trigger as $$
begin
  insert into public.contest_vote_feed (contest_id, entry_id, username, message)
  select new.contest_id, new.entry_id, p.username, new.message
  from public.profiles p
  where p.id = new.user_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_push_vote_to_feed
  after insert on public.contest_votes
  for each row execute procedure public.push_vote_to_feed();

alter publication supabase_realtime add table public.contest_vote_feed;
