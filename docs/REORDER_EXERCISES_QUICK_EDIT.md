# Reordenar Ejercicios en Modo Edición Rápida

## Funcionalidad Implementada
Agregada la capacidad de reordenar ejercicios en el modo de edición rápida usando botones de "Subir" y "Bajar" optimizados para móvil.

## Implementación

### 1. Nuevo Prop en QuickEditMode
Agregado prop opcional `onMoveExercise`:

```tsx
interface QuickEditModeProps {
  // ... otros props
  onMoveExercise?: (fromIndex: number, toIndex: number) => void;
}
```

### 2. Botones de Reordenar
Agregados botones "Subir" y "Bajar" en el header de cada ejercicio:

```tsx
{onMoveExercise && routine.exercises.length > 1 && (
  <div className="px-2.5 pb-2 flex items-center gap-2">
    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Reordenar:</span>
    <div className="flex gap-1">
      <button
        onClick={() => onMoveExercise(exIdx, exIdx - 1)}
        disabled={exIdx === 0}
      >
        Subir
      </button>
      <button
        onClick={() => onMoveExercise(exIdx, exIdx + 1)}
        disabled={exIdx === routine.exercises.length - 1}
      >
        Bajar
      </button>
    </div>
  </div>
)}
```

### 3. Características

#### Botón "Subir"
- Mueve el ejercicio una posición hacia arriba
- Deshabilitado si el ejercicio ya está en la primera posición
- Icono de flecha hacia arriba

#### Botón "Bajar"
- Mueve el ejercicio una posición hacia abajo
- Deshabilitado si el ejercicio ya está en la última posición
- Icono de flecha hacia abajo

#### Visibilidad
- Solo se muestran si hay más de 1 ejercicio en la rutina
- Solo se muestran si se proporciona el prop `onMoveExercise`

#### Diseño
- Botones compactos con texto e icono
- Estilo consistente con el resto de la UI
- Estados disabled visualmente claros (opacity 30%)
- Tamaño táctil adecuado para móvil

## Uso

### En el Componente Padre
El componente padre debe proporcionar el handler `onMoveExercise`:

```tsx
const handleMoveExercise = (fromIndex: number, toIndex: number) => {
  // Crear nueva rutina con ejercicios reordenados
  const newExercises = [...routine.exercises];
  const [movedExercise] = newExercises.splice(fromIndex, 1);
  newExercises.splice(toIndex, 0, movedExercise);
  
  // Actualizar rutina
  const updatedRoutine = {
    ...routine,
    exercises: newExercises
  };
  
  // Guardar cambios
  updateRoutine(updatedRoutine);
  updateModifiedRoutine(updatedRoutine);
};

// Pasar al componente
<QuickEditMode
  routine={routine}
  workoutData={workoutData}
  onMoveExercise={handleMoveExercise}
  // ... otros props
/>
```

## Ventajas de Botones vs Drag & Drop

### Para Móvil
1. **Más Fácil**: No requiere gestos complejos de arrastrar
2. **Más Preciso**: No hay riesgo de soltar en el lugar equivocado
3. **Más Rápido**: Un toque para mover, sin mantener presionado
4. **Mejor Feedback**: Estados disabled claros
5. **Sin Conflictos**: No interfiere con scroll o collapse

### Para Desktop
1. **Funciona Igual**: Los botones funcionan perfectamente con mouse
2. **Accesible**: Funciona con teclado (Tab + Enter)
3. **Predecible**: Siempre mueve exactamente una posición

## Comportamiento

### Escenario 1: Mover Ejercicio Hacia Arriba
```
Antes:
1. Press de Banca
2. Sentadillas  ← Presionar "Subir"
3. Peso Muerto

Después:
1. Sentadillas
2. Press de Banca
3. Peso Muerto
```

### Escenario 2: Mover Ejercicio Hacia Abajo
```
Antes:
1. Press de Banca  ← Presionar "Bajar"
2. Sentadillas
3. Peso Muerto

Después:
1. Sentadillas
2. Press de Banca
3. Peso Muerto
```

### Escenario 3: Primer Ejercicio
```
1. Press de Banca  ← Botón "Subir" deshabilitado
2. Sentadillas
3. Peso Muerto
```

### Escenario 4: Último Ejercicio
```
1. Press de Banca
2. Sentadillas
3. Peso Muerto  ← Botón "Bajar" deshabilitado
```

## Persistencia
Los cambios en el orden de los ejercicios deben persistirse:
1. Actualizar la rutina en el contexto
2. Guardar en `modifiedRoutine` del workout activo
3. Guardar en storage (localStorage/Supabase)

## Consideraciones

### Datos de Progreso
Al reordenar ejercicios, los datos de progreso (series completadas, reps, pesos) se mantienen asociados al `exerciseId`, no al índice, por lo que no se pierden.

### Ejercicio Actual (Modo Guiado)
Si se está en modo guiado y se reordena el ejercicio actual, el índice debe actualizarse para seguir apuntando al mismo ejercicio.

### Auto-scroll
Después de reordenar, considerar hacer scroll al ejercicio movido para mantener el contexto visual.

## Mejoras Futuras Opcionales

### 1. Drag & Drop para Desktop
Agregar drag & drop nativo para usuarios de desktop:
```tsx
<div
  draggable
  onDragStart={() => setDraggedIndex(exIdx)}
  onDrop={() => onMoveExercise(draggedIndex, exIdx)}
>
```

### 2. Mover Múltiples Posiciones
Agregar botones para mover al inicio/final:
- "↑↑ Al inicio"
- "↓↓ Al final"

### 3. Animaciones
Agregar transiciones suaves al reordenar:
```tsx
<motion.div
  layout
  transition={{ duration: 0.3 }}
>
```

### 4. Undo/Redo
Mantener historial de cambios para deshacer reordenamientos.

## Archivos Modificados
- `app/workout/[id]/components/QuickEditMode.tsx`

## Testing
Para verificar:
1. Abrir modo edición rápida con múltiples ejercicios
2. Verificar que aparecen botones "Subir" y "Bajar"
3. Presionar "Subir" en el segundo ejercicio
4. Verificar que se mueve a la primera posición
5. Verificar que el botón "Subir" se deshabilita
6. Presionar "Bajar" para volver a la posición original
7. Verificar que los datos de progreso se mantienen
8. Recargar la página y verificar que el orden persiste
