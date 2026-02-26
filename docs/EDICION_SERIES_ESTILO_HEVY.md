# ✅ Edición de Series Estilo Hevy

## Implementado

Sistema de edición flexible de series durante el entrenamiento, similar a Hevy.

## Características

### 1. Checkbox para Marcar/Desmarcar Series
- Cada serie tiene un checkbox al lado del número
- Click para marcar como completada
- Click nuevamente para desmarcar
- Estado visual: verde cuando completada, gris cuando pendiente

### 2. Edición de Reps
- Input numérico para editar repeticiones
- Se puede modificar antes o después de completar
- Placeholder muestra el objetivo configurado
- Validación: mínimo 0 reps

### 3. Edición de Peso
- Input numérico para editar peso (kg)
- Incrementos de 0.5 kg
- Se puede modificar en cualquier momento
- Placeholder muestra el peso configurado

### 4. Edición de Descanso
- Selector dropdown con opciones de 5 en 5 segundos
- Hasta 300 segundos (5 minutos)
- Afecta el descanso después de esta serie

### 5. Tipo de Serie
- Selector compacto para cambiar tipo
- Opciones: Normal, Calentamiento, Drop Set, Fallo
- Se muestra en el indicador de completado

## Interfaz

```
┌─────────────────────────────────────────────────┐
│ ☑ [1] Serie 1                    [Tipo: Normal] │
│     10 reps objetivo                             │
│                                                  │
│ [Reps: 10] [Peso: 60kg] [Descanso: 90s]        │
│                                                  │
│ ✓ Completada: 10 reps @ 60kg | Tipo: Normal    │
└─────────────────────────────────────────────────┘
```

## Flujo de Uso

### Opción 1: Marcar Directamente
1. Usuario completa la serie físicamente
2. Click en checkbox para marcar como completada
3. Usa valores por defecto (objetivo de la rutina)
4. Puede editar después si es necesario

### Opción 2: Editar Antes de Marcar
1. Usuario completa la serie físicamente
2. Edita reps y peso en los inputs
3. Click en checkbox para marcar como completada
4. Guarda los valores editados

### Opción 3: Editar Después de Marcar
1. Usuario marca serie como completada
2. Se da cuenta de un error
3. Edita reps o peso directamente
4. Los cambios se guardan automáticamente

### Opción 4: Desmarcar y Remarcar
1. Usuario marca serie por error
2. Click en checkbox para desmarcar
3. Serie vuelve a estado pendiente
4. Puede remarcar cuando esté lista

## Ventajas vs Flujo Anterior

### Antes
- Flujo rígido: Iniciar → Countdown → Ejecutar → Completar
- No se podía editar después de completar
- No se podía desmarcar una serie
- Difícil corregir errores

### Ahora
- Flujo flexible: Marca cuando quieras
- Edita en cualquier momento
- Desmarca si te equivocaste
- Fácil corrección de errores
- Similar a Hevy (app popular)

## Compatibilidad

### Con Flujo Nuevo (Countdown)
- El botón "Completar Serie" sigue funcionando
- Marca automáticamente la serie actual
- Usa valores de los inputs editables

### Con Flujo Antiguo (Manual)
- Puedes marcar series manualmente con checkbox
- No necesitas usar el botón "Completar Serie"
- Más control y flexibilidad

## Casos de Uso

### 1. Entrenamiento Normal
```
1. Completa serie 1 → Click checkbox
2. Descanso automático
3. Completa serie 2 → Click checkbox
4. Continúa...
```

### 2. Corrección de Error
```
1. Marca serie 1 (10 reps @ 60kg)
2. Te das cuenta que hiciste 12 reps
3. Editas input de reps: 10 → 12
4. Cambio guardado automáticamente
```

### 3. Serie Fallida
```
1. Intentas serie 3 pero solo haces 6 reps
2. Editas reps: 10 → 6
3. Click checkbox para marcar
4. Registra 6 reps (fallo)
```

### 4. Desmarcar por Error
```
1. Marcas serie 2 por error
2. Click checkbox para desmarcar
3. Serie vuelve a pendiente
4. Completas físicamente
5. Click checkbox nuevamente
```

## Implementación Técnica

### Estados
```typescript
const [actualReps, setActualReps] = useState<{[key: string]: number[]}>({});
const [actualWeights, setActualWeights] = useState<{[key: string]: number[]}>({});
const [completedSets, setCompletedSets] = useState<{[key: string]: number}>({});
```

### Checkbox Handler
```typescript
onChange={(e) => {
  const checked = e.target.checked;
  if (checked) {
    // Marcar: usar valores actuales o por defecto
    const repsToUse = doneReps || set.reps;
    const weightToUse = doneWeight || set.weight || 0;
    // Actualizar estados...
  } else {
    // Desmarcar: limpiar valores
    // Actualizar estados...
  }
}}
```

### Input Handlers
```typescript
// Reps
onChange={(e) => {
  const num = parseInt(e.target.value);
  setActualReps(prev => {
    const copy = { ...prev };
    copy[exerciseId][idx] = num;
    return copy;
  });
}}

// Peso
onChange={(e) => {
  const num = parseFloat(e.target.value);
  handleEditWeight(exerciseId, idx, num);
}}
```

## Layout Responsive

### Desktop (3 columnas)
```
[Reps] [Peso] [Descanso]
```

### Mobile (3 columnas compactas)
```
[Reps] [Peso] [Desc]
```

## Indicadores Visuales

### Serie Pendiente
- Fondo: Gris claro
- Borde: Gris
- Checkbox: Vacío

### Serie Completada
- Fondo: Verde claro
- Borde: Verde
- Checkbox: Marcado
- Texto: "✓ Completada: X reps @ Ykg"

## Persistencia

- Los cambios se guardan en el estado local
- Se persisten en WorkoutContext
- Se guardan en localStorage (backup)
- Se sincronizan con Supabase al finalizar

## Mejoras Futuras

1. **Historial de Cambios**: Ver qué se editó
2. **Undo/Redo**: Deshacer cambios
3. **Copiar Serie**: Copiar valores a siguiente serie
4. **Notas por Serie**: Agregar notas específicas
5. **Fotos por Serie**: Adjuntar fotos de forma

---

**Fecha**: 26 de febrero de 2026  
**Inspiración**: Hevy App  
**Estado**: ✅ IMPLEMENTADO
