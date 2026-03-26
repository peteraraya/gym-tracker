# Fix: Consistencia en Tiempo de Descanso

## Problema
Había inconsistencias en el tiempo de descanso mostrado en tres lugares diferentes:
- Toast de sugerencias: mostraba un valor
- Tabla de series: mostraba otro valor
- Timer de descanso: mostraba un tercer valor

**Ejemplo reportado por usuario:**
- Toast: "3 minutos configurados"
- Tabla: "1 minuto 30 segundos"
- Timer: "1 minuto 50 segundos"

## Causa Raíz
El hook `useWorkoutSuggestions` usaba una lógica simplificada para calcular el tiempo de descanso que NO consideraba:
1. Overrides por serie individual (`perSetRestOverrides`)
2. Configuración de descanso inteligente (`useSmartRest`)
3. La lógica completa de `calculateNextRestTime`

Esto causaba que el toast mostrara un valor diferente al que realmente se usaba en el timer y la tabla.

## Solución

### 1. Actualizado `useWorkoutSuggestions.ts`
- Agregado import de `calculateNextRestTime`
- Agregados parámetros `perSetRestOverrides` y `useSmartRest` a la interface
- Reemplazada lógica simplificada con llamada a `calculateNextRestTime`

```typescript
// ANTES: Lógica simplificada
const currentRestTime = restOverrides[currentExercise.id] || routine?.restBetweenSets || 60;

// DESPUÉS: Usa la misma lógica que el timer
const currentRestTime = calculateNextRestTime({
  currentExercise,
  routine,
  restOverrides,
  perSetOverrides: perSetRestOverrides,
  currentSet,
  useSmartRest
});
```

### 2. Actualizado `app/workout/[id]/page.tsx`
- Agregados parámetros faltantes al llamar `useWorkoutSuggestions`:
  - `perSetRestOverrides: workoutState.workoutData.perSetRestOverrides`
  - `useSmartRest: useSmartRest`

### 3. Agregadas validaciones de seguridad en `workoutCalculations.ts`
- Agregado optional chaining (`?.`) para prevenir errores cuando `perSetOverrides` o `restOverrides` son undefined
- Esto previene el error: "Cannot read properties of undefined"

```typescript
// ANTES
if (perSetOverrides[currentExercise.id]?.[setIndex]) {
if (restOverrides[currentExercise.id]) {

// DESPUÉS
if (perSetOverrides?.[currentExercise.id]?.[setIndex]) {
if (restOverrides?.[currentExercise.id]) {
```

### 4. Actualizado `SeriesTable.tsx` para mostrar tiempo correcto
- Agregada función `getRestTimeForSet` que usa `calculateNextRestTime` para cada serie
- Agregados props `routine`, `restOverrides`, `useSmartRest` al componente
- Actualizados ambos selectores (mobile y desktop) para usar `getRestTimeForSet(idx)` en lugar del fallback incorrecto
- Ahora los selectores muestran el tiempo que realmente se usará en el timer

```typescript
// ANTES: Fallback incorrecto
value={perSetRestOverrides?.[exerciseId]?.[idx] || exercise.restBetweenSets || 90}

// DESPUÉS: Usa la misma lógica que el timer
value={getRestTimeForSet(idx)}
```

### 5. Actualizado `app/workout/[id]/page.tsx` (llamada a SeriesTable)
- Agregados props faltantes al renderizar SeriesTable:
  - `routine={routine}`
  - `restOverrides={workoutState.workoutData.restOverrides}`
  - `useSmartRest={useSmartRest}`

## Prioridad de Descanso (Fuente de Verdad)
La función `calculateNextRestTime` implementa la siguiente prioridad:

1. **Override por serie** (`perSetRestOverrides[exerciseId][setIndex]`) - Edición manual durante workout
2. **Override por ejercicio** (`restOverrides[exerciseId]`) - Edición manual durante workout
3. **Configuración de rutina** (`routine.restBetweenSets`) - ⭐ Tiene prioridad sobre smart rest
4. **Configuración del ejercicio** (`exercise.restBetweenSets`) - Configuración manual por ejercicio
5. **Descanso inteligente** (solo si `useSmartRest !== false` y no hay configuración manual)
6. **Default** (60 segundos)

### Cambio Importante
Anteriormente, el descanso inteligente tenía prioridad sobre la configuración de la rutina, lo que causaba que se ignorara el tiempo configurado manualmente. Ahora la configuración de la rutina tiene prioridad, asegurando que el tiempo que el usuario configuró al crear/editar la rutina se respete.

## Resultado
Ahora los tres lugares usan la misma fuente de verdad:
- ✅ Toast muestra el tiempo correcto
- ✅ Tabla muestra el tiempo correcto
- ✅ Timer usa el tiempo correcto

## Archivos Modificados
- `app/workout/[id]/hooks/useWorkoutSuggestions.ts` - Agregados nuevos parámetros
- `app/workout/[id]/page.tsx` - Actualizada llamada al hook y a SeriesTable
- `app/workout/[id]/utils/workoutCalculations.ts` - Agregadas validaciones de seguridad
- `app/workout/[id]/components/SeriesTable.tsx` - Agregada función para calcular tiempo correcto por serie

## Testing
Para verificar el fix:
1. Configurar una rutina con descanso de 90 segundos
2. Configurar un override de ejercicio de 120 segundos
3. Configurar un override de serie de 60 segundos
4. Verificar que toast, tabla y timer muestren 60 segundos (prioridad más alta)
5. Eliminar override de serie, verificar que todos muestren 120 segundos
6. Eliminar override de ejercicio, verificar que todos muestren 90 segundos
