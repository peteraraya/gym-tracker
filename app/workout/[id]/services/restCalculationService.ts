import { calculateRestBetweenSets } from '@/lib/restCalculator';
import { EXERCISE_DATABASE } from '@/data/exercises';

interface RestCalculationParams {
  currentExercise: any;
  nextExercise?: any;
  routine: any;
  restOverrides: Record<string, number>;
  perSetOverrides: Record<string, Record<number, number>>;
  currentSet?: number;
  useSmartRest: boolean;
}

/**
 * Calculate rest time for next set in the same exercise
 */
export function calculateNextRestTime({
  currentExercise,
  routine,
  restOverrides,
  perSetOverrides,
  currentSet,
  useSmartRest
}: RestCalculationParams): number {
  const exerciseId = currentExercise.id;
  
  // Check for per-set override first
  if (perSetOverrides[exerciseId]?.[currentSet!]) {
    return perSetOverrides[exerciseId][currentSet!];
  }
  
  // Check for exercise-level override
  if (restOverrides[exerciseId]) {
    return restOverrides[exerciseId];
  }
  
  // Use smart rest if enabled for this exercise
  const useSmartRestForExercise = currentExercise.useSmartRest !== false;
  if (useSmartRest && useSmartRestForExercise) {
    const smartRest = calculateSmartRestTime(currentExercise);
    if (smartRest) return smartRest;
  }
  
  // Fallback to exercise default or routine default
  return currentExercise.restBetweenSets || routine.restBetweenSets || 90;
}

/**
 * Calculate rest time between different exercises
 */
export function calculateExerciseRestTime({
  currentExercise,
  nextExercise,
  routine,
  restOverrides,
  useSmartRest
}: RestCalculationParams): number {
  if (!nextExercise) return 120; // Default between exercises
  
  const nextExerciseId = nextExercise.id;
  
  // Check for override on next exercise
  if (restOverrides[nextExerciseId]) {
    return restOverrides[nextExerciseId];
  }
  
  // Use smart rest if enabled
  const useSmartRestForExercise = nextExercise.useSmartRest !== false;
  if (useSmartRest && useSmartRestForExercise) {
    const smartRest = calculateSmartRestTime(nextExercise);
    if (smartRest) return smartRest;
  }
  
  // Fallback to next exercise default or routine default
  return nextExercise.restBetweenSets || routine.restBetweenExercises || 120;
}

/**
 * Calculate smart rest time based on exercise characteristics
 */
export function calculateSmartRestTime(exercise: any): number | undefined {
  const exerciseTemplate = EXERCISE_DATABASE.find(e => e.name === exercise.name);
  
  if (!exerciseTemplate) return undefined;
  
  // Calculate average reps from all sets
  const avgReps = Math.round(
    exercise.sets.reduce((sum: number, set: any) => sum + set.reps, 0) / exercise.sets.length
  );
  
  const restRecommendation = calculateRestBetweenSets(
    exerciseTemplate,
    exercise.sets.length,
    avgReps,
    'intermediate'
  );
  
  // Round to nearest 5-second interval
  return Math.round(restRecommendation.recommended / 5) * 5;
}

/**
 * Apply smart rest to all sets of an exercise
 */
export function applySmartRestToAllSets(
  exercise: any,
  updatePerSetRestOverride: (exerciseId: string, setIndex: number, restTime: number) => void
): number | null {
  const smartRestTime = calculateSmartRestTime(exercise);
  
  if (!smartRestTime) return null;
  
  const exerciseId = exercise.id;
  for (let i = 0; i < exercise.sets.length; i++) {
    updatePerSetRestOverride(exerciseId, i, smartRestTime);
  }
  
  return smartRestTime;
}
