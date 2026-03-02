# Fix: Tiempo del entrenamiento se reinicia con F5

## Problema
Cuando el usuario recarga la página (F5) durante un entrenamiento, el cronómetro del tiempo total del entrenamiento se reinicia a 0:00 en lugar de continuar desde donde estaba.

## Causa
En `app/workout/[id]/page.tsx`, el estado `workoutStartTime` se inicializa con `Date.now()`:

```tsx
const [workoutStartTime] = useState(() => Date.now());
```

Esto significa que cada vez que se recarga la página, se crea un nuevo timestamp, perdiendo el tiempo original de inicio.

## Solución

El `activeWorkout` ya tiene un campo `startedAt` que se guarda en storage. Necesitamos usar ese valor cuando se restaura el workout.

### Cambio en `app/workout/[id]/page.tsx`

**ANTES:**
```tsx
const [workoutStartTime] = useState(() => Date.now());
```

**DESPUÉS:**
```tsx
const [workoutStartTime] = useState(() => {
  // Intentar obtener el tiempo de inicio del workout activo
  if (activeWorkout?.startedAt) {
    return new Date(activeWorkout.startedAt).getTime();
  }
  return Date.now();
});
```

O mejor aún, usar un `useEffect` para actualizar el tiempo cuando se restaura el workout:

```tsx
const [workoutStartTime, setWorkoutStartTime] = useState(() => Date.now());

// En el useEffect de inicialización, después de restaurar el workout:
useEffect(() => {
  if (gymLoading) return;
  
  let mounted = true;
  
  const initializeWorkout = async () => {
    // ... código existente ...
    
    const storedWorkout = await storageService.getActiveWorkout();
    
    if (!mounted) return;
    
    if (storedWorkout && storedWorkout.routineId === id) {
      // Restaurar el tiempo de inicio
      if (storedWorkout.startedAt) {
        const startTime = new Date(storedWorkout.startedAt).getTime();
        setWorkoutStartTime(startTime);
      }
      
      // ... resto del código de restauración ...
    }
    
    // ... resto del código ...
  };
  
  initializeWorkout();
  
  return () => {
    mounted = false;
  };
}, [id, gymLoading]);
```

## Beneficios
- ✅ El tiempo del entrenamiento persiste al recargar la página
- ✅ El usuario puede cerrar y abrir la app sin perder el tiempo
- ✅ El tiempo total del entrenamiento es preciso
- ✅ Mejor experiencia de usuario

## Archivos afectados
- `app/workout/[id]/page.tsx` - Necesita actualización manual
- `context/WorkoutContext.tsx` - Ya guarda `startedAt` correctamente ✅

## Nota
El `WorkoutContext` ya maneja correctamente el `startedAt` y lo persiste en storage. Solo necesitamos usar ese valor en la página del workout.
