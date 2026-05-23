import { useEffect, useRef } from 'react';
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
  
  // Ref para rastrear el último ejercicio procesado
  const lastProcessedExerciseRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Resetear el ref cuando cambia el ejercicio actual
    if (currentExercise) {
      const exerciseKey = `${currentExercise.id}-${currentExerciseIndex}`;
      // Solo resetear si es un ejercicio diferente
      if (lastProcessedExerciseRef.current && !lastProcessedExerciseRef.current.startsWith(currentExercise.id)) {
        lastProcessedExerciseRef.current = null;
      }
    }
  }, [currentExercise?.id, currentExerciseIndex]);
  
  useEffect(() => {
    if (!currentExercise || !routine) return;
    
    // NO ejecutar auto-avance si hay un timer activo, está ejecutando o en preparación
    if (showTimer || isExecutingSet || showPreparation) {
      return;
    }
    
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
      // Prevenir procesamiento duplicado del mismo ejercicio
      const exerciseKey = `${currentExercise.id}-${currentExerciseIndex}`;
      if (lastProcessedExerciseRef.current === exerciseKey) {
        // console.log('[Auto-advance] Ya procesado este ejercicio, ignorando');
        return;
      }
      
      lastProcessedExerciseRef.current = exerciseKey;
      
      const isLastExercise = currentExerciseIndex >= routine.exercises.length - 1;
      
      if (isLastExercise) {
        // console.log('[Auto-advance] Último ejercicio, mostrando modal');
        onShowFinishModal();
      } else {
        // console.log('[Auto-advance] Avanzando al siguiente ejercicio');
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
    routine?.exercises?.length,  // ✅ Agregado para detectar cambios en la rutina
    onAdvanceToNextExercise,
    onShowFinishModal
  ]);
}
