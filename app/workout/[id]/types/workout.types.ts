/**
 * Tipos explícitos para el sistema de Workout
 * Mejora la seguridad de tipos y documentación del código
 */

import type { Exercise, Routine, SetType } from '@/types';

/**
 * Estado de progreso del workout
 */
export interface WorkoutProgress {
  completedSets: Record<string, number>;
  actualReps: Record<string, number[]>;
  actualWeights: Record<string, number[]>;
  setTypes: Record<string, SetType[]>;
}

/**
 * Configuración de descanso
 */
export interface RestConfiguration {
  overrides: Record<string, number>;
  perSetOverrides: Record<string, number[]>;
}

/**
 * Estado del timer de descanso
 */
export interface TimerState {
  show: boolean;
  duration: number;
  title: string;
  nextExerciseName?: string;
  startedAt?: number;
}

/**
 * Estado de UI del workout
 */
export interface WorkoutUIState {
  showPreparation: boolean;
  isExecutingSet: boolean;
  showNotesModal: boolean;
}

/**
 * Datos de una serie completada
 */
export interface CompletedSet {
  reps: number;
  weight: number;
  type: SetType;
  duration?: number;
  pauseDuration?: number;
  restTime?: number;
}

/**
 * Workout guardado en storage
 */
export interface StoredWorkout {
  routineId: string;
  routineName: string;
  currentExerciseIndex: number;
  currentSet: number;
  completedSets: Record<string, number>;
  actualReps: Record<string, number[]>;
  actualWeights: Record<string, number[]>;
  setTypes?: Record<string, SetType[]>;
  isResting?: boolean;
  restTimerDuration?: number;
  restTimerTitle?: string;
  restTimerNextExercise?: string;
  restTimerStartedAt?: number;
}

/**
 * Últimos pesos utilizados por ejercicio
 */
export interface LastWeights {
  [exerciseId: string]: number[];
}

/**
 * Parámetros para calcular descanso
 */
export interface RestCalculationParams {
  currentExercise: Exercise;
  routine: Routine;
  restOverrides: Record<string, number>;
  perSetOverrides: Record<string, number[]>;
  currentSet: number;
  useSmartRest: boolean;
}

/**
 * Parámetros para calcular descanso entre ejercicios
 */
export interface ExerciseRestParams {
  currentExercise: Exercise;
  nextExercise: Exercise;
  routine: Routine;
  restOverrides: Record<string, number>;
  useSmartRest: boolean;
}

/**
 * Parámetros para verificar auto-avance
 */
export interface AutoAdvanceParams {
  completedSets: Record<string, number>;
  actualReps: Record<string, number[]>;
  currentExercise: Exercise;
  routine: Routine;
  currentExerciseIndex: number;
  showTimer: boolean;
  isExecutingSet: boolean;
  showPreparation: boolean;
}

/**
 * Datos de una sesión de entrenamiento
 */
export interface WorkoutSession {
  routineId: string;
  date: Date;
  exercises: SessionExercise[];
  notes: string;
  totalDuration: number;
  totalPausedTime?: number;
}

/**
 * Datos de un ejercicio en una sesión
 */
export interface SessionExercise {
  exerciseId: string;
  exerciseName: string;
  completedSets: number;
  actualReps: number[];
  actualWeight: number[];
  setDurations?: number[];
  pauseDurations?: number[];
  actualRestTimes?: number[];
}

/**
 * Handlers para eventos del workout
 */
export interface WorkoutHandlers {
  onStartSet: () => void;
  onCompleteSet: () => void;
  onEditWeight: (exerciseId: string, setIndex: number, value: number) => void;
  onEditReps: (exerciseId: string, setIndex: number, value: number) => void;
  onEditSetType: (exerciseId: string, setIndex: number, type: SetType) => void;
  onEditRestOverride: (exerciseId: string, value: number) => void;
  onEditSetRestOverride: (exerciseId: string, setIndex: number, value: number) => void;
  onToggleSetComplete: (exerciseId: string, setIndex: number) => void;
  onMoveExercise: (fromIndex: number, toIndex: number) => void;
  onCancelWorkout: () => void;
  onFinishWorkout: () => void;
}

/**
 * Props para componentes de workout
 */
export interface WorkoutComponentProps {
  routine: Routine;
  currentExercise: Exercise;
  currentExerciseIndex: number;
  currentSet: number;
  progress: WorkoutProgress;
  restConfig: RestConfiguration;
  uiState: WorkoutUIState;
  handlers: WorkoutHandlers;
}
