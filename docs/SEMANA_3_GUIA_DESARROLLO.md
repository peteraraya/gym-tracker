# 👨‍💻 GUÍA DE DESARROLLO - PÁGINA DE WORKOUT

**Objetivo**: Guía para desarrolladores que quieren modificar o extender la página de workout

---

## 📁 ESTRUCTURA DEL PROYECTO

```
app/workout/[id]/
├── page.tsx                          # Página principal
├── utils/
│   └── workoutCalculations.ts        # Funciones de cálculo
├── hooks/
│   ├── useWorkoutState.ts            # Estado del workout
│   ├── useWorkoutInitialization.ts   # Inicialización
│   └── useWorkoutSuggestions.ts      # Sugerencias
├── components/
│   ├── WorkoutHeader.tsx             # Header
│   ├── ExerciseCard.tsx              # Tarjeta de ejercicio
│   ├── SetControls.tsx               # Controles de serie
│   ├── SeriesTable.tsx               # Tabla de series
│   ├── ExerciseList.tsx              # Lista de ejercicios
│   ├── WorkoutSummary.tsx            # Resumen
│   └── __tests__/                    # Tests
│       ├── ExerciseCard.test.tsx
│       ├── SetControls.test.tsx
│       └── SeriesTable.test.tsx
└── __tests__/
    └── page.integration.test.tsx     # Tests de integración
```

---

## 🔧 COMPONENTES PRINCIPALES

### 1. WorkoutPage (page.tsx)

**Responsabilidades**:
- Orquestar todo el flujo
- Manejar estado global
- Coordinar componentes

**Props**: Ninguno (usa contextos)

**Estado**:
```typescript
const [showTimer, setShowTimer] = useState(false);
const [timerDuration, setTimerDuration] = useState(0);
const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
// ... más estado
```

**Handlers principales**:
- `handleStartSet()`: Inicia countdown
- `handleCompleteSet()`: Completa serie
- `handleTimerComplete()`: Cuando termina descanso
- `handleMoveExercise()`: Reordena ejercicios

---

### 2. ExerciseCard

**Responsabilidades**:
- Mostrar ejercicio actual
- Inputs de reps y peso
- Botones de acción

**Props**:
```typescript
interface ExerciseCardProps {
  exercise: Exercise;
  exerciseIndex: number;
  currentSet: number;
  completedSets: number;
  currentReps: number | '';
  currentWeight: number | '';
  onRepsChange: (reps: number | '') => void;
  onWeightChange: (weight: number) => void;
  onCompleteSet: () => void;
  onSkipExercise: () => void;
  onShowInfo?: () => void;
  isSetStarted?: boolean;
}
```

**Cómo modificar**:
1. Cambiar layout: Edita el JSX
2. Agregar campo: Agrega prop y input
3. Cambiar validación: Edita `isSetComplete`

---

### 3. SetControls

**Responsabilidades**:
- Navegar entre series
- Agregar/eliminar series

**Props**:
```typescript
interface SetControlsProps {
  currentSet: number;
  totalSets: number;
  onSetChange: (set: number) => void;
  onAddSet?: () => void;
  onRemoveSet?: () => void;
  disabled?: boolean;
}
```

**Cómo modificar**:
1. Cambiar botones: Edita el JSX
2. Agregar funcionalidad: Agrega prop y handler

---

### 4. SeriesTable

**Responsabilidades**:
- Mostrar todas las series
- Edición inline
- Descanso inteligente

**Props**:
```typescript
interface SeriesTableProps {
  exercise: Exercise;
  exerciseId: string;
  completedSets: number;
  actualReps: number[];
  actualWeights: number[];
  setTypes: string[];
  currentSet: number;
  onEditReps: (setIndex: number, reps: number) => void;
  onEditWeight: (setIndex: number, weight: number) => void;
  onEditSetType: (setIndex: number, type: SetType) => void;
  onToggleSetComplete: (setIndex: number, isComplete: boolean) => void;
  onAddSet: () => void;
  perSetRestOverrides?: {[key: string]: number[]};
  onEditRestTime?: (setIndex: number, restTime: number) => void;
  onApplySmartRest?: () => void;
  smartRestTime?: number;
}
```

---

## 🪝 HOOKS PERSONALIZADOS

### useWorkoutState

**Qué hace**: Centraliza todo el estado del workout

**Cómo usar**:
```typescript
const workoutState = useWorkoutState(routine);

// Acceder a estado
console.log(workoutState.currentSet);
console.log(workoutState.workoutData.completedSets);

// Actualizar estado
workoutState.setCurrentSet(2);
workoutState.completeSet('ex-1', 10, 60);
```

**Métodos principales**:
- `setCurrentReps(reps)`: Actualiza reps
- `setCurrentWeight(weight)`: Actualiza peso
- `completeSet(exerciseId, reps, weight)`: Completa serie
- `updateActualReps(exerciseId, reps)`: Actualiza reps reales
- `updateActualWeights(exerciseId, weights)`: Actualiza pesos reales
- `updateSetType(exerciseId, setIndex, type)`: Cambia tipo de serie
- `updatePerSetRestOverride(exerciseId, setIndex, duration)`: Descanso por serie
- `reset()`: Resetea todo

---

### useWorkoutInitialization

**Qué hace**: Inicializa el workout

**Cómo usar**:
```typescript
useWorkoutInitialization(routine, workoutState);
```

---

### useWorkoutSuggestions

**Qué hace**: Genera sugerencias durante el workout

**Cómo usar**:
```typescript
const suggestions = useWorkoutSuggestions(currentExercise, lastSession);
```

---

## 📚 UTILIDADES

### calculateRestBetweenSets

**Qué hace**: Calcula descanso inteligente

**Cómo usar**:
```typescript
import { calculateRestBetweenSets } from '@/lib/restCalculator';

const recommendation = calculateRestBetweenSets(
  exercise,
  sets,
  reps,
  'intermediate'
);

console.log(recommendation.recommended); // 90 segundos
```

---

### calculateNextRestTime

**Qué hace**: Calcula descanso entre series

**Cómo usar**:
```typescript
import { calculateNextRestTime } from './utils/workoutCalculations';

const restTime = calculateNextRestTime({
  currentExercise,
  routine,
  restOverrides,
  perSetOverrides,
  currentSet,
  useSmartRest
});
```

---

## 🔄 FLUJO DE DATOS

```
page.tsx (Estado Global)
    ↓
    ├─→ WorkoutHeader (Lee estado)
    ├─→ ExerciseCard (Lee/Escribe estado)
    ├─→ SetControls (Lee/Escribe estado)
    ├─→ SeriesTable (Lee/Escribe estado)
    └─→ ExerciseList (Lee/Escribe estado)
```

---

## 🚀 CÓMO AGREGAR FUNCIONALIDADES

### Agregar Nuevo Campo a Ejercicio

1. **Actualizar tipo**:
```typescript
// types/index.ts
interface Exercise {
  // ... campos existentes
  newField?: string;
}
```

2. **Actualizar hook**:
```typescript
// useWorkoutState.ts
const [newFieldData, setNewFieldData] = useState({});

const updateNewField = useCallback((exerciseId: string, value: string) => {
  setNewFieldData(prev => ({
    ...prev,
    [exerciseId]: value
  }));
}, []);
```

3. **Actualizar componente**:
```typescript
// ExerciseCard.tsx
<input
  value={newField}
  onChange={(e) => onNewFieldChange(e.target.value)}
/>
```

4. **Actualizar página**:
```typescript
// page.tsx
<ExerciseCard
  // ... props existentes
  newField={workoutState.newFieldData[currentExercise.id]}
  onNewFieldChange={(value) => workoutState.updateNewField(currentExercise.id, value)}
/>
```

---

### Agregar Nuevo Handler

1. **Crear handler**:
```typescript
const handleNewAction = useCallback(() => {
  // Lógica aquí
}, [dependencies]);
```

2. **Pasar a componente**:
```typescript
<Component onNewAction={handleNewAction} />
```

3. **Usar en componente**:
```typescript
<button onClick={onNewAction}>Acción</button>
```

---

### Agregar Nuevo Componente

1. **Crear archivo**:
```typescript
// components/NewComponent.tsx
export function NewComponent({ prop1, prop2 }: Props) {
  return <div>{prop1}</div>;
}
```

2. **Importar en página**:
```typescript
import { NewComponent } from './components/NewComponent';
```

3. **Usar en página**:
```typescript
<NewComponent prop1={value1} prop2={value2} />
```

---

## 🧪 CÓMO ESCRIBIR TESTS

### Test Unitario

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('debe renderizar correctamente', () => {
    render(<MyComponent prop1="value" />);
    expect(screen.getByText('value')).toBeInTheDocument();
  });

  it('debe llamar handler cuando se hace click', () => {
    const onClick = vi.fn();
    render(<MyComponent onClick={onClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Test de Hook

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '../useMyHook';

describe('useMyHook', () => {
  it('debe inicializar correctamente', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe('initial');
  });

  it('debe actualizar valor', () => {
    const { result } = renderHook(() => useMyHook());
    
    act(() => {
      result.current.setValue('new');
    });
    
    expect(result.current.value).toBe('new');
  });
});
```

---

## 🎯 MEJORES PRÁCTICAS

### Performance
- ✅ Usar useMemo para valores computados
- ✅ Usar useCallback para handlers
- ✅ Usar React.memo para componentes
- ✅ Evitar re-renders innecesarios

### Código
- ✅ Nombres descriptivos
- ✅ Funciones pequeñas
- ✅ Comentarios útiles
- ✅ Manejo de errores

### Testing
- ✅ Tests unitarios para componentes
- ✅ Tests de integración para flujos
- ✅ Cobertura de casos límite
- ✅ Mocks de dependencias

### Documentación
- ✅ Comentarios en código
- ✅ Documentación de funciones
- ✅ Ejemplos de uso
- ✅ Guías de desarrollo

---

## 🔍 DEBUGGING

### Logs Útiles
```typescript
console.log('currentExercise:', currentExercise);
console.log('workoutData:', workoutState.workoutData);
console.log('handlers:', { handleCompleteSet, handleTimerComplete });
```

### React DevTools
1. Instala React DevTools
2. Abre DevTools
3. Ve a la pestaña "Components"
4. Inspecciona componentes y props

### Vitest
```bash
npm run test -- --ui
```

---

## 📚 RECURSOS

- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org)
- [Vitest Docs](https://vitest.dev)
- [Testing Library Docs](https://testing-library.com)

---

**Generado por**: Kiro  
**Fecha**: 2 de marzo de 2026

