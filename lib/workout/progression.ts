import { WorkoutSession } from '@/types';

export type Recommendation = {
  exerciseId: string;
  recommend: boolean;
  suggestedWeight?: number;
  reason?: string;
  createdAt: string;
  lastWeights?: number[];
};

function roundToIncrement(value: number, increment = 0.5) {
  return Math.round(value / increment) * increment;
}

export function estimate1RM(weight: number, reps: number) {
  if (!weight || !reps || reps <= 0) return 0;
  return Math.round(weight * (1 + reps / 30));
}

/**
 * Regla simple 2-for-2: si en las últimas dos sesiones donde aparece el ejercicio
 * el usuario completó >= repTarget en la última serie, entonces sugerimos aumentar.
 */
export function recommendWeightIncrease(exerciseId: string, sessions: WorkoutSession[], options?: {
  repTarget?: number;
  compound?: boolean;
  absoluteIncrementKg?: number;
}) : Recommendation {
  const repTarget = options?.repTarget ?? 8;
  const compound = options?.compound ?? true;
  const absInc = options?.absoluteIncrementKg ?? (compound ? 2.5 : 1.25);

  // Recolectar sesiones relevantes (las que contienen el exerciseId), orden por fecha desc
  const relevant: Array<{date: string; weight: number; reps: number}> = [];
  sessions.slice().sort((a,b) => +new Date(b.date) - +new Date(a.date)).forEach(s => {
    const ex = s.exercises?.find(e => e.exerciseId === exerciseId);
    if (!ex) return;
    const lastIdx = (ex.actualReps?.length || 0) - 1;
    if (lastIdx < 0) return;
    const reps = ex.actualReps?.[lastIdx] ?? 0;
    const weight = ex.actualWeight?.[lastIdx] ?? 0;
    const dateStr = (s.date && typeof (s.date as any).toISOString === 'function') ? (s.date as any).toISOString() : String(s.date);
    relevant.push({ date: dateStr, weight, reps });
  });

  if (relevant.length < 2) {
    return { exerciseId, recommend: false, reason: 'Historial insuficiente', createdAt: new Date().toISOString() };
  }

  const lastTwo = relevant.slice(0,2);
  const twoForTwo = lastTwo.every(r => r.reps >= repTarget);

  if (!twoForTwo) {
    return { exerciseId, recommend: false, reason: 'No cumple 2-for-2', createdAt: new Date().toISOString() };
  }

  const currentWeight = lastTwo[0].weight || lastTwo[1].weight || 0;
  let suggested = currentWeight + absInc;
  suggested = roundToIncrement(suggested, 0.5);

  return {
    exerciseId,
    recommend: true,
    suggestedWeight: suggested,
    reason: '2-for-2 alcanzado',
    createdAt: new Date().toISOString(),
    lastWeights: relevant.slice(0,4).map(r => r.weight)
  };
}

/**
 * Recomienda para todas las exercises presentes en una sesión
 */
export function recommendForSession(session: WorkoutSession, allSessions: WorkoutSession[], options?: { repTarget?: number; compound?: boolean }) {
  const results: Recommendation[] = [];
  if (!session.exercises || !Array.isArray(session.exercises)) return results;

  session.exercises.forEach(ex => {
    const rec = recommendWeightIncrease(ex.exerciseId, allSessions, { repTarget: options?.repTarget, compound: options?.compound });
    if (rec) results.push(rec);
  });

  return results;
}

export default { recommendWeightIncrease, recommendForSession, estimate1RM };
