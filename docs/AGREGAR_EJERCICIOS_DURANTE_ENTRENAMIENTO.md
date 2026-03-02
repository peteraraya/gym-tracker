# Agregar Ejercicios Durante el Entrenamiento

## Descripción

Se ha implementado la funcionalidad para agregar ejercicios a una rutina mientras se está ejecutando un entrenamiento. Los ejercicios agregados se guardan permanentemente en la rutina para futuros entrenamientos.

## Implementación

### Componentes Creados

#### 1. `AddExerciseButton.tsx`
- **Ubicación**: `app/workout/[id]/components/AddExerciseButton.tsx`
- **Función**: Botón que abre un modal con el selector de ejercicios
- **Props**:
  - `onAddExercises`: Callback que recibe los ejercicios seleccionados

### Modificaciones en `page.tsx`

#### 1. Imports Agregados
```typescript
import { AddExerciseButton } from './components/AddExerciseButton';
import type { ExerciseTemplate } from '@/data/exercises';
```

#### 2. Hook `useGym` Actualizado
Se agregó `updateRoutine` a las funciones extraídas del contexto:
```typescript
const { getRoutineById, addSession, sessions, loading: gymLoading, updateRoutine } = useGym();
```

#### 3. Handler `handleAddExercises`
Nuevo handler que:
1. Convierte los ejercicios seleccionados al formato de la rutina
2. Agrega los ejercicios al final de la lista de ejercicios de la rutina
3. Actualiza el estado local de la rutina
4. Guarda la rutina actualizada en el storage (localStorage o Supabase)
5. Muestra un mensaje de éxito

```typescript
const handleAddExercises = useCallback(async (exercises: ExerciseTemplate[]) => {
  if (!routine || exercises.length === 0) return;
  
  try {
    // Convertir ejercicios al formato de la rutina
    const newExercises = exercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      sets: Array.from({ length: ex.defaultSets || 3 }, () => ({
        reps: ex.defaultReps || 10,
        weight: 0,
        type: 'normal' as const
      })),
      equipment: ex.equipment,
      notes: ex.description,
      restBetweenSets: ex.restTime ? parseInt(String(ex.restTime)) : routine.restBetweenSets || 60,
      useSmartRest: true
    }));

    // Actualizar rutina
    const updatedRoutine = {
      ...routine,
      exercises: [...routine.exercises, ...newExercises]
    };

    setRoutine(updatedRoutine);
    await updateRoutine(id, updatedRoutine);

    success(`${exercises.length} ejercicio${exercises.length > 1 ? 's' : ''} agregado${exercises.length > 1 ? 's' : ''} a la rutina`, 3000);
  } catch (err) {
    console.error('Error adding exercises:', err);
    error('Error al agregar ejercicios');
  }
}, [routine, id, updateRoutine, success, error]);
```

#### 4. Botón en la UI
Se agregó el botón después del componente `ExerciseList`:
```typescript
<div className="mb-6">
  <AddExerciseButton onAddExercises={handleAddExercises} />
</div>
```

## Flujo de Usuario

1. Durante un entrenamiento activo, el usuario ve un botón "➕ Agregar ejercicios"
2. Al hacer clic, se abre un modal con el selector de ejercicios completo
3. El usuario puede:
   - Buscar ejercicios por nombre (búsqueda global)
   - Navegar por grupos musculares (vista de cuerpo humano o lista)
   - Seleccionar múltiples ejercicios
4. Al confirmar la selección:
   - Los ejercicios se agregan al final de la rutina actual
   - Se guardan permanentemente en la rutina
   - Se muestra un mensaje de confirmación
5. Los ejercicios agregados están disponibles inmediatamente en el entrenamiento actual
6. En futuros entrenamientos con esta rutina, los ejercicios agregados estarán presentes

## Características

### Conversión de Ejercicios
Los ejercicios del catálogo se convierten automáticamente al formato de la rutina:
- **Sets**: Se crean según `defaultSets` del ejercicio (por defecto 3)
- **Reps**: Se usan las `defaultReps` del ejercicio (por defecto 10)
- **Peso**: Se inicializa en 0 (el usuario lo ajustará durante el entrenamiento)
- **Descanso**: Se usa el `restTime` del ejercicio o el valor por defecto de la rutina
- **Smart Rest**: Se activa por defecto

### Persistencia
- Los cambios se guardan tanto en el estado local como en el storage
- Compatible con localStorage y Supabase
- Los ejercicios agregados persisten entre sesiones

### UX
- Botón visible y accesible durante todo el entrenamiento
- Modal reutiliza el componente `ExerciseSelector` existente
- Mensajes de confirmación claros
- Manejo de errores con notificaciones

## Beneficios

1. **Flexibilidad**: Permite adaptar el entrenamiento sobre la marcha
2. **Persistencia**: Los cambios se guardan para futuros entrenamientos
3. **Simplicidad**: Interfaz familiar (mismo selector usado en creación de rutinas)
4. **Inmediatez**: Los ejercicios están disponibles de inmediato en el entrenamiento actual

## Casos de Uso

- Agregar ejercicios de calentamiento olvidados
- Añadir ejercicios complementarios durante el entrenamiento
- Expandir la rutina basándose en cómo se siente el usuario
- Agregar ejercicios de estiramiento al final
- Incorporar ejercicios sugeridos por el entrenador en tiempo real

## Notas Técnicas

- El componente `ExerciseSelector` ya existía y se reutiliza
- La función `updateRoutine` del `GymContext` maneja la persistencia
- Los ejercicios se agregan al final de la lista (no interrumpen el orden actual)
- El estado del entrenamiento activo se mantiene intacto
- Compatible con todas las funcionalidades existentes (descanso inteligente, predicción de peso, etc.)
