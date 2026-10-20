import { useQuery } from '@tanstack/react-query';
import {
  getExercisesByMuscleGroupLazy,
} from '@/data/exercises/lazy';
import {
  staticQueryOptions,
} from '@/lib/react-query/queryClient';
import type { ExerciseTemplate } from '@/data/exercises';
import type { MuscleGroup } from '@/data/exercises/groups';

/**
 * Hook para cargar ejercicios de un grupo muscular con caché estático.
 * Los datos de ejercicios cambian muy raramente, por lo que se cachean
 * prácticamente para siempre (staleTime: Infinity).
 */
export function useExercisesByMuscleGroup(muscleGroup: MuscleGroup) {
  return useQuery<ExerciseTemplate[], Error>({
    queryKey: ['exercises', 'muscle', muscleGroup],
    queryFn: () => getExercisesByMuscleGroupLazy(muscleGroup),
    ...staticQueryOptions,
  });
}

/**
 * Hook para cargar el índice ligero de ejercicios (metadatos solo).
 * Ideal para vistas de grupos, conteos y búsqueda rápida.
 */
export function useExerciseIndex() {
  return useQuery({
    queryKey: ['exercises', 'index'],
    queryFn: () =>
      import('@/data/exercises/index').then((m) => m.EXERCISE_INDEX),
    ...staticQueryOptions,
  });
}
