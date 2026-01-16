import type { WorkoutSession } from '@/types';

export interface PersonalRecord {
  exerciseName: string;
  maxWeight: number;
  reps: number;
  date: Date;
  sessionId: string;
}

export interface ExerciseProgress {
  exerciseName: string;
  sessions: number;
  totalVolume: number;
  averageWeight: number;
  personalRecord: PersonalRecord;
  trend: 'up' | 'down' | 'stable';
  improvement: number; // Porcentaje de mejora
}

/**
 * Calcula los récords personales por ejercicio
 */
export function calculatePersonalRecords(sessions: WorkoutSession[]): PersonalRecord[] {
  const recordsMap = new Map<string, PersonalRecord>();

  sessions.forEach(session => {
    session.exercises?.forEach(exercise => {
      const exerciseName = exercise.exerciseName || exercise.exerciseId;
      
      // Buscar el peso máximo levantado
      const weights = exercise.actualWeight || [];
      const reps = exercise.actualReps || [];
      
      if (!Array.isArray(weights) || !Array.isArray(reps)) return;
      
      weights.forEach((weight, index) => {
        const currentRecord = recordsMap.get(exerciseName);
        
        // Récord por peso puro o por volumen (peso × reps)
        const volume = weight * (reps[index] || 1);
        const currentVolume = currentRecord 
          ? currentRecord.maxWeight * currentRecord.reps 
          : 0;

        if (!currentRecord || volume > currentVolume) {
          recordsMap.set(exerciseName, {
            exerciseName,
            maxWeight: weight,
            reps: reps[index] || 1,
            date: new Date(session.date),
            sessionId: session.id
          });
        }
      });
    });
  });

  return Array.from(recordsMap.values()).sort((a, b) => 
    b.maxWeight * b.reps - a.maxWeight * a.reps
  );
}

/**
 * Calcula el progreso y estadísticas por ejercicio
 */
export function calculateExerciseProgress(
  sessions: WorkoutSession[], 
  exerciseName: string
): ExerciseProgress | null {
  const exerciseSessions = sessions.filter(s => 
    s.exercises?.some(e => 
      (e.exerciseName || e.exerciseId) === exerciseName
    )
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (exerciseSessions.length === 0) return null;

  let totalVolume = 0;
  let totalWeight = 0;
  let weightCount = 0;
  let maxWeight = 0;
  let maxReps = 0;
  let prDate = new Date();
  let prSessionId = '';

  exerciseSessions.forEach(session => {
    session.exercises?.forEach(exercise => {
      if ((exercise.exerciseName || exercise.exerciseId) === exerciseName) {
        const weights = exercise.actualWeight || [];
        const reps = exercise.actualReps || [];

        if (!Array.isArray(weights) || !Array.isArray(reps)) return;

        weights.forEach((weight, index) => {
          const rep = reps[index] || 1;
          const volume = weight * rep;
          
          totalVolume += volume;
          totalWeight += weight;
          weightCount++;

          if (volume > maxWeight * maxReps) {
            maxWeight = weight;
            maxReps = rep;
            prDate = new Date(session.date);
            prSessionId = session.id;
          }
        });
      }
    });
  });

  // Calcular tendencia comparando primera y última sesión
  const firstSessionWeights: number[] = [];
  const lastSessionWeights: number[] = [];

  exerciseSessions[0].exercises?.forEach(ex => {
    if ((ex.exerciseName || ex.exerciseId) === exerciseName) {
      firstSessionWeights.push(...(ex.actualWeight || []));
    }
  });

  exerciseSessions[exerciseSessions.length - 1].exercises?.forEach(ex => {
    if ((ex.exerciseName || ex.exerciseId) === exerciseName) {
      lastSessionWeights.push(...(ex.actualWeight || []));
    }
  });

  const firstAvg = firstSessionWeights.length > 0 
    ? firstSessionWeights.reduce((a, b) => a + b, 0) / firstSessionWeights.length 
    : 0;
  const lastAvg = lastSessionWeights.length > 0 
    ? lastSessionWeights.reduce((a, b) => a + b, 0) / lastSessionWeights.length 
    : 0;
  
  const improvement = ((lastAvg - firstAvg) / firstAvg) * 100;
  const trend = improvement > 5 ? 'up' : improvement < -5 ? 'down' : 'stable';

  return {
    exerciseName,
    sessions: exerciseSessions.length,
    totalVolume,
    averageWeight: weightCount > 0 ? totalWeight / weightCount : 0,
    personalRecord: {
      exerciseName,
      maxWeight,
      reps: maxReps,
      date: prDate,
      sessionId: prSessionId
    },
    trend,
    improvement
  };
}

/**
 * Compara dos sesiones de la misma rutina
 */
export function compareSessions(
  session1: WorkoutSession,
  session2: WorkoutSession
): {
  exerciseName: string;
  improvement: number;
  volumeDiff: number;
  weightDiff: number;
}[] {
  const comparison: {
    exerciseName: string;
    improvement: number;
    volumeDiff: number;
    weightDiff: number;
  }[] = [];

  session1.exercises?.forEach(ex1 => {
    const ex2 = session2.exercises?.find(e => 
      (e.exerciseName || e.exerciseId) === (ex1.exerciseName || ex1.exerciseId)
    );

    if (ex2) {
      const volume1 = (ex1.actualWeight || []).reduce((sum, w, i) => 
        sum + w * ((ex1.actualReps || [])[i] || 1), 0
      );
      const volume2 = (ex2.actualWeight || []).reduce((sum, w, i) => 
        sum + w * ((ex2.actualReps || [])[i] || 1), 0
      );

      const avgWeight1 = (ex1.actualWeight || []).reduce((a, b) => a + b, 0) / 
        (ex1.actualWeight || []).length;
      const avgWeight2 = (ex2.actualWeight || []).reduce((a, b) => a + b, 0) / 
        (ex2.actualWeight || []).length;

      const improvement = ((volume2 - volume1) / volume1) * 100;
      const volumeDiff = volume2 - volume1;
      const weightDiff = avgWeight2 - avgWeight1;

      comparison.push({
        exerciseName: ex1.exerciseName || ex1.exerciseId,
        improvement,
        volumeDiff,
        weightDiff
      });
    }
  });

  return comparison.sort((a, b) => b.improvement - a.improvement);
}

/**
 * Obtiene las últimas N sesiones de una rutina específica
 */
export function getRecentRoutineSessions(
  sessions: WorkoutSession[],
  routineId: string,
  limit: number = 5
): WorkoutSession[] {
  return sessions
    .filter(s => s.routineId === routineId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
