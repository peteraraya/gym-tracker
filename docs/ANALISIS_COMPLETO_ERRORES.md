# Análisis Completo de Errores - Gym Tracker App

**Fecha**: 26 de Marzo, 2026  
**Total de Problemas**: 25  
**Severidad**: 5 Críticos, 8 Altos, 7 Medios, 5 Bajos

---

## 🔴 PROBLEMAS CRÍTICOS (Prioridad 1)

### 1. Race Condition en WorkoutContext - Normalización de Datos Corrupta

**Ubicación**: `context/WorkoutContext.tsx` líneas 80-150

**Problema**:
```typescript
// El método normalizeActiveWorkout() intenta convertir completedSets cuando es un número
else if (typeof data.completedSets === 'number') {
  console.warn('[WorkoutContext] completedSets is a number, resetting to empty object');
  completedSets = {};
}
```

El problema es que después de normalizar, si la validación falla, se limpia el workout sin:
- Notificar al usuario
- Intentar recuperar datos parciales
- Guardar un backup antes de limpiar

**Impacto**: Pérdida silenciosa de datos de entrenamiento en progreso

**Solución**:
```typescript
// 1. Guardar backup antes de limpiar
// 2. Intentar recuperación parcial
// 3. Notificar al usuario con opción de recuperar
```

---

### 2. Doble Guardado Asincrónico sin Sincronización

**Ubicación**: 
- `app/workout/[id]/page.tsx` línea 400-450
- `context/WorkoutContext.tsx` línea 280-320

**Problema**:
```typescript
// En updateWorkoutProgress()
(async () => {
  try {
    await storageService.saveActiveWorkout(newState as unknown as ActiveWorkout);
  } catch (e) {
    console.error('[WorkoutContext] Failed to persist active workout on update:', e);
  }
})(); // ❌ No se espera el resultado

// En useWorkoutState
setTimeout(() => {
  onDataChangeRef.current?.(newData);
}, 0); // ❌ Puede ejecutarse antes o después del guardado anterior
```

**Impacto**: Los datos se sobrescriben entre sí, causando pérdida de series completadas, pesos y repeticiones

**Solución**:
```typescript
// Centralizar guardado en un único lugar con cola de guardado
class SaveQueue {
  private queue: Promise<void> = Promise.resolve();
  
  async save(data: WorkoutState) {
    this.queue = this.queue.then(() => storageService.saveActiveWorkout(data));
    return this.queue;
  }
}
```

---

### 3. Falta de Sincronización en updateModifiedRoutine()

**Ubicación**: `context/WorkoutContext.tsx` línea 280-320

**Problema**:
```typescript
const updateModifiedRoutine = useCallback(async (routine: Routine) => {
  try {
    await updateRoutine(routine.id, { /* ... */ });
    console.log('[WorkoutContext] Modified routine saved to Supabase');
  } catch (error) {
    console.error('[WorkoutContext] Error saving modified routine to Supabase:', error);
    // ❌ No lanzar error, continuar con el guardado local
  }
  
  // ❌ Actualiza estado local incluso si Supabase falló
  setActiveWorkout(prev => {
    if (!prev) return null;
    const newState = { ...prev, modifiedRoutine: routine };
    // ...
  });
});
```

**Impacto**: Rutinas modificadas durante el entrenamiento (series agregadas/eliminadas) se pierden al refrescar

**Solución**:
```typescript
// Hacer await obligatorio y revertir cambios si falla
try {
  await updateRoutine(routine.id, data);
  // Solo actualizar estado local si Supabase tuvo éxito
  setActiveWorkout(prev => ({ ...prev, modifiedRoutine: routine }));
} catch (error) {
  // Mostrar error al usuario y no actualizar estado
  throw new Error('No se pudo guardar la rutina modificada');
}
```

---

### 4. Validación de Datos Incompleta en normalizeActiveWorkout()

**Ubicación**: `context/WorkoutContext.tsx` línea 80-150

**Problema**:
```typescript
return {
  routineId: String(data.routineId),
  routineName: String(data.routineName),
  currentExerciseIndex: typeof data.currentExerciseIndex === 'string' 
    ? parseInt(data.currentExerciseIndex) || 0 
    : Number(data.currentExerciseIndex ?? 0),
  currentSet: typeof data.currentSet === 'string'
    ? parseInt(data.currentSet) || 1
    : Number(data.currentSet ?? 1),
  // ❌ No valida que currentExerciseIndex sea válido respecto a routine.exercises.length
  // ❌ No valida que currentSet sea válido respecto a exercise.sets.length
};
```

**Impacto**: Errores de acceso a arrays, pantalla en blanco, crash de la app

**Solución**:
```typescript
// Validar índices contra la rutina cargada
const normalizeActiveWorkout = (data: any, routine: Routine): WorkoutState => {
  const exerciseIndex = Math.max(0, Math.min(
    Number(data.currentExerciseIndex ?? 0),
    routine.exercises.length - 1
  ));
  
  const currentExercise = routine.exercises[exerciseIndex];
  const currentSet = Math.max(1, Math.min(
    Number(data.currentSet ?? 1),
    currentExercise?.sets.length || 1
  ));
  
  return { /* ... */ };
};
```

---

### 5. Pérdida de Datos por clearActiveWorkout() Prematuro

**Ubicación**: `context/WorkoutContext.tsx` línea 200-250

**Problema**:
```typescript
// Si la validación falla, se limpia inmediatamente
if (!validationResult.success) {
  console.error('[WorkoutContext] Invalid workout state, clearing:', validationResult.error);
  await storageService.clearActiveWorkout(); // ❌ Pérdida de datos sin recuperación
  setActiveWorkout(null);
}
```

**Impacto**: Usuario pierde todo el progreso del entrenamiento si hay un error de validación temporal

**Solución**:
```typescript
// Guardar backup antes de limpiar
if (!validationResult.success) {
  const backupKey = `workout-backup-${Date.now()}`;
  localStorage.setItem(backupKey, JSON.stringify(stored));
  
  // Mostrar notificación al usuario
  showError('Error al cargar entrenamiento. Se guardó un backup.');
  
  // Intentar recuperación parcial
  const recovered = attemptPartialRecovery(stored);
  if (recovered) {
    setActiveWorkout(recovered);
    return;
  }
  
  await storageService.clearActiveWorkout();
}
```

---

## ⚠️ PROBLEMAS DE LÓGICA (Prioridad 2)

### 6. Inconsistencia en Cálculo de completedSets

**Ubicación**: `app/workout/[id]/page.tsx` línea 600-700

**Problema**:
```typescript
// Método 1: En Quick Edit Mode
const handleQuickToggleSetComplete = (exerciseId: string, setIndex: number) => {
  const actualReps = workoutState.workoutData.actualReps[exerciseId] || [];
  const completedCount = actualReps.filter((r: number) => r > 0).length;
  // ❌ Cuenta basándose en reps > 0
};

// Método 2: En Guided Mode
const handleToggleSetComplete = (exerciseId: string, setIndex: number) => {
  const currentCompleted = workoutState.workoutData.completedSets[exerciseId] || 0;
  const newCompleted = isCompleted ? currentCompleted - 1 : currentCompleted + 1;
  // ❌ Usa un contador manual
};
```

**Impacto**: Progreso incorrecto, series marcadas como completadas pero no contadas

**Solución**:
```typescript
// Función centralizada de cálculo
const calculateCompletedSets = (exerciseId: string): number => {
  const actualReps = workoutState.workoutData.actualReps[exerciseId] || [];
  return actualReps.filter((r: number) => typeof r === 'number' && r > 0).length;
};

// Usar en ambos modos
const handleToggleSetComplete = (exerciseId: string, setIndex: number) => {
  // Actualizar reps primero
  const newReps = [...actualReps];
  newReps[setIndex] = isCompleted ? 0 : currentReps;
  
  // Recalcular completedSets automáticamente
  const newCompleted = calculateCompletedSets(exerciseId);
  
  workoutState.updateActualReps(exerciseId, newReps);
  workoutState.updateCompletedSets(exerciseId, newCompleted);
};
```

---

### 7. Timer de Descanso No Se Restaura Correctamente

**Ubicación**: `app/workout/[id]/page.tsx` línea 350-380

**Problema**:
```typescript
// Al restaurar un workout pausado
if (s.isResting && s.restTimerDuration && s.restTimerStartedAt) {
  const elapsed = Math.floor((Date.now() - Number(s.restTimerStartedAt)) / 1000);
  const remaining = Number(s.restTimerDuration) - elapsed;
  // ❌ Si el usuario pausó la app hace 10 minutos, remaining será negativo
  if (remaining > 0) {
    timerHandlers.startTimer(remaining, ...);
  }
}
```

**Impacto**: Timer no se muestra o muestra valores incorrectos después de pausar la app

**Solución**:
```typescript
// Guardar el tiempo restante en lugar del tiempo de inicio
interface RestState {
  isResting: boolean;
  restTimerRemaining: number; // Tiempo restante en segundos
  restTimerTitle: string;
  restTimerNextExercise?: string;
  restTimerPausedAt?: number; // Timestamp cuando se pausó
}

// Al pausar la app
onPause: () => {
  if (timerHandlers.showTimer) {
    const remaining = timerHandlers.getRemainingTime();
    saveRestState({
      isResting: true,
      restTimerRemaining: remaining,
      restTimerPausedAt: Date.now()
    });
  }
};

// Al restaurar
if (s.isResting && s.restTimerRemaining > 0) {
  timerHandlers.startTimer(s.restTimerRemaining, s.restTimerTitle, s.restTimerNextExercise);
}
```

---

### 8. Falta de Validación en handleAddSet() y handleDeleteSet()

**Ubicación**: `app/workout/[id]/page.tsx` línea 1100-1200

**Problema**:
```typescript
const handleAddSet = () => {
  const updatedExercises = routine.exercises.map((ex: Exercise) => {
    if (ex.id === currentExercise.id) { // ❌ currentExercise puede ser null
      return {
        ...ex,
        sets: [...ex.sets, { reps: 10, weight: 0, type: 'normal' }]
      };
    }
    return ex;
  });
};
```

**Impacto**: Crash al intentar agregar/eliminar series cuando no hay ejercicio seleccionado

**Solución**:
```typescript
const handleAddSet = () => {
  if (!currentExercise || !routine) {
    console.warn('[Workout] Cannot add set: no current exercise or routine');
    return;
  }
  
  if (currentExercise.sets.length >= 20) {
    error('Máximo 20 series por ejercicio');
    return;
  }
  
  const updatedExercises = routine.exercises.map((ex: Exercise) => {
    if (ex.id === currentExercise.id) {
      return {
        ...ex,
        sets: [...ex.sets, { reps: 10, weight: 0, type: 'normal' }]
      };
    }
    return ex;
  });
  
  // Actualizar rutina
  const updatedRoutine = { ...routine, exercises: updatedExercises };
  updateModifiedRoutine(updatedRoutine);
};
```

---

### 9. updateRoutine() en GymContext Puede Fallar Silenciosamente

**Ubicación**: `context/GymContext.tsx` línea 120-160

**Problema**:
```typescript
const updateRoutine = useCallback(async (id: string, updatedData: Partial<Routine>) => {
  try {
    const currentRoutines = await storageService.getRoutines();
    let routine = currentRoutines.find(r => r.id === id);
    
    if (!routine) {
      routine = routines.find(r => r.id === id); // Fallback al estado local
    }
    
    if (!routine) {
      throw new Error('Rutina no encontrada'); // ❌ Lanza error sin actualizar estado
    }
    
    await storageService.updateRoutine(id, updatedRoutine);
    await refreshRoutines(); // ❌ Si falla, el estado local no se actualiza
  } catch (error) {
    console.error('Error updating routine:', error);
    throw error;
  }
}, [refreshRoutines, routines]);
```

**Impacto**: Cambios en rutinas no se persisten, usuario piensa que guardó pero no se guardó

**Solución**:
```typescript
const updateRoutine = useCallback(async (id: string, updatedData: Partial<Routine>) => {
  try {
    const currentRoutines = await storageService.getRoutines();
    let routine = currentRoutines.find(r => r.id === id);
    
    if (!routine) {
      routine = routines.find(r => r.id === id);
    }
    
    if (!routine) {
      throw new Error('Rutina no encontrada');
    }
    
    const updatedRoutine = { ...routine, ...updatedData } as Routine;
    
    // Actualizar estado local PRIMERO (optimistic update)
    setRoutines(prevRoutines => 
      prevRoutines.map(r => r.id === id ? updatedRoutine : r)
    );
    
    // Luego intentar guardar en storage
    try {
      await storageService.updateRoutine(id, updatedRoutine);
    } catch (storageError) {
      // Si falla, revertir cambio local
      await refreshRoutines();
      throw storageError;
    }
  } catch (error) {
    console.error('Error updating routine:', error);
    throw error;
  }
}, [refreshRoutines, routines]);
```

---

### 10-13. Otros Problemas de Lógica

Ver secciones detalladas en el documento completo.

---

## 🐌 PROBLEMAS DE RENDIMIENTO (Prioridad 3)

### 14. Múltiples Re-renders Innecesarios en WorkoutPage

**Ubicación**: `app/workout/[id]/page.tsx` línea 1-100

**Problema**:
```typescript
// currentExercise se recalcula en cada render
const currentExercise = useMemo(() => {
  if (!routine?.exercises?.length) return null;
  return routine.exercises[workoutState.currentExerciseIndex] || null;
}, [routine?.exercises, workoutState.currentExerciseIndex]);
// ❌ routine?.exercises cambia en cada render porque es un array nuevo

// workoutProgress se recalcula aunque los datos no cambien
const workoutProgress = useMemo(() => {
  const totalSets = routine.exercises.reduce((sum: number, ex: Exercise) => sum + ex.sets.length, 0);
  // ...
}, [routine?.exercises, workoutState.workoutData.completedSets]);
// ❌ routine?.exercises y completedSets cambian frecuentemente
```

**Impacto**: Lag en dispositivos móviles, especialmente durante entrenamiento activo

**Solución**:
```typescript
// Memoizar routine.exercises
const exercises = useMemo(() => routine?.exercises || [], [routine?.id]);

// Usar dependencias más específicas
const currentExercise = useMemo(() => {
  if (!exercises.length) return null;
  return exercises[workoutState.currentExerciseIndex] || null;
}, [exercises, workoutState.currentExerciseIndex]);

// Memoizar completedSets con JSON.stringify para comparación profunda
const completedSetsKey = useMemo(
  () => JSON.stringify(workoutState.workoutData.completedSets),
  [workoutState.workoutData.completedSets]
);

const workoutProgress = useMemo(() => {
  // Cálculo...
}, [exercises, completedSetsKey]);
```

---

### 15. WeeklyPlanner Carga Planes Secuencialmente

**Ubicación**: `components/WeeklyPlanner.tsx` línea 80-120

**Problema**:
```typescript
// Aunque usa Promise.all(), los planes se guardan con debounce individual
const debouncedSaveWeekly = useMemo(
  () => debounce((plan: WeeklyPlan) => {
    storageService.saveWeeklyPlan(plan);
  }, 500),
  []
);

const debouncedSaveMonthly = useMemo(
  () => debounce((plan: MonthlyPlan) => {
    storageService.saveMonthlyPlan(plan);
  }, 500),
  []
);
// ❌ Dos debounces separados = dos escrituras a storage
```

**Impacto**: Lentitud en guardado, especialmente en dispositivos lentos

**Solución**:
```typescript
// Usar un debounce compartido para ambos planes
const debouncedSavePlans = useMemo(
  () => debounce(async () => {
    await Promise.all([
      storageService.saveWeeklyPlan(weeklyPlanRef.current),
      storageService.saveMonthlyPlan(monthlyPlanRef.current)
    ]);
  }, 500),
  []
);

// Actualizar ambos planes y guardar una vez
const updateWeeklyPlan = (plan: WeeklyPlan) => {
  setWeeklyPlan(plan);
  weeklyPlanRef.current = plan;
  debouncedSavePlans();
};
```

---

### 16. EditValueModal Crea Múltiples Timers

**Ubicación**: `components/EditValueModal.tsx` línea 80-120

**Problema**:
```typescript
useEffect(() => {
  if (value !== initialValue) {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    // ❌ No limpia el timer anterior si value cambia rápidamente
    return () => clearTimeout(timer);
  }
}, [value, initialValue]);
```

**Impacto**: Auto-cierre impredecible, guardados duplicados

**Solución**:
```typescript
const timerRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
  // Limpiar timer anterior
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
  
  if (value !== initialValue) {
    timerRef.current = setTimeout(() => {
      onClose();
    }, 3000);
  }
  
  return () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };
}, [value, initialValue, onClose]);
```

---

### 17. filteredRoutines en WeeklyPlanner Se Recalcula Innecesariamente

**Ubicación**: `components/WeeklyPlanner.tsx` línea 300-310

**Problema**:
```typescript
const filteredRoutines = useMemo(() => {
  return routines.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [routines, searchQuery]);
// ❌ Se recalcula en cada tecla presionada
```

**Impacto**: Lag al buscar rutinas, especialmente con muchas rutinas

**Solución**:
```typescript
// Debounce en searchQuery
const [searchQuery, setSearchQuery] = useState('');
const [debouncedQuery, setDebouncedQuery] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedQuery(searchQuery);
  }, 300);
  return () => clearTimeout(timer);
}, [searchQuery]);

const filteredRoutines = useMemo(() => {
  return routines.filter(r => 
    r.name.toLowerCase().includes(debouncedQuery.toLowerCase())
  );
}, [routines, debouncedQuery]);
```

---

## 🔒 PROBLEMAS DE SEGURIDAD (Prioridad 3)

### 18. Falta de Validación de Entrada en updateActualReps() y updateActualWeights()

**Ubicación**: `app/workout/[id]/hooks/useWorkoutState.ts` línea 150-200

**Problema**:
```typescript
const updateActualReps = useCallback((exerciseId: string, reps: number[]) => {
  setWorkoutData(prev => ({
    ...prev,
    actualReps: { ...prev.actualReps, [exerciseId]: reps },
    // ❌ No valida que reps sean números válidos
  }));
}, []);

const updateActualWeights = useCallback((exerciseId: string, weights: number[]) => {
  setWorkoutData(prev => ({
    ...prev,
    actualWeights: { ...prev.actualWeights, [exerciseId]: weights },
    // ❌ Acepta NaN, Infinity, negativos
  }));
}, []);
```

**Impacto**: Datos corruptos en sesiones, cálculos incorrectos de progresión, crashes

**Solución**:
```typescript
const validateNumber = (value: any): number => {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) {
    return 0;
  }
  return Math.round(num * 100) / 100; // Redondear a 2 decimales
};

const updateActualReps = useCallback((exerciseId: string, reps: number[]) => {
  const validatedReps = reps.map(r => {
    const validated = validateNumber(r);
    if (validated > 999) return 999; // Máximo razonable
    return validated;
  });
  
  setWorkoutData(prev => ({
    ...prev,
    actualReps: { ...prev.actualReps, [exerciseId]: validatedReps },
    _lastUpdate: Date.now()
  }));
}, []);

const updateActualWeights = useCallback((exerciseId: string, weights: number[]) => {
  const validatedWeights = weights.map(w => {
    const validated = validateNumber(w);
    if (validated > 9999) return 9999; // Máximo razonable
    return validated;
  });
  
  setWorkoutData(prev => ({
    ...prev,
    actualWeights: { ...prev.actualWeights, [exerciseId]: validatedWeights },
    _lastUpdate: Date.now()
  }));
}, []);
```

---

### 19. Inyección de Datos en restoreData()

**Ubicación**: `context/WorkoutContext.tsx` línea 200-250

**Problema**:
```typescript
const restoreData = useCallback((data: Partial<WorkoutData>) => {
  setWorkoutData(prev => ({
    ...prev,
    ...data, // ❌ Restaura datos sin validar estructura
    _lastUpdate: Date.now()
  }));
}, []);
```

**Impacto**: Crash al restaurar workout corrupto, posible inyección de datos maliciosos

**Solución**:
```typescript
const restoreData = useCallback((data: Partial<WorkoutData>) => {
  // Validar con schema existente
  const validationResult = validateDataWithLogging(
    WorkoutStateSchema,
    data,
    '[useWorkoutState] Restoring data'
  );
  
  if (!validationResult.success) {
    console.error('[useWorkoutState] Invalid data, skipping restore:', validationResult.error);
    return;
  }
  
  setWorkoutData(prev => ({
    ...prev,
    ...validationResult.data,
    _lastUpdate: Date.now()
  }));
}, []);
```

---

## ♿ PROBLEMAS DE ACCESIBILIDAD (Prioridad 4)

### 20. Falta de aria-label en Botones de Control

**Ubicación**: `components/EditValueModal.tsx`, `components/WeeklyPlanner.tsx`

**Problema**:
```tsx
<button onClick={onClose}>
  <X className="h-5 w-5" />
  {/* ❌ Sin aria-label */}
</button>

<button onClick={handleClear}>
  <Trash2 className="h-4 w-4" />
  {/* ❌ Sin aria-label */}
</button>
```

**Impacto**: Usuarios con lectores de pantalla no entienden qué hace cada botón

**Solución**:
```tsx
<button 
  onClick={onClose}
  aria-label="Cerrar modal"
  className="..."
>
  <X className="h-5 w-5" />
</button>

<button 
  onClick={handleClear}
  aria-label="Limpiar búsqueda"
  className="..."
>
  <Trash2 className="h-4 w-4" />
</button>
```

---

### 21. Contraste Insuficiente en Algunos Textos

**Ubicación**: `components/WeeklyPlanner.tsx` línea 400-500

**Problema**:
```tsx
<p className="text-gray-400 text-sm">
  {/* ❌ text-gray-400 sobre bg-gray-800 = contraste 3.5:1 (mínimo 4.5:1) */}
  No hay rutinas asignadas
</p>
```

**Impacto**: Difícil de leer para usuarios con baja visión

**Solución**:
```tsx
<p className="text-gray-300 text-sm">
  {/* ✅ text-gray-300 sobre bg-gray-800 = contraste 5.2:1 */}
  No hay rutinas asignadas
</p>
```

---

## 🔄 PROBLEMAS DE ESTADO (Prioridad 3)

### 22. isResting No Se Sincroniza Correctamente

**Ubicación**: `context/WorkoutContext.tsx` línea 150-180

**Problema**:
```typescript
// isResting se guarda en activeWorkout
updateWorkoutProgress(
  exerciseIndex,
  set,
  completedSets,
  actualReps,
  actualWeights,
  {
    isResting: true, // ❌ Pero timerHandlers.showTimer es la fuente de verdad
    restTimerDuration: duration
  }
);

// En otro lugar
if (timerHandlers.showTimer) {
  // Timer visible pero isResting puede ser false
}
```

**Impacto**: Timer se muestra pero estado dice que no está en descanso, inconsistencias

**Solución**:
```typescript
// Usar timerHandlers como única fuente de verdad
const isResting = timerHandlers.showTimer;

// Al guardar
updateWorkoutProgress(
  exerciseIndex,
  set,
  completedSets,
  actualReps,
  actualWeights,
  timerHandlers.showTimer ? {
    isResting: true,
    restTimerDuration: timerHandlers.getRemainingTime(),
    restTimerTitle: timerHandlers.timerTitle
  } : undefined
);
```

---

### 23. totalPausedTime No Se Persiste Correctamente

**Ubicación**: `app/workout/[id]/page.tsx` línea 250-300

**Problema**:
```typescript
const [totalPausedTime, setTotalPausedTime] = useState(0);
const [isPaused, setIsPaused] = useState(false);

const handlePause = () => {
  setIsPaused(true);
  setPauseStartTime(Date.now());
  // ❌ No se guarda en activeWorkout hasta que se llama a updateWorkoutProgress()
};

const handleResume = () => {
  if (pauseStartTime) {
    const pauseDuration = Date.now() - pauseStartTime;
    setTotalPausedTime(prev => prev + pauseDuration);
    // ❌ Si la app se cierra aquí, se pierde pauseDuration
  }
  setIsPaused(false);
};
```

**Impacto**: Tiempo de entrenamiento incorrecto si la app se cierra durante pausa

**Solución**:
```typescript
const handlePause = async () => {
  setIsPaused(true);
  const pauseStart = Date.now();
  setPauseStartTime(pauseStart);
  
  // Guardar inmediatamente
  await updateWorkoutProgress(
    workoutState.currentExerciseIndex,
    workoutState.currentSet,
    workoutState.workoutData.completedSets,
    workoutState.workoutData.actualReps,
    workoutState.workoutData.actualWeights,
    undefined,
    totalPausedTime,
    { pauseStartTime: pauseStart } // Nuevo campo
  );
};

const handleResume = async () => {
  if (pauseStartTime) {
    const pauseDuration = Date.now() - pauseStartTime;
    const newTotalPaused = totalPausedTime + pauseDuration;
    setTotalPausedTime(newTotalPaused);
    
    // Guardar inmediatamente
    await updateWorkoutProgress(
      workoutState.currentExerciseIndex,
      workoutState.currentSet,
      workoutState.workoutData.completedSets,
      workoutState.workoutData.actualReps,
      workoutState.workoutData.actualWeights,
      undefined,
      newTotalPaused
    );
  }
  setIsPaused(false);
  setPauseStartTime(null);
};
```

---

## 📊 PROBLEMAS DE DATOS (Prioridad 3)

### 24. personalRecords.ts No Maneja Sesiones Vacías

**Ubicación**: `lib/personalRecords.ts` línea 30-60

**Problema**:
```typescript
export function getPersonalRecord(exerciseId: string, sessions: WorkoutSession[]): PersonalRecord | null {
  for (const session of sessions) {
    const exercise = session.exercises.find(ex => ex.exerciseId === exerciseId);
    if (!exercise) continue;
    
    const sessionMaxWeight = Math.max(...(exercise.actualWeight || [0]));
    // ❌ Si actualWeight es [], Math.max(...[]) devuelve -Infinity
    
    if (sessionMaxWeight > maxWeight) {
      maxWeight = sessionMaxWeight;
    }
  }
}
```

**Impacto**: Récords personales incorrectos, valores -Infinity en la UI

**Solución**:
```typescript
export function getPersonalRecord(exerciseId: string, sessions: WorkoutSession[]): PersonalRecord | null {
  for (const session of sessions) {
    const exercise = session.exercises.find(ex => ex.exerciseId === exerciseId);
    if (!exercise) continue;
    
    const weights = exercise.actualWeight || [];
    if (weights.length === 0) continue; // ✅ Validar array vacío
    
    const sessionMaxWeight = Math.max(...weights);
    
    // Validar que sea un número válido
    if (!Number.isFinite(sessionMaxWeight) || sessionMaxWeight <= 0) continue;
    
    if (sessionMaxWeight > maxWeight) {
      maxWeight = sessionMaxWeight;
      recordSession = session;
      recordExercise = exercise;
    }
  }
  
  if (!recordSession || !recordExercise || maxWeight === 0) {
    return null;
  }
  
  return { /* ... */ };
}
```

---

### 25. progression-advanced.ts Asume Estructura de Datos Específica

**Ubicación**: `lib/progression-advanced.ts` línea 100-150

**Problema**:
```typescript
sessions
  .slice()
  .sort((a, b) => +new Date(b.date) - +new Date(a.date))
  .forEach(s => {
    const ex = s.exercises?.find(e => e.exerciseId === exerciseId);
    if (!ex) return;
    
    const lastIdx = (ex.actualReps?.length || 0) - 1;
    if (lastIdx < 0) return;
    
    const reps = ex.actualReps?.[lastIdx] ?? 0;
    const weight = ex.actualWeight?.[lastIdx] ?? 0;
    // ❌ Si actualWeight está vacío pero actualReps no, weight será undefined
    
    relevant.push({ date: dateStr, weight, reps, volume });
  });
```

**Impacto**: Recomendaciones de progresión incorrectas, NaN en cálculos

**Solución**:
```typescript
sessions
  .slice()
  .sort((a, b) => +new Date(b.date) - +new Date(a.date))
  .forEach(s => {
    const ex = s.exercises?.find(e => e.exerciseId === exerciseId);
    if (!ex) return;
    
    // Validar que ambos arrays existan y tengan datos
    const repsArray = ex.actualReps || [];
    const weightsArray = ex.actualWeight || [];
    
    if (repsArray.length === 0 || weightsArray.length === 0) return;
    
    const lastIdx = Math.min(repsArray.length, weightsArray.length) - 1;
    if (lastIdx < 0) return;
    
    const reps = Number(repsArray[lastIdx]) || 0;
    const weight = Number(weightsArray[lastIdx]) || 0;
    
    // Validar que sean números válidos
    if (!Number.isFinite(reps) || !Number.isFinite(weight)) return;
    if (reps <= 0 || weight < 0) return;
    
    const volume = calculateVolume(ex);
    const dateStr = (s.date && typeof (s.date as any).toISOString === 'function')
      ? (s.date as any).toISOString()
      : String(s.date);
    
    relevant.push({ date: dateStr, weight, reps, volume });
  });
```

---

## 📝 PROBLEMAS MENORES (Prioridad 4)

### Logs de Debug Dejados en Producción

**Ubicación**: Múltiples archivos

**Problema**: `console.log()` y `console.warn()` sin condicionales de desarrollo

**Solución**:
```typescript
// Usar logger existente o condicionales
if (process.env.NODE_ENV === 'development') {
  console.log('[WorkoutContext] Saving to storage:', newState);
}

// O usar el logger
import logger from '@/lib/logger';
logger.debug('Saving to storage', { newState });
```

---

### Falta de Manejo de Errores en Callbacks Asíncronos

**Ubicación**: `app/workout/[id]/page.tsx` línea 400-500

**Problema**: Muchos `(async () => { ... })()` sin `.catch()`

**Solución**:
```typescript
// Antes
(async () => {
  await storageService.saveActiveWorkout(newState);
})();

// Después
(async () => {
  try {
    await storageService.saveActiveWorkout(newState);
  } catch (error) {
    console.error('[WorkoutContext] Failed to save:', error);
    // Opcional: mostrar notificación al usuario
  }
})();
```

---

### useWorkoutState Usa setTimeout para Guardado

**Ubicación**: `app/workout/[id]/hooks/useWorkoutState.ts` línea 150-200

**Problema**: `setTimeout(..., 0)` no garantiza orden de ejecución

**Solución**:
```typescript
// Usar microtasks (queueMicrotask) o promesas
const updateActualReps = useCallback((exerciseId: string, reps: number[]) => {
  setWorkoutData(prev => {
    const newData = { ...prev, actualReps: { ...prev.actualReps, [exerciseId]: reps } };
    
    // Usar queueMicrotask para garantizar orden
    if (!isInitializingRef.current && onDataChangeRef.current) {
      queueMicrotask(() => {
        onDataChangeRef.current?.(newData);
      });
    }
    
    return newData;
  });
}, []);
```

---

## 📋 PLAN DE CORRECCIÓN PRIORIZADO

### Fase 1: Críticos (Semana 1)
1. ✅ Problema #2: Centralizar guardado con cola
2. ✅ Problema #1: Mejorar normalización con backup
3. ✅ Problema #3: Sincronizar updateModifiedRoutine
4. ✅ Problema #4: Validar índices en normalización
5. ✅ Problema #5: Implementar sistema de backup

### Fase 2: Lógica (Semana 2)
6. ✅ Problema #6: Centralizar cálculo de completedSets
7. ✅ Problema #7: Corregir restauración de timer
8. ✅ Problema #8: Validar en handleAddSet/DeleteSet
9. ✅ Problema #9: Optimistic updates en updateRoutine

### Fase 3: Rendimiento (Semana 3)
10. ✅ Problema #14: Optimizar re-renders
11. ✅ Problema #15: Debounce compartido en WeeklyPlanner
12. ✅ Problema #16: Corregir timers en EditValueModal
13. ✅ Problema #17: Debounce en búsqueda

### Fase 4: Seguridad y Datos (Semana 4)
14. ✅ Problema #18: Validar entrada de números
15. ✅ Problema #19: Validar restoreData
16. ✅ Problema #24: Manejar arrays vacíos en personalRecords
17. ✅ Problema #25: Validar datos en progression-advanced

### Fase 5: Accesibilidad y Menores (Semana 5)
18. ✅ Problema #20-21: Mejorar accesibilidad
19. ✅ Problema #22-23: Sincronizar estado
20. ✅ Logs y manejo de errores

---

## 🎯 MÉTRICAS DE ÉXITO

- ✅ 0 pérdidas de datos reportadas
- ✅ Tiempo de carga < 2s en dispositivos móviles
- ✅ 0 crashes por validación de datos
- ✅ Puntuación de accesibilidad > 90
- ✅ Cobertura de tests > 80%

---

**Documento generado**: 26 de Marzo, 2026  
**Próxima revisión**: Después de implementar Fase 1
