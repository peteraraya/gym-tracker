/**
 * Validación centralizada con Zod
 * 
 * Exporta todos los esquemas y funciones de validación
 */

export {
  // Esquemas
  SetSchema,
  ExerciseSchema,
  RoutineSchema,
  WorkoutExerciseSchema,
  WorkoutSessionSchema,
  WorkoutStateSchema,
  ActiveWorkoutSchema,
  UserProfileSchema,
  WeeklyPlanSchema,
  RecommendationSchema,
  // Tipos
  type Set,
  type Exercise,
  type Routine,
  type WorkoutExercise,
  type WorkoutSession,
  type WorkoutState,
  type ActiveWorkout,
  type UserProfile,
  type WeeklyPlan,
  type Recommendation,
  // Funciones
  validateData,
  validateDataStrict,
  validateDataWithLogging,
} from './schemas';
