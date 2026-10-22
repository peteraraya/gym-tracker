import { z } from 'zod';

/**
 * Esquemas de validación para cuerpos de petición de API Routes.
 * Separados de los esquemas de dominio porque los payloads de API
 * no incluyen campos generados por el sistema (id, createdAt, updatedAt).
 */

// ==================== ROUTINE API ====================

export const ApiSetSchema = z.object({
  reps: z.number().int().min(1).max(500, 'Repeticiones fuera de rango'),
  weight: z.number().min(0).max(1000, 'Peso fuera de rango').optional(),
});

export const ApiRoutineExerciseSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100, 'Nombre demasiado largo'),
  sets: z.array(ApiSetSchema).min(1, 'Al menos una serie requerida'),
  equipment: z.string().optional(),
  notes: z.string().optional(),
});

export const ApiCreateRoutineBodySchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100, 'Nombre demasiado largo'),
  description: z.string().max(500).optional(),
  image: z.string().url('URL inválida').optional().nullable(),
  exercises: z.array(ApiRoutineExerciseSchema).min(1, 'Al menos un ejercicio requerido'),
  restBetweenSets: z.number().int().min(0).optional(),
  restBetweenExercises: z.number().int().min(0).optional(),
});

export type ApiCreateRoutineBody = z.infer<typeof ApiCreateRoutineBodySchema>;

// ==================== SESSION API ====================

export const ApiSessionExerciseSchema = z.object({
  exerciseId: z.string().min(1, 'ID de ejercicio requerido'),
  completedSets: z.number().int().min(0).max(100),
  actualReps: z.array(z.number().int().min(0)).max(500),
  actualWeight: z.array(z.number().min(0)).max(500),
  setDurations: z.array(z.number().nonnegative()).optional(),
  pauseDurations: z.array(z.number().nonnegative()).optional(),
});

export const ApiCreateSessionBodySchema = z.object({
  routineId: z.string().min(1, 'ID de rutina requerido'),
  exercises: z.array(ApiSessionExerciseSchema).min(1, 'Al menos un ejercicio requerido'),
  notes: z.string().max(1000).optional(),
  totalDuration: z.number().nonnegative().optional(),
  totalPausedTime: z.number().nonnegative().optional(),
});

export type ApiCreateSessionBody = z.infer<typeof ApiCreateSessionBodySchema>;

// ==================== PROFILE API ====================

export const ApiUpdateProfileBodySchema = z.object({
  age: z.number().int().min(10).max(120).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  height: z.number().min(50).max(300).optional(),
  weight: z.number().min(20).max(500).optional(),
  fitnessGoal: z.enum([
    'muscle_gain',
    'strength',
    'weight_loss',
    'endurance',
    'general_fitness',
  ]).optional(),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  weeklyWorkouts: z.number().int().min(1).max(14).optional(),
});

export type ApiUpdateProfileBody = z.infer<typeof ApiUpdateProfileBodySchema>;

// ==================== HELPER ====================

/**
 * Valida el cuerpo de una petición contra un esquema Zod.
 * Retorna { success: true, data } o { success: false, error } con mensajes amigables.
 */
export function validateApiBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown,
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const firstError = result.error.issues[0];
  const path = firstError.path.join('.') || 'campo';
  const message = firstError.message;

  return {
    success: false,
    error: `${path}: ${message}`,
  };
}