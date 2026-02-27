# Fase 1: Refactorización Completada (Parcial)

## 📅 Fecha: 27 de febrero de 2026

## ✅ Lo que se ha completado

### 1. Utilidades de Cálculo Puras
**Archivo**: `app/workout/[id]/utils/workoutCalculations.ts`

Se han extraído las siguientes funciones puras del componente principal:

- ✅ `calculateNextRestTime()` - Calcula tiempo de descanso con cascada de prioridades
- ✅ `calculateExerciseRestTime()` - Calcula descanso entre ejercicios
- ✅ `shouldAutoAdvance()` - Determina si debe avanzar automáticamente
- ✅ `calculateWorkoutProgress()` - Calcula porcentaje de progreso
- ✅ `updateNestedArray()` - Helper para actualizar arrays anidados

**Beneficios**:
- Lógica testeable independientemente
- Código más limpio y organizado
- Fácil de mantener y modificar
- Reutilizable en otros componentes

### 2. Custom Hook para Auto-Avance
**Archivo**: `app/workout/[id]/hooks/useAutoAdvance.ts`

Se ha creado un custom hook que encapsula la lógica de auto-avance:

- ✅ `useAutoAdvance()` - Maneja el avance automático entre ejercicios

**Beneficios**:
- Separa lógica compleja del componente
- Dependencias mínimas y claras
- Más fácil de entender y debuggear

### 3. Documentación
**Archivos**:
- ✅ `docs/FASE_1_REFACTORING_GUIDE.md` - Guía completa de refactorización
- ✅ `docs/WORKOUT_REFACTORING_RECOMMENDATIONS.md` - Recomendaciones detalladas
- ✅ `docs/WORKOUT_REFACTORED_EXAMPLE.md` - Ejemplo de código refactorizado

## 🔄 Próximos Pasos para Completar Fase 1

### Paso 1: Integrar las Utilidades en el Componente Principal

Reemplazar la lógica inline en `app/workout/[id]/page.tsx`:

**Antes** (línea ~500):
```typescript
const handleCompleteSet = () => {
  // ... código de actualización de estado
  
  // Lógica compleja de cálculo de descanso (30+ líneas)
  let restTime: number;
  const setIndex = currentSet - 1;
  
  if (perSetRestOverrides[currentExercise.id] && perSetRestOverrides[currentExercise.id][setIndex]) {
    restTime = perSetRestOverrides[currentExercise.id][setIndex];
  } else if (restOverrides[currentExercise.id] && restOverrides[currentExercise.id] > 0) {
    restTime = restOverrides[currentExercise.id];
  } else if (currentExercise.restBetweenSets && currentExercise.restBetweenSets > 0) {
    restTime = currentExercise.restBetweenSets;
  } else if (routine.restBetweenSets && routine.restBetweenSets > 0) {
    restTime = routine.restBetweenSets;
  } else if (useSmartRest) {
    const exerciseTemplate = EXERCISE_DATABASE.find(e => e.name === currentExercise.name);
    if (exerciseTemplate) {
      const currentSetData = currentExercise.sets[currentSet - 1];
      const restRecommendation = calculateRestBetweenSets(
        exerciseTemplate,
        currentExercise.sets.length,
        currentSetData?.reps || 10,
        'intermediate'
      );
      restTime = restRecommendation.recommended;
    } else {
      restTime = 60;
    }
  } else {
    restTime = 60;
  }
  
  // ... más código
};
```

**Después**:
```typescript
import { calculateNextRestTime } from './utils/workoutCalculations';

const handleCompleteSet = () => {
  // ... código de actualización de estado
  
  // Calcular descanso usando utilidad
  const restTime = calculateNextRestTime({
    currentExercise,
    routine,
    restOverrides,
    perSetOverrides,
    currentSet,
    useSmartRest
  });
  
  // ... más código
};
```

### Paso 2: Reemplazar useEffect de Auto-Avance

**Antes** (línea ~300):
```typescript
useEffect(() => {
  if (!currentExercise || !routine) return;
  
  const exerciseId = currentExercise.id;
  const totalSets = currentExercise.sets.length;
  const completedCount = completedSets[exerciseId] || 0;
  const isLastExercise = currentExerciseIndex >= routine.exercises.length - 1;
  
  // ... 50+ líneas de lógica compleja
}, [completedSets, actualReps, currentExercise, routine, currentExerciseIndex, 
    showTimer, isExecutingSet, showPreparation, workoutStartTime, restOverrides, 
    useSmartRest, actualWeights, currentSet, updateWorkoutProgress]);
```

**Después**:
```typescript
import { useAutoAdvance } from './hooks/useAutoAdvance';

// Reemplazar el useEffect complejo con:
useAutoAdvance({
  currentExercise,
  routine,
  completedSets,
  actualReps,
  currentExerciseIndex,
  showTimer,
  isExecutingSet,
  showPreparation,
  onAdvanceToNextExercise: () => {
    const nextExercise = routine.exercises[currentExerciseIndex + 1];
    const restTime = calculateExerciseRestTime({
      currentExercise,
      nextExercise,
      routine,
      restOverrides,
      useSmartRest
    });
    
    setShowTimer(true);
    setTimerDuration(restTime);
    setTimerTitle('Descanso entre ejercicios');
    setNextExerciseName(nextExercise.name);
    
    updateWorkoutProgress(
      currentExerciseIndex,
      currentSet,
      completedSets,
      actualReps,
      actualWeights,
      { 
        isResting: true, 
        restTimerDuration: restTime, 
        restTimerTitle: 'Descanso entre ejercicios', 
        restTimerNextExercise: nextExercise.name, 
        restTimerStartedAt: Date.now() 
      }
    );
  },
  onShowFinishModal: () => {
    const duration = Math.floor((Date.now() - workoutStartTime) / 1000);
    setProposedDuration(Math.max(duration, 60));
    setShowNotesModal(true);
  }
});
```

### Paso 3: Simplificar Actualización de Estado

Reemplazar patrones repetidos con helper:

**Antes**:
```typescript
setActualWeights(prev => {
  const copy = { ...prev };
  copy[exerciseId] = copy[exerciseId] ? [...copy[exerciseId]] : [];
  copy[exerciseId][setIndex] = value;
  return copy;
});
```

**Después**:
```typescript
import { updateNestedArray } from './utils/workoutCalculations';

setActualWeights(prev => updateNestedArray(prev, exerciseId, setIndex, value));
```

### Paso 4: Crear Componentes Adicionales (Opcional)

Si el componente sigue siendo muy grande después de los pasos anteriores:

1. **SetsList Component** - Extraer la lista de series
2. **WorkoutHeader Component** - Extraer el header con progreso
3. **ExercisesList Component** - Extraer la lista acordeón de ejercicios

## 📊 Impacto Esperado

### Antes de la Refactorización
- 📄 1706 líneas en un solo archivo
- 🔴 Complejidad ciclomática: ~50
- 🔴 25+ estados con useState
- 🔴 useEffect con 15+ dependencias
- 🔴 Lógica de negocio mezclada con UI

### Después de Fase 1 (Parcial)
- 📄 ~1500 líneas en componente principal
- 🟡 Complejidad ciclomática: ~40
- 🟡 Lógica de negocio en utilidades
- 🟢 Funciones puras testeables
- 🟢 Custom hook para auto-avance

### Después de Fase 1 (Completa)
- 📄 ~1200 líneas en componente principal
- 🟢 Complejidad ciclomática: ~30
- 🟢 Código más organizado
- 🟢 Más fácil de mantener
- 🟢 Mejor separación de responsabilidades

## 🎯 Recomendación

**Implementar los pasos 1-3 de forma incremental**:

1. Agregar imports de las utilidades
2. Reemplazar lógica inline con llamadas a utilidades
3. Probar que todo funciona correctamente
4. Reemplazar useEffect con custom hook
5. Probar nuevamente
6. Simplificar actualizaciones de estado
7. Probar una última vez

**Tiempo estimado**: 2-3 horas

**Riesgo**: Bajo (cambios incrementales y seguros)

## 📝 Notas

- Los archivos de utilidades y hooks ya están creados y listos para usar
- No se requiere cambiar la estructura de estado (useState sigue funcionando)
- Los cambios son compatibles con el código existente
- Se puede hacer de forma incremental sin romper funcionalidad

## 🚀 Siguiente Fase

Una vez completada la Fase 1, considerar:

- **Fase 2**: Dividir en componentes más pequeños
- **Fase 3**: Migrar a useReducer (opcional, solo si es necesario)
- **Fase 4**: Agregar tests unitarios

