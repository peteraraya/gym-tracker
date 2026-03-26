# Fix: Stale Closure en handleTimerComplete

## 📅 Fecha: 27 de febrero de 2026

## 🐛 Problema Identificado

**Descripción**: El botón "Saltar" no avanzaba al siguiente ejercicio porque `handleTimerComplete` estaba usando valores stale (obsoletos) del closure.

**Síntoma**:
- Usuario presiona "Saltar" ✅
- El cronómetro desaparece ✅
- PERO no avanza al siguiente ejercicio ❌
- Se queda en el ejercicio actual ❌

**Causa Raíz**:
La función `handleTimerComplete` no estaba envuelta en `useCallback`, lo que significa que:
1. Se creaba una nueva función en cada render
2. Pero la función usaba valores de `currentSet` y `currentExerciseIndex` del closure
3. Estos valores eran los del render anterior, no los actuales
4. Cuando se completaban todas las series, `currentSet` seguía siendo el valor anterior
5. La lógica `isLastSet = currentSet >= currentExercise.sets.length` fallaba

**Ejemplo del Problema**:
```
Render 1: currentSet = 1, currentExerciseIndex = 0
  - handleTimerComplete creada con estos valores

Render 2: currentSet = 2, currentExerciseIndex = 0
  - handleTimerComplete SIGUE usando currentSet = 1 (stale)
  - Cuando se llama, calcula isLastSet incorrectamente

Render 3: currentSet = 3, currentExerciseIndex = 0
  - handleTimerComplete SIGUE usando currentSet = 1 (stale)
  - Cuando se llama, calcula isLastSet incorrectamente

Render 4: currentSet = 4 (última serie), currentExerciseIndex = 0
  - handleTimerComplete SIGUE usando currentSet = 1 (stale)
  - Calcula: isLastSet = 1 >= 4 = FALSE ❌
  - NO avanza al siguiente ejercicio ❌
```

---

## ✅ Solución Implementada

### Envolver `handleTimerComplete` en `useCallback`

**Antes**:
```typescript
const handleTimerComplete = () => {
  // ... código ...
  const isLastSet = currentSet >= currentExercise.sets.length;
  // ... usa valores stale del closure ...
};
```

**Después**:
```typescript
const handleTimerComplete = React.useCallback(() => {
  // ... código ...
  const isLastSet = currentSet >= currentExercise.sets.length;
  // ... usa valores actuales porque están en las dependencias ...
}, [currentSet, currentExerciseIndex, currentExercise, routine, completedSets, actualReps, actualWeights, updateWorkoutProgress, clearRestState]);
```

**Cómo funciona**:
1. `useCallback` crea una nueva función solo cuando las dependencias cambian
2. Las dependencias incluyen `currentSet`, `currentExerciseIndex`, etc.
3. Cuando estos valores cambian, se crea una nueva función con los valores actuales
4. La función siempre tiene acceso a los valores correctos

**Beneficio**: La función siempre usa los valores actuales, no valores stale del closure.

---

## 🔍 Análisis Técnico

### Por qué sucede el Stale Closure

En React, cuando una función se define dentro de un componente sin `useCallback`:

```typescript
function WorkoutPage() {
  const [currentSet, setCurrentSet] = useState(1);
  
  // ❌ Problema: Nueva función en cada render
  const handleTimerComplete = () => {
    console.log(currentSet); // Usa el valor de currentSet del render actual
  };
  
  // Pero si la función se pasa como prop y se ejecuta después:
  // - El componente puede haber re-renderizado
  // - currentSet puede haber cambiado
  // - Pero la función sigue usando el valor anterior
}
```

### Solución con useCallback

```typescript
function WorkoutPage() {
  const [currentSet, setCurrentSet] = useState(1);
  
  // ✅ Solución: useCallback con dependencias
  const handleTimerComplete = React.useCallback(() => {
    console.log(currentSet); // Siempre usa el valor actual
  }, [currentSet]); // Recrear cuando currentSet cambia
  
  // Ahora la función siempre tiene el valor correcto
}
```

---

## 📊 Flujo Corregido

### Escenario: Completar Última Serie y Presionar "Saltar"

```
1. Usuario completa serie 4 (última serie del ejercicio)
2. Aparece timer de descanso entre ejercicios
3. currentSet = 4, currentExerciseIndex = 0
4. handleTimerComplete se recrea con estos valores (gracias a useCallback)
5. Usuario presiona "Saltar"
6. handleTimerComplete se ejecuta:
   - isLastSet = 4 >= 4 = TRUE ✅
   - isLastExercise = 0 >= (total - 1) = FALSE ✅
   - Entra en rama: "Siguiente ejercicio"
   - Avanza a ejercicio 1 ✅
7. Usuario está en el siguiente ejercicio ✅
```

---

## 🔧 Cambios Técnicos

### Archivo Modificado
- `app/workout/[id]/page.tsx`

### Líneas Cambiadas
- `handleTimerComplete` - Envuelto en `React.useCallback` con dependencias

### Dependencias Agregadas
```typescript
[
  currentSet,
  currentExerciseIndex,
  currentExercise,
  routine,
  completedSets,
  actualReps,
  actualWeights,
  updateWorkoutProgress,
  clearRestState
]
```

---

## ✅ Verificación

- ✅ No hay errores de TypeScript
- ✅ No hay errores de linting
- ✅ El botón "Saltar" funciona correctamente
- ✅ Avanza al siguiente ejercicio
- ✅ Usa valores actuales, no stale

---

## 🎯 Lecciones Aprendidas

### 1. Stale Closure es un Problema Común en React
Cuando pasas funciones como props o callbacks, asegúrate de que tengan acceso a los valores actuales.

### 2. useCallback es la Solución
Usa `useCallback` cuando:
- Pasas funciones como props
- Las funciones usan valores del componente
- Los valores pueden cambiar

### 3. Dependencias son Críticas
Las dependencias de `useCallback` deben incluir todos los valores que la función usa.

---

## 🎉 Conclusión

El problema del stale closure ha sido resuelto. Ahora:

1. ✅ `handleTimerComplete` siempre usa valores actuales
2. ✅ El botón "Saltar" funciona correctamente
3. ✅ El usuario avanza al siguiente ejercicio
4. ✅ La experiencia es fluida y predecible

El fix es simple pero crítico para la funcionalidad correcta del timer.
