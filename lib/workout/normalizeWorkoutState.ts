/**
 * Normalización del estado del workout activo.
 *
 * Esta función transforma los datos crudos de storage (que pueden estar
 * corruptos, incompletos o con tipos incorrectos) en un `WorkoutState`
 * válido y tipado.
 *
 * Es una función PURA — sin efectos secundarios ni dependencias de React.
 * Se puede usar tanto en el contexto como en helpers de recovery.
 */

import type { Routine } from "@/types";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface WorkoutState {
  routineId: string;
  routineName: string;
  currentExerciseIndex: number;
  currentSet: number;
  completedSets: { [key: string]: number };
  actualReps: { [key: string]: number[] };
  actualWeights: { [key: string]: number[] };
  startedAt: Date;
  /** Rutina modificada durante el entrenamiento (series agregadas/eliminadas) */
  modifiedRoutine?: Routine;
  /** Estado del timer de descanso para persistencia entre recargas */
  isResting?: boolean;
  /** Tiempo restante en segundos (snapshot al guardar) */
  restTimerRemaining?: number;
  /** Timestamp (ms) cuando se guardó el tiempo restante */
  restTimerStartedAt?: number;
  restTimerTitle?: string;
  restTimerNextExercise?: string;
  /** Tiempo total pausado en el entrenamiento (en milisegundos) */
  totalPausedTime?: number;
  /** IDs de ejercicios omitidos en esta sesión (no eliminados) */
  skippedExercises?: string[];
  setTypes?: { [key: string]: string[] };
  restOverrides?: { [key: string]: number };
  perSetRestOverrides?: { [key: string]: number[] };
}

// ─── Helpers de normalización de arrays tipados ───────────────────────────────

function normalizeNumberMap(src: unknown): { [key: string]: number } {
  const out: { [key: string]: number } = {};
  if (typeof src !== "object" || src === null || Array.isArray(src)) return out;
  Object.keys(src as object).forEach((k) => {
    const v = (src as any)[k];
    out[String(k)] = typeof v === "number" ? v : Number(v ?? 0);
  });
  return out;
}

function normalizeNumberArrayMap(src: unknown): { [key: string]: number[] } {
  const out: { [key: string]: number[] } = {};
  if (typeof src !== "object" || src === null || Array.isArray(src)) return out;
  Object.keys(src as object).forEach((k) => {
    const arr = (src as any)[k];
    out[String(k)] = Array.isArray(arr) ? arr.map((n) => Number(n ?? 0)) : [];
  });
  return out;
}

function normalizeStringArrayMap(src: unknown): { [key: string]: string[] } {
  const out: { [key: string]: string[] } = {};
  if (typeof src !== "object" || src === null || Array.isArray(src)) return out;
  Object.keys(src as object).forEach((k) => {
    const arr = (src as any)[k];
    out[String(k)] = Array.isArray(arr) ? arr.map((s) => String(s ?? "")) : [];
  });
  return out;
}

// ─── Función principal ────────────────────────────────────────────────────────

/**
 * Transforma datos crudos de storage en un `WorkoutState` válido.
 *
 * Maneja casos de datos corruptos:
 * - `completedSets` como número en lugar de objeto
 * - Índices de ejercicio/serie fuera de rango
 * - Campos de timer faltantes
 *
 * @param data   - Datos crudos del storage (tipo `any`)
 * @param routine - Rutina activa para validar rangos de índices (opcional)
 */
export function normalizeWorkoutState(data: any, routine?: Routine): WorkoutState {
  // ─── completedSets ─────────────────────────────────────────────────────────
  let completedSets: { [key: string]: number } = {};

  if (typeof data.completedSets === "number") {
    // Dato corrupto: completedSets llegó como número en lugar de objeto
    console.warn("[normalizeWorkoutState] completedSets is a number, resetting to {}");
  } else {
    completedSets = normalizeNumberMap(data.completedSets);
  }

  // ─── Índices de ejercicio y serie ──────────────────────────────────────────
  let currentExerciseIndex =
    typeof data.currentExerciseIndex === "string"
      ? parseInt(data.currentExerciseIndex) || 0
      : Number(data.currentExerciseIndex ?? 0);

  let currentSet =
    typeof data.currentSet === "string"
      ? parseInt(data.currentSet) || 1
      : Number(data.currentSet ?? 1);

  // Validar rangos contra la rutina si está disponible
  if (routine?.exercises) {
    currentExerciseIndex = Math.max(
      0,
      Math.min(currentExerciseIndex, routine.exercises.length - 1),
    );
    const currentExercise = routine.exercises[currentExerciseIndex];
    if (currentExercise?.sets) {
      currentSet = Math.max(1, Math.min(currentSet, currentExercise.sets.length));
    }
  }

  // ─── Resultado normalizado ─────────────────────────────────────────────────
  return {
    routineId: String(data.routineId),
    routineName: String(data.routineName),
    currentExerciseIndex,
    currentSet,
    completedSets,
    actualReps:    normalizeNumberArrayMap(data.actualReps),
    actualWeights: normalizeNumberArrayMap(data.actualWeights),
    startedAt: data.startedAt ? new Date(data.startedAt) : new Date(),
    modifiedRoutine: data.modifiedRoutine ?? undefined,
    isResting: data.isResting ?? false,
    // Migración: usar restTimerRemaining o fallback a restTimerDuration (campo antiguo)
    restTimerRemaining:    data.restTimerRemaining ?? data.restTimerDuration,
    restTimerStartedAt:    typeof data.restTimerStartedAt === "number" ? data.restTimerStartedAt : undefined,
    restTimerTitle:        data.restTimerTitle,
    restTimerNextExercise: data.restTimerNextExercise,
    totalPausedTime:       typeof data.totalPausedTime === "number" ? data.totalPausedTime : 0,
    skippedExercises: Array.isArray(data.skippedExercises) ? data.skippedExercises : [],
    setTypes:            normalizeStringArrayMap(data.setTypes),
    restOverrides:       normalizeNumberMap(data.restOverrides),
    perSetRestOverrides: normalizeNumberArrayMap(data.perSetRestOverrides),
  };
}
