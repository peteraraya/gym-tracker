-- Migration: Crear tabla active_workouts (persistir entrenamiento activo por usuario)
-- Fecha: 2026-02-12
-- Descripción: Tabla para almacenar el estado del entrenamiento activo por usuario (JSONB)

BEGIN;

-- Crear tabla if not exists
CREATE TABLE IF NOT EXISTS public.active_workouts (
  user_id uuid PRIMARY KEY,
  data jsonb NOT NULL,
  started_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.active_workouts IS 'Estado del entrenamiento activo por usuario (guardado por la app para reanudar).';

COMMIT;

-- Rollback (descomentar si se requiere revertir):
-- BEGIN;
-- DROP TABLE IF EXISTS public.active_workouts;
-- COMMIT;
