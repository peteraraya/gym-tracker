/**
 * Utilidades centralizadas para cálculos de volumen
 * 
 * Centraliza la lógica de cálculo de volumen que estaba duplicada
 * en dashboard, progress y sessions
 */

import type { WorkoutSession } from '@/types';
import { EXERCISE_DATABASE } from '@/data/exercises';
import { getWeekStart } from '@/lib/utils/dateUtils';

/**
 * Calcula el volumen total (series × reps × peso) de una sesión
 */
export function calculateSessionVolume(session: WorkoutSession): number {
  return (session.exercises || []).reduce((total, exercise) => {
    const exerciseVolume = calculateExerciseVolume(exercise as any);
    return total + exerciseVolume;
  }, 0);
}

/**
 * Calcula el volumen total de múltiples sesiones
 */
export function calculateTotalVolume(sessions: WorkoutSession[]): number {
  return sessions.reduce((total, session) => total + calculateSessionVolume(session), 0);
}

/**
 * Calcula el volumen por grupo muscular
 */
export function calculateVolumeByMuscleGroup(
  sessions: WorkoutSession[],
  muscleGroup: string
): number {
  return sessions.reduce((total, session) => {
    const volume = (session.exercises || [])
      .filter(se => {
        const template = EXERCISE_DATABASE.find(e => e.id === (se as any).exerciseId);
        return template?.muscleGroup === muscleGroup;
      })
      .reduce((sum, se) => sum + calculateExerciseVolume(se as any), 0);
    return total + volume;
  }, 0);
}

/**
 * Calcula el volumen de un ejercicio individual
 */
export function calculateExerciseVolume(exercise: any): number {
  // If exercise has `sets` (routine/exercise template), use that
  if (exercise && Array.isArray(exercise.sets)) {
    return (exercise.sets || []).reduce((total: number, set: any) => {
      const reps = set.reps || 0;
      const weight = set.weight || 0;
      return total + (reps * weight);
    }, 0);
  }

  // If exercise is a session exercise with actualReps/actualWeight arrays
  if (exercise && Array.isArray(exercise.actualReps)) {
    return (exercise.actualReps || []).reduce((total: number, reps: number, idx: number) => {
      const weight = (exercise.actualWeight && exercise.actualWeight[idx]) || 0;
      return total + (reps * weight);
    }, 0);
  }

  return 0;
}

/**
 * Calcula el volumen por período (semana/mes)
 */
export function calculateVolumeByPeriod(
  sessions: WorkoutSession[],
  period: 'week' | 'month'
): Record<string, number> {
  const volumeByPeriod: Record<string, number> = {};

  sessions.forEach(session => {
    if (!session.date) return;

    const date = new Date(session.date);
    let key: string;

    if (period === 'week') {
      const weekStart = getWeekStart(date, 'monday');
      key = weekStart.toISOString().split('T')[0];
    } else {
      key = date.toISOString().slice(0, 7); // YYYY-MM
    }

    volumeByPeriod[key] = (volumeByPeriod[key] || 0) + calculateSessionVolume(session);
  });

  return volumeByPeriod;
}

/**
 * Calcula el volumen promedio por sesión
 */
export function calculateAverageVolumePerSession(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0;
  return calculateTotalVolume(sessions) / sessions.length;
}

/**
 * Calcula el volumen máximo en una sesión
 */
export function calculateMaxSessionVolume(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0;
  return Math.max(...sessions.map(calculateSessionVolume));
}

/**
 * Formatea un volumen en kg a un string legible (kg o toneladas).
 */
export function formatVolume(volumeKg: number): string {
  if (volumeKg < 1000) return `${Math.round(volumeKg)}kg`;
  return `${(volumeKg / 1000).toFixed(1)}t`;
}

/**
 * Calcula el volumen mínimo en una sesión
 */
export function calculateMinSessionVolume(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0;
  const volumes = sessions.map(calculateSessionVolume).filter(v => v > 0);
  return volumes.length === 0 ? 0 : Math.min(...volumes);
}
