/**
 * Carga diferida (code-splitting) de ejercicios por grupo muscular.
 *
 * En lugar de importar todo `EXERCISE_DATABASE` (~30,000 líneas / ~500 KB+)
 * en cada request, estas funciones importan dinámicamente solo el grupo
 * muscular solicitado. Next.js genera chunks separados por grupo.
 *
 * Uso en Server Components:
 *   const { EXERCISES_Pecho } = await getExercisesByMuscleGroupLazy('pecho');
 *
 * Uso en Client Components (con next/dynamic o import() dentro de useEffect):
 *   const module = await import('@/data/exercises/lazy').then(m => m.getExercisesByMuscleGroupLazy('pecho'));
 */

import type { MuscleGroup } from './groups';
import type { ExerciseTemplate } from '../exercises';

// Mapeo de grupo muscular -> ruta relativa del archivo generado.
// El import dinámico usa esta ruta para que Next.js haga code splitting.
const GROUP_FILE_MAP: Record<MuscleGroup, string> = {
  pecho: './by-muscle/exercises-pecho',
  espalda: './by-muscle/exercises-espalda',
  piernas: './by-muscle/exercises-piernas',
  gluteos: './by-muscle/exercises-gluteos',
  hombros: './by-muscle/exercises-hombros',
  biceps: './by-muscle/exercises-biceps',
  triceps: './by-muscle/exercises-triceps',
  antebrazos: './by-muscle/exercises-antebrazos',
  trapecio: './by-muscle/exercises-trapecio',
  cuello: './by-muscle/exercises-cuello',
  core: './by-muscle/exercises-core',
  gemelos: './by-muscle/exercises-gemelos',
  cardio: './by-muscle/exercises-cardio',
};

/**
 * Importa dinámicamente solo los ejercicios del grupo muscular indicado.
 * Devuelve el array de ExerciseTemplate de ese grupo.
 */
export async function getExercisesByMuscleGroupLazy(
  muscleGroup: MuscleGroup,
): Promise<ExerciseTemplate[]> {
  const filePath = GROUP_FILE_MAP[muscleGroup];
  if (!filePath) {
    console.warn(`[lazy] No hay archivo para el grupo muscular: ${muscleGroup}`);
    return [];
  }

  const mod = await import(filePath);
  const constName = `EXERCISES_${muscleGroup.charAt(0).toUpperCase() + muscleGroup.slice(1)}` as const;
  const exercises = (mod as Record<string, ExerciseTemplate[]>)[constName];
  return Array.isArray(exercises) ? exercises : [];
}

/**
 * Importa dinámicamente todos los grupos musculares (para búsqueda global).
 * Devuelve un mapa de muscleGroup -> ExerciseTemplate[].
 * Úsalo solo cuando realmente se necesite la base de datos completa.
 */
export async function getAllExerciseGroupsLazy(): Promise<
  Record<MuscleGroup, ExerciseTemplate[]>
> {
  const result: Record<string, ExerciseTemplate[]> = {};

  for (const muscleGroup of Object.keys(GROUP_FILE_MAP) as MuscleGroup[]) {
    result[muscleGroup] = await getExercisesByMuscleGroupLazy(muscleGroup);
  }

  return result as Record<MuscleGroup, ExerciseTemplate[]>;
}
