import type { Exercise, Routine } from '@/types';
import {
  calculateNextRestTime as unifiedCalculateNextRestTime,
  calculateExerciseRestTime as unifiedCalculateExerciseRestTime,
} from '../services/restCalculationService';

// Re-export unified rest calculation functions
export const calculateNextRestTime = unifiedCalculateNextRestTime;
export const calculateExerciseRestTime = unifiedCalculateExerciseRestTime;

/**
 * Determina si se debe avanzar automáticamente al siguiente ejercicio
 */
export function shouldAutoAdvance(params: {
  completedSets: Record<string, number>;
  actualReps: Record<string, number[]>;
  currentExercise: Exercise;
  routine: Routine;
  currentExerciseIndex: number;
  showTimer: boolean;
  isExecutingSet: boolean;
  showPreparation: boolean;
}): boolean {
  const {
    completedSets,
    actualReps,
    currentExercise,
    routine,
    currentExerciseIndex,
    showTimer,
    isExecutingSet,
    showPreparation
  } = params;
  
  const exerciseId = currentExercise.id;
  const totalSets = currentExercise.sets.length;
  const completedCount = completedSets[exerciseId] || 0;
  
  // No todas las series completadas
  if (completedCount !== totalSets || completedCount === 0) {
    return false;
  }
  
  // Verificar que todas las series tienen datos
  const allSetsHaveData = currentExercise.sets.every((_, idx) => {
    return actualReps[exerciseId]?.[idx] > 0;
  });
  
  if (!allSetsHaveData) {
    return false;
  }
  
  // No avanzar si hay timer, está ejecutando o en preparación
  if (showTimer || isExecutingSet || showPreparation) {
    return false;
  }
  
  // Verificar si está editando un ejercicio anterior
  const lastCompletedIndex = findLastCompletedExerciseIndex(routine.exercises, completedSets);
  if (lastCompletedIndex > currentExerciseIndex) {
    return false;
  }
  
  return true;
}

/**
 * Encuentra el índice del último ejercicio con series completadas
 */
function findLastCompletedExerciseIndex(
  exercises: Exercise[],
  completedSets: Record<string, number>
): number {
  for (let i = exercises.length - 1; i >= 0; i--) {
    const ex = exercises[i];
    const exCompletedSets = completedSets[ex.id] || 0;
    if (exCompletedSets > 0) {
      return i;
    }
  }
  return -1;
}

/**
 * Calcula el progreso total del workout (porcentaje)
 */
export function calculateWorkoutProgress(params: {
  routine: Routine;
  currentExerciseIndex: number;
  currentSet: number;
}): number {
  const { routine, currentExerciseIndex, currentSet } = params;
  
  const totalSets = routine.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = routine.exercises
    .slice(0, currentExerciseIndex)
    .reduce((acc, ex) => acc + ex.sets.length, 0) + (currentSet - 1);
  
  return (completedSets / totalSets) * 100;
}

/**
 * Helper para actualizar arrays anidados en estado
 */
export function updateNestedArray<T>(
  state: Record<string, T[]>,
  key: string,
  index: number,
  value: T
): Record<string, T[]> {
  return {
    ...state,
    [key]: [
      ...(state[key] || []).slice(0, index),
      value,
      ...(state[key] || []).slice(index + 1)
    ]
  };
}
