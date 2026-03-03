# Fix: Persistencia de Series Agregadas/Eliminadas

## Problema
Las series agregadas durante el entrenamiento no persistían al navegar a otra parte de la página y volver. El botón de eliminar serie no aparecía en el modo guiado.

## Causa Raíz
1. El handler `handleAddSet` no llamaba a `updateRoutine()` para persistir los cambios en la base de datos
2. Los handlers `handleDeleteSet` y `handleQuickDeleteSet` tampoco persistían los cambios
3. El componente `SeriesTable` no recibía el prop `onDeleteSet`

## Solución Implementada

### 1. Handler `handleAddSet` Mejorado
```typescript
const handleAddSet = useCallback(async () => {
  if (!currentExercise || !routine) return;
  
  const exerciseId = currentExercise.id;
  const lastSet = currentExercise.sets[currentExercise.sets.length - 1];
  
  // Crear nueva serie con los mismos valores que la última
  const newSet = {
    reps: lastSet.reps,
    weight: lastSet.weight || 0,
    restAfter: lastSet.restAfter || currentExercise.restBetweenSets || 90
  };
  
  // Actualizar la rutina
  const updatedSets = [...currentExercise.sets, newSet];
  const updatedExercise = { ...currentExercise, sets: updatedSets };
  const updatedRoutine = {
    ...routine,
    exercises: routine.exercises.map((ex: Exercise) => 
      ex.id === exerciseId ? updatedExercise : ex
    )
  };
  
  setRoutine(updatedRoutine);
  
  // ✅ PERSISTIR LA RUTINA ACTUALIZADA
  try {
    await updateRoutine(id, updatedRoutine);
    success('Serie agregada', 2000);
  } catch (err) {
    error('Error al agregar serie');
    console.error('Error adding set:', err);
  }
}, [currentExercise, routine, id, updateRoutine, success, error]);
```

### 2. Handler `handleDeleteSet` con Persistencia
```typescript
const handleDeleteSet = useCallback(async (setIndex: number) => {
  if (!currentExercise || !routine) return;
  
  // No permitir eliminar si solo hay una serie
  if (currentExercise.sets.length <= 1) {
    error('No puedes eliminar la última serie');
    return;
  }
  
  const exerciseId = currentExercise.id;
  
  // Eliminar la serie del ejercicio
  const updatedSets = currentExercise.sets.filter((_: any, idx: number) => idx !== setIndex);
  const updatedExercise = { ...currentExercise, sets: updatedSets };
  
  // Actualizar la rutina
  const updatedRoutine = {
    ...routine,
    exercises: routine.exercises.map((ex: Exercise) => 
      ex.id === exerciseId ? updatedExercise : ex
    )
  };
  
  setRoutine(updatedRoutine);
  
  // Limpiar datos de la serie eliminada
  const currentReps = workoutState.workoutData.actualReps[exerciseId] || [];
  const currentWeights = workoutState.workoutData.actualWeights[exerciseId] || [];
  
  workoutState.updateActualReps(exerciseId, currentReps.filter((_, idx) => idx !== setIndex));
  workoutState.updateActualWeights(exerciseId, currentWeights.filter((_, idx) => idx !== setIndex));
  
  // Recalcular series completadas
  const newReps = currentReps.filter((_, idx) => idx !== setIndex);
  const completedCount = newReps.filter((r: number) => typeof r === 'number' && r > 0).length;
  workoutState.updateCompletedSets(exerciseId, completedCount);
  
  // Ajustar currentSet si es necesario
  if (workoutState.currentSet > updatedSets.length) {
    workoutState.setCurrentSet(updatedSets.length);
  }
  
  // ✅ PERSISTIR LA RUTINA ACTUALIZADA
  try {
    await updateRoutine(id, updatedRoutine);
    success('Serie eliminada', 2000);
  } catch (err) {
    error('Error al eliminar serie');
    console.error('Error deleting set:', err);
  }
}, [currentExercise, routine, workoutState, id, updateRoutine, success, error]);
```

### 3. Handler `handleQuickDeleteSet` con Persistencia
Similar a `handleDeleteSet` pero para el modo de edición rápida:
```typescript
const handleQuickDeleteSet = useCallback(async (exerciseId: string, setIndex: number) => {
  const exercise = routine?.exercises.find((ex: Exercise) => ex.id === exerciseId);
  if (!exercise || !routine) return;
  
  // No permitir eliminar si solo hay una serie
  if (exercise.sets.length <= 1) {
    error('No puedes eliminar la última serie');
    return;
  }
  
  // ... actualizar rutina ...
  
  // ✅ PERSISTIR LA RUTINA ACTUALIZADA
  try {
    await updateRoutine(id, updatedRoutine);
    success('Serie eliminada', 2000);
  } catch (err) {
    error('Error al eliminar serie');
    console.error('Error deleting set:', err);
  }
}, [routine, workoutState, id, updateRoutine, success, error]);
```

### 4. Prop `onDeleteSet` Agregado a SeriesTable
```typescript
<SeriesTable
  exercise={currentExercise}
  exerciseId={currentExercise.id}
  completedSets={workoutState.workoutData.completedSets[currentExercise.id] || 0}
  actualReps={workoutState.workoutData.actualReps[currentExercise.id] || []}
  actualWeights={workoutState.workoutData.actualWeights[currentExercise.id] || []}
  setTypes={workoutState.workoutData.setTypes[currentExercise.id] || []}
  currentSet={workoutState.currentSet}
  onEditReps={handleEditReps}
  onEditWeight={handleEditWeight}
  onEditSetType={handleEditSetType}
  onToggleSetComplete={handleToggleSetComplete}
  onAddSet={handleAddSet}
  onDeleteSet={handleDeleteSet}  // ✅ AGREGADO
  perSetRestOverrides={workoutState.workoutData.perSetRestOverrides}
  onEditRestTime={handleEditRestTime}
  onApplySmartRest={handleApplySmartRest}
  smartRestTime={smartRestTime}
  routine={routine}
  restOverrides={workoutState.workoutData.restOverrides}
  useSmartRest={useSmartRest}
/>
```

## Características del Botón Eliminar

### Validación
- No permite eliminar si solo hay 1 serie (mínimo requerido)
- Muestra mensaje de error si se intenta eliminar la última serie

### Limpieza de Datos
- Elimina los datos de reps y peso de la serie eliminada
- Recalcula el contador de series completadas
- Ajusta `currentSet` si es necesario para no quedar fuera de rango

### UI
- Icono de basura rojo en cada fila de la tabla
- Solo visible cuando hay más de 1 serie
- Tooltip "Eliminar serie"
- Confirmación visual con toast

## Archivos Modificados
- `app/workout/[id]/page.tsx`: Handlers mejorados con persistencia
- `app/workout/[id]/components/SeriesTable.tsx`: Ya tenía el botón implementado
- `app/workout/[id]/components/QuickEditMode.tsx`: Ya tenía el botón implementado

## Resultado
✅ Las series agregadas ahora persisten al navegar
✅ Las series eliminadas se guardan correctamente
✅ El botón de eliminar aparece en ambos modos (guiado y edición rápida)
✅ Validación correcta (no permite eliminar la última serie)
✅ Feedback visual con toasts de éxito/error
