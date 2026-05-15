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

    // ✅ Validar que el array no esté vacío
    const weights = exercise.actualWeight || [];
    if (weights.length === 0) continue;

    // Buscar el peso máximo en esta sesión
    const sessionMaxWeight = Math.max(...weights);
    
    // ✅ Validar que sea un número válido
    if (!Number.isFinite(sessionMaxWeight) || sessionMaxWeight <= 0) continue;
    
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
      
      // ✅ Validar que el array no esté vacío
      const weights = exercise.actualWeight || [];
      if (weights.length === 0) continue;
      
      const maxWeight = Math.max(...weights);
      
      // ✅ Validar que sea un número válido
      if (!Number.isFinite(maxWeight) || maxWeight <= 0) continue;

      const currentRecord = recordsMap.get(exerciseId);
      
      if (!currentRecord || maxWeight > currentRecord.maxWeight) {
        const maxWeightIndex = weights.indexOf(maxWeight);
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

    // ✅ Validar que el array no esté vacío
    const weights = exercise.actualWeight || [];
    if (weights.length === 0) continue;
    
    const maxWeight = Math.max(...weights);
    
    // ✅ Validar que sea un número válido
    if (!Number.isFinite(maxWeight) || maxWeight <= 0) continue;
    
    // Solo agregar si es un nuevo récord
    if (maxWeight > currentMax) {
      const maxWeightIndex = weights.indexOf(maxWeight);
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
  const relevantSessions = sessions
    .filter(s => s.exercises.some(e => e.exerciseName === exerciseName))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (relevantSessions.length === 0) {
    return null;
  }

  let maxWeight = 0;
  let maxWeightReps = 0;
  let maxWeightDate = new Date();
  let totalVolume = 0;

  for (const session of relevantSessions) {
    const exercise = session.exercises.find(e => e.exerciseName === exerciseName);
    if (!exercise) continue;

    const weights = exercise.actualWeight || [];
    const reps = exercise.actualReps || [];
    
    if (weights.length === 0 || reps.length === 0) continue;

    const maxLength = Math.min(weights.length, reps.length);
    for (let i = 0; i < maxLength; i++) {
      const weight = Number(weights[i]) || 0;
      const rep = Number(reps[i]) || 0;
      
      if (!Number.isFinite(weight) || !Number.isFinite(rep)) continue;
      if (weight < 0 || rep <= 0) continue;
      
      totalVolume += weight * rep;

      if (weight > maxWeight) {
        maxWeight = weight;
        maxWeightReps = rep;
        maxWeightDate = session.date;
      }
    }
  }

  if (maxWeight === 0) {
    return null;
  }

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

        if (improvementPercentage > 5) {
          trend = 'up';
        } else if (improvementPercentage < -5) {
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

export interface CalculatedPersonalRecord {
  exerciseName: string;
  maxWeight: number;
  reps: number;
  date: Date;
  sessionId: string;
  volume: number;
}

export function calculatePersonalRecords(
  sessions: WorkoutSession[]
): CalculatedPersonalRecord[] {
  const recordsMap = new Map<string, CalculatedPersonalRecord>();

  for (const session of sessions) {
    for (const exercise of session.exercises) {
      const weights = exercise.actualWeight || [];
      const reps = exercise.actualReps || [];
      
      if (weights.length === 0 || reps.length === 0) continue;

      const maxLength = Math.min(weights.length, reps.length);
      let sessionMaxVolume = 0;
      let sessionMaxWeight = 0;
      let sessionMaxReps = 0;

      for (let i = 0; i < maxLength; i++) {
        const weight = Number(weights[i]) || 0;
        const rep = Number(reps[i]) || 0;
        
        if (!Number.isFinite(weight) || !Number.isFinite(rep)) continue;
        if (weight <= 0 || rep <= 0) continue;

        const volume = weight * rep;
        if (volume > sessionMaxVolume) {
          sessionMaxVolume = volume;
          sessionMaxWeight = weight;
          sessionMaxReps = rep;
        }
      }

      if (sessionMaxWeight === 0) continue;

      const exerciseName = exercise.exerciseName || '';
      const currentRecord = recordsMap.get(exerciseName);

      if (!currentRecord || sessionMaxWeight > currentRecord.maxWeight) {
        recordsMap.set(exerciseName, {
          exerciseName,
          maxWeight: sessionMaxWeight,
          reps: sessionMaxReps,
          date: session.date,
          sessionId: session.id,
          volume: sessionMaxVolume,
        });
      }
    }
  }

  return Array.from(recordsMap.values())
    .sort((a, b) => b.volume - a.volume);
}

export interface SessionComparison {
  commonExercises: string[];
  onlyInSession1: string[];
  onlyInSession2: string[];
  differences: Array<{
    exercise: string;
    session1Weight?: number;
    session2Weight?: number;
    session1Reps?: number;
    session2Reps?: number;
  }>;
}

export function compareSessions(
  session1: WorkoutSession,
  session2: WorkoutSession
): SessionComparison {
  const exercises1 = new Map<string, WorkoutSession['exercises'][0]>();
  const exercises2 = new Map<string, WorkoutSession['exercises'][0]>();

   session1.exercises.forEach(ex => { if (ex.exerciseName) exercises1.set(ex.exerciseName, ex); });
   session2.exercises.forEach(ex => { if (ex.exerciseName) exercises2.set(ex.exerciseName, ex); });

  const names1 = new Set(exercises1.keys());
  const names2 = new Set(exercises2.keys());

  const commonExercises: string[] = [];
  const onlyInSession1: string[] = [];
  const onlyInSession2: string[] = [];
  const differences: SessionComparison['differences'] = [];

  for (const name of names1) {
    if (names2.has(name)) {
      commonExercises.push(name);
      const ex1 = exercises1.get(name)!;
      const ex2 = exercises2.get(name)!;
      
      const weight1 = ex1.actualWeight?.length ? Math.max(...ex1.actualWeight) : 0;
      const weight2 = ex2.actualWeight?.length ? Math.max(...ex2.actualWeight) : 0;
      const reps1 = ex1.actualReps?.length ? Math.max(...ex1.actualReps) : 0;
      const reps2 = ex2.actualReps?.length ? Math.max(...ex2.actualReps) : 0;

      if (weight1 !== weight2 || reps1 !== reps2) {
        differences.push({
          exercise: name,
          session1Weight: weight1 || undefined,
          session2Weight: weight2 || undefined,
          session1Reps: reps1 || undefined,
          session2Reps: reps2 || undefined,
        });
      }
    } else {
      onlyInSession1.push(name);
    }
  }

  for (const name of names2) {
    if (!names1.has(name)) {
      onlyInSession2.push(name);
    }
  }

  return {
    commonExercises,
    onlyInSession1,
    onlyInSession2,
    differences,
  };
}

export function getRecentRoutineSessions(
  sessions: WorkoutSession[],
  routineId: string,
  limit: number = 10
): WorkoutSession[] {
  return sessions
    .filter(s => s.routineId === routineId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
