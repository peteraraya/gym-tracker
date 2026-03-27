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
      // Invalidate and refetch routines
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.all });
    },
  });
  
  // Mutation for updating routine
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: storageService.CreateRoutineData }) =>
      storageService.updateRoutine(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.routines.lists() });
      
      // Snapshot previous value
      const previousRoutines = queryClient.getQueryData(queryKeys.routines.lists());
      
      // Optimistically update
      queryClient.setQueryData(queryKeys.routines.lists(), (old: Routine[] | undefined) => {
        if (!old) return old;
        return old.map(routine => 
          routine.id === id ? { ...routine, ...data } as Routine : routine
        );
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
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.all });
    },
  });
  
  // Mutation for deleting routine
  const deleteMutation = useMutation({
    mutationFn: (id: string) => storageService.deleteRoutine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.all });
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
