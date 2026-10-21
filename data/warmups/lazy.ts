/**
 * Carga diferida (code-splitting) de ejercicios de calentamiento por grupo muscular.
 *
 * En lugar de importar todo `WARMUP_DATABASE` (~2,900 líneas) en cada request,
 * estas funciones importan dinámicamente solo el grupo muscular solicitado.
 * Next.js genera chunks separados por grupo.
 *
 * Uso en Server Components:
 *   const warmups = await getWarmupsByMuscleGroupLazy('pecho');
 */

import type { WarmupExercise, WarmupCategory } from '../warmupExercises';

const GROUP_LOADERS: Record<string, () => Promise<WarmupExercise[]>> = {
  pecho: () => import('./by-muscle/warmups-pecho').then((mod) => mod.WARMUPS_Pecho),
  espalda: () => import('./by-muscle/warmups-espalda').then((mod) => mod.WARMUPS_Espalda),
  piernas: () => import('./by-muscle/warmups-piernas').then((mod) => mod.WARMUPS_Piernas),
  gluteos: () => import('./by-muscle/warmups-gluteos').then((mod) => mod.WARMUPS_Gluteos),
  hombros: () => import('./by-muscle/warmups-hombros').then((mod) => mod.WARMUPS_Hombros),
  biceps: () => import('./by-muscle/warmups-biceps').then((mod) => mod.WARMUPS_Biceps),
  triceps: () => import('./by-muscle/warmups-triceps').then((mod) => mod.WARMUPS_Triceps),
  antebrazos: () => import('./by-muscle/warmups-antebrazos').then((mod) => mod.WARMUPS_Antebrazos),
  trapecio: () => import('./by-muscle/warmups-trapecio').then((mod) => mod.WARMUPS_Trapecio),
  cuello: () => import('./by-muscle/warmups-cuello').then((mod) => mod.WARMUPS_Cuello),
  core: () => import('./by-muscle/warmups-core').then((mod) => mod.WARMUPS_Core),
  gemelos: () => import('./by-muscle/warmups-gemelos').then((mod) => mod.WARMUPS_Gemelos),
  cardio: () => import('./by-muscle/warmups-cardio').then((mod) => mod.WARMUPS_Cardio),
};

/**
 * Importa dinámicamente solo los warmups del grupo muscular indicado.
 */
export async function getWarmupsByMuscleGroupLazy(
  muscleGroup: string,
): Promise<WarmupExercise[]> {
  const loadWarmups = GROUP_LOADERS[muscleGroup];
  if (!loadWarmups) {
    console.warn(`[warmups-lazy] No hay archivo para el grupo muscular: ${muscleGroup}`);
    return [];
  }

  return loadWarmups();
}

/**
 * Importa dinámicamente todos los grupos de warmups.
 */
export async function getAllWarmupGroupsLazy(): Promise<
  Record<string, WarmupExercise[]>
> {
  const result: Record<string, WarmupExercise[]> = {};

  for (const muscleGroup of Object.keys(GROUP_LOADERS)) {
    result[muscleGroup] = await getWarmupsByMuscleGroupLazy(muscleGroup);
  }

  return result;
}

/**
 * Importa dinámicamente warmups por categoría (filtro tras carga).
 */
export async function getWarmupsByCategoryLazy(
  category: WarmupCategory,
): Promise<WarmupExercise[]> {
  const all = await getAllWarmupGroupsLazy();
  const flat = Object.values(all).flat();
  return flat.filter((w) => w.category === category);
}
