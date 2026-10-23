import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/infrastructure/react-query/queryKeys';
import type { Routine } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRepositories } from '@/context/RepositoryContext';
import type {
  CreateRoutineInput,
  UpdateRoutineInput,
} from '@/lib/domain/repositories';

interface PartialRoutineUpdate {
  name?: string;
  description?: string;
  image?: string;
  restBetweenSets?: number;
  restBetweenExercises?: number;
  exercises?: Routine['exercises'];
}

export function useRoutines() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const routinesQueryKey = queryKeys.routines.listForUser(user?.id ?? null);
  const { routines: routineRepository, isDatabaseEnabled } =
    useRepositories();

  // Query for fetching routines
  const query = useQuery({
    queryKey: routinesQueryKey,
    enabled: isDatabaseEnabled && Boolean(user),
    queryFn: async () => {
      const result = await routineRepository.getByUserId(user?.id ?? '');
      return result.routines;
    },
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });
  
  // Mutation for creating routine
  const createMutation = useMutation({
    mutationFn: (data: CreateRoutineInput) =>
      routineRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.lists() });
    },
  });
  
  // Mutation for updating routine
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoutineInput }) =>
      routineRepository.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.routines.lists() });
      
      const previousRoutines = queryClient.getQueryData(routinesQueryKey);
      queryClient.setQueryData(routinesQueryKey, (old: Routine[] | undefined) => {
        if (!old) return old;
        return old.map((routine) => {
    if (routine.id !== id) return routine;
    const updates = data as PartialRoutineUpdate;
    return {
      ...routine,
      name: updates.name ?? routine.name,
      description: updates.description ?? routine.description,
      image: updates.image ?? routine.image,
      restBetweenSets: updates.restBetweenSets ?? routine.restBetweenSets,
      restBetweenExercises: updates.restBetweenExercises ?? routine.restBetweenExercises,
      exercises: updates.exercises ?? routine.exercises,
    };
  });
});
       return { previousRoutines };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousRoutines) {
        queryClient.setQueryData(routinesQueryKey, context.previousRoutines);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.lists() });
    },
  });
  
  // Mutation for deleting routine
  const deleteMutation = useMutation({
    mutationFn: (id: string) => routineRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.lists() });
    },
  });

  if (!isDatabaseEnabled) {
    return {
      routines: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => Promise.resolve(),
      createRoutine: async () => {
        throw new Error('Base de datos deshabilitada');
      },
      updateRoutine: async () => {
        throw new Error('Base de datos deshabilitada');
      },
      deleteRoutine: async () => {
        throw new Error('Base de datos deshabilitada');
      },
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    };
  }
  
  return {
    routines: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    
    createRoutine: createMutation.mutateAsync,
    updateRoutine: (id: string, data: UpdateRoutineInput) =>
      updateMutation.mutateAsync({ id, data }),
    deleteRoutine: deleteMutation.mutateAsync,
    
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
