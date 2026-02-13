/**
 * Tipos compartidos para ejercicios
 * 
 * Centraliza las definiciones de tipos para evitar duplicación
 */

export type MuscleGroup =
  | 'pecho'
  | 'espalda'
  | 'piernas'
  | 'hombros'
  | 'biceps'
  | 'triceps'
  | 'antebrazos'
  | 'trapecio'
  | 'cuello'
  | 'core'
  | 'gluteos'
  | 'gemelos'
  | 'cardio';

export interface ExerciseTemplate {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment?: string;
  description?: string;
  defaultSets?: number;
  defaultReps?: number;
  image?: string;
  technique?: string[];
  recommendedSets?: string;
  recommendedReps?: string;
  restTime?: string;
}

export const URL_STORAGE = 'https://hplrrjqgzefkdevbporx.supabase.co/storage/v1/object/public/routine-images/';

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'pecho',
  'espalda',
  'piernas',
  'gluteos',
  'hombros',
  'biceps',
  'triceps',
  'antebrazos',
  'trapecio',
  'cuello',
  'core',
  'gemelos',
  'cardio'
];
