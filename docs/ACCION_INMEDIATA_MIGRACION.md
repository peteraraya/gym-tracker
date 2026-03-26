# 🚨 ACCIÓN INMEDIATA REQUERIDA: Migración SQL

## Problema Actual

El error **"Rutina no encontrada"** ocurre porque las columnas `rest_between_sets` y `use_smart_rest` NO EXISTEN en la tabla `exercises` de Supabase.

## Solución: Ejecutar Migración SQL (5 minutos)

### Paso Rápido

1. **Ir a Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Proyecto: [tu-proyecto-gym-tracker]

2. **Abrir SQL Editor**
   - Menú lateral → SQL Editor → New query

3. **Copiar y Ejecutar este SQL:**

```sql
-- Agregar columnas para descanso inteligente
ALTER TABLE exercises 
ADD COLUMN IF NOT EXISTS rest_between_sets INTEGER;

ALTER TABLE exercises 
ADD COLUMN IF NOT EXISTS use_smart_rest BOOLEAN DEFAULT true;

COMMENT ON COLUMN exercises.rest_between_sets IS 'Tiempo de descanso específico del ejercicio en segundos. Si es NULL, usa el tiempo global de la rutina.';
COMMENT ON COLUMN exercises.use_smart_rest IS 'Si es true, el sistema calcula automáticamente el tiempo de descanso óptimo basado en el tipo de ejercicio.';
```

4. **Hacer clic en "Run"** (o Ctrl+Enter)

5. **Verificar éxito:**

```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'exercises'
AND column_name IN ('rest_between_sets', 'use_smart_rest');
```

Deberías ver 2 filas. ✅

## Después de la Migración

### Probar Inmediatamente

1. **Crear nueva rutina** (no editar existente)
2. **Activar "🧠 Inteligente"** en un ejercicio
3. **Guardar** → NO debería dar error
4. **Iniciar workout** → Verificar que usa el tiempo específico

### Si Sigue Fallando

1. **Recargar página:** Ctrl+Shift+R
2. **Limpiar localStorage:** Consola → `localStorage.clear()`
3. **Verificar .env.local:** `NEXT_PUBLIC_ENABLE_DATABASE=true`
4. **Reiniciar servidor:** `npm run dev`

## Documentación Completa

Para más detalles, ver:
- `docs/MIGRATION_GUIDE_REST_FIELDS.md` - Guía paso a paso completa
- `docs/FIX_DESCANSO_INTELIGENTE_DEBUG.md` - Diagnóstico del problema
- `docs/STORAGE_ARCHITECTURE_ANALYSIS.md` - Arquitectura propuesta

## Próximos Pasos (Después de Migración)

1. ✅ Migración SQL ejecutada
2. ⏭️ Implementar CRITICAL_SUPABASE_ONLY para rutinas
3. ⏭️ Mejorar manejo de errores
4. ⏭️ Agregar indicador de conexión
5. ⏭️ Testing completo

---

**URGENCIA:** 🔴 ALTA - Sin esta migración, el descanso inteligente no funciona  
**TIEMPO ESTIMADO:** 5 minutos  
**RIESGO:** Bajo (usa IF NOT EXISTS, es seguro ejecutar múltiples veces)
