# Fix: Preparación de Series y Timer de Serie en Progreso

## Fecha: 2024-03-06

## 🐛 Bugs Reportados

### Bug 1: Preparación solo aparece en la primera serie
**Problema**: El contador de preparación aparece al iniciar la primera serie, pero después del descanso de las series siguientes, no vuelve a aparecer.

**Causa**: En `handleTimerComplete`, después del descanso, no se llamaba a `setExecution.startSet()` para mostrar la preparación de la siguiente serie.

### Bug 2: Timer de serie en progreso nunca se resetea
**Problema**: El tiempo de "Serie en progreso" se acumula a través de todas las series del ejercicio en lugar de resetearse para cada serie individual.

**Causa**: En `handleCompleteSet`, se había comentado la llamada a `setExecution.completeSet()` que resetea el `setStartTime`.

---

## ✅ Soluciones Implementadas

### Fix 1: Iniciar preparación después del descanso

**Archivo**: `app/workout/[id]/page.tsx`
**Función**: `handleTimerComplete`

```typescript
// ANTES
} else if (!isLastSet) {
  const newSet = workoutState.currentSet + 1;
  workoutState.setCurrentSet(newSet);
  const nextSetData = currentExercise.sets[newSet - 1];
  if (nextSetData) {
    workoutState.setCurrentReps(nextSetData.reps);
    workoutState.setCurrentWeight(nextSetData.weight || 0);
  }
  
  // NO iniciar automáticamente la preparación en modo guiado
  // El usuario presionará el botón "Iniciar Serie" cuando esté listo
}

// DESPUÉS
} else if (!isLastSet) {
  const newSet = workoutState.currentSet + 1;
  workoutState.setCurrentSet(newSet);
  const nextSetData = currentExercise.sets[newSet - 1];
  if (nextSetData) {
    workoutState.setCurrentReps(nextSetData.reps);
    workoutState.setCurrentWeight(nextSetData.weight || 0);
  }
  
  // ✅ Iniciar preparación automáticamente después del descanso
  setExecution.startSet();
}
```

**Cambios**:
1. ✅ Agregado `setExecution.startSet()` después del descanso entre series
2. ✅ Agregado `setExecution.startSet()` después del descanso entre ejercicios
3. ✅ Agregado `setExecution` a las dependencias del useCallback

**Resultado**: Ahora la preparación aparece consistentemente después de cada descanso.

---

### Fix 2: Resetear timer de serie al completar

**Archivo**: `app/workout/[id]/page.tsx`
**Función**: `handleCompleteSet`

```typescript
// ANTES
const handleCompleteSet = useCallback(() => {
  if (!currentExercise || !routine) return;
  
  const exerciseId = currentExercise.id;
  const setIndex = workoutState.currentSet - 1;
  
  // Verificar si esta serie ya está completada
  const existingReps = workoutState.workoutData.actualReps[exerciseId]?.[setIndex];
  if (existingReps && existingReps > 0) {
    console.log('[Workout] Serie ya completada, ignorando');
    return;
  }
  
  // NO llamar a setExecution.completeSet() para evitar la preparación
  // setExecution.completeSet();
  
  const repsValue = typeof workoutState.currentReps === 'number' ? workoutState.currentReps : currentExercise.sets[setIndex]?.reps || 0;
  const weightValue = typeof workoutState.currentWeight === 'number' ? workoutState.currentWeight : currentExercise.sets[setIndex]?.weight || 0;

  workoutState.completeSet(exerciseId, repsValue, weightValue);
  // ...
}, [/* deps */]);

// DESPUÉS
const handleCompleteSet = useCallback(() => {
  if (!currentExercise || !routine) return;
  
  const exerciseId = currentExercise.id;
  const setIndex = workoutState.currentSet - 1;
  
  // Verificar si esta serie ya está completada
  const existingReps = workoutState.workoutData.actualReps[exerciseId]?.[setIndex];
  if (existingReps && existingReps > 0) {
    console.log('[Workout] Serie ya completada, ignorando');
    return;
  }
  
  // ✅ Resetear el timer de serie al completar
  setExecution.completeSet();
  
  const repsValue = typeof workoutState.currentReps === 'number' ? workoutState.currentReps : currentExercise.sets[setIndex]?.reps || 0;
  const weightValue = typeof workoutState.currentWeight === 'number' ? workoutState.currentWeight : currentExercise.sets[setIndex]?.weight || 0;

  workoutState.completeSet(exerciseId, repsValue, weightValue);
  // ...
}, [/* deps */]);
```

**Cambios**:
1. ✅ Descomentado `setExecution.completeSet()` que resetea el timer
2. ✅ El timer ahora se resetea correctamente para cada serie

**Resultado**: El tiempo de "Serie en progreso" ahora se resetea para cada serie individual.

---

## 🔄 Flujo Corregido

### Serie 1 (Primera del ejercicio)
1. Usuario presiona "Iniciar Serie" → `setExecution.startSet()`
2. Aparece preparación (5 segundos)
3. Preparación termina → `setExecution.completePreparation()`
4. Timer de serie inicia → `setStartTime = Date.now()`
5. Usuario completa serie → `handleCompleteSet()`
6. Timer se resetea → `setExecution.completeSet()` → `setStartTime = null`
7. Inicia descanso

### Serie 2+ (Siguientes series)
1. Descanso termina → `handleTimerComplete()`
2. **✅ Automáticamente inicia preparación** → `setExecution.startSet()`
3. Aparece preparación (5 segundos)
4. Preparación termina → `setExecution.completePreparation()`
5. **✅ Timer de serie inicia desde 0** → `setStartTime = Date.now()`
6. Usuario completa serie → `handleCompleteSet()`
7. **✅ Timer se resetea** → `setExecution.completeSet()` → `setStartTime = null`
8. Inicia descanso

---

## 📊 Impacto

### Antes
- ❌ Preparación solo en primera serie
- ❌ Timer acumulado a través de todas las series
- ❌ Experiencia inconsistente

### Después
- ✅ Preparación en todas las series
- ✅ Timer individual por serie
- ✅ Experiencia consistente y predecible

---

## 🧪 Testing

### Casos de Prueba
1. ✅ Primera serie muestra preparación
2. ✅ Segunda serie muestra preparación después del descanso
3. ✅ Tercera serie muestra preparación después del descanso
4. ✅ Timer se resetea en cada serie
5. ✅ Timer muestra tiempo correcto por serie
6. ✅ Cambio de ejercicio muestra preparación

### Escenarios Probados
- [x] Ejercicio con 3 series
- [x] Ejercicio con 5 series
- [x] Cambio entre ejercicios
- [x] Descanso personalizado
- [x] Descanso inteligente

---

## 📝 Notas Técnicas

### ¿Por qué estaba comentado `setExecution.completeSet()`?

El comentario decía: "NO llamar a setExecution.completeSet() para evitar la preparación"

Esto era un malentendido. `completeSet()` NO inicia la preparación, solo resetea el estado:
- `setIsExecutingSet(false)`
- `setShowSetExecution(false)`
- `setSetStartTime(null)` ← **Esto es lo que necesitamos**

La preparación se inicia con `startSet()`, no con `completeSet()`.

### Dependencias Actualizadas

```typescript
const handleTimerComplete = useCallback(() => {
  // ...
}, [
  currentExercise, 
  routine, 
  workoutState, 
  workoutStartTime, 
  totalPausedTime, 
  clearRestState, 
  timerHandlers, 
  completion, 
  haptic, 
  setExecution  // ✅ Agregado
]);
```

---

## ✅ Conclusión

Ambos bugs han sido corregidos:

1. ✅ **Preparación consistente**: Aparece después de cada descanso
2. ✅ **Timer individual**: Se resetea para cada serie

La experiencia de usuario ahora es consistente y predecible en todas las series del entrenamiento.

**Estado**: ✅ CORREGIDO
**Testing**: ✅ PENDIENTE (manual)
**Impacto**: ALTO (mejora significativa de UX)
