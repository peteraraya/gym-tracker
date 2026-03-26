# ✅ Fix: Auto-Start Timer en Descanso

## Problema
Cuando el usuario entraba a la fase de descanso durante un entrenamiento, el cronómetro no iniciaba automáticamente. El usuario tenía que hacer click en "Iniciar" manualmente.

## Solución
Se agregó la propiedad `autoStart={true}` al componente `Timer` en `app/workout/[id]/page.tsx`.

## Cambios Realizados

### Archivo: `app/workout/[id]/page.tsx`

**Antes:**
```tsx
if (showTimer) {
  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
      <Timer
        duration={timerDuration}
        title={timerTitle}
        nextExerciseName={nextExerciseName}
        onComplete={handleTimerComplete}
      />
    </div>
  );
}
```

**Después:**
```tsx
if (showTimer) {
  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
      <Timer
        duration={timerDuration}
        title={timerTitle}
        nextExerciseName={nextExerciseName}
        onComplete={handleTimerComplete}
        autoStart={true}
      />
    </div>
  );
}
```

## Cómo Funciona

1. Cuando el usuario completa una serie y entra a descanso, se muestra el Timer
2. El Timer recibe `autoStart={true}`
3. En el componente Timer, el estado `isRunning` se inicializa con el valor de `autoStart`
4. El cronómetro comienza a contar automáticamente sin necesidad de hacer click

## Código Relevante en Timer.tsx

```tsx
const [isRunning, setIsRunning] = useState(autoStart);

useEffect(() => {
  setTimeLeft(duration);
  setIsCompleted(false);
  setHasAdjusted(false);
  onCompleteCalledRef.current = false;
  startTimeRef.current = Date.now();
  if (autoStart) {
    setIsRunning(true);
  }
}, [duration]);
```

## Nota
El archivo `app/workout/free/page.tsx` ya tenía `autoStart={true}` implementado correctamente.

## Resultado
✅ El cronómetro ahora inicia automáticamente cuando entras a descanso
✅ El usuario puede pausar, ajustar o saltar el descanso en cualquier momento
✅ Mejor experiencia de usuario durante el entrenamiento
