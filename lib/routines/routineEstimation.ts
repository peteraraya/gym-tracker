/**
 * Utilidades para estimar la duración de una rutina
 */

import type { Exercise } from '@/types';

/**
 * Tiempo promedio de ejecución por serie en segundos
 * Basado en:
 * - 3-5 segundos por repetición (promedio 4 segundos)
 * - Tiempo de setup/ajuste entre series
 */
const AVG_EXECUTION_TIME_PER_SET = 30; // 30 segundos por serie (conservador)

/**
 * Calcula el tiempo estimado de una rutina en segundos
 * 
 * @param exercises - Array de ejercicios de la rutina
 * @param restBetweenSets - Descanso por defecto entre series (segundos)
 * @param restBetweenExercises - Descanso por defecto entre ejercicios (segundos)
 * @returns Tiempo estimado en segundos
 */
export function calculateRoutineDuration(
  exercises: Array<Omit<Exercise, 'id'> | Exercise>,
  restBetweenSets: number = 60,
  restBetweenExercises: number = 120
): number {
  if (!exercises || exercises.length === 0) {
    return 0;
  }

  let totalExecutionTime = 0;
  let totalRestBetweenSets = 0;
  let totalRestBetweenExercises = 0;

  exercises.forEach((exercise, index) => {
    const numSets = exercise.sets.length;
    
    // Tiempo de ejecución de todas las series del ejercicio
    totalExecutionTime += numSets * AVG_EXECUTION_TIME_PER_SET;
    
    // Descanso entre series del mismo ejercicio (n-1 descansos)
    if (numSets > 1) {
      const exerciseRestTime = exercise.restBetweenSets ?? restBetweenSets;
      totalRestBetweenSets += (numSets - 1) * exerciseRestTime;
    }
    
    // Descanso entre ejercicios (no después del último)
    if (index < exercises.length - 1) {
      totalRestBetweenExercises += restBetweenExercises;
    }
  });

  return totalExecutionTime + totalRestBetweenSets + totalRestBetweenExercises;
}

/**
 * Formatea la duración en un string legible
 * 
 * @param seconds - Duración en segundos
 * @returns String formateado (ej: "45 min", "1h 15min")
 */
export function formatEstimatedDuration(seconds: number): string {
  if (seconds === 0) return '0 min';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.ceil((seconds % 3600) / 60);
  
  if (hours === 0) {
    return `${minutes} min`;
  }
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${minutes}min`;
}

/**
 * Obtiene un rango de duración estimada (mínimo y máximo)
 * considerando variabilidad en la ejecución
 * 
 * @param exercises - Array de ejercicios de la rutina
 * @param restBetweenSets - Descanso por defecto entre series
 * @param restBetweenExercises - Descanso por defecto entre ejercicios
 * @returns Objeto con duración mínima y máxima en segundos
 */
export function calculateRoutineDurationRange(
  exercises: Array<Omit<Exercise, 'id'> | Exercise>,
  restBetweenSets: number = 60,
  restBetweenExercises: number = 120
): { min: number; max: number; avg: number } {
  const baseTime = calculateRoutineDuration(exercises, restBetweenSets, restBetweenExercises);
  
  // Variabilidad: -15% a +25% del tiempo base
  // (algunos entrenan más rápido, otros más lento)
  const min = Math.floor(baseTime * 0.85);
  const max = Math.ceil(baseTime * 1.25);
  
  return {
    min,
    max,
    avg: baseTime
  };
}

/**
 * Calcula estadísticas detalladas de la rutina
 */
export function getRoutineStats(
  exercises: Array<Omit<Exercise, 'id'> | Exercise>,
  restBetweenSets: number = 60,
  restBetweenExercises: number = 120
) {
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const totalExercises = exercises.length;
  const duration = calculateRoutineDuration(exercises, restBetweenSets, restBetweenExercises);
  const range = calculateRoutineDurationRange(exercises, restBetweenSets, restBetweenExercises);
  
  return {
    totalSets,
    totalExercises,
    estimatedDuration: duration,
    estimatedDurationFormatted: formatEstimatedDuration(duration),
    durationRange: {
      min: range.min,
      max: range.max,
      minFormatted: formatEstimatedDuration(range.min),
      maxFormatted: formatEstimatedDuration(range.max)
    }
  };
}
