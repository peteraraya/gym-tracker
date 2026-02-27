# Fix: Restauración de Selectores de Descanso Personalizado

## Problema
Se perdió la funcionalidad de descanso personalizado por serie en la tabla de series.

## Solución
Restauré los selectores de descanso inteligente en la SeriesTable.

## Cambios Realizados

### 1. SeriesTable.tsx
- **Agregado prop**: `perSetRestOverrides` - Almacena los overrides de descanso por serie
- **Agregado prop**: `onEditRestTime` - Callback para actualizar descanso de una serie
- **Agregada columna**: "Descanso (s)" en desktop (hidden en mobile)
- **Selector de descanso**: Dropdown con opciones de 5 en 5 segundos (5s a 300s)

### 2. page.tsx
- **Agregado handler**: `handleEditRestTime` - Actualiza el descanso de una serie específica
- **Actualizado SeriesTable**: Pasados los props `perSetRestOverrides` y `onEditRestTime`

## Funcionalidad Restaurada

### Descanso Personalizado por Serie
- Cada serie puede tener un descanso diferente
- Selector dropdown con opciones: 5s, 10s, 15s, ... 300s
- Se guarda en `perSetRestOverrides`
- Se usa en el cálculo del descanso inteligente

### Sistema de Descanso Inteligente
- Usa `perSetRestOverrides` para descansos personalizados
- Fallback a `exercise.restBetweenSets` si no hay override
- Fallback a `routine.restBetweenSets` si no hay nada
- Se integra con el Timer para mostrar el descanso correcto

## Ubicación en la Tabla

### Desktop
```
Serie | Reps | Peso | Descanso (s) | Tipo | Estado
```

### Mobile
```
Serie | Reps | Peso | Estado
(Selectores de tipo arriba)
```

## Uso

1. Usuario completa una serie
2. En la tabla, ve el selector de descanso
3. Puede cambiar el descanso para esa serie específica
4. El cambio se guarda automáticamente
5. El timer usa el descanso personalizado

## Beneficios

- ✅ Control granular de descansos
- ✅ Adaptación a fatiga del usuario
- ✅ Integración con sistema inteligente
- ✅ Persistencia en sesión
- ✅ Guardado en historial
