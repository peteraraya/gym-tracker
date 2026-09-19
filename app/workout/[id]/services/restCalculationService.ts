import { calculateRestBetweenSets, calculateRestBetweenExercises } from '@/lib/workout/restCalculator';
import { EXERCISE_DATABASE } from '@/data/exercises';

interface RestCalculationParams {
  currentExercise: any;
  nextExercise?: any;
  routine: any;
  restOverrides?: Record<string, number>;
  perSetOverrides?: Record<string, number[]>;
  currentSet?: number;
  useSmartRest: boolean;
}

/**
 * Calculate rest time for next set in the same exercise.
 * Priority: perSetOverride > exerciseOverride > exerciseConfig > routineConfig > smart > default
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
  const setIndex = (typeof currentSet === 'number' && currentSet > 0) ? currentSet - 1 : 0;

  // 1. Per-set override (manual edit during workout)
  if (perSetOverrides?.[exerciseId]?.[setIndex]) {
    return perSetOverrides[exerciseId][setIndex];
  }

  // 2. Exercise-level override (manual edit during workout)
  if (typeof restOverrides?.[exerciseId] === 'number') {
    return restOverrides[exerciseId];
  }

  // 3. Exercise's own config
  if (currentExercise.restBetweenSets) {
    return currentExercise.restBetweenSets;
  }

  // 4. Routine's global config
  if (routine.restBetweenSets) {
    return routine.restBetweenSets;
  }

  // 5. Smart rest (only if enabled and no manual config)
  if (useSmartRest && currentExercise.useSmartRest !== false) {
    const smartRest = calculateSmartRestTime(currentExercise);
    if (smartRest) return smartRest;
  }

  // 6. Default
  return 90;
}

/**
 * Calculate rest time between different exercises.
 * Priority: routineConfig > smart > default
 *
 * Note: `restOverrides` holds per-exercise "rest between sets" overrides
 * (set via onEditRestTime, keyed by exercise id). It is NOT a rest-between-
 * exercises override, so it must not be read here — doing so previously
 * reused the next exercise's "rest between its own sets" value as the
 * transition rest from the current exercise into it.
 */
export function calculateExerciseRestTime({
  currentExercise,
  nextExercise,
  routine,
  useSmartRest
}: RestCalculationParams): number {
  if (!nextExercise) return 120;

  // 1. Routine's global config
  if (routine.restBetweenExercises) {
    return routine.restBetweenExercises;
  }

  // 2. Smart rest
  if (useSmartRest) {
    const currentTemplate = EXERCISE_DATABASE.find(e => e.name.toLowerCase() === currentExercise.name.toLowerCase());
    const nextTemplate = EXERCISE_DATABASE.find(e => e.name.toLowerCase() === nextExercise.name.toLowerCase());

    if (currentTemplate && nextTemplate) {
      const restRecommendation = calculateRestBetweenExercises(
        currentTemplate,
        nextTemplate,
        'intermediate'
      );
      if (restRecommendation.recommended) return restRecommendation.recommended;
    }
  }

  // 3. Default
  return 120;
}

/**
 * Calculate smart rest time based on exercise characteristics
 */
export function calculateSmartRestTime(exercise: { name: string; sets: Array<{ reps: number; weight?: number }> }): number | undefined {
  const exerciseTemplate = EXERCISE_DATABASE.find(e => e.name.toLowerCase() === exercise.name.toLowerCase());

  if (!exerciseTemplate) return undefined;

  const avgReps = Math.round(
    exercise.sets.reduce((sum: number, set: { reps: number; weight?: number }) => sum + set.reps, 0) / exercise.sets.length
  );

  const restRecommendation = calculateRestBetweenSets(
    exerciseTemplate,
    exercise.sets.length,
    avgReps,
    'intermediate'
  );

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
