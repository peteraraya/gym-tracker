-- Migration: Añadir columna last_weights a profiles
-- Fecha: 2026-02-12
-- Descripción: Agrega columna JSONB `last_weights` para guardar los últimos pesos por ejercicio

BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    EXECUTE 'ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_weights jsonb DEFAULT ''{}''::jsonb';
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'last_weights'
    ) THEN
      EXECUTE format('COMMENT ON COLUMN public.profiles.last_weights IS %L', 'Últimos pesos por ejercicio (JSON). Guardado por la app.');
    END IF;
  END IF;
END
$$;

COMMIT;

-- Rollback (descomentar si se requiere revertir):
-- BEGIN;
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS last_weights;
-- COMMIT;
