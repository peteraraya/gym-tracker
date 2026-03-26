# Modo de Edición Rápida - Quick Edit Mode

## Descripción

Implementación de un modo de edición rápida tipo Excel/Hevy que permite a los usuarios completar y editar entrenamientos de forma más flexible y rápida, sin seguir el flujo guiado tradicional.

## Problema Resuelto

Los usuarios necesitaban:
1. Poder completar/descompletar series fácilmente si se equivocan
2. Registrar entrenamientos pasados sin seguir el flujo guiado
3. Editar cualquier serie de cualquier ejercicio directamente
4. Una vista tipo Excel para ver y editar todo el entrenamiento de un vistazo

## Solución Implementada

### 1. Nuevo Componente: QuickEditMode

**Ubicación**: `app/workout/[id]/components/QuickEditMode.tsx`

**Características**:
- Vista de todos los ejercicios y series en formato tabla
- Edición inline de reps y peso con click
- Toggle de completado/descompletado con un click
- Selector de tipo de serie (normal, warmup, dropset, failure)
- Barra de progreso visual del entrenamiento
- Botón flotante para finalizar cuando esté listo

**Interfaz**:
```typescript
interface QuickEditModeProps {
  routine: Routine;
  workoutData: {
    completedSets: { [key: string]: number };
    actualReps: { [key: string]: number[] };
    actualWeights: { [key: string]: number[] };
    setTypes: { [key: string]: string[] };
  };
  onEditReps: (exerciseId: string, setIndex: number, reps: number) => void;
  onEditWeight: (exerciseId: string, setIndex: number, weight: number) => void;
  onEditSetType: (exerciseId: string, setIndex: number, type: SetType) => void;
  onToggleSetComplete: (exerciseId: string, setIndex: number, isComplete: boolean) => void;
  onFinishWorkout?: () => void;
}
```

### 2. Toggle de Modos en Workout Page

**Ubicación**: `app/workout/[id]/page.tsx`

Se agregó un toggle visual para cambiar entre:
- **🎯 Modo Guiado**: Flujo tradicional paso a paso con timer, preparación, etc.
- **📝 Edición Rápida**: Vista tipo Excel para edición libre

### 3. Handlers para Quick Edit

Se implementaron handlers específicos para el modo de edición rápida:

```typescript
// Editar reps de cualquier serie
handleQuickEditReps(exerciseId, setIndex, reps)

// Editar peso de cualquier serie
handleQuickEditWeight(exerciseId, setIndex, weight)

// Cambiar tipo de serie
handleQuickEditSetType(exerciseId, setIndex, type)

// Completar/descompletar serie
handleQuickToggleSetComplete(exerciseId, setIndex, isComplete)
```

### 4. Características del Modo Quick Edit

#### Completar Series
- Click en el checkbox para marcar como completada
- Si no tiene valores, usa los defaults de la rutina
- Feedback háptico al completar
- Actualiza automáticamente el contador de series completadas

#### Descompletar Series
- Click en el checkbox de una serie completada
- Pone las reps en 0 (mantiene el peso para referencia)
- Actualiza el contador de series completadas

#### Edición Inline
- Click en el número de reps o peso para editar
- Input aparece con foco automático
- Enter o blur para guardar
- Cambios se reflejan inmediatamente

#### Progreso Visual
- Barra de progreso en el header
- Porcentaje de series completadas
- Contador de series (completadas/total)
- Indicadores visuales por ejercicio

#### Botón Flotante
- Siempre visible en la parte inferior
- Muestra cantidad de series completadas
- Deshabilitado si no hay series completadas
- Abre el modal de notas al finalizar

## Flujo de Uso

### Caso 1: Registrar Entrenamiento Pasado
1. Usuario inicia el workout
2. Cambia a "Edición Rápida"
3. Completa todas las series con los valores reales
4. Click en "Finalizar Entrenamiento"
5. Agrega notas y ajusta duración
6. Guarda la sesión

### Caso 2: Corregir Error Durante Entrenamiento
1. Usuario está en modo guiado
2. Se da cuenta que marcó mal una serie anterior
3. Cambia a "Edición Rápida"
4. Encuentra la serie incorrecta
5. Edita o desmarca según necesite
6. Vuelve a modo guiado para continuar

### Caso 3: Completar Entrenamiento Flexible
1. Usuario hace algunas series en modo guiado
2. Cambia a edición rápida para ver el panorama completo
3. Completa las series restantes directamente
4. Finaliza cuando esté listo

## Ventajas

1. **Flexibilidad**: El usuario elige cómo quiere trabajar
2. **Corrección fácil**: Deshacer errores es simple
3. **Vista completa**: Ver todo el entrenamiento de un vistazo
4. **Registro rápido**: Ideal para registrar entrenamientos pasados
5. **Sin interrupciones**: No hay timers ni preparaciones forzadas
6. **Familiar**: Interfaz tipo Excel que muchos usuarios conocen

## Compatibilidad

- ✅ Funciona con todos los tipos de series
- ✅ Mantiene los registros al cambiar de modo
- ✅ Compatible con el sistema de progresión
- ✅ Se integra con el modal de finalización existente
- ✅ Responsive para móvil y desktop
- ✅ Feedback háptico en móvil

## Archivos Modificados

1. `app/workout/[id]/page.tsx`
   - Agregado estado `isQuickEditMode`
   - Agregado toggle de modos
   - Implementados handlers para quick edit
   - Condicional de renderizado según modo

2. `app/workout/[id]/components/QuickEditMode.tsx` (nuevo)
   - Componente principal del modo de edición rápida
   - Vista tipo Excel de todos los ejercicios
   - Edición inline y toggle de completado

## Testing

Para probar la funcionalidad:

1. Iniciar un workout
2. Cambiar a "Edición Rápida"
3. Completar algunas series con diferentes valores
4. Descompletar una serie
5. Editar reps y peso de series completadas
6. Cambiar tipo de serie
7. Volver a modo guiado y verificar que los datos persisten
8. Finalizar el entrenamiento

## Mejoras Futuras

- [ ] Copiar serie anterior con un botón
- [ ] Copiar ejercicio completo de sesión anterior
- [ ] Filtros para ver solo series pendientes/completadas
- [ ] Ordenar ejercicios por drag & drop en este modo
- [ ] Exportar/importar datos en formato CSV
- [ ] Atajos de teclado para navegación rápida
- [ ] Modo "super rápido" con solo checkboxes

## Notas Técnicas

- Los datos se sincronizan automáticamente con el `workoutData` del estado
- El cambio de modo no afecta los datos guardados
- El modal de finalización es compartido entre ambos modos
- Los handlers de quick edit actualizan directamente el `workoutState`
- El progreso se calcula en tiempo real basado en `actualReps`
