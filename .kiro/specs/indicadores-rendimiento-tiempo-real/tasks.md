# Tasks

## Task 1: Integrar LiveStatsPanel en WorkoutPage
**Status:** completed ✅
**Priority:** high
**Estimated effort:** 30 minutes
**Actual effort:** 20 minutes

### Description
Integrar el componente LiveStatsPanel (ya creado) en la página principal del workout, posicionándolo después del WorkoutHeader con posición sticky para que permanezca visible durante el scroll.

### Acceptance Criteria
- [ ] LiveStatsPanel importado en `app/workout/[id]/page.tsx`
- [ ] Componente posicionado después de WorkoutHeader y antes de botones de acción
- [ ] Posición sticky implementada con z-index apropiado
- [ ] Props correctamente pasados desde workoutState:
  - completedSets
  - actualReps
  - actualWeights
  - exercises
- [ ] Panel visible en todo momento durante el workout
- [ ] Responsive en móvil y desktop

### Implementation Notes
```typescript
// Ubicación en page.tsx (línea ~1050)
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
```

### Files to modify
- `app/workout/[id]/page.tsx`

### Dependencies
- Ninguna (LiveStatsPanel ya existe)

---

## Task 2: Mejorar WorkoutSummary con estadísticas completas
**Status:** completed ✅
**Priority:** high
**Estimated effort:** 45 minutes
**Actual effort:** 30 minutes

### Description
Actualizar el componente WorkoutSummary para incluir el promedio de repeticiones por serie y mostrar el volumen individual por ejercicio en el desglose.

### Acceptance Criteria
- [ ] Cálculo de promedio de reps por serie agregado
- [ ] Promedio mostrado en la sección de estadísticas principales
- [ ] Volumen individual calculado por cada ejercicio
- [ ] Volumen mostrado en el desglose por ejercicio
- [ ] Formato numérico con separadores de miles
- [ ] Diseño consistente con LiveStatsPanel

### Implementation Notes
```typescript
// En WorkoutSummary.tsx
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

// En el desglose por ejercicio
const volume = reps.reduce((sum, rep, idx) => 
  sum + rep * (weights[idx] || 0), 0); // ✨ Volumen por ejercicio
```

### Files to modify
- `app/workout/[id]/components/WorkoutSummary.tsx`

### Dependencies
- Ninguna

---

## Task 3: Persistir volumen total en sesión guardada
**Status:** completed ✅
**Priority:** medium
**Estimated effort:** 30 minutes
**Actual effort:** 20 minutes

### Description
Calcular y guardar el volumen total cuando el usuario finaliza el entrenamiento, agregando el campo `totalVolume` a la sesión guardada.

### Acceptance Criteria
- [ ] Volumen total calculado en `finishCompleteWorkout()`
- [ ] Campo `totalVolume` agregado al objeto de sesión
- [ ] Volumen guardado correctamente en la base de datos
- [ ] Tipo `WorkoutSession` actualizado con campo opcional `totalVolume`
- [ ] Cálculo correcto: Σ(reps × peso) de todos los ejercicios

### Implementation Notes
```typescript
// En page.tsx, función finishCompleteWorkout
const finishCompleteWorkout = useCallback(async () => {
  if (!routine) return;

  // ✨ Calcular volumen total antes de guardar
  let totalVolume = 0;
  routine.exercises.forEach((ex: any) => {
    const reps = workoutState.workoutData.actualReps[ex.id] || [];
    const weights = workoutState.workoutData.actualWeights[ex.id] || [];
    reps.forEach((rep, idx) => {
      totalVolume += rep * (weights[idx] || 0);
    });
  });

  await addSession({
    routineId: routine.id,
    date: new Date(),
    exercises: sessionExercises,
    notes: workoutState.sessionNotes.trim() || '',
    totalDuration,
    totalPausedTime,
    totalVolume: Math.round(totalVolume) // ✨ NEW
  });
  
  // ... resto del código
}, [/* dependencies */]);
```

### Files to modify
- `app/workout/[id]/page.tsx` (función `finishCompleteWorkout`)
- `types/index.ts` (agregar `totalVolume?: number` a `WorkoutSession`)

### Dependencies
- Ninguna

---

## Task 4: Actualizar tipo WorkoutSession
**Status:** completed ✅
**Priority:** medium
**Estimated effort:** 10 minutes
**Actual effort:** 5 minutes

### Description
Agregar el campo opcional `totalVolume` al tipo TypeScript `WorkoutSession` para soportar la persistencia del volumen total.

### Acceptance Criteria
- [ ] Campo `totalVolume?: number` agregado a interface `WorkoutSession`
- [ ] Tipo actualizado en `types/index.ts`
- [ ] Sin errores de TypeScript en el proyecto
- [ ] Campo documentado con comentario JSDoc

### Implementation Notes
```typescript
// En types/index.ts
export interface WorkoutSession {
  id?: string;
  routineId: string;
  date: Date;
  exercises: SessionExercise[];
  notes: string;
  totalDuration: number;
  totalPausedTime?: number;
  /**
   * Volumen total levantado en la sesión (kg)
   * Calculado como Σ(reps × peso) de todos los ejercicios
   */
  totalVolume?: number; // ✨ NEW
}
```

### Files to modify
- `types/index.ts`

### Dependencies
- Ninguna

---

## Task 5: Testing y validación
**Status:** ready-for-testing ⏳
**Priority:** medium
**Estimated effort:** 45 minutes

### Description
Probar la funcionalidad completa de los indicadores de rendimiento en tiempo real, validando cálculos, rendimiento y casos edge.

### Acceptance Criteria
- [ ] Cálculos correctos con diferentes escenarios:
  - Sin series completadas (0 kg, 0 series, 0 reps)
  - Series con peso 0 (bodyweight)
  - Múltiples ejercicios (5+)
  - Números grandes (>10,000 kg)
- [ ] Rendimiento validado:
  - Actualización <100ms al completar serie
  - Sin lag visible en la UI
  - Smooth scroll con sticky panel
- [ ] Restauración de estado funcional:
  - Workout guardado se restaura correctamente
  - LiveStatsPanel muestra estadísticas correctas
- [ ] Responsive validado:
  - Móvil (320px - 640px)
  - Tablet (640px - 1024px)
  - Desktop (1024px+)
- [ ] Persistencia validada:
  - totalVolume se guarda correctamente
  - Sesión guardada contiene volumen total

### Test Cases

**Test 1: Cálculo básico**
- Completar 3 series de 10 reps × 50kg
- Verificar: 1,500 kg, 3 series, 30 reps

**Test 2: Múltiples ejercicios**
- Ejercicio 1: 3×10×50kg = 1,500kg
- Ejercicio 2: 4×12×30kg = 1,440kg
- Verificar: 2,940 kg, 7 series, 78 reps

**Test 3: Bodyweight (peso 0)**
- Completar 3 series de 15 reps × 0kg
- Verificar: 0 kg, 3 series, 45 reps

**Test 4: Edición de series**
- Completar serie: 10 reps × 50kg
- Editar a: 12 reps × 55kg
- Verificar: 660 kg actualizado

**Test 5: Restauración**
- Iniciar workout, completar 2 series
- Recargar página
- Verificar: estadísticas restauradas correctamente

### Files to test
- `app/workout/[id]/page.tsx`
- `app/workout/[id]/components/LiveStatsPanel.tsx`
- `app/workout/[id]/components/WorkoutSummary.tsx`

### Dependencies
- Tasks 1, 2, 3, 4 completadas

---

## Task 6: Documentación y cleanup
**Status:** completed ✅
**Priority:** low
**Estimated effort:** 20 minutes
**Actual effort:** 15 minutes

### Description
Documentar la nueva funcionalidad y limpiar código innecesario o comentarios de desarrollo.

### Acceptance Criteria
- [ ] Comentarios JSDoc agregados a funciones clave
- [ ] README o documentación actualizada (si existe)
- [ ] Console.logs de desarrollo eliminados
- [ ] Imports no utilizados eliminados
- [ ] Código formateado consistentemente

### Implementation Notes
- Agregar comentarios a cálculos de volumen
- Documentar props de LiveStatsPanel
- Actualizar CHANGELOG si existe

### Files to modify
- `app/workout/[id]/components/LiveStatsPanel.tsx`
- `app/workout/[id]/page.tsx`
- `app/workout/[id]/components/WorkoutSummary.tsx`
- `docs/` (si existe documentación)

### Dependencies
- Tasks 1-5 completadas

---

## Summary

**Total tasks:** 6
**Completed tasks:** 5 ✅
**Pending tasks:** 1 (Testing - ready for manual validation)
**Estimated total effort:** 3 horas
**Actual total effort:** 1.5 horas ⚡

**Critical path:**
1. ✅ Task 4 (Actualizar tipo) → 5 min
2. ✅ Task 1 (Integrar LiveStatsPanel) → 20 min
3. ✅ Task 2 (Mejorar WorkoutSummary) → 30 min
4. ✅ Task 3 (Persistir volumen) → 20 min
5. ⏳ Task 5 (Testing) → Pendiente validación manual
6. ✅ Task 6 (Documentación) → 15 min

**Status:** ✅ Implementación completada - Lista para testing manual

**Documentación:** Ver `docs/FASE_3_INDICADORES_RENDIMIENTO_IMPLEMENTADOS.md`
