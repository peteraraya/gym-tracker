# 🔧 Fix: Workout Reaparece Después de Cancelar

## 🐛 Problema Reportado

**Usuario:** "Hay ocasiones que cancelo entrenamiento y al rato vuelven a salir en progreso"

## 🔍 Diagnóstico

### Causa Raíz

El problema ocurre debido a una condición de carrera (race condition) entre:

1. **Cancelación del workout:**
   - `cancelWorkout()` limpia `activeWorkoutRef.current` y `activeWorkout`
   - Llama a `clearActiveWorkout()` para limpiar localStorage y Supabase

2. **Restauración automática (onResume):**
   - Cuando la app vuelve a primer plano, `onResume` se ejecuta
   - Espera 100ms y luego intenta restaurar el workout desde storage
   - Si el timing es incorrecto, puede restaurar el workout ANTES de que se limpie completamente

### Flujo del Problema

```
Usuario cancela workout
    ↓
cancelWorkout() se ejecuta
    ↓
activeWorkout = null (en memoria)
    ↓
clearActiveWorkout() empieza a ejecutarse (async)
    ↓
Usuario cambia de app o tab
    ↓
onResume se ejecuta
    ↓
setTimeout(100ms) espera
    ↓
getActiveWorkout() lee desde storage
    ↓
⚠️ PROBLEMA: El workout todavía está en storage porque clearActiveWorkout() no terminó
    ↓
Workout se restaura incorrectamente
```

## ✅ Solución Implementada

### Estrategia: Banderas de Intención

Usamos `sessionStorage` para marcar cuando un workout fue cancelado o finalizado intencionalmente. Esto evita que `onResume` lo restaure.

### Cambios en `context/WorkoutContext.tsx`

#### 1. Modificación en `cancelWorkout()`

```typescript
const cancelWorkout = useCallback(async () => {
  // ✅ NUEVO: Marcar que el workout fue cancelado intencionalmente
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('workout_cancelled', Date.now().toString());
  }
  
  // Actualizar la ref inmediatamente para evitar restauración
  activeWorkoutRef.current = null;
  setActiveWorkout(null);
  
  try {
    await storageService.clearActiveWorkout();
    console.log('[WorkoutContext] Active workout cancelled and cleared');
  } catch (e) {
    console.error('[WorkoutContext] Error limpiando active workout:', e);
  }
}, []);
```

#### 2. Modificación en `finishWorkout()`

```typescript
const finishWorkout = useCallback(async () => {
  // ✅ NUEVO: Marcar que el workout fue finalizado intencionalmente
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('workout_finished', Date.now().toString());
  }
  
  // Actualizar la ref inmediatamente para evitar restauración
  activeWorkoutRef.current = null;
  setActiveWorkout(null);
  
  try {
    await storageService.clearActiveWorkout();
    console.log('[WorkoutContext] Active workout finished and cleared');
  } catch (e) {
    console.error('[WorkoutContext] Error limpiando active workout:', e);
  }
}, []);
```

#### 3. Modificación en `onResume`

```typescript
onResume: useCallback(() => {
  setTimeout(async () => {
    try {
      // ✅ NUEVO: Verificar si el workout fue cancelado o finalizado recientemente
      if (typeof window !== 'undefined') {
        const cancelledAt = sessionStorage.getItem('workout_cancelled');
        const finishedAt = sessionStorage.getItem('workout_finished');
        
        // Si fue cancelado en los últimos 5 segundos, NO restaurar
        if (cancelledAt) {
          const timeSinceCancelled = Date.now() - parseInt(cancelledAt);
          if (timeSinceCancelled < 5000) {
            console.log('[WorkoutContext] Workout was recently cancelled, skipping restore');
            sessionStorage.removeItem('workout_cancelled');
            return; // ⛔ NO restaurar
          }
          sessionStorage.removeItem('workout_cancelled');
        }
        
        // Si fue finalizado en los últimos 5 segundos, NO restaurar
        if (finishedAt) {
          const timeSinceFinished = Date.now() - parseInt(finishedAt);
          if (timeSinceFinished < 5000) {
            console.log('[WorkoutContext] Workout was recently finished, skipping restore');
            sessionStorage.removeItem('workout_finished');
            return; // ⛔ NO restaurar
          }
          sessionStorage.removeItem('workout_finished');
        }
      }
      
      // ✅ Solo restaurar si NO fue cancelado/finalizado recientemente
      const stored = await storageService.getActiveWorkout();
      if (stored && !activeWorkoutRef.current) {
        // ... restaurar workout
      }
    } catch (e) {
      console.error('[WorkoutContext] Error restoring workout on resume:', e);
    }
  }, 100);
}, [])
```

## 🎯 Cómo Funciona

### Flujo Corregido

```
Usuario cancela workout
    ↓
cancelWorkout() se ejecuta
    ↓
✅ sessionStorage.setItem('workout_cancelled', timestamp)
    ↓
activeWorkout = null (en memoria)
    ↓
clearActiveWorkout() empieza a ejecutarse (async)
    ↓
Usuario cambia de app o tab
    ↓
onResume se ejecuta
    ↓
setTimeout(100ms) espera
    ↓
✅ Verifica sessionStorage: ¿workout_cancelled existe?
    ↓
✅ SÍ: Fue cancelado hace menos de 5 segundos
    ↓
✅ NO restaurar el workout
    ↓
✅ Limpiar la bandera
    ↓
✅ Workout permanece cancelado ✓
```

## 🔧 Ventajas de la Solución

### 1. Usa sessionStorage (No localStorage)
- ✅ Se limpia automáticamente al cerrar el tab/navegador
- ✅ No persiste entre sesiones
- ✅ No interfiere con otros tabs

### 2. Ventana de Tiempo (5 segundos)
- ✅ Suficiente para que `clearActiveWorkout()` termine
- ✅ No demasiado largo para causar problemas
- ✅ Se limpia automáticamente después

### 3. Doble Protección
- ✅ Protege tanto `cancelWorkout()` como `finishWorkout()`
- ✅ Evita restauración en ambos casos

### 4. Logs Claros
- ✅ Logs específicos para debugging
- ✅ Fácil identificar si el fix está funcionando

## 🧪 Testing

### Caso 1: Cancelar Workout y Cambiar de App

```
1. Iniciar un workout
2. Hacer algunas series
3. Cancelar el workout
4. Inmediatamente cambiar a otra app
5. Volver a la app después de 1-2 segundos
6. ✅ Verificar: El workout NO debe reaparecer
```

### Caso 2: Finalizar Workout y Cambiar de App

```
1. Iniciar un workout
2. Completar todas las series
3. Finalizar el workout
4. Inmediatamente cambiar a otra app
5. Volver a la app después de 1-2 segundos
6. ✅ Verificar: El workout NO debe reaparecer
```

### Caso 3: Workout Legítimo en Background

```
1. Iniciar un workout
2. Hacer algunas series
3. Cambiar a otra app (sin cancelar)
4. Esperar 10 segundos
5. Volver a la app
6. ✅ Verificar: El workout DEBE restaurarse correctamente
```

### Caso 4: Cancelar y Esperar Más de 5 Segundos

```
1. Iniciar un workout
2. Cancelar el workout
3. Esperar 6 segundos
4. Cambiar a otra app
5. Volver a la app
6. ✅ Verificar: El workout NO debe reaparecer
   (clearActiveWorkout ya terminó)
```

## 📊 Logs de Debug

### Logs Esperados al Cancelar

```
[WorkoutContext] Active workout cancelled and cleared
[DUAL_CLEAR] Active workout cleared from localStorage
[DUAL_CLEAR] Active workout cleared from Supabase
```

### Logs Esperados al Volver (Después de Cancelar)

```
[WorkoutContext] App resumed, checking workout state...
[WorkoutContext] Workout was recently cancelled, skipping restore
```

### Logs Esperados al Volver (Workout Legítimo)

```
[WorkoutContext] App resumed, checking workout state...
[WorkoutContext] Restoring workout from storage
```

## 🔍 Verificación en Consola

### Verificar Banderas

```javascript
// En la consola del navegador
console.log('Cancelled:', sessionStorage.getItem('workout_cancelled'));
console.log('Finished:', sessionStorage.getItem('workout_finished'));
```

### Limpiar Banderas Manualmente (Si es Necesario)

```javascript
// En la consola del navegador
sessionStorage.removeItem('workout_cancelled');
sessionStorage.removeItem('workout_finished');
```

## 🎨 Diagrama de Estados

```
┌─────────────────────────────────────────────────────────┐
│                  WORKOUT ACTIVO                          │
├─────────────────────────────────────────────────────────┤
│  Usuario entrena normalmente                             │
│  Cambiar de app → onResume → Restaurar ✅               │
└─────────────────────────────────────────────────────────┘
                        ↓
                   [Cancelar]
                        ↓
┌─────────────────────────────────────────────────────────┐
│              WORKOUT CANCELADO                           │
├─────────────────────────────────────────────────────────┤
│  sessionStorage: workout_cancelled = timestamp           │
│  activeWorkout = null                                    │
│  clearActiveWorkout() ejecutándose                       │
│  Cambiar de app → onResume → NO Restaurar ⛔           │
└─────────────────────────────────────────────────────────┘
                        ↓
                  [5 segundos]
                        ↓
┌─────────────────────────────────────────────────────────┐
│              LIMPIEZA COMPLETA                           │
├─────────────────────────────────────────────────────────┤
│  sessionStorage: workout_cancelled eliminado             │
│  localStorage: active_workout eliminado                  │
│  Supabase: active_workouts eliminado                     │
│  Estado: Limpio ✅                                       │
└─────────────────────────────────────────────────────────┘
```

## 📝 Notas Importantes

### Por Qué sessionStorage y No localStorage

- **sessionStorage:** Se limpia al cerrar el tab/navegador
- **localStorage:** Persiste indefinidamente
- **Ventaja:** No hay riesgo de banderas "huérfanas" que bloqueen restauraciones legítimas

### Por Qué 5 Segundos

- **Suficiente:** Para que `clearActiveWorkout()` termine en ambos lugares (localStorage + Supabase)
- **No demasiado:** Para no causar problemas si el usuario vuelve rápidamente
- **Seguro:** Incluso con conexión lenta, 5 segundos es suficiente

### Compatibilidad

- ✅ Funciona en todos los navegadores modernos
- ✅ Compatible con PWA
- ✅ Compatible con Capacitor (apps nativas)
- ✅ No afecta el comportamiento normal de restauración

## 🚀 Próximos Pasos

### Si el Problema Persiste

1. **Verificar logs en consola:**
   - Buscar `[WorkoutContext]` logs
   - Verificar que las banderas se están creando
   - Verificar que `onResume` las está leyendo

2. **Verificar timing:**
   - Si el problema ocurre después de 5+ segundos, aumentar el tiempo
   - Si ocurre inmediatamente, verificar que `clearActiveWorkout()` funciona

3. **Verificar storage:**
   - Verificar que `clearActiveWorkout()` limpia ambos lugares
   - Verificar que no hay errores en la limpieza

## ✅ Resumen

**Problema:** Workout reaparece después de cancelar  
**Causa:** Race condition entre cancelación y restauración  
**Solución:** Banderas de intención en sessionStorage  
**Resultado:** Workout NO se restaura si fue cancelado/finalizado recientemente  

**Estado:** ✅ Implementado y listo para testing

---

**Fecha:** 2026-02-28  
**Archivo modificado:** `context/WorkoutContext.tsx`  
**Tipo de fix:** Race condition / Timing issue
