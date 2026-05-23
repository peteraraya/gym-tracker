/**
 * Utilidades para predicciÃ³n inteligente de pesos
 * 
 * Este mÃ³dulo implementa la lÃ³gica de predicciÃ³n de pesos basada en:
 * - Serie anterior en el workout actual
 * - Ãšltima sesiÃ³n del mismo ejercicio
 * - DetecciÃ³n de progresiÃ³n (regla 2-for-2)
 * - Fallback a configuraciÃ³n de rutina
 */

import type { Exercise, WorkoutSession } from '@/types';

export interface WeightPredictionParams {
  exerciseName: string;
  currentSet: number;
  sessions: WorkoutSession[];
  currentExercise: Exercise;
  actualWeights: Record<string, number[]>;
  exerciseId: string;
}

export interface WeightPredictionResult {
  predictedWeight: number;
  confidence: 'high' | 'medium' | 'low';
  source: 'last_session' | 'previous_set' | 'routine_default' | 'progression';
  reasoning: string;
}

/**
 * Ejercicios compuestos que usan incremento de 5kg
 */
const COMPOUND_EXERCISES = [
  'Sentadilla',
  'Press de Banca',
  'Peso Muerto',
  'Press Militar',
  'Remo con Barra',
  'Sentadilla Frontal',
  'Press Inclinado con Barra',
  'Dominadas Lastradas'
];

/**
 * Determina si un ejercicio es compuesto
 */
function isCompoundExercise(exerciseName: string): boolean {
  return COMPOUND_EXERCISES.some(compound => 
    exerciseName.toLowerCase().includes(compound.toLowerCase())
  );
}

/**
 * Predice el peso para la serie actual basÃ¡ndose en historial y contexto
 */
export function predictWeight(params: WeightPredictionParams): WeightPredictionResult {
  const { exerciseName, currentSet, sessions, currentExercise, actualWeights, exerciseId } = params;
  
  // Prioridad 1: Peso de serie anterior (si es serie 2+)
  if (currentSet > 1) {
    const prevSetIndex = currentSet - 2;
    const prevWeight = actualWeights[exerciseId]?.[prevSetIndex];
    
    if (prevWeight !== undefined && prevWeight > 0) {
      return {
        predictedWeight: prevWeight,
        confidence: 'high',
        source: 'previous_set',
        reasoning: 'Usando peso de la serie anterior'
      };
    }
  }
  
  // Prioridad 2: Ãšltima sesiÃ³n (si es serie 1)
  if (currentSet === 1) {
    // Buscar Ãºltima sesiÃ³n con este ejercicio
    const lastSession = sessions
      .filter(s => s.exercises.some(e => e.exerciseName === exerciseName))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    if (lastSession) {
      const lastExerciseData = lastSession.exercises.find(e => e.exerciseName === exerciseName);
      
      if (lastExerciseData && lastExerciseData.actualWeight && lastExerciseData.actualWeight[0]) {
        const lastWeight = lastExerciseData.actualWeight[0];
        
        // Verificar si se debe sugerir progresiÃ³n
        // BUG FIX: Compare completedSets (count) against the number of actualReps
        // entries that have values > 0, not array.length (which could differ if
        // there are empty/placeholder entries). This ensures correct progression
        // detection when completedSets == actualReps with values.
        const completedSetCount = lastExerciseData.completedSets || 0;
        const validRepEntries = (lastExerciseData.actualReps || []).filter(r => r > 0).length;
        const allCompleted = validRepEntries >= completedSetCount && completedSetCount > 0;
        const avgReps = lastExerciseData.actualReps.reduce((sum, r) => sum + r, 0) / lastExerciseData.actualReps.length;
        const targetReps = currentExercise.sets[0]?.reps || 10;
        
        // Regla 2-for-2: Si completÃ³ todas las series con el objetivo de reps, sugerir progresiÃ³n
        if (allCompleted && avgReps >= targetReps) {
          const isCompound = isCompoundExercise(exerciseName);
          const increment = isCompound ? 5 : 2.5;
          
          return {
            predictedWeight: lastWeight + increment,
            confidence: 'high',
            source: 'progression',
            reasoning: `Â¡ProgresiÃ³n! +${increment}kg basado en Ãºltima sesiÃ³n`
          };
        }
        
        // Sin progresiÃ³n, usar mismo peso
        return {
          predictedWeight: lastWeight,
          confidence: 'high',
          source: 'last_session',
          reasoning: 'Peso de la Ãºltima sesiÃ³n'
        };
      }
    }
  }
  
  // Prioridad 3: Fallback a peso configurado en rutina
  const setIndex = currentSet - 1;
  const routineWeight = currentExercise.sets[setIndex]?.weight || 0;
  
  return {
    predictedWeight: routineWeight,
    confidence: 'low',
    source: 'routine_default',
    reasoning: 'Peso configurado en la rutina'
  };
}

/**
 * Valida que un peso estÃ© dentro de rangos aceptables
 */
export function validateWeight(weight: number): number {
  // No negativo
  if (weight < 0) return 0;
  
  // MÃ¡ximo 500kg (lÃ­mite de seguridad)
  if (weight > 500) return 500;
  
  // Redondear a 2 decimales
  return Math.round(weight * 100) / 100;
}
