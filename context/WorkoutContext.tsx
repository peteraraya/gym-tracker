"use client";

/**
 * WorkoutContext
 *
 * Gestiona el estado del workout activo y expone las acciones
 * que puede ejecutar el usuario durante un entrenamiento.
 *
 * La persistencia y el ciclo de vida (storage, onPause/onResume) están
 * delegados a `hooks/useWorkoutLifecycle.ts`, lo que mantiene este
 * contexto enfocado exclusivamente en la lógica de negocio.
 *
 * Árbol de dependencias:
 *   WorkoutContext
 *     └── useWorkoutLifecycle   (persistencia + ciclo de vida)
 *           └── normalizeWorkoutState  (normalización de datos crudos)
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import type { Routine } from "@/types";
import { useWorkoutLifecycle } from "@/hooks/useWorkoutLifecycle";
import type { WorkoutState } from "@/lib/workout/normalizeWorkoutState";
import * as storageService from "@/lib/storage/storage";
import logger from "@/lib/logger";
import { saveQueue } from "@/lib/utils/saveQueue";

export type { WorkoutState };

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface WorkoutContextType {
  activeWorkout: WorkoutState | null;
  isWorkoutActive: boolean;
  startWorkout: (routine: Routine) => void;
  updateWorkoutProgress: (
    exerciseIndex: number,
    set: number,
    completedSets: { [key: string]: number },
    actualReps: { [key: string]: number[] },
    actualWeights: { [key: string]: number[] },
    restState?: {
      isResting?: boolean;
      restTimerDuration?: number;
      restTimerTitle?: string;
      restTimerNextExercise?: string;
      restTimerStartedAt?: number;
    },
    totalPausedTime?: number,
    additionalData?: {
      setTypes?: { [key: string]: string[] };
      restOverrides?: { [key: string]: number };
      perSetRestOverrides?: { [key: string]: number[] };
      skippedExercises?: string[];
    },
  ) => void;
  updateModifiedRoutine: (routine: Routine) => Promise<void>;
  clearRestState: () => void;
  finishWorkout: () => Promise<void>;
  cancelWorkout: () => Promise<void>;
  skipExercise: (exerciseId: string) => void;
  unskipExercise: (exerciseId: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const {
    activeWorkout,
    setActiveWorkout,
    activeWorkoutRef,
    markFinished,
    markCancelled,
  } = useWorkoutLifecycle();

  // ─── Acciones ──────────────────────────────────────────────────────────────

  const startWorkout = useCallback((routine: Routine) => {
    const newWorkout: WorkoutState = {
      routineId: routine.id,
      routineName: routine.name,
      currentExerciseIndex: 0,
      currentSet: 1,
      completedSets: {},
      actualReps: {},
      actualWeights: {},
      startedAt: new Date(),
    };
    setActiveWorkout(newWorkout);
    // Señal para que la workout page muestre el splash de inicio (válida 8s)
    try { sessionStorage.setItem('workout_splash_ts', Date.now().toString()); } catch {}
  }, [setActiveWorkout]);

  const updateWorkoutProgress = useCallback(
    (
      exerciseIndex: number,
      set: number,
      completedSets: { [key: string]: number },
      actualReps: { [key: string]: number[] },
      actualWeights: { [key: string]: number[] },
      restState?: {
        isResting?: boolean;
        restTimerDuration?: number;
        restTimerTitle?: string;
        restTimerNextExercise?: string;
        restTimerStartedAt?: number;
      },
      totalPausedTime?: number,
      additionalData?: {
        setTypes?: { [key: string]: string[] };
        restOverrides?: { [key: string]: number };
        perSetRestOverrides?: { [key: string]: number[] };
        skippedExercises?: string[];
      },
    ) => {
      logger.debug("[WorkoutContext] updateWorkoutProgress", { exerciseIndex, set, restState, additionalData });
        setActiveWorkout((prev) => {
          if (!prev) return null;
          const newActive: WorkoutState = {
            ...prev,
            currentExerciseIndex: exerciseIndex,
            currentSet: set,
            completedSets,
            actualReps,
            actualWeights,
            isResting: restState?.isResting ?? false,
            restTimerRemaining: restState?.restTimerDuration,
            restTimerStartedAt: restState?.isResting
              ? (restState?.restTimerStartedAt ?? Date.now())
              : undefined,
            restTimerTitle: restState?.restTimerTitle,
            restTimerNextExercise: restState?.restTimerNextExercise,
            totalPausedTime: totalPausedTime ?? prev.totalPausedTime ?? 0,
            setTypes:            additionalData?.setTypes            ?? prev.setTypes,
            restOverrides:       additionalData?.restOverrides       ?? prev.restOverrides,
            perSetRestOverrides: additionalData?.perSetRestOverrides ?? prev.perSetRestOverrides,
            skippedExercises:    additionalData?.skippedExercises    ?? prev.skippedExercises,
          };

          // Guardar inmediatamente usando la cola para reducir la ventana de pérdida
        try {
          queueMicrotask(() => {
            saveQueue
              .save(newActive as unknown as import('@/lib/storage/storage').ActiveWorkout)
              .catch((err) => {
                logger.error('[WorkoutContext] immediate save failed', err instanceof Error ? err : undefined);
                try {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('gym:activeWorkout:save-failed', { detail: { context: 'updateWorkoutProgress', error: (err && (err as any).message) ? (err as any).message : String(err) } }));
                  }
                } catch (e) {}
              });
          });
        } catch (e) {
          logger.error('[WorkoutContext] Failed scheduling immediate save', e instanceof Error ? e : undefined);
        }

          return newActive;
        });
    },
    [setActiveWorkout],
  );

  const clearRestState = useCallback(() => {
    setActiveWorkout((prev) =>
      prev
        ? { ...prev, isResting: false, restTimerRemaining: undefined, restTimerTitle: undefined, restTimerNextExercise: undefined }
        : null,
    );
  }, [setActiveWorkout]);

  const updateModifiedRoutine = useCallback(async (routine: Routine) => {
    logger.log("[WorkoutContext] updateModifiedRoutine", routine.id);

    // Guardar la rutina modificada en Supabase inmediatamente para que
    // sobreviva a recargas (F5). Importación dinámica para evitar ciclos.
    try {
      const { updateRoutine } = await import("@/lib/storage/storage");
      await updateRoutine(routine.id, {
        name: routine.name,
        description: routine.description,
        image: routine.image,
        exercises: routine.exercises.map((ex) => ({
          id: ex.id,
          name: ex.name,
          sets: ex.sets.map((set) => ({
            reps: set.reps,
            weight: set.weight || 0,
            type: set.type,
            notes: set.notes,
          })),
          notes: ex.notes,
          equipment: ex.equipment,
          technique: ex.technique,
          recommendedSets: ex.recommendedSets,
          recommendedReps: ex.recommendedReps,
          restTime: ex.restTime,
          restBetweenSets: ex.restBetweenSets,
          useSmartRest: ex.useSmartRest,
        })),
        restBetweenSets: routine.restBetweenSets,
        restBetweenExercises: routine.restBetweenExercises,
      });
      setActiveWorkout((prev) => (prev ? { ...prev, modifiedRoutine: routine } : null));
    } catch (error) {
      logger.error("[WorkoutContext] Error saving modified routine:", error);
      throw new Error("No se pudo guardar la rutina modificada");
    }
  }, [setActiveWorkout]);

  const finishWorkout = useCallback(async () => {
    logger.log("[WorkoutContext] finishWorkout");
    markFinished();
    activeWorkoutRef.current = null;
    setActiveWorkout(null);
    try {
      await storageService.clearActiveWorkout();
    } catch (e) {
      logger.error("[WorkoutContext] Error clearing on finish:", e);
    }
  }, [markFinished, setActiveWorkout, activeWorkoutRef]);

  const cancelWorkout = useCallback(async () => {
    logger.log("[WorkoutContext] cancelWorkout");
    markCancelled();
    activeWorkoutRef.current = null;
    setActiveWorkout(null);
    try {
      await storageService.clearActiveWorkout();
    } catch (e) {
      logger.error("[WorkoutContext] Error clearing on cancel:", e);
    }
  }, [markCancelled, setActiveWorkout, activeWorkoutRef]);

  const skipExercise = useCallback((exerciseId: string) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const skipped = prev.skippedExercises || [];
      if (skipped.includes(exerciseId)) return prev;
      return { ...prev, skippedExercises: [...skipped, exerciseId] };
    });
  }, [setActiveWorkout]);

  const unskipExercise = useCallback((exerciseId: string) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      return { ...prev, skippedExercises: (prev.skippedExercises || []).filter((id) => id !== exerciseId) };
    });
  }, [setActiveWorkout]);

  // ─── Valor del contexto ────────────────────────────────────────────────────

  const value = useMemo(
    () => ({
      activeWorkout,
      isWorkoutActive: activeWorkout !== null,
      startWorkout,
      updateWorkoutProgress,
      updateModifiedRoutine,
      clearRestState,
      finishWorkout,
      cancelWorkout,
      skipExercise,
      unskipExercise,
    }),
    [
      activeWorkout,
      startWorkout,
      updateWorkoutProgress,
      updateModifiedRoutine,
      clearRestState,
      finishWorkout,
      cancelWorkout,
      skipExercise,
      unskipExercise,
    ],
  );

  return (
    <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>
  );
}

// ─── Hook de consumo ──────────────────────────────────────────────────────────

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
}


