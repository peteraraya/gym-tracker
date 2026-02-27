/**
 * Utilidades centralizadas para cálculos de volumen
 * 
 * Centraliza la lógica de cálculo de volumen que estaba duplicada
 * en dashboard, progress y sessions
 */

import type { WorkoutSession, Exercise, MuscleGroup } from '@/types';

/**
 * Calcula el volumen total (series × reps × peso) de una sesión
 */
export function calculateSessionVolume(session: WorkoutSession): number {
  return (session.exercises || []).reduce((total, exercise) => {
    const exerciseVolume = (exercise.sets || []).reduce((sum, set) => {
      const reps = set.reps || 0;
      const weight = set.weight || 0;
      return sum + (reps * weight);
    }, 0);
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
  muscleGroup: MuscleGroup
): number {
  return sessions.reduce((total, session) => {
    const volume = (session.exercises || [])
      .filter(ex => ex.muscleGroup === muscleGroup)
      .reduce((sum, ex) => sum + calculateExerciseVolume(ex), 0);
    return total + volume;
  }, 0);
}

/**
 * Calcula el volumen de un ejercicio individual
 */
export function calculateExerciseVolume(exercise: Exercise): number {
  return (exercise.sets || []).reduce((total, set) => {
    const reps = set.reps || 0;
    const weight = set.weight || 0;
    return total + (reps * weight);
  }, 0);
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
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
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
 * Calcula el volumen mínimo en una sesión
 */
export function calculateMinSessionVolume(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0;
  const volumes = sessions.map(calculateSessionVolume).filter(v => v > 0);
  return volumes.length === 0 ? 0 : Math.min(...volumes);
}
