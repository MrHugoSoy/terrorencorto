-- ============================================================
-- TERROR EN CORTO — Módulo de concurso anual
-- Ejecutar en el SQL editor de Supabase
-- ============================================================

create table public.contests (
  id uuid primary key default gen_random_uuid(),
  year integer not null,
  title text not null,
  is_active boolean not null default false,
  ends_at timestamptz,
  poster_url text,
  vote_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.contest_entries (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid references public.contests(id) on delete cascade not null,
  title text not null,
  youtube_url text not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.contest_votes (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid references public.contests(id) on delete cascade not null,
  entry_id uuid references public.contest_entries(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  message text check (char_length(message) <= 140),
  created_at timestamptz not null default now(),
  unique(contest_id, user_id)
);

alter table public.contests enable row level security;
alter table public.contest_entries enable row level security;
alter table public.contest_votes enable row level security;

-- concursos: todos pueden ver
create policy "concursos visibles para todos"
  on public.contests for select using (true);

-- entradas: todos pueden ver
create policy "entradas visibles para todos"
  on public.contest_entries for select using (true);

-- votos: el usuario ve los suyos
create policy "el usuario ve sus propios votos"
  on public.contest_votes for select using (auth.uid() = user_id);

-- el admin ve todos los votos
create policy "el admin ve todos los votos"
  on public.contest_votes for select using (public.is_admin());

-- solo usuarios autenticados pueden votar, y solo mientras el
-- concurso está activo y no ha vencido, por una entrada que
-- realmente pertenece a ese concurso
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

-- solo el admin gestiona concursos y entradas
create policy "admin gestiona concursos"
  on public.contests for all using (public.is_admin());

create policy "admin gestiona entradas"
  on public.contest_entries for all using (public.is_admin());

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

-- espejo público de "usuario + mensaje + a qué corto votó", para
-- transmitir un feed en vivo por Realtime (ver nota en
-- schema_vote_feed.sql sobre por qué no basta con contest_votes)
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

-- mantiene contests.vote_count al día para el contador en vivo
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
alter publication supabase_realtime add table public.contest_vote_feed;
