import type { Exercise, Routine } from '@/types';
import { EXERCISE_DATABASE } from '@/data/exercises';
import { calculateRestBetweenSets, calculateRestBetweenExercises } from '@/lib/workout/restCalculator';

/**
 * Calcula el tiempo de descanso para la siguiente serie
 * Prioridad: perSetOverride > exerciseOverride > exerciseConfig > routineConfig > smart > default
 */
export function calculateNextRestTime(params: {
  currentExercise: Exercise;
  routine: Routine;
  restOverrides: Record<string, number>;
  perSetOverrides: Record<string, number[]>;
  currentSet: number;
  useSmartRest: boolean;
}): number {
  const { currentExercise, routine, restOverrides, perSetOverrides, currentSet, useSmartRest } = params;
  const setIndex = currentSet - 1;
  
  // 1. Override individual de la serie (edición manual en workout)
  if (perSetOverrides?.[currentExercise.id]?.[setIndex]) {
    return perSetOverrides[currentExercise.id][setIndex];
  }
  
  // 2. Override del ejercicio (edición manual en workout)
  if (restOverrides?.[currentExercise.id]) {
    return restOverrides[currentExercise.id];
  }
  
  // 3. Configurado en el ejercicio (manual o descanso inteligente aplicado)
  // Tiene prioridad sobre el tiempo global de la rutina
  if (currentExercise.restBetweenSets) {
    return currentExercise.restBetweenSets;
  }
  
  // 4. Configurado en la rutina (tiempo global)
  if (routine.restBetweenSets) {
    return routine.restBetweenSets;
  }
  
  // 5. Descanso inteligente (solo si está habilitado y no hay configuración manual)
  if (useSmartRest && currentExercise.useSmartRest !== false) {
    const exerciseTemplate = EXERCISE_DATABASE.find(e => e.name === currentExercise.name);
    if (exerciseTemplate) {
      const currentSetData = currentExercise.sets[currentSet - 1];
      const restRecommendation = calculateRestBetweenSets(
        exerciseTemplate,
        currentExercise.sets.length,
        currentSetData?.reps || 10,
        'intermediate'
      );
      return restRecommendation.recommended;
    }
  }
  
  // 6. Default
  return 90;
}

/**
 * Calcula el tiempo de descanso entre ejercicios
 */
export function calculateExerciseRestTime(params: {
  currentExercise: Exercise;
  nextExercise: Exercise;
  routine: Routine;
  restOverrides: Record<string, number>;
  useSmartRest: boolean;
}): number {
  const { currentExercise, nextExercise, routine, restOverrides, useSmartRest } = params;
  
  // Override del ejercicio
  if (restOverrides[currentExercise.id]) {
    return restOverrides[currentExercise.id];
  }
  
  // Configurado en la rutina
  if (routine.restBetweenExercises) {
    return routine.restBetweenExercises;
  }
  
  // Descanso inteligente
  if (useSmartRest) {
    const currentTemplate = EXERCISE_DATABASE.find(e => e.name === currentExercise.name);
    const nextTemplate = EXERCISE_DATABASE.find(e => e.name === nextExercise.name);
    
    if (currentTemplate && nextTemplate) {
      const restRecommendation = calculateRestBetweenExercises(
        currentTemplate,
        nextTemplate,
        'intermediate'
      );
      return restRecommendation.recommended;
    }
  }
  
  // Default: 120 segundos
  return 120;
}

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
