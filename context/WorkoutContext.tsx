'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
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

const STORAGE_KEY = 'gym-tracker-active-workout';

function loadActiveWorkout(): WorkoutState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    parsed.startedAt = new Date(parsed.startedAt);
    return parsed;
  } catch (error) {
    console.error('Error loading active workout:', error);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [activeWorkout, setActiveWorkout] = useState<WorkoutState | null>(loadActiveWorkout);

  // Guardar estado en localStorage cada vez que cambie
  useEffect(() => {
    if (activeWorkout) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeWorkout));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [activeWorkout]);

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
