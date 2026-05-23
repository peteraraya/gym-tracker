import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as storageService from '@/lib/storage/storage';
import type { UserProfile } from '@/lib/storage/storage';
import { queryKeys } from '@/lib/react-query/queryKeys';

/**
 * Hook React Query para gestionar el perfil del usuario.
 *
 * Centraliza todas las operaciones de lectura y escritura del perfil,
 * evitando llamadas directas dispersas a `storageService.getProfile()` /
 * `storageService.updateProfile()` en páginas y componentes.
 *
 * Uso:
 *   const { profile, isLoading, updateProfile } = useProfile();
 */
export function useProfile() {
  const queryClient = useQueryClient();

  // ─── Lectura ─────────────────────────────────────────────────────────────

  const query = useQuery<UserProfile>({
    queryKey: queryKeys.profile.detail(),
    queryFn: () => storageService.getProfile(),
    // El perfil cambia poco — 10 minutos de stale time es razonable
    staleTime: 10 * 60 * 1000,
  });

  // ─── Escritura ───────────────────────────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) => storageService.updateProfile(data),

    // Actualización optimista: aplica el cambio antes de que confirme el server
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.profile.detail() });

      const previousProfile = queryClient.getQueryData<UserProfile>(
        queryKeys.profile.detail(),
      );

      queryClient.setQueryData<UserProfile>(queryKeys.profile.detail(), (old) => {
        if (!old) return old;
        return { ...old, ...data, updatedAt: new Date() };
      });

      return { previousProfile };
    },

    onError: (_err, _data, context) => {
      // Revertir si falla
      if (context?.previousProfile) {
        queryClient.setQueryData(queryKeys.profile.detail(), context.previousProfile);
      }
    },

    onSettled: () => {
      // Siempre refrescar para asegurar consistencia
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
  });

  // ─── Interfaz pública ────────────────────────────────────────────────────

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,

    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
