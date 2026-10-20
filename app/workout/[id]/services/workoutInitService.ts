import * as storageService from "@/lib/infrastructure/storage/storage";
import type { ActiveWorkout } from "@/lib/infrastructure/storage/storage";
import type { Routine, Exercise } from "@/types";
import { WorkoutData } from "../hooks/useWorkoutState";
import logger from "@/lib/shared/logger";

interface RestorableWorkout extends Partial<WorkoutData> {
  routineId: string;
  startedAt?: string | Date;
  currentExerciseIndex?: number;
  currentSet?: number;
  isResting?: boolean;
  restTimerDuration?: number;
  restTimerRemaining?: number;
  restTimerStartedAt?: number;
  restTimerTitle?: string;
  restTimerNextExercise?: string;
  modifiedRoutine?: Routine;
}

export interface InitWorkoutParams {
  id: string;
  activeWorkout: RestorableWorkout | null;
  getRoutineById: (id: string) => Routine | undefined;
  startWorkout: (routine: Routine) => void;
  workoutState: {
    setCurrentExerciseIndex: (index: number) => void;
    setCurrentSet: (set: number) => void;
    restoreData: (data: Partial<WorkoutData>) => void;
    setCurrentReps: (reps: number | '') => void;
    setCurrentWeight: (weight: number | '') => void;
  };
  timerHandlers: {
    startTimer: (duration: number, title: string, nextExerciseName?: string) => void;
  };
  setWorkoutStartTime: (time: number) => void;
  setShowStartSplash: (show: boolean) => void;
  setRoutine: (routine: Routine) => void;
  setOriginalRoutine: (routine: Routine | null) => void;
  setIsInitialized: (val: boolean) => void;
  routerPush: (path: string) => void;
  shouldContinue: () => boolean;
}

function isRestorableWorkout(
  workout: ActiveWorkout | null,
): workout is ActiveWorkout & RestorableWorkout {
  return Boolean(
    workout &&
      typeof workout.routineId === "string" &&
      workout.routineId.length > 0,
  );
}

export const initializeWorkout = async ({
  id,
  activeWorkout,
  getRoutineById,
  startWorkout,
  workoutState,
  timerHandlers,
  setWorkoutStartTime,
  setShowStartSplash,
  setRoutine,
  setOriginalRoutine,
  setIsInitialized,
  routerPush,
  shouldContinue,
}: InitWorkoutParams): Promise<void> => {
  if (!shouldContinue()) return;

  let foundRoutine: Routine | undefined | null = null;

  if (activeWorkout?.routineId === id && activeWorkout.modifiedRoutine) {
    foundRoutine = activeWorkout.modifiedRoutine as Routine;
  }

  if (!foundRoutine) {
    foundRoutine = getRoutineById(id);
  }

  if (!foundRoutine) {
    if (shouldContinue()) routerPush("/routines");
    return;
  }

  const routineWithDefaults = {
    ...foundRoutine,
    exercises: foundRoutine.exercises.map((ex: Exercise) => ({
      ...ex,
      useSmartRest: ex.useSmartRest ?? true,
    })),
  };

  const storedWorkoutValue = await storageService.getActiveWorkout();
  if (!shouldContinue()) return;

  const storedWorkout = isRestorableWorkout(storedWorkoutValue)
    ? storedWorkoutValue
    : null;
  const existingWorkout =
    storedWorkout?.routineId === id
      ? storedWorkout
      : activeWorkout?.routineId === id
        ? activeWorkout
        : null;
  setRoutine(routineWithDefaults);

  try {
    const canonical = getRoutineById(id);
    setOriginalRoutine(canonical ? JSON.parse(JSON.stringify(canonical)) : null);
  } catch {
    setOriginalRoutine(null);
  }

  if (existingWorkout) {
    const s = existingWorkout;

    if (s.startedAt) {
      const startTime = new Date(s.startedAt).getTime();
      setWorkoutStartTime(startTime);
    }

    const exerciseIndex = Number(s.currentExerciseIndex ?? 0);
    const currentSet = Number(s.currentSet ?? 1);

    workoutState.setCurrentExerciseIndex(exerciseIndex);
    workoutState.setCurrentSet(currentSet);

    const restoredData: Partial<WorkoutData> = {
      completedSets: s.completedSets || {},
      actualReps: s.actualReps || {},
      actualWeights: s.actualWeights || {},
      setTypes: s.setTypes || {},
      restOverrides: s.restOverrides || {},
      perSetRestOverrides: s.perSetRestOverrides || {},
      actualSetDurations: s.actualSetDurations || {},
      actualPauseDurations: s.actualPauseDurations || {},
      actualRestTimes: s.actualRestTimes || {},
      lastWeights: s.lastWeights || {},
      skippedExercises: Array.isArray(s.skippedExercises) ? s.skippedExercises : [],
    };

    workoutState.restoreData(restoredData);

    if (s.isResting && s.restTimerDuration && s.restTimerStartedAt) {
      const elapsed = Math.floor((Date.now() - Number(s.restTimerStartedAt)) / 1000);
      const remaining = Number(s.restTimerDuration) - elapsed;
      if (remaining > 0) {
        timerHandlers.startTimer(
          remaining,
          String(s.restTimerTitle || "Descanso"),
          s.restTimerNextExercise ? String(s.restTimerNextExercise) : undefined
        );
      }
    }

    const currentExercise = routineWithDefaults.exercises[exerciseIndex];
    if (currentExercise) {
      const currentSetData = currentExercise.sets[currentSet - 1];
      if (currentSetData) {
        workoutState.setCurrentReps(currentSetData.reps);
        workoutState.setCurrentWeight(currentSetData.weight || 0);
      }
    }
  } else {
    startWorkout(routineWithDefaults);

    const firstExercise = routineWithDefaults.exercises[0];
    if (firstExercise) {
      const firstSet = firstExercise.sets[0];
      if (firstSet) {
        workoutState.setCurrentReps(firstSet.reps);
        workoutState.setCurrentWeight(firstSet.weight || 0);
      }
    }
  }

  setIsInitialized(true);

  try {
    const ts = sessionStorage.getItem('workout_splash_ts');
    const age = ts ? Date.now() - Number(ts) : Number.NaN;
    if (Number.isFinite(age) && age >= 0 && age < 8000) {
      setShowStartSplash(true);
    }
    sessionStorage.removeItem('workout_splash_ts');
  } catch (err) {
    logger.warn("[workoutInitService] Could not read start splash marker:", err);
  }
};
