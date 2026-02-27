import { useReducer, useMemo } from 'react';
import type { Routine, Exercise, SetType } from '@/types';

// Tipos
interface WorkoutState {
  routine: Routine | null;
  navigation: {
    currentExerciseIndex: number;
    currentSet: number;
  };
  timer: {
    show: boolean;
    duration: number;
    title: string;
    nextExerciseName?: string;
  };
  progress: {
    completedSets: Record<string, number>;
    actualReps: Record<string, number[]>;
    actualWeights: Record<string, number[]>;
    setTypes: Record<string, SetType[]>;
  };
  rest: {
    overrides: Record<string, number>;
    perSetOverrides: Record<string, number[]>;
  };
  ui: {
    showPreparation: boolean;
    isExecutingSet: boolean;
    showNotesModal: boolean;
  };
  dragDrop: {
    draggedIndex: number | null;
    dragOverIndex: number | null;
  };
  workoutStartTime: number;
  proposedDuration: number;
  sessionNotes: string;
  lastWeights: Record<string, number[]>;
  useSmartRest: boolean;
}

type WorkoutAction =
  | { type: 'SET_ROUTINE'; payload: Routine }
  | { type: 'RESTORE_STATE'; payload: Partial<WorkoutState> }
  | { type: 'NAVIGATE_TO_EXERCISE'; payload: number }
  | { type: 'NAVIGATE_TO_SET'; payload: number }
  | { type: 'START_TIMER'; payload: { duration: number; title: string; nextExerciseName?: string } }
  | { type: 'STOP_TIMER' }
  | { type: 'COMPLETE_SET'; payload: { exerciseId: string; setIndex: number; reps: number; weight: number } }
  | { type: 'UPDATE_WEIGHT'; payload: { exerciseId: string; setIndex: number; weight: number } }
  | { type: 'UPDATE_REPS'; payload: { exerciseId: string; setIndex: number; reps: number } }
  | { type: 'UPDATE_SET_TYPE'; payload: { exerciseId: string; setIndex: number; setType: SetType } }
  | { type: 'TOGGLE_SET_COMPLETE'; payload: { exerciseId: string; setIndex: number } }
  | { type: 'START_PREPARATION' }
  | { type: 'START_EXECUTING' }
  | { type: 'STOP_EXECUTING' }
  | { type: 'SHOW_NOTES_MODAL'; payload: number }
  | { type: 'HIDE_NOTES_MODAL' }
  | { type: 'SET_SESSION_NOTES'; payload: string }
  | { type: 'MOVE_EXERCISE'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'SET_DRAG_STATE'; payload: { draggedIndex: number | null; dragOverIndex: number | null } }
  | { type: 'SET_REST_OVERRIDE'; payload: { exerciseId: string; value: number } }
  | { type: 'SET_PER_SET_REST_OVERRIDE'; payload: { exerciseId: string; setIndex: number; value: number } }
  | { type: 'TOGGLE_SMART_REST' }
  | { type: 'ADD_SET_TO_EXERCISE'; payload: { exerciseIndex: number } };

// Estado inicial
const initialState: WorkoutState = {
  routine: null,
  navigation: {
    currentExerciseIndex: 0,
    currentSet: 1,
  },
  timer: {
    show: false,
    duration: 0,
    title: '',
  },
  progress: {
    completedSets: {},
    actualReps: {},
    actualWeights: {},
    setTypes: {},
  },
  rest: {
    overrides: {},
    perSetOverrides: {},
  },
  ui: {
    showPreparation: false,
    isExecutingSet: false,
    showNotesModal: false,
  },
  dragDrop: {
    draggedIndex: null,
    dragOverIndex: null,
  },
  workoutStartTime: Date.now(),
  proposedDuration: 0,
  sessionNotes: '',
  lastWeights: {},
  useSmartRest: true,
};
