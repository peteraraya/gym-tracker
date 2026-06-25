import * as storageService from "@/lib/storage/storage";
import type { Routine, Exercise } from "@/types";
import { WorkoutData } from "../hooks/useWorkoutState";

interface InitWorkoutParams {
  id: string;
  activeWorkout: any;
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
  setInitState: (updater: any) => void;
  routerPush: (path: string) => void;
  initState: { hasLoadedModified: boolean; lastRoutineId: string | null };
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
  setInitState,
  routerPush,
  initState,
}: InitWorkoutParams): Promise<void> => {
  let foundRoutine: Routine | undefined | null = null;

  if (activeWorkout?.modifiedRoutine && !initState.hasLoadedModified) {
    foundRoutine = activeWorkout.modifiedRoutine as Routine;
    setInitState((prev: any) => ({ ...prev, hasLoadedModified: true }));
  }

  if (!foundRoutine) {
    foundRoutine = getRoutineById(id);
  }

  try {
    const canonical = getRoutineById(id);
    setOriginalRoutine(canonical ? JSON.parse(JSON.stringify(canonical)) : null);
  } catch (e) {
    setOriginalRoutine(null);
  }

  if (!foundRoutine) {
    routerPush("/routines");
    return;
  }

  const routineWithDefaults = {
    ...foundRoutine,
    exercises: foundRoutine.exercises.map((ex: Exercise) => ({
      ...ex,
      useSmartRest: ex.useSmartRest ?? true,
    })),
  };

  setRoutine(routineWithDefaults);

  const storedWorkout = await storageService.getActiveWorkout();

  if (storedWorkout && storedWorkout.routineId === id) {
    const s = storedWorkout as any;

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
    if (ts && Date.now() - parseInt(ts) < 8000) {
      setShowStartSplash(true);
      sessionStorage.removeItem('workout_splash_ts');
    }
  } catch {}
};
