-- ============================================================
-- TERROR EN CORTO — cartel del concurso
-- Ejecutar en el SQL editor del proyecto de Supabase
-- ============================================================

alter table public.contests add column if not exists poster_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('posters', 'posters', true, 5242880, array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;

create policy "carteles visibles para todos"
  on storage.objects for select using (bucket_id = 'posters');

create policy "solo el admin sube carteles"
  on storage.objects for insert
  with check (bucket_id = 'posters' and public.is_admin());

create policy "solo el admin actualiza carteles"
  on storage.objects for update
  using (bucket_id = 'posters' and public.is_admin());

create policy "solo el admin elimina carteles"
  on storage.objects for delete
  using (bucket_id = 'posters' and public.is_admin());
