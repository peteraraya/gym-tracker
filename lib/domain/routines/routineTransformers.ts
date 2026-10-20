/**
 * Transformadores para convertir ExerciseTemplate en Exercise de rutina.
 * Lógica pura sin dependencias de React ni contexto de aplicación.
 */

import type { Exercise, Set as ExerciseSet, SetType } from "@/types";
import type { ExerciseTemplate } from "@/data/exercises";
import type { WarmupExercise } from "@/data/warmupExercises";
import { parseRestTime } from "./routineCalculations";

type ExerciseWithoutId = Omit<Exercise, "id">;

/**
 * Convierte un ExerciseTemplate en un Exercise de rutina con series iniciales.
 * Usa recomendaciones del template si están disponibles.
 */
export function templateToExercise(
  template: ExerciseTemplate,
  recommendations?: {
    sets: number;
    reps: number;
    weight: number;
    restTime?: string;
  },
): ExerciseWithoutId {
  const recSets = recommendations?.sets ?? template.defaultSets ?? 3;
  const recReps = recommendations?.reps ?? parseRepsRange(template.recommendedReps);
  const recWeight = recommendations?.weight ?? 0;
  const restSeconds =
    recommendations?.restTime
      ? parseRestTime(recommendations.restTime)
      : parseRestTime(template.restTime);

  const sets: ExerciseSet[] = Array(recSets)
    .fill(null)
    .map(() => ({
      reps: recReps,
      weight: recWeight,
      type: "normal" as SetType,
    }));

  return {
    name: template.name,
    sets,
    equipment: template.equipment,
    notes: "",
    restBetweenSets: restSeconds,
  };
}

/**
 * Convierte un WarmupExercise en un Exercise de rutina.
 */
export function warmupToExercise(
  warmup: WarmupExercise,
): ExerciseWithoutId {
  return {
    name: warmup.name,
    sets: Array(warmup.defaultSets ?? 2)
      .fill(null)
      .map(() => ({
        reps: warmup.defaultReps ?? 15,
        weight: 0,
        type: "normal" as SetType,
      })),
    equipment: warmup.equipment,
    notes: "",
    restBetweenSets: 0,
  };
}

/**
 * Parsea un rango de reps (ej. "8-12") a un número central.
 */
function parseRepsRange(repsRange?: string): number {
  if (!repsRange) return 10;
  const match = repsRange.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 10;
}

/**
 * Clona un ejercicio con nuevas series.
 */
export function cloneExerciseWithSets(
  exercise: ExerciseWithoutId,
  sets: ExerciseSet[],
): ExerciseWithoutId {
  return {
    ...exercise,
    sets,
  };
}

/**
 * Reordena ejercicios después de un drag & drop.
 * Mueve el ejercicio de 'from' a 'to'.
 */
export function reorderExercises<T>(
  items: T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  const result = [...items];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}
