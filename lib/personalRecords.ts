/**
 * Sistema de Récords Personales (PR - Personal Records)
 * Detecta y gestiona los récords de peso por ejercicio
 */

import type { WorkoutSession } from '@/types';

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  reps: number;
  date: Date;
  sessionId: string;
}

export interface RecordComparison {
  isNewRecord: boolean;
  previousRecord?: number;
  improvement?: number; // Diferencia en kg
  improvementPercentage?: number;
}

/**
 * Obtiene el récord personal actual para un ejercicio
 */
export function getPersonalRecord(
  exerciseId: string,
  sessions: WorkoutSession[]
): PersonalRecord | null {
  let maxWeight = 0;
  let recordSession: WorkoutSession | null = null;
  let recordExercise: WorkoutSession['exercises'][0] | null = null;

  // Buscar en todas las sesiones el peso máximo para este ejercicio
  for (const session of sessions) {
    const exercise = session.exercises.find(ex => ex.exerciseId === exerciseId);
    if (!exercise) continue;

    // Buscar el peso máximo en esta sesión
    const sessionMaxWeight = Math.max(...(exercise.actualWeight || [0]));
    
    if (sessionMaxWeight > maxWeight) {
      maxWeight = sessionMaxWeight;
      recordSession = session;
      recordExercise = exercise;
    }
  }

  if (!recordSession || !recordExercise || maxWeight === 0) {
    return null;
  }

  // Encontrar las reps del set con el peso máximo
  const maxWeightIndex = recordExercise.actualWeight?.indexOf(maxWeight) ?? -1;
  const reps = recordExercise.actualReps?.[maxWeightIndex] ?? 0;

  return {
    exerciseId,
    exerciseName: recordExercise.exerciseName || '',
    maxWeight,
    reps,
    date: recordSession.date,
    sessionId: recordSession.id
  };
}

/**
 * Compara un peso con el récord personal actual
 */
export function compareWithRecord(
  exerciseId: string,
  weight: number,
  sessions: WorkoutSession[]
): RecordComparison {
  const currentRecord = getPersonalRecord(exerciseId, sessions);

  if (!currentRecord || currentRecord.maxWeight === 0) {
    // Primer registro para este ejercicio
    return {
      isNewRecord: weight > 0,
      previousRecord: undefined,
      improvement: undefined,
      improvementPercentage: undefined
    };
  }

  const isNewRecord = weight > currentRecord.maxWeight;
  
  if (!isNewRecord) {
    return {
      isNewRecord: false,
      previousRecord: currentRecord.maxWeight
    };
  }

  const improvement = weight - currentRecord.maxWeight;
  const improvementPercentage = (improvement / currentRecord.maxWeight) * 100;

  return {
    isNewRecord: true,
    previousRecord: currentRecord.maxWeight,
    improvement,
    improvementPercentage
  };
}

/**
 * Obtiene todos los récords personales del usuario
 */
export function getAllPersonalRecords(
  sessions: WorkoutSession[]
): PersonalRecord[] {
  const recordsMap = new Map<string, PersonalRecord>();

  for (const session of sessions) {
    for (const exercise of session.exercises) {
      const exerciseId = exercise.exerciseId;
      const maxWeight = Math.max(...(exercise.actualWeight || [0]));
      
      if (maxWeight === 0) continue;

      const currentRecord = recordsMap.get(exerciseId);
      
      if (!currentRecord || maxWeight > currentRecord.maxWeight) {
        const maxWeightIndex = exercise.actualWeight?.indexOf(maxWeight) ?? -1;
        const reps = exercise.actualReps?.[maxWeightIndex] ?? 0;

        recordsMap.set(exerciseId, {
          exerciseId,
          exerciseName: exercise.exerciseName || '',
          maxWeight,
          reps,
          date: session.date,
          sessionId: session.id
        });
      }
    }
  }

  return Array.from(recordsMap.values());
}

/**
 * Obtiene el historial de récords para un ejercicio específico
 */
export function getRecordHistory(
  exerciseId: string,
  sessions: WorkoutSession[]
): Array<{ weight: number; reps: number; date: Date; sessionId: string }> {
  const history: Array<{ weight: number; reps: number; date: Date; sessionId: string }> = [];
  let currentMax = 0;

  // Ordenar sesiones por fecha
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const session of sortedSessions) {
    const exercise = session.exercises.find(ex => ex.exerciseId === exerciseId);
    if (!exercise) continue;

    const maxWeight = Math.max(...(exercise.actualWeight || [0]));
    
    // Solo agregar si es un nuevo récord
    if (maxWeight > currentMax) {
      const maxWeightIndex = exercise.actualWeight?.indexOf(maxWeight) ?? -1;
      const reps = exercise.actualReps?.[maxWeightIndex] ?? 0;

      history.push({
        weight: maxWeight,
        reps,
        date: session.date,
        sessionId: session.id
      });

      currentMax = maxWeight;
    }
  }

  return history;
}

/**
 * Calcula estadísticas de progresión
 */
export function getProgressionStats(
  exerciseId: string,
  sessions: WorkoutSession[]
) {
  const history = getRecordHistory(exerciseId, sessions);
  
  if (history.length === 0) {
    return null;
  }

  const firstRecord = history[0];
  const lastRecord = history[history.length - 1];
  const totalImprovement = lastRecord.weight - firstRecord.weight;
  const improvementPercentage = (totalImprovement / firstRecord.weight) * 100;
  
  // Calcular tiempo entre primer y último récord
  const daysBetween = Math.floor(
    (new Date(lastRecord.date).getTime() - new Date(firstRecord.date).getTime()) / 
    (1000 * 60 * 60 * 24)
  );

  return {
    totalRecords: history.length,
    firstRecord: firstRecord.weight,
    currentRecord: lastRecord.weight,
    totalImprovement,
    improvementPercentage,
    daysBetween,
    averageImprovementPerRecord: totalImprovement / (history.length - 1 || 1)
  };
}

/**
 * Calcula el progreso de un ejercicio específico
 */
export function calculateExerciseProgress(
  sessions: WorkoutSession[],
  exerciseName: string
): {
  trend: 'up' | 'down' | 'stable';
  currentWeight: number;
  previousWeight: number;
  improvement: number;
  improvementPercentage: number;
  totalSessions: number;
  personalRecord: {
    maxWeight: number;
    reps: number;
    date: Date;
  };
  totalVolume: number;
  sessions: number;
} | null {
  // Filtrar sesiones que contienen este ejercicio
  const relevantSessions = sessions
    .filter(s => s.exercises.some(e => e.exerciseName === exerciseName))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (relevantSessions.length === 0) {
    return null;
  }

  // Calcular récord personal
  let maxWeight = 0;
  let maxWeightReps = 0;
  let maxWeightDate = new Date();
  let totalVolume = 0;

  for (const session of relevantSessions) {
    const exercise = session.exercises.find(e => e.exerciseName === exerciseName);
    if (!exercise) continue;

    // Calcular volumen total de esta sesión
    for (let i = 0; i < (exercise.actualWeight?.length || 0); i++) {
      const weight = exercise.actualWeight?.[i] || 0;
      const reps = exercise.actualReps?.[i] || 0;
      totalVolume += weight * reps;

      // Actualizar récord si es mayor
      if (weight > maxWeight) {
        maxWeight = weight;
        maxWeightReps = reps;
        maxWeightDate = session.date;
      }
    }
  }

  // Si no hay datos válidos
  if (maxWeight === 0) {
    return null;
  }

  // Calcular tendencia (comparar últimas 2 sesiones)
  let trend: 'up' | 'down' | 'stable' = 'stable';
  let improvement = 0;
  let improvementPercentage = 0;
  let currentWeight = maxWeight;
  let previousWeight = maxWeight;

  if (relevantSessions.length >= 2) {
    const lastSession = relevantSessions[relevantSessions.length - 1];
    const previousSession = relevantSessions[relevantSessions.length - 2];

    const lastExercise = lastSession.exercises.find(e => e.exerciseName === exerciseName);
    const previousExercise = previousSession.exercises.find(e => e.exerciseName === exerciseName);

    if (lastExercise && previousExercise) {
      currentWeight = Math.max(...(lastExercise.actualWeight || [0]));
      previousWeight = Math.max(...(previousExercise.actualWeight || [0]));

      if (currentWeight > 0 && previousWeight > 0) {
        improvement = currentWeight - previousWeight;
        improvementPercentage = (improvement / previousWeight) * 100;

        if (improvement > 0) {
          trend = 'up';
        } else if (improvement < 0) {
          trend = 'down';
        }
      }
    }
  }

  return {
    trend,
    currentWeight,
    previousWeight,
    improvement,
    improvementPercentage,
    totalSessions: relevantSessions.length,
    personalRecord: {
      maxWeight,
      reps: maxWeightReps,
      date: maxWeightDate
    },
    totalVolume,
    sessions: relevantSessions.length
  };
}
