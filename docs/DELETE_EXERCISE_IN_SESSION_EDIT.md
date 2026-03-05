# Eliminar y Reordenar Ejercicios en Edición de Sesión

## Descripción
Permite eliminar ejercicios completos y reordenarlos mediante drag and drop al editar una sesión de entrenamiento guardada.

## Cambios Implementados

### EditSessionModal.tsx

#### 1. Estados para Drag and Drop

```typescript
const [draggedExerciseIndex, setDraggedExerciseIndex] = useState<number | null>(null);
const [dragOverExerciseIndex, setDragOverExerciseIndex] = useState<number | null>(null);
```

#### 2. Función para Eliminar Ejercicio

```typescript
const removeExercise = (exerciseIndex: number) => {
  const updated = { ...editedSession };
  
  // No permitir eliminar si solo hay un ejercicio
  if (updated.exercises.length <= 1) {
    return;
  }
  
  // Eliminar el ejercicio
  updated.exercises.splice(exerciseIndex, 1);
  setEditedSession(updated);
};
```

#### 3. Función para Mover Ejercicio

```typescript
const moveExercise = (fromIndex: number, toIndex: number) => {
  if (fromIndex === toIndex) return;
  
  const updated = { ...editedSession };
  const [movedExercise] = updated.exercises.splice(fromIndex, 1);
  updated.exercises.splice(toIndex, 0, movedExercise);
  setEditedSession(updated);
};
```

#### 4. Contenedor con Drag and Drop

```typescript
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <h3 className="text-lg font-bold">Ejercicios</h3>
    {editedSession.exercises.length > 1 && (
      <p className="text-xs text-gray-500">💡 Arrastra para reordenar</p>
    )}
  </div>
  
  {editedSession.exercises.map((exercise, exIdx) => (
    <div
      key={`${exercise.exerciseId}-${exIdx}`}
      draggable={editedSession.exercises.length > 1}
      onDragStart={() => setDraggedExerciseIndex(exIdx)}
      onDragEnd={() => {
        setDraggedExerciseIndex(null);
        setDragOverExerciseIndex(null);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOverExerciseIndex(exIdx);
      }}
      onDragLeave={() => setDragOverExerciseIndex(null)}
      onDrop={(e) => {
        e.preventDefault();
        if (draggedExerciseIndex !== null && draggedExerciseIndex !== exIdx) {
          moveExercise(draggedExerciseIndex, exIdx);
        }
        setDraggedExerciseIndex(null);
        setDragOverExerciseIndex(null);
      }}
      className={`border rounded-lg p-4 transition-all ${
        dragOverExerciseIndex === exIdx && draggedExerciseIndex !== exIdx
          ? 'border-blue-500 scale-105 shadow-lg bg-blue-50'
          : draggedExerciseIndex === exIdx
          ? 'opacity-50'
          : 'border-gray-200 bg-gray-50'
      } ${editedSession.exercises.length > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      {/* Contenido del ejercicio */}
    </div>
  ))}
</div>
```

#### 5. Drag Handle Visual

```typescript
{editedSession.exercises.length > 1 && (
  <div className="flex-shrink-0 text-gray-400">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="4" cy="4" r="1.5" />
      <circle cx="4" cy="8" r="1.5" />
      <circle cx="4" cy="12" r="1.5" />
      <circle cx="12" cy="4" r="1.5" />
      <circle cx="12" cy="8" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  </div>
)}
```

## Características

### Drag and Drop
1. **Indicador Visual**: Icono de 6 puntos para indicar que se puede arrastrar
2. **Feedback Visual**: 
   - Elemento arrastrado: Opacidad 50%
   - Zona de drop: Borde azul, escala 105%, sombra
3. **Cursor**: Cambia a `grab` al pasar sobre el ejercicio, `grabbing` al arrastrar
4. **Solo si hay múltiples**: Drag and drop solo activo con 2+ ejercicios
5. **Hint**: Texto "💡 Arrastra para reordenar" cuando hay múltiples ejercicios

### Eliminar Ejercicio
1. **Validación**: No permite eliminar si solo queda un ejercicio
2. **Botón Visible**: Aparece junto al botón "Agregar Serie"
3. **Estilo Distintivo**: Color rojo para indicar acción destructiva
4. **Icono Claro**: Icono de basura para identificar la acción
5. **Reordenamiento Automático**: Los ejercicios se renumeran automáticamente

## Comportamiento

### Drag and Drop
- Arrastra un ejercicio sobre otro para intercambiar posiciones
- Los números se actualizan automáticamente
- Feedback visual inmediato durante el arrastre
- Funciona en desktop y tablets con mouse/trackpad

### Eliminar
- El botón solo aparece si hay más de un ejercicio
- Al hacer clic, el ejercicio se elimina inmediatamente del estado local
- Los cambios no se guardan hasta presionar "Guardar Cambios"
- Si cancelas, los cambios se descartan

## Casos de Uso

### Reordenar
- Ajustar el orden de ejercicios para reflejar el orden real del entrenamiento
- Organizar ejercicios por grupo muscular
- Corregir errores en el orden de registro

### Eliminar
- Eliminar ejercicios que se registraron por error
- Limpiar sesiones con ejercicios duplicados
- Ajustar sesiones históricas para reflejar lo que realmente se hizo

## Estados Visuales

| Estado | Apariencia |
|--------|-----------|
| Normal | Borde gris, fondo gris claro |
| Hover (draggable) | Cursor grab |
| Arrastrando | Opacidad 50%, cursor grabbing |
| Drop zone | Borde azul, escala 105%, sombra, fondo azul claro |
| Un solo ejercicio | Sin drag handle, sin cursor grab |

## Mejoras Futuras

- Soporte táctil para móviles (touch events)
- Animaciones suaves al reordenar
- Deshacer/rehacer cambios
- Confirmación antes de eliminar
- Arrastrar múltiples ejercicios a la vez

