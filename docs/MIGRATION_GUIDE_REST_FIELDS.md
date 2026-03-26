# Guía de Migración: Campos de Descanso Inteligente

## ⚠️ IMPORTANTE: Esta migración es CRÍTICA

Sin esta migración, el sistema de descanso inteligente NO funcionará y causará el error:
```
Error updating routine: Error: Rutina no encontrada
```

## Paso 1: Acceder a Supabase Dashboard

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto (gym-tracker o el nombre que uses)

## Paso 2: Abrir SQL Editor

1. En el menú lateral izquierdo, busca **"SQL Editor"**
2. Haz clic en **"SQL Editor"**
3. Haz clic en **"New query"** (botón verde arriba a la derecha)

## Paso 3: Copiar y Pegar la Migración

Copia el siguiente código SQL y pégalo en el editor:

```sql
-- Migración: Agregar campos de descanso inteligente a la tabla exercises
-- Fecha: 2026-02-28
-- Descripción: Agrega rest_between_sets y use_smart_rest a exercises para soportar descanso inteligente por ejercicio

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

## Paso 4: Ejecutar la Migración

1. Haz clic en el botón **"Run"** (esquina inferior derecha) o presiona `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
2. Espera a que aparezca el mensaje de éxito: **"Success. No rows returned"**
3. Si ves algún error, copia el mensaje completo y repórtalo

## Paso 5: Verificar que las Columnas se Crearon

Ejecuta esta consulta de verificación (en una nueva query):

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'exercises'
AND column_name IN ('rest_between_sets', 'use_smart_rest')
ORDER BY column_name;
```

**Resultado esperado:**

| column_name | data_type | is_nullable | column_default |
|-------------|-----------|-------------|----------------|
| rest_between_sets | integer | YES | NULL |
| use_smart_rest | boolean | YES | true |

Si ves estas 2 filas, ¡la migración fue exitosa! ✅

## Paso 6: Verificar Datos Existentes (Opcional)

Para ver cómo quedaron tus ejercicios existentes:

```sql
SELECT 
  e.id,
  e.name,
  e.rest_between_sets,
  e.use_smart_rest,
  r.name as routine_name
FROM exercises e
JOIN routines r ON e.routine_id = r.id
ORDER BY r.name, e.order_index
LIMIT 20;
```

**Resultado esperado:**
- `rest_between_sets` será `NULL` para todos los ejercicios existentes (correcto)
- `use_smart_rest` será `true` para todos (correcto, es el default)

## Paso 7: Probar en la Aplicación

Ahora que la migración está completa, prueba el flujo completo:

### 7.1 Crear Nueva Rutina

1. Ve a la app → **Rutinas** → **Nueva Rutina**
2. Completa información básica
3. Agrega ejercicios

### 7.2 Activar Descanso Inteligente

1. Expande un ejercicio
2. Busca la sección **"Descanso entre series"**
3. Haz clic en el botón **"🧠 Inteligente"**
4. Deberías ver:
   - Notificación: "Descanso inteligente aplicado: X:XX"
   - El tiempo calculado aparece debajo del botón
   - El botón se pone morado

### 7.3 Guardar Rutina

1. Haz clic en **"Siguiente: Revisar"**
2. Haz clic en **"Guardar Rutina"**
3. **NO deberías ver el error "Rutina no encontrada"** ✅

### 7.4 Iniciar Workout

1. Ve a **Rutinas** → Selecciona la rutina que creaste
2. Haz clic en **"Iniciar Entrenamiento"**
3. Abre la consola del navegador (F12)
4. Busca el log: `[Workout Init] Routine exercises loaded:`
5. Verifica que `restBetweenSets` tiene un valor (no `undefined`)

**Ejemplo de log correcto:**
```javascript
[Workout Init] Routine exercises loaded:
0: {name: 'Press de Banca', restBetweenSets: 290, useSmartRest: true}
```

## Troubleshooting

### Error: "permission denied for table exercises"

**Solución:** Tu usuario no tiene permisos para modificar la tabla. Contacta al administrador del proyecto de Supabase.

### Error: "column already exists"

**Solución:** Las columnas ya existen. Ejecuta solo la consulta de verificación (Paso 5) para confirmar.

### Error: "relation exercises does not exist"

**Solución:** La tabla `exercises` no existe. Verifica que estás en el proyecto correcto de Supabase.

### Sigue apareciendo "Rutina no encontrada"

**Posibles causas:**

1. **La migración no se ejecutó correctamente**
   - Verifica con la consulta del Paso 5
   - Las columnas deben existir

2. **Estás editando una rutina antigua**
   - Las rutinas creadas ANTES de la migración no tienen estos campos
   - Solución: Crea una NUEVA rutina para probar

3. **Problema de caché**
   - Recarga la página con `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)
   - Limpia el localStorage: Abre consola y ejecuta `localStorage.clear()`

4. **La app no está usando Supabase**
   - Verifica que `NEXT_PUBLIC_ENABLE_DATABASE=true` en `.env.local`
   - Reinicia el servidor de desarrollo

## Rollback (Si algo sale mal)

Si necesitas revertir la migración:

```sql
-- CUIDADO: Esto eliminará las columnas y sus datos
ALTER TABLE exercises DROP COLUMN IF EXISTS rest_between_sets;
ALTER TABLE exercises DROP COLUMN IF EXISTS use_smart_rest;
```

**⚠️ ADVERTENCIA:** Solo ejecuta esto si realmente necesitas revertir. Perderás todos los tiempos de descanso configurados.

## Próximos Pasos

Una vez que la migración esté completa y verificada:

1. ✅ Migración ejecutada
2. ⏭️ Implementar estrategia CRITICAL_SUPABASE_ONLY (ver `STORAGE_ARCHITECTURE_ANALYSIS.md`)
3. ⏭️ Actualizar manejo de errores en RoutineForm
4. ⏭️ Agregar indicador de estado de conexión
5. ⏭️ Testing completo

## Notas Importantes

- **Las rutinas existentes NO tendrán estos campos** hasta que se editen y guarden de nuevo
- **El sistema tiene fallback:** Si `rest_between_sets` es `NULL`, usa el tiempo global de la rutina
- **El descanso inteligente es opcional:** Los usuarios pueden seguir usando tiempos manuales
- **Esta migración es segura:** Usa `IF NOT EXISTS` para evitar errores si ya se ejecutó

## Soporte

Si encuentras problemas durante la migración:

1. Copia el mensaje de error completo
2. Copia el resultado de la consulta de verificación (Paso 5)
3. Indica qué paso estabas ejecutando
4. Reporta en el canal de desarrollo

---

**Fecha de creación:** 2026-02-28  
**Versión:** 1.0  
**Autor:** Sistema de Migración Automática
