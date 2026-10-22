import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as storageService from '@/lib/infrastructure/storage/storage';
import { queryKeys } from '@/lib/infrastructure/react-query/queryKeys';
import type { Routine } from '@/types';
import { useAuth } from '@/context/AuthContext';

export function useRoutines() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const routinesQueryKey = queryKeys.routines.listForUser(user?.id ?? null);
  
  // Query for fetching routines
  const query = useQuery({
    queryKey: routinesQueryKey,
    queryFn: () => storageService.getRoutines(),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });
  
  // Mutation for creating routine
  const createMutation = useMutation({
    mutationFn: (data: storageService.CreateRoutineData) => 
      storageService.createRoutine(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.lists() });
    },
  });
  
  // Mutation for updating routine
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: storageService.CreateRoutineData }) =>
      storageService.updateRoutine(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.routines.lists() });
      
      const previousRoutines = queryClient.getQueryData(routinesQueryKey);
      
interface PartialRoutineUpdate {
  name?: string;
  description?: string;
  image?: string;
  restBetweenSets?: number;
  restBetweenExercises?: number;
  exercises?: Routine['exercises'];
}

queryClient.setQueryData(routinesQueryKey, (old: Routine[] | undefined) => {
  if (!old) return old;
  return old.map(routine => {
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
    mutationFn: (id: string) => storageService.deleteRoutine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.lists() });
    },
  });
  
  return {
    routines: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    
    createRoutine: createMutation.mutateAsync,
    updateRoutine: (id: string, data: storageService.CreateRoutineData) =>
      updateMutation.mutateAsync({ id, data }),
    deleteRoutine: deleteMutation.mutateAsync,
    
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
