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
    (async () => {
      try {
        const stored = await storageService.getActiveWorkout();
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

          setActiveWorkout(parsed);
        }
      } catch (e) {
        console.warn('Failed to load active workout from storage', e);
      } finally {
        if (mounted) setIsLoadingActiveWorkout(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Persistir cambios del activeWorkout en storage unificado
  useEffect(() => {
    if (isLoadingActiveWorkout) return;
        (async () => {
      try {
        if (activeWorkout) {
          await storageService.saveActiveWorkout(activeWorkout as unknown as ActiveWorkout);
        } else {
          await storageService.clearActiveWorkout();
        }
      } catch (e) {
        console.warn('Failed to persist active workout', e);
      }
    })();
  }, [activeWorkout, isLoadingActiveWorkout]);

  const startWorkout = useCallback((routine: Routine) => {
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
    setActiveWorkout(newWorkout);
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
      return {
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
    });
  }, []);

  const clearRestState = useCallback(() => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        isResting: false,
        restTimerDuration: undefined,
        restTimerTitle: undefined,
        restTimerNextExercise: undefined,
        restTimerStartedAt: undefined
      };
    });
  }, []);

  const finishWorkout = useCallback(() => {
    setActiveWorkout(null);
  }, []);

  const cancelWorkout = useCallback(() => {
    setActiveWorkout(null);
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
