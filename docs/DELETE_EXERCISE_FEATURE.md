# Funcionalidad: Eliminar Ejercicios Durante el Entrenamiento

## Descripción
Permite eliminar ejercicios completos durante un entrenamiento activo, con reordenamiento automático de los ejercicios restantes.

## Cambios Implementados

### 1. ExerciseList.tsx
Agregado botón de eliminar en cada ejercicio de la lista:

```typescript
interface ExerciseListProps {
  // ... props existentes
  onDeleteExercise?: (index: number) => void; // NUEVO
}

// En el render, agregar botón de eliminar:
{onDeleteExercise && routine.exercises.length > 1 && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onDeleteExercise(idx);
    }}
    className="p-2 text-red-500 hover:text-red-700..."
    title="Eliminar ejercicio"
  >
    {/* Icono de basura */}
  </button>
)}
```

### 2. CompactWorkoutHeader.tsx
Agregado botón de eliminar en el header del ejercicio actual:

```typescript
interface CompactWorkoutHeaderProps {
  // ... props existentes
  onDeleteExercise?: () => void; // NUEVO
}

// En el render, junto al nombre del ejercicio:
{onDeleteExercise && totalExercises > 1 && (
  <button
    onClick={onDeleteExercise}
    className="p-1 text-red-500..."
    title="Eliminar este ejercicio"
  >
    {/* Icono de basura pequeño */}
  </button>
)}
```

### 3. page.tsx (Workout)
Agregada función `handleDeleteExercise`:

```typescript
const handleDeleteExercise = useCallback(async (exerciseIndex: number) => {
  if (!routine) return;
  
  // No permitir eliminar si solo hay un ejercicio
  if (routine.exercises.length <= 1) {
    error('No puedes eliminar el último ejercicio');
    return;
  }
  
  const exerciseToDelete = routine.exercises[exerciseIndex];
  
  // Confirmar eliminación
  const confirmed = await confirm({
    title: 'Eliminar ejercicio',
    message: `¿Estás seguro de que quieres eliminar "${exerciseToDelete.name}"?`,
    confirmText: 'Sí, eliminar',
    variant: 'danger'
  });
  
  if (!confirmed) return;
  
  // Eliminar el ejercicio
  const updatedExercises = routine.exercises.filter((_, idx) => idx !== exerciseIndex);
  const updatedRoutine = { ...routine, exercises: updatedExercises };
  
  setRoutine(updatedRoutine);
  updateModifiedRoutine(updatedRoutine);
  
  // Limpiar datos del ejercicio eliminado
  const exerciseId = exerciseToDelete.id;
  workoutState.updateActualReps(exerciseId, []);
  workoutState.updateActualWeights(exerciseId, []);
  workoutState.updateCompletedSets(exerciseId, 0);
  
  // Ajustar currentExerciseIndex si es necesario
  if (workoutState.currentExerciseIndex >= updatedExercises.length) {
    // Si estábamos en el último ejercicio, retroceder
    workoutState.setCurrentExerciseIndex(Math.max(0, updatedExercises.length - 1));
    workoutState.setCurrentSet(1);
    
    // Actualizar valores del nuevo ejercicio actual
    const newCurrentExercise = updatedExercises[Math.max(0, updatedExercises.length - 1)];
    if (newCurrentExercise && newCurrentExercise.sets[0]) {
      workoutState.setCurrentReps(newCurrentExercise.sets[0].reps);
      workoutState.setCurrentWeight(newCurrentExercise.sets[0].weight || 0);
    }
  } else if (exerciseIndex < workoutState.currentExerciseIndex) {
    // Si eliminamos un ejercicio anterior, ajustar el índice
    workoutState.setCurrentExerciseIndex(workoutState.currentExerciseIndex - 1);
  } else if (exerciseIndex === workoutState.currentExerciseIndex) {
    // Si eliminamos el ejercicio actual, mantener el índice pero actualizar datos
    const newCurrentExercise = updatedExercises[exerciseIndex];
    if (newCurrentExercise && newCurrentExercise.sets[0]) {
      workoutState.setCurrentSet(1);
      workoutState.setCurrentReps(newCurrentExercise.sets[0].reps);
      workoutState.setCurrentWeight(newCurrentExercise.sets[0].weight || 0);
    }
  }
  
  success(`Ejercicio "${exerciseToDelete.name}" eliminado`, 2000);
  haptic.error();
}, [routine, workoutState, updateModifiedRoutine, confirm, success, error, haptic]);
```

### 4. Conectar en el Render
En el return del componente de workout, pasar las funciones:

```typescript
<CompactWorkoutHeader
  // ... props existentes
  onDeleteExercise={() => handleDeleteExercise(workoutState.currentExerciseIndex)}
/>

<ExerciseList
  // ... props existentes
  onDeleteExercise={handleDeleteExercise}
/>
```

## Comportamiento

1. **Validación**: No permite eliminar si solo queda un ejercicio
2. **Confirmación**: Muestra diálogo de confirmación antes de eliminar
3. **Reordenamiento**: Ajusta automáticamente los índices de ejercicios
4. **Limpieza de datos**: Elimina todos los datos registrados del ejercicio
5. **Navegación**: Si se elimina el ejercicio actual, navega al siguiente o anterior
6. **Persistencia**: Guarda los cambios en el storage y en activeWorkout
7. **Feedback**: Muestra toast de confirmación y feedback háptico

## Casos de Uso

- Eliminar ejercicios que no se pueden realizar (falta de equipo, lesión, etc.)
- Ajustar la rutina sobre la marcha
- Simplificar entrenamientos largos

## Restricciones

- No se puede eliminar el último ejercicio restante
- Requiere confirmación del usuario
- Solo disponible si hay más de un ejercicio en la rutina
