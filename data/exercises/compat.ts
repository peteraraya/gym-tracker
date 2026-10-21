/**
 * Archivo de compatibilidad para mantener la API existente.
 *
 * Re-exporta EXERCISE_DATABASE y funciones de ayuda del archivo original
 * para mantener la compatibilidad mientras se migra gradualmente al code
 * splitting (data/exercises/lazy.ts + data/exercises/index.ts).
 */

import type { ExerciseTemplate, MuscleGroup as MuscleGroupType } from '../exercises';
import { EXERCISE_DATABASE } from '../exercises';

export type { MuscleGroup } from './groups';
export type { ExerciseTemplate } from '../exercises';
export { EXERCISE_DATABASE };

/**
 * Devuelve los ejercicios de un grupo muscular (desde la base completa).
 * @deprecated Usar getExercisesByMuscleGroupLazy de '@/data/exercises/lazy' para carga diferida.
 */
export function getExercisesByMuscleGroup(
  muscleGroup: MuscleGroupType,
): ExerciseTemplate[] {
  return EXERCISE_DATABASE.filter((ex) => ex.muscleGroup === muscleGroup);
}

/**
 * Devuelve todos los ejercicios (base completa).
 * @deprecated Usar getAllExerciseGroupsLazy de '@/data/exercises/lazy'.
 */
export function getAllExercises(): ExerciseTemplate[] {
  return EXERCISE_DATABASE;
}

/**
 * Busca un ejercicio por ID (desde la base completa).
 * @deprecated Usar carga diferida por grupo muscular.
 */
export function getExerciseById(id: string): ExerciseTemplate | undefined {
  return EXERCISE_DATABASE.find((ex) => ex.id === id);
}

/**
 * Busca ejercicios por término (desde la base completa).
 * @deprecated Usar carga diferida + filtrado por grupo.
 */
export function searchExercises(term: string): ExerciseTemplate[] {
  const t = term.toLowerCase();
  return EXERCISE_DATABASE.filter(
    (ex) =>
      ex.name.toLowerCase().includes(t) ||
      ex.muscleGroup.toLowerCase().includes(t) ||
      (ex.equipment && ex.equipment.toLowerCase().includes(t)),
  );
}
