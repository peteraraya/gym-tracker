# Migración de Base de Datos: Sets Dinámicos

## Descripción
Esta migración actualiza el esquema de la base de datos para soportar series dinámicas con valores individuales de repeticiones y peso para cada serie.

## Cambios en el Esquema

### Antes (Formato Antiguo)
```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY,
  routine_id UUID,
  name TEXT,
  sets INTEGER,      -- Número total de series
  reps INTEGER,      -- Repeticiones para TODAS las series
  weight NUMERIC,    -- Peso para TODAS las series
  notes TEXT,
  order_index INTEGER
);
```

### Después (Formato Nuevo)
```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY,
  routine_id UUID,
  name TEXT,
  sets_data JSONB,   -- Array de objetos: [{reps: 10, weight: 60}, ...]
  equipment TEXT,    -- Nuevo campo
  notes TEXT,
  order_index INTEGER,
  -- Columnas antiguas mantenidas temporalmente para compatibilidad
  sets INTEGER,
  reps INTEGER,
  weight NUMERIC
);
```

## Pasos para Aplicar la Migración

### Opción 1: Usando Supabase Dashboard (Recomendado)

1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido de `supabase/migrations/001_add_sets_data.sql`
5. Ejecuta la query
6. Verifica los resultados

### Opción 2: Usando Supabase CLI

```bash
# Asegúrate de estar en el directorio del proyecto
cd gym-tracker

# Aplicar la migración
supabase db push

# O aplicar específicamente este archivo
supabase db execute --file supabase/migrations/001_add_sets_data.sql
```

### Opción 3: Migración Manual

Si prefieres hacerlo paso por paso:

```sql
-- 1. Agregar columna sets_data
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS sets_data JSONB;

-- 2. Agregar columna equipment
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS equipment TEXT;

-- 3. Migrar datos existentes
UPDATE public.exercises
SET sets_data = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'reps', reps,
      'weight', COALESCE(weight, 0)
    )
  )
  FROM generate_series(1, sets) AS s
)
WHERE sets_data IS NULL AND sets IS NOT NULL AND reps IS NOT NULL;
```

## Verificación

Después de ejecutar la migración, verifica que los datos se hayan migrado correctamente:

```sql
-- Ver algunos ejercicios con ambos formatos
SELECT 
  id,
  name,
  sets as old_sets,
  reps as old_reps,
  weight as old_weight,
  sets_data as new_sets_data,
  jsonb_array_length(sets_data) as number_of_sets
FROM public.exercises
LIMIT 10;
```

### Ejemplo de Resultado Esperado

| name | old_sets | old_reps | old_weight | new_sets_data | number_of_sets |
|------|----------|----------|------------|---------------|----------------|
| Press de banca | 3 | 10 | 60 | `[{"reps":10,"weight":60},{"reps":10,"weight":60},{"reps":10,"weight":60}]` | 3 |
| Sentadilla | 4 | 8 | 100 | `[{"reps":8,"weight":100},{"reps":8,"weight":100},{"reps":8,"weight":100},{"reps":8,"weight":100}]` | 4 |

## Compatibilidad

### Durante el Periodo de Transición

La aplicación ahora soporta **ambos formatos**:

- **Formato Nuevo**: Lee de `sets_data` (JSONB array)
- **Formato Antiguo**: Si `sets_data` es NULL, convierte automáticamente desde `sets/reps/weight`

Esto permite:
- ✅ Migración gradual sin downtime
- ✅ Rollback fácil si hay problemas
- ✅ Datos existentes siguen funcionando

### Después de Verificar la Migración

Una vez que confirmes que todo funciona correctamente:

1. **Opcional**: Hacer `sets_data` NOT NULL
```sql
ALTER TABLE public.exercises 
ALTER COLUMN sets_data SET NOT NULL;
```

2. **Opcional**: Eliminar columnas antiguas (solo si estás 100% seguro)
```sql
ALTER TABLE public.exercises 
DROP COLUMN IF EXISTS sets,
DROP COLUMN IF EXISTS reps,
DROP COLUMN IF EXISTS weight;
```

⚠️ **ADVERTENCIA**: No elimines las columnas antiguas hasta estar completamente seguro de que la migración fue exitosa y que la aplicación funciona correctamente con el nuevo formato.

## Rollback

Si necesitas revertir la migración:

```sql
-- Eliminar columna nueva
ALTER TABLE public.exercises 
DROP COLUMN IF EXISTS sets_data;

ALTER TABLE public.exercises 
DROP COLUMN IF EXISTS equipment;

-- Los datos antiguos siguen intactos
```

## Testing

Después de la migración, prueba:

1. ✅ Crear nueva rutina con series dinámicas
2. ✅ Editar rutina existente
3. ✅ Iniciar entrenamiento con rutina antigua
4. ✅ Iniciar entrenamiento con rutina nueva
5. ✅ Exportar datos a CSV
6. ✅ Ver historial de sesiones

## Notas Importantes

- ⚠️ **Backup**: Haz un backup de tu base de datos antes de ejecutar la migración
- 🔄 La migración es **no destructiva** - mantiene las columnas antiguas
- ✅ La API soporta **ambos formatos** automáticamente
- 📊 Los datos existentes se **migran automáticamente** al nuevo formato
- 🔙 Puedes **revertir** fácilmente si hay problemas

## Soporte

Si encuentras algún problema:

1. Verifica que la migración se ejecutó correctamente
2. Revisa los logs de la API en la consola del navegador
3. Verifica que `sets_data` contenga arrays válidos
4. Si es necesario, ejecuta el rollback y reporta el problema
