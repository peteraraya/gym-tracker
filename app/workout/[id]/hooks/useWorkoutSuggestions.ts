import { useEffect, useState } from 'react';
import { generateWorkoutSuggestions, generateLiveSuggestions, type WorkoutSuggestion } from '@/lib/workoutSuggestions';
import { calculateNextRestTime } from '../utils/workoutCalculations';
import type { Exercise, Routine } from '@/types';
import type { WorkoutSession } from '../types/workout.types';

interface UseWorkoutSuggestionsParams {
  currentExercise: Exercise | null;
  routine: Routine | null;
  currentSet: number;
  currentWeight: number | '';
  sessions: WorkoutSession[];
  restOverrides: Record<string, number>;
  perSetRestOverrides: Record<string, number[]>;
  useSmartRest: boolean;
  showTimer: boolean;
  showPreparation: boolean;
  isExecutingSet: boolean;
  onSuccess: (message: string, duration?: number) => void;
  onError: (message: string, duration?: number) => void;
}

/**
 * Hook que maneja las sugerencias de entrenamiento
 * - Genera sugerencias basadas en historial
 * - Genera sugerencias en vivo durante el entrenamiento
 * - Muestra toasts para sugerencias importantes
 */
export function useWorkoutSuggestions(params: UseWorkoutSuggestionsParams) {
  const {
    currentExercise,
    routine,
    currentSet,
    currentWeight,
    sessions,
    restOverrides,
    perSetRestOverrides,
    useSmartRest,
    showTimer,
    showPreparation,
    isExecutingSet,
    onSuccess,
    onError
  } = params;

  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<number>>(new Set());

  // Resetear sugerencias descartadas cuando cambia el ejercicio
  useEffect(() => {
    setDismissedSuggestions(new Set());
  }, [currentExercise?.id]);

  // Generar sugerencias
  useEffect(() => {
    if (!routine || !currentExercise) return;
    
    // No mostrar durante el timer, preparación o ejecución de serie
    if (showTimer || showPreparation || isExecutingSet) return;

    // ✅ Usar la misma lógica que handleCompleteSet para calcular el descanso
    const currentRestTime = calculateNextRestTime({
      currentExercise,
      routine,
      restOverrides,
      perSetOverrides: perSetRestOverrides,
      currentSet,
      useSmartRest
    });

    // Sugerencias generales basadas en historial
    const generalSuggestions = generateWorkoutSuggestions(
      sessions as any[],
      currentExercise.name,
      typeof currentWeight === 'number' ? currentWeight : undefined,
      currentRestTime
    );

    // Sugerencias en vivo para el ejercicio actual
    const liveSuggestions = generateLiveSuggestions(
      currentExercise.name,
      currentSet,
      currentExercise.sets.length,
      typeof currentWeight === 'number' ? currentWeight : 0,
      sessions as any[]
    );

    const allSuggestions = [...generalSuggestions, ...liveSuggestions];
    
    // Mostrar sugerencias como toasts (solo las más importantes) - SOLO UNA VEZ
    if (allSuggestions.length > 0 && !dismissedSuggestions.has(0)) {
      // Mostrar solo la primera sugerencia de advertencia como toast
      const warningSuggestion = allSuggestions.find(
        s => s.type === 'rest_warning' || s.type === 'overtraining'
      );
      
      if (warningSuggestion) {
        onError(`⚠️ ${warningSuggestion.message}`, 5000);
        setDismissedSuggestions(prev => new Set([...prev, 0]));
      } else {
        // Si no hay advertencias, mostrar la primera sugerencia positiva
        const positiveSuggestion = allSuggestions[0];
        if (positiveSuggestion) {
          onSuccess(`💡 ${positiveSuggestion.message}`, 4000);
          setDismissedSuggestions(prev => new Set([...prev, 0]));
        }
      }
    }
    
    setSuggestions(allSuggestions);
  }, [
    currentExercise?.id,
    currentSet,
    currentWeight,
    routine,
    sessions,
    restOverrides,
    showTimer,
    showPreparation,
    isExecutingSet,
    dismissedSuggestions,
    onSuccess,
    onError
  ]);

  return {
    suggestions,
    dismissedSuggestions,
    dismissSuggestion: (index: number) => {
      setDismissedSuggestions(prev => new Set([...prev, index]));
    }
  };
}
