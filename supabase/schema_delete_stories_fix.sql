-- ============================================================
-- TERROR EN CORTO — permite al admin eliminar historias
-- Ejecutar en el SQL editor del proyecto de Supabase
-- ============================================================

-- public.stories tiene RLS activado pero nunca tuvo una política
-- de DELETE (ver schema.sql). Sin política explícita, Postgres
-- deniega la operación por defecto para todos los roles —
-- incluido el admin — así que el botón "Eliminar" en /admin y
-- /admin/historias no borraba nada.

create policy "solo el admin elimina historias"
  on public.stories for delete
  using (public.is_admin());
