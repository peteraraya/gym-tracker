# Fix: Timer se queda pegado al hacer clic en "Saltar"

## Problema
Cuando el usuario hace clic en "Saltar" en el timer de descanso, el timer se queda pegado en la pantalla y no se cierra.

## Causa
El botón "Saltar" llama a `onComplete()` que ejecuta `handleTimerComplete()`. Este handler calcula el siguiente tiempo de descanso y vuelve a iniciar el timer con `timerHandlers.startTimer()`, creando un loop infinito.

## Solución

### 1. Modificar el renderizado del Timer en `app/workout/[id]/page.tsx`

Buscar donde se renderiza el Timer (alrededor de la línea que dice `if (timerHandlers.showTimer && !timerHandlers.timerMinimized)`):

```tsx
// ANTES:
<Timer
  duration={timerHandlers.timerDuration}
  initialTimeLeft={timerHandlers.currentTimeLeft}
  title={timerHandlers.timerTitle}
  nextExerciseName={timerHandlers.nextExerciseName}
  onComplete={handleTimerComplete}
  autoStart={true}
  showMotivation={true}
  onMinimize={timerHandlers.minimizeTimer}
/>

// DESPUÉS:
<Timer
  duration={timerHandlers.timerDuration}
  initialTimeLeft={timerHandlers.currentTimeLeft}
  title={timerHandlers.timerTitle}
  nextExerciseName={timerHandlers.nextExerciseName}
  onComplete={handleTimerComplete}
  onSkip={timerHandlers.skipAndAdvance}  // ✨ NUEVO: Usar skipAndAdvance para el botón Saltar
  autoStart={true}
  showMotivation={true}
  onMinimize={timerHandlers.minimizeTimer}
/>
```

### 2. Actualizar MinimizedTimer en `app/workout/[id]/page.tsx`

Buscar donde se renderiza MinimizedTimer:

```tsx
// ANTES:
<MinimizedTimer
  timeLeft={timerHandlers.currentTimeLeft}
  title={timerHandlers.timerTitle}
  onExpand={timerHandlers.expandTimer}
  onSkip={timerHandlers.skipTimer}
/>

// DESPUÉS:
<MinimizedTimer
  timeLeft={timerHandlers.currentTimeLeft}
  title={timerHandlers.timerTitle}
  onExpand={timerHandlers.expandTimer}
  onSkip={timerHandlers.skipAndAdvance}  // ✨ CAMBIO: Usar skipAndAdvance
/>
```

## Explicación

- `skipTimer()`: Solo cierra el timer sin ejecutar ninguna lógica adicional
- `skipAndAdvance()`: Cierra el timer Y ejecuta `handleTimerComplete()` para avanzar a la siguiente serie/ejercicio
- `onSkip` prop en Timer: Callback específico para el botón "Saltar" que usa `skipAndAdvance()`
- `onComplete` prop en Timer: Callback para cuando el timer termina naturalmente

Con estos cambios:
1. Cuando el timer termina naturalmente (llega a 0), llama a `onComplete` → `handleTimerComplete`
2. Cuando el usuario hace clic en "Saltar", llama a `onSkip` → `skipAndAdvance` → cierra el timer primero, luego ejecuta `handleTimerComplete`
3. Esto evita el loop infinito porque el timer se cierra ANTES de que se calcule el siguiente tiempo de descanso

## Archivos modificados
- ✅ `components/Timer.tsx` - Agregada prop `onSkip`
- ✅ `app/workout/[id]/hooks/useWorkoutTimer.ts` - Agregado método `skipAndAdvance`
- ⏳ `app/workout/[id]/page.tsx` - Necesita actualización manual (ver arriba)
