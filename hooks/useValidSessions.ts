/**
 * Hook personalizado para obtener sesiones válidas
 * 
 * Filtra sesiones que pertenecen a rutinas existentes o son ejercicios libres.
 * Centraliza la lógica de filtrado que estaba duplicada en múltiples componentes.
 */

import { useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import type { WorkoutSession } from '@/types';

export function useValidSessions(): WorkoutSession[] {
  const { sessions, routines } = useGym();

  return useMemo(() => {
    const routineIds = new Set(routines.map(r => r.id));
    
    return sessions.filter(session => {
      // Mantener sesiones sin routineId (ejercicios libres)
      if (!session.routineId) return true;
      
      // Excluir sesiones de rutinas eliminadas
      return routineIds.has(session.routineId);
    });
  }, [sessions, routines]);
}
