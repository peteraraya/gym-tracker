import { useEffect, useState, useRef } from 'react';
import { generateWorkoutSuggestions, generateLiveSuggestions, type WorkoutSuggestion } from '@/lib/workout/workoutSuggestions';
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
  smartRestTime?: number;
  showTimer: boolean;
  // ❌ Removido: showPreparation (ya no se usa)
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
    smartRestTime,
    showTimer,
    // ❌ Removido: showPreparation
    isExecutingSet,
    onSuccess,
    onError
  } = params;

  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<number>>(new Set());
  // CRITICAL BUG FIX: Use ref instead of state to track "already toasted" guard.
  // Prevents infinite render-toast-dismiss loop caused by dismissedSuggestions in deps array.
  const hasShownToastRef = useRef(false);
  // Guard para evitar actualizaciones redundantes de `suggestions` que provoquen render loops
  const lastSuggestionsKeyRef = useRef<string | null>(null);

  // Resetear sugerencias descartadas cuando cambia el ejercicio
  useEffect(() => {
    setDismissedSuggestions(new Set());
    hasShownToastRef.current = false;
  }, [currentExercise?.id]);

  // Generar sugerencias
  useEffect(() => {
    if (!routine || !currentExercise) return;
    
    // No mostrar durante el timer o ejecución de serie
    if (showTimer || isExecutingSet) return;

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
      currentRestTime,
      smartRestTime
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

    // Dedupe suggestions by a stable key (type + title + message)
    const seen = new Set<string>();
    const uniqueSuggestions: WorkoutSuggestion[] = [];
    for (const s of allSuggestions) {
      const key = `${s.type}::${s.title}::${s.message}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueSuggestions.push(s);
      }
    }
    
    // Mostrar sugerencias como toasts (solo las más importantes) - SOLO UNA VEZ
    // CRITICAL BUG FIX: Use ref instead of dismissedSuggestions to break render loop.
    // dismissedSuggestions in the dependency array caused the effect to re-run every
    // time a suggestion was dismissed, creating an infinite render-toast-dismiss loop.
    if (allSuggestions.length > 0 && !hasShownToastRef.current) {
      hasShownToastRef.current = true;
      // Mostrar solo la primera sugerencia de advertencia como toast
      const warningSuggestion = allSuggestions.find(
        s => s.type === 'rest_warning' || s.type === 'overtraining'
      );
      
      if (warningSuggestion) {
        onError(`⚠️ ${warningSuggestion.message}`, 5000);
      } else {
        // Si no hay advertencias, mostrar la primera sugerencia positiva
        const positiveSuggestion = allSuggestions[0];
        if (positiveSuggestion) {
          onSuccess(`💡 ${positiveSuggestion.message}`, 4000);
        }
      }
    }
    
    const key = uniqueSuggestions.map(s => `${s.type}::${s.title}::${s.message}`).join('||');
    if (key !== lastSuggestionsKeyRef.current) {
      lastSuggestionsKeyRef.current = key;
      setSuggestions(uniqueSuggestions);
    }
  }, [
    currentExercise?.id,
    currentSet,
    currentWeight,
    routine,
    sessions,
    restOverrides,
    showTimer,
    // ❌ Removido: showPreparation
    isExecutingSet,
    // ❌ CRITICAL BUG FIX: removed dismissedSuggestions from deps to break render loop.
    // dismissedSuggestions is a Set (new reference every dismissal), causing re-render.
    // The "already shown" guard is now managed via hasShownToastRef (a ref, no re-render).
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
