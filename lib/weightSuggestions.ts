import { Session } from '@/types';

export interface WeightSuggestion {
  suggested: number;
  lastUsed: number;
  increase: number;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

/**
 * Genera sugerencia de peso basada en historial
 */
export function generateWeightSuggestion(
  exerciseName: string,
  sessions: Session[],
  targetReps: number = 10
): WeightSuggestion | null {
  // Filtrar sesiones que contengan este ejercicio
  const relevantSessions = sessions
    .filter(s => s.exercises.some(e => e.exerciseName === exerciseName))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5); // Últimas 5 sesiones

  if (relevantSessions.length === 0) {
    return null;
  }

  // Obtener datos del ejercicio de cada sesión
  const exerciseData = relevantSessions.map(session => {
    const exercise = session.exercises.find(e => e.exerciseName === exerciseName);
    if (!exercise) return null;

    // Calcular peso promedio usado
    const avgWeight = exercise.actualWeight.length > 0
      ? exercise.actualWeight.reduce((sum, w) => sum + w, 0) / exercise.actualWeight.length
      : 0;

    // Calcular reps promedio
    const avgReps = exercise.actualReps.length > 0
      ? exercise.actualReps.reduce((sum, r) => sum + r, 0) / exercise.actualReps.length
      : 0;

    return {
      date: session.date,
      weight: avgWeight,
      reps: avgReps,
      maxWeight: Math.max(...exercise.actualWeight),
      completedSets: exercise.completedSets
    };
  }).filter(Boolean);

  if (exerciseData.length === 0) {
    return null;
  }

  const lastSession = exerciseData[0]!;
  const lastWeight = lastSession.weight;

  // Analizar tendencia
  let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
  if (exerciseData.length >= 2) {
    const recentWeights = exerciseData.slice(0, 3).map(d => d!.weight);
    const isIncreasing = recentWeights.every((w, i) => i === 0 || w >= recentWeights[i - 1]);
    const isDecreasing = recentWeights.every((w, i) => i === 0 || w <= recentWeights[i - 1]);
    
    if (isIncreasing) trend = 'increasing';
    else if (isDecreasing) trend = 'decreasing';
  }

  // Calcular sugerencia basada en tendencia y reps
  let suggested = lastWeight;
  let increase = 0;
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  let reason = '';

  // Si completó todas las series con buen rendimiento, sugerir aumento
  if (lastSession.completedSets >= 3 && lastSession.reps >= targetReps) {
    // Incremento estándar: 2.5kg para ejercicios de aislamiento, 5kg para compuestos
    const isCompound = ['Sentadilla', 'Press de Banca', 'Peso Muerto', 'Press Militar'].some(
      ex => exerciseName.includes(ex)
    );
    increase = isCompound ? 5 : 2.5;
    suggested = lastWeight + increase;
    confidence = trend === 'increasing' ? 'high' : 'medium';
    reason = `Completaste ${lastSession.completedSets} series con ${Math.round(lastSession.reps)} reps. ¡Hora de subir!`;
  }
  // Si está en tendencia creciente, mantener progresión
  else if (trend === 'increasing') {
    increase = 2.5;
    suggested = lastWeight + increase;
    confidence = 'medium';
    reason = 'Mantienes una buena progresión. Sigue así!';
  }
  // Si está en tendencia decreciente, mantener peso
  else if (trend === 'decreasing') {
    suggested = lastWeight;
    confidence = 'low';
    reason = 'Consolida este peso antes de subir';
  }
  // Caso estándar: mantener peso
  else {
    suggested = lastWeight;
    confidence = 'medium';
    reason = `La semana pasada usaste ${lastWeight}kg`;
  }

  return {
    suggested: Math.round(suggested * 2) / 2, // Redondear a 0.5kg
    lastUsed: lastWeight,
    increase,
    confidence,
    reason
  };
}

/**
 * Formatea la sugerencia para mostrar al usuario
 */
export function formatWeightSuggestion(suggestion: WeightSuggestion): string {
  if (suggestion.increase > 0) {
    return `💪 ${suggestion.suggested}kg (+${suggestion.increase}kg)`;
  }
  return `${suggestion.suggested}kg`;
}
