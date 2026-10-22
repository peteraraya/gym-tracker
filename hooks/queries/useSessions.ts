import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as storageService from '@/lib/infrastructure/storage/storage';
import { queryKeys } from '@/lib/infrastructure/react-query/queryKeys';
import type { WorkoutSession } from '@/types';
import { useAuth } from '@/context/AuthContext';

export function useSessions() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const sessionsQueryKey = queryKeys.sessions.listForUser(user?.id ?? null);
  
  // Query for fetching sessions
  const query = useQuery({
    queryKey: sessionsQueryKey,
    queryFn: () => storageService.getSessions(),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });
  
  // Mutation for creating session
  const createMutation = useMutation({
    mutationFn: (session: Omit<WorkoutSession, 'id'>) =>
      storageService.saveSession(session as WorkoutSession),
    onSuccess: () => {
      // Invalidate sessions and potentially routines (for stats)
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
  });
  
  // Mutation for updating session
  const updateMutation = useMutation({
    mutationFn: (session: WorkoutSession) =>
      storageService.updateSession(session),
    onMutate: async (updatedSession) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.sessions.lists() });
      
      // Snapshot previous value
      const previousSessions = queryClient.getQueryData(sessionsQueryKey);
      
      // Optimistically update
      queryClient.setQueryData(sessionsQueryKey, (old: WorkoutSession[] | undefined) => {
        if (!old) return old;
        return old.map(session =>
          session.id === updatedSession.id ? updatedSession : session
        );
      });
      
      return { previousSessions };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousSessions) {
        queryClient.setQueryData(sessionsQueryKey, context.previousSessions);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
  });
  
  // Mutation for deleting session
  const deleteMutation = useMutation({
    mutationFn: (sessionId: string) =>
      storageService.deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
  });
  
  return {
    sessions: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    
    addSession: createMutation.mutateAsync,
    updateSession: updateMutation.mutateAsync,
    deleteSession: deleteMutation.mutateAsync,
    
    isAdding: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
