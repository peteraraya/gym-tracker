import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as storageService from '@/lib/storage/storage';
import { queryKeys } from '@/lib/react-query/queryKeys';
import type { Routine } from '@/types';

export function useRoutines() {
  const queryClient = useQueryClient();
  
  // Query for fetching routines
  const query = useQuery({
    queryKey: queryKeys.routines.lists(),
    queryFn: () => storageService.getRoutines(),
    staleTime: 5 * 60 * 1000, // 5 minutes
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
      
      const previousRoutines = queryClient.getQueryData(queryKeys.routines.lists());
      
      queryClient.setQueryData(queryKeys.routines.lists(), (old: Routine[] | undefined) => {
        if (!old) return old;
        return old.map(routine => {
          if (routine.id !== id) return routine;
          return {
            ...routine,
            name: (data as any).name ?? routine.name,
            description: (data as any).description ?? routine.description,
            image: (data as any).image ?? routine.image,
            restBetweenSets: (data as any).restBetweenSets ?? routine.restBetweenSets,
            restBetweenExercises: (data as any).restBetweenExercises ?? routine.restBetweenExercises,
            exercises: (data as any).exercises ?? routine.exercises,
          } as Routine;
        });
      });
      
      return { previousRoutines };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousRoutines) {
        queryClient.setQueryData(queryKeys.routines.lists(), context.previousRoutines);
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
