-- Migration: Add exercise_name and other workout session fields
-- Fecha: 2024-12-05
-- Descripción: Agrega columnas necesarias para guardar sesiones sin depender de exercise_id

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
