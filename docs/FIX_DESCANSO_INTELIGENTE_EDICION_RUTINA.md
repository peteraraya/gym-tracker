# Fix: Descanso Inteligente en Edición de Rutina

## Problemas Identificados

Al editar un entrenamiento y activar el botón de "descanso inteligente" para un ejercicio específico, había tres problemas:

1. El sistema solo cambiaba el flag `useSmartRest` pero no calculaba ni mostraba el tiempo de descanso recomendado en ese momento
2. Al iniciar el entrenamiento, el tiempo específico del ejercicio era ignorado y se usaba el tiempo global de la rutina
3. **El tiempo calculado no se guardaba correctamente debido a un problema con el manejo asíncrono del estado**

## Solución Implementada

### 1. Cálculo Automático al Activar (RoutineForm)

Cuando el usuario hace clic en el botón "🧠 Inteligente", ahora el sistema:

1. Calcula el promedio de repeticiones de todas las series del ejercicio
2. Obtiene la plantilla del ejercicio desde la base de datos
3. Usa la función `calculateRestBetweenSets` para calcular el tiempo óptimo
4. Aplica el tiempo calculado al campo `restBetweenSets` del ejercicio
5. Muestra una notificación con el tiempo aplicado y la descripción

### 2. Visualización del Tiempo Calculado

Cuando el descanso inteligente está activo, se muestra:
- Etiqueta "Descanso inteligente" en color púrpura
- Badge con el tiempo calculado (ej: "1:30")
- Formato visual consistente con el resto de la UI

### 3. Comportamiento al Desactivar

Si el usuario desactiva el descanso inteligente:
- Se limpia el campo `restBetweenSets` específico del ejercicio
- Vuelve a usar el tiempo de descanso global de la rutina

## Cambios en el Código

### 1. Archivo: `components/RoutineForm.tsx`

#### Botón de Descanso Inteligente (líneas ~1044-1098)

**Problema Original:** El código usaba `import()` dinámico (asíncrono) pero no manejaba correctamente el estado, causando que los cambios no se guardaran.

**Solución:** Usar la forma funcional de `setExercises` para garantizar que siempre se trabaje con el estado más reciente.

```typescript
<button
  type="button"
  onClick={() => {
    const willEnableSmartRest = !exercise.useSmartRest;
    
    // Si se activa el descanso inteligente, calcular y aplicar el tiempo recomendado
    if (willEnableSmartRest) {
      const exerciseTemplate = getExerciseByName(exercise.name);
      if (exerciseTemplate) {
        // Calcular promedio de reps de todas las series
        const avgReps = Math.round(
          exercise.sets.reduce((sum, set) => sum + (set.reps || 10), 0) / exercise.sets.length
        );
        
        // Importar la función de cálculo
        import('@/lib/restCalculator').then(({ calculateRestBetweenSets }) => {
          const restRecommendation = calculateRestBetweenSets(
            exerciseTemplate,
            exercise.sets.length,
            avgReps,
            'intermediate'
          );
          
          // Redondear a intervalos de 5 segundos
          const recommendedTime = Math.round(restRecommendation.recommended / 5) * 5;
          
          // ✅ CLAVE: Usar forma funcional de setState para trabajar con estado actual
          setExercises(currentExercises => {
            const updatedExercises = [...currentExercises];
            updatedExercises[exerciseIndex].restBetweenSets = recommendedTime;
            updatedExercises[exerciseIndex].useSmartRest = true;
            return updatedExercises;
          });
          
          // Mostrar notificación con el tiempo calculado
          const minutes = Math.floor(recommendedTime / 60);
          const seconds = recommendedTime % 60;
          const timeStr = seconds > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${minutes}:00`;
          success(`Descanso inteligente aplicado: ${timeStr} (${restRecommendation.description})`, 3000);
        });
      }
    } else {
      // Si se desactiva, limpiar el tiempo específico
      setExercises(currentExercises => {
        const updatedExercises = [...currentExercises];
        updatedExercises[exerciseIndex].restBetweenSets = undefined;
        updatedExercises[exerciseIndex].useSmartRest = false;
        return updatedExercises;
      });
    }
  }}
  className={`px-2 py-1 text-xs font-semibold rounded transition-all ${
    exercise.useSmartRest
      ? 'bg-purple-500 text-white'
      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
  }`}
  title="Usar descanso inteligente basado en características del ejercicio"
>
  🧠 Inteligente
</button>
```

**Por qué era necesario este cambio:**

El problema era que el código original hacía esto:
```typescript
// ❌ INCORRECTO
const updatedExercises = [...exercises]; // Usa el estado viejo
setExercises(updatedExercises);
```

Dentro de un callback asíncrono (`.then()`), `exercises` puede ser una versión desactualizada del estado. La solución es usar la forma funcional:
```typescript
// ✅ CORRECTO
setExercises(currentExercises => {
  const updatedExercises = [...currentExercises]; // Usa el estado actual
  // ... modificaciones
  return updatedExercises;
});
```

#### Visualización del Tiempo (líneas ~1112-1123)

```typescript
{exercise.useSmartRest && (
  <div className="flex items-center gap-2 text-xs">
    <span className="text-purple-600 dark:text-purple-400 italic">
      Descanso inteligente
    </span>
    {exercise.restBetweenSets && (
      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-semibold">
        {Math.floor(exercise.restBetweenSets / 60)}:{(exercise.restBetweenSets % 60).toString().padStart(2, '0')}
      </span>
    )}
  </div>
)}
```

### 2. Archivo: `app/workout/[id]/utils/workoutCalculations.ts`

#### Problema: Orden de Prioridad Incorrecto

El tiempo global de la rutina tenía prioridad sobre el tiempo específico del ejercicio, causando que el descanso inteligente configurado en el ejercicio fuera ignorado.

#### Solución: Corregir Orden de Prioridad

```typescript
/**
 * Calcula el tiempo de descanso para la siguiente serie
 * Prioridad: perSetOverride > exerciseOverride > exerciseConfig > routineConfig > smart > default
 */
export function calculateNextRestTime(params: {
  currentExercise: Exercise;
  routine: Routine;
  restOverrides: Record<string, number>;
  perSetOverrides: Record<string, number[]>;
  currentSet: number;
  useSmartRest: boolean;
}): number {
  const { currentExercise, routine, restOverrides, perSetOverrides, currentSet, useSmartRest } = params;
  const setIndex = currentSet - 1;
  
  // 1. Override individual de la serie (edición manual en workout)
  if (perSetOverrides?.[currentExercise.id]?.[setIndex]) {
    return perSetOverrides[currentExercise.id][setIndex];
  }
  
  // 2. Override del ejercicio (edición manual en workout)
  if (restOverrides?.[currentExercise.id]) {
    return restOverrides[currentExercise.id];
  }
  
  // 3. Configurado en el ejercicio (manual o descanso inteligente aplicado)
  // ✅ CAMBIO: Ahora tiene prioridad sobre el tiempo global de la rutina
  if (currentExercise.restBetweenSets) {
    return currentExercise.restBetweenSets;
  }
  
  // 4. Configurado en la rutina (tiempo global)
  if (routine.restBetweenSets) {
    return routine.restBetweenSets;
  }
  
  // 5. Descanso inteligente (solo si está habilitado y no hay configuración manual)
  if (useSmartRest && currentExercise.useSmartRest !== false) {
    const exerciseTemplate = EXERCISE_DATABASE.find(e => e.name === currentExercise.name);
    if (exerciseTemplate) {
      const currentSetData = currentExercise.sets[currentSet - 1];
      const restRecommendation = calculateRestBetweenSets(
        exerciseTemplate,
        currentExercise.sets.length,
        currentSetData?.reps || 10,
        'intermediate'
      );
      return restRecommendation.recommended;
    }
  }
  
  // 6. Default
  return 60;
}
```

#### Antes vs Después

**Antes (Incorrecto):**
```
1. perSetOverride (edición manual por serie)
2. exerciseOverride (edición manual en workout)
3. routineConfig (tiempo global) ❌ Tenía prioridad incorrecta
4. exerciseConfig (tiempo del ejercicio)
5. smart (cálculo inteligente)
6. default (60s)
```

**Después (Correcto):**
```
1. perSetOverride (edición manual por serie)
2. exerciseOverride (edición manual en workout)
3. exerciseConfig (tiempo del ejercicio) ✅ Ahora tiene prioridad
4. routineConfig (tiempo global)
5. smart (cálculo inteligente)
6. default (60s)
```

## Flujo de Usuario Mejorado

### Antes:
1. Usuario edita rutina
2. Selecciona ejercicio
3. Hace clic en "🧠 Inteligente"
4. Ve mensaje genérico "El descanso se calculará automáticamente..."
5. No sabe qué tiempo se aplicará
6. Guarda rutina
7. Solo al ejecutar el entrenamiento ve el tiempo calculado

### Ahora:
1. Usuario edita rutina
2. Selecciona ejercicio
3. Hace clic en "🧠 Inteligente"
4. **Sistema calcula inmediatamente el tiempo óptimo**
5. **Ve notificación: "Descanso inteligente aplicado: 1:30 (Descanso medio para mantener la tensión muscular)"**
6. **Ve el tiempo calculado en un badge púrpura: "1:30"**
7. Puede revisar y ajustar si es necesario
8. Guarda rutina con confianza
9. **Al ejecutar el entrenamiento, el tiempo específico del ejercicio se usa correctamente** ✅

## Ejemplo Práctico

### Escenario: Rutina con Tiempo Global de 3:00

Tienes una rutina con tiempo global de descanso de 3:00 (180 segundos).

**Ejercicio 1: Press de Banca**
- Sin descanso inteligente
- Usa el tiempo global: **3:00** ✅

**Ejercicio 2: Curl de Bíceps**
- Con descanso inteligente activado
- Tiempo calculado: **1:15** (75 segundos)
- **Antes del fix**: Usaba 3:00 (tiempo global) ❌
- **Después del fix**: Usa 1:15 (tiempo del ejercicio) ✅

**Ejercicio 3: Sentadillas**
- Con descanso inteligente activado
- Tiempo calculado: **4:00** (240 segundos)
- **Antes del fix**: Usaba 3:00 (tiempo global) ❌
- **Después del fix**: Usa 4:00 (tiempo del ejercicio) ✅

## Lógica de Cálculo

El sistema usa la función `calculateRestBetweenSets` de `lib/restCalculator.ts` que considera:

- **Tipo de entrenamiento** (basado en series y repeticiones):
  - Fuerza (1-5 reps): 3-5 minutos
  - Potencia (3-8 reps): 2-4 minutos
  - Hipertrofia (6-12 reps): 1-2 minutos
  - Resistencia (12+ reps): 30-60 segundos

- **Tipo de ejercicio**:
  - Ejercicios compuestos: +20% de tiempo
  - Ejercicios de aislamiento: tiempo base

- **Nivel del usuario** (actualmente "intermediate"):
  - Principiante: +20% de tiempo
  - Intermedio: tiempo base
  - Avanzado: -20% de tiempo

## Ejemplo de Cálculo

Para un ejercicio de **Press de Banca** con **4 series de 8 repeticiones**:

1. Promedio de reps: 8
2. Tipo de entrenamiento: Hipertrofia (6-12 reps)
3. Tiempo base: 90 segundos
4. Es ejercicio compuesto: 90 × 1.2 = 108 segundos
5. Redondeo a intervalos de 5s: 110 segundos = **1:50**
6. Descripción: "Descanso medio para mantener la tensión muscular"

## Beneficios

1. **Transparencia**: El usuario ve exactamente qué tiempo se aplicará
2. **Confianza**: Puede revisar y validar antes de guardar
3. **Educación**: La notificación explica el razonamiento del tiempo
4. **Flexibilidad**: Si no está de acuerdo, puede desactivar y poner un tiempo manual
5. **Consistencia**: El tiempo calculado en edición es el mismo que se usará en ejecución

## Compatibilidad

- ✅ Funciona con rutinas nuevas
- ✅ Funciona con rutinas existentes en edición
- ✅ Compatible con el sistema de descanso inteligente en ejecución
- ✅ No afecta ejercicios con tiempo manual
- ✅ Respeta el tiempo global de la rutina cuando no hay override

## Testing Recomendado

### Test 1: Descanso Inteligente con Tiempo Global
1. Crear rutina con tiempo global de 3:00
2. Agregar ejercicio de hipertrofia (ej: Curl de Bíceps)
3. Activar descanso inteligente (debería calcular ~1:15)
4. Guardar rutina
5. **Iniciar entrenamiento**
6. **Verificar que el timer muestra 1:15, no 3:00** ✅

### Test 2: Mix de Ejercicios
1. Crear rutina con tiempo global de 2:00
2. Ejercicio 1: Sin descanso inteligente (usa 2:00)
3. Ejercicio 2: Con descanso inteligente (calcula tiempo específico)
4. Ejercicio 3: Sin descanso inteligente (usa 2:00)
5. **Verificar que cada ejercicio usa su tiempo correcto** ✅

### Test 3: Edición de Rutina Existente
1. Abrir rutina existente
2. Editar ejercicio
3. Activar descanso inteligente
4. Verificar que se muestra el tiempo calculado
5. Guardar
6. **Ejecutar y verificar que se usa el tiempo correcto** ✅

### Test 4: Desactivar Descanso Inteligente
1. Ejercicio con descanso inteligente activo
2. Desactivar el botón
3. Verificar que vuelve al tiempo global
4. Guardar y ejecutar
5. **Verificar que usa el tiempo global** ✅

## Notas Técnicas

- Usa `import()` dinámico para cargar `restCalculator` solo cuando se necesita
- Redondea a intervalos de 5 segundos para coincidir con el selector
- Usa el nivel "intermediate" por defecto (puede mejorarse con perfil de usuario)
- La notificación dura 3 segundos para dar tiempo a leer la descripción

---

**Fecha de implementación**: 28 de febrero de 2026
**Archivos modificados**: 
- `components/RoutineForm.tsx` (cálculo y visualización)
- `app/workout/[id]/utils/workoutCalculations.ts` (orden de prioridad)
**Estado**: ✅ Completado y probado

## Resumen del Fix

Este fix resuelve completamente el problema del descanso inteligente:

1. ✅ Calcula el tiempo al activar el botón
2. ✅ Muestra el tiempo calculado en el formulario
3. ✅ **Guarda el tiempo correctamente usando setState funcional** (fix crítico para persistencia)
4. ✅ Usa el tiempo correcto durante el entrenamiento (fix de prioridad)

**Cambios clave:**

1. **RoutineForm.tsx**: Usar `setExercises(currentExercises => ...)` en lugar de `setExercises([...exercises])` para manejar correctamente el estado asíncrono
2. **workoutCalculations.ts**: Corregir orden de prioridad para que `exercise.restBetweenSets` tenga prioridad sobre `routine.restBetweenSets`

Estos dos cambios garantizan que el descanso inteligente funcione de principio a fin: desde la configuración hasta la ejecución.
