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

const GROUP_FILE_MAP: Record<string, string> = {
  pecho: './by-muscle/warmups-pecho',
  espalda: './by-muscle/warmups-espalda',
  piernas: './by-muscle/warmups-piernas',
  gluteos: './by-muscle/warmups-gluteos',
  hombros: './by-muscle/warmups-hombros',
  biceps: './by-muscle/warmups-biceps',
  triceps: './by-muscle/warmups-triceps',
  antebrazos: './by-muscle/warmups-antebrazos',
  trapecio: './by-muscle/warmups-trapecio',
  cuello: './by-muscle/warmups-cuello',
  core: './by-muscle/warmups-core',
  gemelos: './by-muscle/warmups-gemelos',
  cardio: './by-muscle/warmups-cardio',
};

/**
 * Importa dinámicamente solo los warmups del grupo muscular indicado.
 */
export async function getWarmupsByMuscleGroupLazy(
  muscleGroup: string,
): Promise<WarmupExercise[]> {
  const filePath = GROUP_FILE_MAP[muscleGroup];
  if (!filePath) {
    console.warn(`[warmups-lazy] No hay archivo para el grupo muscular: ${muscleGroup}`);
    return [];
  }

  const mod = await import(filePath);
  const constName = `WARMUPS_${muscleGroup.charAt(0).toUpperCase() + muscleGroup.slice(1)}` as const;
  const warmups = (mod as Record<string, WarmupExercise[]>)[constName];
  return Array.isArray(warmups) ? warmups : [];
}

/**
 * Importa dinámicamente todos los grupos de warmups.
 */
export async function getAllWarmupGroupsLazy(): Promise<
  Record<string, WarmupExercise[]>
> {
  const result: Record<string, WarmupExercise[]> = {};

  for (const muscleGroup of Object.keys(GROUP_FILE_MAP)) {
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
