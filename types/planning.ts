/**
 * Tipos para el módulo de Planificación / Periodización
 *
 * Conceptos base:
 *  - Mesociclo: bloque de entrenamiento de 4–8 semanas con un objetivo.
 *  - Semana: unidad dentro del mesociclo con targets de volumen e intensidad.
 *  - Volumen landmarks (MEV/MAV/MRV) por grupo muscular: referencia científica
 *    para saber cuántas series semanales son el mínimo efectivo, el óptimo
 *    adaptativo y el máximo recuperable.
 */

export type PlanningGoal =
  | 'hypertrophy'   // Hipertrofia
  | 'strength'      // Fuerza
  | 'endurance'     // Resistencia
  | 'power'         // Potencia
  | 'cut'           // Definición
  | 'recomp';       // Recomposición corporal

export type MesocycleStatus = 'planned' | 'active' | 'completed' | 'paused';

export interface VolumeLandmarks {
  mev: number; // Minimum Effective Volume — mínimo de series/semana para generar adaptación
  mav: number; // Maximum Adaptive Volume — óptimo (rango representado como número promedio)
  mav_max: number; // Techo del rango MAV
  mrv: number; // Maximum Recoverable Volume — máximo recuperable
}

/** Valores por defecto basados en literatura (Israetel et al., RP Strength) */
export const DEFAULT_VOLUME_LANDMARKS: Record<string, VolumeLandmarks> = {
  pecho:      { mev: 8,  mav: 14, mav_max: 20, mrv: 22 },
  espalda:    { mev: 10, mav: 16, mav_max: 22, mrv: 25 },
  hombros:    { mev: 8,  mav: 14, mav_max: 20, mrv: 22 },
  biceps:     { mev: 8,  mav: 14, mav_max: 18, mrv: 20 },
  triceps:    { mev: 8,  mav: 12, mav_max: 14, mrv: 18 },
  piernas:    { mev: 8,  mav: 14, mav_max: 18, mrv: 20 },
  gluteos:    { mev: 4,  mav: 10, mav_max: 16, mrv: 20 },
  gemelos:    { mev: 8,  mav: 12, mav_max: 16, mrv: 20 },
  core:       { mev: 8,  mav: 12, mav_max: 16, mrv: 20 },
  trapecio:   { mev: 6,  mav: 10, mav_max: 14, mrv: 18 },
  antebrazos: { mev: 4,  mav: 8,  mav_max: 14, mrv: 16 },
};

/** Frecuencia semanal recomendada por grupo muscular (veces/semana) */
export const RECOMMENDED_FREQUENCY: Record<string, { min: number; max: number }> = {
  pecho:      { min: 1, max: 3 },
  espalda:    { min: 2, max: 4 },
  hombros:    { min: 2, max: 4 },
  biceps:     { min: 2, max: 4 },
  triceps:    { min: 2, max: 4 },
  piernas:    { min: 2, max: 3 },
  gluteos:    { min: 2, max: 4 },
  gemelos:    { min: 2, max: 4 },
  core:       { min: 2, max: 4 },
  trapecio:   { min: 1, max: 3 },
  antebrazos: { min: 1, max: 3 },
};

export interface MuscleGroupTarget {
  targetSets: number;       // Series semanales planificadas
  targetFrequency: number;  // Frecuencia semanal (veces)
  targetRPE?: number;       // Intensidad objetiva 1-10
  notes?: string;
}

// ─── Agenda diaria ───────────────────────────────────────────────────────────

export type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export const DAYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const DAY_LABELS: Record<DayKey, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export const DAY_LABELS_SHORT: Record<DayKey, string> = {
  monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié',
  thursday: 'Jue', friday: 'Vie', saturday: 'Sáb', sunday: 'Dom',
};

export interface DaySchedule {
  routineIds: string[];
  isRest?: boolean;
  notes?: string;
}

/** Plan semanal dentro de un mesociclo */
export interface WeeklyPlan {
  id: string;
  weekNumber: number;          // 1..mesocycle.weeks
  startDate?: string;          // ISO date opcional
  muscleGroupTargets: Record<string, MuscleGroupTarget>;
  dailySchedule?: Partial<Record<DayKey, DaySchedule>>; // Agenda diaria de rutinas
  notes?: string;
  isDeload?: boolean;          // Semana de descarga
  /** Series reales ejecutadas, archivadas automáticamente al finalizar la semana */
  actualSets?: Record<string, number>;
}

/** Mesociclo — bloque principal de planificación */
export interface Mesocycle {
  id: string;
  name: string;
  goal: PlanningGoal;
  weeks: number;               // Duración en semanas (4–8)
  startDate: string;           // ISO date
  status: MesocycleStatus;
  weeklyPlans: WeeklyPlan[];
  volumeLandmarks: Record<string, VolumeLandmarks>; // Personalizados o DEFAULT
  progressionScheme?: 'linear' | 'undulating' | 'block'; // Esquema de progresión
  // Plantilla/preset aplicada (opcional). 'none' indica explícitamente ninguna plantilla.
  appliedPreset?: PlanningGoal | 'balanced' | 'none';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

import { getWeekStart } from '@/lib/utils/dateUtils';

/** Estructura raíz persistida en localStorage */
export interface PlanningData {
  mesocycles: Mesocycle[];
  activeMesocycleId: string | null;
  // Landmarks personalizados globales del usuario (pueden sobreescribir los por defecto)
  customVolumeLandmarks?: Record<string, VolumeLandmarks>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getActiveMesocycle(data: PlanningData): Mesocycle | null {
  if (!data.activeMesocycleId) return null;
  return data.mesocycles.find(m => m.id === data.activeMesocycleId) ?? null;
}

export function getCurrentWeek(meso: Mesocycle): WeeklyPlan | null {
  if (meso.status !== 'active') return null;
  const start = new Date(meso.startDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const weekIdx = Math.min(Math.max(Math.floor(diffDays / 7), 0), meso.weeks - 1);
  return meso.weeklyPlans.find(w => w.weekNumber === weekIdx + 1) ?? null;
}

export function getTotalWeeklySets(plan: WeeklyPlan): number {
  return Object.values(plan.muscleGroupTargets).reduce((s, t) => s + t.targetSets, 0);
}

/**
 * Calcula series reales por grupo muscular para un rango semanal.
 *
 * @param weekStart - Inicio de la semana a consultar. Si se omite usa el lunes
 *   de la semana calendario actual (convención ES/ISO: semana empieza el lunes).
 */
export function getActualSetsThisWeek(
  sessions: import('@/types').WorkoutSession[],
  exerciseDatabase: import('@/data/exercises').ExerciseTemplate[],
  weekStart?: Date,
): Record<string, number> {
  const now = new Date();
  // Calcular inicio de semana: si se provee externamente se usa tal cual;
  // en caso contrario se usa el lunes de la semana de calendario actual.
  const startOfWeek: Date = weekStart ? new Date(weekStart) : getWeekStart(now, 'monday');

  // Límite superior: 7 días desde el inicio (no contar sesiones de la semana siguiente)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const result: Record<string, number> = {};

  for (const session of sessions) {
    const sessionDate = new Date(session.date);
    if (sessionDate < startOfWeek || sessionDate >= endOfWeek) continue;

    for (const ex of session.exercises) {
      // Buscar por ID primero (más fiable), fallback a nombre si no hay match
      const template =
        exerciseDatabase.find((t) => t.id === ex.exerciseId) ||
        exerciseDatabase.find((t) => t.name === ex.exerciseName);
      if (!template) continue;
      const group = template.muscleGroup;
      result[group] = (result[group] ?? 0) + (ex.completedSets ?? 0);
    }
  }
  return result;
}

export const GOAL_LABELS: Record<PlanningGoal, string> = {
  hypertrophy: '💪 Hipertrofia',
  strength: '🏋️ Fuerza',
  endurance: '⚡ Resistencia',
  power: '🚀 Potencia',
  cut: '🔥 Definición',
  recomp: '⚖️ Recomposición',
};

export const STATUS_LABELS: Record<MesocycleStatus, string> = {
  planned: 'Planificado',
  active: 'Activo',
  completed: 'Completado',
  paused: 'Pausado',
};
