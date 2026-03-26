# Fix: No Se Pueden Expandir Ejercicios Completados en Modo Edición Rápida

## Problema
Los ejercicios completados se colapsan automáticamente en el modo de edición rápida, pero cuando el usuario intenta expandirlos haciendo clic en el header, no se expanden. Esto impide editar las series de ejercicios ya completados.

## Causa Raíz
El componente tiene una lógica de auto-collapse que se ejecuta cuando un ejercicio se completa:

```tsx
// Auto-colapsar cuando se completa
if (isFullyCompleted && !isCollapsed && completedCount > 0) {
  setTimeout(() => {
    setCollapsedExercises(prev => {
      const newSet = new Set(prev);
      newSet.add(exerciseId);
      return newSet;
    });
  }, 0);
}
```

El problema es que esta lógica se ejecuta en cada render, por lo que incluso si el usuario expande manualmente el ejercicio, el auto-collapse lo vuelve a colapsar inmediatamente.

## Solución Implementada

### 1. Nuevo Estado para Tracking Manual
Agregado un nuevo estado para rastrear qué ejercicios han sido expandidos manualmente por el usuario:

```tsx
const [manuallyExpandedExercises, setManuallyExpandedExercises] = useState<Set<string>>(new Set());
```

### 2. Actualizar toggleCollapse
Modificada la función `toggleCollapse` para marcar/desmarcar ejercicios como manualmente expandidos:

```tsx
const toggleCollapse = (exerciseId: string) => {
  setCollapsedExercises(prev => {
    const newSet = new Set(prev);
    if (newSet.has(exerciseId)) {
      newSet.delete(exerciseId);
      // Marcar como manualmente expandido para evitar auto-collapse
      setManuallyExpandedExercises(prevExpanded => {
        const newExpanded = new Set(prevExpanded);
        newExpanded.add(exerciseId);
        return newExpanded;
      });
    } else {
      newSet.add(exerciseId);
      // Remover de manualmente expandido si se colapsa
      setManuallyExpandedExercises(prevExpanded => {
        const newExpanded = new Set(prevExpanded);
        newExpanded.delete(exerciseId);
        return newExpanded;
      });
    }
    return newSet;
  });
};
```

### 3. Respetar Expansión Manual en Auto-Collapse
Modificada la lógica de auto-collapse para que NO colapse ejercicios que han sido expandidos manualmente:

```tsx
const isManuallyExpanded = manuallyExpandedExercises.has(exerciseId);

// Auto-colapsar cuando se completa (solo si no está manualmente expandido)
if (isFullyCompleted && !isCollapsed && completedCount > 0 && !isManuallyExpanded) {
  setTimeout(() => {
    setCollapsedExercises(prev => {
      const newSet = new Set(prev);
      newSet.add(exerciseId);
      return newSet;
    });
  }, 0);
}
```

## Comportamiento Resultante

### Antes del Fix
1. Usuario completa todas las series de un ejercicio
2. Ejercicio se colapsa automáticamente ✓
3. Usuario hace clic para expandir
4. Ejercicio se expande momentáneamente
5. Auto-collapse lo vuelve a colapsar inmediatamente ✗
6. Usuario no puede editar las series

### Después del Fix
1. Usuario completa todas las series de un ejercicio
2. Ejercicio se colapsa automáticamente ✓
3. Usuario hace clic para expandir
4. Ejercicio se expande ✓
5. Ejercicio permanece expandido (marcado como manualmente expandido) ✓
6. Usuario puede editar las series ✓
7. Si el usuario colapsa manualmente, se puede volver a expandir sin problemas ✓

## Casos de Uso

### Caso 1: Editar Serie Completada
1. Completar todas las series de "Press de Banca"
2. Ejercicio se colapsa automáticamente
3. Hacer clic en el header de "Press de Banca"
4. Ejercicio se expande y permanece expandido
5. Hacer clic en cualquier valor de reps o peso
6. Editar el valor en el modal
7. Guardar cambios

### Caso 2: Revisar Series Completadas
1. Completar varios ejercicios
2. Todos se colapsan automáticamente
3. Expandir cualquier ejercicio completado para revisar
4. El ejercicio permanece expandido
5. Navegar por otros ejercicios
6. El ejercicio expandido sigue expandido

### Caso 3: Colapsar Manualmente
1. Expandir un ejercicio completado
2. Revisar las series
3. Hacer clic en el header para colapsar
4. Ejercicio se colapsa
5. Se puede volver a expandir sin problemas

## Archivos Modificados
- `app/workout/[id]/components/QuickEditMode.tsx`

## Testing
Para verificar el fix:
1. Iniciar un entrenamiento en modo edición rápida
2. Completar todas las series de un ejercicio
3. Verificar que el ejercicio se colapsa automáticamente
4. Hacer clic en el header del ejercicio colapsado
5. Verificar que el ejercicio se expande
6. Verificar que permanece expandido (no se vuelve a colapsar)
7. Hacer clic en cualquier valor de reps o peso
8. Verificar que se abre el modal de edición
9. Editar el valor y guardar
10. Verificar que el cambio se guarda correctamente
