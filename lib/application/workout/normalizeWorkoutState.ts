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
  Object.keys(src as Record<string, unknown>).forEach((k) => {
    const v = (src as Record<string, unknown>)[k];
    out[String(k)] = typeof v === "number" ? v : Number(v ?? 0);
  });
  return out;
}

function normalizeNumberArrayMap(src: unknown): { [key: string]: number[] } {
  const out: { [key: string]: number[] } = {};
  if (typeof src !== "object" || src === null || Array.isArray(src)) return out;
  Object.keys(src as Record<string, unknown>).forEach((k) => {
    const arr = (src as Record<string, unknown>)[k];
    out[String(k)] = Array.isArray(arr) ? arr.map((n) => Number(n ?? 0)) : [];
  });
  return out;
}

function normalizeStringArrayMap(src: unknown): { [key: string]: string[] } {
  const out: { [key: string]: string[] } = {};
  if (typeof src !== "object" || src === null || Array.isArray(src)) return out;
  Object.keys(src as Record<string, unknown>).forEach((k) => {
    const arr = (src as Record<string, unknown>)[k];
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
export function normalizeWorkoutState(data: unknown, routine?: Routine): WorkoutState {
  const obj = data as Record<string, unknown>;
  // ─── completedSets ─────────────────────────────────────────────────────────
  let completedSets: { [key: string]: number } = {};

  if (typeof obj.completedSets === "number") {
    // Dato corrupto: completedSets llegó como número en lugar de objeto
    console.warn("[normalizeWorkoutState] completedSets is a number, resetting to {}");
  } else {
    completedSets = normalizeNumberMap(obj.completedSets);
  }

  // ─── Índices de ejercicio y serie ──────────────────────────────────────────
  let currentExerciseIndex =
    typeof obj.currentExerciseIndex === "string"
      ? parseInt(obj.currentExerciseIndex) || 0
      : Number(obj.currentExerciseIndex ?? 0);

  let currentSet =
    typeof obj.currentSet === "string"
      ? parseInt(obj.currentSet) || 1
      : Number(obj.currentSet ?? 1);

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
    routineId: String(obj.routineId),
    routineName: String(obj.routineName),
    currentExerciseIndex,
    currentSet,
    completedSets,
    actualReps:    normalizeNumberArrayMap(obj.actualReps),
    actualWeights: normalizeNumberArrayMap(obj.actualWeights),
    startedAt: obj.startedAt ? new Date(String(obj.startedAt)) : new Date(),
    modifiedRoutine: (obj.modifiedRoutine as Routine) ?? undefined,
    isResting: Boolean(obj.isResting),
    // Migración: usar restTimerRemaining o fallback a restTimerDuration (campo antiguo)
    restTimerRemaining:    (obj.restTimerRemaining as number) ?? (obj.restTimerDuration as number),
    restTimerStartedAt:    typeof obj.restTimerStartedAt === "number" ? obj.restTimerStartedAt : undefined,
    restTimerTitle:        obj.restTimerTitle as string,
    restTimerNextExercise: obj.restTimerNextExercise as string,
    totalPausedTime:       typeof obj.totalPausedTime === "number" ? obj.totalPausedTime : 0,
    skippedExercises: Array.isArray(obj.skippedExercises) ? obj.skippedExercises as string[] : [],
    setTypes:            normalizeStringArrayMap(obj.setTypes),
    restOverrides:       normalizeNumberMap(obj.restOverrides),
    perSetRestOverrides: normalizeNumberArrayMap(obj.perSetRestOverrides),
  };
}
