/**
 * Cálculos puros para rutinas de entrenamiento.
 * Sin dependencias de React, Supabase o contexto de aplicación.
 * Solo recibe datos y devuelve resultados.
 */

import type { Exercise } from "@/types";
import type { ExerciseTemplate } from "@/data/exercises";

type ExerciseWithoutId = Omit<Exercise, "id">;

/**
 * Determina si un ejercicio es de peso corporal (no requiere peso).
 */
export function isBodyweightExercise(exercise: ExerciseWithoutId): boolean {
  const equipment = exercise.equipment?.toLowerCase() ?? "";
  const name = exercise.name?.toLowerCase() ?? "";
  return (
    equipment.includes("peso corporal") ||
    equipment.includes("bodyweight") ||
    equipment.includes("calistenia") ||
    name.includes("plancha") ||
    name.includes("flexión") ||
    name.includes("dominada") ||
    name.includes("abdominal") ||
    name.includes("pull up") ||
    name.includes("push up")
  );
}

/**
 * Parsea una cadena de tiempo de descanso (ej. "60-90 segundos") a segundos numéricos.
 */
export function parseRestTime(restTime?: string): number | undefined {
  if (!restTime) return undefined;
  const match = restTime.match(/(\d+)/);
  if (!match) return undefined;
  let seconds = parseInt(match[1], 10);
  if (restTime.toLowerCase().includes("min")) {
    seconds = seconds * 60;
  }
  return seconds;
}

/**
 * Calcula el volumen total de una rutina (kg).
 * Volumen = Σ(series × reps × peso) para cada ejercicio.
 */
export function calculateRoutineVolume(exercises: ExerciseWithoutId[]): number {
  return exercises.reduce((total, ex) => {
    const exerciseVolume = ex.sets.reduce((setTotal, set) => {
      const reps = typeof set.reps === "number" ? set.reps : 0;
      const weight = typeof set.weight === "number" ? set.weight : 0;
      return setTotal + reps * weight;
    }, 0);
    return total + exerciseVolume;
  }, 0);
}

/**
 * Calcula el número total de series en una rutina.
 */
export function calculateTotalSets(exercises: ExerciseWithoutId[]): number {
  return exercises.reduce((total, ex) => total + ex.sets.length, 0);
}

/**
 * Calcula el número total de repeticiones planificadas en una rutina.
 */
export function calculateTotalReps(exercises: ExerciseWithoutId[]): number {
  return exercises.reduce((total, ex) => {
    const exerciseReps = ex.sets.reduce((setTotal, set) => {
      const reps = typeof set.reps === "number" ? set.reps : 0;
      return setTotal + reps;
    }, 0);
    return total + exerciseReps;
  }, 0);
}

/**
 * Extrae los grupos musculares únicos de una lista de ejercicios
 * usando una función de búsqueda de plantilla.
 */
export function extractMuscleGroups(
  exercises: ExerciseWithoutId[],
  getTemplate: (name: string) => ExerciseTemplate | undefined,
): string[] {
  const groups = new Set<string>();
  exercises.forEach((ex) => {
    const template = getTemplate(ex.name);
    if (template?.muscleGroup) {
      groups.add(template.muscleGroup);
    }
  });
  return Array.from(groups);
}

/**
 * Valida que un ejercicio tenga nombre válido.
 */
export function validateExerciseName(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return "Nombre del ejercicio requerido";
  }
  return null;
}

/**
 * Valida que una serie tenga reps válidas.
 */
export function validateSetReps(reps: number | string | undefined): string | null {
  const parsed =
    typeof reps === "number" ? reps : parseInt(String(reps ?? "0"), 10);
  if (!parsed || parsed <= 0) {
    return "Reps requeridas (> 0)";
  }
  return null;
}

/**
 * Valida que una serie tenga peso válido (salvo ejercicios de peso corporal).
 */
export function validateSetWeight(
  weight: number | string | undefined,
  isBodyweight: boolean,
): string | null {
  const parsed =
    typeof weight === "number"
      ? weight
      : parseFloat(String(weight ?? 0));
  if (isBodyweight) return null;
  if (!parsed || parsed <= 0) {
    return "Peso requerido (> 0)";
  }
  return null;
}
