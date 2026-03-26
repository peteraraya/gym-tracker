-- Migración: Agregar campos de descanso inteligente a la tabla exercises
-- Fecha: 2026-02-28
-- Descripción: Agrega rest_between_sets y use_smart_rest a exercises para soportar descanso inteligente por ejercicio

-- Agregar columna rest_between_sets (tiempo de descanso en segundos, nullable)
ALTER TABLE exercises 
ADD COLUMN IF NOT EXISTS rest_between_sets INTEGER;

-- Agregar columna use_smart_rest (flag booleano, default true)
ALTER TABLE exercises 
ADD COLUMN IF NOT EXISTS use_smart_rest BOOLEAN DEFAULT true;

-- Comentarios para documentación
COMMENT ON COLUMN exercises.rest_between_sets IS 'Tiempo de descanso específico del ejercicio en segundos. Si es NULL, usa el tiempo global de la rutina.';
COMMENT ON COLUMN exercises.use_smart_rest IS 'Si es true, el sistema calcula automáticamente el tiempo de descanso óptimo basado en el tipo de ejercicio.';
