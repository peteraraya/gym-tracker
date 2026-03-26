# Feature: Advertencia de Tiempo de Descanso Bajo Mínimo

## Descripción
Sistema de advertencia visual que alerta al usuario cuando selecciona un tiempo de descanso por debajo del mínimo recomendado para un ejercicio.

## Funcionalidad

### Cálculo del Mínimo Recomendado
- Se basa en el tiempo de descanso inteligente calculado para el ejercicio
- El mínimo es el 80% del tiempo recomendado por el sistema inteligente
- Ejemplo: Si el descanso inteligente recomienda 120s, el mínimo es 96s

### Indicadores Visuales

#### 1. Selector con Fondo de Advertencia
Cuando el tiempo seleccionado está por debajo del mínimo:
- Fondo naranja claro (light mode) / naranja oscuro (dark mode)
- Borde naranja para mayor visibilidad

#### 2. Icono de Advertencia en Opciones
- Las opciones del selector que están por debajo del mínimo muestran "⚠️" antes del tiempo
- Ejemplo: "⚠️ 1m 25s"

#### 3. Mensaje de Advertencia
- Texto pequeño debajo del selector: "⚠️ Bajo mínimo recomendado" (mobile)
- Texto compacto: "⚠️ Bajo mínimo" (desktop)
- Color naranja para consistencia visual

## Implementación

### Funciones Agregadas en SeriesTable

```typescript
// Obtiene el mínimo recomendado (80% del smart rest)
const getRecommendedMinRestTime = (): number | null => {
  if (!smartRestTime) return null;
  return Math.floor(smartRestTime * 0.8);
};

// Verifica si un tiempo está por debajo del mínimo
const isBelowMinimum = (restTime: number): boolean => {
  const minRest = getRecommendedMinRestTime();
  return minRest !== null && restTime < minRest;
};
```

### Estilos Condicionales

```typescript
className={`... ${
  isBelowMinimum(getRestTimeForSet(idx))
    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400 dark:border-orange-600'
    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
}`}
```

## Casos de Uso

### Ejemplo 1: Ejercicio Compuesto Pesado
- Ejercicio: Peso Muerto
- Descanso inteligente: 150s (2m 30s)
- Mínimo recomendado: 120s (2m)
- Si el usuario selecciona 1m 25s (85s) → ⚠️ Advertencia

### Ejemplo 2: Ejercicio de Aislamiento
- Ejercicio: Curl de Bíceps
- Descanso inteligente: 60s (1m)
- Mínimo recomendado: 48s
- Si el usuario selecciona 45s → ⚠️ Advertencia

### Ejemplo 3: Sin Descanso Inteligente
- Si `smartRestTime` es null (ejercicio sin recomendación)
- No se muestra advertencia
- El usuario puede seleccionar cualquier tiempo sin restricciones

## Beneficios

1. **Educativo**: Ayuda al usuario a entender los tiempos de descanso óptimos
2. **No Restrictivo**: Permite al usuario elegir cualquier tiempo, solo advierte
3. **Visual**: Feedback inmediato sin necesidad de leer documentación
4. **Flexible**: Se adapta a cada tipo de ejercicio automáticamente

## Archivos Modificados
- `app/workout/[id]/components/SeriesTable.tsx`

## Notas Técnicas
- La advertencia solo aparece si hay un `smartRestTime` calculado
- El umbral del 80% es configurable si se necesita ajustar en el futuro
- La advertencia es puramente visual, no bloquea la selección
- Compatible con modo claro y oscuro
