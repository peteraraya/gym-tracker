# Fix: Sistema de Persistencia de Datos del Entrenamiento - SOLUCIÓN FINAL

## Problema
Los datos del entrenamiento (series completadas, repeticiones, pesos) se perdían al recargar la página (F5) tanto en modo guiado como en modo de edición rápida.

### Causa Raíz
El hook `useWorkoutState` no tenía un mecanismo para notificar cambios inmediatamente. Los datos se guardaban en Supabase correctamente, pero al restaurar después de F5, el hook no tenía el timestamp `_lastUpdate`, por lo que el efecto de notificación no se disparaba y los cambios no persistían.

## Solución Implementada

### 1. Guardado Directo en Callbacks del Hook

Modificado `app/workout/[id]/hooks/useWorkoutState.ts`:

#### Cambios principales:

1. **Agregado callback `onDataChange`**:
```typescript
interface UseWorkoutStateOptions {
  onDataChange?: (data: WorkoutData) => void;
}

export function useWorkoutState(
  routine: Routine | null,
  options: UseWorkoutStateOptions = {}
): UseWorkoutStateReturn
```

2. **Guardado inmediato en cada acción**:
   - `completeSet()` - Guarda después de completar una serie
   - `updateActualReps()` - Guarda después de editar repeticiones
   - `updateActualWeights()` - Guarda después de editar pesos
   - `updateCompletedSets()` - Guarda después de cambiar series completadas
   - `updateSetType()` - Guarda después de cambiar tipo de serie

Cada función ahora:
```typescript
const completeSet = useCallback((exerciseId: string, reps: number, weight: number) => {
  setWorkoutData(prev => {
    const newData = {
      ...prev,
      // ... actualizar datos
      _lastUpdate: Date.now()
    };
    
    // ✅ Guardar inmediatamente
    if (!isInitializingRef.current && onDataChangeRef.current) {
      setTimeout(() => {
        console.log('[useWorkoutState] 💾 Saving after completeSet');
        onDataChangeRef.current?.(newData);
      }, 0);
    }
    
    return newData;
  });
}, []);
```

3. **Función `restoreData()`**:
```typescript
const restoreData = useCallback((data: Partial<WorkoutData>) => {
  console.log('[useWorkoutState] 🔄 Restoring data:', data);
  setWorkoutData(prev => ({
    ...prev,
    ...data,
    _lastUpdate: Date.now() // ✅ Agregar timestamp
  }));
}, []);
```

4. **Control de inicialización**:
```typescript
const isInitializingRef = useRef(true);

useEffect(() => {
  const timer = setTimeout(() => {
    isInitializingRef.current = false;
    console.log('[useWorkoutState] ✅ Initialization complete, ready to save');
  }, 100);
  return () => clearTimeout(timer);
}, []);
```

### 2. Integración en page.tsx

Modificado `app/workout/[id]/page.tsx`:

1. **Callback de guardado**:
```typescript
const handleWorkoutDataChangeRef = useRef<((data: any) => void) | null>(null);

const workoutState = useWorkoutState(routine || null, {
  onDataChange: (data) => {
    if (handleWorkoutDataChangeRef.current) {
      handleWorkoutDataChangeRef.current(data);
    }
  }
});
```

2. **Actualización del callback después de inicialización**:
```typescript
useEffect(() => {
  handleWorkoutDataChangeRef.current = (data: any) => {
    if (!routine || !isInitialized) {
      console.log('[Workout] ⏸️ Skipping save - not initialized or no routine');
      return;
    }
    
    console.log('[Workout] 💾 Saving workout data immediately:', data);
    
    updateWorkoutProgress(
      workoutState.currentExerciseIndex,
      workoutState.currentSet,
      data.completedSets,
      data.actualReps,
      data.actualWeights,
      // ... resto de datos
    );
  };
}, [routine, isInitialized, updateWorkoutProgress, totalPausedTime, timerHandlers]);
```

3. **Restauración simplificada**:
```typescript
if (storedWorkout && storedWorkout.routineId === id) {
  const s = storedWorkout as any;
  
  // ... restaurar índices y tiempo
  
  // ✅ Usar restoreData() para restaurar todos los datos de una vez
  const restoredData = {
    completedSets: s.completedSets || {},
    actualReps: s.actualReps || {},
    actualWeights: s.actualWeights || {},
    setTypes: s.setTypes || {},
    restOverrides: s.restOverrides || {},
    perSetRestOverrides: s.perSetRestOverrides || {},
    // ... resto de campos
  };
  
  console.log('[Init] ✅ Restored data prepared:', restoredData);
  workoutState.restoreData(restoredData);
}
```

4. **Eliminado efecto de sincronización duplicado**:
   - El efecto que llamaba a `updateWorkoutProgress` basado en `workoutData._lastUpdate` fue eliminado
   - Ahora el guardado se hace directamente en los callbacks, evitando guardados duplicados

## Flujo de Datos

### Completar una serie (modo guiado):
1. Usuario presiona "Completar Serie"
2. Se llama a `workoutState.completeSet(exerciseId, reps, weight)`
3. El hook actualiza el estado local
4. Inmediatamente llama a `onDataChange(newData)` con `setTimeout(..., 0)`
5. El callback llama a `updateWorkoutProgress()` en `WorkoutContext`
6. `WorkoutContext` guarda en Supabase PRIMERO, luego localStorage
7. ✅ Datos persistidos inmediatamente

### Editar repeticiones (modo edición rápida):
1. Usuario edita el valor en el input
2. Se llama a `workoutState.updateActualReps(exerciseId, newReps)`
3. El hook actualiza el estado local
4. Inmediatamente llama a `onDataChange(newData)`
5. El callback guarda en Supabase/localStorage
6. ✅ Datos persistidos inmediatamente

### Recargar página (F5):
1. `page.tsx` carga datos de Supabase con `getActiveWorkout()`
2. Llama a `workoutState.restoreData(restoredData)`
3. `restoreData()` actualiza el estado Y agrega `_lastUpdate` timestamp
4. El efecto de notificación detecta el cambio y llama a `onDataChange`
5. Los datos se guardan nuevamente (idempotente)
6. ✅ Datos restaurados correctamente

## Ventajas de esta Solución

1. **Guardado en tiempo real**: Los datos se guardan inmediatamente después de cada cambio
2. **Sin race conditions**: Usar `setTimeout(..., 0)` evita actualizar estado durante render
3. **Sin guardados duplicados**: Eliminado el efecto de sincronización que causaba múltiples guardados
4. **Supabase como fuente de verdad**: Los datos se guardan primero en Supabase, luego en localStorage
5. **Restauración robusta**: La función `restoreData()` agrega el timestamp necesario para que funcione correctamente
6. **Logs detallados**: Cada operación tiene logs para debugging

## Archivos Modificados

1. `app/workout/[id]/hooks/useWorkoutState.ts`
   - Agregado `UseWorkoutStateOptions` con callback `onDataChange`
   - Agregado guardado directo en `completeSet`, `updateActualReps`, `updateActualWeights`, `updateCompletedSets`, `updateSetType`
   - Agregado función `restoreData()`
   - Agregado control de inicialización con `isInitializingRef`
   - Agregado efecto de notificación con validación de timestamp

2. `app/workout/[id]/page.tsx`
   - Agregado `handleWorkoutDataChangeRef` para callback de guardado
   - Modificado inicialización de `useWorkoutState` para pasar callback
   - Agregado efecto para actualizar callback después de que `timerHandlers` esté disponible
   - Simplificada restauración de datos usando `restoreData()`
   - Eliminado efecto de sincronización duplicado

## Testing

Para verificar que funciona:

1. Iniciar un entrenamiento
2. Completar una serie en modo guiado
3. Ver logs: `[useWorkoutState] 💾 Saving after completeSet`
4. Ver logs: `[storage] ✅ Active workout saved to Supabase`
5. Presionar F5 para recargar
6. Ver logs: `[Init] 🔄 Restoring data:`
7. Ver logs: `[useWorkoutState] 🔄 Restoring data:`
8. Verificar que los datos persisten correctamente

## Logs Esperados

### Al completar una serie:
```
[useWorkoutState] 💾 Saving after completeSet
[Workout] 💾 Saving workout data immediately: {completedSets: {...}, actualReps: {...}, ...}
[WorkoutContext] updateWorkoutProgress called with: {...}
[WorkoutContext] Saving to storage: {...}
[storage] 💾 saveActiveWorkout called {...}
[storage] ✅ Active workout saved to Supabase
[storage] ✅ Active workout saved to localStorage (backup)
```

### Al recargar (F5):
```
[storage] 📖 getActiveWorkout called
[storage] ✅ Active workout loaded from Supabase {...}
[Init] 📦 Restoring workout from storage: {...}
[Init] ✅ Restored data prepared: {...}
[useWorkoutState] 🔄 Restoring data: {...}
[useWorkoutState] ✅ Initialization complete, ready to save
```

## Estado: ✅ COMPLETADO

La solución ha sido implementada y probada. Los datos ahora persisten correctamente en cualquier punto del entrenamiento al recargar la página.
