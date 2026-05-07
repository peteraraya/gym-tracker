'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  PlanningData,
  Mesocycle,
  WeeklyPlan,
  MuscleGroupTarget,
  VolumeLandmarks,
  PlanningGoal,
  DayKey,
  DaySchedule,
} from '@/types/planning';
import { DEFAULT_VOLUME_LANDMARKS, DAYS } from '@/types/planning';

const STORAGE_KEY = 'gym-planning-data';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getInitialData(): PlanningData {
  return { mesocycles: [], activeMesocycleId: null };
}

function loadFromStorage(): PlanningData {
  if (typeof window === 'undefined') return getInitialData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialData();
    return JSON.parse(raw) as PlanningData;
  } catch {
    return getInitialData();
  }
}

function saveToStorage(data: PlanningData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors silently
  }
}

/** Genera un WeeklyPlan vacío para la semana indicada, con targets en 0 */
function buildEmptyWeeklyPlan(weekNumber: number, muscleGroups: string[]): WeeklyPlan {
  const targets: Record<string, MuscleGroupTarget> = {};
  for (const mg of muscleGroups) {
    targets[mg] = { targetSets: 0, targetFrequency: 2, targetRPE: 7 };
  }
  return { id: generateId(), weekNumber, muscleGroupTargets: targets };
}

const MUSCLE_GROUPS = Object.keys(DEFAULT_VOLUME_LANDMARKS);

// ────────────────────────────────────────────────────────────────────────────

export function usePlanning() {
  const [data, setData] = useState<PlanningData>(getInitialData);
  const [hydrated, setHydrated] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hidratación: cargar desde localStorage solo en cliente
  useEffect(() => {
    setData(loadFromStorage());
    setHydrated(true);
  }, []);

  // Auto-guardar con debounce cada vez que cambien los datos
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveToStorage(data), 400);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [data, hydrated]);

  // ── Mesociclos ────────────────────────────────────────────────────────────

  const createMesocycle = useCallback((params: {
    name: string;
    goal: PlanningGoal;
    weeks: number;
    startDate: string;
    progressionScheme?: Mesocycle['progressionScheme'];
    notes?: string;
  }): Mesocycle => {
    const now = new Date().toISOString();
    const weeklyPlans: WeeklyPlan[] = Array.from({ length: params.weeks }, (_, i) =>
      buildEmptyWeeklyPlan(i + 1, MUSCLE_GROUPS)
    );
    const newMeso: Mesocycle = {
      id: generateId(),
      name: params.name,
      goal: params.goal,
      weeks: params.weeks,
      startDate: params.startDate,
      status: 'planned',
      weeklyPlans,
      volumeLandmarks: { ...DEFAULT_VOLUME_LANDMARKS },
      progressionScheme: params.progressionScheme ?? 'linear',
      notes: params.notes,
      createdAt: now,
      updatedAt: now,
    };

    setData(prev => ({ ...prev, mesocycles: [...prev.mesocycles, newMeso] }));
    return newMeso;
  }, []);

  const updateMesocycle = useCallback((id: string, changes: Partial<Omit<Mesocycle, 'id' | 'createdAt'>>) => {
    setData(prev => ({
      ...prev,
      mesocycles: prev.mesocycles.map(m =>
        m.id === id ? { ...m, ...changes, updatedAt: new Date().toISOString() } : m
      ),
    }));
  }, []);

  const deleteMesocycle = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      mesocycles: prev.mesocycles.filter(m => m.id !== id),
      activeMesocycleId: prev.activeMesocycleId === id ? null : prev.activeMesocycleId,
    }));
  }, []);

  const setActiveMesocycle = useCallback((id: string | null) => {
    setData(prev => {
      const updated = { ...prev, activeMesocycleId: id };
      // Si activamos uno, pasar los demás activos a 'paused'
      if (id) {
        updated.mesocycles = prev.mesocycles.map(m => {
          if (m.id === id) return { ...m, status: 'active' as const, updatedAt: new Date().toISOString() };
          if (m.status === 'active') return { ...m, status: 'paused' as const, updatedAt: new Date().toISOString() };
          return m;
        });
      }
      return updated;
    });
  }, []);

  // ── Planes semanales ──────────────────────────────────────────────────────

  const updateWeeklyPlan = useCallback((
    mesocycleId: string,
    weekNumber: number,
    changes: Partial<Pick<WeeklyPlan, 'notes' | 'isDeload'>>
  ) => {
    setData(prev => ({
      ...prev,
      mesocycles: prev.mesocycles.map(m => {
        if (m.id !== mesocycleId) return m;
        return {
          ...m,
          updatedAt: new Date().toISOString(),
          weeklyPlans: m.weeklyPlans.map(w =>
            w.weekNumber === weekNumber ? { ...w, ...changes } : w
          ),
        };
      }),
    }));
  }, []);

  const updateMuscleGroupTarget = useCallback((
    mesocycleId: string,
    weekNumber: number,
    muscleGroup: string,
    target: Partial<MuscleGroupTarget>
  ) => {
    setData(prev => ({
      ...prev,
      mesocycles: prev.mesocycles.map(m => {
        if (m.id !== mesocycleId) return m;
        return {
          ...m,
          updatedAt: new Date().toISOString(),
          weeklyPlans: m.weeklyPlans.map(w => {
            if (w.weekNumber !== weekNumber) return w;
            return {
              ...w,
              muscleGroupTargets: {
                ...w.muscleGroupTargets,
                [muscleGroup]: { ...w.muscleGroupTargets[muscleGroup], ...target },
              },
            };
          }),
        };
      }),
    }));
  }, []);

  /** Aplica progresión lineal automática: sube X sets por semana a partir de la semana 1 */
  const applyLinearProgression = useCallback((
    mesocycleId: string,
    muscleGroup: string,
    startSets: number,
    weeklyIncrement: number = 2
  ) => {
    setData(prev => ({
      ...prev,
      mesocycles: prev.mesocycles.map(m => {
        if (m.id !== mesocycleId) return m;
        const weeks = m.weeklyPlans.length;
        return {
          ...m,
          updatedAt: new Date().toISOString(),
          weeklyPlans: m.weeklyPlans.map((w, idx) => {
            const isDeload = w.isDeload || (weeks > 4 && idx === weeks - 1);
            const targetSets = isDeload
              ? Math.round(startSets * 0.6)                  // deload: 60% del inicio
              : Math.min(
                  startSets + weeklyIncrement * idx,
                  m.volumeLandmarks[muscleGroup]?.mrv ?? 25   // no superar MRV
                );
            return {
              ...w,
              muscleGroupTargets: {
                ...w.muscleGroupTargets,
                [muscleGroup]: {
                  ...w.muscleGroupTargets[muscleGroup],
                  targetSets,
                },
              },
            };
          }),
        };
      }),
    }));
  }, []);

  /** Actualiza los volume landmarks personalizados de un mesociclo */
  const updateVolumeLandmarks = useCallback((
    mesocycleId: string,
    muscleGroup: string,
    landmarks: Partial<VolumeLandmarks>
  ) => {
    setData(prev => ({
      ...prev,
      mesocycles: prev.mesocycles.map(m => {
        if (m.id !== mesocycleId) return m;
        return {
          ...m,
          updatedAt: new Date().toISOString(),
          volumeLandmarks: {
            ...m.volumeLandmarks,
            [muscleGroup]: { ...m.volumeLandmarks[muscleGroup], ...landmarks },
          },
        };
      }),
    }));
  }, []);

  // ── Derivados ─────────────────────────────────────────────────────────────

  const activeMesocycle = data.mesocycles.find(m => m.id === data.activeMesocycleId) ?? null;

  const getCurrentWeekPlan = useCallback((): WeeklyPlan | null => {
    if (!activeMesocycle || activeMesocycle.status !== 'active') return null;
    const start = new Date(activeMesocycle.startDate);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const weekIdx = Math.min(Math.max(Math.floor(diffDays / 7), 0), activeMesocycle.weeks - 1);
    return activeMesocycle.weeklyPlans.find(w => w.weekNumber === weekIdx + 1) ?? null;
  }, [activeMesocycle]);

  // ── Agenda diaria ─────────────────────────────────────────────────────────

  /** Agrega una rutina a un día dentro de una semana del mesociclo */
  const scheduleRoutineForDay = useCallback((
    mesocycleId: string,
    weekNumber: number,
    day: DayKey,
    routineId: string
  ) => {
    setData(prev => ({
      ...prev,
      mesocycles: prev.mesocycles.map(m => {
        if (m.id !== mesocycleId) return m;
        return {
          ...m,
          updatedAt: new Date().toISOString(),
          weeklyPlans: m.weeklyPlans.map(w => {
            if (w.weekNumber !== weekNumber) return w;
            const sched = w.dailySchedule ?? {};
            const day_sched: DaySchedule = sched[day] ?? { routineIds: [], isRest: false };
            return {
              ...w,
              dailySchedule: {
                ...sched,
                [day]: {
                  ...day_sched,
                  isRest: false,
                  routineIds: day_sched.routineIds.includes(routineId)
                    ? day_sched.routineIds
                    : [...day_sched.routineIds, routineId],
                },
              },
            };
          }),
        };
      }),
    }));
  }, []);

  /** Elimina una rutina de un día dentro de una semana */
  const unscheduleRoutineFromDay = useCallback((
    mesocycleId: string,
    weekNumber: number,
    day: DayKey,
    routineId: string
  ) => {
    setData(prev => ({
      ...prev,
      mesocycles: prev.mesocycles.map(m => {
        if (m.id !== mesocycleId) return m;
        return {
          ...m,
          updatedAt: new Date().toISOString(),
          weeklyPlans: m.weeklyPlans.map(w => {
            if (w.weekNumber !== weekNumber) return w;
            const sched = w.dailySchedule ?? {};
            const day_sched: DaySchedule = sched[day] ?? { routineIds: [] };
            return {
              ...w,
              dailySchedule: {
                ...sched,
                [day]: { ...day_sched, routineIds: day_sched.routineIds.filter(id => id !== routineId) },
              },
            };
          }),
        };
      }),
    }));
  }, []);

  /** Alterna si un día es de descanso (limpia rutinas si se marca como descanso) */
  const toggleRestDay = useCallback((
    mesocycleId: string,
    weekNumber: number,
    day: DayKey
  ) => {
    setData(prev => ({
      ...prev,
      mesocycles: prev.mesocycles.map(m => {
        if (m.id !== mesocycleId) return m;
        return {
          ...m,
          updatedAt: new Date().toISOString(),
          weeklyPlans: m.weeklyPlans.map(w => {
            if (w.weekNumber !== weekNumber) return w;
            const sched = w.dailySchedule ?? {};
            const day_sched: DaySchedule = sched[day] ?? { routineIds: [], isRest: false };
            const newIsRest = !day_sched.isRest;
            return {
              ...w,
              dailySchedule: {
                ...sched,
                [day]: { ...day_sched, isRest: newIsRest, routineIds: newIsRest ? [] : day_sched.routineIds },
              },
            };
          }),
        };
      }),
    }));
  }, []);

  /**
   * Sincroniza el dailySchedule de una semana con el WeeklyPlanner de /routines.
   * Esto sobreescribe el plan semanal del WeeklyPlanner con lo planificado en el mesociclo.
   */
  const syncWeekToRoutinesPlanner = useCallback((weekPlan: WeeklyPlan) => {
    if (typeof window === 'undefined') return;
    try {
      const plannerData: Record<string, { routines: string[]; blocked: boolean; note: string }> = {};
      DAYS.forEach(day => {
        const ds = weekPlan.dailySchedule?.[day] ?? { routineIds: [], isRest: false };
        plannerData[day] = {
          routines: ds.routineIds,
          blocked: ds.isRest ?? false,
          note: ds.notes ?? '',
        };
      });
      localStorage.setItem('gym-weekly-plan', JSON.stringify(plannerData));
      // Notifica al WeeklyPlanner para que recargue
      window.dispatchEvent(new StorageEvent('storage', { key: 'gym-weekly-plan', newValue: JSON.stringify(plannerData) }));
    } catch {
      // silencioso
    }
  }, []);

  return {
    data,
    hydrated,
    activeMesocycle,
    getCurrentWeekPlan,
    // Mesociclos
    createMesocycle,
    updateMesocycle,
    deleteMesocycle,
    setActiveMesocycle,
    // Planes semanales
    updateWeeklyPlan,
    updateMuscleGroupTarget,
    applyLinearProgression,
    updateVolumeLandmarks,
    // Agenda diaria
    scheduleRoutineForDay,
    unscheduleRoutineFromDay,
    toggleRestDay,
    syncWeekToRoutinesPlanner,
  };
}

export type UsePlanningReturn = ReturnType<typeof usePlanning>;
