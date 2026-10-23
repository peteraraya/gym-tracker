/**
 * Repositorio de Routines - Interfaz de dominio
 *
 * Define el contrato para acceso a datos de rutinas.
 * La implementación concreta vive en infrastructure/repositories.
 * El dominio NO conoce detalles de Supabase, localStorage, etc.
 */

import type { Routine } from '@/types';

/**
 * Datos para crear una rutina (sin id generado por el sistema)
 */
export interface CreateRoutineInput {
  name: string;
  description?: string;
  image?: string;
  exercises: {
    name: string;
    sets: { reps: number; weight?: number }[];
    equipment?: string;
    notes?: string;
    restBetweenSets?: number;
    useSmartRest?: boolean;
    technique?: string[];
    recommendedSets?: string;
    recommendedReps?: string;
    restTime?: string;
  }[];
  restBetweenSets?: number;
  restBetweenExercises?: number;
}

/**
 * Datos para actualizar una rutina existente
 */
export interface UpdateRoutineInput {
  name?: string;
  description?: string;
  image?: string;
  exercises?: CreateRoutineInput['exercises'];
  restBetweenSets?: number;
  restBetweenExercises?: number;
}

/**
 * Filtros opcionales para listar rutinas
 */
export interface RoutineFilters {
  userId?: string;
  nameContains?: string;
  limit?: number;
  offset?: number;
}

/**
 * Resultado paginado de rutinas
 */
export interface RoutineListResult {
  routines: Routine[];
  total: number;
}

/**
 * Contrato del repositorio de rutinas.
 * Implementado por adaptadores de infraestructura (Supabase, localStorage, etc.)
 */
export interface IRoutineRepository {
  /** Obtener todas las rutinas de un usuario */
  getByUserId(userId: string, filters?: RoutineFilters): Promise<RoutineListResult>;

  /** Obtener una rutina por ID (incluye ejercicios) */
  getById(id: string): Promise<Routine | null>;

  /** Crear una nueva rutina y devolverla con su ID asignado */
  create(input: CreateRoutineInput): Promise<Routine>;

  /** Actualizar una rutina existente */
  update(id: string, input: UpdateRoutineInput): Promise<Routine>;

  /** Eliminar una rutina por ID */
  delete(id: string): Promise<void>;

  /** Verificar si existe una rutina con ese ID para el usuario */
  exists(id: string, userId: string): Promise<boolean>;
}