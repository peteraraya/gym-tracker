-- Migración: Crear tabla active_workouts para sincronización de entrenamientos activos
-- Fecha: 2026-02-17
-- Descripción: Permite sincronizar entrenamientos activos entre dispositivos
-- Versión: Idempotente (se puede ejecutar múltiples veces)

-- 1. Crear la tabla
CREATE TABLE IF NOT EXISTS public.active_workouts (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data jsonb NOT NULL,
  started_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Habilitar Row Level Security
ALTER TABLE public.active_workouts ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas de seguridad (con DROP IF EXISTS para idempotencia)
DROP POLICY IF EXISTS "Users can view their own active workout" ON public.active_workouts;
CREATE POLICY "Users can view their own active workout"
  ON public.active_workouts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own active workout" ON public.active_workouts;
CREATE POLICY "Users can insert their own active workout"
  ON public.active_workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own active workout" ON public.active_workouts;
CREATE POLICY "Users can update their own active workout"
  ON public.active_workouts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own active workout" ON public.active_workouts;
CREATE POLICY "Users can delete their own active workout"
  ON public.active_workouts FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_active_workouts_user_id 
  ON public.active_workouts(user_id);

CREATE INDEX IF NOT EXISTS idx_active_workouts_updated_at 
  ON public.active_workouts(updated_at DESC);

-- 5. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_active_workouts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear trigger para ejecutar la función (con DROP IF EXISTS)
DROP TRIGGER IF EXISTS trigger_update_active_workouts_updated_at ON public.active_workouts;
CREATE TRIGGER trigger_update_active_workouts_updated_at
  BEFORE UPDATE ON public.active_workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_active_workouts_updated_at();

-- 7. Agregar comentarios para documentación
COMMENT ON TABLE public.active_workouts IS 'Almacena el estado de entrenamientos activos para sincronización entre dispositivos';
COMMENT ON COLUMN public.active_workouts.user_id IS 'ID del usuario propietario del entrenamiento activo';
COMMENT ON COLUMN public.active_workouts.data IS 'Estado completo del entrenamiento en formato JSON';
COMMENT ON COLUMN public.active_workouts.started_at IS 'Timestamp de cuando se inició el entrenamiento';
COMMENT ON COLUMN public.active_workouts.updated_at IS 'Timestamp de la última actualización (se actualiza automáticamente)';
