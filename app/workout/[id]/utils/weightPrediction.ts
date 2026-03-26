/**
 * Utilidades para predicción inteligente de pesos
 * 
 * Este módulo implementa la lógica de predicción de pesos basada en:
 * - Serie anterior en el workout actual
 * - Última sesión del mismo ejercicio
 * - Detección de progresión (regla 2-for-2)
 * - Fallback a configuración de rutina
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
 * Predice el peso para la serie actual basándose en historial y contexto
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
  
  // Prioridad 2: Última sesión (si es serie 1)
  if (currentSet === 1) {
    // Buscar última sesión con este ejercicio
    const lastSession = sessions
      .filter(s => s.exercises.some(e => e.exerciseName === exerciseName))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    if (lastSession) {
      const lastExerciseData = lastSession.exercises.find(e => e.exerciseName === exerciseName);
      
      if (lastExerciseData && lastExerciseData.actualWeight && lastExerciseData.actualWeight[0]) {
        const lastWeight = lastExerciseData.actualWeight[0];
        
        // Verificar si se debe sugerir progresión
        const allCompleted = lastExerciseData.completedSets >= lastExerciseData.actualReps.length;
        const avgReps = lastExerciseData.actualReps.reduce((sum, r) => sum + r, 0) / lastExerciseData.actualReps.length;
        const targetReps = currentExercise.sets[0]?.reps || 10;
        
        // Regla 2-for-2: Si completó todas las series con el objetivo de reps, sugerir progresión
        if (allCompleted && avgReps >= targetReps) {
          const isCompound = isCompoundExercise(exerciseName);
          const increment = isCompound ? 5 : 2.5;
          
          return {
            predictedWeight: lastWeight + increment,
            confidence: 'high',
            source: 'progression',
            reasoning: `¡Progresión! +${increment}kg basado en última sesión`
          };
        }
        
        // Sin progresión, usar mismo peso
        return {
          predictedWeight: lastWeight,
          confidence: 'high',
          source: 'last_session',
          reasoning: 'Peso de la última sesión'
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
 * Valida que un peso esté dentro de rangos aceptables
 */
export function validateWeight(weight: number): number {
  // No negativo
  if (weight < 0) return 0;
  
  // Máximo 500kg (límite de seguridad)
  if (weight > 500) return 500;
  
  // Redondear a 2 decimales
  return Math.round(weight * 100) / 100;
}
