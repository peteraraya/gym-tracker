/**
 * Utilidades de fecha y cálculos
 *
 * Funciones helper para:
 * - Manejo de fechas sin bugs de DST (horario de verano)
 * - Cálculos de volumen de entrenamiento
 * - Otras utilidades compartidas
 */

import type { WorkoutSession } from "@/types";

/**
 * Normaliza una fecha a medianoche en la zona horaria local
 */
export function normalizeToMidnight(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Verifica si dos fechas son el mismo día
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  const d1 = normalizeToMidnight(date1);
  const d2 = normalizeToMidnight(date2);
  return d1.getTime() === d2.getTime();
}

/**
 * Verifica si date1 es el día anterior a date2
 * Usa manipulación de fecha en lugar de milisegundos para evitar bugs de DST
 */
export function isPreviousDay(date1: Date, date2: Date): boolean {
  const d1 = normalizeToMidnight(date1);
  const d2 = normalizeToMidnight(date2);
  // Crear fecha del día anterior usando setDate en lugar de restar milisegundos
  const expectedPrevious = new Date(d2);
  expectedPrevious.setDate(expectedPrevious.getDate() - 1);
  return d1.getTime() === expectedPrevious.getTime();
}

/**
 * Obtiene la fecha de ayer
 */
export function getYesterday(): Date {
  const yesterday = normalizeToMidnight(new Date());
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
}

/**
 * Interface para ejercicios con datos de reps/weights
 */
interface ExerciseWithSets {
  actualReps?: number[];
  actualWeight?: number[];
  actualWeights?: number[]; // soporte para formato alternativo
}

/**
 * Calcula el volumen de una sesión (suma de reps * weight para cada set)
 */
export function calculateSessionVolume(
  exercises: ExerciseWithSets[] | undefined,
): number {
  if (!exercises || !Array.isArray(exercises)) return 0;

  return exercises.reduce((total, ex) => {
    if (!ex.actualReps || !Array.isArray(ex.actualReps)) return total;
    // Soportar tanto 'actualWeight' como 'actualWeights' (formatos distintos en la DB)
    const weights = ex.actualWeight ?? ex.actualWeights ?? [];
    return (
      total +
      ex.actualReps.reduce((repTotal, reps, idx) => {
        return repTotal + reps * (weights[idx] || 0);
      }, 0)
    );
  }, 0);
}

/**
 * Cuenta el total de series completadas
 */
export function calculateTotalSets(
  exercises: ExerciseWithSets[] | undefined,
): number {
  if (!exercises || !Array.isArray(exercises)) return 0;

  return exercises.reduce((total, ex) => {
    return total + (ex.actualReps?.length || 0);
  }, 0);
}

/**
 * Calcula el volumen de un array de sesiones
 */
export function calculateTotalVolume(sessions: WorkoutSession[]): number {
  return sessions.reduce(
    (total, session) => total + calculateSessionVolume(session.exercises),
    0,
  );
}

/**
 * Filtra sesiones por mes y año
 */
export function filterSessionsByMonth(
  sessions: WorkoutSession[],
  month: number,
  year: number,
): WorkoutSession[] {
  return sessions.filter((s) => {
    const date = new Date(s.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });
}

/**
 * Calcula la racha actual de entrenamientos
 * Retorna el número de días consecutivos con al menos un entrenamiento
 */
export function calculateStreak(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0;

  // Normalizar y ordenar fechas
  const sortedDates = sessions
    .map((s) => normalizeToMidnight(new Date(s.date)))
    .sort((a, b) => b.getTime() - a.getTime());

  // Obtener fechas únicas
  const uniqueDates = Array.from(
    new Set(sortedDates.map((d) => d.getTime())),
  ).map((t) => new Date(t));

  const today = normalizeToMidnight(new Date());

  // Verificar si la última sesión fue hoy o ayer
  if (uniqueDates.length === 0) return 0;
  if (
    !isSameDay(uniqueDates[0], today) &&
    !isPreviousDay(uniqueDates[0], today)
  ) {
    return 0;
  }

  let streak = 0;
  let expectedDate = today;

  for (const date of uniqueDates) {
    if (isSameDay(date, expectedDate) || isPreviousDay(date, expectedDate)) {
      streak++;
      // Mover la fecha esperada al día anterior de forma segura
      expectedDate = new Date(date);
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
