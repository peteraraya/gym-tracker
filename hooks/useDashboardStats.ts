/**
 * Custom hook para optimizar cálculos de estadísticas del dashboard
 * 
 * IMPROVED: Usa helpers de dateUtils para evitar bugs de DST y código duplicado
 */

import { useMemo } from 'react';
import type { WorkoutSession } from '@/types';
import {
  calculateSessionVolume,
  calculateTotalSets,
  calculateStreak,
  filterSessionsByMonth
} from '@/lib/utils/dateUtils';

export interface DashboardStats {
  totalSessions: number;
  totalVolume: number;
  totalSets: number;
  currentStreak: number;
  thisMonthVolume: number;
  lastMonthVolume: number;
  volumeTrend: number;
  favoriteExercise: string;
}

export function useDashboardStats(sessions: WorkoutSession[]): DashboardStats {
  return useMemo(() => {
    const stats: DashboardStats = {
      totalSessions: sessions.length,
      totalVolume: 0,
      totalSets: 0,
      currentStreak: 0,
      thisMonthVolume: 0,
      lastMonthVolume: 0,
      volumeTrend: 0,
      favoriteExercise: 'N/A'
    };

    if (sessions.length === 0) return stats;

    // Total volume usando helper (sin duplicación de código)
    stats.totalVolume = sessions.reduce((total, session) =>
      total + calculateSessionVolume(session.exercises), 0);

    // Total sets usando helper
    stats.totalSets = sessions.reduce((total, session) =>
      total + calculateTotalSets(session.exercises), 0);

    // Current streak usando helper (sin bugs de DST)
    stats.currentStreak = calculateStreak(sessions);

    // Monthly volumes usando helper
    const now = new Date();
    const thisMonth = filterSessionsByMonth(sessions, now.getMonth(), now.getFullYear());
    stats.thisMonthVolume = thisMonth.reduce((total, session) =>
      total + calculateSessionVolume(session.exercises), 0);

    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthSessions = filterSessionsByMonth(
      sessions,
      lastMonth.getMonth(),
      lastMonth.getFullYear()
    );
    stats.lastMonthVolume = lastMonthSessions.reduce((total, session) =>
      total + calculateSessionVolume(session.exercises), 0);

    // Volume trend
    stats.volumeTrend = stats.lastMonthVolume > 0
      ? ((stats.thisMonthVolume - stats.lastMonthVolume) / stats.lastMonthVolume) * 100
      : 0;

    // Favorite exercise
    const exerciseCounts: Record<string, number> = {};
    sessions.forEach(session => {
      if (!session.exercises || !Array.isArray(session.exercises)) return;
      session.exercises.forEach(ex => {
        const name = ex.exerciseName || ex.exerciseId || 'Desconocido';
        exerciseCounts[name] = (exerciseCounts[name] || 0) + 1;
      });
    });

    const entries = Object.entries(exerciseCounts);
    if (entries.length > 0) {
      stats.favoriteExercise = entries.sort((a, b) => b[1] - a[1])[0][0];
    }

    return stats;
  }, [sessions]);
}
