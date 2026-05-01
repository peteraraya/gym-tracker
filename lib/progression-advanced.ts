import { WorkoutSession } from '@/types';

export type ProgressionStrategy = 'linear' | 'undulating' | 'auto';

export type ProgressionRecommendation = {
  exerciseId: string;
  recommend: boolean;
  suggestedWeight?: number;
  reason?: string;
  createdAt: string;
  lastWeights?: number[];
  confidence: 'high' | 'medium' | 'low';
  factors?: {
    twoForTwo: boolean;
    volumeTrend: 'increasing' | 'stable' | 'decreasing';
    fatigueScore: number; // 0-10, donde 10 es máxima fatiga
    consistencyScore: number; // 0-100%
  };
  strategy?: ProgressionStrategy;
};

export type ProgressionOptions = {
  repTarget?: number;
  compound?: boolean;
  absoluteIncrementKg?: number;
  strategy?: ProgressionStrategy;
  considerFatigue?: boolean;
  considerVolume?: boolean;
  minSessionsForProgression?: number;
};

function roundToIncrement(value: number, increment = 0.5) {
  return Math.round(value / increment) * increment;
}

export function estimate1RM(weight: number, reps: number) {
  if (!weight || !reps || reps <= 0) return 0;
  return Math.round(weight * (1 + reps / 30));
}

/**
 * Calcula el volumen total (peso × reps × series) para un ejercicio en una sesión
 */
function calculateVolume(exercise: any): number {
  if (!exercise.actualWeight || !exercise.actualReps) return 0;
  
  // ✅ Validar que ambos arrays existan
  const weights = exercise.actualWeight || [];
  const reps = exercise.actualReps || [];
  
  if (weights.length === 0 || reps.length === 0) return 0;
  
  let totalVolume = 0;
  const sets = Math.min(weights.length, reps.length);
  
  for (let i = 0; i < sets; i++) {
    const weight = Number(weights[i]) || 0;
    const rep = Number(reps[i]) || 0;
    
    // ✅ Validar números
    if (!Number.isFinite(weight) || !Number.isFinite(rep)) continue;
    if (weight < 0 || rep <= 0) continue;
    
    totalVolume += weight * rep;
  }
  
  return totalVolume;
}

/**
 * Analiza la tendencia de volumen en las últimas sesiones
 */
function analyzeVolumeTrend(volumes: number[]): 'increasing' | 'stable' | 'decreasing' {
  if (volumes.length < 2) return 'stable';
  
  const recent = volumes.slice(0, 3);
  const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
  const older = volumes.slice(3, 6);
  
  if (older.length === 0) return 'stable';
  
  const avgOlder = older.reduce((a, b) => a + b, 0) / older.length;
  const change = (avgRecent - avgOlder) / avgOlder;
  
  if (change > 0.1) return 'increasing';
  if (change < -0.1) return 'decreasing';
  return 'stable';
}

/**
 * Estima el nivel de fatiga basado en:
 * - Frecuencia de entrenamientos recientes
 * - Volumen total acumulado
 * - Tendencia de rendimiento
 */
function estimateFatigueScore(
  exerciseId: string,
  sessions: WorkoutSession[]
): number {
  const last7Days = sessions.filter(s => {
    const sessionDate = new Date(s.date);
    const now = new Date();
    const diffDays = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  });
  
  // Factor 1: Frecuencia (más entrenamientos = más fatiga)
  const frequencyScore = Math.min(last7Days.length / 7, 1) * 3; // 0-3 puntos
  
  // Factor 2: Volumen total reciente
  let totalVolume = 0;
  last7Days.forEach(s => {
    const ex = s.exercises?.find(e => e.exerciseId === exerciseId);
    if (ex) totalVolume += calculateVolume(ex);
  });
  const volumeScore = Math.min(totalVolume / 10000, 1) * 4; // 0-4 puntos
  
  // Factor 3: Tendencia de rendimiento (si está bajando = fatiga)
  const relevant = sessions
    .filter(s => s.exercises?.some(e => e.exerciseId === exerciseId))
    .slice(0, 5);
  
  let performanceTrend = 0;
  if (relevant.length >= 3) {
    const volumes = relevant.map(s => {
      const ex = s.exercises?.find(e => e.exerciseId === exerciseId);
      return ex ? calculateVolume(ex) : 0;
    });
    
    const trend = analyzeVolumeTrend(volumes);
    if (trend === 'decreasing') performanceTrend = 3; // 0-3 puntos
    else if (trend === 'stable') performanceTrend = 1.5;
  }
  
  return Math.min(frequencyScore + volumeScore + performanceTrend, 10);
}

/**
 * Calcula la consistencia del usuario (% de sesiones completadas vs planificadas)
 */
function calculateConsistency(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0;
  
  const last30Days = sessions.filter(s => {
    const sessionDate = new Date(s.date);
    const now = new Date();
    const diffDays = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  });
  
  // Asumimos 3-4 entrenamientos por semana como ideal
  const expectedSessions = 12; // 3 por semana × 4 semanas
  const actualSessions = last30Days.length;
  
  return Math.min((actualSessions / expectedSessions) * 100, 100);
}

/**
 * Algoritmo de progresión mejorado que considera múltiples factores
 */
export function recommendWeightIncrease(
  exerciseId: string,
  sessions: WorkoutSession[],
  options: ProgressionOptions = {}
): ProgressionRecommendation {
  const {
    repTarget = 8,
    compound = true,
    absoluteIncrementKg = compound ? 2.5 : 1.25,
    strategy = 'auto',
    considerFatigue = true,
    considerVolume = true,
    minSessionsForProgression = 2
  } = options;

  // Recolectar sesiones relevantes
  const relevant: Array<{
    date: string;
    weight: number;
    reps: number;
    volume: number;
  }> = [];
  
  sessions
    .slice()
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .forEach(s => {
      const ex = s.exercises?.find(e => e.exerciseId === exerciseId);
      if (!ex) return;
      
      // ✅ Validar que ambos arrays existan y tengan datos
      const repsArray = ex.actualReps || [];
      const weightsArray = ex.actualWeight || [];
      
      if (repsArray.length === 0 || weightsArray.length === 0) return;
      
      const lastIdx = Math.min(repsArray.length, weightsArray.length) - 1;
      if (lastIdx < 0) return;
      
      const reps = Number(repsArray[lastIdx]) || 0;
      const weight = Number(weightsArray[lastIdx]) || 0;
      
      // ✅ Validar que sean números válidos
      if (!Number.isFinite(reps) || !Number.isFinite(weight)) return;
      if (reps <= 0 || weight < 0) return;
      
      const volume = calculateVolume(ex);
      const dateStr = (s.date && typeof (s.date as any).toISOString === 'function')
        ? (s.date as any).toISOString()
        : String(s.date);
      
      relevant.push({ date: dateStr, weight, reps, volume });
    });

  if (relevant.length < minSessionsForProgression) {
    return {
      exerciseId,
      recommend: false,
      reason: 'Historial insuficiente',
      createdAt: new Date().toISOString(),
      confidence: 'low'
    };
  }

  // Análisis de factores
  const lastTwo = relevant.slice(0, 2);
  const twoForTwo = lastTwo.every(r => r.reps >= repTarget);
  
  const volumes = relevant.map(r => r.volume);
  const volumeTrend = analyzeVolumeTrend(volumes);
  
  const fatigueScore = considerFatigue
    ? estimateFatigueScore(exerciseId, sessions)
    : 0;
  
  const consistencyScore = calculateConsistency(sessions);

  // Determinar estrategia
  let effectiveStrategy = strategy;
  if (strategy === 'auto') {
    // Auto-seleccionar basado en nivel de fatiga y consistencia
    if (fatigueScore > 7 || consistencyScore < 60) {
      effectiveStrategy = 'undulating';
    } else {
      effectiveStrategy = 'linear';
    }
  }

  // Calcular confianza
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  if (twoForTwo && volumeTrend === 'increasing' && fatigueScore < 5 && consistencyScore > 70) {
    confidence = 'high';
  } else if (!twoForTwo || fatigueScore > 7 || consistencyScore < 50) {
    confidence = 'low';
  }

  // Decisión de progresión
  const currentWeight = lastTwo[0].weight || lastTwo[1].weight || 0;
  let recommend = false;
  let suggestedWeight = currentWeight;
  let reason = '';

  if (effectiveStrategy === 'linear') {
    // Progresión lineal: aumentar si cumple 2-for-2 y no hay fatiga excesiva
    if (twoForTwo && fatigueScore < 7) {
      recommend = true;
      suggestedWeight = currentWeight + absoluteIncrementKg;
      reason = `Progresión lineal: 2-for-2 alcanzado, fatiga controlada (${fatigueScore.toFixed(1)}/10)`;
    } else if (!twoForTwo) {
      reason = 'No cumple 2-for-2 para progresión lineal';
    } else {
      reason = `Fatiga elevada (${fatigueScore.toFixed(1)}/10). Mantén el peso o descarga`;
    }
  } else {
    // Progresión ondulada: variar intensidad y volumen
    const weekInCycle = Math.floor(relevant.length % 3);
    
    if (weekInCycle === 0) {
      // Semana pesada
      if (twoForTwo && fatigueScore < 8) {
        recommend = true;
        suggestedWeight = currentWeight + absoluteIncrementKg;
        reason = 'Progresión ondulada: Semana pesada (+peso)';
      } else {
        reason = 'Progresión ondulada: Semana pesada, pero consolida primero';
      }
    } else if (weekInCycle === 1) {
      // Semana media (mantener peso, aumentar volumen)
      suggestedWeight = currentWeight;
      reason = 'Progresión ondulada: Semana media (mismo peso, más volumen)';
    } else {
      // Semana ligera (descarga)
      suggestedWeight = currentWeight * 0.9;
      reason = 'Progresión ondulada: Semana de descarga (-10% peso)';
    }
  }

  suggestedWeight = roundToIncrement(suggestedWeight, 0.5);

  return {
    exerciseId,
    recommend,
    suggestedWeight,
    reason,
    createdAt: new Date().toISOString(),
    lastWeights: relevant.slice(0, 4).map(r => r.weight),
    confidence,
    factors: {
      twoForTwo,
      volumeTrend,
      fatigueScore,
      consistencyScore
    },
    strategy: effectiveStrategy
  };
}

/**
 * Recomienda para todos los ejercicios en una sesión
 */
export function recommendForSession(
  session: WorkoutSession,
  allSessions: WorkoutSession[],
  options: ProgressionOptions = {}
) {
  const results: ProgressionRecommendation[] = [];
  if (!session.exercises || !Array.isArray(session.exercises)) return results;

  session.exercises.forEach(ex => {
    const rec = recommendWeightIncrease(ex.exerciseId, allSessions, options);
    if (rec) results.push(rec);
  });

  return results;
}

export default {
  recommendWeightIncrease,
  recommendForSession,
  estimate1RM
};
