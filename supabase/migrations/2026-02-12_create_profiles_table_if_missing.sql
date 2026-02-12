-- Migration: Crear tabla profiles si no existe
-- Fecha: 2026-02-12
-- Descripción: Crea una tabla `profiles` mínima compatible con supabase auth

BEGIN;

-- Crear tabla `profiles` sólo si no existe
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  name text,
  email text,
  avatar_url text,
  current_weight numeric,
  target_weight numeric,
  height numeric,
  weekly_plan jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vincular con auth.users si la tabla existe y la extensión está presente
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'pg_catalog' AND c.relname = 'pg_user'
  ) THEN
    -- noop: leave as-is; reference FK may be set by project explicitly if desired
    NULL;
  END IF;
END
$$;

-- Comentarios para referencia
COMMENT ON TABLE public.profiles IS 'Tabla de perfiles de usuario (opcional). Compatible con supabase auth.users.';
COMMENT ON COLUMN public.profiles.weekly_plan IS 'Plan semanal del usuario (JSON). Guardado por la app.';

COMMIT;

-- Rollback (descomentar si se requiere revertir):
-- BEGIN;
-- DROP TABLE IF EXISTS public.profiles;
-- COMMIT;
