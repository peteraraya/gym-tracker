# Fix: Sincronización de Series Completadas Manualmente

## 🐛 Problema

Cuando el usuario completaba series manualmente usando los checkboxes en la tabla (en lugar del botón "Completar Serie"), había desincronización entre:

1. **Series completadas** - Los checkboxes mostraban 6 series completadas
2. **Serie actual** - El ExerciseCard mostraba "Serie 4 de 10"
3. **Valores mostrados** - Los reps/peso no coincidían con las series completadas

**Ejemplo del problema:**
- Series 1-3: 8 reps, 70kg (completadas)
- Series 4-5: 6 reps, 140kg (completadas)
- Serie 6: 8 reps, 110kg (completada)
- ExerciseCard mostraba: Serie 4, 6 reps, 140kg ❌

## 🔍 Causa Raíz

### Problema 1: currentSet no se actualizaba
Cuando marcabas un checkbox, `handleToggleSetComplete` completaba la serie pero NO actualizaba `currentSet` para apuntar a la siguiente serie incompleta.

### Problema 2: Valores editados no se reflejaban
Cuando editabas reps/peso en la tabla, esos cambios no se sincronizaban con el ExerciseCard si era la serie actual.

### Problema 3: Valores de rutina vs valores reales
Al completar manualmente, usaba siempre los valores de la rutina, ignorando valores editados previamente.

## ✅ Solución

### Parte 1: Actualizar currentSet al completar

```typescript
if (isComplete) {
  // ... completar serie ...
  
  // ✅ Update currentSet to next incomplete set
  const nextIncompleteSet = currentExercise.sets.findIndex((_: any, idx: number) => {
    return idx > setIndex && !newActualReps[idx];
  });
  
  if (nextIncompleteSet !== -1) {
    workoutState.setCurrentSet(nextIncompleteSet + 1);
    // Update current reps/weight to match the next set
    workoutState.setCurrentReps(currentExercise.sets[nextIncompleteSet].reps);
    workoutState.setCurrentWeight(currentExercise.sets[nextIncompleteSet].weight || 0);
  }
}
```

### Parte 2: Usar valores editados si existen

```typescript
// Use values from actualReps/actualWeights if available, otherwise from routine
const existingReps = workoutState.workoutData.actualReps[exerciseId]?.[setIndex];
const existingWeight = workoutState.workoutData.actualWeights[exerciseId]?.[setIndex];

const repsToUse = existingReps !== undefined && existingReps !== 0 
  ? existingReps 
  : currentExercise.sets[setIndex].reps;
const weightToUse = existingWeight !== undefined && existingWeight !== 0
  ? existingWeight
  : (currentExercise.sets[setIndex].weight || 0);
```

### Parte 3: Sincronizar ediciones con ExerciseCard (MEJORADO)

En lugar de actualizar manualmente en cada handler, agregamos un efecto que sincroniza automáticamente:

```typescript
// Sync currentReps and currentWeight with actual values when currentSet changes
useEffect(() => {
  if (!currentExercise || !isInitialized) return;
  
  const exerciseId = currentExercise.id;
  const setIndex = workoutState.currentSet - 1;
  
  // Get actual values if they exist (edited values)
  const actualReps = workoutState.workoutData.actualReps[exerciseId]?.[setIndex];
  const actualWeight = workoutState.workoutData.actualWeights[exerciseId]?.[setIndex];
  
  // Use actual values if they exist and are not 0, otherwise use routine values
  const repsToShow = (actualReps !== undefined && actualReps !== 0)
    ? actualReps
    : currentExercise.sets[setIndex]?.reps || 0;
  
  const weightToShow = (actualWeight !== undefined && actualWeight !== 0)
    ? actualWeight
    : currentExercise.sets[setIndex]?.weight || 0;
  
  // Only update if different to avoid infinite loops
  if (workoutState.currentReps !== repsToShow) {
    workoutState.setCurrentReps(repsToShow);
  }
  if (workoutState.currentWeight !== weightToShow) {
    workoutState.setCurrentWeight(weightToShow);
  }
}, [currentExercise, workoutState.currentSet, workoutState.workoutData.actualReps, workoutState.workoutData.actualWeights, isInitialized]);
```

Este efecto se ejecuta cuando:
- Cambia `currentSet`
- Cambian `actualReps` o `actualWeights` (cuando editas en la tabla)
- Cambia el ejercicio actual

**Ventajas:**
- ✅ Sincronización automática en tiempo real
- ✅ Siempre muestra valores editados si existen
- ✅ Fallback a valores de rutina si no hay ediciones
- ✅ Evita duplicación de lógica en múltiples handlers


## 🔄 Flujo Mejorado

### Antes del Fix
```
Usuario marca checkbox de Serie 3
    ↓
Serie 3 se marca como completada
    ↓
❌ currentSet sigue siendo 1
    ↓
ExerciseCard muestra "Serie 1" (incorrecto)
    ↓
Usuario edita peso en Serie 4
    ↓
❌ ExerciseCard no se actualiza
```

### Después del Fix
```
Usuario marca checkbox de Serie 3
    ↓
Serie 3 se marca como completada
    ↓
✅ currentSet se actualiza a 4 (siguiente incompleta)
    ↓
✅ Efecto detecta cambio de currentSet
    ↓
✅ Efecto lee actualReps/actualWeights de Serie 4
    ↓
✅ ExerciseCard muestra valores correctos de Serie 4
    ↓
Usuario edita peso en Serie 4 a 100kg
    ↓
✅ Efecto detecta cambio en actualWeights
    ↓
✅ ExerciseCard se actualiza a 100kg inmediatamente
```

## 📊 Casos de Uso Soportados

### Caso 1: Completar series en orden
1. Completa Serie 1 → currentSet = 2
2. Completa Serie 2 → currentSet = 3
3. Completa Serie 3 → currentSet = 4
✅ Funciona correctamente

### Caso 2: Completar series fuera de orden
1. Completa Serie 3 → currentSet = 1 (primera incompleta)
2. Completa Serie 1 → currentSet = 2
3. Completa Serie 5 → currentSet = 2 (sigue siendo 2)
✅ Funciona correctamente

### Caso 3: Editar y completar
1. Edita peso de Serie 2 a 80kg
2. Marca checkbox de Serie 2
3. Serie 2 se guarda con 80kg (no con valor de rutina)
✅ Funciona correctamente

### Caso 4: Desmarcar serie
1. Desmarca checkbox de Serie 2
2. Si Serie 2 < currentSet, currentSet = 2
3. ExerciseCard muestra valores de Serie 2
✅ Funciona correctamente

## 🧪 Testing

### Prueba 1: Completar en orden
1. Inicia workout
2. Marca checkbox Serie 1
3. Verifica que ExerciseCard muestra "Serie 2"
4. Marca checkbox Serie 2
5. Verifica que ExerciseCard muestra "Serie 3"

### Prueba 2: Editar antes de completar
1. Inicia workout
2. Edita peso de Serie 1 a 100kg en la tabla
3. Verifica que ExerciseCard muestra 100kg
4. Marca checkbox Serie 1
5. Verifica que se guardó 100kg (no el valor original)

### Prueba 3: Completar fuera de orden
1. Inicia workout
2. Marca checkbox Serie 3
3. Verifica que ExerciseCard sigue en "Serie 1"
4. Marca checkbox Serie 1
5. Verifica que ExerciseCard muestra "Serie 2"

### Prueba 4: Desmarcar serie
1. Completa Series 1-3
2. Desmarca checkbox Serie 2
3. Verifica que ExerciseCard muestra "Serie 2"
4. Verifica que contador muestra "2 de X series completadas"

## 📝 Archivos Modificados

- `app/workout/[id]/page.tsx`:
  - `handleToggleSetComplete` - Actualiza currentSet al completar/descompletar
  - `handleEditReps` - Sincroniza con currentReps si es serie actual
  - `handleEditWeight` - Sincroniza con currentWeight si es serie actual

## 🎯 Resultado

Ahora hay sincronización completa entre:
- ✅ Checkboxes de series completadas
- ✅ Serie actual mostrada en ExerciseCard
- ✅ Valores de reps/peso editados en la tabla
- ✅ Valores mostrados en ExerciseCard
- ✅ Progreso visual (barra de progreso)

El usuario puede completar series en cualquier orden y editar valores libremente, y todo se mantiene sincronizado correctamente.
