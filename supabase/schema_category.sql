-- ============================================================
-- TERROR EN CORTO — categoría de las historias
-- Ejecutar en el SQL editor del proyecto de Supabase
-- ============================================================

-- El código (app/enviar, /admin, /perfil) usa esta columna desde
-- hace tiempo pero nunca quedó documentada en schema.sql. Este
-- script la agrega para que una instalación nueva desde cero
-- coincida con la base de datos real.

alter table public.stories
  add column if not exists category text
  check (category in ('testimonio_real', 'leyenda_urbana', 'paranormal', 'creepypasta'))
  default 'testimonio_real';
