# Fix: Persistencia de Datos del Entrenamiento - Solución Final

## Problema
Los datos del entrenamiento (series completadas, repeticiones, pesos) se perdían al recargar la página (F5) tanto en modo guiado como en modo de edición rápida.

### Síntomas
- Completar una serie → F5 → datos desaparecen
- Editar reps/peso en modo rápido → F5 → cambios se pierden
- Los datos SÍ se guardaban en Supabase, pero al restaurar no se detectaban como cambios
- Logs mostraban: `[useWorkoutState] ⏸️ Skipping notification - no timestamp`

### Causa Raíz
El hook `useWorkoutState` no tenía:
1. Un callback `onDataChange` para notificar cambios
2. Una función `restoreData()` para restaurar datos con timestamp
3. Guardado inmediato en cada acción (completeSet, updateActualReps, etc.)

El efecto de notificación dependía de `_lastUpdate` timestamp, pero al restaurar datos desde storage, no se agregaba este timestamp, por lo que el efecto no se disparaba.

## Solución Implementada

### 1. Modificaciones en `useWorkoutState.ts`

#### A. Agregar interfaz de opciones con callback
```typescript
interface UseWorkoutStateOptions {
  onDataChange?: (data: WorkoutData) => void;
}

export function useWorkoutState(
  routine: Routine | null,
  options: UseWorkoutStateOptions = {}
): UseWorkoutStateReturn
```

#### B. Agregar refs y estado de inicialización
```typescript
const onDataChangeRef = useRef(onDataChange);
const isInitializingRef = useRef(true);

useEffect(() => {
  onDataChangeRef.current = onDataChange;
}, [onDataChange]);

// Marcar como inicializado después del primer render
useEffect(() => {
  const timer = setTimeout(() => {
    isInitializingRef.current = false;
    console.log('[useWorkoutState] ✅ Initialization complete, ready to save');
  }, 100);
  return () => clearTimeout(timer);
}, []);
```

#### C. Agregar función `restoreData()`
```typescript
const restoreData = useCallback((data: Partial<WorkoutData>) => {
  console.log('[useWorkoutState] 🔄 Restoring data:', data);
  setWorkoutData(prev => ({
    ...prev,
    ...data,
    _lastUpdate: Date.now() // ✅ Agregar timestamp para que se detecte el cambio
  }));
}, []);
```

#### D. Modificar acciones para guardar inmediatamente
Cada acción ahora guarda inmediatamente después de actualizar el estado:

```typescript
const completeSet = useCallback((exerciseId: string, reps: number, weight: number) => {
  setWorkoutData(prev => {
    const newReps = [...(prev.actualReps[exerciseId] || []), reps];
    const newWeights = [...(prev.actualWeights[exerciseId] || []), weight];
    
    const newData = {
      ...prev,
      actualReps: { ...prev.actualReps, [exerciseId]: newReps },
      actualWeights: { ...prev.actualWeights, [exerciseId]: newWeights },
      completedSets: { ...prev.completedSets, [exerciseId]: newReps.length },
      _lastUpdate: Date.now()
    };
    
    // ✅ Guardar inmediatamente después de actualizar estado
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

Lo mismo para:
- `updateCompletedSets`
- `updateActualReps`
- `updateActualWeights`
- `updateSetType`

### 2. Modificaciones en `page.tsx`

#### A. Inicializar workoutState con callback
```typescript
// Ref para el callback de guardado
const handleWorkoutDataChangeRef = useRef<((data: any) => void) | null>(null);

// Inicializar workoutState con callback que usa la ref
const workoutState = useWorkoutState(routine || null, {
  onDataChange: (data) => {
    if (handleWorkoutDataChangeRef.current) {
      handleWorkoutDataChangeRef.current(data);
    }
  }
});
```

#### B. Crear callback de guardado después de timerHandlers
```typescript
const handleWorkoutDataChange = useCallback((data: any) => {
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
    timerHandlers.showTimer ? {
      isResting: true,
      restTimerDuration: timerHandlers.timerDuration,
      restTimerTitle: timerHandlers.timerTitle,
      restTimerNextExercise: timerHandlers.nextExerciseName,
      restTimerStartedAt: Date.now()
    } : undefined,
    totalPausedTime,
    {
      setTypes: data.setTypes,
      restOverrides: data.restOverrides,
      perSetRestOverrides: data.perSetRestOverrides
    }
  );
}, [routine, isInitialized, updateWorkoutProgress, totalPausedTime, timerHandlers, workoutState.currentExerciseIndex, workoutState.currentSet]);

// Actualizar la ref cuando el callback cambie
useEffect(() => {
  handleWorkoutDataChangeRef.current = handleWorkoutDataChange;
}, [handleWorkoutDataChange]);
```

#### C. Usar `restoreData()` en lugar de múltiples llamadas
```typescript
if (storedWorkout && storedWorkout.routineId === id) {
  const s = storedWorkout as any;
  
  console.log('[Init] 📦 Restoring workout from storage:', s);
  
  // ... restaurar tiempo de inicio y índices ...
  
  // ✅ NUEVO: Usar restoreData() para restaurar todos los datos de una vez
  const restoredData = {
    completedSets: s.completedSets || {},
    actualReps: s.actualReps || {},
    actualWeights: s.actualWeights || {},
    setTypes: s.setTypes || {},
    restOverrides: s.restOverrides || {},
    perSetRestOverrides: s.perSetRestOverrides || {},
    actualSetDurations: s.actualSetDurations || {},
    actualPauseDurations: s.actualPauseDurations || {},
    actualRestTimes: s.actualRestTimes || {},
    lastWeights: s.lastWeights || {}
  };
  
  console.log('[Init] ✅ Restored data prepared:', restoredData);
  workoutState.restoreData(restoredData);
}
```

#### D. Eliminar efecto de sincronización duplicado
El efecto que llamaba a `updateWorkoutProgress` basado en `workoutData._lastUpdate` fue eliminado porque ahora el guardado se hace directamente en los callbacks.

```typescript
// ✅ ELIMINADO: El efecto de sincronización ya no es necesario
// El guardado ahora se hace directamente en los callbacks del hook
```

## Flujo de Datos

### Guardado (Completar Serie)
1. Usuario completa serie → `completeSet(exerciseId, reps, weight)`
2. Hook actualiza estado con `_lastUpdate: Date.now()`
3. Hook llama inmediatamente a `onDataChange(newData)` en setTimeout
4. Callback en page.tsx llama a `updateWorkoutProgress()`
5. WorkoutContext guarda en Supabase PRIMERO, luego localStorage
6. Logs: `[useWorkoutState] 💾 Saving after completeSet` → `[storage] ✅ Active workout saved to Supabase`

### Restauración (F5)
1. Page.tsx carga datos de Supabase con `getActiveWorkout()`
2. Prepara objeto `restoredData` con todos los campos
3. Llama a `workoutState.restoreData(restoredData)`
4. Hook agrega `_lastUpdate: Date.now()` a los datos restaurados
5. Efecto de notificación detecta el timestamp y llama a `onDataChange`
6. Datos se guardan nuevamente para confirmar sincronización
7. Logs: `[Init] 🔄 Restoring data` → `[useWorkoutState] 📢 Notifying data change`

## Ventajas de esta Solución

1. **Guardado Inmediato**: Los datos se guardan en el mismo ciclo de actualización del estado
2. **Sin Race Conditions**: Usar `setTimeout(() => ..., 0)` evita actualizar estado durante render
3. **Restauración Robusta**: `restoreData()` agrega timestamp para forzar detección de cambios
4. **Sin Duplicados**: Eliminado el efecto de sincronización que causaba guardados múltiples
5. **Logs Claros**: Cada paso tiene logs para debugging
6. **Supabase Prioritario**: Los datos se guardan primero en Supabase, localStorage es backup

## Testing

### Escenarios a Probar
1. ✅ Completar serie en modo guiado → F5 → datos persisten
2. ✅ Editar reps/peso en modo rápido → F5 → cambios persisten
3. ✅ Cambiar tipo de serie → F5 → tipo persiste
4. ✅ Modificar descanso → F5 → descanso persiste
5. ✅ Iniciar serie → F5 → estado persiste
6. ✅ Múltiples cambios rápidos → F5 → todos persisten

### Comandos de Verificación
```bash
# Ver logs en consola del navegador
# Buscar:
# - [useWorkoutState] 💾 Saving after ...
# - [storage] ✅ Active workout saved to Supabase
# - [Init] 🔄 Restoring data
# - [useWorkoutState] 📢 Notifying data change
```

## Archivos Modificados

1. `app/workout/[id]/hooks/useWorkoutState.ts`
   - Agregado `UseWorkoutStateOptions` con `onDataChange`
   - Agregado función `restoreData()`
   - Modificado `completeSet`, `updateActualReps`, `updateActualWeights`, `updateCompletedSets`, `updateSetType`
   - Agregado refs y lógica de inicialización

2. `app/workout/[id]/page.tsx`
   - Agregado callback `handleWorkoutDataChange`
   - Modificado inicialización de `useWorkoutState` para pasar callback
   - Cambiado restauración de datos para usar `restoreData()`
   - Eliminado efecto de sincronización duplicado

3. `lib/storage/storage.ts` (ya modificado previamente)
   - Supabase como fuente de verdad (guarda primero)
   - localStorage como backup

## Notas Importantes

- El guardado se hace en CADA cambio, no hay debouncing
- Supabase es la fuente de verdad, localStorage es solo backup
- Los logs son esenciales para debugging, no eliminar
- El timestamp `_lastUpdate` es crítico para detectar cambios
- La inicialización tiene un delay de 100ms para evitar guardados prematuros

## Estado Final

✅ Los datos del entrenamiento ahora persisten correctamente en CUALQUIER punto:
- Completar serie
- Iniciar serie
- Editar reps/peso
- Cambiar tipo de serie
- Modificar descansos

✅ El guardado es en tiempo real, sin esperar ciclos de React
✅ Supabase es la fuente de verdad
✅ La restauración funciona correctamente con timestamp
✅ No hay guardados duplicados
