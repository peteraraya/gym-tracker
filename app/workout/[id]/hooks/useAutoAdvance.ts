import { useEffect } from 'react';
import { shouldAutoAdvance } from '../utils/workoutCalculations';
import type { Exercise, Routine } from '@/types';

interface UseAutoAdvanceParams {
  currentExercise: Exercise | null;
  routine: Routine | null | undefined;
  completedSets: Record<string, number>;
  actualReps: Record<string, number[]>;
  currentExerciseIndex: number;
  showTimer: boolean;
  isExecutingSet: boolean;
  showPreparation: boolean;
  onAdvanceToNextExercise: () => void;
  onShowFinishModal: () => void;
}

/**
 * Hook que maneja el auto-avance entre ejercicios cuando se completan todas las series
 */
export function useAutoAdvance(params: UseAutoAdvanceParams) {
  const {
    currentExercise,
    routine,
    completedSets,
    actualReps,
    currentExerciseIndex,
    showTimer,
    isExecutingSet,
    showPreparation,
    onAdvanceToNextExercise,
    onShowFinishModal
  } = params;
  
  useEffect(() => {
    if (!currentExercise || !routine) return;
    
    const shouldAdvance = shouldAutoAdvance({
      completedSets,
      actualReps,
      currentExercise,
      routine,
      currentExerciseIndex,
      showTimer,
      isExecutingSet,
      showPreparation
    });
    
    if (shouldAdvance) {
      const isLastExercise = currentExerciseIndex >= routine.exercises.length - 1;
      
      if (isLastExercise) {
        onShowFinishModal();
      } else {
        onAdvanceToNextExercise();
      }
    }
  }, [
    currentExercise?.id,
    completedSets,
    actualReps,
    showTimer,
    isExecutingSet,
    showPreparation,
    currentExerciseIndex,
    routine,
    onAdvanceToNextExercise,
    onShowFinishModal
  ]);
}
