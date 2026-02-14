/**
 * Índice de ejercicios con carga dinámica
 * 
 * Implementa code splitting para reducir el bundle inicial.
 * Los ejercicios se cargan bajo demanda por grupo muscular.
 */

import type { ExerciseTemplate, MuscleGroup } from './types';

// Cache para evitar cargas múltiples del mismo grupo
const exerciseCache = new Map<MuscleGroup, ExerciseTemplate[]>();

/**
 * Obtiene ejercicios de un grupo muscular específico
 * Carga bajo demanda y cachea el resultado
 */
export async function getExercisesByMuscleGroup(group: MuscleGroup): Promise<ExerciseTemplate[]> {
  // Retornar del cache si ya está cargado
  if (exerciseCache.has(group)) {
    return exerciseCache.get(group)!;
  }

  try {
    // Cargar dinámicamente el módulo del grupo muscular
    const module = await import(`./groups/${group}`);
    const exercises = module.exercises;
    
    // Guardar en cache
    exerciseCache.set(group, exercises);
    
    return exercises;
  } catch (error) {
    console.error(`Error loading exercises for group: ${group}`, error);
    return [];
  }
}

/**
 * Obtiene todos los ejercicios de todos los grupos
 * Útil para búsquedas globales o cuando se necesita la base de datos completa
 */
export async function getAllExercises(): Promise<ExerciseTemplate[]> {
  const groups: MuscleGroup[] = [
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

  // Cargar todos los grupos en paralelo
  const allExercises = await Promise.all(
    groups.map(group => getExercisesByMuscleGroup(group))
  );

  // Aplanar el array de arrays
  return allExercises.flat();
}

/**
 * Busca un ejercicio por ID en todos los grupos
 */
export async function getExerciseById(id: string): Promise<ExerciseTemplate | undefined> {
  const allExercises = await getAllExercises();
  return allExercises.find(ex => ex.id === id);
}

/**
 * Busca un ejercicio por nombre (búsqueda parcial)
 */
export async function getExerciseByName(name: string): Promise<ExerciseTemplate | undefined> {
  const allExercises = await getAllExercises();
  return allExercises.find(ex => ex.name.toLowerCase() === name.toLowerCase());
}

/**
 * Busca ejercicios por nombre (búsqueda parcial)
 */
export async function searchExercises(query: string): Promise<ExerciseTemplate[]> {
  const allExercises = await getAllExercises();
  const lowerQuery = query.toLowerCase();
  
  return allExercises.filter(ex => 
    ex.name.toLowerCase().includes(lowerQuery) ||
    ex.description?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Limpia el cache de ejercicios
 * Útil para testing o cuando se necesita recargar los datos
 */
export function clearExerciseCache(): void {
  exerciseCache.clear();
}

// COMPATIBILIDAD: Export síncrono para componentes que aún usan EXERCISE_DATABASE
// Importa todos los ejercicios de forma síncrona (no code-split)
import { exercises as pechoExercises } from './groups/pecho';
import { exercises as espaldaExercises } from './groups/espalda';
import { exercises as piernasExercises } from './groups/piernas';
import { exercises as gluteosExercises } from './groups/gluteos';
import { exercises as hombrosExercises } from './groups/hombros';
import { exercises as bicepsExercises } from './groups/biceps';
import { exercises as tricepsExercises } from './groups/triceps';
import { exercises as antebrazosExercises } from './groups/antebrazos';
import { exercises as trapecioExercises } from './groups/trapecio';
import { exercises as cuelExercises } from './groups/cuello';
import { exercises as coreExercises } from './groups/core';
import { exercises as gemelosExercises } from './groups/gemelos';
import { exercises as cardioExercises } from './groups/cardio';

/**
 * Base de datos completa de ejercicios (export síncrono para compatibilidad)
 * @deprecated Usa getAllExercises() o getExercisesByMuscleGroup() para mejor performance
 */
export const EXERCISE_DATABASE: ExerciseTemplate[] = [
  ...pechoExercises,
  ...espaldaExercises,
  ...piernasExercises,
  ...gluteosExercises,
  ...hombrosExercises,
  ...bicepsExercises,
  ...tricepsExercises,
  ...antebrazosExercises,
  ...trapecioExercises,
  ...cuelExercises,
  ...coreExercises,
  ...gemelosExercises,
  ...cardioExercises
];

/**
 * Array de todos los ejercicios (alias de EXERCISE_DATABASE)
 * @deprecated Usa getAllExercises() para carga asíncrona
 */
export const exercises = EXERCISE_DATABASE;

// Re-export types
export type { ExerciseTemplate, MuscleGroup, DifficultyLevel, ExerciseCategory } from './types';
export { URL_STORAGE, MUSCLE_GROUPS } from './types';
