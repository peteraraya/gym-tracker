/**
 * Repositorio de UserProfile - Interfaz de dominio
 */

import type { UserProfile } from '@/types';

export interface CreateProfileInput {
  userId: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  fitnessGoal?: 'muscle_gain' | 'strength' | 'weight_loss' | 'endurance' | 'general_fitness';
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  weeklyWorkouts?: number;
}

export interface UpdateProfileInput {
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  fitnessGoal?: 'muscle_gain' | 'strength' | 'weight_loss' | 'endurance' | 'general_fitness';
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  weeklyWorkouts?: number;
}

export interface IProfileRepository {
  /** Obtener perfil por ID de usuario */
  getByUserId(userId: string): Promise<UserProfile | null>;

  /** Crear perfil de usuario */
  create(input: CreateProfileInput): Promise<UserProfile>;

  /** Actualizar perfil existente */
  update(userId: string, input: UpdateProfileInput): Promise<UserProfile>;

  /** Eliminar perfil */
  delete(userId: string): Promise<void>;
}