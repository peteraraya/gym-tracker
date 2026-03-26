# 📅 SEMANA 2: MARTES-VIERNES - PLAN DETALLADO

**Período**: Marzo 4-8, 2026  
**Duración**: 4 días  
**Esfuerzo**: 11 horas

---

## 🎯 OBJETIVO

Refactorizar `app/workout/[id]/page.tsx` para usar el hook y componentes creados el lunes.

---

## 📋 MARTES: REFACTORIZAR PAGE.TSX (PARTE 1)

**Tiempo estimado**: 3 horas

### Paso 1: Importar Hook y Componentes (30 min)

```typescript
// En app/workout/[id]/page.tsx

import { useWorkoutState } from './hooks/useWorkoutState';
import { ExerciseCard } from './components/ExerciseCard';
import { SetControls } from './components/SetControls';
import { WorkoutHeader } from './components/WorkoutHeader';
import { WorkoutSummary } from './components/WorkoutSummary';
```

### Paso 2: Reemplazar Lógica de Estado (1 hora)

**ANTES**:
```typescript
// 25+ estados individuales
const [completedSets, setCompletedSets] = useState<{[key: string]: number}>({});
const [actualReps, setActualReps] = useState<{[key: string]: number[]}>({});
const [actualWeights, setActualWeights] = useState<{[key: string]: number[]}>({});
const [setTypes, setSetTypes] = useState<{[key: string]: string[]}>({});
const [lastWeights, setLastWeights] = useState<{[key: string]: number[]}>({});
// ... 20+ más
```

**DESPUÉS**:
```typescript
// 1 hook que maneja todo
const workoutState = useWorkoutState(routine);

// Acceder a estados
const { workoutData, currentExerciseIndex, currentSet, currentReps, currentWeight } = workoutState;
```

### Paso 3: Reemplazar JSX de Ejercicio (1 hora)

**ANTES**:
```typescript
// 200+ líneas de JSX para mostrar ejercicio
<div className="...">
  <h2>{exercise.name}</h2>
  <div>Serie {currentSet} de {totalSets}</div>
  <input type="number" value={currentReps} onChange={...} />
  <WeightSelector value={currentWeight} onChange={...} />
  <button onClick={handleCompleteSet}>Completar</button>
  {/* ... más JSX */}
</div>
```

**DESPUÉS**:
```typescript
// Usar componente
<ExerciseCard
  exercise={currentExercise}
  exerciseIndex={currentExerciseIndex}
  currentSet={currentSet}
  completedSets={workoutState.workoutData.completedSets[currentExercise.id] || 0}
  currentReps={currentReps}
  currentWeight={currentWeight}
  onRepsChange={workoutState.setCurrentReps}
  onWeightChange={workoutState.setCurrentWeight}
  onCompleteSet={handleCompleteSet}
  onSkipExercise={handleSkipExercise}
  onShowInfo={() => setShowExerciseInfo(true)}
/>
```

### Paso 4: Reemplazar JSX de Header (30 min)

**ANTES**:
```typescript
// 100+ líneas de header
<div className="...">
  <h1>{routine.name}</h1>
  <div>Ejercicio {currentExerciseIndex + 1} de {totalExercises}</div>
  <div>Tiempo: {formattedTime}</div>
  {/* ... más JSX */}
</div>
```

**DESPUÉS**:
```typescript
// Usar componente
<WorkoutHeader
  routine={routine}
  currentExerciseIndex={currentExerciseIndex}
  totalExercises={routine.exercises.length}
  elapsedTime={elapsedTime}
  onCancel={handleCancelWorkout}
  onPause={handlePauseWorkout}
/>
```

### Paso 5: Crear Tests Básicos (30 min)

**Archivo**: `app/workout/[id]/__tests__/page.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WorkoutPage from '../page';

describe('WorkoutPage', () => {
  it('debe renderizar el header', () => {
    // Mock de rutina
    const mockRoutine = {
      id: 'routine-1',
      name: 'Push Day',
      exercises: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Renderizar
    render(<WorkoutPage />);

    // Verificar que renderiza
    expect(screen.getByText('Push Day')).toBeInTheDocument();
  });

  it('debe mostrar el ejercicio actual', () => {
    // Test
  });

  it('debe permitir completar una serie', () => {
    // Test
  });
});
```

---

## 📋 MIÉRCOLES: REFACTORIZAR PAGE.TSX (PARTE 2)

**Tiempo estimado**: 3 horas

### Paso 1: Integrar SetControls (1 hora)

```typescript
// Agregar después de ExerciseCard
<SetControls
  currentSet={currentSet}
  totalSets={currentExercise.sets.length}
  onSetChange={workoutState.setCurrentSet}
  onAddSet={() => {
    // Lógica para agregar serie
  }}
  onRemoveSet={() => {
    // Lógica para eliminar serie
  }}
/>
```

### Paso 2: Integrar WorkoutSummary (1 hora)

```typescript
// Mostrar cuando se completa el workout
{isWorkoutComplete ? (
  <WorkoutSummary
    routine={routine}
    completedSets={workoutState.workoutData.completedSets}
    actualReps={workoutState.workoutData.actualReps}
    actualWeights={workoutState.workoutData.actualWeights}
    totalDuration={elapsedTime}
    onFinish={handleFinishWorkout}
    onContinue={() => setIsWorkoutComplete(false)}
  />
) : (
  <>
    <WorkoutHeader {...} />
    <ExerciseCard {...} />
    <SetControls {...} />
    <Timer {...} />
  </>
)}
```

### Paso 3: Manejar Transiciones (1 hora)

```typescript
// Función para avanzar al siguiente ejercicio
const handleNextExercise = () => {
  if (currentExerciseIndex < routine.exercises.length - 1) {
    workoutState.setCurrentExerciseIndex(currentExerciseIndex + 1);
    workoutState.setCurrentSet(1);
    workoutState.setCurrentReps('');
    workoutState.setCurrentWeight('');
  } else {
    // Mostrar resumen
    setIsWorkoutComplete(true);
  }
};

// Función para completar serie
const handleCompleteSet = async () => {
  // Guardar datos
  workoutState.completeSet(
    currentExercise.id,
    currentReps as number,
    currentWeight as number
  );

  // Mostrar timer
  setShowTimer(true);
  setTimerDuration(90);

  // Limpiar inputs
  workoutState.setCurrentReps('');
  workoutState.setCurrentWeight('');
};
```

---

## 📋 JUEVES: OPTIMIZAR Y TESTING

**Tiempo estimado**: 3 horas

### Paso 1: Optimizar Re-renders (1 hora)

```typescript
// Usar useMemo para evitar re-renders innecesarios
const currentExercise = useMemo(() => {
  return routine?.exercises[currentExerciseIndex];
}, [routine, currentExerciseIndex]);

const exerciseData = useMemo(() => {
  return workoutState.getExerciseData(currentExercise?.id || '');
}, [currentExercise?.id, workoutState.workoutData]);

// Usar useCallback para funciones
const handleCompleteSet = useCallback(async () => {
  // Lógica
}, [currentExercise, currentReps, currentWeight]);
```

### Paso 2: Agregar useCallback (30 min)

```typescript
const handleNextExercise = useCallback(() => {
  // Lógica
}, [currentExerciseIndex, routine]);

const handleSkipExercise = useCallback(() => {
  // Lógica
}, [currentExerciseIndex, routine]);

const handleCancelWorkout = useCallback(async () => {
  // Lógica
}, []);
```

### Paso 3: Ejecutar Tests (1 hora)

```bash
# Ejecutar tests
npm run test -- app/workout/[id]/__tests__/page.test.tsx

# Verificar cobertura
npm run test:coverage -- app/workout/[id]

# Verificar build
npm run build
```

### Paso 4: Verificar Performance (30 min)

```bash
# Analizar bundle
npm run analyze

# Verificar con Lighthouse
# En Chrome DevTools: Lighthouse > Performance
```

---

## 📋 VIERNES: FINALIZAR Y PR

**Tiempo estimado**: 2 horas

### Paso 1: Documentar Cambios (30 min)

**Crear**: `docs/SEMANA_2_REFACTORING_COMPLETADO.md`

```markdown
# Refactoring de Workout Page - Completado

## Cambios Realizados

### Antes
- 1675 líneas en page.tsx
- 25+ estados
- 15+ useEffect
- Sin componentes reutilizables

### Después
- ~150 líneas en page.tsx
- 5 estados principales
- 3 useEffect
- 4 componentes reutilizables
- 1 hook centralizado

## Beneficios
- -91% líneas en page.tsx
- -80% estados
- -80% useEffect
- +4 componentes reutilizables

## Archivos Modificados
- app/workout/[id]/page.tsx
- app/workout/[id]/hooks/useWorkoutState.ts
- app/workout/[id]/components/ExerciseCard.tsx
- app/workout/[id]/components/SetControls.tsx
- app/workout/[id]/components/WorkoutHeader.tsx
- app/workout/[id]/components/WorkoutSummary.tsx
```

### Paso 2: Crear PR (1 hora)

```bash
# Crear rama
git checkout -b feat/refactor-workout-page

# Commit
git add .
git commit -m "feat: refactor workout page into components and hooks

- Create useWorkoutState hook to centralize state management
- Create ExerciseCard component for exercise display
- Create SetControls component for series navigation
- Create WorkoutHeader component for workout header
- Create WorkoutSummary component for workout summary
- Refactor page.tsx from 1675 to ~150 lines
- Add tests for components and hooks
- Improve performance with useMemo and useCallback

Closes #123"

# Push
git push origin feat/refactor-workout-page

# Crear PR en GitHub
# Título: "Refactor: Divide workout page into components and hooks"
# Descripción: Ver commit message
```

### Paso 3: Preparar para Semana 3 (30 min)

- [ ] Revisar feedback de PR
- [ ] Preparar optimizaciones adicionales
- [ ] Planificar tests de integración

---

## 📊 CHECKLIST MARTES-VIERNES

### Martes
- [ ] Importar hook y componentes
- [ ] Reemplazar lógica de estado
- [ ] Reemplazar JSX de ejercicio
- [ ] Reemplazar JSX de header
- [ ] Crear tests básicos

### Miércoles
- [ ] Integrar SetControls
- [ ] Integrar WorkoutSummary
- [ ] Manejar transiciones
- [ ] Agregar tests de integración

### Jueves
- [ ] Optimizar re-renders
- [ ] Agregar useCallback
- [ ] Ejecutar tests
- [ ] Verificar performance

### Viernes
- [ ] Documentar cambios
- [ ] Crear PR
- [ ] Preparar para Semana 3

---

## ⏱️ TIMELINE

| Día | Tarea | Duración |
|-----|-------|----------|
| Martes | Refactorizar (Parte 1) | 3 horas |
| Miércoles | Refactorizar (Parte 2) | 3 horas |
| Jueves | Optimizar y Testing | 3 horas |
| Viernes | Finalizar y PR | 2 horas |
| **Total** | | **11 horas** |

---

## 🎯 OBJETIVO FINAL

Al final de la semana:
- ✅ page.tsx reducido de 1675 a ~150 líneas
- ✅ 4 componentes reutilizables
- ✅ 1 hook centralizado
- ✅ Tests completos
- ✅ PR lista para revisión
- ✅ Performance mejorado

---

**Generado por**: Kiro  
**Fecha**: Marzo 3, 2026  
**Próxima revisión**: Marzo 4, 2026

