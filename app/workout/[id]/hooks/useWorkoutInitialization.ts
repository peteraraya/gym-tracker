import { useEffect, useState } from 'react';
import type { Routine } from '@/types';
import * as storageService from '@/lib/storage/storage';
import type { StoredWorkout, LastWeights } from '../types/workout.types';

interface UseWorkoutInitializationParams {
  routineId: string;
  getRoutineById: (id: string) => Routine | undefined;
  onRoutineLoaded: (routine: Routine) => void;
  onStateRestored: (state: Partial<StoredWorkout>) => void;
  onLastWeightsLoaded: (weights: LastWeights) => void;
  startWorkout: (routine: Routine) => void;
}

interface UseWorkoutInitializationReturn {
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

/**
 * Hook que maneja la inicialización del workout
 * - Carga la rutina
 * - Restaura estado guardado si existe
 * - Carga últimos pesos utilizados
 * - Inicia nuevo workout si es necesario
 */
export function useWorkoutInitialization(
  params: UseWorkoutInitializationParams
): UseWorkoutInitializationReturn {
  const {
    routineId,
    getRoutineById,
    onRoutineLoaded,
    onStateRestored,
    onLastWeightsLoaded,
    startWorkout
  } = params;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        // 1. Cargar rutina
        const foundRoutine = getRoutineById(routineId);
        
        if (!foundRoutine) {
          if (mounted) {
            setError('Rutina no encontrada');
            setIsLoading(false);
          }
          return;
        }

        if (!mounted) return;
        onRoutineLoaded(foundRoutine);

        // 2. Verificar si hay un workout guardado
        const storedWorkout = await storageService.getActiveWorkout();

        if (!mounted) return;

        // 3. Si hay workout guardado y coincide con esta rutina, restaurar estado
        if (storedWorkout && storedWorkout.routineId === routineId) {
          onStateRestored({
            currentExerciseIndex: Number(storedWorkout.currentExerciseIndex ?? 0),
            currentSet: Number(storedWorkout.currentSet ?? 1),
            completedSets: (storedWorkout.completedSets ?? {}) as Record<string, number>,
            actualReps: (storedWorkout.actualReps ?? {}) as Record<string, number[]>,
            actualWeights: (storedWorkout.actualWeights ?? {}) as Record<string, number[]>,
            isResting: storedWorkout.isResting as boolean | undefined,
            restTimerDuration: storedWorkout.restTimerDuration as number | undefined,
            restTimerTitle: storedWorkout.restTimerTitle as string | undefined,
            restTimerNextExercise: storedWorkout.restTimerNextExercise as string | undefined,
            restTimerStartedAt: storedWorkout.restTimerStartedAt as number | undefined
          });
        } else if (!storedWorkout || storedWorkout.routineId !== routineId) {
          // 4. Iniciar nuevo workout si no hay ninguno guardado o es de otra rutina
          startWorkout(foundRoutine);
        }

        // 5. Cargar últimos pesos guardados
        try {
          const lastWeights = await storageService.getLastWeights();
          if (mounted && lastWeights) {
            onLastWeightsLoaded(lastWeights as LastWeights);
          }
        } catch (e) {
          console.warn('No se pudieron cargar los últimos pesos:', e);
        }

        if (mounted) {
          setIsInitialized(true);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error al inicializar workout:', err);
        if (mounted) {
          setError('Error al cargar el entrenamiento');
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [routineId, getRoutineById, onRoutineLoaded, onStateRestored, onLastWeightsLoaded, startWorkout]);

  return {
    isLoading,
    error,
    isInitialized
  };
}
