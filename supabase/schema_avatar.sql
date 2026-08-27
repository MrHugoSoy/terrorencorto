-- ============================================================
-- TERROR EN CORTO — foto de perfil
-- Ejecutar en el SQL editor del proyecto de Supabase
-- ============================================================

alter table public.profiles add column avatar_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 3145728, array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;

create policy "avatares visibles para todos"
  on storage.objects for select using (bucket_id = 'avatars');

create policy "el usuario sube su propio avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "el usuario actualiza su propio avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "el usuario elimina su propio avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
