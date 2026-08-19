-- ============================================================
-- TERROR EN CORTO — Módulo de videos del canal
-- Ejecutar en el SQL editor de Supabase
-- ============================================================

create table public.channel_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  youtube_url text not null,
  description text,
  created_at timestamptz not null default now()
);

alter table public.channel_videos enable row level security;

-- todos pueden ver los videos
create policy "videos visibles para todos"
  on public.channel_videos for select using (true);

-- solo el admin agrega, edita o elimina
create policy "admin gestiona videos"
  on public.channel_videos for all using (public.is_admin());
