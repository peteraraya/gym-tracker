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
import { DEFAULT_VOLUME_LANDMARKS, DAYS, RECOMMENDED_FREQUENCY } from '@/types/planning';

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

/** Genera un WeeklyPlan inicial para la semana indicada.
 * Si se proporcionan `goal` y `volumeLandmarks`, crea targets "ideales"
 * basados en MAV y frecuencia recomendada; el usuario puede luego editarlos.
 */
function buildEmptyWeeklyPlan(
  weekNumber: number,
  muscleGroups: string[],
  opts?: { goal?: PlanningGoal; volumeLandmarks?: Record<string, VolumeLandmarks> }
): WeeklyPlan {
  const targets: Record<string, MuscleGroupTarget> = {};
  const landmarks = opts?.volumeLandmarks ?? DEFAULT_VOLUME_LANDMARKS;
  const goal = opts?.goal ?? 'hypertrophy';

  const DEFAULT_RPE_BY_GOAL: Record<PlanningGoal, number> = {
    hypertrophy: 7,
    strength: 8,
    endurance: 6,
    power: 8,
    cut: 7,
    recomp: 7,
  };

  for (const mg of muscleGroups) {
    const lm = landmarks[mg] ?? { mev: 0, mav: 0, mav_max: 0, mrv: 999 };
    const freqRec = RECOMMENDED_FREQUENCY[mg] ?? { min: 1, max: 3 };
    const freq = Math.round((freqRec.min + freqRec.max) / 2);

    // Target ideal: usar MAV (redondeado) como referencia de series semanales
    const targetSets = Math.max(0, Math.round(lm.mav));
    const targetRPE = DEFAULT_RPE_BY_GOAL[goal] ?? 7;

    targets[mg] = { targetSets, targetFrequency: freq, targetRPE };
  }

  return { id: generateId(), weekNumber, muscleGroupTargets: targets };
}

const MUSCLE_GROUPS = Object.keys(DEFAULT_VOLUME_LANDMARKS);

// ────────────────────────────────────────────────────────────────────────────

export function usePlanning() {
  const [data, setData] = useState<PlanningData>(getInitialData);
  const [hydrated, setHydrated] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hidratación: cargar desde localStorage solo en cliente.
  // React 18+ batchea ambos setState en un único re-render, sin riesgo de loop.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setData(loadFromStorage());
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /** Aplica plantilla/preset por objetivo a todo el mesociclo (actualiza targets) */
  const applyPresetToMesocycle = useCallback((mesocycleId: string, preset: PlanningGoal | 'balanced' | 'none') => {
    const FACTORS: Record<string, number> = {
      hypertrophy: 1.0,
      strength: 0.6,
      endurance: 0.7,
      power: 0.5,
      cut: 0.9,
      recomp: 1.0,
      balanced: 1.0,
    };
    const RPE_BY_GOAL: Record<PlanningGoal, number> = {
      hypertrophy: 7,
      strength: 8,
      endurance: 6,
      power: 8,
      cut: 7,
      recomp: 7,
    };

    setData(prev => ({
      ...prev,
      mesocycles: prev.mesocycles.map(m => {
        if (m.id !== mesocycleId) return m;
        const factor = (FACTORS as any)[preset] ?? 1.0;
        const rpe = (RPE_BY_GOAL as any)[preset] ?? 7;
        const newWeeklyPlans = m.weeklyPlans.map(w => {
          const newTargets: Record<string, MuscleGroupTarget> = { ...w.muscleGroupTargets };
          for (const mg of MUSCLE_GROUPS) {
            const lm = m.volumeLandmarks[mg] ?? DEFAULT_VOLUME_LANDMARKS[mg] ?? { mev: 0, mav: 0, mav_max: 0, mrv: 999 };
            const freqRec = RECOMMENDED_FREQUENCY[mg] ?? { min: 1, max: 3 };
            const freq = Math.round((freqRec.min + freqRec.max) / 2);
            let base = Math.max(0, Math.round((lm.mav ?? 0) * factor));
            if (w.isDeload) base = Math.max(0, Math.round(base * 0.6));
            const safeSets = Math.min(base, lm.mrv ?? 999);
            newTargets[mg] = { ...(newTargets[mg] ?? { targetSets: 0, targetFrequency: freq }), targetSets: safeSets, targetFrequency: freq, targetRPE: rpe };
          }
          return { ...w, muscleGroupTargets: newTargets };
        });

        return { ...m, weeklyPlans: newWeeklyPlans, updatedAt: new Date().toISOString(), appliedPreset: preset };
      }),
    }));
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
    preset?: PlanningGoal | 'none' | 'balanced';
  }): Mesocycle => {
    const now = new Date().toISOString();
    const weeklyPlans: WeeklyPlan[] = Array.from({ length: params.weeks }, (_, i) =>
      buildEmptyWeeklyPlan(i + 1, MUSCLE_GROUPS, { goal: params.goal, volumeLandmarks: DEFAULT_VOLUME_LANDMARKS })
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
      appliedPreset: params.preset && params.preset !== 'none' ? params.preset : undefined,
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

  /**
   * Archiva las series reales ejecutadas en una semana concreta del mesociclo.
   * Llamado automáticamente desde la página de planificación cuando la semana avanza,
   * para preservar el historial de volumen real de semanas pasadas.
   */
  const archiveWeekActualSets = useCallback((
    mesocycleId: string,
    weekNumber: number,
    sets: Record<string, number>
  ) => {
    setData(prev => ({
      ...prev,
      mesocycles: prev.mesocycles.map(m => {
        if (m.id !== mesocycleId) return m;
        return {
          ...m,
          updatedAt: new Date().toISOString(),
          weeklyPlans: m.weeklyPlans.map(w =>
            w.weekNumber === weekNumber ? { ...w, actualSets: sets } : w
          ),
        };
      }),
    }));
  }, []);

  const setActiveMesocycle = useCallback((id: string | null) => {
    setData(prev => {
      const updated = { ...prev, activeMesocycleId: id };
      // Si activamos uno, pasar los demás activos a 'paused' y fijar startDate al activarlo
      if (id) {
        updated.mesocycles = prev.mesocycles.map(m => {
          if (m.id === id) {
            // Si estamos cambiando estado a 'active' (no estaba ya activo), ajustar startDate
            const nowIso = new Date().toISOString();
            const wasActive = m.status === 'active';
            return {
              ...m,
              status: 'active' as const,
              // Al activar, asumimos que la planificación debe empezar desde el momento de activación
              startDate: wasActive ? m.startDate : nowIso,
              updatedAt: nowIso,
            };
          }
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

  /** Restaura los targets por defecto (recalcula usando buildEmptyWeeklyPlan) conservando isDeload y agenda */
  const resetMesocycleToDefaults = useCallback((mesocycleId: string) => {
    setData(prev => ({
      ...prev,
      mesocycles: prev.mesocycles.map(m => {
        if (m.id !== mesocycleId) return m;
        const newWeeklyPlans = m.weeklyPlans.map(w => {
          const base = buildEmptyWeeklyPlan(w.weekNumber, MUSCLE_GROUPS, { goal: m.goal, volumeLandmarks: m.volumeLandmarks });
          return { ...base, isDeload: w.isDeload, dailySchedule: w.dailySchedule, notes: w.notes };
        });
        return { ...m, weeklyPlans: newWeeklyPlans, appliedPreset: 'none', updatedAt: new Date().toISOString() };
      }),
    }));
  }, []);

  /** Alterna la aplicación de una plantilla: si ya está aplicada, la quita (resetea), si no, la aplica */
  const togglePresetOnMesocycle = useCallback((mesocycleId: string, preset: PlanningGoal | 'balanced' | 'none') => {
    const meso = data.mesocycles.find(m => m.id === mesocycleId);
    if (!meso) return undefined;
    if (meso.appliedPreset === preset) {
      resetMesocycleToDefaults(mesocycleId);
      return 'none';
    }
    applyPresetToMesocycle(mesocycleId, preset);
    return preset;
  }, [data, applyPresetToMesocycle, resetMesocycleToDefaults]);

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
   * Escribe en la clave correcta de localStorage y dispara un CustomEvent para
   * que WeeklyPlanner recargue sin necesidad de navegar.
   */
  const syncWeekToRoutinesPlanner = useCallback((weekPlan: WeeklyPlan): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      const plannerData: Record<string, { routines: string[]; blocked: boolean; note: string }> = {};
      let hasScheduled = false;

      DAYS.forEach(day => {
        const ds = weekPlan.dailySchedule?.[day] ?? { routineIds: [], isRest: false };
        const routines = ds.routineIds ?? [];
        const blocked = ds.isRest ?? false;
        plannerData[day] = {
          routines,
          blocked,
          note: ds.notes ?? '',
        };
        if (!blocked && routines.length > 0) hasScheduled = true;
      });

      // Si no hay rutinas programadas, no sincronizamos
      if (!hasScheduled) return false;

      // Clave real que usa WeeklyPlanner via getWeeklyPlan()
      localStorage.setItem('weekly_routine_plan', JSON.stringify(plannerData));
      // Custom event: WeeklyPlanner escucha 'planning:sync' para recargar en la misma ventana
      window.dispatchEvent(new CustomEvent('planning:sync', { detail: plannerData }));
      return true;
    } catch {
      return false;
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
    archiveWeekActualSets,
    // Planes semanales
    updateWeeklyPlan,
    updateMuscleGroupTarget,
    applyLinearProgression,
    updateVolumeLandmarks,
    applyPresetToMesocycle,
    resetMesocycleToDefaults,
    togglePresetOnMesocycle,
    // Agenda diaria
    scheduleRoutineForDay,
    unscheduleRoutineFromDay,
    toggleRestDay,
    syncWeekToRoutinesPlanner,
  };
}

export type UsePlanningReturn = ReturnType<typeof usePlanning>;
