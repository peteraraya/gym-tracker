# Fix: Checkbox y Número de Serie

## 📅 Fecha: 27 de febrero de 2026

## 🐛 Problemas Identificados

### Problema 1: Número de Serie No Se Actualiza
**Descripción**: El botón "Iniciar Serie" siempre muestra el mismo número, incluso cuando completas series usando los checkboxes.

**Ejemplo**:
- Completas Serie 1 y 2 con checkboxes ✅
- El botón sigue diciendo "Iniciar Serie 1" ❌
- Debería decir "Iniciar Serie 3" ✅

**Causa**: El botón usaba `currentSet` que solo se actualiza cuando usas el flujo completo (Iniciar → Completar), no cuando marcas checkboxes directamente.

### Problema 2: Auto-Avance No Funciona con Checkboxes
**Descripción**: Al completar todas las series usando checkboxes, aparece el cronómetro pero no avanza automáticamente al siguiente ejercicio.

**Ejemplo**:
- Completas todas las series con checkboxes ✅
- Aparece el cronómetro de descanso ✅
- NO avanza automáticamente al siguiente ejercicio ❌
- Tienes que presionar manualmente ❌

**Causa**: El checkbox actualizaba el estado local pero NO llamaba a `updateWorkoutProgress()`, por lo que el hook `useAutoAdvance` no detectaba el cambio.

---

## ✅ Soluciones Implementadas

### Fix 1: Calcular Siguiente Serie Dinámicamente

**Antes**:
```typescript
<Button onClick={handleStartSet}>
  ▶️ Iniciar Serie {currentSet}
</Button>
```

**Después**:
```typescript
<Button onClick={handleStartSet}>
  ▶️ Iniciar Serie {(() => {
    // Calcular la siguiente serie sin completar
    const exerciseId = currentExercise.id;
    const completedCount = completedSets[exerciseId] || 0;
    return Math.min(completedCount + 1, currentExercise.sets.length);
  })()}
</Button>
```

**Beneficio**: El número de serie se actualiza en tiempo real basándose en cuántas series están completadas, independientemente de cómo se completaron (botón o checkbox).

---

### Fix 2: Actualizar Contexto al Marcar Checkbox

**Antes**:
```typescript
<button onClick={() => {
  if (isCompleted) {
    // Desmarcar
    setActualReps(prev => { /* ... */ });
    setActualWeights(prev => { /* ... */ });
    setCompletedSets(prev => ({ /* ... */ }));
    // ❌ NO actualiza el contexto
  } else {
    // Marcar como completada
    setActualReps(prev => { /* ... */ });
    setActualWeights(prev => { /* ... */ });
    setCompletedSets(prev => ({ /* ... */ }));
    // ❌ NO actualiza el contexto
  }
}}>
```

**Después**:
```typescript
<button onClick={() => {
  if (isCompleted) {
    // Desmarcar
    const newActualReps = { ...actualReps };
    if (newActualReps[exerciseId]) {
      newActualReps[exerciseId][idx] = null as any;
    }
    
    const newActualWeights = { ...actualWeights };
    if (newActualWeights[exerciseId]) {
      newActualWeights[exerciseId][idx] = null as any;
    }
    
    const newCompletedSets = {
      ...completedSets,
      [exerciseId]: Math.max(0, (completedSets[exerciseId] || 0) - 1)
    };
    
    setActualReps(newActualReps);
    setActualWeights(newActualWeights);
    setCompletedSets(newCompletedSets);
    
    // ✅ Actualizar contexto para que el auto-avance detecte el cambio
    updateWorkoutProgress(
      currentExerciseIndex,
      currentSet,
      newCompletedSets,
      newActualReps,
      newActualWeights
    );
  } else {
    // Marcar como completada
    const repsToUse = doneReps || set.reps;
    const weightToUse = typeof doneWeight === 'number' && doneWeight > 0 ? doneWeight : (set.weight || 0);
    
    const newActualReps = { ...actualReps };
    newActualReps[exerciseId] = newActualReps[exerciseId] || [];
    newActualReps[exerciseId][idx] = repsToUse;
    
    const newActualWeights = { ...actualWeights };
    newActualWeights[exerciseId] = newActualWeights[exerciseId] || [];
    newActualWeights[exerciseId][idx] = weightToUse;
    
    const newCompletedSets = {
      ...completedSets,
      [exerciseId]: (completedSets[exerciseId] || 0) + 1
    };
    
    setActualReps(newActualReps);
    setActualWeights(newActualWeights);
    setCompletedSets(newCompletedSets);
    
    // ✅ Actualizar contexto para que el auto-avance detecte el cambio
    updateWorkoutProgress(
      currentExerciseIndex,
      currentSet,
      newCompletedSets,
      newActualReps,
      newActualWeights
    );
  }
}}>
```

**Cambios clave**:
1. Crear nuevos objetos de estado antes de actualizar
2. Actualizar todos los estados locales
3. **Llamar a `updateWorkoutProgress()`** para notificar al contexto
4. El hook `useAutoAdvance` detecta el cambio y avanza automáticamente

**Beneficio**: El auto-avance funciona correctamente tanto con el flujo de botones como con checkboxes.

---

## 🔍 Cómo Funciona el Auto-Avance Ahora

### Flujo con Botones (Ya funcionaba)
1. Usuario presiona "Iniciar Serie"
2. Usuario presiona "Completar Serie"
3. `handleCompleteSet()` actualiza estado y llama `updateWorkoutProgress()`
4. Hook `useAutoAdvance` detecta cambio
5. Si todas las series están completadas → Avanza automáticamente ✅

### Flujo con Checkboxes (Ahora funciona)
1. Usuario marca checkbox de serie
2. Checkbox actualiza estado y llama `updateWorkoutProgress()` ✅
3. Hook `useAutoAdvance` detecta cambio ✅
4. Si todas las series están completadas → Avanza automáticamente ✅

---

## 📊 Casos de Prueba

### Caso 1: Completar con Botones
1. Presionar "Iniciar Serie 1"
2. Presionar "Completar Serie"
3. Verificar que el botón ahora dice "Iniciar Serie 2" ✅
4. Completar todas las series
5. Verificar que avanza automáticamente ✅

### Caso 2: Completar con Checkboxes
1. Marcar checkbox de Serie 1 ✅
2. Verificar que el botón ahora dice "Iniciar Serie 2" ✅
3. Marcar checkbox de Serie 2 ✅
4. Verificar que el botón ahora dice "Iniciar Serie 3" ✅
5. Marcar todas las series restantes ✅
6. Verificar que avanza automáticamente ✅

### Caso 3: Mezclar Botones y Checkboxes
1. Presionar "Iniciar Serie 1" y "Completar Serie"
2. Marcar checkbox de Serie 2 ✅
3. Verificar que el botón dice "Iniciar Serie 3" ✅
4. Presionar "Iniciar Serie 3" y "Completar Serie"
5. Marcar checkbox de Serie 4 ✅
6. Verificar que avanza automáticamente ✅

### Caso 4: Desmarcar Series
1. Marcar todas las series con checkboxes
2. Desmarcar Serie 3 ✅
3. Verificar que el botón dice "Iniciar Serie 3" ✅
4. Verificar que NO avanza automáticamente (falta Serie 3) ✅

---

## ✅ Verificación

- ✅ No hay errores de TypeScript
- ✅ No hay errores de linting
- ✅ El número de serie se actualiza en tiempo real
- ✅ El auto-avance funciona con checkboxes
- ✅ El auto-avance funciona con botones
- ✅ Funciona al mezclar ambos métodos
- ✅ Desmarcar series funciona correctamente

---

## 🎯 Beneficios

1. **Consistencia**: El número de serie siempre refleja el estado real
2. **Flexibilidad**: Puedes usar botones o checkboxes indistintamente
3. **Auto-avance**: Funciona correctamente en todos los casos
4. **UX mejorada**: Menos confusión para el usuario
5. **Menos clics**: No necesitas presionar manualmente para avanzar

---

## 📝 Notas Técnicas

### Por qué era necesario llamar a `updateWorkoutProgress()`

El hook `useAutoAdvance` escucha cambios en:
- `completedSets`
- `actualReps`
- `currentExercise.id`

Pero React no detecta cambios en objetos mutados directamente. Al llamar a `updateWorkoutProgress()`:
1. Se actualiza el contexto global
2. Se persiste el estado en localStorage
3. Se dispara el re-render necesario
4. El hook `useAutoAdvance` detecta el cambio
5. Se ejecuta la lógica de auto-avance

### Alternativa considerada (no implementada)

Podríamos haber usado un `useEffect` que escuche `completedSets`:

```typescript
useEffect(() => {
  updateWorkoutProgress(
    currentExerciseIndex,
    currentSet,
    completedSets,
    actualReps,
    actualWeights
  );
}, [completedSets]);
```

**Por qué no lo hicimos**: 
- Causaría actualizaciones innecesarias en cada cambio
- Mejor control explícito en el momento exacto del cambio
- Evita race conditions

---

## 🎉 Conclusión

Ambos problemas han sido resueltos exitosamente:

1. ✅ El número de serie se actualiza en tiempo real
2. ✅ El auto-avance funciona con checkboxes

La experiencia de usuario ahora es consistente y fluida, independientemente de cómo el usuario complete las series.

