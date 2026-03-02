# Fix: Workout Reaparece Después de Cancelar

## Problema

Después de cancelar un entrenamiento, a veces el workout volvía a aparecer cuando:
- Se recargaba la página (F5)
- Se volvía a la app después de estar en segundo plano
- Se navegaba entre páginas

## Causa Raíz

El problema tenía múltiples causas:

1. **Marcadores de cancelación insuficientes**: Solo se usaba `sessionStorage` que se limpia fácilmente
2. **Ventana de tiempo muy corta**: Solo 5 segundos de protección contra restauración
3. **Falta de sincronización**: El banner y el contexto usaban marcadores diferentes
4. **Condiciones de carrera**: El `onResume` podía ejecutarse antes de que se limpiara el storage

## Solución Implementada

### 1. Doble Sistema de Marcadores

Ahora se usan dos tipos de marcadores para mayor robustez:

```typescript
// En cancelWorkout y finishWorkout
const timestamp = Date.now().toString();
sessionStorage.setItem('workout_cancelled', timestamp);  // Corto plazo
localStorage.setItem('workout_cancelled_persistent', timestamp);  // Persistente
```

**Beneficios**:
- `sessionStorage`: Se limpia al cerrar la pestaña (comportamiento normal)
- `localStorage`: Persiste entre sesiones (protección adicional)

### 2. Ventana de Tiempo Extendida

```typescript
// Antes: 5 segundos
if (timeSinceCancelled < 5000) { ... }

// Ahora: 30 segundos
if (timeSinceCancelled < 30000) { ... }
```

**Beneficios**:
- Más tiempo para que el storage se limpie completamente
- Protección contra recargas rápidas
- Maneja mejor las condiciones de carrera

### 3. Logs Detallados

Se agregaron logs en puntos clave para debugging:

```typescript
console.log('[WorkoutContext] cancelWorkout called');
console.log('[WorkoutContext] Set cancellation markers:', timestamp);
console.log('[WorkoutContext] Active workout cancelled and cleared from storage');
console.log('[WorkoutContext] Workout was recently cancelled, skipping restore. Time since:', timeSinceCancelled);
```

### 4. Sincronización Banner-Contexto

El `ActiveWorkoutBanner` ahora usa los mismos marcadores que el contexto:

```typescript
// Antes: Solo gym-tracker-cancelled
localStorage.setItem('gym-tracker-cancelled', timestamp);

// Ahora: Todos los marcadores
localStorage.setItem('gym-tracker-cancelled', timestamp);
sessionStorage.setItem('workout_cancelled', timestamp);
localStorage.setItem('workout_cancelled_persistent', timestamp);
```

### 5. Delay en Redirección

```typescript
// Esperar a que el estado se limpie antes de redirigir
await cancelWorkout();
setTimeout(() => {
  router.replace('/routines');
}, 100);
```

## Flujo Completo de Cancelación

1. **Usuario hace clic en "Descartar"**
   - Se muestra confirmación

2. **Usuario confirma**
   - Se establecen 3 marcadores (sessionStorage + 2 localStorage)
   - Se llama a `cancelWorkout()`

3. **`cancelWorkout()` ejecuta**:
   - Actualiza `activeWorkoutRef.current = null`
   - Actualiza `setActiveWorkout(null)`
   - Limpia el storage: `clearActiveWorkout()`
   - Log de confirmación

4. **Redirección**:
   - Espera 100ms
   - Redirige a `/routines`

5. **Protección contra restauración**:
   - Si `onResume` se ejecuta en los próximos 30 segundos
   - Verifica los marcadores
   - Si encuentra marcadores recientes, NO restaura el workout
   - Limpia los marcadores después de 5 segundos

## Verificación en onResume

```typescript
// Verificar ambos storages
const cancelledAt = sessionStorage.getItem('workout_cancelled');
const cancelledPersistent = localStorage.getItem('workout_cancelled_persistent');

if (cancelledAt || cancelledPersistent) {
  const timestamp = cancelledAt || cancelledPersistent;
  const timeSinceCancelled = Date.now() - parseInt(timestamp || '0');
  
  if (timeSinceCancelled < 30000) { // 30 segundos
    console.log('[WorkoutContext] Workout was recently cancelled, skipping restore');
    // Limpiar marcadores
    sessionStorage.removeItem('workout_cancelled');
    if (timeSinceCancelled > 5000) {
      localStorage.removeItem('workout_cancelled_persistent');
    }
    return; // NO RESTAURAR
  }
}
```

## Testing

### Escenarios a Probar

1. **Cancelar y recargar inmediatamente (F5)**:
   - ✅ No debe reaparecer el workout

2. **Cancelar y cerrar/abrir la app**:
   - ✅ No debe reaparecer el workout

3. **Cancelar y navegar entre páginas**:
   - ✅ No debe reaparecer el banner

4. **Cancelar y esperar 30+ segundos**:
   - ✅ Los marcadores se limpian automáticamente

5. **Pausar workout legítimamente**:
   - ✅ Debe restaurarse correctamente al volver

### Cómo Verificar

1. Iniciar un entrenamiento
2. Hacer clic en "Descartar" en el banner
3. Confirmar la cancelación
4. Abrir DevTools Console
5. Verificar logs:
   ```
   [ActiveWorkoutBanner] User confirmed cancellation
   [ActiveWorkoutBanner] Set cancellation markers: [timestamp]
   [WorkoutContext] cancelWorkout called
   [WorkoutContext] Set cancellation markers: [timestamp]
   [WorkoutContext] Active workout cancelled and cleared from storage
   [ActiveWorkoutBanner] Workout cancelled, redirecting to routines
   ```
6. Recargar la página (F5)
7. Verificar que NO aparece el banner
8. Verificar log:
   ```
   [WorkoutContext] Workout was recently cancelled, skipping restore. Time since: [ms]
   ```

## Archivos Modificados

1. **`context/WorkoutContext.tsx`**:
   - `cancelWorkout()`: Doble marcador + logs
   - `finishWorkout()`: Doble marcador + logs
   - `onResume()`: Verificación de ambos storages + ventana de 30s

2. **`components/ActiveWorkoutBanner.tsx`**:
   - `handleCancel()`: Sincronización de marcadores + delay en redirección

## Marcadores Utilizados

| Marcador | Storage | Duración | Propósito |
|----------|---------|----------|-----------|
| `workout_cancelled` | sessionStorage | Hasta cerrar pestaña | Protección inmediata |
| `workout_cancelled_persistent` | localStorage | 30 segundos | Protección persistente |
| `gym-tracker-cancelled` | localStorage | 30 segundos | Compatibilidad legacy |
| `workout_finished` | sessionStorage | Hasta cerrar pestaña | Protección inmediata |
| `workout_finished_persistent` | localStorage | 30 segundos | Protección persistente |

## Notas Técnicas

- Los marcadores persistentes se limpian automáticamente después de 5 segundos si el tiempo transcurrido es mayor
- La ventana de 30 segundos es suficiente para manejar recargas, cambios de pestaña, y pausas breves
- Los logs ayudan a debugging pero no afectan el rendimiento
- El delay de 100ms en la redirección asegura que el estado se limpie antes de navegar

## Mejoras Futuras Posibles

1. Usar un flag en el storage en lugar de timestamps
2. Implementar un sistema de eventos para sincronizar entre pestañas
3. Agregar telemetría para detectar casos edge
4. Considerar usar IndexedDB para mayor robustez
