# Análisis de Arquitectura de Almacenamiento

## Estado Actual

La app usa un sistema híbrido con **fallback automático**:
- **Supabase** como almacenamiento principal (cuando `NEXT_PUBLIC_ENABLE_DATABASE=true`)
- **localStorage** como fallback cuando Supabase falla

### Problema Identificado

El fallback automático causa **inconsistencias de datos**:

1. Usuario crea rutina → Se guarda en Supabase
2. Usuario edita rutina → Supabase falla (ej: columnas faltantes)
3. Sistema cae a localStorage automáticamente
4. localStorage no tiene la rutina (solo existe en Supabase)
5. **Error: "Rutina no encontrada"**

## Propuesta: Arquitectura Crítica vs No Crítica

### 🔴 DATOS CRÍTICOS → Solo Supabase (sin fallback)

Datos que DEBEN persistir entre dispositivos y sesiones:

#### 1. Rutinas (Routines)
- **Ubicación**: Supabase únicamente
- **Razón**: Core de la app, se comparten entre dispositivos
- **Fallback**: ❌ NO - Si falla, mostrar error al usuario
- **Tablas**: `routines`, `exercises`

#### 2. Sesiones de Entrenamiento (WorkoutSessions)
- **Ubicación**: Supabase únicamente
- **Razón**: Historial crítico, análisis de progreso
- **Fallback**: ❌ NO - Si falla, mostrar error al usuario
- **Tablas**: `workout_sessions`, `session_exercises`

#### 3. Perfil de Usuario (UserProfile)
- **Ubicación**: Supabase únicamente
- **Razón**: Datos personales, configuración
- **Fallback**: ❌ NO - Si falla, mostrar error al usuario
- **Tabla**: `profiles`

#### 4. Plan Semanal (WeeklyPlan)
- **Ubicación**: Supabase únicamente
- **Razón**: Planificación importante
- **Fallback**: ❌ NO - Si falla, mostrar error al usuario
- **Almacenamiento**: `profiles.weekly_plan` (JSONB)

### 🟡 DATOS SEMI-CRÍTICOS → Supabase + localStorage backup

Datos importantes pero que pueden funcionar localmente:

#### 5. Entrenamiento Activo (ActiveWorkout)
- **Ubicación**: Supabase + localStorage (dual write)
- **Razón**: Crítico durante el workout, pero temporal
- **Estrategia**: 
  - Guardar en AMBOS simultáneamente
  - Leer de Supabase primero, si falla usar localStorage
  - Al finalizar workout, limpiar ambos
- **Tabla**: `active_workouts`

#### 6. Últimos Pesos (LastWeights)
- **Ubicación**: Supabase + localStorage backup
- **Razón**: Útil para sugerencias, pero se puede recalcular
- **Estrategia**: 
  - Guardar en Supabase
  - Si falla, guardar en localStorage
  - Sincronizar cuando Supabase vuelva
- **Almacenamiento**: `profiles.last_weights` (JSONB)

### 🟢 DATOS NO CRÍTICOS → Solo localStorage

Datos temporales o que se pueden regenerar:

#### 7. Recomendaciones de Progresión (ProgressRecommendation)
- **Ubicación**: localStorage únicamente
- **Razón**: Se calculan en tiempo real desde sesiones
- **Regeneración**: Se pueden recalcular desde `workout_sessions`
- **Clave**: `gym_tracker_recommendations`

#### 8. Plan Mensual (MonthlyPlan)
- **Ubicación**: localStorage únicamente
- **Razón**: Feature secundaria, no crítica
- **Clave**: `monthly_routine_plan`

#### 9. Borradores de Rutinas (RoutineDraft)
- **Ubicación**: localStorage únicamente
- **Razón**: Temporal, solo para UX
- **Clave**: `gym-tracker-routine-draft`

#### 10. Estado de UI/Preferencias
- **Ubicación**: localStorage únicamente
- **Razón**: Específico del dispositivo
- **Ejemplos**:
  - Tema (dark/light)
  - Idioma
  - Ejercicios expandidos/colapsados
  - Última sesión guardada (marker de debug)

## Implementación Propuesta

### Cambios en `lib/storage/storage.ts`

```typescript
// Configuración de estrategias por tipo de dato
const STORAGE_STRATEGIES = {
  // Crítico: Solo Supabase, error si falla
  CRITICAL_SUPABASE_ONLY: 'critical_supabase_only',
  
  // Semi-crítico: Supabase + localStorage backup
  SUPABASE_WITH_LOCAL_BACKUP: 'supabase_with_local_backup',
  
  // No crítico: Solo localStorage
  LOCAL_ONLY: 'local_only',
} as const;

const DATA_STRATEGIES = {
  routines: STORAGE_STRATEGIES.CRITICAL_SUPABASE_ONLY,
  sessions: STORAGE_STRATEGIES.CRITICAL_SUPABASE_ONLY,
  profile: STORAGE_STRATEGIES.CRITICAL_SUPABASE_ONLY,
  weeklyPlan: STORAGE_STRATEGIES.CRITICAL_SUPABASE_ONLY,
  activeWorkout: STORAGE_STRATEGIES.SUPABASE_WITH_LOCAL_BACKUP,
  lastWeights: STORAGE_STRATEGIES.SUPABASE_WITH_LOCAL_BACKUP,
  recommendations: STORAGE_STRATEGIES.LOCAL_ONLY,
  monthlyPlan: STORAGE_STRATEGIES.LOCAL_ONLY,
  routineDraft: STORAGE_STRATEGIES.LOCAL_ONLY,
};
```

### Ejemplo: Rutinas (Crítico)

```typescript
export async function getRoutines(): Promise<Routine[]> {
  if (!isDatabaseEnabled()) {
    throw new Error('Base de datos requerida para rutinas');
  }

  try {
    const supabaseService = await import('@/lib/supabase/service');
    const result = await supabaseService.getRoutines();
    return result;
  } catch (err) {
    // NO FALLBACK - Lanzar error al usuario
    console.error('Error al cargar rutinas desde Supabase:', err);
    throw new Error('No se pudieron cargar las rutinas. Verifica tu conexión.');
  }
}
```

### Ejemplo: Entrenamiento Activo (Semi-crítico)

```typescript
export async function saveActiveWorkout(payload: ActiveWorkout): Promise<void> {
  // DUAL WRITE: Guardar en ambos
  const localStorageService = await import('@/lib/storage/localStorage');
  await localStorageService.saveActiveWorkout(payload);

  if (isDatabaseEnabled()) {
    try {
      const supabaseService = await import('@/lib/supabase/service');
      await supabaseService.saveActiveWorkout(payload);
    } catch (err) {
      // No lanzar error, localStorage ya tiene el backup
      console.warn('No se pudo guardar en Supabase, usando localStorage:', err);
    }
  }
}

export async function getActiveWorkout(): Promise<ActiveWorkout | null> {
  if (isDatabaseEnabled()) {
    try {
      const supabaseService = await import('@/lib/supabase/service');
      const result = await supabaseService.getActiveWorkout();
      
      // Si Supabase tiene datos, usarlos
      if (result) return result;
      
      // Si no, intentar localStorage como backup
      const localStorageService = await import('@/lib/storage/localStorage');
      return await localStorageService.getActiveWorkout();
    } catch (err) {
      // Si Supabase falla, usar localStorage
      console.warn('Supabase falló, usando localStorage:', err);
      const localStorageService = await import('@/lib/storage/localStorage');
      return await localStorageService.getActiveWorkout();
    }
  } else {
    const localStorageService = await import('@/lib/storage/localStorage');
    return await localStorageService.getActiveWorkout();
  }
}
```

### Ejemplo: Recomendaciones (No crítico)

```typescript
export async function getRecommendations(): Promise<ProgressRecommendation[]> {
  // SIEMPRE localStorage, sin intentar Supabase
  const localStorageService = await import('@/lib/storage/localStorage');
  return localStorageService.getRecommendations();
}

export async function saveRecommendations(recommendations: ProgressRecommendation[]): Promise<void> {
  // SIEMPRE localStorage
  const localStorageService = await import('@/lib/storage/localStorage');
  return localStorageService.saveRecommendations(recommendations);
}
```

## Manejo de Errores

### Para Datos Críticos

```typescript
try {
  await storageService.updateRoutine(id, data);
  success('Rutina actualizada');
} catch (err) {
  // Mostrar error claro al usuario
  error('No se pudo guardar la rutina. Verifica tu conexión a internet.');
  
  // Opcional: Ofrecer guardar borrador local
  const draft = { ...data, savedAt: Date.now() };
  localStorage.setItem('routine-draft-' + id, JSON.stringify(draft));
  
  // Mostrar opción de reintentar
  showRetryButton(() => storageService.updateRoutine(id, data));
}
```

### Para Datos Semi-críticos

```typescript
try {
  await storageService.saveActiveWorkout(workout);
  // Éxito silencioso, ya está en localStorage
} catch (err) {
  // No mostrar error, localStorage ya tiene backup
  console.warn('Supabase falló, usando localStorage:', err);
}
```

### Para Datos No Críticos

```typescript
try {
  await storageService.saveRecommendations(recs);
  // Éxito silencioso
} catch (err) {
  // Ignorar error, se pueden regenerar
  console.warn('No se pudieron guardar recomendaciones:', err);
}
```

## Beneficios de esta Arquitectura

### ✅ Consistencia de Datos
- Los datos críticos SIEMPRE están en Supabase
- No hay desincronización entre localStorage y Supabase
- Un solo "source of truth" para datos importantes

### ✅ Mejor UX
- Errores claros cuando algo falla
- Usuario sabe qué está pasando
- Opción de reintentar operaciones fallidas

### ✅ Rendimiento
- Datos no críticos en localStorage (más rápido)
- Menos llamadas a Supabase
- Mejor experiencia offline para datos temporales

### ✅ Mantenibilidad
- Código más simple (menos lógica de fallback)
- Fácil identificar qué datos están dónde
- Menos bugs por inconsistencias

## Migración

### Paso 1: Identificar Uso Actual

```bash
# Buscar todos los usos de storageService
grep -r "storageService\." --include="*.ts" --include="*.tsx"
```

### Paso 2: Actualizar por Prioridad

1. **Crítico primero**: Rutinas, Sesiones, Perfil
2. **Semi-crítico**: ActiveWorkout, LastWeights
3. **No crítico**: Recomendaciones, Planes mensuales

### Paso 3: Actualizar UI

- Agregar indicadores de estado de conexión
- Mostrar errores claros
- Agregar botones de reintentar
- Mostrar cuando se usa localStorage como backup

### Paso 4: Testing

- Probar con Supabase desconectado
- Probar con red lenta
- Probar sincronización después de reconexión
- Probar en múltiples dispositivos

## Tabla Resumen

| Dato | Ubicación | Fallback | Razón |
|------|-----------|----------|-------|
| Rutinas | Supabase | ❌ NO | Core, multi-dispositivo |
| Sesiones | Supabase | ❌ NO | Historial crítico |
| Perfil | Supabase | ❌ NO | Datos personales |
| Plan Semanal | Supabase | ❌ NO | Planificación importante |
| Workout Activo | Supabase + localStorage | ✅ SÍ | Crítico pero temporal |
| Últimos Pesos | Supabase + localStorage | ✅ SÍ | Útil pero recalculable |
| Recomendaciones | localStorage | N/A | Se regeneran |
| Plan Mensual | localStorage | N/A | Feature secundaria |
| Borradores | localStorage | N/A | Temporal |
| UI/Preferencias | localStorage | N/A | Específico del dispositivo |

## Próximos Pasos

1. ✅ Ejecutar migración SQL en Supabase (columnas faltantes)
2. ✅ Implementar estrategia CRITICAL_SUPABASE_ONLY para rutinas
3. ✅ Actualizar manejo de errores en RoutineForm
4. ✅ Implementar indicador de estado de conexión
5. ✅ Agregar botón de reintentar en errores
6. ✅ Migrar sesiones a estrategia crítica
7. ✅ Implementar dual-write para ActiveWorkout
8. ✅ Mover recomendaciones a localStorage únicamente
9. ✅ Testing completo
10. ✅ Documentar para el equipo
