/**
 * Sistema de gestión de ejercicios personalizados
 * Permite a los usuarios crear y guardar sus propios ejercicios
 */

import type { ExerciseTemplate, MuscleGroup, DifficultyLevel, ExerciseCategory } from '@/data/exercises/types';

const CUSTOM_EXERCISES_KEY = 'gym_tracker_custom_exercises';

/**
 * Obtiene todos los ejercicios personalizados del localStorage
 */
export function getCustomExercises(): ExerciseTemplate[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(CUSTOM_EXERCISES_KEY);
    if (!stored) return [];
    
    const exercises = JSON.parse(stored);
    // console.log('💾 [CustomExercises] Ejercicios personalizados cargados:', exercises.length);
    return exercises;
  } catch (error) {
    console.error('❌ [CustomExercises] Error al cargar ejercicios personalizados:', error);
    return [];
  }
}

/**
 * Guarda un nuevo ejercicio personalizado
 */
export function saveCustomExercise(exercise: Omit<ExerciseTemplate, 'id'>): ExerciseTemplate {
  try {
    const exercises = getCustomExercises();
    
    // Generar ID único basado en el nombre y timestamp
    const id = `custom-${exercise.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    const newExercise: ExerciseTemplate = {
      ...exercise,
      id,
    };
    
    exercises.push(newExercise);
    localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(exercises));
    
    // console.log('✅ [CustomExercises] Ejercicio personalizado guardado:', newExercise.name);
    return newExercise;
  } catch (error) {
    console.error('❌ [CustomExercises] Error al guardar ejercicio personalizado:', error);
    throw error;
  }
}

/**
 * Actualiza un ejercicio personalizado existente
 */
export function updateCustomExercise(id: string, updates: Partial<ExerciseTemplate>): boolean {
  try {
    const exercises = getCustomExercises();
    const index = exercises.findIndex(ex => ex.id === id);
    
    if (index === -1) {
      console.warn('⚠️ [CustomExercises] Ejercicio no encontrado:', id);
      return false;
    }
    
    exercises[index] = { ...exercises[index], ...updates };
    localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(exercises));
    
    // console.log('✅ [CustomExercises] Ejercicio actualizado:', exercises[index].name);
    return true;
  } catch (error) {
    console.error('❌ [CustomExercises] Error al actualizar ejercicio:', error);
    return false;
  }
}

/**
 * Elimina un ejercicio personalizado
 */
export function deleteCustomExercise(id: string): boolean {
  try {
    const exercises = getCustomExercises();
    const filtered = exercises.filter(ex => ex.id !== id);
    
    if (filtered.length === exercises.length) {
      console.warn('⚠️ [CustomExercises] Ejercicio no encontrado:', id);
      return false;
    }
    
    localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(filtered));
    // console.log('✅ [CustomExercises] Ejercicio eliminado:', id);
    return true;
  } catch (error) {
    console.error('❌ [CustomExercises] Error al eliminar ejercicio:', error);
    return false;
  }
}

/**
 * Obtiene ejercicios personalizados por grupo muscular
 */
export function getCustomExercisesByMuscleGroup(muscleGroup: MuscleGroup): ExerciseTemplate[] {
  const exercises = getCustomExercises();
  return exercises.filter(ex => ex.muscleGroup === muscleGroup);
}

/**
 * Verifica si un ejercicio es personalizado
 */
export function isCustomExercise(exerciseId: string): boolean {
  return exerciseId.startsWith('custom-');
}

/**
 * Exporta todos los ejercicios personalizados como JSON
 */
export function exportCustomExercises(): string {
  const exercises = getCustomExercises();
  return JSON.stringify(exercises, null, 2);
}

/**
 * Importa ejercicios personalizados desde JSON
 */
export function importCustomExercises(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const imported = JSON.parse(jsonString);
    
    if (!Array.isArray(imported)) {
      return { success: false, count: 0, error: 'El formato no es válido (debe ser un array)' };
    }
    
    const currentExercises = getCustomExercises();
    const merged = [...currentExercises, ...imported];
    
    localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(merged));
    
    // console.log('✅ [CustomExercises] Ejercicios importados:', imported.length);
    return { success: true, count: imported.length };
  } catch (error) {
    console.error('❌ [CustomExercises] Error al importar ejercicios:', error);
    return { success: false, count: 0, error: 'Error al parsear JSON' };
  }
}

/**
 * Limpia todos los ejercicios personalizados
 */
export function clearCustomExercises(): void {
  localStorage.removeItem(CUSTOM_EXERCISES_KEY);
  // console.log('🗑️ [CustomExercises] Todos los ejercicios personalizados eliminados');
}

/**
 * Valida que un ejercicio tenga los campos mínimos requeridos
 */
export function validateExercise(exercise: Partial<ExerciseTemplate>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!exercise.name || exercise.name.trim().length === 0) {
    errors.push('El nombre es obligatorio');
  }
  
  if (!exercise.muscleGroup) {
    errors.push('El grupo muscular es obligatorio');
  }
  
  if (exercise.defaultSets && (exercise.defaultSets < 1 || exercise.defaultSets > 10)) {
    errors.push('Las series deben estar entre 1 y 10');
  }
  
  if (exercise.defaultReps && (exercise.defaultReps < 1 || exercise.defaultReps > 100)) {
    errors.push('Las repeticiones deben estar entre 1 y 100');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
