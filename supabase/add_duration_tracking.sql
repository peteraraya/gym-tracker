-- Migration: Add duration tracking and notes to workout sessions
-- Fecha: 2024-12-01
-- Descripción: Agrega columnas para notas y rastrear la duración de cada serie y el tiempo total del entrenamiento

-- 1. Agregar columna de notas a workout_sessions
ALTER TABLE workout_sessions 
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Agregar columnas a la tabla session_exercises para rastrear duraciones por serie
ALTER TABLE session_exercises 
  ADD COLUMN IF NOT EXISTS set_durations INTEGER[],
  ADD COLUMN IF NOT EXISTS pause_durations INTEGER[];

-- 2b. Asegurar compatibilidad en tabla exercises: agregar sets_data (jsonb) y equipment (text)
ALTER TABLE exercises
  ADD COLUMN IF NOT EXISTS sets_data JSONB,
  ADD COLUMN IF NOT EXISTS equipment TEXT;

-- 3. Agregar columnas a la tabla workout_sessions para rastrear duraciones totales
ALTER TABLE workout_sessions 
  ADD COLUMN IF NOT EXISTS total_duration INTEGER,
  ADD COLUMN IF NOT EXISTS total_paused_time INTEGER;

-- 4. Comentarios para documentación
COMMENT ON COLUMN workout_sessions.notes IS 'Notas del usuario sobre la sesión de entrenamiento';
COMMENT ON COLUMN session_exercises.set_durations IS 'Array con la duración de cada serie en segundos';
COMMENT ON COLUMN session_exercises.pause_durations IS 'Array con el tiempo pausado en cada serie en segundos';
COMMENT ON COLUMN workout_sessions.total_duration IS 'Duración total del entrenamiento en segundos';
COMMENT ON COLUMN workout_sessions.total_paused_time IS 'Tiempo total pausado durante el entrenamiento en segundos';

-- 5. Índices opcionales para mejorar el rendimiento de consultas analíticas
-- Estos pueden ser útiles si quieres filtrar o ordenar por duración
CREATE INDEX IF NOT EXISTS idx_workout_sessions_total_duration 
  ON workout_sessions(total_duration);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_total_paused_time 
  ON workout_sessions(total_paused_time);
