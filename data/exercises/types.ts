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

export type DifficultyLevel = 'principiante' | 'intermedio' | 'avanzado';

export type ExerciseCategory = 'compuesto' | 'aislamiento' | 'cardio' | 'movilidad';

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
  
  // Nuevos campos educativos
  difficulty?: DifficultyLevel;
  category?: ExerciseCategory;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  instructions?: string[];
  commonMistakes?: string[];
  tips?: string[];
  benefits?: string[];
  variations?: {
    easier?: string[];
    harder?: string[];
    alternative?: string[];
  };
  safetyNotes?: string[];
  videoUrl?: string;
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
