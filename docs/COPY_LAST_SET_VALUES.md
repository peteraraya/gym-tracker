# Copiar Valores de la Última Serie al Agregar Nueva

## Descripción
Cuando se agrega una nueva serie a un ejercicio, automáticamente se copian los valores (reps, peso, descanso) de la última serie existente. Esto hace mucho más rápido y práctico agregar series cuando se mantienen los mismos valores.

## Implementación

Esta funcionalidad está implementada en todos los lugares donde se pueden agregar series:

### 1. RoutineForm.tsx (Crear/Editar Rutinas)

```typescript
const handleAddSet = (exerciseIndex: number) => {
  const newExercises = [...exercises];
  const exercise = newExercises[exerciseIndex];
  const lastSet = exercise.sets[exercise.sets.length - 1];
  
  exercise.sets.push({ 
    reps: lastSet?.reps || 10,        // Copia reps de última serie o 10 por defecto
    weight: lastSet?.weight || 0,      // Copia peso de última serie o 0 por defecto
    type: 'normal'                     // Tipo por defecto
  });
  
  setExercises(newExercises);
};
```

### 2. EditSessionModal.tsx (Editar Sesión Guardada)

```typescript
const addSet = (exerciseIndex: number) => {
  const updated = { ...editedSession };
  const exercise = updated.exercises[exerciseIndex];
  
  if (!exercise.actualReps) exercise.actualReps = [];
  if (!exercise.actualWeight) exercise.actualWeight = [];
  
  // Obtener valores de la última serie
  const lastReps = exercise.actualReps.length > 0 
    ? exercise.actualReps[exercise.actualReps.length - 1] 
    : 0;
  const lastWeight = exercise.actualWeight.length > 0 
    ? exercise.actualWeight[exercise.actualWeight.length - 1] 
    : 0;
  
  // Agregar nueva serie con valores copiados
  exercise.actualReps.push(lastReps);
  exercise.actualWeight.push(lastWeight);
  
  setEditedSession(updated);
};
```

### 3. Workout Page - handleAddSet (Durante Entrenamiento)

```typescript
const handleAddSet = useCallback(async () => {
  if (!currentExercise || !routine) return;
  
  const exerciseId = currentExercise.id;
  const lastSet = currentExercise.sets[currentExercise.sets.length - 1];
  
  // Crear nueva serie copiando valores de la última
  const newSet = {
    reps: lastSet.reps,
    weight: lastSet.weight || 0,
    restAfter: lastSet.restAfter || currentExercise.restBetweenSets || 90
  };
  
  // Agregar y guardar...
}, [currentExercise, routine, ...]);
```

### 4. Workout Page - handleQuickAddSet (Modo Edición Rápida)

```typescript
const handleQuickAddSet = useCallback(async (exerciseId: string) => {
  const exercise = routine?.exercises.find((ex: Exercise) => ex.id === exerciseId);
  if (!exercise || !routine) return;
  
  const lastSet = exercise.sets[exercise.sets.length - 1];
  
  // Crear nueva serie copiando valores
  const newSet = {
    reps: lastSet.reps,
    weight: lastSet.weight || 0,
    restAfter: lastSet.restAfter || exercise.restBetweenSets || 90
  };
  
  // Agregar y guardar...
}, [routine, ...]);
```

## Comportamiento

### Valores Copiados
- **Reps**: Número de repeticiones de la última serie
- **Peso**: Peso usado en la última serie
- **Descanso**: Tiempo de descanso de la última serie (solo en workout)
- **Tipo**: Siempre "normal" por defecto (en RoutineForm)

### Valores por Defecto (Primera Serie)
Si no hay series previas, se usan valores por defecto:
- **Reps**: 10
- **Peso**: 0
- **Descanso**: 90 segundos o el configurado en el ejercicio

### Editabilidad
Los valores copiados son completamente editables. Solo sirven como punto de partida para ahorrar tiempo.

## Casos de Uso

### Caso 1: Series con Mismo Peso
```
Serie 1: 12 reps × 50kg
Serie 2: 12 reps × 50kg  ← Copiado automáticamente
Serie 3: 12 reps × 50kg  ← Copiado automáticamente
```
Solo necesitas hacer clic en "Agregar Serie" 2 veces.

### Caso 2: Progresión de Peso
```
Serie 1: 12 reps × 50kg
Serie 2: 12 reps × 50kg  ← Copiado, luego editas a 52.5kg
Serie 3: 12 reps × 52.5kg ← Copiado con el nuevo peso
```
Cada nueva serie copia la anterior, facilitando progresiones.

### Caso 3: Pirámide Descendente
```
Serie 1: 8 reps × 60kg
Serie 2: 8 reps × 60kg   ← Copiado, luego editas a 10 reps × 55kg
Serie 3: 10 reps × 55kg  ← Copiado con los nuevos valores
```

## Ventajas

1. **Ahorro de Tiempo**: No necesitas escribir los mismos valores repetidamente
2. **Menos Errores**: Reduces errores de tipeo al copiar automáticamente
3. **Flujo Natural**: Refleja cómo realmente entrenas (series similares)
4. **Flexible**: Puedes editar cualquier valor después de copiar
5. **Consistente**: Funciona igual en todos los formularios

## Lugares Implementados

- ✅ RoutineForm (Crear/Editar rutinas)
- ✅ EditSessionModal (Editar sesiones guardadas)
- ✅ Workout Page - handleAddSet (Agregar serie al ejercicio actual)
- ✅ Workout Page - handleQuickAddSet (Agregar serie en modo edición rápida)

## Mejoras Futuras

- Opción para copiar de cualquier serie anterior (no solo la última)
- Copiar también el tipo de serie (normal, calentamiento, dropset, etc.)
- Sugerencias inteligentes basadas en historial
- Copiar series de entrenamientos anteriores
