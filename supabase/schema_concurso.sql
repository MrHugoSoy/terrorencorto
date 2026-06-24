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

-- solo usuarios autenticados pueden votar
create policy "usuarios autenticados votan"
  on public.contest_votes for insert
  with check (auth.uid() = user_id);

-- solo el admin gestiona concursos y entradas
create policy "admin gestiona concursos"
  on public.contests for all using (public.is_admin());

create policy "admin gestiona entradas"
  on public.contest_entries for all using (public.is_admin());
