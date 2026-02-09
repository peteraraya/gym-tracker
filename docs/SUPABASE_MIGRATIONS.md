```markdown
# Migraciones Pendientes de Supabase

## ⚠️ IMPORTANTE: Debes ejecutar estas migraciones en Supabase

Tu app tiene migraciones SQL pendientes que deben ejecutarse en Supabase Dashboard antes de que ciertas funcionalidades trabajen correctamente.

---

## ⚡ Opción Rápida: Ejecutar TODO de una vez

**Archivo**: `supabase/complete_migration.sql`

**Este script incluye TODAS las migraciones en orden correcto.**

### Cómo ejecutar (RECOMENDADO):
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto **Gym Tracker**
3. Ve a **SQL Editor** (menú lateral izquierdo)
4. Click en **New Query**
5. Copia y pega el contenido completo de `supabase/complete_migration.sql`
6. Click en **Run** (esquina inferior derecha)
7. Verifica que veas el mensaje "✅ Migraciones ejecutadas exitosamente"

**Listo.** Tu base de datos está actualizada.

---

## 📋 Opción Detallada: Ejecutar migración por migración

## 🔴 Migración 1: Tracking de Duración (PENDIENTE)

**Archivo**: `supabase/add_duration_tracking.sql`

**Qué hace**:
- Agrega columnas para rastrear duración de series (`set_durations`, `pause_durations`)
- Agrega columnas para duración total del workout (`total_duration`, `total_paused_time`)
- Agrega soporte para `sets_data` en formato JSONB en tabla `exercises`
- Agrega columna `equipment` a tabla `exercises`

**Cómo ejecutar**:
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto **Gym Tracker**
3. Ve a **SQL Editor** (menú lateral izquierdo)
4. Click en **New Query**
5. Copia y pega el contenido de `supabase/add_duration_tracking.sql`
6. Click en **Run**

---

## 🔴 Migración 2: Campos de Sesión (PENDIENTE - CRÍTICO)

**Archivo**: `supabase/add_session_fields.sql`

**Qué hace**:
- Agrega columna `exercise_name` a `session_exercises` (para guardar nombre sin depender de `exercise_id`)
- Agrega `sets_completed` en formato JSONB (nuevo formato de series)
- **Hace opcionales las columnas antiguas** `completed_sets`, `actual_reps`, `actual_weight` (para compatibilidad hacia atrás)
- Agrega columna `notes` a `session_exercises`
- Hace `exercise_id` opcional
- Agrega `routine_name` y `completed_at` a `workout_sessions`
- Hace `routine_id` opcional

**Cómo ejecutar**:
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto **Gym Tracker**
3. Ve a **SQL Editor**
4. Click en **New Query**
5. Copia y pega el contenido de `supabase/add_session_fields.sql`
6. Click en **Run**

**⚠️ ESTA MIGRACIÓN ES CRÍTICA**: Sin ella, verás el error `"null value in column 'completed_sets' violates not-null constraint"` al intentar guardar sesiones.

---

## ✅ Verificar que las migraciones se ejecutaron

Después de ejecutar ambas migraciones, verifica en **Table Editor**:

### Tabla `session_exercises` debe tener:
- ✅ `exercise_name` (text)
- ✅ `sets_completed` (jsonb)
- ✅ `set_durations` (integer[])
- ✅ `pause_durations` (integer[])
- ✅ `notes` (text)
- ✅ `exercise_id` (uuid, nullable)

### Tabla `workout_sessions` debe tener:
- ✅ `routine_name` (text)
- ✅ `completed_at` (timestamp)
- ✅ `total_duration` (integer)
- ✅ `total_paused_time` (integer)
- ✅ `notes` (text)
- ✅ `routine_id` (uuid, nullable)

### Tabla `exercises` debe tener:
- ✅ `sets_data` (jsonb)
- ✅ `equipment` (text)

---

## 🎯 Orden de Ejecución

**Ejecuta en este orden**:
1. `add_duration_tracking.sql` (primero)
2. `add_session_fields.sql` (segundo)

---

## 🐛 Troubleshooting

### Error: "column already exists"
Si ves este error, significa que alguna columna ya fue creada anteriormente. Puedes ignorarlo de forma segura.

### Error: "permission denied"
Asegúrate de estar ejecutando la migración en el **SQL Editor** de Supabase Dashboard, no en tu terminal local.

### Error: "relation does not exist"
Verifica que las tablas `workout_sessions`, `session_exercises` y `exercises` existan. Si no existen, primero ejecuta `supabase/schema.sql`.

---

## 📱 Para Build Móvil

Después de ejecutar las migraciones, tu app estará lista para:
- Guardar sesiones de entrenamiento completas
- Trackear duración de series y pausas
- Funcionar en Android/iOS sin problemas

**No olvides ejecutar estas migraciones antes de hacer el build móvil.**

```
