# Fix: Persistencia de Rutina Modificada al Recargar

## Problema
Cuando se modifica una rutina durante el entrenamiento (agregar/eliminar series o ejercicios) y se recarga la página (F5), se pierde la información modificada y se carga la rutina original desde Supabase.

## Causa Raíz
La función `updateModifiedRoutine` solo guardaba la rutina modificada en `activeWorkout` (localStorage), pero NO la persistía en Supabase. Al recargar, el código cargaba la rutina original desde Supabase, ignorando las modificaciones.

## Flujo Anterior (Problemático)

```
Usuario modifica rutina (agrega serie)
    ↓
updateModifiedRoutine() guarda en activeWorkout (localStorage)
    ↓
Usuario presiona F5
    ↓
Página recarga
    ↓
Carga rutina ORIGINAL desde Supabase ❌
    ↓
Modificaciones perdidas
```

## Solución Implementada

Modificar `updateModifiedRoutine` para que guarde la rutina en AMBOS lugares:
1. Supabase (base de datos) - Fuente de verdad
2. activeWorkout (localStorage) - Backup local

### Código Modificado

**Archivo:** `context/WorkoutContext.tsx`

**Antes:**
```typescript
const updateModifiedRoutine = useCallback((routine: Routine) => {
  setActiveWorkout(prev => {
    if (!prev) return null;
    const newState = {
      ...prev,
      modifiedRoutine: routine
    };
    // Solo guarda en activeWorkout
    storageService.saveActiveWorkout(newState);
    return newState;
  });
}, []);
```

**Después:**
```typescript
const updateModifiedRoutine = useCallback(async (routine: Routine) => {
  // ✅ CRÍTICO: Guardar en Supabase primero
  try {
    const { updateRoutine } = await import('@/lib/storage/storage');
    
    await updateRoutine(routine.id, {
      name: routine.name,
      description: routine.description,
      exercises: routine.exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        sets: ex.sets.map(set => ({
          reps: set.reps,
          weight: set.weight || 0,
          type: set.type,
          notes: set.notes
        })),
        // ... todos los campos del ejercicio
      })),
      restBetweenSets: routine.restBetweenSets,
      restBetweenExercises: routine.restBetweenExercises
    });
    
    console.log('[WorkoutContext] Modified routine saved to Supabase');
  } catch (error) {
    console.error('[WorkoutContext] Error saving to Supabase:', error);
    // No lanzar error, continuar con guardado local
  }
  
  // También guardar en activeWorkout como backup
  setActiveWorkout(prev => {
    if (!prev) return null;
    const newState = {
      ...prev,
      modifiedRoutine: routine
    };
    storageService.saveActiveWorkout(newState);
    return newState;
  });
}, []);
```

## Flujo Nuevo (Correcto)

```
Usuario modifica rutina (agrega serie)
    ↓
updateModifiedRoutine() guarda en Supabase ✅
    ↓
También guarda en activeWorkout (backup)
    ↓
Usuario presiona F5
    ↓
Página recarga
    ↓
Carga rutina MODIFICADA desde Supabase ✅
    ↓
Modificaciones preservadas
```

## Casos de Uso Cubiertos

### 1. Agregar Serie Durante Entrenamiento
```
1. Usuario está en workout
2. Click en "Agregar Serie"
3. updateModifiedRoutine() se llama
4. Rutina se guarda en Supabase
5. Usuario presiona F5
6. Rutina cargada tiene la serie nueva ✅
```

### 2. Eliminar Serie Durante Entrenamiento
```
1. Usuario está en workout
2. Click en "Eliminar Serie"
3. updateModifiedRoutine() se llama
4. Rutina se guarda en Supabase
5. Usuario presiona F5
6. Rutina cargada NO tiene la serie eliminada ✅
```

### 3. Agregar Ejercicio Durante Entrenamiento
```
1. Usuario está en workout
2. Agrega nuevo ejercicio
3. updateModifiedRoutine() se llama
4. Rutina se guarda en Supabase
5. Usuario presiona F5
6. Rutina cargada tiene el ejercicio nuevo ✅
```

### 4. Eliminar Ejercicio Durante Entrenamiento
```
1. Usuario está en workout
2. Elimina ejercicio
3. updateModifiedRoutine() se llama
4. Rutina se guarda en Supabase
5. Usuario presiona F5
6. Rutina cargada NO tiene el ejercicio eliminado ✅
```

### 5. Reordenar Ejercicios
```
1. Usuario reordena ejercicios
2. updateModifiedRoutine() se llama
3. Rutina se guarda en Supabase
4. Usuario presiona F5
5. Orden de ejercicios se mantiene ✅
```

## Manejo de Errores

### Error al Guardar en Supabase
```typescript
try {
  await updateRoutine(routine.id, data);
} catch (error) {
  console.error('Error saving to Supabase:', error);
  // NO lanzar error - continuar con guardado local
  // El usuario puede seguir trabajando
}
```

**Comportamiento:**
- Si falla Supabase, se guarda solo en localStorage
- Usuario puede continuar el entrenamiento
- Al recargar, puede perder cambios (pero no crashea)
- Se registra el error en consola para debugging

### Sin Conexión
- Guardado en Supabase falla
- Guardado en localStorage funciona
- Usuario puede continuar offline
- Al reconectar, puede haber inconsistencias
- Solución: Usuario debe evitar recargar sin conexión

## Cambios en la Interfaz

**Antes:**
```typescript
interface WorkoutContextType {
  updateModifiedRoutine: (routine: Routine) => void;
}
```

**Después:**
```typescript
interface WorkoutContextType {
  updateModifiedRoutine: (routine: Routine) => Promise<void>;
}
```

**Impacto:** Ahora es una función async, pero los llamados existentes siguen funcionando (no necesitan await).

## Lugares Donde se Llama

1. `handleDeleteSet` - Al eliminar una serie
2. `handleAddSet` - Al agregar una serie
3. `handleDeleteExercise` - Al eliminar un ejercicio
4. `handleQuickDeleteSet` - Al eliminar serie en modo rápido
5. `handleQuickAddSet` - Al agregar serie en modo rápido
6. `handleAddExercises` - Al agregar ejercicios durante workout

Todos estos lugares ahora persisten correctamente en Supabase.

## Testing

### Caso 1: Agregar Serie y Recargar
```
1. Iniciar workout
2. Agregar serie a un ejercicio
3. Verificar en consola: "Modified routine saved to Supabase"
4. Presionar F5
5. Verificar que la serie agregada sigue ahí ✅
```

### Caso 2: Eliminar Serie y Recargar
```
1. Iniciar workout
2. Eliminar serie de un ejercicio
3. Verificar en consola: "Modified routine saved to Supabase"
4. Presionar F5
5. Verificar que la serie eliminada no está ✅
```

### Caso 3: Sin Conexión
```
1. Desconectar internet
2. Iniciar workout
3. Agregar serie
4. Verificar error en consola (esperado)
5. Continuar entrenamiento (debe funcionar)
6. NO recargar sin conexión
7. Reconectar
8. Completar workout normalmente
```

## Logging

Mensajes de consola agregados:

```javascript
// Éxito
"[WorkoutContext] Modified routine saved to Supabase"
"[WorkoutContext] Modified routine saved to activeWorkout storage"

// Error
"[WorkoutContext] Error saving modified routine to Supabase: [error]"
"[Workout] Failed to persist modified routine to activeWorkout: [error]"
```

## Consideraciones de Rendimiento

### Impacto
- Cada modificación hace una llamada a Supabase
- Puede haber latencia (50-200ms típicamente)
- Usuario no nota el delay (operación async)

### Optimización Futura (Opcional)
- Debounce: Esperar 500ms antes de guardar
- Batch: Agrupar múltiples cambios
- Optimistic UI: Actualizar UI inmediatamente, guardar en background

## Compatibilidad

### localStorage Mode
- ✅ Funciona normalmente
- Guarda en localStorage
- No hay llamadas a Supabase

### Supabase Mode
- ✅ Funciona con el fix
- Guarda en Supabase + localStorage
- Doble persistencia para seguridad

## Archivos Modificados

- ✅ `context/WorkoutContext.tsx` - Función `updateModifiedRoutine`
- ✅ `docs/FIX_ROUTINE_PERSISTENCE_ON_RELOAD.md` - Esta documentación

## Conclusión

El fix asegura que cualquier modificación a la rutina durante el entrenamiento se persiste inmediatamente en Supabase, eliminando el problema de pérdida de datos al recargar la página. La solución es robusta, maneja errores gracefully, y mantiene compatibilidad con el código existente.
