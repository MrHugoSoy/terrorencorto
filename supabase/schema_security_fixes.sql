-- ============================================================
-- TERROR EN CORTO — parches de seguridad
-- Ejecutar en el SQL editor del proyecto de Supabase
-- ============================================================

-- La política de UPDATE en public.profiles (ver schema.sql) solo
-- verifica auth.uid() = id, sin restringir qué columnas se pueden
-- cambiar. Eso permite que cualquier usuario autenticado se
-- auto-otorgue admin desde el navegador:
--
--   supabase.from('profiles').update({ is_admin: true }).eq('id', miPropioId)
--
-- Este trigger revierte cualquier intento de cambiar is_admin salvo
-- que quien lo pida ya sea admin (usa la función public.is_admin()
-- que ya existe en schema.sql).

create function public.prevent_self_promote()
returns trigger as $$
begin
  if new.is_admin is distinct from old.is_admin and not public.is_admin() then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_prevent_self_promote
  before update on public.profiles
  for each row execute procedure public.prevent_self_promote();
