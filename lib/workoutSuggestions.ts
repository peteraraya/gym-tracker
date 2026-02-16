import type { Session } from '@/types';
import { EXERCISE_DATABASE } from '@/data/exercises';

export type SuggestionType = 'weight_increase' | 'rest_warning' | 'overtraining' | 'deload' | 'consistency' | 'volume';

export interface WorkoutSuggestion {
  type: SuggestionType;
  title: string;
  message: string;
  icon: string;
  variant: 'info' | 'warning' | 'success' | 'danger';
  actionable?: boolean;
  data?: any;
}

/**
 * Analiza el historial de sesiones y genera sugerencias inteligentes
 */
export function generateWorkoutSuggestions(
  sessions: Session[],
  currentExerciseName?: string,
  currentWeight?: number,
  currentRestTime?: number
): WorkoutSuggestion[] {
  const suggestions: WorkoutSuggestion[] = [];

  // Ordenar sesiones por fecha (más reciente primero)
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // 1. Sugerencia de aumento de peso
  if (currentExerciseName && currentWeight !== undefined) {
    const weightSuggestion = checkWeightProgression(sortedSessions, currentExerciseName, currentWeight);
    if (weightSuggestion) suggestions.push(weightSuggestion);
  }

  // 2. Advertencia de descanso muy corto
  if (currentExerciseName && currentRestTime !== undefined) {
    const restSuggestion = checkRestTime(currentExerciseName, currentRestTime);
    if (restSuggestion) suggestions.push(restSuggestion);
  }

  // 3. Advertencia de sobreentrenamiento
  const overtrainingSuggestion = checkOvertraining(sortedSessions);
  if (overtrainingSuggestion) suggestions.push(overtrainingSuggestion);

  // 4. Sugerencia de deload
  const deloadSuggestion = checkDeloadNeeded(sortedSessions);
  if (deloadSuggestion) suggestions.push(deloadSuggestion);

  // 5. Felicitación por consistencia
  const consistencySuggestion = checkConsistency(sortedSessions);
  if (consistencySuggestion) suggestions.push(consistencySuggestion);

  return suggestions;
}

/**
 * Verifica si el usuario ha usado el mismo peso por varias sesiones
 */
function checkWeightProgression(
  sessions: Session[],
  exerciseName: string,
  currentWeight: number
): WorkoutSuggestion | null {
  // Buscar las últimas 3-5 sesiones donde se hizo este ejercicio
  const relevantSessions = sessions
    .filter(s => s.exercises.some(e => e.exerciseName === exerciseName))
    .slice(0, 5);

  if (relevantSessions.length < 3) return null;

  // Obtener los pesos usados en cada sesión
  const weights = relevantSessions.map(session => {
    const exercise = session.exercises.find(e => e.exerciseName === exerciseName);
    if (!exercise || !exercise.actualWeight || exercise.actualWeight.length === 0) return null;
    // Usar el peso máximo de la sesión
    return Math.max(...exercise.actualWeight);
  }).filter(w => w !== null) as number[];

  if (weights.length < 3) return null;

  // Verificar si ha usado el mismo peso en las últimas 3 sesiones
  const lastThreeWeights = weights.slice(0, 3);
  const allSameWeight = lastThreeWeights.every(w => w === lastThreeWeights[0]);

  if (allSameWeight && lastThreeWeights[0] === currentWeight) {
    return {
      type: 'weight_increase',
      title: '💪 Considera aumentar el peso',
      message: `Has completado 3 sesiones con ${currentWeight}kg en ${exerciseName}. ¡Es momento de progresar! Intenta aumentar 2.5kg.`,
      icon: '📈',
      variant: 'success',
      actionable: true,
      data: {
        currentWeight,
        suggestedWeight: currentWeight + 2.5,
        exerciseName
      }
    };
  }

  return null;
}

/**
 * Verifica si el tiempo de descanso es apropiado para el tipo de ejercicio
 */
function checkRestTime(
  exerciseName: string,
  restTime: number
): WorkoutSuggestion | null {
  const exercise = EXERCISE_DATABASE.find(e => e.name === exerciseName);
  if (!exercise) return null;

  // Ejercicios compuestos requieren más descanso
  const isCompound = exercise.type === 'compound';
  const isHeavy = exercise.difficulty === 'avanzado';

  if (isCompound && restTime < 90) {
    return {
      type: 'rest_warning',
      title: '⚠️ Descanso muy corto',
      message: `${exerciseName} es un ejercicio compuesto. Se recomienda descansar al menos 90-180 segundos para recuperación óptima.`,
      icon: '⏱️',
      variant: 'warning',
      actionable: true,
      data: {
        currentRest: restTime,
        recommendedMin: 90,
        recommendedMax: 180
      }
    };
  }

  if (isHeavy && restTime < 120) {
    return {
      type: 'rest_warning',
      title: '⚠️ Descanso insuficiente',
      message: `Para ejercicios pesados como ${exerciseName}, considera descansar 2-3 minutos entre series para mantener la intensidad.`,
      icon: '⏱️',
      variant: 'warning',
      actionable: true,
      data: {
        currentRest: restTime,
        recommendedMin: 120,
        recommendedMax: 180
      }
    };
  }

  return null;
}

/**
 * Detecta si el usuario está entrenando demasiados días consecutivos
 */
function checkOvertraining(sessions: Session[]): WorkoutSuggestion | null {
  if (sessions.length < 5) return null;

  // Obtener las últimas 7 sesiones
  const recentSessions = sessions.slice(0, 7);
  
  // Verificar si hay 5+ días consecutivos de entrenamiento
  let consecutiveDays = 0;
  let maxConsecutive = 0;
  
  const dates = recentSessions.map(s => new Date(s.date).toDateString());
  const today = new Date().toDateString();
  
  // Verificar días consecutivos hacia atrás desde hoy
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - i);
    const checkDateStr = checkDate.toDateString();
    
    if (dates.includes(checkDateStr)) {
      consecutiveDays++;
      maxConsecutive = Math.max(maxConsecutive, consecutiveDays);
    } else {
      consecutiveDays = 0;
    }
  }

  if (maxConsecutive >= 5) {
    return {
      type: 'overtraining',
      title: '🛑 Considera un día de descanso',
      message: `Llevas ${maxConsecutive} días consecutivos entrenando. El descanso es crucial para la recuperación muscular y prevenir lesiones.`,
      icon: '😴',
      variant: 'danger',
      actionable: true,
      data: {
        consecutiveDays: maxConsecutive
      }
    };
  }

  return null;
}

/**
 * Sugiere una semana de deload si ha estado entrenando intensamente
 */
function checkDeloadNeeded(sessions: Session[]): WorkoutSuggestion | null {
  if (sessions.length < 12) return null;

  // Verificar las últimas 4 semanas (12-16 sesiones)
  const last4Weeks = sessions.slice(0, 16);
  
  // Calcular volumen promedio (series totales)
  const totalSets = last4Weeks.reduce((sum, session) => {
    return sum + session.exercises.reduce((exSum, ex) => exSum + ex.completedSets, 0);
  }, 0);
  
  const avgSetsPerSession = totalSets / last4Weeks.length;
  
  // Si el promedio es alto (>20 series por sesión) y han pasado 4+ semanas
  if (avgSetsPerSession > 20 && last4Weeks.length >= 12) {
    const weeksSinceStart = Math.floor(last4Weeks.length / 3); // Asumiendo 3 sesiones/semana
    
    if (weeksSinceStart >= 4) {
      return {
        type: 'deload',
        title: '🔄 Considera una semana de deload',
        message: `Has entrenado intensamente por ${weeksSinceStart} semanas. Una semana de deload (50-60% del volumen) ayudará a tu recuperación y progreso a largo plazo.`,
        icon: '🧘',
        variant: 'info',
        actionable: true,
        data: {
          weeksTraining: weeksSinceStart,
          avgSetsPerSession
        }
      };
    }
  }

  return null;
}

/**
 * Felicita al usuario por mantener consistencia
 */
function checkConsistency(sessions: Session[]): WorkoutSuggestion | null {
  if (sessions.length < 3) return null;

  // Verificar las últimas 2 semanas
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  const recentSessions = sessions.filter(s => new Date(s.date) >= twoWeeksAgo);
  
  // Si ha entrenado 4+ veces en 2 semanas
  if (recentSessions.length >= 4) {
    return {
      type: 'consistency',
      title: '🎉 ¡Excelente consistencia!',
      message: `Has completado ${recentSessions.length} entrenamientos en las últimas 2 semanas. ¡Sigue así!`,
      icon: '🔥',
      variant: 'success',
      actionable: false
    };
  }

  return null;
}

/**
 * Genera sugerencias específicas para el ejercicio actual durante el workout
 */
export function generateLiveSuggestions(
  exerciseName: string,
  currentSet: number,
  totalSets: number,
  currentWeight: number,
  sessions: Session[]
): WorkoutSuggestion[] {
  const suggestions: WorkoutSuggestion[] = [];

  // Buscar el historial de este ejercicio
  const exerciseHistory = sessions
    .filter(s => s.exercises.some(e => e.exerciseName === exerciseName))
    .slice(0, 5);

  if (exerciseHistory.length > 0) {
    const lastSession = exerciseHistory[0];
    const lastExercise = lastSession.exercises.find(e => e.exerciseName === exerciseName);
    
    if (lastExercise && lastExercise.actualWeight && lastExercise.actualWeight.length > 0) {
      const lastWeight = Math.max(...lastExercise.actualWeight);
      const lastReps = lastExercise.actualReps ? Math.max(...lastExercise.actualReps) : 0;
      
      // Sugerencia si está usando menos peso que la última vez
      if (currentWeight < lastWeight && currentSet === 1) {
        suggestions.push({
          type: 'weight_increase',
          title: '📊 Comparación con última sesión',
          message: `La última vez usaste ${lastWeight}kg. Hoy estás usando ${currentWeight}kg. ¿Es intencional?`,
          icon: '💭',
          variant: 'info',
          actionable: false,
          data: {
            lastWeight,
            lastReps,
            currentWeight
          }
        });
      }
      
      // Sugerencia si está usando más peso
      if (currentWeight > lastWeight && currentSet === 1) {
        suggestions.push({
          type: 'weight_increase',
          title: '💪 ¡Progreso detectado!',
          message: `Has aumentado de ${lastWeight}kg a ${currentWeight}kg. ¡Excelente progresión!`,
          icon: '📈',
          variant: 'success',
          actionable: false
        });
      }
    }
  }

  // Motivación en la última serie
  if (currentSet === totalSets) {
    suggestions.push({
      type: 'consistency',
      title: '🎯 ¡Última serie!',
      message: 'Dale todo en esta última serie. ¡Tú puedes!',
      icon: '💥',
      variant: 'success',
      actionable: false
    });
  }

  return suggestions;
}
