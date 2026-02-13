# Fix: Sincronización y Consistencia de Sesiones

## Problema Principal
Las sesiones se estaban guardando en localStorage pero no en la base de datos Supabase, causando inconsistencias:
- Al recargar la página solo aparecían 4 sesiones (las que estaban en la BD)
- Al terminar una rutina aparecían todas las sesiones temporalmente
- Los datos no estaban sincronizados entre localStorage y Supabase

## Causas Identificadas

### 1. Claves de localStorage Antiguas
Existían sesiones en claves antiguas que no se estaban migrando:
- `workoutSessions` (clave antigua)
- `sessions` (clave antigua)
- `gym_tracker_sessions` (clave actual)

### 2. Fallback Silencioso
Cuando Supabase fallaba, el sistema hacía fallback a localStorage sin indicarlo claramente, causando que las sesiones solo se guardaran localmente.

### 3. Falta de Sincronización
No había un mecanismo para sincronizar sesiones de localStorage a Supabase después de un error.

## Soluciones Implementadas

### 1. Función de Migración de Sesiones Antiguas
**Archivo**: `lib/storage/localStorage.ts`

```typescript
export async function migrateLegacySessions(): Promise<{ migrated: number; total: number }>
```

- Busca sesiones en claves antiguas (`workoutSessions`, `sessions`)
- Las migra a la clave actual (`gym_tracker_sessions`)
- Elimina las claves antiguas después de migrar
- Evita duplicados verificando IDs

### 2. Función de Sincronización a Base de Datos
**Archivo**: `lib/storage/storage.ts`

```typescript
export async function syncLocalSessionsToDatabase(): Promise<{ synced: number; errors: number }>
```

- Compara sesiones en localStorage vs Supabase
- Sube a Supabase las sesiones que solo existen localmente
- Maneja errores individualmente por sesión
- Retorna estadísticas de sincronización

### 3. Migración Automática al Cargar
**Archivo**: `context/GymContext.tsx`

Modificado el `useEffect` de carga para:
1. Ejecutar migración de sesiones antiguas primero
2. Cargar rutinas y sesiones
3. Detectar si hay fallback a localStorage
4. Intentar sincronizar automáticamente si es necesario

```typescript
useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    
    // Migrar sesiones antiguas
    const migrationResult = await storageService.migrateLegacySessions();
    
    // Cargar datos
    await Promise.all([refreshRoutines(), refreshSessions()]);
    
    setLoading(false);
  };
  loadData();
}, [user, refreshRoutines, refreshSessions]);
```

### 4. Mejoras en refreshSessions
**Archivo**: `context/GymContext.tsx`

Ahora `refreshSessions`:
- Detecta si está en modo localStorage por error
- Intenta sincronizar automáticamente a Supabase
- Refresca datos después de sincronizar
- Proporciona logs detallados para debugging

### 5. Mejoras en addSession
**Archivo**: `context/GymContext.tsx`

Ahora `addSession`:
- Verifica el estado del storage después de guardar
- Detecta si hubo fallback a localStorage
- Proporciona logs más claros
- Mantiene consistencia en el flujo

### 6. Componente de Sincronización Manual
**Archivo**: `components/SyncSessionsButton.tsx`

Botón de utilidad (solo en desarrollo) que permite:
- Migrar sesiones antiguas manualmente
- Sincronizar a base de datos manualmente
- Ver resultados de la sincronización
- Recargar la app después de sincronizar

## Flujo de Sincronización

### Al Iniciar la Aplicación
```
1. Usuario abre la app
2. GymContext se inicializa
3. Se ejecuta migrateLegacySessions()
   - Busca claves antiguas
   - Migra sesiones a clave actual
   - Elimina claves antiguas
4. Se cargan rutinas y sesiones
5. refreshSessions() detecta inconsistencias
6. Si hay sesiones solo en localStorage:
   - Intenta sincronizar a Supabase
   - Refresca datos de la BD
```

### Al Completar un Entrenamiento
```
1. Usuario completa entrenamiento
2. addSession() guarda la sesión
   - Intenta Supabase primero
   - Fallback a localStorage si falla
3. Verifica estado del storage
4. Si hubo fallback, marca para sincronizar
5. refreshSessions() actualiza el estado
6. Navegación con router.refresh()
7. Próxima carga intentará sincronizar
```

## Archivos Modificados

### Nuevos Archivos
- `components/SyncSessionsButton.tsx` - Botón de sincronización manual
- `docs/SESSION_SYNC_FIX.md` - Esta documentación

### Archivos Modificados
- `lib/storage/localStorage.ts` - Agregada función `migrateLegacySessions()`
- `lib/storage/storage.ts` - Agregadas funciones `migrateLegacySessions()` y `syncLocalSessionsToDatabase()`
- `context/GymContext.tsx` - Mejorados `refreshSessions()`, `addSession()` y carga inicial
- `app/workout/[id]/page.tsx` - Agregado delay y router.refresh() después de completar
- `app/workout/free/page.tsx` - Agregado delay y router.refresh() después de completar

## Verificación y Testing

### Verificar Estado Actual
En la consola del navegador:
```javascript
// Ver sesiones en localStorage
localStorage.getItem('gym_tracker_sessions')

// Ver claves antiguas (deberían estar vacías después de migración)
localStorage.getItem('workoutSessions')
localStorage.getItem('sessions')

// Ver estado del storage
storageService.getStorageStatus()
```

### Forzar Sincronización Manual
1. Abrir la app en modo desarrollo
2. Buscar el botón "Sincronizar Sesiones" (solo visible en dev)
3. Click para ejecutar migración y sincronización
4. Ver resultados en toast y consola

### Verificar en Supabase
1. Ir a Supabase Dashboard
2. Tabla `workout_sessions` - verificar que todas las sesiones estén ahí
3. Tabla `session_exercises` - verificar ejercicios de cada sesión
4. Comparar count con localStorage

## Logs de Debugging

Los siguientes logs ayudan a diagnosticar problemas:

```
[GymContext] Migrated X legacy sessions. Total: Y
[GymContext] refreshSessions -> sessions loaded: X
[GymContext] Storage status: { mode, hasError, lastError }
[GymContext] Detected localStorage fallback, attempting sync...
[GymContext] Synced X sessions to database
[syncLocalSessionsToDatabase] Synced session {id} to database
[Migration] Migrated X sessions. Total: Y
[Migration] Removed legacy key: workoutSessions
```

## Próximos Pasos

1. **Monitorear en Producción**: Verificar que la sincronización funcione correctamente
2. **Eliminar Logs Temporales**: Limpiar console.logs después de confirmar que funciona
3. **Agregar Indicador Visual**: Mostrar al usuario cuando hay sesiones pendientes de sincronizar
4. **Sincronización Periódica**: Considerar sincronizar automáticamente cada X minutos
5. **Manejo de Conflictos**: Implementar resolución de conflictos si una sesión existe en ambos lados con datos diferentes

## Notas Importantes

- La migración solo se ejecuta una vez (las claves antiguas se eliminan)
- La sincronización es segura (no duplica sesiones, verifica por ID)
- El fallback a localStorage sigue funcionando si Supabase falla
- Los datos nunca se pierden, solo pueden estar temporalmente desincronizados
- La sincronización se intenta automáticamente en cada carga
