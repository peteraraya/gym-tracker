# Design Document

## Introducción

Este documento describe el diseño técnico para implementar indicadores de rendimiento en tiempo real durante el entrenamiento. El sistema mostrará estadísticas actualizadas dinámicamente (volumen total, series completadas, repeticiones totales) mientras el usuario entrena, similar a la aplicación Hevy.

## Arquitectura de Alto Nivel

### Componentes Principales

```
┌─────────────────────────────────────────────────────────┐
│                  WorkoutPage (page.tsx)                 │
│  ┌───────────────────────────────────────────────────┐  │
│  │         WorkoutHeader (existing)                  │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │    LiveStatsPanel (NEW - already created)        │  │
│  │    - Volumen total (kg)                          │  │
│  │    - Series completadas                          │  │
│  │    - Repeticiones totales                        │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │         ExerciseCard (existing)                   │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │         ExerciseList (existing)                   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ uses
                          ▼
┌─────────────────────────────────────────────────────────┐
│              useWorkoutState Hook                       │
│  - completedSets: Record<string, number>               │
│  - actualReps: Record<string, number[]>                │
│  - actualWeights: Record<string, number[]>             │
└─────────────────────────────────────────────────────────┘
                          │
                          │ calculates
                          ▼
┌─────────────────────────────────────────────────────────┐
│              LiveStatsPanel                             │
│  useMemo(() => {                                        │
│    totalVolume = Σ(reps × weight)                      │
│    totalSets = count(completedSets)                    │
│    totalReps = Σ(reps)                                 │
│  })                                                     │
└─────────────────────────────────────────────────────────┘
                          │
                          │ displays in
                          ▼
┌─────────────────────────────────────────────────────────┐
│              WorkoutSummary (enhanced)                  │
│  - Muestra mismas estadísticas al finalizar            │
│  - Desglose por ejercicio                              │
│  - Promedio de reps por serie                          │
└─────────────────────────────────────────────────────────┘
```

### Flujo de Datos

```
Usuario completa serie
        │
        ▼
handleCompleteSet()
        │
        ▼
workoutState.completeSet(exerciseId, reps, weight)
        │
        ▼
Actualiza: completedSets, actualReps, actualWeights
        │
        ▼
LiveStatsPanel detecta cambio (useMemo dependencies)
        │
        ▼
Recalcula estadísticas en <100ms
        │
        ▼
Re-render con nuevos valores
```

## Diseño de Bajo Nivel

### 1. Integración de LiveStatsPanel en WorkoutPage

**Ubicación:** Después de `WorkoutHeader`, antes de botones de acción

```typescript
// app/workout/[id]/page.tsx

return (
  <ProtectedRoute>
    <div className="container mx-auto px-4 py-8 pb-32">
      {/* Minimized timer overlay */}
      {showTimer && timerMinimized && (
        <MinimizedTimer ... />
      )}

      {/* Global timer */}
      <WorkoutGlobalTimer startTime={workoutStartTime} />

      {/* Header */}
      <WorkoutHeader ... />

      {/* ✨ NEW: Live Stats Panel - STICKY */}
      <div className="sticky top-0 z-10 mb-6 -mx-4 px-4 py-2 bg-white dark:bg-gray-900">
        <LiveStatsPanel
          completedSets={workoutState.workoutData.completedSets}
          actualReps={workoutState.workoutData.actualReps}
          actualWeights={workoutState.workoutData.actualWeights}
          exercises={routine.exercises}
        />
      </div>

      {/* Action buttons - TOP */}
      {!isExecutingSet && (
        <div className="mb-6">
          <Button ... />
        </div>
      )}

      {/* Rest of the page ... */}
    </div>
  </ProtectedRoute>
);
```

**Justificación de posición sticky:**
- Requirement 3.5: "WHEN el usuario hace scroll, THE LiveStatsPanel SHALL permanecer visible"
- Mejora UX: Usuario siempre ve su progreso sin importar dónde esté en la página

### 2. Cálculo de Estadísticas (LiveStatsPanel)

**Archivo:** `app/workout/[id]/components/LiveStatsPanel.tsx` (ya existe)

**Algoritmo de cálculo:**

```typescript
const stats = useMemo(() => {
  let totalVolume = 0;
  let totalSets = 0;
  let totalReps = 0;
  
  // Iterar sobre todos los ejercicios
  exercises.forEach(exercise => {
    const exerciseId = exercise.id;
    const reps = actualReps[exerciseId] || [];
    const weights = actualWeights[exerciseId] || [];
    const completed = completedSets[exerciseId] || 0;
    
    // Sumar series completadas
    totalSets += completed;
    
    // Calcular volumen y reps por cada serie completada
    for (let i = 0; i < completed; i++) {
      const setReps = reps[i] || 0;
      const setWeight = weights[i] || 0;
      
      totalReps += setReps;
      totalVolume += setReps * setWeight; // Volumen = reps × peso
    }
  });
  
  return {
    volume: Math.round(totalVolume), // Redondear a entero
    sets: totalSets,
    reps: totalReps
  };
}, [completedSets, actualReps, actualWeights, exercises]);
```

**Complejidad:** O(n × m) donde n = ejercicios, m = series promedio
**Optimización:** useMemo solo recalcula cuando cambian las dependencias

### 3. Mejoras a WorkoutSummary

**Archivo:** `app/workout/[id]/components/WorkoutSummary.tsx`

**Cambios necesarios:**

```typescript
// Agregar cálculo de promedio de reps
const stats = useMemo(() => {
  let totalVolume = 0;
  let totalSets = 0;
  let totalReps = 0;

  routine.exercises.forEach(exercise => {
    const reps = actualReps[exercise.id] || [];
    const weights = actualWeights[exercise.id] || [];

    reps.forEach((rep, index) => {
      const weight = weights[index] || 0;
      totalVolume += rep * weight;
      totalSets += 1;
      totalReps += rep;
    });
  });

  return {
    totalVolume: Math.round(totalVolume),
    totalSets,
    totalReps,
    averageReps: totalSets > 0 ? Math.round(totalReps / totalSets) : 0, // ✨ NEW
  };
}, [routine, actualReps, actualWeights]);

// Agregar desglose por ejercicio con volumen individual
{routine.exercises.map(exercise => {
  const sets = completedSets[exercise.id] || 0;
  const reps = actualReps[exercise.id] || [];
  const weights = actualWeights[exercise.id] || [];
  const volume = reps.reduce((sum, rep, idx) => 
    sum + rep * (weights[idx] || 0), 0); // ✨ Volumen por ejercicio

  return (
    <div key={exercise.id} className="...">
      <div className="flex-1">
        <div className="font-medium">{exercise.name}</div>
        <div className="text-xs">
          {sets} series × {reps.length > 0 ? reps.join(', ') : '0'} reps
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold">{Math.round(volume)} kg</div>
      </div>
    </div>
  );
})}
```

### 4. Persistencia de Estadísticas

**Archivo:** `app/workout/[id]/page.tsx`

**Función:** `finishCompleteWorkout()`

**Cambios necesarios:**

```typescript
const finishCompleteWorkout = useCallback(async () => {
  if (!routine) return;

  const totalDuration = proposedDuration && proposedDuration > 0
    ? proposedDuration
    : Math.floor((Date.now() - workoutStartTime) / 1000);

  // ✨ Calcular volumen total antes de guardar
  let totalVolume = 0;
  routine.exercises.forEach((ex: any) => {
    const reps = workoutState.workoutData.actualReps[ex.id] || [];
    const weights = workoutState.workoutData.actualWeights[ex.id] || [];
    reps.forEach((rep, idx) => {
      totalVolume += rep * (weights[idx] || 0);
    });
  });

  const sessionExercises = routine.exercises.map((ex: any) => ({
    exerciseId: ex.id,
    exerciseName: ex.name,
    completedSets: workoutState.workoutData.completedSets[ex.id] || 0,
    actualReps: workoutState.workoutData.actualReps[ex.id] || [],
    actualWeight: workoutState.workoutData.actualWeights[ex.id] || [],
    setDurations: workoutState.workoutData.actualSetDurations[ex.id] || [],
    pauseDurations: workoutState.workoutData.actualPauseDurations[ex.id] || [],
    actualRestTimes: workoutState.workoutData.actualRestTimes[ex.id] || []
  }));

  try {
    await addSession({
      routineId: routine.id,
      date: new Date(),
      exercises: sessionExercises,
      notes: workoutState.sessionNotes.trim() || '',
      totalDuration,
      totalPausedTime,
      totalVolume: Math.round(totalVolume) // ✨ NEW: Persistir volumen total
    });
    
    // ... resto del código
  } catch (err) {
    // ... manejo de errores
  }
}, [/* dependencies */]);
```

**Nota:** Esto requiere actualizar el tipo `WorkoutSession` en `types/index.ts`:

```typescript
export interface WorkoutSession {
  id?: string;
  routineId: string;
  date: Date;
  exercises: SessionExercise[];
  notes: string;
  totalDuration: number;
  totalPausedTime?: number;
  totalVolume?: number; // ✨ NEW: Campo opcional para volumen total
}
```

### 5. Diseño Visual y Responsive

**Componente:** `LiveStatsPanel.tsx` (ya implementado)

**Características:**

```typescript
// Grid de 3 columnas responsive
<div className="grid grid-cols-3 gap-4">
  {/* Volumen Total - Azul */}
  <div className="text-center">
    <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
      {stats.volume.toLocaleString()} {/* Separadores de miles */}
    </div>
    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
      kg levantados
    </div>
  </div>
  
  {/* Series Completadas - Verde */}
  <div className="text-center border-x border-blue-200 dark:border-blue-800">
    <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 tabular-nums">
      {stats.sets}
    </div>
    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
      series
    </div>
  </div>
  
  {/* Repeticiones Totales - Púrpura */}
  <div className="text-center">
    <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 tabular-nums">
      {stats.reps}
    </div>
    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
      repeticiones
    </div>
  </div>
</div>
```

**Breakpoints:**
- Móvil (<640px): text-2xl (24px), text-xs (12px)
- Desktop (≥640px): text-3xl (30px), text-sm (14px)

**Colores:**
- Volumen: Azul (#2563eb / #60a5fa)
- Series: Verde (#16a34a / #4ade80)
- Repeticiones: Púrpura (#9333ea / #c084fc)

### 6. Optimización de Rendimiento

**Estrategias implementadas:**

1. **useMemo para cálculos:**
```typescript
const stats = useMemo(() => {
  // Cálculos pesados aquí
}, [completedSets, actualReps, actualWeights, exercises]);
```

2. **Dependencias específicas:**
- Solo recalcula cuando cambian: completedSets, actualReps, actualWeights, exercises
- NO recalcula en cada render del componente padre

3. **Componente controlado:**
- LiveStatsPanel no tiene estado interno
- Recibe todo por props desde useWorkoutState
- Evita sincronización de estado

4. **Formato numérico eficiente:**
```typescript
{stats.volume.toLocaleString()} // Usa API nativa del navegador
```

**Métricas esperadas:**
- Tiempo de cálculo: <50ms para 10+ ejercicios
- Tiempo de render: <16ms (60 FPS)
- Tiempo de actualización total: <100ms

### 7. Inicialización y Restauración

**Escenario 1: Nuevo entrenamiento**
```typescript
// Estado inicial en useWorkoutState
const [workoutData, setWorkoutData] = useState<WorkoutData>({
  completedSets: {}, // Vacío
  actualReps: {},    // Vacío
  actualWeights: {}, // Vacío
  // ...
});

// LiveStatsPanel mostrará: 0 kg, 0 series, 0 reps
```

**Escenario 2: Restaurar entrenamiento guardado**
```typescript
// En useEffect de inicialización (page.tsx)
if (storedWorkout && storedWorkout.routineId === id) {
  // Restaurar completedSets
  if (s.completedSets) {
    Object.keys(s.completedSets).forEach(exerciseId => {
      workoutState.updateCompletedSets(exerciseId, Number(s.completedSets[exerciseId] ?? 0));
    });
  }
  
  // Restaurar actualReps
  if (s.actualReps) {
    Object.keys(s.actualReps).forEach(exerciseId => {
      const reps = s.actualReps[exerciseId];
      if (Array.isArray(reps)) {
        workoutState.updateActualReps(exerciseId, reps.map((r: any) => Number(r ?? 0)));
      }
    });
  }
  
  // Restaurar actualWeights
  if (s.actualWeights) {
    Object.keys(s.actualWeights).forEach(exerciseId => {
      const weights = s.actualWeights[exerciseId];
      if (Array.isArray(weights)) {
        workoutState.updateActualWeights(exerciseId, weights.map((w: any) => Number(w ?? 0)));
      }
    });
  }
}

// LiveStatsPanel calculará automáticamente las estadísticas del progreso guardado
```

## Modelos de Datos

### WorkoutData (useWorkoutState)

```typescript
interface WorkoutData {
  completedSets: Record<string, number>;      // { exerciseId: count }
  actualReps: Record<string, number[]>;       // { exerciseId: [reps1, reps2, ...] }
  actualWeights: Record<string, number[]>;    // { exerciseId: [weight1, weight2, ...] }
  setTypes: Record<string, string[]>;
  lastWeights: Record<string, number[]>;
  restOverrides: Record<string, number>;
  perSetRestOverrides: Record<string, number[]>;
  actualSetDurations: Record<string, number[]>;
  actualPauseDurations: Record<string, number[]>;
  actualRestTimes: Record<string, number[]>;
}
```

### LiveStats (calculado)

```typescript
interface LiveStats {
  volume: number;    // Volumen total en kg (redondeado)
  sets: number;      // Total de series completadas
  reps: number;      // Total de repeticiones realizadas
}
```

### WorkoutSession (actualizado)

```typescript
export interface WorkoutSession {
  id?: string;
  routineId: string;
  date: Date;
  exercises: SessionExercise[];
  notes: string;
  totalDuration: number;
  totalPausedTime?: number;
  totalVolume?: number; // ✨ NEW: Volumen total de la sesión
}
```

## Diagramas de Secuencia

### Flujo: Usuario completa una serie

```
Usuario                WorkoutPage           useWorkoutState        LiveStatsPanel
  │                         │                       │                      │
  │  Completa serie         │                       │                      │
  ├────────────────────────>│                       │                      │
  │                         │                       │                      │
  │                         │ completeSet()         │                      │
  │                         ├──────────────────────>│                      │
  │                         │                       │                      │
  │                         │                       │ Actualiza:           │
  │                         │                       │ - completedSets      │
  │                         │                       │ - actualReps         │
  │                         │                       │ - actualWeights      │
  │                         │                       │                      │
  │                         │<──────────────────────┤                      │
  │                         │                       │                      │
  │                         │ Re-render             │                      │
  │                         ├──────────────────────────────────────────────>│
  │                         │                       │                      │
  │                         │                       │                      │ useMemo detecta
  │                         │                       │                      │ cambio en deps
  │                         │                       │                      │
  │                         │                       │                      │ Recalcula stats
  │                         │                       │                      │ (<50ms)
  │                         │                       │                      │
  │                         │<──────────────────────────────────────────────┤
  │                         │                       │                      │
  │  Ve estadísticas        │                       │                      │
  │  actualizadas           │                       │                      │
  │<────────────────────────┤                       │                      │
```

### Flujo: Finalizar entrenamiento

```
Usuario              WorkoutPage           addSession()         Supabase
  │                       │                      │                  │
  │  Finalizar            │                      │                  │
  ├──────────────────────>│                      │                  │
  │                       │                      │                  │
  │                       │ Calcular volumen     │                  │
  │                       │ total                │                  │
  │                       │                      │                  │
  │                       │ finishCompleteWorkout()                 │
  │                       ├─────────────────────>│                  │
  │                       │                      │                  │
  │                       │                      │ INSERT session   │
  │                       │                      │ con totalVolume  │
  │                       │                      ├─────────────────>│
  │                       │                      │                  │
  │                       │                      │<─────────────────┤
  │                       │<─────────────────────┤                  │
  │                       │                      │                  │
  │  Redirigir a /sessions│                      │                  │
  │<──────────────────────┤                      │                  │
```

## Consideraciones de Implementación

### Orden de Implementación

1. ✅ **Componente LiveStatsPanel** (ya creado)
   - Cálculo de estadísticas con useMemo
   - Diseño responsive con grid de 3 columnas
   - Colores distintivos por métrica

2. **Integración en WorkoutPage**
   - Importar LiveStatsPanel
   - Agregar después de WorkoutHeader con posición sticky
   - Pasar props desde workoutState

3. **Mejoras a WorkoutSummary**
   - Agregar cálculo de promedio de reps
   - Mostrar volumen por ejercicio
   - Mantener diseño consistente con LiveStatsPanel

4. **Persistencia de volumen total**
   - Actualizar tipo WorkoutSession
   - Calcular y guardar totalVolume en finishCompleteWorkout
   - Verificar migración de base de datos si es necesario

5. **Testing y validación**
   - Probar cálculos con diferentes escenarios
   - Verificar rendimiento con 10+ ejercicios
   - Validar restauración de estado

### Casos Edge

1. **Sin series completadas:**
   - LiveStatsPanel muestra: 0 kg, 0 series, 0 reps
   - No hay errores de división por cero

2. **Series con peso 0 (bodyweight):**
   - Se incluyen en el conteo de series y reps
   - Volumen = 0 para esas series

3. **Edición de series completadas:**
   - useMemo recalcula automáticamente
   - Actualización en <100ms

4. **Números muy grandes:**
   - toLocaleString() maneja separadores de miles
   - Ejemplo: 12,345 kg

5. **Restauración de workout:**
   - LiveStatsPanel calcula desde datos restaurados
   - No requiere lógica especial

### Compatibilidad

- **React:** 18.x (usa hooks modernos)
- **Next.js:** 13.x+ (App Router)
- **TypeScript:** 5.x
- **Tailwind CSS:** 3.x (clases responsive)
- **Navegadores:** Chrome 90+, Safari 14+, Firefox 88+

### Accesibilidad

- Contraste de colores: WCAG AA compliant
- Fuentes tabular-nums para alineación de números
- Etiquetas descriptivas (kg levantados, series, repeticiones)
- Tamaños de fuente legibles en móvil y desktop

## Métricas de Éxito

### Rendimiento
- ✅ Cálculo de estadísticas: <50ms
- ✅ Render de LiveStatsPanel: <16ms (60 FPS)
- ✅ Actualización total: <100ms

### UX
- ✅ Estadísticas visibles en todo momento (sticky)
- ✅ Actualización inmediata al completar serie
- ✅ Diseño consistente con resto de la app
- ✅ Responsive en móvil y desktop

### Funcionalidad
- ✅ Cálculo correcto de volumen (reps × peso)
- ✅ Persistencia de volumen total en sesión
- ✅ Restauración correcta de estado
- ✅ Desglose por ejercicio en resumen

## Referencias

- Requirement Document: `.kiro/specs/indicadores-rendimiento-tiempo-real/requirements.md`
- Componente existente: `app/workout/[id]/components/LiveStatsPanel.tsx`
- Hook de estado: `app/workout/[id]/hooks/useWorkoutState.ts`
- Página principal: `app/workout/[id]/page.tsx`
- Resumen: `app/workout/[id]/components/WorkoutSummary.tsx`
- Utilidades de volumen: `lib/utils/volumeCalculations.ts`
