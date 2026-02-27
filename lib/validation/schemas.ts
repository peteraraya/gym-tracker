import { z } from 'zod';

/**
 * Esquemas de validación centralizados con Zod
 * 
 * Estos esquemas se usan para validar datos antes de guardarlos
 * en storage o usarlos en la aplicación.
 */

// ==================== SET ====================

export const SetSchema = z.object({
  reps: z.number().int().min(1).max(100),
  weight: z.number().min(0).optional(),
  type: z.enum(['normal', 'warmup', 'dropset', 'failure', 'amrap', 'rest-pause', 'cluster']).optional(),
  notes: z.string().optional(),
});

export type Set = z.infer<typeof SetSchema>;

// ==================== EXERCISE ====================

export const ExerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  sets: z.array(SetSchema),
  notes: z.string().optional(),
  equipment: z.string().optional(),
  technique: z.array(z.string()).optional(),
  recommendedSets: z.string().optional(),
  recommendedReps: z.string().optional(),
  restTime: z.string().optional(),
  restBetweenSets: z.number().optional(),
});

export type Exercise = z.infer<typeof ExerciseSchema>;

// ==================== ROUTINE ====================

export const RoutineSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  image: z.string().optional(),
  exercises: z.array(ExerciseSchema),
  restBetweenSets: z.number().optional(),
  restBetweenExercises: z.number().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Routine = z.infer<typeof RoutineSchema>;

// ==================== WORKOUT SESSION ====================

export const WorkoutExerciseSchema = z.object({
  exerciseId: z.string(),
  exerciseName: z.string().optional(),
  completedSets: z.number().int().min(0),
  actualReps: z.array(z.number().int().min(0)),
  actualWeight: z.array(z.number().min(0)),
  setDurations: z.array(z.number()).optional(),
  pauseDurations: z.array(z.number()).optional(),
  actualRestTimes: z.array(z.number()).optional(),
  notes: z.string().optional(),
});

export type WorkoutExercise = z.infer<typeof WorkoutExerciseSchema>;

export const WorkoutSessionSchema = z.object({
  id: z.string(),
  routineId: z.string(),
  routineName: z.string().optional(),
  date: z.coerce.date(),
  startedAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  exercises: z.array(WorkoutExerciseSchema),
  notes: z.string().optional(),
  totalDuration: z.number().optional(),
  totalPausedTime: z.number().optional(),
});

export type WorkoutSession = z.infer<typeof WorkoutSessionSchema>;

// ==================== WORKOUT STATE ====================

export const WorkoutStateSchema = z.object({
  routineId: z.string().min(1, 'routineId requerido'),
  routineName: z.string().min(1, 'routineName requerido'),
  currentExerciseIndex: z.number().int().min(0),
  currentSet: z.number().int().min(1),
  completedSets: z.record(z.number().int().min(0)),
  actualReps: z.record(z.array(z.number().int().min(0))),
  actualWeights: z.record(z.array(z.number().min(0))),
  startedAt: z.coerce.date(),
  isResting: z.boolean().optional(),
  restTimerDuration: z.number().optional(),
  restTimerTitle: z.string().optional(),
  restTimerNextExercise: z.string().optional(),
  restTimerStartedAt: z.number().optional(),
});

export type WorkoutState = z.infer<typeof WorkoutStateSchema>;

// ==================== ACTIVE WORKOUT ====================

export const ActiveWorkoutSchema = WorkoutStateSchema;

export type ActiveWorkout = z.infer<typeof ActiveWorkoutSchema>;

// ==================== USER PROFILE ====================

export const UserProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  age: z.number().int().min(1).max(150).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  height: z.number().min(50).max(300).optional(), // en cm
  weight: z.number().min(20).max(500).optional(), // en kg
  fitnessGoal: z.enum(['muscle_gain', 'strength', 'weight_loss', 'endurance', 'general_fitness']).optional(),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  weeklyWorkouts: z.number().int().min(1).max(7).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// ==================== WEEKLY PLAN ====================

export const WeeklyPlanSchema = z.object({
  monday: z.object({
    routines: z.array(z.string()),
    notes: z.string().optional(),
  }).optional(),
  tuesday: z.object({
    routines: z.array(z.string()),
    notes: z.string().optional(),
  }).optional(),
  wednesday: z.object({
    routines: z.array(z.string()),
    notes: z.string().optional(),
  }).optional(),
  thursday: z.object({
    routines: z.array(z.string()),
    notes: z.string().optional(),
  }).optional(),
  friday: z.object({
    routines: z.array(z.string()),
    notes: z.string().optional(),
  }).optional(),
  saturday: z.object({
    routines: z.array(z.string()),
    notes: z.string().optional(),
  }).optional(),
  sunday: z.object({
    routines: z.array(z.string()),
    notes: z.string().optional(),
  }).optional(),
});

export type WeeklyPlan = z.infer<typeof WeeklyPlanSchema>;

// ==================== RECOMMENDATION ====================

export const RecommendationSchema = z.object({
  exerciseId: z.string(),
  recommend: z.boolean(),
  suggestedWeight: z.number().optional(),
  reason: z.string().optional(),
  createdAt: z.string(),
  lastWeights: z.array(z.number()).optional(),
});

export type Recommendation = z.infer<typeof RecommendationSchema>;

// ==================== HELPER FUNCTIONS ====================

/**
 * Valida datos de forma segura
 * Retorna { success: true, data } o { success: false, error }
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; error?: string } {
  try {
    const result = schema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error.message };
  } catch (e) {
    return { success: false, error: `Validation error: ${e instanceof Error ? e.message : 'Unknown error'}` };
  }
}

/**
 * Valida datos y lanza error si falla
 */
export function validateDataStrict<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Valida datos de forma segura con logging
 */
export function validateDataWithLogging<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string
): { success: boolean; data?: T; error?: string } {
  const result = validateData(schema, data);
  if (!result.success) {
    console.warn(`[Validation] ${context}: ${result.error}`);
  }
  return result;
}
