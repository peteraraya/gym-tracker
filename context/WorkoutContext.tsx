'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import * as storageService from '@/lib/storage/storage';
import type { ActiveWorkout } from '@/lib/storage/storage';
import type { Routine } from '@/types';

interface WorkoutState {
  routineId: string;
  routineName: string;
  currentExerciseIndex: number;
  currentSet: number;
  completedSets: { [key: string]: number };
  actualReps: { [key: string]: number[] };
  actualWeights: { [key: string]: number[] };
  startedAt: Date;
  // Estado del timer de descanso para persistencia
  isResting?: boolean;
  restTimerDuration?: number;
  restTimerTitle?: string;
  restTimerNextExercise?: string;
  restTimerStartedAt?: number; // timestamp de cuando empezó el descanso
}

interface WorkoutContextType {
  activeWorkout: WorkoutState | null;
  startWorkout: (routine: Routine) => void;
  updateWorkoutProgress: (
    exerciseIndex: number,
    set: number,
    completedSets: { [key: string]: number },
    actualReps: { [key: string]: number[] },
    actualWeights: { [key: string]: number[] },
    restState?: {
      isResting?: boolean;
      restTimerDuration?: number;
      restTimerTitle?: string;
      restTimerNextExercise?: string;
      restTimerStartedAt?: number;
    }
  ) => void;
  clearRestState: () => void;
  finishWorkout: () => void;
  cancelWorkout: () => void;
  isWorkoutActive: boolean;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [activeWorkout, setActiveWorkout] = useState<WorkoutState | null>(null);
  const [isLoadingActiveWorkout, setIsLoadingActiveWorkout] = useState(true);

  // Cargar active workout desde storage unificado (DB o local)
  useEffect(() => {
    let mounted = true;
    console.log('[WorkoutContext] Iniciando carga de active workout...');
    (async () => {
      try {
        const stored = await storageService.getActiveWorkout();
        console.log('[WorkoutContext] Active workout cargado desde storage:', stored);
        if (!mounted) return;
        if (stored) {
          // Ensure Date objects where expected (safe guard + type narrowing)
          try {
            if ('startedAt' in stored && (stored as any).startedAt) {
              const val = (stored as any).startedAt;
              if (typeof val === 'string' || typeof val === 'number' || val instanceof Date) {
                (stored as any).startedAt = new Date(val as string | number | Date);
              }
            }
          } catch (e) { /* ignore */ }

          // Convert the loosely-typed ActiveWorkout into a proper WorkoutState
          const s = stored as any;
          const parsed: WorkoutState = {
            routineId: String(s.routineId ?? ''),
            routineName: String(s.routineName ?? ''),
            currentExerciseIndex: Number(s.currentExerciseIndex ?? 0),
            currentSet: Number(s.currentSet ?? 1),
            completedSets: (s.completedSets && typeof s.completedSets === 'object') ? s.completedSets as { [key: string]: number } : {},
            actualReps: (s.actualReps && typeof s.actualReps === 'object') ? s.actualReps as { [key: string]: number[] } : {},
            actualWeights: (s.actualWeights && typeof s.actualWeights === 'object') ? s.actualWeights as { [key: string]: number[] } : {},
            startedAt: s.startedAt instanceof Date ? s.startedAt : new Date(s.startedAt ?? Date.now()),
            isResting: typeof s.isResting === 'boolean' ? s.isResting : false,
            restTimerDuration: typeof s.restTimerDuration === 'number' ? s.restTimerDuration : undefined,
            restTimerTitle: typeof s.restTimerTitle === 'string' ? s.restTimerTitle : undefined,
            restTimerNextExercise: typeof s.restTimerNextExercise === 'string' ? s.restTimerNextExercise : undefined,
            restTimerStartedAt: typeof s.restTimerStartedAt === 'number' ? s.restTimerStartedAt : undefined,
          };

          console.log('[WorkoutContext] Active workout parseado:', parsed);
          setActiveWorkout(parsed);
        } else {
          console.log('[WorkoutContext] No hay active workout en storage');
        }
      } catch (e) {
        console.error('[WorkoutContext] Error cargando active workout:', e);
      } finally {
        if (mounted) {
          console.log('[WorkoutContext] Finalizando carga, isLoadingActiveWorkout = false');
          setIsLoadingActiveWorkout(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Persistir cambios del activeWorkout en storage unificado
  // SOLO cuando hay un workout activo (no limpiar automáticamente)
  useEffect(() => {
    console.log('[WorkoutContext] useEffect persistencia - isLoading:', isLoadingActiveWorkout, 'activeWorkout:', activeWorkout ? 'presente' : 'null');
    if (isLoadingActiveWorkout) {
      console.log('[WorkoutContext] Saltando persistencia - aún cargando');
      return;
    }
    if (!activeWorkout) {
      console.log('[WorkoutContext] Saltando persistencia - no hay workout activo');
      return; // No hacer nada si no hay workout activo
    }
    
    console.log('[WorkoutContext] Guardando active workout en storage...');
    (async () => {
      try {
        await storageService.saveActiveWorkout(activeWorkout as unknown as ActiveWorkout);
        console.log('[WorkoutContext] Active workout guardado exitosamente');
      } catch (e) {
        console.error('[WorkoutContext] Error guardando active workout:', e);
      }
    })();
  }, [activeWorkout, isLoadingActiveWorkout]);

  const startWorkout = useCallback((routine: Routine) => {
    console.log('[WorkoutContext] Iniciando workout para rutina:', routine.name);
    const newWorkout: WorkoutState = {
      routineId: routine.id,
      routineName: routine.name,
      currentExerciseIndex: 0,
      currentSet: 1,
      completedSets: {},
      actualReps: {},
      actualWeights: {},
      startedAt: new Date()
    };
    console.log('[WorkoutContext] Nuevo workout creado:', newWorkout);
    setActiveWorkout(newWorkout);
    // Persist immediately to avoid losing state if the page reloads quickly
    (async () => {
      try {
        console.log('[WorkoutContext] Guardando workout inmediatamente...');
        await storageService.saveActiveWorkout(newWorkout as unknown as ActiveWorkout);
        console.log('[WorkoutContext] Workout guardado inmediatamente');
      } catch (e) {
        console.error('[WorkoutContext] Error guardando workout en start:', e);
      }
    })();
  }, []);
  const updateWorkoutProgress = useCallback((
    exerciseIndex: number,
    set: number,
    completedSets: { [key: string]: number },
    actualReps: { [key: string]: number[] },
    actualWeights: { [key: string]: number[] },
    restState?: {
      isResting?: boolean;
      restTimerDuration?: number;
      restTimerTitle?: string;
      restTimerNextExercise?: string;
      restTimerStartedAt?: number;
    }
  ) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const newState: WorkoutState = {
        ...prev,
        currentExerciseIndex: exerciseIndex,
        currentSet: set,
        completedSets,
        actualReps,
        actualWeights,
        // Persistir estado del timer de descanso
        isResting: restState?.isResting ?? false,
        restTimerDuration: restState?.restTimerDuration,
        restTimerTitle: restState?.restTimerTitle,
        restTimerNextExercise: restState?.restTimerNextExercise,
        restTimerStartedAt: restState?.restTimerStartedAt
      };

      // Guardar inmediatamente en storage unificado
      (async () => {
        try {
          await storageService.saveActiveWorkout(newState as unknown as ActiveWorkout);
        } catch (e) {
          console.warn('[Workout] Failed to persist active workout on update:', e);
        }
      })();

      return newState;
    });
  }, []);

  const clearRestState = useCallback(() => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const newState = {
        ...prev,
        isResting: false,
        restTimerDuration: undefined,
        restTimerTitle: undefined,
        restTimerNextExercise: undefined,
        restTimerStartedAt: undefined
      };
      (async () => {
        try {
          await storageService.saveActiveWorkout(newState as unknown as ActiveWorkout);
        } catch (e) {
          console.warn('[Workout] Failed to persist active workout on clearRestState:', e);
        }
      })();
      return newState;
    });
  }, []);

  const finishWorkout = useCallback(() => {
    console.log('[WorkoutContext] Finalizando workout');
    setActiveWorkout(null);
    (async () => {
      try {
        console.log('[WorkoutContext] Limpiando active workout del storage');
        await storageService.clearActiveWorkout();
        console.log('[WorkoutContext] Active workout limpiado');
      } catch (e) {
        console.error('[WorkoutContext] Error limpiando active workout:', e);
      }
    })();
  }, []);

  const cancelWorkout = useCallback(() => {
    console.log('[WorkoutContext] Cancelando workout');
    setActiveWorkout(null);
    (async () => {
      try {
        console.log('[WorkoutContext] Limpiando active workout del storage');
        await storageService.clearActiveWorkout();
        console.log('[WorkoutContext] Active workout limpiado');
      } catch (e) {
        console.error('[WorkoutContext] Error limpiando active workout:', e);
      }
    })();
  }, []);

  const value = useMemo(() => ({
    activeWorkout,
    startWorkout,
    updateWorkoutProgress,
    clearRestState,
    finishWorkout,
    cancelWorkout,
    isWorkoutActive: activeWorkout !== null
  }), [activeWorkout, startWorkout, updateWorkoutProgress, clearRestState, finishWorkout, cancelWorkout]);

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}
