-- ============================================================
-- TERROR EN CORTO — contador de visitas real
-- Ejecutar en el SQL editor del proyecto de Supabase
-- ============================================================

create table public.site_stats (
  id int primary key default 1,
  page_views bigint not null default 0,
  constraint single_row check (id = 1)
);

insert into public.site_stats (id, page_views) values (1, 0);

alter table public.site_stats enable row level security;

create policy "stats visibles para todos"
  on public.site_stats for select using (true);

create function public.increment_page_views()
returns bigint as $$
  update public.site_stats set page_views = page_views + 1 where id = 1
  returning page_views;
$$ language sql security definer;
