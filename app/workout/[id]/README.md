# Refactorización de Workout Page

## Resumen

La página de workout ha sido refactorizada de **~1295 líneas** a **~300 líneas** mediante la extracción de lógica en hooks personalizados y servicios dedicados.

## Estructura de la Refactorización

### Hooks Personalizados

#### 1. `useWorkoutTimer` (hooks/useWorkoutTimer.ts)
Gestiona todo el estado y lógica relacionada con el temporizador de descanso:
- Estado del timer (visible, minimizado, duración, tiempo restante)
- Funciones para iniciar, detener, minimizar y expandir el timer
- Countdown automático cuando está minimizado
- Callback de completado

**Beneficios:**
- Separa la lógica del timer del componente principal
- Facilita el testing del comportamiento del timer
- Reutilizable en otros contextos

#### 2. `useWeightPrediction` (hooks/useWeightPrediction.ts)
Maneja la predicción inteligente de pesos y sugerencias:
- Genera sugerencias de peso basadas en sesiones anteriores
- Predice el peso óptimo para cada serie
- Gestiona el estado de sugerencias descartadas
- Proporciona razonamiento de las predicciones

**Beneficios:**
- Centraliza toda la lógica de predicción de pesos
- Mejora la precisión de las sugerencias
- Facilita la adición de nuevos algoritmos de predicción

#### 3. `useSetExecution` (hooks/useSetExecution.ts)
Controla el flujo de ejecución de series:
- Gestiona estados de preparación y ejecución
- Controla el modal de ejecución
- Rastrea el tiempo de inicio de cada serie
- Proporciona funciones para iniciar, completar y cancelar series

**Beneficios:**
- Simplifica el flujo de ejecución de series
- Facilita la adición de nuevas funcionalidades de ejecución
- Mejora la testabilidad del flujo de trabajo

#### 4. `useWorkoutCompletion` (hooks/useWorkoutCompletion.ts)
Maneja la finalización del entrenamiento:
- Gestiona el modal de notas y duración
- Calcula el volumen total del entrenamiento
- Guarda la sesión en la base de datos
- Detecta y muestra logros desbloqueados
- Navega a la página de sesiones

**Beneficios:**
- Separa la lógica de finalización del componente principal
- Facilita la adición de nuevas métricas
- Mejora el manejo de errores en el guardado

### Servicios

#### `restCalculationService` (services/restCalculationService.ts)
Servicio dedicado para cálculos de tiempo de descanso:
- `calculateNextRestTime`: Calcula descanso para la siguiente serie
- `calculateExerciseRestTime`: Calcula descanso entre ejercicios
- `calculateSmartRestTime`: Calcula descanso inteligente basado en características del ejercicio
- `applySmartRestToAllSets`: Aplica descanso inteligente a todas las series

**Beneficios:**
- Centraliza toda la lógica de cálculo de descansos
- Facilita el ajuste de algoritmos de descanso
- Mejora la testabilidad de los cálculos
- Permite reutilización en otros contextos

## Mejoras de Rendimiento

1. **Reducción de re-renders**: Al separar la lógica en hooks, se reducen los re-renders innecesarios
2. **Mejor organización del código**: Más fácil de mantener y debuggear
3. **Testabilidad mejorada**: Cada hook y servicio puede ser testeado de forma independiente
4. **Reutilización**: Los hooks pueden ser reutilizados en otros componentes

## Estructura del Componente Principal

El componente `WorkoutPage` ahora se enfoca en:
- Inicialización del workout
- Coordinación entre hooks
- Renderizado de la UI
- Manejo de eventos de usuario

## Migración

No se requieren cambios en otros componentes. La refactorización es completamente interna y mantiene la misma API externa.

## Testing

Cada hook y servicio puede ser testeado de forma independiente:

```typescript
// Ejemplo de test para useWorkoutTimer
import { renderHook, act } from '@testing-library/react';
import { useWorkoutTimer } from './useWorkoutTimer';

test('should start timer with correct duration', () => {
  const { result } = renderHook(() => useWorkoutTimer(() => {}));
  
  act(() => {
    result.current.startTimer(90, 'Descanso');
  });
  
  expect(result.current.showTimer).toBe(true);
  expect(result.current.timerDuration).toBe(90);
});
```

## Próximos Pasos

1. Agregar tests unitarios para cada hook
2. Considerar extraer más lógica de negocio a servicios
3. Optimizar re-renders con `useMemo` y `useCallback` adicionales
4. Documentar cada función con JSDoc
