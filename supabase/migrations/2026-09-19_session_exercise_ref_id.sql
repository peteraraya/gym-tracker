-- Migración: Agregar exercise_ref_id a session_exercises
-- Fecha: 2026-09-19
-- Descripción:
--   session_exercises ya tiene una columna `exercise_id` (uuid, FK a
--   exercises(id) ON DELETE CASCADE), pero el código de la app nunca la
--   llena — guarda el nombre del ejercicio en `exercise_name` y reconstruye
--   `exerciseId` a partir de ese nombre al leer, perdiendo el id real.
--
--   NO usamos esa columna `exercise_id` existente para arreglarlo: su FK
--   con ON DELETE CASCADE significa que si un usuario borra un ejercicio
--   de una rutina (algo normal al editarla; updateRoutine() borra
--   físicamente la fila de `exercises`), se borraría en cascada el
--   historial de sesiones que lo referencian. Eso destruiría datos de
--   entrenamientos pasados de forma silenciosa.
--
--   En su lugar, agregamos una columna nueva sin FK (igual que
--   exercise_name: una copia/snapshot del dato, no una referencia con
--   integridad referencial) para guardar el id real del ejercicio de la
--   rutina en el momento de completar la sesión, sin riesgo de cascada.

ALTER TABLE session_exercises
ADD COLUMN IF NOT EXISTS exercise_ref_id TEXT;

COMMENT ON COLUMN session_exercises.exercise_ref_id IS
  'Snapshot del id del ejercicio de la rutina al completar la sesión (sin FK, para no depender de que la fila en exercises siga existiendo). No confundir con la columna exercise_id (uuid, FK con ON DELETE CASCADE) que no se usa.';

CREATE INDEX IF NOT EXISTS idx_session_exercises_exercise_ref_id
  ON session_exercises(exercise_ref_id);
