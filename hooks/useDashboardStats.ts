/**
 * Custom hook para optimizar cálculos de estadísticas del dashboard
 */

import { useMemo } from 'react';
import type { WorkoutSession } from '@/types';

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
    const stats = {
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

    // Total volume y sets
    stats.totalVolume = sessions.reduce((total, session) => {
      if (!session.exercises || !Array.isArray(session.exercises)) return total;
      return total + session.exercises.reduce((exTotal, ex) => {
        if (!ex.actualReps || !Array.isArray(ex.actualReps)) return exTotal;
        return exTotal + ex.actualReps.reduce((repTotal, reps, idx) => {
          return repTotal + (reps * (ex.actualWeight?.[idx] || 0));
        }, 0);
      }, 0);
    }, 0);

    stats.totalSets = sessions.reduce((total, session) => {
      if (!session.exercises || !Array.isArray(session.exercises)) return total;
      return total + session.exercises.reduce((exTotal, ex) => {
        return exTotal + (ex.actualReps?.length || 0);
      }, 0);
    }, 0);

    // Current streak
    const sortedDates = sessions
      .map(s => new Date(s.date).setHours(0, 0, 0, 0))
      .sort((a, b) => b - a);

    const uniqueDates = [...new Set(sortedDates)];
    const today = new Date().setHours(0, 0, 0, 0);
    
    if (uniqueDates[0] === today || uniqueDates[0] === today - 86400000) {
      let streak = 0;
      let currentDate = today;

      for (const date of uniqueDates) {
        if (date === currentDate || date === currentDate - 86400000) {
          streak++;
          currentDate = date - 86400000;
        } else {
          break;
        }
      }
      stats.currentStreak = streak;
    }

    // Monthly volumes
    const now = new Date();
    const thisMonth = sessions.filter(s => {
      const date = new Date(s.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    stats.thisMonthVolume = thisMonth.reduce((total, session) => {
      if (!session.exercises || !Array.isArray(session.exercises)) return total;
      return total + session.exercises.reduce((exTotal, ex) => {
        if (!ex.actualReps || !Array.isArray(ex.actualReps)) return exTotal;
        return exTotal + ex.actualReps.reduce((repTotal, reps, idx) => {
          return repTotal + (reps * (ex.actualWeight?.[idx] || 0));
        }, 0);
      }, 0);
    }, 0);

    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthSessions = sessions.filter(s => {
      const date = new Date(s.date);
      return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
    });

    stats.lastMonthVolume = lastMonthSessions.reduce((total, session) => {
      if (!session.exercises || !Array.isArray(session.exercises)) return total;
      return total + session.exercises.reduce((exTotal, ex) => {
        if (!ex.actualReps || !Array.isArray(ex.actualReps)) return exTotal;
        return exTotal + ex.actualReps.reduce((repTotal, reps, idx) => {
          return repTotal + (reps * (ex.actualWeight?.[idx] || 0));
        }, 0);
      }, 0);
    }, 0);

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
