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

// Imports explícitos para que Next.js incluya cada grupo en el bundle.
const GROUP_LOADERS: Record<MuscleGroup, () => Promise<ExerciseTemplate[]>> = {
  pecho: () => import('./by-muscle/exercises-pecho').then((mod) => mod.EXERCISES_Pecho),
  espalda: () => import('./by-muscle/exercises-espalda').then((mod) => mod.EXERCISES_Espalda),
  piernas: () => import('./by-muscle/exercises-piernas').then((mod) => mod.EXERCISES_Piernas),
  gluteos: () => import('./by-muscle/exercises-gluteos').then((mod) => mod.EXERCISES_Gluteos),
  hombros: () => import('./by-muscle/exercises-hombros').then((mod) => mod.EXERCISES_Hombros),
  biceps: () => import('./by-muscle/exercises-biceps').then((mod) => mod.EXERCISES_Biceps),
  triceps: () => import('./by-muscle/exercises-triceps').then((mod) => mod.EXERCISES_Triceps),
  antebrazos: () => import('./by-muscle/exercises-antebrazos').then((mod) => mod.EXERCISES_Antebrazos),
  trapecio: () => import('./by-muscle/exercises-trapecio').then((mod) => mod.EXERCISES_Trapecio),
  cuello: () => import('./by-muscle/exercises-cuello').then((mod) => mod.EXERCISES_Cuello),
  core: () => import('./by-muscle/exercises-core').then((mod) => mod.EXERCISES_Core),
  gemelos: () => import('./by-muscle/exercises-gemelos').then((mod) => mod.EXERCISES_Gemelos),
  cardio: () => import('./by-muscle/exercises-cardio').then((mod) => mod.EXERCISES_Cardio),
};

/**
 * Importa dinámicamente solo los ejercicios del grupo muscular indicado.
 * Devuelve el array de ExerciseTemplate de ese grupo.
 */
export async function getExercisesByMuscleGroupLazy(
  muscleGroup: MuscleGroup,
): Promise<ExerciseTemplate[]> {
  const loadExercises = GROUP_LOADERS[muscleGroup];
  if (!loadExercises) {
    console.warn(`[lazy] No hay archivo para el grupo muscular: ${muscleGroup}`);
    return [];
  }

  return loadExercises();
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

  for (const muscleGroup of Object.keys(GROUP_LOADERS) as MuscleGroup[]) {
    result[muscleGroup] = await getExercisesByMuscleGroupLazy(muscleGroup);
  }

  return result as Record<MuscleGroup, ExerciseTemplate[]>;
}
