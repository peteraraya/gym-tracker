import type { WorkoutSession } from '@/types';
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
 * Formatea segundos a formato legible (Xm Ys o Xs)
 */
function formatRestTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  if (mins > 0 && secs > 0) {
    return `${mins}m ${secs}s`;
  } else if (mins > 0) {
    return `${mins}m`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Analiza el historial de sesiones y genera sugerencias inteligentes
 */
export function generateWorkoutSuggestions(
  sessions: WorkoutSession[],
  currentExerciseName?: string,
  currentWeight?: number,
  currentRestTime?: number,
  smartRestTime?: number
): WorkoutSuggestion[] {
  const suggestions: WorkoutSuggestion[] = [];

  // Ordenar sesiones por fecha (mÃ¡s reciente primero)
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
    const restSuggestion = checkRestTime(currentExerciseName, currentRestTime, smartRestTime);
    if (restSuggestion) suggestions.push(restSuggestion);
  }

  // 3. Advertencia de sobreentrenamiento
  const overtrainingSuggestion = checkOvertraining(sortedSessions);
  if (overtrainingSuggestion) suggestions.push(overtrainingSuggestion);

  // 4. Sugerencia de deload
  const deloadSuggestion = checkDeloadNeeded(sortedSessions);
  if (deloadSuggestion) suggestions.push(deloadSuggestion);

  // 5. FelicitaciÃ³n por consistencia
  const consistencySuggestion = checkConsistency(sortedSessions);
  if (consistencySuggestion) suggestions.push(consistencySuggestion);

  return suggestions;
}

/**
 * Verifica si el usuario ha usado el mismo peso por varias sesiones
 */
function checkWeightProgression(
  sessions: WorkoutSession[],
  exerciseName: string,
  currentWeight: number
): WorkoutSuggestion | null {
  // Buscar las Ãºltimas 3-5 sesiones donde se hizo este ejercicio
  const relevantSessions = sessions
    .filter(s => s.exercises.some(e => e.exerciseName === exerciseName))
    .slice(0, 5);

  if (relevantSessions.length < 3) return null;

  // Obtener los pesos usados en cada sesiÃ³n
  const weights = relevantSessions.map(session => {
    const exercise = session.exercises.find(e => e.exerciseName === exerciseName);
    if (!exercise || !exercise.actualWeight || exercise.actualWeight.length === 0) return null;
    // Usar el peso mÃ¡ximo de la sesiÃ³n
    return exercise.actualWeight.length > 0 ? Math.max(...exercise.actualWeight) : null;
  }).filter(w => w !== null) as number[];

  if (weights.length < 3) return null;

  // Verificar si ha usado el mismo peso en las Ãºltimas 3 sesiones
  const lastThreeWeights = weights.slice(0, 3);
  const allSameWeight = lastThreeWeights.every(w => w === lastThreeWeights[0]);

  if (allSameWeight && lastThreeWeights[0] === currentWeight) {
    return {
      type: 'weight_increase',
      title: 'ðŸ’ª Considera aumentar el peso',
      message: `Has completado 3 sesiones con ${currentWeight}kg en ${exerciseName}. Â¡Es momento de progresar! Intenta aumentar 2.5kg.`,
      icon: 'ðŸ“ˆ',
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
 * Ahora usa el mismo criterio que los selectores (80% del recomendado)
 */
function checkRestTime(
  exerciseName: string,
  restTime: number,
  smartRestTime?: number
): WorkoutSuggestion | null {
  const exercise = EXERCISE_DATABASE.find(e => e.name === exerciseName);
  if (!exercise) return null;

  // Si hay smartRestTime, usar el criterio del 80%
  if (smartRestTime) {
    const minRecommended = Math.floor(smartRestTime * 0.8);
    
    if (restTime < minRecommended) {
      return {
        type: 'rest_warning',
        title: 'âš ï¸ Descanso bajo mÃ­nimo',
        message: `${exerciseName}: Se recomienda al menos ${formatRestTime(minRecommended)} de descanso. Actualmente: ${formatRestTime(restTime)}.`,
        icon: 'â±ï¸',
        variant: 'warning',
        actionable: true,
        data: {
          currentRest: restTime,
          recommendedMin: minRecommended,
          recommended: smartRestTime
        }
      };
    }
    
    // Mensaje positivo cuando estÃ¡ en rango adecuado
    if (restTime >= minRecommended && restTime <= smartRestTime * 1.2) {
      return {
        type: 'consistency',
        title: 'âœ… Descanso adecuado',
        message: `Perfecto! ${formatRestTime(restTime)} es un tiempo de descanso ideal para ${exerciseName}.`,
        icon: 'â±ï¸',
        variant: 'success',
        actionable: false,
        data: {
          currentRest: restTime,
          recommended: smartRestTime
        }
      };
    }
    
    return null;
  }

  // Fallback: lÃ³gica anterior si no hay smartRestTime
  const exAny = exercise as any;
  const equipment = exercise.equipment ?? '';
  const isCompound = exAny.type === 'compound' || ['Barra', 'Barra/Mancuernas', 'Peso corporal', 'MÃ¡quina', 'Poleas'].includes(equipment);
  const isHeavy = exAny.difficulty === 'avanzado';

  if (isCompound && restTime < 90) {
    return {
      type: 'rest_warning',
      title: 'âš ï¸ Descanso muy corto',
      message: `${exerciseName} es un ejercicio compuesto. Se recomienda descansar al menos ${formatRestTime(90)}-${formatRestTime(180)} para recuperaciÃ³n Ã³ptima.`,
      icon: 'â±ï¸',
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
      title: 'âš ï¸ Descanso insuficiente',
      message: `Para ejercicios pesados como ${exerciseName}, considera descansar ${formatRestTime(120)}-${formatRestTime(180)} entre series para mantener la intensidad.`,
      icon: 'â±ï¸',
      variant: 'warning',
      actionable: true,
      data: {
        currentRest: restTime,
        recommendedMin: 120,
        recommendedMax: 180
      }
    };
  }

  // âœ… Mensaje positivo cuando el descanso es adecuado
  if (isCompound && restTime >= 90 && restTime <= 180) {
    return {
      type: 'consistency',
      title: 'âœ… Descanso adecuado',
      message: `Perfecto! ${formatRestTime(restTime)} es un tiempo de descanso ideal para ${exerciseName}.`,
      icon: 'â±ï¸',
      variant: 'success',
      actionable: false,
      data: {
        currentRest: restTime
      }
    };
  }

  if (isHeavy && restTime >= 120 && restTime <= 180) {
    return {
      type: 'consistency',
      title: 'âœ… Descanso Ã³ptimo',
      message: `Excelente! ${formatRestTime(restTime)} es perfecto para ejercicios pesados como ${exerciseName}.`,
      icon: 'â±ï¸',
      variant: 'success',
      actionable: false,
      data: {
        currentRest: restTime
      }
    };
  }

  return null;
}

/**
 * Detecta si el usuario estÃ¡ entrenando demasiados dÃ­as consecutivos
 */
function checkOvertraining(sessions: WorkoutSession[]): WorkoutSuggestion | null {
  if (sessions.length < 5) return null;

  // Obtener las Ãºltimas 7 sesiones
  const recentSessions = sessions.slice(0, 7);
  
  // Verificar si hay 5+ dÃ­as consecutivos de entrenamiento
  let consecutiveDays = 0;
  let maxConsecutive = 0;
  
  const dates = recentSessions.map(s => new Date(s.date).toDateString());
  const today = new Date().toDateString();
  
  // Verificar dÃ­as consecutivos hacia atrÃ¡s desde hoy
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
      title: 'ðŸ›‘ Considera un dÃ­a de descanso',
      message: `Llevas ${maxConsecutive} dÃ­as consecutivos entrenando. El descanso es crucial para la recuperaciÃ³n muscular y prevenir lesiones.`,
      icon: 'ðŸ˜´',
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
function checkDeloadNeeded(sessions: WorkoutSession[]): WorkoutSuggestion | null {
  if (sessions.length < 12) return null;

  // Verificar las Ãºltimas 4 semanas (12-16 sesiones)
  const last4Weeks = sessions.slice(0, 16);
  
  // Calcular volumen promedio (series totales)
  const totalSets = last4Weeks.reduce((sum, session) => {
    return sum + session.exercises.reduce((exSum, ex) => exSum + ex.completedSets, 0);
  }, 0);
  
  const avgSetsPerSession = totalSets / last4Weeks.length;
  
  // Si el promedio es alto (>20 series por sesiÃ³n) y han pasado 4+ semanas
  if (avgSetsPerSession > 20 && last4Weeks.length >= 12) {
    const weeksSinceStart = Math.floor(last4Weeks.length / 3); // Asumiendo 3 sesiones/semana
    
    if (weeksSinceStart >= 4) {
      return {
        type: 'deload',
        title: 'ðŸ”„ Considera una semana de deload',
        message: `Has entrenado intensamente por ${weeksSinceStart} semanas. Una semana de deload (50-60% del volumen) ayudarÃ¡ a tu recuperaciÃ³n y progreso a largo plazo.`,
        icon: 'ðŸ§˜',
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
function checkConsistency(sessions: WorkoutSession[]): WorkoutSuggestion | null {
  if (sessions.length < 3) return null;

  // Verificar las Ãºltimas 2 semanas
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  const recentSessions = sessions.filter(s => new Date(s.date) >= twoWeeksAgo);
  
  // Si ha entrenado 4+ veces en 2 semanas
  if (recentSessions.length >= 4) {
    return {
      type: 'consistency',
      title: 'ðŸŽ‰ Â¡Excelente consistencia!',
      message: `Has completado ${recentSessions.length} entrenamientos en las Ãºltimas 2 semanas. Â¡Sigue asÃ­!`,
      icon: 'ðŸ”¥',
      variant: 'success',
      actionable: false
    };
  }

  return null;
}

/**
 * Genera sugerencias especÃ­ficas para el ejercicio actual durante el workout
 */
export function generateLiveSuggestions(
  exerciseName: string,
  currentSet: number,
  totalSets: number,
  currentWeight: number,
  sessions: WorkoutSession[]
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
      const lastWeight = lastExercise.actualWeight.length > 0 ? Math.max(...lastExercise.actualWeight) : 0;
      const lastReps = lastExercise.actualReps && lastExercise.actualReps.length > 0 ? Math.max(...lastExercise.actualReps) : 0;
      
      // Sugerencia si estÃ¡ usando menos peso que la Ãºltima vez
      if (currentWeight < lastWeight && currentSet === 1) {
        suggestions.push({
          type: 'weight_increase',
          title: 'ðŸ“Š ComparaciÃ³n con Ãºltima sesiÃ³n',
          message: `La Ãºltima vez usaste ${lastWeight}kg. Hoy estÃ¡s usando ${currentWeight}kg. Â¿Es intencional?`,
          icon: 'ðŸ’­',
          variant: 'info',
          actionable: false,
          data: {
            lastWeight,
            lastReps,
            currentWeight
          }
        });
      }
      
      // Sugerencia si estÃ¡ usando mÃ¡s peso
      if (currentWeight > lastWeight && currentSet === 1) {
        suggestions.push({
          type: 'weight_increase',
          title: 'ðŸ’ª Â¡Progreso detectado!',
          message: `Has aumentado de ${lastWeight}kg a ${currentWeight}kg. Â¡Excelente progresiÃ³n!`,
          icon: 'ðŸ“ˆ',
          variant: 'success',
          actionable: false
        });
      }
    }
  }

  // MotivaciÃ³n en la Ãºltima serie
  if (currentSet === totalSets) {
    suggestions.push({
      type: 'consistency',
      title: 'ðŸŽ¯ Â¡Ãšltima serie!',
      message: 'Dale todo en esta Ãºltima serie. Â¡TÃº puedes!',
      icon: 'ðŸ’¥',
      variant: 'success',
      actionable: false
    });
  }

  return suggestions;
}
