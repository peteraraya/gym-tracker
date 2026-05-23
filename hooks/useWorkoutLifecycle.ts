"use client";

/**
 * useWorkoutLifecycle
 *
 * Hook que encapsula toda la lógica de persistencia y ciclo de vida
 * del workout activo:
 *
 *  1. Carga inicial desde storage (con normalización + validación + recovery)
 *  2. Sincronización automática al storage cuando el estado cambia
 *  3. Guardado forzado al poner la app en segundo plano (onPause)
 *  4. Restauración al volver a primer plano (onResume), con protección
 *     contra restauraciones accidentales tras finish/cancel
 *
 * El WorkoutContext usa este hook para delegar toda la infraestructura
 * de persistencia, manteniéndose limpio y enfocado solo en las acciones.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import * as storageService from "@/lib/storage/storage";
import type { ActiveWorkout } from "@/lib/storage/storage";
import { useAppLifecycle } from "@/hooks/useAppLifecycle";
import { WorkoutStateSchema, validateDataWithLogging } from "@/lib/validation";
import { saveQueue } from "@/lib/utils/saveQueue";
import { saveBackup, attemptPartialRecovery } from "@/lib/utils/workoutBackup";
import { normalizeWorkoutState } from "@/lib/workout/normalizeWorkoutState";
import type { WorkoutState } from "@/lib/workout/normalizeWorkoutState";
import logger from "@/lib/logger";

export type { WorkoutState };

// ─── Constantes ───────────────────────────────────────────────────────────────

/** Tiempo máximo (ms) que se considera un finish/cancel "reciente" */
const RECENT_OPERATION_WINDOW_MS = 30_000;

/** Delay antes de restaurar en onResume, para esperar a clearActiveWorkout */
const RESUME_RESTORE_DELAY_MS = 100;

/** Timeout máximo esperando el evento activeWorkout:cleared */
const CLEARED_EVENT_TIMEOUT_MS = 1_500;

// ─── Helpers de marcadores de storage ────────────────────────────────────────

function setFinishMarkers() {
  if (typeof window === "undefined") return;
  const ts = Date.now().toString();
  sessionStorage.setItem("workout_finished", ts);
  localStorage.setItem("workout_finished_persistent", ts);
}

function setCancelMarkers() {
  if (typeof window === "undefined") return;
  const ts = Date.now().toString();
  sessionStorage.setItem("workout_cancelled", ts);
  localStorage.setItem("workout_cancelled_persistent", ts);
}

function emitClearedEvent() {
  if (typeof window === "undefined") return;
  try {
    const ts = Date.now().toString();
    localStorage.setItem("gym-active-workout-cleared", ts);
    window.dispatchEvent(new CustomEvent("activeWorkout:cleared", { detail: ts }));
  } catch (e) {
    logger.warn("[useWorkoutLifecycle] Could not emit cleared event", e);
  }
}

/**
 * Comprueba si una operación (finish o cancel) ocurrió en los últimos
 * `RECENT_OPERATION_WINDOW_MS` ms. Limpia los marcadores si ya expiraron.
 */
function wasRecentOperation(sessionKey: string, persistentKey: string): boolean {
  if (typeof window === "undefined") return false;

  const ts = sessionStorage.getItem(sessionKey) || localStorage.getItem(persistentKey);
  if (!ts) return false;

  const elapsed = Date.now() - parseInt(ts, 10);
  if (elapsed < RECENT_OPERATION_WINDOW_MS) return true;

  // Expirado: limpiar marcadores
  sessionStorage.removeItem(sessionKey);
  localStorage.removeItem(persistentKey);
  return false;
}

function clearOperationMarkers(sessionKey: string, persistentKey: string) {
  sessionStorage.removeItem(sessionKey);
  localStorage.removeItem(persistentKey);
}

// ─── Lógica de restauración en resume ────────────────────────────────────────

/**
 * Espera a que se emita el evento `activeWorkout:cleared` o hasta un timeout.
 * Garantiza que si otra pestaña/ventana está limpiando el storage, esperamos.
 */
async function waitForClearedEvent(): Promise<void> {
  if (typeof window === "undefined") return;
  return new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      window.removeEventListener("activeWorkout:cleared", onCleared);
      window.removeEventListener("storage", onStorage);
      resolve();
    };
    const onCleared = () => done();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "gym-active-workout-cleared") done();
    };
    window.addEventListener("activeWorkout:cleared", onCleared);
    window.addEventListener("storage", onStorage);
    setTimeout(done, CLEARED_EVENT_TIMEOUT_MS);
  });
}

/**
 * Intenta restaurar el workout desde storage aplicando normalización,
 * validación y recovery parcial si es necesario.
 *
 * @returns El `WorkoutState` restaurado, o `null` si no hay nada que restaurar.
 */
async function tryRestoreWorkout(context: string): Promise<WorkoutState | null> {
  const stored = await storageService.getActiveWorkout();
  if (!stored) return null;

  try {
    const normalized = normalizeWorkoutState(stored);
    const result = validateDataWithLogging(WorkoutStateSchema, normalized, context);

    if (result.success && result.data) return normalized;

    // Validación fallida: intentar recovery parcial
    saveBackup(stored, "validation_failed_" + context);
    const recovered = attemptPartialRecovery(stored);
    if (recovered) {
      logger.warn(`[useWorkoutLifecycle] Partial recovery successful (${context})`);
      return recovered;
    }

    logger.error(`[useWorkoutLifecycle] Invalid state after normalization (${context}), clearing`);
    await storageService.clearActiveWorkout();
    return null;
  } catch (err) {
    saveBackup(stored, "normalization_error_" + context);
    const recovered = attemptPartialRecovery(stored);
    if (recovered) {
      logger.warn(`[useWorkoutLifecycle] Recovery after normalization error (${context})`);
      return recovered;
    }
    logger.error(`[useWorkoutLifecycle] Fatal normalization error (${context}):`, err);
    await storageService.clearActiveWorkout();
    return null;
  }
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export interface WorkoutLifecycleResult {
  activeWorkout: WorkoutState | null;
  setActiveWorkout: React.Dispatch<React.SetStateAction<WorkoutState | null>>;
  isLoadingActiveWorkout: boolean;
  activeWorkoutRef: React.RefObject<WorkoutState | null>;
  /** Llama a esto antes de limpiar el estado al finalizar el workout */
  markFinished: () => void;
  /** Llama a esto antes de limpiar el estado al cancelar el workout */
  markCancelled: () => void;
}

export function useWorkoutLifecycle(): WorkoutLifecycleResult {
  const [activeWorkout, setActiveWorkout] = useState<WorkoutState | null>(null);
  const [isLoadingActiveWorkout, setIsLoadingActiveWorkout] = useState(true);
  const activeWorkoutRef = useRef<WorkoutState | null>(null);

  // ─── Mantener ref sincronizada con el estado ───────────────────────────────
  useEffect(() => {
    activeWorkoutRef.current = activeWorkout;
  }, [activeWorkout]);

  // ─── Carga inicial desde storage ──────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const restored = await tryRestoreWorkout("initial_load");
        if (mounted && restored) setActiveWorkout(restored);
      } catch (e) {
        logger.error("[useWorkoutLifecycle] Error loading active workout:", e);
      } finally {
        if (mounted) setIsLoadingActiveWorkout(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ─── Persistencia automática al storage ───────────────────────────────────
  useEffect(() => {
    if (isLoadingActiveWorkout || !activeWorkout) return;
    saveQueue.save(activeWorkout as unknown as ActiveWorkout).catch((e) => {
      logger.error("[useWorkoutLifecycle] Error saving active workout:", e);
    });
  }, [activeWorkout, isLoadingActiveWorkout]);

  // ─── Ciclo de vida: onPause / onResume ────────────────────────────────────
  useAppLifecycle({
    onPause: useCallback(() => {
      const current = activeWorkoutRef.current;
      if (!current) return;
      logger.debug("[useWorkoutLifecycle] App paused, persisting workout…");
      saveQueue
        .save(current as unknown as ActiveWorkout)
        .then(() => logger.debug("[useWorkoutLifecycle] Workout persisted on pause"))
        .catch((e) => logger.error("[useWorkoutLifecycle] Error persisting on pause:", e));
    }, []),

    onResume: useCallback(() => {
      logger.debug("[useWorkoutLifecycle] App resumed, checking workout state…");

      setTimeout(async () => {
        try {
          // Esperar a posibles operaciones de limpieza en otras pestañas
          await waitForClearedEvent();

          // Si fue cancelado o finalizado recientemente, no restaurar
          if (wasRecentOperation("workout_cancelled", "workout_cancelled_persistent")) {
            logger.log("[useWorkoutLifecycle] Skipping restore: recent cancel");
            clearOperationMarkers("workout_cancelled", "workout_cancelled_persistent");
            return;
          }
          if (wasRecentOperation("workout_finished", "workout_finished_persistent")) {
            logger.log("[useWorkoutLifecycle] Skipping restore: recent finish");
            clearOperationMarkers("workout_finished", "workout_finished_persistent");
            return;
          }

          // Solo restaurar si no hay workout en memoria
          if (activeWorkoutRef.current) return;

          const restored = await tryRestoreWorkout("on_resume");
          if (restored) {
            setActiveWorkout(restored);
            activeWorkoutRef.current = restored;
          }
        } catch (e) {
          logger.error("[useWorkoutLifecycle] Error restoring on resume:", e);
        }
      }, RESUME_RESTORE_DELAY_MS);
    }, []),
  });

  return {
    activeWorkout,
    setActiveWorkout,
    isLoadingActiveWorkout,
    activeWorkoutRef,
    markFinished:  () => { setFinishMarkers();  emitClearedEvent(); },
    markCancelled: () => { setCancelMarkers(); emitClearedEvent(); },
  };
}
