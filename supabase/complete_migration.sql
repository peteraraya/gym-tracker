-- ========================================
-- MIGRACIÓN COMPLETA PARA GYM TRACKER
-- ========================================
-- Ejecuta este script completo en Supabase SQL Editor
-- Incluye TODAS las migraciones necesarias en orden correcto
-- ========================================

-- ========================================
-- MIGRACIÓN 1: Duration Tracking
-- ========================================

-- 1. Agregar columna de notas a workout_sessions
ALTER TABLE workout_sessions 
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Agregar columnas a la tabla session_exercises para rastrear duraciones por serie
ALTER TABLE session_exercises 
  ADD COLUMN IF NOT EXISTS set_durations INTEGER[],
  ADD COLUMN IF NOT EXISTS pause_durations INTEGER[];

-- 3. Asegurar compatibilidad en tabla exercises: agregar sets_data (jsonb) y equipment (text)
ALTER TABLE exercises
  ADD COLUMN IF NOT EXISTS sets_data JSONB,
  ADD COLUMN IF NOT EXISTS equipment TEXT;

-- 4. Agregar columnas a la tabla workout_sessions para rastrear duraciones totales
ALTER TABLE workout_sessions 
  ADD COLUMN IF NOT EXISTS total_duration INTEGER,
  ADD COLUMN IF NOT EXISTS total_paused_time INTEGER;

-- 5. Comentarios para documentación
COMMENT ON COLUMN workout_sessions.notes IS 'Notas del usuario sobre la sesión de entrenamiento';
COMMENT ON COLUMN session_exercises.set_durations IS 'Array con la duración de cada serie en segundos';
COMMENT ON COLUMN session_exercises.pause_durations IS 'Array con el tiempo pausado en cada serie en segundos';
COMMENT ON COLUMN workout_sessions.total_duration IS 'Duración total del entrenamiento en segundos';
COMMENT ON COLUMN workout_sessions.total_paused_time IS 'Tiempo total pausado durante el entrenamiento en segundos';

-- 6. Índices opcionales para mejorar el rendimiento de consultas analíticas
CREATE INDEX IF NOT EXISTS idx_workout_sessions_total_duration 
  ON workout_sessions(total_duration);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_total_paused_time 
  ON workout_sessions(total_paused_time);

-- ========================================
-- MIGRACIÓN 2: Session Fields (CRÍTICO)
-- ========================================

-- 1. Agregar columna exercise_name a session_exercises (para guardar el nombre directamente)
ALTER TABLE session_exercises 
  ADD COLUMN IF NOT EXISTS exercise_name TEXT;

-- 2. Agregar sets_completed en formato JSONB (nueva columna para reemplazar actual_reps/actual_weight)
ALTER TABLE session_exercises 
  ADD COLUMN IF NOT EXISTS sets_completed JSONB;

-- 3. Hacer las columnas antiguas opcionales (por compatibilidad)
ALTER TABLE session_exercises 
  ALTER COLUMN completed_sets DROP NOT NULL,
  ALTER COLUMN actual_reps DROP NOT NULL,
  ALTER COLUMN actual_weight DROP NOT NULL;

-- 4. Agregar columna notes a session_exercises
ALTER TABLE session_exercises 
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 5. Hacer exercise_id opcional (ya que ahora podemos guardar solo el nombre)
ALTER TABLE session_exercises 
  ALTER COLUMN exercise_id DROP NOT NULL;

-- 6. Agregar columnas a workout_sessions para compatibilidad
ALTER TABLE workout_sessions 
  ADD COLUMN IF NOT EXISTS routine_name TEXT,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- 7. Hacer routine_id opcional (para rutinas personalizadas/eliminadas)
ALTER TABLE workout_sessions 
  ALTER COLUMN routine_id DROP NOT NULL;

-- 8. Comentarios para documentación
COMMENT ON COLUMN session_exercises.exercise_name IS 'Nombre del ejercicio (guardado directamente para evitar dependencia de exercise_id)';
COMMENT ON COLUMN session_exercises.sets_completed IS 'Array JSONB con las series completadas [{reps: number, weight: number}]';
COMMENT ON COLUMN session_exercises.notes IS 'Notas específicas del ejercicio en esta sesión';
COMMENT ON COLUMN workout_sessions.routine_name IS 'Nombre de la rutina (guardado directamente)';
COMMENT ON COLUMN workout_sessions.completed_at IS 'Fecha y hora de finalización de la sesión';

-- 9. Índice para búsquedas por nombre de ejercicio
CREATE INDEX IF NOT EXISTS idx_session_exercises_exercise_name 
  ON session_exercises(exercise_name);

-- ========================================
-- VERIFICACIÓN
-- ========================================
-- Si todo se ejecutó correctamente, deberías ver este mensaje:
DO $$
BEGIN
  RAISE NOTICE '✅ Migraciones ejecutadas exitosamente';
  RAISE NOTICE 'Verifica en Table Editor que las columnas se hayan creado';
END $$;
