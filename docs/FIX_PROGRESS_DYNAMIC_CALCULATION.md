# Fix: Progreso Dinámico al Agregar Ejercicios/Series

## Problema
Cuando se agregan ejercicios o series durante el entrenamiento, el porcentaje de progreso no se actualiza correctamente para reflejar el nuevo total de series.

## Análisis

### Cálculo Anterior en CompactWorkoutHeader
El progreso se calculaba basándose en el índice del ejercicio actual:

```tsx
const progress = useMemo(() => {
  return ((currentExerciseIndex + 1) / totalExercises) * 100;
}, [currentExerciseIndex, totalExercises]);
```

**Problemas:**
1. No considera las series individuales, solo ejercicios completos
2. No se actualiza cuando se agregan series a un ejercicio existente
3. No refleja el progreso real del entrenamiento

**Ejemplo del problema:**
- Rutina inicial: 3 ejercicios con 4 series cada uno = 12 series totales
- Usuario completa 6 series (50% del progreso real)
- Progreso mostrado: 33% (1 de 3 ejercicios)
- Usuario agrega 1 ejercicio con 4 series = 16 series totales
- Progreso real debería ser: 37.5% (6 de 16 series)
- Progreso mostrado seguía siendo: 33% ❌

### Cálculo en QuickEditMode (Correcto)
El modo de edición rápida ya calculaba correctamente el progreso:

```tsx
const { totalSets, completedSets, progressPercent } = useMemo(() => {
  const total = routine.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completed = Object.values(workoutData.actualReps).reduce((sum, reps) => 
    sum + reps.filter(r => r > 0).length, 0
  );
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { totalSets: total, completedSets: completed, progressPercent: percent };
}, [routine.exercises, workoutData.actualReps]);
```

**Ventajas:**
1. Cuenta todas las series de todos los ejercicios
2. Se actualiza automáticamente cuando cambia `routine.exercises`
3. Se actualiza cuando cambia `workoutData.actualReps`
4. Refleja el progreso real del entrenamiento

## Solución Implementada

### Actualizar CompactWorkoutHeader
Cambiado el cálculo del progreso para que use el mismo método que QuickEditMode:

```tsx
// Calcular progreso basado en series completadas vs total de series
const progress = useMemo(() => {
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSetsCount = Object.values(actualReps).reduce((sum, reps) => 
    sum + reps.filter(r => r > 0).length, 0
  );
  return totalSets > 0 ? Math.round((completedSetsCount / totalSets) * 100) : 0;
}, [exercises, actualReps]);
```

**Dependencias del useMemo:**
- `exercises`: Array de ejercicios de la rutina (se actualiza al agregar/eliminar ejercicios o series)
- `actualReps`: Objeto con las repeticiones completadas (se actualiza al completar series)

## Comportamiento Resultante

### Escenario 1: Agregar Ejercicio Durante Entrenamiento
**Antes:**
1. Rutina: 3 ejercicios × 4 series = 12 series totales
2. Completadas: 6 series
3. Progreso: 33% (basado en 1/3 ejercicios) ❌
4. Agregar 1 ejercicio con 4 series
5. Progreso: 25% (basado en 1/4 ejercicios) ❌

**Después:**
1. Rutina: 3 ejercicios × 4 series = 12 series totales
2. Completadas: 6 series
3. Progreso: 50% (6/12 series) ✓
4. Agregar 1 ejercicio con 4 series → 16 series totales
5. Progreso: 37.5% → 38% redondeado (6/16 series) ✓

### Escenario 2: Agregar Series a Ejercicio Existente
**Antes:**
1. Ejercicio con 4 series, 2 completadas
2. Progreso: 33% (basado en ejercicios)
3. Agregar 2 series al ejercicio → 6 series totales
4. Progreso: 33% (sin cambio) ❌

**Después:**
1. Ejercicio con 4 series, 2 completadas
2. Progreso: 50% (2/4 series del ejercicio)
3. Agregar 2 series al ejercicio → 6 series totales
4. Progreso: 33% (2/6 series) ✓

### Escenario 3: Eliminar Series
**Antes:**
1. Rutina: 12 series, 6 completadas
2. Progreso: 33% (basado en ejercicios)
3. Eliminar 1 serie → 11 series totales
4. Progreso: 33% (sin cambio) ❌

**Después:**
1. Rutina: 12 series, 6 completadas
2. Progreso: 50% (6/12 series)
3. Eliminar 1 serie → 11 series totales
4. Progreso: 54.5% → 55% redondeado (6/11 series) ✓

## Consistencia Entre Componentes

Ahora ambos componentes calculan el progreso de la misma manera:

### CompactWorkoutHeader (Modo Guiado)
```tsx
const progress = useMemo(() => {
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSetsCount = Object.values(actualReps).reduce((sum, reps) => 
    sum + reps.filter(r => r > 0).length, 0
  );
  return totalSets > 0 ? Math.round((completedSetsCount / totalSets) * 100) : 0;
}, [exercises, actualReps]);
```

### QuickEditMode (Modo Edición Rápida)
```tsx
const { totalSets, completedSets, progressPercent } = useMemo(() => {
  const total = routine.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completed = Object.values(workoutData.actualReps).reduce((sum, reps) => 
    sum + reps.filter(r => r > 0).length, 0
  );
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { totalSets: total, completedSets: completed, progressPercent: percent };
}, [routine.exercises, workoutData.actualReps]);
```

Ambos usan la misma lógica: `(series completadas / total de series) × 100`

## Beneficios

1. **Progreso Real**: El porcentaje refleja el progreso real del entrenamiento basado en series
2. **Actualización Dinámica**: Se recalcula automáticamente al agregar/eliminar ejercicios o series
3. **Consistencia**: Ambos modos (guiado y edición rápida) muestran el mismo progreso
4. **Motivación**: El usuario ve su progreso real, no una aproximación basada en ejercicios
5. **Precisión**: Considera que diferentes ejercicios pueden tener diferente número de series

## Archivos Modificados
- `app/workout/[id]/components/CompactWorkoutHeader.tsx`

## Testing
Para verificar el fix:
1. Iniciar un entrenamiento con 3 ejercicios de 4 series cada uno
2. Completar 6 series (2 ejercicios completos)
3. Verificar que el progreso muestra 50% (6/12)
4. Agregar un nuevo ejercicio con 4 series
5. Verificar que el progreso se actualiza a 38% (6/16)
6. Agregar 2 series a un ejercicio existente
7. Verificar que el progreso se actualiza correctamente
8. Completar más series y verificar que el porcentaje aumenta proporcionalmente
