/**
 * Hook personalizado para calcular estadísticas de sesiones
 * 
 * Centraliza los cálculos de estadísticas que estaban duplicados
 * en múltiples componentes.
 */

import { useMemo } from 'react';
import type { WorkoutSession } from '@/types';
import { calculateTotalVolume, calculateTotalSets } from '@/lib/utils/dateUtils';

export interface SessionStats {
  totalVolume: number;
  totalSets: number;
  totalExercises: number;
  averageDuration: number;
  totalSessions: number;
}

export function useSessionStats(sessions: WorkoutSession[]): SessionStats {
  return useMemo(() => {
    const totalVolume = calculateTotalVolume(sessions);
    const totalSets = sessions.reduce((sum, s) => sum + calculateTotalSets(s.exercises), 0);
    const totalExercises = sessions.reduce((sum, s) => sum + (s.exercises?.length || 0), 0);
    
    // Calcular duración promedio
    const sessionsWithDuration = sessions.filter(s => s.totalDuration !== undefined);
    const averageDuration = sessionsWithDuration.length > 0
      ? sessionsWithDuration.reduce((sum, s) => sum + (s.totalDuration || 0), 0) / sessionsWithDuration.length
      : 0;

    return {
      totalVolume,
      totalSets,
      totalExercises,
      averageDuration,
      totalSessions: sessions.length
    };
  }, [sessions]);
}
