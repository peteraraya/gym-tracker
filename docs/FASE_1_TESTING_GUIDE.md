# Guía de Testing - Fase 1 Refactorización

## 🧪 Testing de la Refactorización

Esta guía describe cómo testear las mejoras implementadas en la Fase 1.

---

## ✅ Verificación Rápida

### 1. Compilación
```bash
npm run build
```
**Esperado**: ✅ Sin errores de TypeScript

### 2. Linting
```bash
npm run lint
```
**Esperado**: ✅ Sin errores de linting

### 3. Tests Existentes
```bash
npm test
```
**Esperado**: ✅ Todos los tests pasan

---

## 🔍 Testing Manual

### Flujo Completo de Workout

1. **Iniciar Workout**
   - ✅ Navegar a una rutina
   - ✅ Iniciar entrenamiento
   - ✅ Verificar que carga correctamente

2. **Completar Series**
   - ✅ Iniciar serie con countdown
   - ✅ Completar serie
   - ✅ Verificar que el descanso se calcula correctamente
   - ✅ Verificar que el timer aparece

3. **Auto-Avance**
   - ✅ Completar todas las series de un ejercicio
   - ✅ Verificar que avanza automáticamente al siguiente
   - ✅ Verificar que el descanso entre ejercicios es correcto

4. **Edición de Series**
   - ✅ Editar peso de una serie
   - ✅ Editar reps de una serie
   - ✅ Editar tipo de serie
   - ✅ Verificar que se guarda correctamente

5. **Descanso Personalizado**
   - ✅ Cambiar tiempo de descanso por serie
   - ✅ Verificar que se aplica correctamente
   - ✅ Verificar cascada de prioridades

6. **Finalizar Workout**
   - ✅ Completar último ejercicio
   - ✅ Verificar que muestra modal de finalización
   - ✅ Guardar sesión
   - ✅ Verificar que se guarda en historial

---

## 🧪 Tests Unitarios (Recomendados)

### Tests para Utilidades

**Archivo**: `app/workout/[id]/utils/workoutCalculations.test.ts`

```typescript
import { 
  calculateNextRestTime, 
  calculateExerciseRestTime,
  shouldAutoAdvance,
  calculateWorkoutProgress,
  updateNestedArray 
} from './workoutCalculations';

describe('calculateNextRestTime', () => {
  it('debe usar override de serie si existe', () => {
    const result = calculateNextRestTime({
      currentExercise: mockExercise,
      routine: mockRoutine,
      restOverrides: {},
      perSetOverrides: { 'ex1': [90] },
      currentSet: 1,
      useSmartRest: true
    });
    expect(result).toBe(90);
  });

  it('debe usar override de ejercicio si no hay override de serie', () => {
    const result = calculateNextRestTime({
      currentExercise: mockExercise,
      routine: mockRoutine,
      restOverrides: { 'ex1': 120 },
      perSetOverrides: {},
      currentSet: 1,
      useSmartRest: true
    });
    expect(result).toBe(120);
  });

  it('debe usar descanso configurado en ejercicio', () => {
    const exercise = { ...mockExercise, restBetweenSets: 60 };
    const result = calculateNextRestTime({
      currentExercise: exercise,
      routine: mockRoutine,
      restOverrides: {},
      perSetOverrides: {},
      currentSet: 1,
      useSmartRest: false
    });
    expect(result).toBe(60);
  });

  it('debe usar default de 60 segundos si no hay configuración', () => {
    const result = calculateNextRestTime({
      currentExercise: mockExercise,
      routine: mockRoutine,
      restOverrides: {},
      perSetOverrides: {},
      currentSet: 1,
      useSmartRest: false
    });
    expect(result).toBe(60);
  });
});

describe('shouldAutoAdvance', () => {
  it('debe retornar true cuando todas las series están completadas', () => {
    const result = shouldAutoAdvance({
      completedSets: { 'ex1': 3 },
      actualReps: { 'ex1': [10, 10, 10] },
      currentExercise: { ...mockExercise, sets: [{}, {}, {}] },
      routine: mockRoutine,
      currentExerciseIndex: 0,
      showTimer: false,
      isExecutingSet: false,
      showPreparation: false
    });
    expect(result).toBe(true);
  });

  it('debe retornar false si hay timer activo', () => {
    const result = shouldAutoAdvance({
      completedSets: { 'ex1': 3 },
      actualReps: { 'ex1': [10, 10, 10] },
      currentExercise: { ...mockExercise, sets: [{}, {}, {}] },
      routine: mockRoutine,
      currentExerciseIndex: 0,
      showTimer: true,
      isExecutingSet: false,
      showPreparation: false
    });
    expect(result).toBe(false);
  });

  it('debe retornar false si está ejecutando una serie', () => {
    const result = shouldAutoAdvance({
      completedSets: { 'ex1': 3 },
      actualReps: { 'ex1': [10, 10, 10] },
      currentExercise: { ...mockExercise, sets: [{}, {}, {}] },
      routine: mockRoutine,
      currentExerciseIndex: 0,
      showTimer: false,
      isExecutingSet: true,
      showPreparation: false
    });
    expect(result).toBe(false);
  });
});

describe('updateNestedArray', () => {
  it('debe actualizar valor en array existente', () => {
    const state = { 'ex1': [10, 20, 30] };
    const result = updateNestedArray(state, 'ex1', 1, 25);
    expect(result).toEqual({ 'ex1': [10, 25, 30] });
  });

  it('debe crear array si no existe', () => {
    const state = {};
    const result = updateNestedArray(state, 'ex1', 0, 10);
    expect(result).toEqual({ 'ex1': [10] });
  });
});

describe('calculateWorkoutProgress', () => {
  it('debe calcular progreso correctamente', () => {
    const routine = {
      exercises: [
        { sets: [{}, {}, {}] },
        { sets: [{}, {}] },
        { sets: [{}] }
      ]
    };
    const result = calculateWorkoutProgress({
      routine,
      currentExerciseIndex: 1,
      currentSet: 2
    });
    // 3 sets del primer ejercicio + 1 set del segundo = 4 de 6 total
    expect(result).toBe((4 / 6) * 100);
  });
});
```

### Tests para Custom Hook

**Archivo**: `app/workout/[id]/hooks/useAutoAdvance.test.ts`

```typescript
import { renderHook } from '@testing-library/react';
import { useAutoAdvance } from './useAutoAdvance';

describe('useAutoAdvance', () => {
  it('debe llamar onAdvanceToNextExercise cuando se completan todas las series', () => {
    const onAdvance = jest.fn();
    const onFinish = jest.fn();
    
    renderHook(() => useAutoAdvance({
      currentExercise: mockExercise,
      routine: mockRoutine,
      completedSets: { 'ex1': 3 },
      actualReps: { 'ex1': [10, 10, 10] },
      currentExerciseIndex: 0,
      showTimer: false,
      isExecutingSet: false,
      showPreparation: false,
      onAdvanceToNextExercise: onAdvance,
      onShowFinishModal: onFinish
    }));
    
    expect(onAdvance).toHaveBeenCalled();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('debe llamar onShowFinishModal en el último ejercicio', () => {
    const onAdvance = jest.fn();
    const onFinish = jest.fn();
    
    renderHook(() => useAutoAdvance({
      currentExercise: mockExercise,
      routine: { exercises: [mockExercise] },
      completedSets: { 'ex1': 3 },
      actualReps: { 'ex1': [10, 10, 10] },
      currentExerciseIndex: 0,
      showTimer: false,
      isExecutingSet: false,
      showPreparation: false,
      onAdvanceToNextExercise: onAdvance,
      onShowFinishModal: onFinish
    }));
    
    expect(onFinish).toHaveBeenCalled();
    expect(onAdvance).not.toHaveBeenCalled();
  });
});
```

---

## 🎯 Casos de Prueba Críticos

### 1. Cascada de Prioridades de Descanso

**Escenario**: Verificar que la cascada de prioridades funciona correctamente

**Pasos**:
1. Configurar descanso en rutina: 60s
2. Configurar descanso en ejercicio: 90s
3. Configurar override de ejercicio: 120s
4. Configurar override de serie: 150s
5. Completar serie

**Esperado**: Debe usar 150s (override de serie tiene máxima prioridad)

### 2. Auto-Avance con Edición de Ejercicio Anterior

**Escenario**: Verificar que no avanza automáticamente si estás editando un ejercicio anterior

**Pasos**:
1. Completar ejercicio 1
2. Completar ejercicio 2
3. Volver a ejercicio 1
4. Completar todas las series nuevamente

**Esperado**: No debe avanzar automáticamente (estás editando ejercicio anterior)

### 3. Descanso Inteligente

**Escenario**: Verificar que el descanso inteligente funciona

**Pasos**:
1. Activar descanso inteligente
2. Hacer ejercicio de pecho (ej: Press de Banca)
3. Completar serie

**Esperado**: Debe calcular descanso basado en grupo muscular y reps

### 4. Actualización de Estado

**Escenario**: Verificar que las actualizaciones de estado funcionan correctamente

**Pasos**:
1. Editar peso de serie 1: 50kg
2. Editar peso de serie 2: 55kg
3. Editar peso de serie 1: 52kg

**Esperado**: 
- Serie 1: 52kg (actualizado)
- Serie 2: 55kg (sin cambios)

---

## 📊 Checklist de Testing

### Funcionalidad Básica
- [ ] Iniciar workout
- [ ] Completar serie
- [ ] Timer de descanso aparece
- [ ] Auto-avance funciona
- [ ] Finalizar workout

### Edición
- [ ] Editar peso
- [ ] Editar reps
- [ ] Editar tipo de serie
- [ ] Editar descanso

### Casos Edge
- [ ] Completar todas las series sin datos
- [ ] Editar ejercicio anterior
- [ ] Cancelar workout
- [ ] Recargar página durante workout

### Descanso
- [ ] Override de serie
- [ ] Override de ejercicio
- [ ] Descanso configurado
- [ ] Descanso inteligente
- [ ] Default (60s)

### Performance
- [ ] No hay re-renders innecesarios
- [ ] Cálculos son rápidos
- [ ] UI responde inmediatamente

---

## 🐛 Bugs Conocidos

Ninguno reportado después de la refactorización.

---

## 📝 Notas

- Todos los tests deben pasar antes de hacer deploy
- Verificar manualmente los flujos críticos
- Monitorear errores en producción
- Agregar tests unitarios cuando sea posible

---

## ✅ Resultado Esperado

Después de ejecutar todos los tests:

- ✅ 0 errores de compilación
- ✅ 0 errores de linting
- ✅ 100% funcionalidad preservada
- ✅ Todos los flujos funcionan correctamente
- ✅ No hay regresiones

