/**
 * Repositorio de WorkoutSession - Interfaz de dominio
 *
 * Define el contrato para acceso a datos de sesiones de entrenamiento.
 */

import type { WorkoutSession } from '@/types';

export interface CreateSessionInput {
  routineId: string;
  exercises: {
    exerciseId: string;
    exerciseName?: string;
    completedSets: number;
    actualReps: number[];
    actualWeight: number[];
    setDurations?: number[];
    pauseDurations?: number[];
    actualRestTimes?: number[];
    notes?: string;
  }[];
  notes?: string;
  totalDuration?: number;
  totalPausedTime?: number;
}

export interface UpdateSessionInput {
  notes?: string;
  totalDuration?: number;
  totalPausedTime?: number;
  exercises?: CreateSessionInput['exercises'];
}

export interface SessionFilters {
  userId?: string;
  routineId?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

export interface SessionListResult {
  sessions: WorkoutSession[];
  total: number;
}

export interface ISessionRepository {
  /** Obtener sesiones de un usuario con filtros opcionales */
  getByUserId(userId: string, filters?: SessionFilters): Promise<SessionListResult>;

  /** Obtener una sesión por ID (incluye ejercicios) */
  getById(id: string): Promise<WorkoutSession | null>;

  /** Crear una nueva sesión */
  create(input: CreateSessionInput): Promise<WorkoutSession>;

  /** Actualizar una sesión existente */
  update(id: string, input: UpdateSessionInput): Promise<WorkoutSession>;

  /** Eliminar una sesión por ID */
  delete(id: string): Promise<void>;
}