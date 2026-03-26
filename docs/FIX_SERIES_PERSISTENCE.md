# Fix: Persistencia de Series Completadas en Modo Guiado

## Problema Identificado

Al completar series en modo guiado y presionar F5 (recargar página), las series completadas se reseteaban y se perdía el progreso del entrenamiento.

### Causa Raíz

Había DOS problemas:

1. **Falta de sincronización**: El hook `useWorkoutState` manejaba todo el estado del workout en memoria React, pero NO lo sincronizaba automáticamente con `WorkoutContext`, que es el responsable de persistir los datos en Supabase y localStorage.

2. **React no detectaba cambios en objetos anidados**: El `useEffect` de sincronización tenía objetos como `workoutData.completedSets`, `workoutData.actualReps` en las dependencias. React compara por referencia, y cuando se actualiza un valor DENTRO del objeto, la referencia no cambia, por lo que el efecto no se ejecutaba.

**Flujo problemático:**
1. Usuario completa una serie → Estado se actualiza en `useWorkoutState` (memoria)
2. `useEffect` NO se ejecuta porque la referencia del objeto no cambió ❌
3. Usuario presiona F5 → Página se recarga
4. Sistema intenta restaurar desde Supabase/localStorage → Datos desactualizados
5. Series completadas se pierden ❌

## Solución Implementada

### 1. Timestamp para Detección de Cambios

Agregado campo `_lastUpdate` en `WorkoutData` que se actualiza en cada modificación:

```typescript
interface WorkoutData {
  completedSets: { [key: string]: number };
  actualReps: { [key: string]: number[] };
  actualWeights: { [key: string]: number[] };
  // ... otros campos
  // ✅ Timestamp para forzar re-renders cuando cambia el estado
  _lastUpdate?: number;
}
```

Todas las funciones de actualización ahora incluyen el timestamp:

```typescript
const completeSet = useCallback((exerciseId: string, reps: number, weight: number) => {
  setWorkoutData(prev => {
    const newReps = [...(prev.actualReps[exerciseId] || []), reps];
    const newWeights = [...(prev.actualWeights[exerciseId] || []), weight];
    
    return {
      ...prev,
      actualReps: { ...prev.actualReps, [exerciseId]: newReps },
      actualWeights: { ...prev.actualWeights, [exerciseId]: newWeights },
      completedSets: { ...prev.completedSets, [exerciseId]: newReps.length },
      _lastUpdate: Date.now() // ✅ Forzar detección de cambios
    };
  });
}, []);
```

### 2. useEffect Optimizado

El `useEffect` de sincronización ahora usa el timestamp como dependencia:

```typescript
useEffect(() => {
  if (!routine || !isInitialized) return;
  
  console.log('[Workout Sync] Syncing workout data to context');
  
  updateWorkoutProgress(
    workoutState.currentExerciseIndex,
    workoutState.currentSet,
    workoutState.workoutData.completedSets,
    workoutState.workoutData.actualReps,
    workoutState.workoutData.actualWeights,
    // ... resto de parámetros
  );
}, [
  workoutState.currentExerciseIndex,
  workoutState.currentSet,
  // ✅ Usar timestamp para detectar cambios en workoutData
  workoutState.workoutData._lastUpdate,
  timerHandlers.showTimer,
  routine,
  isInitialized,
  totalPausedTime,
  updateWorkoutProgress
]);
```

### 3. Campos Adicionales en WorkoutState

Extendida la interfaz `WorkoutState` en `context/WorkoutContext.tsx` para incluir todos los campos necesarios:

```typescript
interface WorkoutState {
  // ... campos existentes
  
  // ✅ Campos adicionales para persistencia completa
  setTypes?: { [key: string]: string[] };
  restOverrides?: { [key: string]: number };
  perSetRestOverrides?: { [key: string]: number[] };
}
```

### 4. Actualización de updateWorkoutProgress

Modificada la función `updateWorkoutProgress` para aceptar y persistir los campos adicionales:

```typescript
updateWorkoutProgress: (
  exerciseIndex: number,
  set: number,
  completedSets: { [key: string]: number },
  actualReps: { [key: string]: number[] },
  actualWeights: { [key: string]: number[] },
  restState?: { ... },
  totalPausedTime?: number,
  additionalData?: {
    setTypes?: { [key: string]: string[] };
    restOverrides?: { [key: string]: number };
    perSetRestOverrides?: { [key: string]: number[] };
  }
) => void;
```

### 5. Logs de Debug

Agregados logs detallados para rastrear el flujo de sincronización:

```typescript
console.log('[Workout Sync] Syncing workout data to context:', {
  exerciseIndex: workoutState.currentExerciseIndex,
  currentSet: workoutState.currentSet,
  completedSets: workoutState.workoutData.completedSets,
  actualReps: workoutState.workoutData.actualReps,
  actualWeights: workoutState.workoutData.actualWeights,
  lastUpdate: workoutState.workoutData._lastUpdate
});

console.log('[WorkoutContext] updateWorkoutProgress called with:', { ... });
console.log('[WorkoutContext] Saving to storage:', newState);
console.log('[WorkoutContext] Successfully saved to storage');
```

### 6. Normalización de Datos

Actualizada la función `normalizeActiveWorkout` para restaurar correctamente los nuevos campos al cargar desde storage:

```typescript
setTypes: (() => {
  const out: { [key: string]: string[] } = {};
  const src = data.setTypes || {};
  if (typeof src === 'object' && src !== null && !Array.isArray(src)) {
    Object.keys(src).forEach(k => {
      const arr = (src as any)[k];
      out[String(k)] = Array.isArray(arr) ? arr.map(s => String(s ?? '')) : [];
    });
  }
  return out;
})(),
// ... similar para restOverrides y perSetRestOverrides
```

### 7. Restauración en Inicialización

Agregada lógica para restaurar los campos adicionales cuando se carga un workout guardado:

```typescript
// ✅ Restaurar setTypes
if (s.setTypes) {
  for (const [exerciseId, types] of Object.entries(s.setTypes)) {
    if (Array.isArray(types)) {
      types.forEach((type: any, index: number) => {
        if (type) {
          workoutState.updateSetType(exerciseId, index, String(type));
        }
      });
    }
  }
}

// ✅ Restaurar restOverrides y perSetRestOverrides
// ... código similar
```

## Flujo Correcto Ahora

1. Usuario completa una serie → Estado se actualiza en `useWorkoutState`
2. `_lastUpdate` cambia → React detecta el cambio ✅
3. `useEffect` se ejecuta → Llama a `updateWorkoutProgress` ✅
4. `updateWorkoutProgress` guarda en `WorkoutContext` → Persiste en Supabase + localStorage ✅
5. Usuario presiona F5 → Página se recarga
6. Sistema restaura desde Supabase/localStorage → Datos actualizados ✅
7. Series completadas se mantienen ✅

## Datos Persistidos

Ahora se persisten TODOS los campos del workout:

- ✅ `completedSets`: Número de series completadas por ejercicio
- ✅ `actualReps`: Repeticiones reales de cada serie
- ✅ `actualWeights`: Pesos reales de cada serie
- ✅ `setTypes`: Tipos de serie (normal, warmup, dropset, etc.)
- ✅ `restOverrides`: Tiempos de descanso personalizados por ejercicio
- ✅ `perSetRestOverrides`: Tiempos de descanso personalizados por serie
- ✅ `currentExerciseIndex`: Ejercicio actual
- ✅ `currentSet`: Serie actual
- ✅ `totalPausedTime`: Tiempo total pausado
- ✅ `restTimerState`: Estado del timer de descanso

## Archivos Modificados

1. **app/workout/[id]/hooks/useWorkoutState.ts**
   - Agregado campo `_lastUpdate` a `WorkoutData`
   - Actualizado `completeSet()` para incluir timestamp
   - Actualizado `updateCompletedSets()` para incluir timestamp
   - Actualizado `updateActualReps()` para incluir timestamp
   - Actualizado `updateActualWeights()` para incluir timestamp
   - Actualizado `updateSetType()` para incluir timestamp
   - Actualizado `updateRestOverride()` para incluir timestamp
   - Actualizado `updatePerSetRestOverride()` para incluir timestamp
   - Actualizado `updateSetDuration()` para incluir timestamp
   - Actualizado `updatePauseDuration()` para incluir timestamp
   - Actualizado `updateRestTime()` para incluir timestamp

2. **context/WorkoutContext.tsx**
   - Agregados campos `setTypes`, `restOverrides`, `perSetRestOverrides` a `WorkoutState`
   - Actualizada función `updateWorkoutProgress` para aceptar `additionalData`
   - Actualizada función `normalizeActiveWorkout` para restaurar nuevos campos
   - Agregados logs de debug detallados

3. **app/workout/[id]/page.tsx**
   - Actualizado `useEffect` de sincronización para usar `_lastUpdate` como dependencia
   - Agregada restauración de campos adicionales en inicialización
   - Agregados logs de debug para rastrear sincronización

## Testing

Para verificar el fix:

1. Abrir consola del navegador (F12)
2. Iniciar un entrenamiento en modo guiado
3. Completar 2-3 series de un ejercicio
4. Observar en consola:
   ```
   [Workout Sync] Syncing workout data to context: { ... }
   [WorkoutContext] updateWorkoutProgress called with: { ... }
   [WorkoutContext] Saving to storage: { ... }
   [WorkoutContext] Successfully saved to storage
   ```
5. Presionar F5 para recargar la página
6. Verificar que:
   - ✅ Series completadas se mantienen
   - ✅ Repeticiones y pesos se mantienen
   - ✅ Tipos de serie se mantienen
   - ✅ Tiempos de descanso personalizados se mantienen
   - ✅ Ejercicio y serie actual se mantienen

## Beneficios

- ✅ React detecta cambios en objetos anidados mediante timestamp
- ✅ Sincronización automática cada vez que cambia el estado
- ✅ Datos siempre sincronizados entre estado local y persistencia
- ✅ No se pierde progreso al recargar (F5)
- ✅ Persistencia completa de todos los campos del workout
- ✅ Restauración correcta al volver al entrenamiento
- ✅ Logs detallados para debugging
- ✅ Manejo robusto de datos corruptos con normalización

## Notas Técnicas

- El `_lastUpdate` timestamp es la clave para que React detecte cambios en objetos anidados
- El `useEffect` se ejecuta cada vez que cambia `_lastUpdate`
- La sincronización es automática y no requiere llamadas manuales
- Los datos se guardan en AMBOS lugares: Supabase (fuente de verdad) y localStorage (backup)
- La normalización maneja casos edge como datos corruptos o tipos incorrectos
- La restauración es robusta y maneja valores faltantes o inválidos
- Los logs pueden ser removidos en producción si se desea
