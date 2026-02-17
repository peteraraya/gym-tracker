-- Migration: Tabla active_workouts completa con RLS
-- Fecha: 2026-02-17
-- Descripción: Tabla para almacenar el estado del entrenamiento activo por usuario

BEGIN;

-- Crear tabla active_workouts
CREATE TABLE IF NOT EXISTS public.active_workouts (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data jsonb NOT NULL,
  started_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comentario
COMMENT ON TABLE public.active_workouts IS 'Estado del entrenamiento activo por usuario (para reanudar después de recargar)';
COMMENT ON COLUMN public.active_workouts.user_id IS 'ID del usuario (FK a auth.users)';
COMMENT ON COLUMN public.active_workouts.data IS 'Estado completo del workout en formato JSON';
COMMENT ON COLUMN public.active_workouts.started_at IS 'Cuándo se inició el workout';
COMMENT ON COLUMN public.active_workouts.updated_at IS 'Última actualización del estado';

-- Habilitar Row Level Security
ALTER TABLE public.active_workouts ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver su propio workout activo
CREATE POLICY "Users can view their own active workout"
  ON public.active_workouts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar su propio workout activo
CREATE POLICY "Users can insert their own active workout"
  ON public.active_workouts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar su propio workout activo
CREATE POLICY "Users can update their own active workout"
  ON public.active_workouts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar su propio workout activo
CREATE POLICY "Users can delete their own active workout"
  ON public.active_workouts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Índice para mejorar performance en búsquedas por user_id
CREATE INDEX IF NOT EXISTS idx_active_workouts_user_id 
  ON public.active_workouts(user_id);

-- Índice para búsquedas por fecha de actualización
CREATE INDEX IF NOT EXISTS idx_active_workouts_updated_at 
  ON public.active_workouts(updated_at DESC);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_active_workouts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_active_workouts_updated_at
  BEFORE UPDATE ON public.active_workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_active_workouts_updated_at();

COMMIT;

-- Rollback (ejecutar si necesitas revertir):
-- BEGIN;
-- DROP TRIGGER IF EXISTS trigger_update_active_workouts_updated_at ON public.active_workouts;
-- DROP FUNCTION IF EXISTS update_active_workouts_updated_at();
-- DROP POLICY IF EXISTS "Users can delete their own active workout" ON public.active_workouts;
-- DROP POLICY IF EXISTS "Users can update their own active workout" ON public.active_workouts;
-- DROP POLICY IF EXISTS "Users can insert their own active workout" ON public.active_workouts;
-- DROP POLICY IF EXISTS "Users can view their own active workout" ON public.active_workouts;
-- DROP TABLE IF EXISTS public.active_workouts CASCADE;
-- COMMIT;
