# 📖 Guía de Migración: Descanso Inteligente

## 🎯 Objetivo

Ejecutar la migración SQL necesaria para que el sistema de descanso inteligente funcione correctamente.

## 🚨 Problema Actual

El error **"Rutina no encontrada"** ocurre porque:
1. Las columnas `rest_between_sets` y `use_smart_rest` NO EXISTEN en la tabla `exercises`
2. Supabase falla al intentar guardar estos campos
3. El sistema cae a localStorage como fallback
4. La rutina NO existe en localStorage (solo en Supabase)
5. Resultado: Error "Rutina no encontrada"

## 📚 Documentación Disponible

### 🔴 Para Ejecutar la Migración AHORA

1. **`ACCION_INMEDIATA_MIGRACION.md`** ⭐ EMPEZAR AQUÍ
   - Resumen ejecutivo (5 minutos)
   - Pasos rápidos
   - SQL listo para copiar/pegar
   - Verificación inmediata

2. **`CHECKLIST_MIGRACION.md`** ⭐ SEGUIR PASO A PASO
   - Checklist completo con checkboxes
   - 3 fases: Migración → Pruebas → Verificación
   - Troubleshooting incluido
   - Criterios de éxito claros

3. **`MIGRATION_GUIDE_REST_FIELDS.md`**
   - Guía detallada paso a paso
   - Screenshots y ejemplos
   - Troubleshooting extenso
   - Instrucciones de rollback

### 🔵 Para Entender el Problema

4. **`FIX_DESCANSO_INTELIGENTE_DEBUG.md`**
   - Diagnóstico completo del problema
   - Evidencia de los logs
   - Flujo del sistema
   - Causa raíz identificada

5. **`FIX_DESCANSO_INTELIGENTE_EDICION_RUTINA.md`**
   - Implementación del código
   - Archivos modificados
   - Cómo funciona el descanso inteligente

### 🟢 Para Arquitectura Futura

6. **`STORAGE_ARCHITECTURE_ANALYSIS.md`**
   - Análisis completo de almacenamiento
   - Datos críticos vs no críticos
   - Propuesta de arquitectura
   - Estrategias de fallback

## 🚀 Inicio Rápido (5 minutos)

### Opción A: Resumen Ejecutivo
```bash
# 1. Leer resumen rápido
cat docs/ACCION_INMEDIATA_MIGRACION.md

# 2. Ir a Supabase Dashboard
# 3. SQL Editor → New query
# 4. Copiar SQL del documento
# 5. Run
# 6. Verificar
```

### Opción B: Checklist Guiado
```bash
# 1. Abrir checklist
cat docs/CHECKLIST_MIGRACION.md

# 2. Seguir paso a paso
# 3. Marcar cada checkbox al completar
# 4. Verificar criterios de éxito
```

## 📋 Orden Recomendado de Lectura

### Para Ejecutar la Migración:
1. `ACCION_INMEDIATA_MIGRACION.md` (5 min) - Resumen
2. `CHECKLIST_MIGRACION.md` (20 min) - Ejecución paso a paso
3. `MIGRATION_GUIDE_REST_FIELDS.md` (si necesitas más detalles)

### Para Entender el Contexto:
1. `FIX_DESCANSO_INTELIGENTE_DEBUG.md` - Diagnóstico
2. `FIX_DESCANSO_INTELIGENTE_EDICION_RUTINA.md` - Implementación
3. `STORAGE_ARCHITECTURE_ANALYSIS.md` - Arquitectura

## 🎯 Criterios de Éxito

La migración es exitosa cuando:

✅ Las columnas `rest_between_sets` y `use_smart_rest` existen en `exercises`  
✅ Se puede crear rutina con descanso inteligente sin errores  
✅ El tiempo calculado se muestra en el formulario  
✅ El tiempo se guarda correctamente en Supabase  
✅ El workout usa el tiempo específico del ejercicio  
✅ NO aparece el error "Rutina no encontrada"  

## 🐛 Troubleshooting Rápido

### Error: "Rutina no encontrada"
→ Ver `CHECKLIST_MIGRACION.md` sección Troubleshooting

### Error: "permission denied"
→ Contactar administrador de Supabase

### `restBetweenSets` es `undefined`
→ Crear NUEVA rutina (no editar existente)

### Botón "🧠 Inteligente" no funciona
→ Abrir consola (F12) y buscar errores

## 📊 Estado de la Migración

```
┌─────────────────────────────────────────┐
│  ESTADO: ⏳ PENDIENTE DE EJECUCIÓN      │
├─────────────────────────────────────────┤
│  Código:     ✅ Implementado            │
│  Migración:  ⏳ Pendiente               │
│  Testing:    ⏳ Pendiente               │
│  Deploy:     ⏳ Pendiente               │
└─────────────────────────────────────────┘
```

## 🔄 Flujo de Trabajo

```
1. Leer ACCION_INMEDIATA_MIGRACION.md
   ↓
2. Abrir CHECKLIST_MIGRACION.md
   ↓
3. Ejecutar Fase 1: Migración SQL (5 min)
   ↓
4. Ejecutar Fase 2: Pruebas (10 min)
   ↓
5. Ejecutar Fase 3: Verificación (5 min)
   ↓
6. ✅ Migración Completa
   ↓
7. Continuar con próximos pasos (ver STORAGE_ARCHITECTURE_ANALYSIS.md)
```

## 📁 Archivos de Migración

### SQL
- `supabase/migrations/2026-02-28_add_exercise_rest_fields.sql` - Migración SQL

### Código Implementado
- `components/RoutineForm.tsx` - Botón de descanso inteligente
- `lib/storage/localStorage.ts` - Persistencia localStorage
- `lib/supabase/service.ts` - Persistencia Supabase
- `app/workout/[id]/utils/workoutCalculations.ts` - Cálculo de tiempos
- `app/workout/[id]/page.tsx` - Logs de debug

### Documentación
- `docs/ACCION_INMEDIATA_MIGRACION.md` - Resumen ejecutivo
- `docs/CHECKLIST_MIGRACION.md` - Checklist paso a paso
- `docs/MIGRATION_GUIDE_REST_FIELDS.md` - Guía completa
- `docs/FIX_DESCANSO_INTELIGENTE_DEBUG.md` - Diagnóstico
- `docs/FIX_DESCANSO_INTELIGENTE_EDICION_RUTINA.md` - Implementación
- `docs/STORAGE_ARCHITECTURE_ANALYSIS.md` - Arquitectura

## 🎓 Recursos Adicionales

### Supabase
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase SQL Editor Docs](https://supabase.com/docs/guides/database/sql-editor)
- [Supabase Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)

### Proyecto
- [Repositorio](https://github.com/tu-usuario/gym-tracker)
- [Issues](https://github.com/tu-usuario/gym-tracker/issues)
- [Pull Requests](https://github.com/tu-usuario/gym-tracker/pulls)

## 💬 Soporte

Si encuentras problemas:

1. Revisa la sección Troubleshooting en `CHECKLIST_MIGRACION.md`
2. Revisa la sección Troubleshooting en `MIGRATION_GUIDE_REST_FIELDS.md`
3. Abre un issue en GitHub con:
   - Mensaje de error completo
   - Resultado de la consulta de verificación
   - Paso donde ocurrió el error
   - Screenshots si es posible

## 📅 Historial

- **2026-02-28**: Creación de migración y documentación
- **2026-02-28**: Diagnóstico del problema "Rutina no encontrada"
- **2026-02-28**: Análisis de arquitectura de almacenamiento

---

**Prioridad:** 🔴 ALTA - Bloqueante para descanso inteligente  
**Tiempo estimado:** 20 minutos  
**Riesgo:** Bajo (migración usa IF NOT EXISTS)  
**Reversible:** Sí (ver MIGRATION_GUIDE_REST_FIELDS.md)
