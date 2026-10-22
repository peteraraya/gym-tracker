/**
 * Utilidades puras para lógica de workout.
 * Sin dependencias de React, contexto de aplicación o Supabase.
 */

import type { ActiveWorkout } from "@/lib/infrastructure/storage/storage";
import type { WorkoutData } from "./workoutTypes";

/**
 * Crea una función debounce con cancel y flush.
 * Útil para operaciones que no deben ejecutarse en cada cambio,
 * sino después de un período de inactividad.
 */
export function createDebounce<Args extends unknown[], Return>(
  func: (...args: Args) => Return,
  wait: number,
): {
  (...args: Args): void;
  cancel: () => void;
  flush: () => void;
} {
  let timeout: NodeJS.Timeout | null = null;
  let lastArgs: Args | null = null;

  const executedFunction = function (...args: Args) {
    lastArgs = args;
    const later = () => {
      timeout = null;
      lastArgs = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  } as {
    (...args: Args): void;
    cancel: () => void;
    flush: () => void;
  };

  executedFunction.cancel = function () {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    lastArgs = null;
  };

  // Ejecuta inmediatamente la última llamada pendiente y cancela el timeout.
  // Se usa al pausar/backgroundear la app para no perder la última
  // actualización que quedó atrapada dentro de la ventana del debounce.
  executedFunction.flush = function () {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    if (lastArgs) {
      const args = lastArgs;
      lastArgs = null;
      func(...args);
    }
  };

  return executedFunction;
}

/**
 * Cuenta cuántas flags de completado están activas en un array.
 */
export function countCompletedFlags(
  flags: boolean[] = [],
  totalSets = flags.length,
): number {
  return flags.slice(0, totalSets).filter(Boolean).length;
}

/**
 * Obtiene las flags de completado para un ejercicio específico.
 * Primero usa los flags explícitos si existen, de lo contrario
 * calcula basado en completedSets.
 */
export function getCompletionFlagsForExercise(params: {
  completedSetFlags?: Record<string, boolean[]>;
  completedSets?: Record<string, number>;
  exerciseId: string;
  totalSets: number;
}): boolean[] {
  const explicitFlags = params.completedSetFlags?.[params.exerciseId];
  if (Array.isArray(explicitFlags)) {
    return explicitFlags.slice(0, params.totalSets).map(Boolean);
  }
  const completedCount = Math.min(
    params.completedSets?.[params.exerciseId] ?? 0,
    params.totalSets,
  );
  return Array(params.totalSets)
    .fill(false)
    .map((_, i) => i < completedCount);
}

/**
 * Determina si un workout está pausado basándose en el estado de ActiveWorkout.
 */
export function isWorkoutPaused(activeWorkout: ActiveWorkout | null): boolean {
  return !!activeWorkout?.is_paused;
}

/**
 * Calcula el tiempo transcurrido desde el inicio del workout en segundos.
 */
export function calculateWorkoutElapsedSeconds(
  startTime: Date | null | undefined,
): number {
  if (!startTime) return 0;
  return Math.floor((Date.now() - startTime.getTime()) / 1000);
}

/**
 * Calcula el porcentaje de progreso del workout basado en sets completados
 * vs sets totales.
 */
export function calculateWorkoutProgress(
  completedSets: number,
  totalSets: number,
): number {
  if (totalSets === 0) return 0;
  return Math.min(100, Math.round((completedSets / totalSets) * 100));
}

/**
 * Filtra sugerencias de rutinas basándose en los criterios del usuario.
 */
interface SuggestableRoutine {
  estimatedDuration?: number;
  muscleGroups?: string[];
  [key: string]: unknown;
}

export function filterSuggestedRoutines(
  routines: SuggestableRoutine[],
  filters: {
    minDuration?: number;
    maxDuration?: number;
    muscleGroups?: string[];
    difficulty?: string;
  },
): SuggestableRoutine[] {
  return routines.filter((routine) => {
    const estimatedDuration = routine.estimatedDuration;
    if (filters.minDuration && typeof estimatedDuration === 'number' && estimatedDuration < filters.minDuration) {
      return false;
    }
    if (filters.maxDuration && typeof estimatedDuration === 'number' && estimatedDuration > filters.maxDuration) {
      return false;
    }
    if (
      filters.muscleGroups &&
      filters.muscleGroups.length > 0 &&
      !filters.muscleGroups.some((mg) => routine.muscleGroups?.includes(mg))
    ) {
      return false;
    }
    return true;
  });
}
