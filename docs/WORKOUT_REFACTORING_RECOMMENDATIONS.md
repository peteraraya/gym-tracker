# Recomendaciones de Refactorización - Sistema de Entrenamiento

## Análisis Realizado
Fecha: 27 de febrero de 2026
Archivos analizados:
- `app/workout/[id]/page.tsx` (1596 líneas)
- `context/WorkoutContext.tsx` (317 líneas)
- `components/Timer.tsx` (300+ líneas)

---

## 🔴 PROBLEMAS CRÍTICOS

### 1. **Archivo WorkoutPage demasiado grande (1596 líneas)**
**Problema**: El componente principal tiene demasiada responsabilidad y es difícil de mantener.

**Impacto**: 
- Difícil de debuggear
- Alto riesgo de bugs al hacer cambios
- Tiempo de carga del componente
- Difícil onboarding para nuevos desarrolladores

**Solución Recomendada**: Dividir en componentes más pequeños

```typescript
// Estructura propuesta:
app/workout/[id]/
  ├── page.tsx (200 líneas max - orquestador principal)
  ├── components/
  │   ├── WorkoutHeader.tsx (progreso, timer global)
  │   ├── ExerciseCard.tsx (card del ejercicio actual)
  │   ├── SetsList.tsx (lista de series con checkboxes)
  │   ├── RestConfiguration.tsx (configuración de descanso)
  │   ├── ExercisesList.tsx (lista acordeón de todos los ejercicios)
  │   └── WorkoutActions.tsx (botones cancelar/terminar)
  ├── hooks/
  │   ├── useWorkoutState.ts (gestión de estado local)
  │   ├── useWorkoutInitialization.ts (lógica de inicialización)
  │   ├── useAutoAdvance.ts (lógica de auto-avance)
  │   ├── useWorkoutSuggestions.ts (sugerencias)
  │   └── useExerciseDragDrop.ts (drag and drop)
  └── utils/
      ├── workoutCalculations.ts (cálculos de descanso, progreso)
      └── workoutHelpers.ts (helpers varios)
```

**Prioridad**: 🔴 ALTA

---

### 2. **Exceso de useState (25+ estados locales)**
**Problema**: Demasiados estados independientes que están relacionados entre sí.

**Estados actuales**:
```typescript
const [routine, setRoutine] = useState(...)
const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
const [currentSet, setCurrentSet] = useState(1)
const [showTimer, setShowTimer] = useState(false)
const [timerDuration, setTimerDuration] = useState(0)
const [timerTitle, setTimerTitle] = useState('')
const [nextExerciseName, setNextExerciseName] = useState(...)
const [completedSets, setCompletedSets] = useState({})
const [actualReps, setActualReps] = useState({})
const [actualWeights, setActualWeights] = useState({})
const [setTypes, setSetTypes] = useState({})
const [lastWeights, setLastWeights] = useState({})
const [restOverrides, setRestOverrides] = useState({})
const [perSetRestOverrides, setPerSetRestOverrides] = useState({})
// ... y más
```

**Solución Recomendada**: Usar useReducer para estado complejo

```typescript
// hooks/useWorkoutState.ts
type WorkoutState = {
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
};

type WorkoutAction =
  | { type: 'SET_ROUTINE'; payload: Routine }
  | { type: 'NAVIGATE_TO_EXERCISE'; payload: number }
  | { type: 'NAVIGATE_TO_SET'; payload: number }
  | { type: 'START_TIMER'; payload: { duration: number; title: string } }
  | { type: 'COMPLETE_SET'; payload: { exerciseId: string; setIndex: number } }
  | { type: 'UPDATE_WEIGHT'; payload: { exerciseId: string; setIndex: number; weight: number } }
  // ... más acciones

function workoutReducer(state: WorkoutState, action: WorkoutAction): WorkoutState {
  switch (action.type) {
    case 'SET_ROUTINE':
      return { ...state, routine: action.payload };
    case 'NAVIGATE_TO_EXERCISE':
      return {
        ...state,
        navigation: { ...state.navigation, currentExerciseIndex: action.payload }
      };
    // ... más casos
    default:
      return state;
  }
}

export function useWorkoutState() {
  const [state, dispatch] = useReducer(workoutReducer, initialState);
  
  return {
    state,
    actions: {
      setRoutine: (routine: Routine) => dispatch({ type: 'SET_ROUTINE', payload: routine }),
      navigateToExercise: (index: number) => dispatch({ type: 'NAVIGATE_TO_EXERCISE', payload: index }),
      // ... más acciones
    }
  };
}
```

**Prioridad**: 🔴 ALTA

---

### 3. **Lógica de negocio mezclada con UI**
**Problema**: Cálculos complejos y lógica de negocio dentro del componente.

**Ejemplos problemáticos**:
```typescript
// Dentro del componente (líneas 400-500)
const handleCompleteSet = () => {
  // 100+ líneas de lógica compleja
  // Cálculos de descanso
  // Actualización de múltiples estados
  // Persistencia
  // Navegación
};
```

**Solución Recomendada**: Extraer a funciones puras

```typescript
// utils/workoutCalculations.ts
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
  
  // Prioridad clara
  if (perSetOverrides[currentExercise.id]?.[setIndex]) {
    return perSetOverrides[currentExercise.id][setIndex];
  }
  
  if (restOverrides[currentExercise.id]) {
    return restOverrides[currentExercise.id];
  }
  
  if (currentExercise.restBetweenSets) {
    return currentExercise.restBetweenSets;
  }
  
  if (routine.restBetweenSets) {
    return routine.restBetweenSets;
  }
  
  if (useSmartRest) {
    return calculateSmartRest(currentExercise);
  }
  
  return 60; // default
}

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
  const { completedSets, actualReps, currentExercise, routine, currentExerciseIndex, showTimer, isExecutingSet, showPreparation } = params;
  
  const exerciseId = currentExercise.id;
  const totalSets = currentExercise.sets.length;
  const completedCount = completedSets[exerciseId] || 0;
  
  if (completedCount !== totalSets || completedCount === 0) {
    return false;
  }
  
  const allSetsHaveData = currentExercise.sets.every((_, idx) => {
    return actualReps[exerciseId]?.[idx] > 0;
  });
  
  if (!allSetsHaveData) {
    return false;
  }
  
  if (showTimer || isExecutingSet || showPreparation) {
    return false;
  }
  
  // Verificar si está editando ejercicio anterior
  const lastCompletedIndex = findLastCompletedExerciseIndex(routine.exercises, completedSets);
  if (lastCompletedIndex > currentExerciseIndex) {
    return false;
  }
  
  return true;
}
```

**Prioridad**: 🟡 MEDIA-ALTA

---

## 🟡 PROBLEMAS DE MANTENIBILIDAD

### 4. **Código duplicado en gestión de estado**
**Problema**: Patrones repetidos para actualizar estados anidados.

**Ejemplo**:
```typescript
// Patrón repetido 10+ veces
setActualWeights(prev => {
  const copy = { ...prev };
  copy[exerciseId] = copy[exerciseId] ? [...copy[exerciseId]] : [];
  copy[exerciseId][setIndex] = value;
  return copy;
});
```

**Solución Recomendada**: Helper functions

```typescript
// utils/stateHelpers.ts
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

// Uso:
setActualWeights(prev => updateNestedArray(prev, exerciseId, setIndex, value));
```

**Prioridad**: 🟡 MEDIA

---

### 5. **useEffect con muchas dependencias**
**Problema**: useEffect con 10+ dependencias es difícil de razonar.

**Ejemplo problemático**:
```typescript
useEffect(() => {
  // Lógica compleja de auto-avance
}, [completedSets, actualReps, currentExercise, routine, currentExerciseIndex, 
    showTimer, isExecutingSet, showPreparation, workoutStartTime, restOverrides, 
    useSmartRest, actualWeights, currentSet, updateWorkoutProgress]);
```

**Solución Recomendada**: Custom hook con lógica encapsulada

```typescript
// hooks/useAutoAdvance.ts
export function useAutoAdvance(params: {
  currentExercise: Exercise | null;
  routine: Routine | null;
  completedSets: Record<string, number>;
  actualReps: Record<string, number[]>;
  // ... otros params necesarios
}) {
  const { currentExercise, routine, completedSets, actualReps } = params;
  
  useEffect(() => {
    if (!currentExercise || !routine) return;
    
    const shouldAdvance = shouldAutoAdvance({
      completedSets,
      actualReps,
      currentExercise,
      routine,
      // ... otros params
    });
    
    if (shouldAdvance) {
      handleAutoAdvance();
    }
  }, [currentExercise?.id, completedSets, actualReps]); // Dependencias mínimas
}
```

**Prioridad**: 🟡 MEDIA

---

### 6. **Falta de tipos explícitos**
**Problema**: Uso de `any` y tipos implícitos en varios lugares.

**Ejemplos**:
```typescript
const s = storedWorkout as any; // ❌
const parsed = await storageService.getLastWeights();
if (parsed && mounted) setLastWeights(parsed as any); // ❌
```

**Solución Recomendada**: Tipos explícitos

```typescript
// types/workout.ts
export interface StoredWorkout {
  routineId: string;
  routineName: string;
  currentExerciseIndex: number;
  currentSet: number;
  completedSets: Record<string, number>;
  actualReps: Record<string, number[]>;
  actualWeights: Record<string, number[]>;
  isResting?: boolean;
  restTimerDuration?: number;
  restTimerTitle?: string;
  restTimerNextExercise?: string;
  restTimerStartedAt?: number;
}

export interface LastWeights {
  [exerciseId: string]: number[];
}

// Uso:
const storedWorkout = await storageService.getActiveWorkout() as StoredWorkout | null;
const lastWeights = await storageService.getLastWeights() as LastWeights;
```

**Prioridad**: 🟡 MEDIA

---

## 🟢 MEJORAS DE RENDIMIENTO

### 7. **Re-renders innecesarios**
**Problema**: Componentes se re-renderizan cuando no es necesario.

**Solución Recomendada**: Memoización estratégica

```typescript
// Memoizar componentes pesados
const ExerciseCard = React.memo(({ exercise, onComplete }) => {
  // ...
}, (prevProps, nextProps) => {
  return prevProps.exercise.id === nextProps.exercise.id &&
         prevProps.exercise.completedSets === nextProps.exercise.completedSets;
});

// Memoizar callbacks
const handleCompleteSet = useCallback(() => {
  // lógica
}, [/* dependencias mínimas */]);

// Memoizar valores calculados
const exerciseProgress = useMemo(() => {
  return calculateProgress(completedSets, routine);
}, [completedSets, routine]);
```

**Prioridad**: 🟢 BAJA-MEDIA

---

### 8. **Cálculos repetidos en cada render**
**Problema**: Cálculos complejos que se ejecutan en cada render.

**Ejemplo**:
```typescript
// Se calcula en cada render
const isLastSet = currentSet >= currentExercise.sets.length;
const isLastExercise = currentExerciseIndex >= routine.exercises.length - 1;
```

**Solución**: useMemo para cálculos

```typescript
const exerciseMetadata = useMemo(() => ({
  isLastSet: currentSet >= currentExercise.sets.length,
  isLastExercise: currentExerciseIndex >= routine.exercises.length - 1,
  totalSets: currentExercise.sets.length,
  completedCount: completedSets[currentExercise.id] || 0,
  progress: ((currentExerciseIndex * currentExercise.sets.length + currentSet - 1) / 
            (routine.exercises.reduce((acc, ex) => acc + ex.sets.length, 0))) * 100
}), [currentSet, currentExercise, currentExerciseIndex, routine, completedSets]);
```

**Prioridad**: 🟢 BAJA

---

## 🔵 MEJORAS DE CÓDIGO

### 9. **Logs de debug en producción**
**Problema**: console.log en múltiples lugares.

**Solución Recomendada**: Logger utility

```typescript
// utils/logger.ts
const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (...args: any[]) => {
    if (isDev) console.log('[DEBUG]', ...args);
  },
  info: (...args: any[]) => {
    if (isDev) console.info('[INFO]', ...args);
  },
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  }
};

// Uso:
logger.debug('[Auto-advance Check]', { exerciseId, completedCount });
```

**Prioridad**: 🟢 BAJA

---

### 10. **Manejo de errores inconsistente**
**Problema**: Algunos errores se ignoran silenciosamente, otros se loggean.

**Solución Recomendada**: Error boundary y manejo consistente

```typescript
// components/WorkoutErrorBoundary.tsx
export class WorkoutErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Workout error:', error, errorInfo);
    // Enviar a servicio de monitoreo (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return <WorkoutErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// Manejo consistente de errores async
async function safeAsyncOperation<T>(
  operation: () => Promise<T>,
  fallback: T,
  errorMessage: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logger.error(errorMessage, error);
    return fallback;
  }
}
```

**Prioridad**: 🟢 BAJA-MEDIA

---

## 📋 PLAN DE IMPLEMENTACIÓN SUGERIDO

### Fase 1: Refactorización Crítica (1-2 semanas)
1. ✅ Dividir WorkoutPage en componentes más pequeños
2. ✅ Implementar useReducer para estado complejo
3. ✅ Extraer lógica de negocio a utils

### Fase 2: Mejoras de Mantenibilidad (1 semana)
4. ✅ Crear helpers para estado anidado
5. ✅ Extraer useEffects complejos a custom hooks
6. ✅ Agregar tipos explícitos

### Fase 3: Optimizaciones (3-5 días)
7. ✅ Implementar memoización estratégica
8. ✅ Optimizar cálculos con useMemo
9. ✅ Agregar logger utility
10. ✅ Implementar error boundary

---

## 🎯 BENEFICIOS ESPERADOS

### Mantenibilidad
- ✅ Código más fácil de entender y modificar
- ✅ Menor riesgo de bugs al hacer cambios
- ✅ Onboarding más rápido para nuevos desarrolladores

### Rendimiento
- ✅ Menos re-renders innecesarios
- ✅ Mejor experiencia de usuario
- ✅ Menor consumo de batería en móviles

### Calidad
- ✅ Código más testeable
- ✅ Mejor manejo de errores
- ✅ Tipos más seguros

---

## 📝 NOTAS ADICIONALES

### Testing
Después de la refactorización, será mucho más fácil agregar tests:
- Tests unitarios para funciones puras (utils)
- Tests de integración para custom hooks
- Tests E2E para flujos completos

### Documentación
Considerar agregar:
- JSDoc para funciones complejas
- README en carpeta workout/ explicando arquitectura
- Diagramas de flujo para lógica compleja

### Monitoreo
Implementar métricas para:
- Tiempo de carga del workout
- Errores en producción
- Uso de features (drag&drop, smart rest, etc.)

---

## ⚠️ RIESGOS Y CONSIDERACIONES

1. **Regresiones**: La refactorización puede introducir bugs
   - Mitigación: Tests exhaustivos antes y después
   
2. **Tiempo de desarrollo**: Refactorización toma tiempo
   - Mitigación: Hacerlo por fases, sin bloquear nuevas features
   
3. **Compatibilidad**: Cambios en estructura de datos
   - Mitigación: Mantener backward compatibility en storage

---

## 🚀 CONCLUSIÓN

El sistema de entrenamiento funciona bien, pero tiene deuda técnica acumulada. La refactorización propuesta mejorará significativamente la mantenibilidad sin afectar la funcionalidad existente.

**Recomendación**: Comenzar con Fase 1 (componentes y reducer) ya que tiene el mayor impacto en mantenibilidad.
