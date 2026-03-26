# Inicio Automático de Series

## Descripción

Se ha implementado el inicio automático de series para mejorar el flujo del entrenamiento. Ahora las series se inician automáticamente en dos momentos clave:

1. **Al entrar al entrenamiento**: La primera serie se inicia automáticamente
2. **Después del descanso**: Cuando termina el timer de descanso, la siguiente serie se inicia automáticamente

## Implementación

### 1. Inicio Automático al Entrar al Entrenamiento

En el `useEffect` de inicialización, cuando se crea un nuevo entrenamiento (no hay workout guardado):

```typescript
} else if (!storedWorkout || storedWorkout.routineId !== id) {
  startWorkout(routineWithDefaults);
  
  if (routineWithDefaults.exercises && routineWithDefaults.exercises.length > 0 && routineWithDefaults.exercises[0]) {
    const firstExercise = routineWithDefaults.exercises[0];
    const firstSet = firstExercise.sets[0];
    if (firstSet) {
      workoutState.setCurrentReps(firstSet.reps);
      workoutState.setCurrentWeight(firstSet.weight || 0);
    }
    
    // Iniciar automáticamente la primera serie
    setTimeout(() => {
      setExecution.startSet();
    }, 500);
  }
}
```

**Detalles**:
- Se usa un `setTimeout` de 500ms para dar tiempo a que la UI se renderice
- Solo se ejecuta cuando es un entrenamiento nuevo (no cuando se restaura uno existente)
- Llama a `setExecution.startSet()` que muestra el countdown de preparación

### 2. Inicio Automático Después del Descanso

En `handleTimerComplete`, después de avanzar a la siguiente serie o ejercicio:

```typescript
const handleTimerComplete = useCallback(() => {
  timerHandlers.stopTimer();
  clearRestState();
  
  if (!currentExercise || !routine) return;
  
  const exerciseId = currentExercise.id;
  const completedCount = workoutState.workoutData.completedSets[exerciseId] || 0;
  const totalSets = currentExercise.sets.length;
  const isLastSet = completedCount >= totalSets;
  const isLastExercise = workoutState.currentExerciseIndex >= routine.exercises.length - 1;
  
  if (isLastSet && isLastExercise) {
    // Último ejercicio completado - mostrar modal de finalización
    const duration = Math.floor((Date.now() - workoutStartTime) / 1000);
    completion.openCompletionModal(duration);
  } else if (isLastSet && !isLastExercise) {
    // Avanzar al siguiente ejercicio
    const nextIndex = workoutState.currentExerciseIndex + 1;
    if (routine.exercises[nextIndex]) {
      workoutState.setCurrentExerciseIndex(nextIndex);
      workoutState.setCurrentSet(1);
      const nextExercise = routine.exercises[nextIndex];
      const firstSet = nextExercise.sets[0];
      if (firstSet) {
        workoutState.setCurrentReps(firstSet.reps);
        workoutState.setCurrentWeight(firstSet.weight || 0);
      }
      
      // Iniciar automáticamente la siguiente serie
      setTimeout(() => {
        setExecution.startSet();
      }, 500);
    }
  } else if (!isLastSet) {
    // Avanzar a la siguiente serie del mismo ejercicio
    const newSet = workoutState.currentSet + 1;
    workoutState.setCurrentSet(newSet);
    const nextSetData = currentExercise.sets[newSet - 1];
    if (nextSetData) {
      workoutState.setCurrentReps(nextSetData.reps);
      workoutState.setCurrentWeight(nextSetData.weight || 0);
    }
    
    // Iniciar automáticamente la siguiente serie
    setTimeout(() => {
      setExecution.startSet();
    }, 500);
  }
}, [currentExercise, routine, workoutState, workoutStartTime, clearRestState, timerHandlers, completion, setExecution]);
```

**Detalles**:
- Se agregó `setExecution` a las dependencias del callback
- Se llama a `setExecution.startSet()` después de avanzar a la siguiente serie
- Se usa un `setTimeout` de 500ms para dar tiempo a que la UI se actualice
- Se ejecuta tanto para series del mismo ejercicio como para el primer set del siguiente ejercicio
- NO se ejecuta cuando es el último ejercicio (muestra el modal de finalización)

## Flujo del Usuario

### Flujo Anterior (Manual)
1. Usuario entra al entrenamiento
2. Usuario hace clic en "Iniciar Serie 1"
3. Countdown de preparación (3, 2, 1, ¡YA!)
4. Usuario ejecuta la serie
5. Usuario hace clic en "Completar Serie"
6. Timer de descanso
7. Timer termina
8. **Usuario debe hacer clic en "Iniciar Serie 2"** ← Manual
9. Repetir desde paso 3

### Flujo Nuevo (Automático)
1. Usuario entra al entrenamiento
2. **Countdown de preparación se inicia automáticamente** ← Automático
3. Usuario ejecuta la serie
4. Usuario hace clic en "Completar Serie"
5. Timer de descanso
6. Timer termina
7. **Countdown de preparación se inicia automáticamente** ← Automático
8. Usuario ejecuta la serie
9. Repetir desde paso 4

## Beneficios

1. **Flujo más natural**: El entrenamiento fluye sin interrupciones
2. **Menos clics**: El usuario no necesita hacer clic en "Iniciar Serie" cada vez
3. **Mejor ritmo**: Mantiene el momentum del entrenamiento
4. **Menos distracciones**: El usuario puede enfocarse en ejecutar las series
5. **Experiencia más profesional**: Similar a apps de entrenamiento premium

## Consideraciones

### Tiempo de Delay (500ms)
- Se usa un delay de 500ms antes de iniciar el countdown
- Esto da tiempo para que:
  - La UI se actualice (cambio de serie/ejercicio)
  - El usuario vea qué serie viene
  - El estado se estabilice

### Casos Especiales

1. **Entrenamiento Restaurado**: Si el usuario sale y vuelve a entrar, NO se inicia automáticamente (respeta el estado guardado)

2. **Último Ejercicio**: Cuando se completa el último ejercicio, NO se inicia automáticamente (muestra el modal de finalización)

3. **Cambio Manual de Ejercicio**: Si el usuario cambia manualmente de ejercicio (usando el selector rápido), NO se inicia automáticamente

## Compatibilidad

- Compatible con todas las funcionalidades existentes:
  - Timer de descanso minimizado
  - Cambio rápido de ejercicios
  - Edición de series
  - Predicción de peso
  - Descanso inteligente

## Testing

Para probar la funcionalidad:

1. **Inicio automático al entrar**:
   - Crear o seleccionar una rutina
   - Hacer clic en "Iniciar entrenamiento"
   - Verificar que el countdown de preparación se inicia automáticamente

2. **Inicio automático después del descanso**:
   - Completar una serie
   - Esperar a que termine el timer de descanso
   - Verificar que el countdown de preparación se inicia automáticamente

3. **No inicio automático al restaurar**:
   - Iniciar un entrenamiento
   - Salir de la app (F5 o cerrar)
   - Volver a entrar
   - Verificar que NO se inicia automáticamente (respeta el estado)
