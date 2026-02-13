/**
 * Archivo de compatibilidad para mantener la API existente
 * 
 * Este archivo re-exporta EXERCISE_DATABASE del archivo original
 * para mantener la compatibilidad con el código existente mientras
 * se implementa gradualmente el code splitting.
 */

// Re-export todo del archivo original
export type { MuscleGroup, ExerciseTemplate } from '../exercises';
export { EXERCISE_DATABASE } from '../exercises';

// También exportar las nuevas funciones para uso futuro
export { 
  getExercisesByMuscleGroup,
  getAllExercises,
  getExerciseById,
  searchExercises
} from './index';
