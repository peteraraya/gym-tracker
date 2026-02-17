# Fix: Entrenamiento se Pierde al Recargar (F5)

## Problema

Cuando un usuario iniciaba un entrenamiento y recargaba la página (F5), el entrenamiento activo se perdía completamente, obligando al usuario a empezar de nuevo.

## Causa Raíz

En `context/WorkoutContext.tsx`, había un `useEffect` que persistía los cambios del workout activo:

```typescript
useEffect(() => {
  if (isLoadingActiveWorkout) return;
  (async () => {
    try {
      if (activeWorkout) {
        await storageService.saveActiveWorkout(activeWorkout);
      } else {
        await storageService.clearActiveWorkout(); // ← PROBLEMA
      }
    } catch (e) {
      console.warn('Failed to persist active workout', e);
    }
  })();
}, [activeWorkout, isLoadingActiveWorkout]);
```

### Flujo del Problema

1. Usuario inicia un entrenamiento → se guarda en storage ✅
2. Usuario recarga la página (F5)
3. React inicializa el componente con `activeWorkout = null`
4. `isLoadingActiveWorkout = true` (protege temporalmente)
5. Se carga el workout desde storage
6. `isLoadingActiveWorkout = false`
7. El `useEffect` se ejecuta
8. Como `activeWorkout` podría ser `null` momentáneamente, se ejecuta `clearActiveWorkout()` ❌
9. El workout se elimina del storage
10. Usuario pierde su progreso

## Solución Implementada

Modificado el `useEffect` para que **SOLO guarde** cuando hay un workout activo, pero **NUNCA limpie automáticamente**:

```typescript
useEffect(() => {
  if (isLoadingActiveWorkout) return;
  if (!activeWorkout) return; // ← NUEVO: No hacer nada si no hay workout
  
  (async () => {
    try {
      await storageService.saveActiveWorkout(activeWorkout);
    } catch (e) {
      console.warn('Failed to persist active workout', e);
    }
  })();
}, [activeWorkout, isLoadingActiveWorkout]);
```

### Cambios Clave

1. **Agregado early return**: `if (!activeWorkout) return;`
2. **Eliminado clearActiveWorkout automático**: Ya no se limpia el storage cuando `activeWorkout` es `null`
3. **Limpieza explícita**: El storage solo se limpia cuando se llama explícitamente a:
   - `finishWorkout()` - Al completar el entrenamiento
   - `cancelWorkout()` - Al cancelar el entrenamiento

## Comportamiento Ahora

### Iniciar Entrenamiento
1. Usuario hace click en "Iniciar Entrenamiento"
2. Se crea el `WorkoutState`
3. Se guarda inmediatamente en storage (en `startWorkout`)
4. Se guarda también en el `useEffect`

### Durante el Entrenamiento
1. Usuario completa series
2. Cada cambio se guarda automáticamente
3. El estado persiste en storage

### Recargar Página (F5)
1. React inicializa con `activeWorkout = null`
2. `isLoadingActiveWorkout = true` (protege)
3. Se carga el workout desde storage
4. `setActiveWorkout(parsed)` restaura el estado
5. `isLoadingActiveWorkout = false`
6. El `useEffect` se ejecuta pero **NO hace nada** porque ya hay un workout cargado
7. ✅ El entrenamiento se mantiene intacto

### Finalizar Entrenamiento
1. Usuario hace click en "Finalizar"
2. Se llama a `finishWorkout()`
3. `setActiveWorkout(null)`
4. `clearActiveWorkout()` se llama **explícitamente**
5. El storage se limpia correctamente

### Cancelar Entrenamiento
1. Usuario hace click en "Cancelar"
2. Se llama a `cancelWorkout()`
3. `setActiveWorkout(null)`
4. `clearActiveWorkout()` se llama **explícitamente**
5. El storage se limpia correctamente

## Testing

### Caso 1: Iniciar y Recargar
```
1. Ir a /routines
2. Click en "Iniciar Entrenamiento"
3. Completar 1-2 series
4. Presionar F5
5. ✅ El entrenamiento debe continuar donde se quedó
```

### Caso 2: Recargar Múltiples Veces
```
1. Iniciar entrenamiento
2. Completar algunas series
3. F5 (recargar)
4. Completar más series
5. F5 (recargar otra vez)
6. ✅ Todo el progreso debe mantenerse
```

### Caso 3: Finalizar Correctamente
```
1. Iniciar entrenamiento
2. Completar todas las series
3. Click en "Finalizar Entrenamiento"
4. ✅ El workout debe guardarse en sesiones
5. ✅ El active workout debe limpiarse
6. Recargar página
7. ✅ No debe haber workout activo
```

### Caso 4: Cancelar
```
1. Iniciar entrenamiento
2. Completar algunas series
3. Click en "Cancelar Entrenamiento"
4. ✅ El workout debe eliminarse
5. Recargar página
6. ✅ No debe haber workout activo
```

## Archivos Modificados

- `context/WorkoutContext.tsx` - Modificado el useEffect de persistencia

## Beneficios

1. **Persistencia Confiable**: Los entrenamientos ya no se pierden al recargar
2. **Mejor UX**: Los usuarios pueden recargar sin miedo a perder progreso
3. **Más Seguro**: Solo se limpia el storage cuando es explícitamente solicitado
4. **Funciona Offline**: La persistencia funciona incluso sin conexión

## Notas Técnicas

### Por Qué No Usar useEffect con Cleanup

Podríamos pensar en usar un cleanup function:

```typescript
useEffect(() => {
  return () => {
    // Guardar al desmontar
  };
}, []);
```

Pero esto no funciona porque:
1. El cleanup se ejecuta al desmontar el componente
2. En Next.js con React 18, los componentes pueden desmontarse y remontarse
3. Esto causaría guardados innecesarios o pérdida de datos

### Por Qué Guardar en Múltiples Lugares

El workout se guarda en:
1. `startWorkout()` - Inmediatamente al iniciar
2. `updateWorkoutProgress()` - En cada cambio
3. `useEffect` - Como backup adicional

Esto asegura que nunca se pierda el progreso, incluso si:
- La página se cierra abruptamente
- El navegador se crashea
- Se pierde la conexión
- El usuario cierra la pestaña

## Prevención de Regresiones

Para evitar que este bug vuelva a aparecer:

1. **Nunca** llamar a `clearActiveWorkout()` en un useEffect sin condiciones explícitas
2. **Siempre** verificar `isLoadingActiveWorkout` antes de hacer operaciones de storage
3. **Solo** limpiar el storage en funciones explícitas (`finishWorkout`, `cancelWorkout`)
4. **Probar** siempre con F5 después de cambios en WorkoutContext

## Relacionado

- `docs/WORKOUT_PERSISTENCE.md` - Documentación original de persistencia
- `docs/WORKOUT_PERSISTENCE_FIX.md` - Fix anterior de persistencia
- `context/WorkoutContext.tsx` - Implementación del contexto

---

**Fecha**: Febrero 2026
**Estado**: ✅ Resuelto
**Prioridad**: Alta (Bug Crítico)
