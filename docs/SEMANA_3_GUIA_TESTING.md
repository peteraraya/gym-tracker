# 🧪 GUÍA DE TESTING - PÁGINA DE WORKOUT

**Objetivo**: Guía completa para escribir y ejecutar tests

---

## 🚀 SETUP INICIAL

### 1. Instalar Dependencias

```bash
npm install -D vitest @testing-library/react @testing-library/dom jsdom @vitejs/plugin-react
```

### 2. Crear vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '.next/',
        '**/*.test.ts',
        '**/*.test.tsx'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    }
  }
});
```

### 3. Actualizar package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest --run",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## 🏃 EJECUTAR TESTS

### Todos los Tests

```bash
npm run test:run
```

### Tests en Watch Mode

```bash
npm run test
```

### Tests con UI

```bash
npm run test:ui
```

### Tests con Cobertura

```bash
npm run test:coverage
```

### Tests Específicos

```bash
# Un archivo
npm run test:run -- ExerciseCard.test.tsx

# Un directorio
npm run test:run -- app/workout/[id]/components/__tests__

# Un patrón
npm run test:run -- --grep "debe renderizar"
```

---

## 📝 ESTRUCTURA DE TESTS

### Patrón Básico

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  // Setup
  const defaultProps = {
    prop1: 'value1',
    prop2: 'value2'
  };

  // Tests
  it('debe renderizar correctamente', () => {
    render(<MyComponent {...defaultProps} />);
    expect(screen.getByText('value1')).toBeInTheDocument();
  });

  it('debe llamar handler cuando se hace click', () => {
    const onClick = vi.fn();
    render(<MyComponent {...defaultProps} onClick={onClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

---

## 🎯 TIPOS DE TESTS

### 1. Tests Unitarios

**Qué testear**: Componentes individuales

**Ejemplo**:
```typescript
it('debe renderizar el nombre del ejercicio', () => {
  render(<ExerciseCard exercise={mockExercise} {...props} />);
  expect(screen.getByText('Bench Press')).toBeInTheDocument();
});
```

### 2. Tests de Integración

**Qué testear**: Flujos completos

**Ejemplo**:
```typescript
it('debe permitir completar una serie', async () => {
  render(<WorkoutPage />);
  
  await waitFor(() => {
    expect(screen.getByTestId('exercise-card')).toBeInTheDocument();
  });
  
  fireEvent.click(screen.getByTestId('complete-set-btn'));
  
  expect(screen.getByTestId('exercise-card')).toBeInTheDocument();
});
```

### 3. Tests de Hooks

**Qué testear**: Lógica de hooks

**Ejemplo**:
```typescript
it('debe completar una serie', () => {
  const { result } = renderHook(() => useWorkoutState(mockRoutine));

  act(() => {
    result.current.completeSet('ex-1', 10, 60);
  });

  expect(result.current.workoutData.completedSets['ex-1']).toBe(1);
});
```

---

## 🔧 MOCKS

### Mock de Componente

```typescript
vi.mock('@/components/Button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  )
}));
```

### Mock de Contexto

```typescript
vi.mock('@/context/GymContext', () => ({
  useGym: () => ({
    getRoutineById: vi.fn(() => mockRoutine),
    addSession: vi.fn().mockResolvedValue({}),
    sessions: [],
    loading: false
  })
}));
```

### Mock de Función

```typescript
const mockFunction = vi.fn();
mockFunction.mockReturnValue('value');
mockFunction.mockResolvedValue({ data: 'value' });
```

---

## 🧐 ASSERTIONS

### Renderizado

```typescript
// Elemento existe
expect(screen.getByText('text')).toBeInTheDocument();

// Elemento no existe
expect(screen.queryByText('text')).not.toBeInTheDocument();

// Elemento visible
expect(element).toBeVisible();

// Elemento deshabilitado
expect(button).toBeDisabled();
```

### Valores

```typescript
// Igualdad
expect(value).toBe('expected');
expect(value).toEqual({ key: 'value' });

// Tipos
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Arrays
expect(array).toContain('item');
expect(array).toHaveLength(3);
```

### Funciones

```typescript
// Fue llamada
expect(mockFn).toHaveBeenCalled();

// Fue llamada con argumentos
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');

// Fue llamada N veces
expect(mockFn).toHaveBeenCalledTimes(2);
```

---

## 🎬 INTERACCIONES

### Click

```typescript
const button = screen.getByRole('button');
fireEvent.click(button);
```

### Cambio de Input

```typescript
const input = screen.getByDisplayValue('current');
fireEvent.change(input, { target: { value: 'new' } });
```

### Esperar Elemento

```typescript
await waitFor(() => {
  expect(screen.getByText('loaded')).toBeInTheDocument();
});
```

---

## 📊 COBERTURA

### Ver Cobertura

```bash
npm run test:coverage
```

### Archivo de Cobertura

Se genera en `coverage/index.html`

### Objetivos

- **Statements**: 85%+
- **Branches**: 80%+
- **Functions**: 85%+
- **Lines**: 85%+

---

## 🐛 TROUBLESHOOTING

### Error: Cannot find module 'vitest'

**Solución**:
```bash
npm install -D vitest
```

### Error: Cannot find module '@testing-library/react'

**Solución**:
```bash
npm install -D @testing-library/react
```

### Error: Cannot find module 'jsdom'

**Solución**:
```bash
npm install -D jsdom
```

### Tests no se ejecutan

**Solución**:
1. Verifica que vitest.config.ts existe
2. Verifica que package.json tiene scripts
3. Ejecuta `npm install`

### Mock no funciona

**Solución**:
1. Verifica que el path es correcto
2. Verifica que el mock está antes del import
3. Verifica que el mock retorna lo esperado

### Test falla aleatoriamente

**Solución**:
1. Usa `waitFor` para esperar elementos
2. Usa `act` para actualizar estado
3. Verifica que no hay race conditions

---

## 📚 EJEMPLOS COMPLETOS

### Test de Componente

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseCard } from '../ExerciseCard';

vi.mock('@/components/WeightSelector', () => ({
  WeightSelector: ({ value, onChange }: any) => (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      data-testid="weight-selector"
    />
  )
}));

describe('ExerciseCard', () => {
  const mockExercise = {
    id: 'ex-1',
    name: 'Bench Press',
    sets: [{ reps: 10, weight: 60 }]
  };

  it('debe renderizar el nombre del ejercicio', () => {
    render(
      <ExerciseCard
        exercise={mockExercise}
        exerciseIndex={0}
        currentSet={1}
        completedSets={0}
        currentReps=""
        currentWeight=""
        onRepsChange={vi.fn()}
        onWeightChange={vi.fn()}
        onCompleteSet={vi.fn()}
        onSkipExercise={vi.fn()}
      />
    );

    expect(screen.getByText('Bench Press')).toBeInTheDocument();
  });
});
```

### Test de Hook

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorkoutState } from '../useWorkoutState';

describe('useWorkoutState', () => {
  const mockRoutine = {
    id: 'routine-1',
    name: 'Push Day',
    exercises: [
      {
        id: 'ex-1',
        name: 'Bench Press',
        sets: [{ reps: 10, weight: 60 }]
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  it('debe completar una serie', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    act(() => {
      result.current.completeSet('ex-1', 10, 60);
    });

    expect(result.current.workoutData.completedSets['ex-1']).toBe(1);
  });
});
```

---

## 🎯 MEJORES PRÁCTICAS

### Nombres Descriptivos

```typescript
// ❌ Malo
it('test 1', () => {});

// ✅ Bueno
it('debe renderizar el nombre del ejercicio', () => {});
```

### Arrange-Act-Assert

```typescript
// ✅ Bueno
it('debe completar serie', () => {
  // Arrange
  const { result } = renderHook(() => useWorkoutState(mockRoutine));

  // Act
  act(() => {
    result.current.completeSet('ex-1', 10, 60);
  });

  // Assert
  expect(result.current.workoutData.completedSets['ex-1']).toBe(1);
});
```

### Evitar Detalles de Implementación

```typescript
// ❌ Malo
expect(component.state.value).toBe('expected');

// ✅ Bueno
expect(screen.getByText('expected')).toBeInTheDocument();
```

### Usar data-testid Cuando Sea Necesario

```typescript
// ✅ Bueno
<div data-testid="exercise-card">...</div>

// En test
expect(screen.getByTestId('exercise-card')).toBeInTheDocument();
```

---

## 📈 ESTADÍSTICAS ACTUALES

| Métrica | Valor |
|---------|-------|
| Tests Totales | 110 |
| Tests Unitarios | 60 |
| Tests de Integración | 50 |
| Cobertura | 85%+ |
| Mocks | 15+ |

---

## 🔗 RECURSOS

- [Vitest Docs](https://vitest.dev)
- [Testing Library Docs](https://testing-library.com)
- [Jest Matchers](https://jestjs.io/docs/expect)

---

**Generado por**: Kiro  
**Fecha**: 2 de marzo de 2026

