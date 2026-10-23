import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/infrastructure/react-query/queryKeys';
import type { WorkoutSession } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRepositories } from '@/context/RepositoryContext';
import type { CreateSessionInput, UpdateSessionInput } from '@/lib/domain/repositories';

export function useSessions() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const sessionsQueryKey = queryKeys.sessions.listForUser(user?.id ?? null);
  const { sessions: sessionRepository, isDatabaseEnabled } =
    useRepositories();

  // Query for fetching sessions
  const query = useQuery({
    queryKey: sessionsQueryKey,
    enabled: isDatabaseEnabled && Boolean(user),
    queryFn: async () => {
      const result = await sessionRepository.getByUserId(user?.id ?? '');
      return result.sessions;
    },
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });
  
  // Mutation for creating session
  const createMutation = useMutation({
    mutationFn: (data: CreateSessionInput) =>
      sessionRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
  });
  
  // Mutation for updating session
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSessionInput }) =>
      sessionRepository.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.sessions.lists() });
      const previousSessions = queryClient.getQueryData(sessionsQueryKey);
      queryClient.setQueryData(sessionsQueryKey, (old: WorkoutSession[] | undefined) => {
        if (!old) return old;
        return old.map((session) => {
          if (session.id !== id) return session;
          return {
            ...session,
            ...(data.notes !== undefined && { notes: data.notes }),
            ...(data.totalDuration !== undefined && {
              totalDuration: data.totalDuration,
            }),
            ...(data.totalPausedTime !== undefined && {
              totalPausedTime: data.totalPausedTime,
            }),
          };
        });
      });
      return { previousSessions };
    },
    onError: (err, variables, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(sessionsQueryKey, context.previousSessions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
  });
  
  // Mutation for deleting session
  const deleteMutation = useMutation({
    mutationFn: (sessionId: string) =>
      sessionRepository.delete(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
  });

  if (!isDatabaseEnabled) {
    return {
      sessions: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => Promise.resolve(),
      addSession: async () => {
        throw new Error('Base de datos deshabilitada');
      },
      updateSession: async () => {
        throw new Error('Base de datos deshabilitada');
      },
      deleteSession: async () => {
        throw new Error('Base de datos deshabilitada');
      },
      isAdding: false,
      isUpdating: false,
      isDeleting: false,
    };
  }
  
  return {
    sessions: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,

    addSession: createMutation.mutateAsync,
    updateSession: (id: string, data: UpdateSessionInput) =>
      updateMutation.mutateAsync({ id, data }),
    deleteSession: deleteMutation.mutateAsync,

    isAdding: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
