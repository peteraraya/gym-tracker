-- Migration: RLS policies para tabla profiles
-- Fecha: 2026-09-10
-- Descripción: Agrega políticas de Row Level Security a la tabla `profiles`.
-- La tabla fue creada sin políticas, por lo que con RLS habilitado cualquier
-- INSERT/UPDATE/SELECT de un usuario autenticado era bloqueado (default deny),
-- causando el error:
--   "new row violates row-level security policy for table profiles"

BEGIN;

-- Habilitar RLS (idempotente, sin efecto si ya está habilitado)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para que cada usuario solo pueda ver/editar su propio perfil.
-- La app guarda el perfil con id = auth.uid() (lib/supabase/service.ts).

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

COMMIT;