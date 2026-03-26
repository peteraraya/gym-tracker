# Ejemplo de Código Refactorizado - WorkoutPage

Este documento muestra cómo se vería el código después de aplicar las refactorizaciones recomendadas.

---

## 📁 Nueva Estructura de Archivos

```
app/workout/[id]/
├── page.tsx                          # 150 líneas - Orquestador principal
├── components/
│   ├── WorkoutHeader.tsx             # Header con progreso y timer
│   ├── ExerciseCard.tsx              # Card del ejercicio actual
│   ├── SetsList.tsx                  # Lista de series
│   ├── RestConfiguration.tsx         # Config de descanso
│   ├── ExercisesList.tsx             # Lista acordeón
│   └── WorkoutActions.tsx            # Botones de acción
├── hooks/
│   ├── useWorkoutState.ts            # Estado con reducer
│   ├── useWorkoutInitialization.ts   # Inicialización
│   ├── useAutoAdvance.ts             # Auto-avance
│   └── useExerciseDragDrop.ts        # Drag & drop
└── utils/
    ├── workoutCalculations.ts        # Cálculos puros
    └── workoutHelpers.ts             # Helpers
```

---

## 1️⃣ Componente Principal Refactorizado

### `app/workout/[id]/page.tsx` (150 líneas vs 1596 originales)

```typescript
'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Timer } from '@/components/Timer';
import { WorkoutHeader } from './components/WorkoutHeader';
import { ExerciseCard } from './components/ExerciseCard';
import { ExercisesList } from './components/ExercisesList';
import { WorkoutActions } from './components/WorkoutActions';
import { WorkoutNotesModal } from './components/WorkoutNotesModal';
import { useWorkoutState } from './hooks/useWorkoutState';
import { useWorkoutInitialization } from './hooks/useWorkoutInitialization';
import { useAutoAdvance } from './hooks/useAutoAdvance';
import { Card, CardContent } from '@/components/ui/Card';

export default function WorkoutPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  // Estado centralizado con reducer
  const { state, actions } = useWorkoutState();
  
  // Inicialización del workout
  const { isLoading, error: initError } = useWorkoutInitialization(id, actions);
  
  // Auto-avance entre ejercicios
  useAutoAdvance({
    currentExercise: state.currentExercise,
    routine: state.routine,
    completedSets: state.progress.completedSets,
    actualReps: state.progress.actualReps,
    showTimer: state.timer.show,
    isExecutingSet: state.ui.isExecutingSet,
    showPreparation: state.ui.showPreparation,
    onAdvance: actions.advanceToNextExercise,
    onFinish: actions.showFinishModal
  });
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              Cargando entrenamiento...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Error state
  if (initError || !state.routine) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">
              {initError || 'No se pudo cargar la rutina'}
            </p>
            <button onClick={() => router.push('/routines')}>
              Volver a rutinas
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Timer fullscreen
  if (state.timer.show) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Timer
              duration={state.timer.duration}
              onComplete={actions.handleTimerComplete}
              autoStart={true}
              title={state.timer.title}
              nextExerciseName={state.timer.nextExerciseName}
              showMotivation={true}
              onActualDurationChange={actions.recordRestDuration}
            />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header con progreso y timer global */}
          <WorkoutHeader
            routine={state.routine}
            currentExerciseIndex={state.navigation.currentExerciseIndex}
            currentSet={state.navigation.currentSet}
            workoutStartTime={state.workoutStartTime}
          />
          
          {/* Card del ejercicio actual */}
          <ExerciseCard
            exercise={state.currentExercise}
            currentSet={state.navigation.currentSet}
            completedSets={state.progress.completedSets}
            actualReps={state.progress.actualReps}
            actualWeights={state.progress.actualWeights}
            setTypes={state.progress.setTypes}
            showPreparation={state.ui.showPreparation}
            isExecutingSet={state.ui.isExecutingSet}
            onStartSet={actions.startSet}
            onCompleteSet={actions.completeSet}
            onUpdateWeight={actions.updateWeight}
            onUpdateReps={actions.updateReps}
            onUpdateSetType={actions.updateSetType}
            onToggleSetComplete={actions.toggleSetComplete}
          />
          
          {/* Botones de acción */}
          <WorkoutActions
            onCancel={actions.cancelWorkout}
            onFinish={actions.showFinishModal}
          />
          
          {/* Lista de todos los ejercicios */}
          <ExercisesList
            exercises={state.routine.exercises}
            currentExerciseIndex={state.navigation.currentExerciseIndex}
            completedSets={state.progress.completedSets}
            actualReps={state.progress.actualReps}
            actualWeights={state.progress.actualWeights}
            onNavigateToExercise={actions.navigateToExercise}
            onMoveExercise={actions.moveExercise}
          />
        </div>
        
        {/* Modal de notas al finalizar */}
        <WorkoutNotesModal
          isOpen={state.ui.showNotesModal}
          proposedDuration={state.proposedDuration}
          onClose={() => actions.setShowNotesModal(false)}
          onSave={actions.finishWorkout}
        />
      </div>
    </ProtectedRoute>
  );
}
```

---

## 2️⃣ Estado con Reducer

### `hooks/useWorkoutState.ts`

```typescript
import { useReducer, useMemo } from 'react';
import type { Routine, Exercise } from '@/types';

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
}

type WorkoutAction =
  | { type: 'SET_ROUTINE'; payload: Routine }
  | { type: 'NAVIGATE_TO_EXERCISE'; payload: number }
  | { type: 'NAVIGATE_TO_SET'; payload: number }
  | { type: 'START_TIMER'; payload: { duration: number; title: string; nextExerciseName?: string } }
  | { type: 'STOP_TIMER' }
  | { type: 'COMPLETE_SET'; payload: { exerciseId: string; setIndex: number; reps: number; weight: number } }
  | { type: 'UPDATE_WEIGHT'; payload: { exerciseId: string; setIndex: number; weight: number } }
  | { type: 'UPDATE_REPS'; payload: { exerciseId: string; setIndex: number; reps: number } }
  | { type: 'TOGGLE_SET_COMPLETE'; payload: { exerciseId: string; setIndex: number; isComplete: boolean } }
  | { type: 'START_PREPARATION' }
  | { type: 'START_EXECUTING' }
  | { type: 'STOP_EXECUTING' }
  | { type: 'SHOW_NOTES_MODAL'; payload: number }
  | { type: 'HIDE_NOTES_MODAL' }
  | { type: 'SET_SESSION_NOTES'; payload: string }
  | { type: 'MOVE_EXERCISE'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'SET_DRAG_STATE'; payload: { draggedIndex: number | null; dragOverIndex: number | null } };

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
};

// Reducer
function workoutReducer(state: WorkoutState, action: WorkoutAction): WorkoutState {
  switch (action.type) {
    case 'SET_ROUTINE':
      return { ...state, routine: action.payload };
      
    case 'NAVIGATE_TO_EXERCISE':
      return {
        ...state,
        navigation: {
          currentExerciseIndex: action.payload,
          currentSet: 1,
        },
        ui: {
          ...state.ui,
          showPreparation: false,
          isExecutingSet: false,
        },
      };
      
    case 'NAVIGATE_TO_SET':
      return {
        ...state,
        navigation: {
          ...state.navigation,
          currentSet: action.payload,
        },
      };
      
    case 'START_TIMER':
      return {
        ...state,
        timer: {
          show: true,
          duration: action.payload.duration,
          title: action.payload.title,
          nextExerciseName: action.payload.nextExerciseName,
        },
      };
      
    case 'STOP_TIMER':
      return {
        ...state,
        timer: {
          ...state.timer,
          show: false,
        },
      };
      
    case 'COMPLETE_SET': {
      const { exerciseId, setIndex, reps, weight } = action.payload;
      return {
        ...state,
        progress: {
          ...state.progress,
          completedSets: {
            ...state.progress.completedSets,
            [exerciseId]: (state.progress.completedSets[exerciseId] || 0) + 1,
          },
          actualReps: {
            ...state.progress.actualReps,
            [exerciseId]: [
              ...(state.progress.actualReps[exerciseId] || []).slice(0, setIndex),
              reps,
              ...(state.progress.actualReps[exerciseId] || []).slice(setIndex + 1),
            ],
          },
          actualWeights: {
            ...state.progress.actualWeights,
            [exerciseId]: [
              ...(state.progress.actualWeights[exerciseId] || []).slice(0, setIndex),
              weight,
              ...(state.progress.actualWeights[exerciseId] || []).slice(setIndex + 1),
            ],
          },
        },
      };
    }
    
    case 'UPDATE_WEIGHT': {
      const { exerciseId, setIndex, weight } = action.payload;
      return {
        ...state,
        progress: {
          ...state.progress,
          actualWeights: {
            ...state.progress.actualWeights,
            [exerciseId]: [
              ...(state.progress.actualWeights[exerciseId] || []).slice(0, setIndex),
              weight,
              ...(state.progress.actualWeights[exerciseId] || []).slice(setIndex + 1),
            ],
          },
        },
      };
    }
    
    case 'MOVE_EXERCISE': {
      if (!state.routine) return state;
      const { fromIndex, toIndex } = action.payload;
      const newExercises = [...state.routine.exercises];
      const [movedExercise] = newExercises.splice(fromIndex, 1);
      newExercises.splice(toIndex, 0, movedExercise);
      
      // Ajustar índice actual si es necesario
      let newCurrentIndex = state.navigation.currentExerciseIndex;
      if (state.navigation.currentExerciseIndex === fromIndex) {
        newCurrentIndex = toIndex;
      } else if (fromIndex < state.navigation.currentExerciseIndex && toIndex >= state.navigation.currentExerciseIndex) {
        newCurrentIndex = state.navigation.currentExerciseIndex - 1;
      } else if (fromIndex > state.navigation.currentExerciseIndex && toIndex <= state.navigation.currentExerciseIndex) {
        newCurrentIndex = state.navigation.currentExerciseIndex + 1;
      }
      
      return {
        ...state,
        routine: {
          ...state.routine,
          exercises: newExercises,
        },
        navigation: {
          ...state.navigation,
          currentExerciseIndex: newCurrentIndex,
        },
      };
    }
    
    case 'START_PREPARATION':
      return {
        ...state,
        ui: { ...state.ui, showPreparation: true },
      };
      
    case 'START_EXECUTING':
      return {
        ...state,
        ui: { ...state.ui, showPreparation: false, isExecutingSet: true },
      };
      
    case 'STOP_EXECUTING':
      return {
        ...state,
        ui: { ...state.ui, isExecutingSet: false },
      };
      
    case 'SHOW_NOTES_MODAL':
      return {
        ...state,
        ui: { ...state.ui, showNotesModal: true },
        proposedDuration: action.payload,
      };
      
    case 'HIDE_NOTES_MODAL':
      return {
        ...state,
        ui: { ...state.ui, showNotesModal: false },
      };
      
    case 'SET_SESSION_NOTES':
      return {
        ...state,
        sessionNotes: action.payload,
      };
      
    case 'SET_DRAG_STATE':
      return {
        ...state,
        dragDrop: action.payload,
      };
    
    default:
      return state;
  }
}

// Hook principal
export function useWorkoutState() {
  const [state, dispatch] = useReducer(workoutReducer, initialState);
  
  // Ejercicio actual (memoizado)
  const currentExercise = useMemo(() => {
    if (!state.routine || !state.routine.exercises) return null;
    return state.routine.exercises[state.navigation.currentExerciseIndex] || null;
  }, [state.routine, state.navigation.currentExerciseIndex]);
  
  // Actions
  const actions = useMemo(() => ({
    setRoutine: (routine: Routine) => 
      dispatch({ type: 'SET_ROUTINE', payload: routine }),
      
    navigateToExercise: (index: number) => 
      dispatch({ type: 'NAVIGATE_TO_EXERCISE', payload: index }),
      
    navigateToSet: (set: number) => 
      dispatch({ type: 'NAVIGATE_TO_SET', payload: set }),
      
    startTimer: (duration: number, title: string, nextExerciseName?: string) => 
      dispatch({ type: 'START_TIMER', payload: { duration, title, nextExerciseName } }),
      
    stopTimer: () => 
      dispatch({ type: 'STOP_TIMER' }),
      
    completeSet: (exerciseId: string, setIndex: number, reps: number, weight: number) => 
      dispatch({ type: 'COMPLETE_SET', payload: { exerciseId, setIndex, reps, weight } }),
      
    updateWeight: (exerciseId: string, setIndex: number, weight: number) => 
      dispatch({ type: 'UPDATE_WEIGHT', payload: { exerciseId, setIndex, weight } }),
      
    updateReps: (exerciseId: string, setIndex: number, reps: number) => 
      dispatch({ type: 'UPDATE_REPS', payload: { exerciseId, setIndex, reps } }),
      
    toggleSetComplete: (exerciseId: string, setIndex: number, isComplete: boolean) => 
      dispatch({ type: 'TOGGLE_SET_COMPLETE', payload: { exerciseId, setIndex, isComplete } }),
      
    startSet: () => 
      dispatch({ type: 'START_PREPARATION' }),
      
    startExecuting: () => 
      dispatch({ type: 'START_EXECUTING' }),
      
    stopExecuting: () => 
      dispatch({ type: 'STOP_EXECUTING' }),
      
    showFinishModal: (duration: number) => 
      dispatch({ type: 'SHOW_NOTES_MODAL', payload: duration }),
      
    hideFinishModal: () => 
      dispatch({ type: 'HIDE_NOTES_MODAL' }),
      
    setSessionNotes: (notes: string) => 
      dispatch({ type: 'SET_SESSION_NOTES', payload: notes }),
      
    moveExercise: (fromIndex: number, toIndex: number) => 
      dispatch({ type: 'MOVE_EXERCISE', payload: { fromIndex, toIndex } }),
      
    setDragState: (draggedIndex: number | null, dragOverIndex: number | null) => 
      dispatch({ type: 'SET_DRAG_STATE', payload: { draggedIndex, dragOverIndex } }),
  }), []);
  
  return {
    state: {
      ...state,
      currentExercise,
    },
    actions,
  };
}
```

---

## 3️⃣ Utilidades de Cálculo

### `utils/workoutCalculations.ts`

```typescript
import type { Exercise, Routine } from '@/types';
import { EXERCISE_DATABASE } from '@/data/exercises';
import { calculateRestBetweenSets, calculateRestBetweenExercises } from '@/lib/restCalculator';

/**
 * Calcula el tiempo de descanso para la siguiente serie
 */
export function calculateNextRestTime(params: {
  currentExercise: Exercise;
  routine: Routine;
  restOverrides: Record<string, number>;
  perSetOverrides: Record<string, number[]>;
  currentSet: number;
  useSmartRest: boolean;
}): number {
  const { currentExercise, routine, restOverrides, perSetOverrides, currentSet, useSmartRest } = params;
  const setIndex = currentSet - 1;
  
  // Prioridad 1: Override individual de la serie
  if (perSetOverrides[currentExercise.id]?.[setIndex]) {
    return perSetOverrides[currentExercise.id][setIndex];
  }
  
  // Prioridad 2: Override del ejercicio
  if (restOverrides[currentExercise.id]) {
    return restOverrides[currentExercise.id];
  }
  
  // Prioridad 3: Configurado en el ejercicio
  if (currentExercise.restBetweenSets) {
    return currentExercise.restBetweenSets;
  }
  
  // Prioridad 4: Configurado en la rutina
  if (routine.restBetweenSets) {
    return routine.restBetweenSets;
  }
  
  // Prioridad 5: Descanso inteligente
  if (useSmartRest) {
    const exerciseTemplate = EXERCISE_DATABASE.find(e => e.name === currentExercise.name);
    if (exerciseTemplate) {
      const currentSetData = currentExercise.sets[currentSet - 1];
      const restRecommendation = calculateRestBetweenSets(
        exerciseTemplate,
        currentExercise.sets.length,
        currentSetData?.reps || 10,
        'intermediate'
      );
      return restRecommendation.recommended;
    }
  }
  
  // Default: 60 segundos
  return 60;
}

/**
 * Calcula el tiempo de descanso entre ejercicios
 */
export function calculateExerciseRestTime(params: {
  currentExercise: Exercise;
  nextExercise: Exercise;
  routine: Routine;
  restOverrides: Record<string, number>;
  useSmartRest: boolean;
}): number {
  const { currentExercise, nextExercise, routine, restOverrides, useSmartRest } = params;
  
  // Override del ejercicio
  if (restOverrides[currentExercise.id]) {
    return restOverrides[currentExercise.id];
  }
  
  // Configurado en la rutina
  if (routine.restBetweenExercises) {
    return routine.restBetweenExercises;
  }
  
  // Descanso inteligente
  if (useSmartRest) {
    const currentTemplate = EXERCISE_DATABASE.find(e => e.name === currentExercise.name);
    const nextTemplate = EXERCISE_DATABASE.find(e => e.name === nextExercise.name);
    
    if (currentTemplate && nextTemplate) {
      const restRecommendation = calculateRestBetweenExercises(
        currentTemplate,
        nextTemplate,
        'intermediate'
      );
      return restRecommendation.recommended;
    }
  }
  
  // Default: 120 segundos
  return 120;
}

/**
 * Determina si se debe avanzar automáticamente al siguiente ejercicio
 */
export function shouldAutoAdvance(params: {
  completedSets: Record<string, number>;
  actualReps: Record<string, number[]>;
  currentExercise: Exercise;
  routine: Routine;
  currentExerciseIndex: number;
  showTimer: boolean;
  isExecutingSet: boolean;
  showPreparation: boolean;
}): boolean {
  const {
    completedSets,
    actualReps,
    currentExercise,
    routine,
    currentExerciseIndex,
    showTimer,
    isExecutingSet,
    showPreparation
  } = params;
  
  const exerciseId = currentExercise.id;
  const totalSets = currentExercise.sets.length;
  const completedCount = completedSets[exerciseId] || 0;
  
  // No todas las series completadas
  if (completedCount !== totalSets || completedCount === 0) {
    return false;
  }
  
  // Verificar que todas las series tienen datos
  const allSetsHaveData = currentExercise.sets.every((_, idx) => {
    return actualReps[exerciseId]?.[idx] > 0;
  });
  
  if (!allSetsHaveData) {
    return false;
  }
  
  // No avanzar si hay timer, está ejecutando o en preparación
  if (showTimer || isExecutingSet || showPreparation) {
    return false;
  }
  
  // Verificar si está editando un ejercicio anterior
  const lastCompletedIndex = findLastCompletedExerciseIndex(routine.exercises, completedSets);
  if (lastCompletedIndex > currentExerciseIndex) {
    return false;
  }
  
  return true;
}

/**
 * Encuentra el índice del último ejercicio con series completadas
 */
function findLastCompletedExerciseIndex(
  exercises: Exercise[],
  completedSets: Record<string, number>
): number {
  for (let i = exercises.length - 1; i >= 0; i--) {
    const ex = exercises[i];
    const exCompletedSets = completedSets[ex.id] || 0;
    if (exCompletedSets > 0) {
      return i;
    }
  }
  return -1;
}

/**
 * Calcula el progreso total del workout
 */
export function calculateWorkoutProgress(params: {
  routine: Routine;
  currentExerciseIndex: number;
  currentSet: number;
}): number {
  const { routine, currentExerciseIndex, currentSet } = params;
  
  const totalSets = routine.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = routine.exercises
    .slice(0, currentExerciseIndex)
    .reduce((acc, ex) => acc + ex.sets.length, 0) + (currentSet - 1);
  
  return (completedSets / totalSets) * 100;
}
```

---

## 📊 Comparación de Métricas

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Líneas en page.tsx | 1596 | 150 | 90% ↓ |
| Número de useState | 25+ | 0 (useReducer) | 100% ↓ |
| Complejidad ciclomática | ~50 | ~10 | 80% ↓ |
| Testabilidad | Baja | Alta | ✅ |
| Mantenibilidad | Baja | Alta | ✅ |
| Re-renders | Muchos | Optimizados | ✅ |

---

## ✅ Beneficios Inmediatos

1. **Código más legible**: Cada archivo tiene una responsabilidad clara
2. **Más fácil de testear**: Funciones puras y componentes aislados
3. **Mejor rendimiento**: Memoización y re-renders optimizados
4. **Más mantenible**: Cambios localizados, menor riesgo de bugs
5. **Mejor DX**: Más fácil para nuevos desarrolladores

---

## 🚀 Próximos Pasos

1. Implementar los componentes individuales
2. Crear tests unitarios para utils
3. Migrar gradualmente del código actual
4. Agregar tests de integración
5. Documentar la nueva arquitectura
