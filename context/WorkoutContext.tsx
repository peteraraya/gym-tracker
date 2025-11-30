'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
}

interface WorkoutContextType {
  activeWorkout: WorkoutState | null;
  startWorkout: (routine: Routine) => void;
  updateWorkoutProgress: (
    exerciseIndex: number,
    set: number,
    completedSets: { [key: string]: number },
    actualReps: { [key: string]: number[] },
    actualWeights: { [key: string]: number[] }
  ) => void;
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

  const startWorkout = (routine: Routine) => {
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
  };

  const updateWorkoutProgress = (
    exerciseIndex: number,
    set: number,
    completedSets: { [key: string]: number },
    actualReps: { [key: string]: number[] },
    actualWeights: { [key: string]: number[] }
  ) => {
    if (!activeWorkout) return;

    setActiveWorkout({
      ...activeWorkout,
      currentExerciseIndex: exerciseIndex,
      currentSet: set,
      completedSets,
      actualReps,
      actualWeights
    });
  };

  const finishWorkout = () => {
    setActiveWorkout(null);
  };

  const cancelWorkout = () => {
    setActiveWorkout(null);
  };

  return (
    <WorkoutContext.Provider
      value={{
        activeWorkout,
        startWorkout,
        updateWorkoutProgress,
        finishWorkout,
        cancelWorkout,
        isWorkoutActive: activeWorkout !== null
      }}
    >
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
