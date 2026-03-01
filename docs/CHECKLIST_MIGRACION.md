# ✅ Checklist: Migración de Descanso Inteligente

## Estado Actual: ⏳ PENDIENTE

---

## 📋 Pasos de Migración

### Fase 1: Ejecutar Migración SQL (5 min)

- [ ] **1.1** Abrir Supabase Dashboard
  - URL: https://supabase.com/dashboard
  - Proyecto: [nombre-de-tu-proyecto]

- [ ] **1.2** Ir a SQL Editor
  - Menú lateral → SQL Editor
  - Botón "New query"

- [ ] **1.3** Copiar SQL de migración
  - Archivo: `supabase/migrations/2026-02-28_add_exercise_rest_fields.sql`
  - O copiar de: `docs/MIGRATION_GUIDE_REST_FIELDS.md`

- [ ] **1.4** Ejecutar migración
  - Pegar SQL en el editor
  - Clic en "Run" o Ctrl+Enter
  - Esperar mensaje: "Success. No rows returned"

- [ ] **1.5** Verificar columnas creadas
  ```sql
  SELECT column_name, data_type 
  FROM information_schema.columns
  WHERE table_name = 'exercises'
  AND column_name IN ('rest_between_sets', 'use_smart_rest');
  ```
  - Debe mostrar 2 filas ✅

---

### Fase 2: Probar en la Aplicación (10 min)

- [ ] **2.1** Recargar aplicación
  - Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
  - O cerrar y abrir navegador

- [ ] **2.2** Crear nueva rutina
  - Ir a Rutinas → Nueva Rutina
  - Nombre: "Test Descanso Inteligente"
  - Agregar 2-3 ejercicios

- [ ] **2.3** Activar descanso inteligente
  - Expandir un ejercicio
  - Buscar sección "Descanso entre series"
  - Clic en botón "🧠 Inteligente"
  - Verificar:
    - [ ] Aparece notificación con tiempo calculado
    - [ ] Botón se pone morado
    - [ ] Tiempo aparece debajo del botón (ej: "4:50")

- [ ] **2.4** Guardar rutina
  - Clic en "Siguiente: Revisar"
  - Clic en "Guardar Rutina"
  - Verificar:
    - [ ] NO aparece error "Rutina no encontrada" ✅
    - [ ] Aparece mensaje "Rutina creada exitosamente"
    - [ ] Rutina aparece en la lista

- [ ] **2.5** Iniciar workout
  - Seleccionar la rutina creada
  - Clic en "Iniciar Entrenamiento"
  - Abrir consola (F12)
  - Buscar log: `[Workout Init] Routine exercises loaded:`
  - Verificar:
    - [ ] `restBetweenSets` tiene valor numérico (no `undefined`)
    - [ ] `useSmartRest` es `true`

- [ ] **2.6** Completar una serie
  - Completar primera serie del ejercicio
  - Verificar:
    - [ ] Timer muestra el tiempo específico del ejercicio
    - [ ] NO usa el tiempo global de la rutina

---

### Fase 3: Verificación Final (5 min)

- [ ] **3.1** Verificar datos en Supabase
  ```sql
  SELECT 
    e.name,
    e.rest_between_sets,
    e.use_smart_rest,
    r.name as routine_name
  FROM exercises e
  JOIN routines r ON e.routine_id = r.id
  WHERE r.name = 'Test Descanso Inteligente';
  ```
  - Verificar que `rest_between_sets` tiene valores
  - Verificar que `use_smart_rest` es `true`

- [ ] **3.2** Probar edición de rutina existente
  - Editar la rutina de prueba
  - Cambiar tiempo de descanso de un ejercicio
  - Guardar
  - Verificar que NO da error

- [ ] **3.3** Limpiar datos de prueba (opcional)
  - Eliminar rutina "Test Descanso Inteligente"
  - O dejarla para referencia futura

---

## 🐛 Troubleshooting

### ❌ Error: "Rutina no encontrada"

**Causa:** La migración no se ejecutó o falló

**Solución:**
1. Verificar que las columnas existen (Fase 1.5)
2. Si no existen, ejecutar migración de nuevo
3. Recargar página con Ctrl+Shift+R
4. Limpiar localStorage: `localStorage.clear()` en consola

### ❌ Error: "permission denied"

**Causa:** Usuario sin permisos en Supabase

**Solución:**
1. Contactar administrador del proyecto
2. O usar cuenta con permisos de admin

### ❌ `restBetweenSets` sigue siendo `undefined`

**Causa:** Estás usando una rutina creada ANTES de la migración

**Solución:**
1. Crear una NUEVA rutina (no editar existente)
2. Las rutinas antiguas no tienen estos campos

### ❌ Botón "🧠 Inteligente" no hace nada

**Causa:** Error en el código o caché del navegador

**Solución:**
1. Abrir consola (F12) y buscar errores
2. Recargar con Ctrl+Shift+R
3. Verificar que el código está actualizado

---

## 📊 Criterios de Éxito

La migración es exitosa cuando:

✅ Las 2 columnas existen en la tabla `exercises`  
✅ Se puede crear rutina con descanso inteligente sin errores  
✅ El tiempo calculado se muestra correctamente  
✅ El tiempo se guarda en Supabase  
✅ El workout usa el tiempo específico del ejercicio  
✅ No aparece el error "Rutina no encontrada"  

---

## 📚 Documentación de Referencia

- `docs/ACCION_INMEDIATA_MIGRACION.md` - Resumen ejecutivo
- `docs/MIGRATION_GUIDE_REST_FIELDS.md` - Guía completa
- `docs/FIX_DESCANSO_INTELIGENTE_DEBUG.md` - Diagnóstico del problema
- `docs/STORAGE_ARCHITECTURE_ANALYSIS.md` - Arquitectura propuesta
- `supabase/migrations/2026-02-28_add_exercise_rest_fields.sql` - SQL de migración

---

## 🎯 Próximos Pasos (Después de Migración)

Una vez completado este checklist:

1. ✅ Migración ejecutada y verificada
2. ⏭️ Implementar CRITICAL_SUPABASE_ONLY para rutinas
3. ⏭️ Mejorar manejo de errores en RoutineForm
4. ⏭️ Agregar indicador de estado de conexión
5. ⏭️ Implementar botón de reintentar en errores
6. ⏭️ Testing completo en múltiples dispositivos

---

**Última actualización:** 2026-02-28  
**Tiempo estimado total:** 20 minutos  
**Prioridad:** 🔴 ALTA - Bloqueante para descanso inteligente
