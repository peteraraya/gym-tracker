/**
 * Repositorio de ActiveWorkout - Interfaz de dominio
 *
 * Gestiona el estado del entrenamiento activo (en curso).
 */

export interface ActiveWorkoutData {
  id: string;
  userId: string;
  routineId: string;
  routineName: string;
  currentExerciseIndex: number;
  currentSet: number;
  completedSets: Record<string, number>;
  actualReps: Record<string, number[]>;
  actualWeights: Record<string, number[]>;
  startedAt: Date;
  isResting?: boolean;
  restTimerRemaining?: number;
  restTimerStartedAt?: number;
  restTimerTitle?: string;
  restTimerNextExercise?: string;
  totalPausedTime?: number;
  skippedExercises?: string[];
  modifiedRoutineId?: string;
  updatedAt: Date;
}

export interface IActiveWorkoutRepository {
  /** Obtener el entrenamiento activo de un usuario */
  getByUserId(userId: string): Promise<ActiveWorkoutData | null>;

  /** Guardar o actualizar el entrenamiento activo */
  save(data: ActiveWorkoutData): Promise<void>;

  /** Eliminar el entrenamiento activo (al finalizar o cancelar) */
  delete(userId: string): Promise<void>;
}