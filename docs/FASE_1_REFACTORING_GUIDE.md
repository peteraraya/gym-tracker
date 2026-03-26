# Guía de Refactorización Fase 1 - WorkoutPage

## 📋 Estado Actual

El archivo `app/workout/[id]/page.tsx` tiene **1706 líneas** con:
- 25+ estados locales con useState
- Lógica de negocio mezclada con UI
- Múltiples useEffect con muchas dependencias
- Difícil de mantener y testear

## 🎯 Objetivo de Fase 1

Refactorizar de forma **incremental y segura** sin romper funcionalidad existente:

1. ✅ Extraer lógica de cálculos a utilidades puras
2. ✅ Crear custom hooks para lógica compleja
3. ✅ Dividir en componentes más pequeños
4. 🔄 Migrar gradualmente a useReducer (opcional)

## 🚀 Plan de Implementación Incremental

### Paso 1: Extraer Utilidades de Cálculo (SEGURO)

Crear `app/workout/[id]/utils/workoutCalculations.ts` con funciones puras:

```typescript
// ✅ Función pura - fácil de testear
export function calculateNextRestTime(params: {
  currentExercise: Exercise;
  routine: Routine;
  restOverrides: Record<string, number>;
  perSetOverrides: Record<string, number[]>;
  currentSet: number;
  useSmartRest: boolean;
}): number {
  // Lógica extraída del componente
}
```

**Beneficio**: Reduce complejidad del componente sin cambiar su estructura.

### Paso 2: Crear Custom Hooks (SEGURO)

Extraer lógica de useEffect a custom hooks:

```typescript
// hooks/useAutoAdvance.ts
export function useAutoAdvance(params) {
  useEffect(() => {
    // Lógica de auto-avance
  }, [/* dependencias mínimas */]);
}
```

**Beneficio**: Encapsula lógica compleja, más fácil de entender.

### Paso 3: Dividir en Componentes (MODERADO)

Extraer secciones grandes del JSX a componentes:

```typescript
// components/SetsList.tsx
export function SetsList({ exercise, onUpdate }) {
  // Renderizado de la lista de series
}
```

**Beneficio**: Componente principal más legible, mejor organización.

### Paso 4: useReducer (OPCIONAL - RIESGOSO)

Solo si los pasos anteriores no son suficientes.

**Riesgo**: Requiere reescribir mucha lógica, alto riesgo de bugs.

## 📝 Implementación Práctica

### 1. Crear Utilidades de Cálculo


**Archivo**: `app/workout/[id]/utils/workoutCalculations.ts`

```typescript
import type { Exercise, Routine } from '@/types';
import { EXERCISE_DATABASE } from '@/data/exercises';
import { calculateRestBetweenSets, calculateRestBetweenExercises } from '@/lib/restCalculator';

/**
 * Calcula el tiempo de descanso para la siguiente serie
 * Prioridad: perSetOverride > exerciseOverride > exerciseConfig > routineConfig > smart > default
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
  
  // 1. Override individual de la serie
  if (perSetOverrides[currentExercise.id]?.[setIndex]) {
    return perSetOverrides[currentExercise.id][setIndex];
  }
  
  // 2. Override del ejercicio
  if (restOverrides[currentExercise.id]) {
    return restOverrides[currentExercise.id];
  }
  
  // 3. Configurado en el ejercicio
  if (currentExercise.restBetweenSets) {
    return currentExercise.restBetweenSets;
  }
  
  // 4. Configurado en la rutina
  if (routine.restBetweenSets) {
    return routine.restBetweenSets;
  }
  
  // 5. Descanso inteligente
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
  
  // 6. Default
  return 60;
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
 * Calcula el progreso total del workout (porcentaje)
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

/**
 * Helper para actualizar arrays anidados en estado
 */
export function updateNestedArray<T>(
  state: Record<string, T[]>,
  key: string,
  index: number,
  value: T
): Record<string, T[]> {
  return {
    ...state,
    [key]: [
      ...(state[key] || []).slice(0, index),
      value,
      ...(state[key] || []).slice(index + 1)
    ]
  };
}
```

### 2. Usar las Utilidades en el Componente

**Antes** (líneas 500-550 aprox):
```typescript
// Lógica compleja dentro del componente
const handleCompleteSet = () => {
  // ... 100+ líneas de lógica
  let restTime: number;
  const setIndex = currentSet - 1;
  
  if (perSetRestOverrides[currentExercise.id] && perSetRestOverrides[currentExercise.id][setIndex]) {
    restTime = perSetRestOverrides[currentExercise.id][setIndex];
  } else if (restOverrides[currentExercise.id] && restOverrides[currentExercise.id] > 0) {
    restTime = restOverrides[currentExercise.id];
  } // ... más lógica
};
```

**Después**:
```typescript
import { calculateNextRestTime } from './utils/workoutCalculations';

const handleCompleteSet = () => {
  // ... lógica de actualización de estado
  
  // Calcular descanso usando utilidad
  const restTime = calculateNextRestTime({
    currentExercise,
    routine,
    restOverrides,
    perSetOverrides,
    currentSet,
    useSmartRest
  });
  
  // Iniciar timer
  setShowTimer(true);
  setTimerDuration(restTime);
  // ...
};
```

**Beneficio**: Código más limpio, lógica testeable, más fácil de mantener.

### 3. Crear Custom Hook para Auto-Avance

**Archivo**: `app/workout/[id]/hooks/useAutoAdvance.ts`

```typescript
import { useEffect } from 'react';
import { shouldAutoAdvance } from '../utils/workoutCalculations';
import type { Exercise, Routine } from '@/types';

interface UseAutoAdvanceParams {
  currentExercise: Exercise | null;
  routine: Routine | null;
  completedSets: Record<string, number>;
  actualReps: Record<string, number[]>;
  currentExerciseIndex: number;
  showTimer: boolean;
  isExecutingSet: boolean;
  showPreparation: boolean;
  onAdvanceToNextExercise: () => void;
  onShowFinishModal: () => void;
}

export function useAutoAdvance(params: UseAutoAdvanceParams) {
  const {
    currentExercise,
    routine,
    completedSets,
    actualReps,
    currentExerciseIndex,
    showTimer,
    isExecutingSet,
    showPreparation,
    onAdvanceToNextExercise,
    onShowFinishModal
  } = params;
  
  useEffect(() => {
    if (!currentExercise || !routine) return;
    
    const shouldAdvance = shouldAutoAdvance({
      completedSets,
      actualReps,
      currentExercise,
      routine,
      currentExerciseIndex,
      showTimer,
      isExecutingSet,
      showPreparation
    });
    
    if (shouldAdvance) {
      const isLastExercise = currentExerciseIndex >= routine.exercises.length - 1;
      
      if (isLastExercise) {
        onShowFinishModal();
      } else {
        onAdvanceToNextExercise();
      }
    }
  }, [
    currentExercise?.id,
    completedSets,
    actualReps,
    showTimer,
    isExecutingSet,
    showPreparation
  ]);
}
```

**Uso en el componente**:
```typescript
// Reemplazar el useEffect complejo con:
useAutoAdvance({
  currentExercise,
  routine,
  completedSets,
  actualReps,
  currentExerciseIndex,
  showTimer,
  isExecutingSet,
  showPreparation,
  onAdvanceToNextExercise: handleAdvanceToNextExercise,
  onShowFinishModal: () => {
    const duration = Math.floor((Date.now() - workoutStartTime) / 1000);
    setProposedDuration(Math.max(duration, 60));
    setShowNotesModal(true);
  }
});
```

## ✅ Checklist de Implementación

### Paso 1: Utilidades (1-2 horas)
- [ ] Crear `app/workout/[id]/utils/workoutCalculations.ts`
- [ ] Implementar `calculateNextRestTime`
- [ ] Implementar `shouldAutoAdvance`
- [ ] Implementar `calculateWorkoutProgress`
- [ ] Implementar `updateNestedArray`
- [ ] Reemplazar lógica en componente con llamadas a utilidades

### Paso 2: Custom Hooks (2-3 horas)
- [ ] Crear `app/workout/[id]/hooks/useAutoAdvance.ts`
- [ ] Extraer lógica de auto-avance del useEffect
- [ ] Reemplazar useEffect complejo con custom hook
- [ ] Probar que funciona correctamente

### Paso 3: Componentes (3-4 horas)
- [ ] Crear `app/workout/[id]/components/SetsList.tsx`
- [ ] Extraer renderizado de lista de series
- [ ] Crear `app/workout/[id]/components/WorkoutHeader.tsx`
- [ ] Extraer header con progreso
- [ ] Probar que todo funciona

### Paso 4: Testing (2-3 horas)
- [ ] Escribir tests para utilidades
- [ ] Escribir tests para custom hooks
- [ ] Probar flujo completo de workout

## 🎯 Resultado Esperado

Después de Fase 1:
- ✅ Código más organizado y legible
- ✅ Lógica de negocio separada de UI
- ✅ Funciones testeables
- ✅ Componente principal más pequeño (~800-1000 líneas)
- ✅ Más fácil de mantener

## 🚨 Precauciones

1. **No cambiar todo a la vez**: Hacer cambios incrementales
2. **Probar después de cada cambio**: Asegurar que no se rompe nada
3. **Mantener backup**: Tener el código original disponible
4. **Documentar cambios**: Actualizar documentación

## 📚 Recursos

- [React useReducer](https://react.dev/reference/react/useReducer)
- [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Testing React](https://testing-library.com/docs/react-testing-library/intro/)

