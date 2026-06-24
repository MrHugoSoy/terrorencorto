-- ============================================================
-- TERROR EN CORTO — esquema inicial de Supabase
-- Ejecutar en el SQL editor del proyecto de Supabase
-- ============================================================

-- PERFILES (extiende auth.users) -------------------------------
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "perfiles son visibles para todos"
  on public.profiles for select
  using (true);

create policy "el usuario edita solo su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- crea el perfil automáticamente cuando alguien se registra
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', 'testigo_' || substr(new.id::text, 1, 6)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- función auxiliar para RLS: ¿el usuario actual es admin?
create function public.is_admin()
returns boolean as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$ language sql security definer stable;

-- HISTORIAS ------------------------------------------------------
create table public.stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  location text,
  mode text not null check (mode in ('autor','incognito')) default 'autor',
  status text not null check (status in ('pendiente','publicado','rechazado','seleccionado_canal','usado_canal')) default 'pendiente',
  channel_consent boolean not null default false,
  video_url text,
  case_number text unique,
  anon_id integer generated always as identity,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

alter table public.stories enable row level security;

-- numera automáticamente el expediente: EXP-0001, EXP-0002...
create sequence public.case_number_seq start 1;

create function public.set_case_number()
returns trigger as $$
begin
  new.case_number := 'EXP-' || lpad(nextval('public.case_number_seq')::text, 4, '0');
  return new;
end;
$$ language plpgsql;

create trigger trg_set_case_number
  before insert on public.stories
  for each row execute procedure public.set_case_number();

-- POLÍTICAS ------------------------------------------------------

-- el público solo ve historias ya publicadas o usadas en el canal
create policy "historias publicadas son visibles para todos"
  on public.stories for select
  using (status in ('publicado','seleccionado_canal','usado_canal'));

-- el autor siempre puede ver sus propias historias, en cualquier estado
create policy "el autor ve sus propias historias"
  on public.stories for select
  using (auth.uid() = author_id);

-- el admin ve todo
create policy "el admin ve todas las historias"
  on public.stories for select
  using (public.is_admin());

-- cualquier usuario autenticado puede enviar una historia propia
create policy "usuarios autenticados envian historias"
  on public.stories for insert
  with check (auth.uid() = author_id);

-- solo el admin puede cambiar estado, marcar video, etc.
create policy "solo el admin actualiza historias"
  on public.stories for update
  using (public.is_admin());

-- índice para el feed público ordenado por fecha
create index stories_status_created_idx on public.stories (status, created_at desc);

-- ============================================================
-- Después de correr esto:
-- 1. Regístrate normal desde el sitio (crea tu cuenta como cualquier usuario).
-- 2. Corre: update public.profiles set is_admin = true where username = 'TU_USERNAME';
-- 3. Ya puedes entrar a /admin
-- ============================================================
