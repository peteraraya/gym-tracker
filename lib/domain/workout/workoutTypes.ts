/**
 * Tipos compartidos para el dominio de workout.
 * Centraliza las interfaces usadas en múltiples módulos de workout.
 */

import type { Exercise, Set as ExerciseSet, SetType } from "@/types";

export interface WorkoutData {
  routineId: string;
  routineName: string;
  exercises: Record<
    string,
    {
      exerciseId: string;
      exerciseName: string;
      completedSets: number;
      actualReps: number[];
      actualWeight: number[];
      notes?: string;
      setDurations?: number[];
      pauseDurations?: number[];
      actualRestTimes?: number[];
    }
  >;
  totalDuration?: number;
  totalPausedTime?: number;
  notes?: string;
}

export interface SetExecutionData {
  exerciseId: string;
  setIndex: number;
  reps: number;
  weight: number;
  type: SetType;
  completedAt?: Date;
}

export interface RestTimerState {
  isRunning: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  exerciseId: string;
  setIndex: number;
}

export interface WorkoutSuggestion {
  id: string;
  name: string;
  muscleGroups: string[];
  estimatedDuration: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  exercises: Exercise[];
}

export interface WorkoutMetrics {
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  durationSeconds: number;
  exercisesCount: number;
  averageRestSeconds: number;
}
