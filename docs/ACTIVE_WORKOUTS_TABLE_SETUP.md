# Setup: Tabla active_workouts en Supabase

## Problema

La tabla `active_workouts` no existe en Supabase, causando que los entrenamientos activos no se sincronicen entre dispositivos y se pierdan al recargar la página.

## Solución

Ejecutar la migración SQL para crear la tabla con todas las políticas de seguridad necesarias.

## Opción 1: Ejecutar desde Supabase Dashboard (Recomendado)

### Pasos

1. **Abrir Supabase Dashboard**
   - Ir a https://supabase.com/dashboard
   - Seleccionar tu proyecto

2. **Ir al SQL Editor**
   - En el menú lateral, click en "SQL Editor"
   - Click en "New query"

3. **Copiar y Pegar el SQL**
   - Abrir el archivo: `supabase/migrations/2026-02-17_active_workouts_complete.sql`
   - Copiar todo el contenido
   - Pegarlo en el editor SQL

4. **Ejecutar la Migración**
   - Click en "Run" o presionar `Ctrl+Enter`
   - Verificar que aparezca "Success. No rows returned"

5. **Verificar la Tabla**
   - Ir a "Table Editor" en el menú lateral
   - Buscar la tabla `active_workouts`
   - Verificar que tenga las columnas:
     - `user_id` (uuid, primary key)
     - `data` (jsonb)
     - `started_at` (timestamptz)
     - `updated_at` (timestamptz)

## Opción 2: Ejecutar desde CLI de Supabase

### Requisitos
- Tener Supabase CLI instalado
- Proyecto vinculado con `supabase link`

### Pasos

```bash
# Ejecutar la migración
supabase db push

# O ejecutar el archivo específico
supabase db execute -f supabase/migrations/2026-02-17_active_workouts_complete.sql
```

## Opción 3: Ejecutar SQL Manualmente

Si prefieres ejecutar el SQL paso a paso:

```sql
-- 1. Crear la tabla
CREATE TABLE IF NOT EXISTS public.active_workouts (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data jsonb NOT NULL,
  started_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Habilitar RLS
ALTER TABLE public.active_workouts ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas
CREATE POLICY "Users can view their own active workout"
  ON public.active_workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own active workout"
  ON public.active_workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own active workout"
  ON public.active_workouts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own active workout"
  ON public.active_workouts FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Crear índices
CREATE INDEX IF NOT EXISTS idx_active_workouts_user_id 
  ON public.active_workouts(user_id);

CREATE INDEX IF NOT EXISTS idx_active_workouts_updated_at 
  ON public.active_workouts(updated_at DESC);

-- 5. Crear trigger para updated_at
CREATE OR REPLACE FUNCTION update_active_workouts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_active_workouts_updated_at
  BEFORE UPDATE ON public.active_workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_active_workouts_updated_at();
```

## Verificación

### 1. Verificar que la Tabla Existe

En Supabase Dashboard → Table Editor, deberías ver `active_workouts`.

### 2. Verificar Políticas RLS

En Supabase Dashboard → Authentication → Policies, deberías ver 4 políticas para `active_workouts`:
- Users can view their own active workout
- Users can insert their own active workout
- Users can update their own active workout
- Users can delete their own active workout

### 3. Probar desde la App

1. Iniciar un entrenamiento
2. Verificar en consola:
   ```
   [storage] Guardado en Supabase exitosamente
   ```
3. Recargar la página (F5)
4. Verificar en consola:
   ```
   [storage] Supabase retornó: {...}
   ```
5. El entrenamiento debe continuar donde lo dejaste

### 4. Verificar en Supabase Dashboard

1. Ir a Table Editor → active_workouts
2. Deberías ver una fila con tu `user_id` y el `data` del workout
3. El campo `data` debe contener un JSON con:
   - `routineId`
   - `routineName`
   - `currentExerciseIndex`
   - `currentSet`
   - `completedSets`
   - `actualReps`
   - `actualWeights`
   - `startedAt`

## Beneficios de Tener la Tabla

### Antes (Solo localStorage)
- ❌ No sincroniza entre dispositivos
- ❌ Se pierde si se limpia el navegador
- ❌ No funciona en modo incógnito
- ✅ Funciona offline

### Después (Supabase + localStorage)
- ✅ Sincroniza entre dispositivos
- ✅ Persiste incluso si se limpia el navegador
- ✅ Funciona en modo incógnito (con login)
- ✅ Funciona offline (fallback a localStorage)
- ✅ Backup automático en localStorage

## Estructura de la Tabla

```typescript
interface ActiveWorkout {
  user_id: string;           // UUID del usuario
  data: {                    // Estado del workout (JSONB)
    routineId: string;
    routineName: string;
    currentExerciseIndex: number;
    currentSet: number;
    completedSets: Record<string, number>;
    actualReps: Record<string, number[]>;
    actualWeights: Record<string, number[]>;
    startedAt: string;       // ISO date string
    isResting?: boolean;
    restTimerDuration?: number;
    restTimerTitle?: string;
    restTimerNextExercise?: string;
    restTimerStartedAt?: number;
  };
  started_at: string;        // Timestamp de inicio
  updated_at: string;        // Última actualización
}
```

## Troubleshooting

### Error: "relation 'active_workouts' does not exist"
- La migración no se ejecutó correctamente
- Ejecutar nuevamente el SQL desde el dashboard

### Error: "permission denied for table active_workouts"
- Las políticas RLS no están configuradas
- Verificar que RLS esté habilitado
- Verificar que las 4 políticas existan

### Error: "duplicate key value violates unique constraint"
- Ya existe un workout activo para ese usuario
- Esto es normal, se actualizará automáticamente con UPSERT

### Los datos no se sincronizan
- Verificar que `NEXT_PUBLIC_ENABLE_DATABASE=true` en `.env.local`
- Verificar que las credenciales de Supabase sean correctas
- Verificar en consola que no haya errores de autenticación

## Rollback

Si necesitas eliminar la tabla:

```sql
BEGIN;
DROP TRIGGER IF EXISTS trigger_update_active_workouts_updated_at ON public.active_workouts;
DROP FUNCTION IF EXISTS update_active_workouts_updated_at();
DROP POLICY IF EXISTS "Users can delete their own active workout" ON public.active_workouts;
DROP POLICY IF EXISTS "Users can update their own active workout" ON public.active_workouts;
DROP POLICY IF EXISTS "Users can insert their own active workout" ON public.active_workouts;
DROP POLICY IF EXISTS "Users can view their own active workout" ON public.active_workouts;
DROP TABLE IF EXISTS public.active_workouts CASCADE;
COMMIT;
```

## Próximos Pasos

Después de crear la tabla:

1. ✅ Los entrenamientos se sincronizarán automáticamente
2. ✅ Funcionará en múltiples dispositivos
3. ✅ localStorage seguirá siendo el backup
4. ✅ No se perderán datos al recargar

---

**Fecha**: Febrero 2026
**Estado**: Listo para Ejecutar
**Prioridad**: Alta
