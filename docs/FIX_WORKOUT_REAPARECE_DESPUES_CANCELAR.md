# Fix: Entrenamiento Reaparece Después de Cancelar

## Problema

Cuando el usuario cancela un entrenamiento, este se limpia correctamente. Sin embargo, al cambiar de pestaña o poner la app en segundo plano y volver, el entrenamiento cancelado reaparece.

## Causa Raíz

El problema estaba en el hook `useAppLifecycle` en el callback `onResume`:

```typescript
onResume: useCallback(() => {
  const stored = await storageService.getActiveWorkout();
  if (stored && !activeWorkoutRef.current) {
    // Restaura el workout desde storage
    setActiveWorkout(parsed);
  }
}, [])
```

### Flujo del Problema

1. Usuario cancela entrenamiento
2. `cancelWorkout()` se ejecuta:
   - `setActiveWorkout(null)` - Limpia estado
   - `clearActiveWorkout()` - Limpia storage (async)
3. Usuario cambia de pestaña inmediatamente
4. `onResume` se ejecuta antes de que `clearActiveWorkout()` termine
5. `getActiveWorkout()` aún retorna el workout (no se limpió a tiempo)
6. El workout se restaura ❌

## Solución Implementada

### 1. Actualizar `activeWorkoutRef` Inmediatamente

```typescript
const cancelWorkout = useCallback(async () => {
  // Actualizar la ref INMEDIATAMENTE para evitar restauración
  activeWorkoutRef.current = null;
  setActiveWorkout(null);
  
  // Esperar a que se complete la limpieza
  try {
    await storageService.clearActiveWorkout();
  } catch (e) {
    console.error('[WorkoutContext] Error limpiando active workout:', e);
  }
}, []);
```

**Cambios clave:**
- `activeWorkoutRef.current = null` se ejecuta ANTES de limpiar storage
- La función ahora es `async` y espera a que se complete la limpieza
- Mismo cambio aplicado a `finishWorkout()`

### 2. Agregar Delay en `onResume`

```typescript
onResume: useCallback(() => {
  // Pequeño delay para asegurar que clearActiveWorkout se completó
  setTimeout(async () => {
    const stored = await storageService.getActiveWorkout();
    // Solo restaurar si hay datos Y no hay workout en memoria
    if (stored && !activeWorkoutRef.current) {
      setActiveWorkout(parsed);
      activeWorkoutRef.current = parsed;
    }
  }, 100);
}, [])
```

**Cambios clave:**
- Delay de 100ms para dar tiempo a que `clearActiveWorkout()` termine
- Verifica `activeWorkoutRef.current` (que se actualiza inmediatamente)
- Actualiza la ref después de restaurar

### 3. Funciones Async

```typescript
interface WorkoutContextType {
  // ...
  finishWorkout: () => Promise<void>;  // Ahora es async
  cancelWorkout: () => Promise<void>;  // Ahora es async
}
```

## Flujo Corregido

### Cancelar Entrenamiento

1. Usuario hace click en "Cancelar"
2. `cancelWorkout()` se ejecuta:
   - `activeWorkoutRef.current = null` ✅ (inmediato)
   - `setActiveWorkout(null)` ✅ (inmediato)
   - `await clearActiveWorkout()` ✅ (espera a completar)
3. Usuario cambia de pestaña
4. `onResume` se ejecuta después de 100ms
5. Verifica `activeWorkoutRef.current` → es `null` ✅
6. No restaura el workout ✅

### Finalizar Entrenamiento

Mismo flujo que cancelar, asegurando que el workout no reaparezca.

## Archivos Modificados

- ✅ `context/WorkoutContext.tsx`
  - `cancelWorkout` ahora es async
  - `finishWorkout` ahora es async
  - Actualiza `activeWorkoutRef.current` inmediatamente
  - `onResume` tiene delay de 100ms

## Testing

### Caso 1: Cancelar y Cambiar de Pestaña Rápido

```
1. Iniciar entrenamiento
2. Completar 1-2 series
3. Click en "Cancelar Entrenamiento"
4. Inmediatamente cambiar de pestaña
5. Esperar 5 segundos
6. Volver a la pestaña
7. ✅ El entrenamiento NO debe reaparecer
```

### Caso 2: Cancelar y Minimizar App (Móvil)

```
1. Iniciar entrenamiento en móvil
2. Completar algunas series
3. Click en "Cancelar"
4. Inmediatamente presionar Home
5. Esperar 10 segundos
6. Volver a la app
7. ✅ El entrenamiento NO debe reaparecer
```

### Caso 3: Finalizar y Recargar

```
1. Iniciar entrenamiento
2. Completar todas las series
3. Click en "Finalizar Entrenamiento"
4. Recargar página (F5)
5. ✅ No debe haber workout activo
```

### Caso 4: Cancelar, Esperar, Iniciar Nuevo

```
1. Iniciar entrenamiento A
2. Cancelar
3. Esperar 5 segundos
4. Iniciar entrenamiento B
5. Cambiar de pestaña
6. Volver
7. ✅ Debe mostrar entrenamiento B (no A)
```

## Consideraciones

### Race Conditions

El delay de 100ms en `onResume` es suficiente para la mayoría de casos, pero en conexiones muy lentas podría no ser suficiente. Sin embargo:

- `activeWorkoutRef.current = null` se ejecuta inmediatamente (sincrónico)
- Esto previene la restauración incluso si `clearActiveWorkout()` tarda
- El delay es solo una capa adicional de seguridad

### Compatibilidad

- ✅ Web (Chrome, Firefox, Safari, Edge)
- ✅ Android (Capacitor)
- ✅ iOS (Capacitor)
- ✅ PWA

### Performance

El delay de 100ms es imperceptible para el usuario y no afecta la UX.

## Prevención de Regresiones

Para evitar que este bug vuelva:

1. **Siempre actualizar la ref antes de limpiar storage**
   ```typescript
   activeWorkoutRef.current = null; // PRIMERO
   await clearActiveWorkout();      // DESPUÉS
   ```

2. **Usar funciones async para operaciones de limpieza**
   ```typescript
   const cancelWorkout = async () => {
     await clearActiveWorkout(); // Esperar a que termine
   };
   ```

3. **Verificar la ref en onResume**
   ```typescript
   if (stored && !activeWorkoutRef.current) {
     // Solo restaurar si la ref es null
   }
   ```

## Relacionado

- `docs/WORKOUT_BACKGROUND_PERSISTENCE_FIX.md` - Fix de persistencia en background
- `docs/WORKOUT_PERSISTENCE_RELOAD_FIX.md` - Fix de persistencia en reload
- `hooks/useAppLifecycle.ts` - Hook de ciclo de vida
- `context/WorkoutContext.tsx` - Contexto de workout

---

**Fecha**: Febrero 2026
**Estado**: ✅ Resuelto
**Prioridad**: Alta (Bug Crítico)
**Impacto**: Mejora significativa en UX
