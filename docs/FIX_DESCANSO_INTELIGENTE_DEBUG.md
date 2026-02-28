# Fix: Descanso Inteligente - Debug y Diagnóstico

## Problema Identificado

El error "Rutina no encontrada" ocurre porque:

1. **La rutina existe en Supabase** (base de datos remota)
2. **Supabase falla al cargar/guardar** porque las columnas `rest_between_sets` y `use_smart_rest` NO EXISTEN en la tabla `exercises`
3. **El sistema cae a localStorage** como fallback automático
4. **La rutina NO existe en localStorage** (solo en Supabase)
5. **Por eso lanza "Rutina no encontrada"** en localStorage

## Evidencia de los Logs

### Error en consola:
```javascript
Error updating routine: Error: Rutina no encontrada
at Module.updateRoutine (localStorage.ts:157:15)
```

### Datos cargados sin campos:
```javascript
[Workout Init] Routine exercises loaded:
(2) [{…}, {…}]
0: {name: 'Press de Banca', restBetweenSets: undefined, useSmartRest: true}
1: {name: 'Press Inclinado', restBetweenSets: undefined, useSmartRest: true}
```

### localStorage vacío:
```javascript
JSON.parse(localStorage.getItem('gym-tracker-routines'))
null
```

## Causa Raíz

Las columnas `rest_between_sets` y `use_smart_rest` NO EXISTEN en la tabla `exercises` de Supabase. Por eso:
- Al guardar: Supabase lanza error (columnas inexistentes)
- El sistema cae a localStorage como fallback
- localStorage no tiene la rutina (solo existe en Supabase)
- Resultado: "Rutina no encontrada"

## Solución

### 1. Ejecutar Migración SQL en Supabase (CRÍTICO)

La migración ya está creada en: `supabase/migrations/2026-02-28_add_exercise_rest_fields.sql`

**Contenido de la migración:**
```sql
-- Agregar columna rest_between_sets (tiempo de descanso en segundos, nullable)
ALTER TABLE exercises 
ADD COLUMN IF NOT EXISTS rest_between_sets INTEGER;

-- Agregar columna use_smart_rest (flag booleano, default true)
ALTER TABLE exercises 
ADD COLUMN IF NOT EXISTS use_smart_rest BOOLEAN DEFAULT true;

-- Comentarios para documentación
COMMENT ON COLUMN exercises.rest_between_sets IS 'Tiempo de descanso específico del ejercicio en segundos. Si es NULL, usa el tiempo global de la rutina.';
COMMENT ON COLUMN exercises.use_smart_rest IS 'Si es true, el sistema calcula automáticamente el tiempo de descanso óptimo basado en el tipo de ejercicio.';
```

**Cómo ejecutar:**
1. Ir a Supabase Dashboard → SQL Editor
2. Copiar y pegar el contenido de la migración
3. Ejecutar (Run)
4. Verificar que las columnas se crearon correctamente

### 2. Verificar Columnas Creadas

Ejecutar en SQL Editor:
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'exercises'
AND column_name IN ('rest_between_sets', 'use_smart_rest');
```

Resultado esperado:
```
column_name        | data_type | is_nullable | column_default
-------------------+-----------+-------------+---------------
rest_between_sets  | integer   | YES         | NULL
use_smart_rest     | boolean   | YES         | true
```

### 3. Probar el Flujo Completo

Después de ejecutar la migración:

1. **Crear una NUEVA rutina** (no editar existente)
2. Agregar ejercicios
3. Activar "🧠 Inteligente" en un ejercicio
4. Verificar que muestra el tiempo calculado (ej: "4:50")
5. Guardar la rutina
6. Iniciar workout con esa rutina
7. Verificar en los logs que `restBetweenSets` tiene valor:
   ```javascript
   [Workout Init] Routine exercises loaded:
   0: {name: 'Press de Banca', restBetweenSets: 290, useSmartRest: true}
   ```

## Flujo del Sistema

```
Usuario guarda rutina
    ↓
storage.ts intenta Supabase
    ↓
Supabase falla (columnas no existen)
    ↓
storage.ts cae a localStorage (fallback)
    ↓
localStorage busca rutina por ID
    ↓
Rutina NO existe en localStorage (solo en Supabase)
    ↓
Error: "Rutina no encontrada"
```

## Archivos Modificados

### ✅ Código ya implementado:
- `components/RoutineForm.tsx`: Botón calcula y muestra tiempo
- `lib/storage/localStorage.ts`: Preserva campos en localStorage
- `lib/supabase/service.ts`: Preserva campos en Supabase
- `app/workout/[id]/utils/workoutCalculations.ts`: Usa tiempo del ejercicio
- `app/workout/[id]/page.tsx`: Logs de debug
- `lib/storage/storage.ts`: Maneja fallback localStorage/Supabase

### ⏳ Pendiente:
- **Ejecutar migración SQL en Supabase** (CRÍTICO - sin esto nada funciona)

## Notas Importantes

- Las rutinas existentes NO tendrán estos campos hasta que se editen y guarden de nuevo
- El sistema tiene fallback: si `restBetweenSets` es `undefined`, usa el tiempo global de la rutina
- El descanso inteligente solo se aplica si `useSmartRest` es `true` (default)
- **IMPORTANTE**: Después de la migración, crear una NUEVA rutina para probar (las existentes pueden tener datos inconsistentes)

## Próximos Pasos

1. ✅ **Ejecutar migración SQL en Supabase** (CRÍTICO)
2. ✅ Verificar que las columnas se crearon
3. ✅ Crear nueva rutina de prueba
4. ✅ Activar descanso inteligente
5. ✅ Verificar que se guarda correctamente (sin error "Rutina no encontrada")
6. ✅ Iniciar workout y verificar que usa el tiempo específico
