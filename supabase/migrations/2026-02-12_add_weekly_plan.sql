-- Migration: Añadir columna weekly_plan a profiles
-- Fecha: 2026-02-12
-- Descripción: Agrega una columna JSONB `weekly_plan` al perfil del usuario

BEGIN;

-- Si la tabla `profiles` existe en el schema `public`, agregar la columna y el comentario.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    -- Agregar columna de forma segura
    EXECUTE 'ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weekly_plan jsonb DEFAULT ''{}''::jsonb';

    -- Agregar comentario solo si la columna existe
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'weekly_plan'
    ) THEN
      EXECUTE format('COMMENT ON COLUMN public.profiles.weekly_plan IS %L', 'Plan semanal del usuario (JSON). Guardado por la app.');
    END IF;
  END IF;
END
$$;

COMMIT;

-- ==========================================
-- Rollback (descomentar si se requiere revertir):
-- BEGIN;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS weekly_plan;
-- COMMIT;
-- ==========================================
