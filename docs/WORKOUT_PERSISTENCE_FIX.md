# Fix: Datos Vacíos Después de Re-login con Workout Activo

## Problema

Cuando un usuario:
1. Inicia un workout (rutina en proceso)
2. Se desloguea
3. Vuelve a entrar

**Síntoma:** El workout sigue activo pero todos los datos aparecen en 0 (rutinas, sesiones, etc.)

## Causa Raíz

### Flujo Problemático

1. **Workout activo persiste en localStorage**
   - `WorkoutContext` guarda el estado en localStorage
   - Este dato NO se limpia al hacer logout
   - Al volver a entrar, el workout se restaura

2. **Datos del usuario se cargan de forma asíncrona**
   - `GymContext` depende del estado `user` de `AuthContext`
   - Cuando el usuario vuelve a entrar, `user` cambia de `null` a un objeto válido
   - Esto dispara el `useEffect` que carga rutinas y sesiones

3. **Race condition**
   - El `WorkoutContext` carga el workout activo inmediatamente
   - El `GymContext` puede tardar en cargar los datos
   - La UI se renderiza antes de que los datos estén disponibles
   - Resultado: workout activo pero sin datos de rutinas/sesiones

## Solución Implementada

### 1. Logs Mejorados en GymContext

Agregamos logs detallados para rastrear el flujo de carga:

```typescript
const refreshRoutines = useCallback(async () => {
  try {
    console.log('[GymContext] refreshRoutines: Starting...');
    const data = await storageService.getRoutines();
    console.log('[GymContext] refreshRoutines: Loaded', data.length, 'routines');
    setRoutines(data);
  } catch (error) {
    console.error('[GymContext] Error fetching routines:', error);
    setRoutines([]);
  }
}, []);
```

### 2. Validación de Usuario en useEffect

Aseguramos que los datos solo se carguen cuando hay un usuario válido:

```typescript
useEffect(() => {
  const loadData = async () => {
    console.log('[GymContext] Loading data for user:', user?.id || 'no-user');
    setLoading(true);
    
    // ... migration logic ...
    
    await Promise.all([refreshRoutines(), refreshSessions()]);
    
    console.log('[GymContext] Data loaded successfully');
    setLoading(false);
  };

  // Solo cargar si hay usuario o si estamos en modo localStorage
  if (user || process.env.NEXT_PUBLIC_ENABLE_DATABASE !== 'true') {
    loadData();
  } else {
    console.log('[GymContext] Skipping data load - no user and database enabled');
    setLoading(false);
    setRoutines([]);
    setSessions([]);
  }
}, [user, refreshRoutines, refreshSessions]);
```

### 3. Estado de Loading Respetado

El componente debe respetar el estado `loading` del `GymContext`:

```typescript
const { routines, sessions, loading } = useGym();

if (loading) {
  return <LoadingSpinner />;
}
```

## Verificación

### Pasos para Probar

1. Iniciar sesión
2. Crear una rutina
3. Iniciar un workout
4. Cerrar sesión (logout)
5. Volver a iniciar sesión
6. Verificar que:
   - El workout sigue activo ✓
   - Las rutinas se muestran correctamente ✓
   - Las sesiones se muestran correctamente ✓
   - Los datos del workout son correctos ✓

### Logs Esperados en Consola

```
[GymContext] Loading data for user: abc123
[GymContext] refreshRoutines: Starting...
[GymContext] refreshRoutines: Loaded 5 routines
[GymContext] refreshSessions: Starting...
[GymContext] refreshSessions: Loaded 10 sessions
[GymContext] Data loaded successfully
```

## Mejoras Adicionales Recomendadas

### 1. Limpiar Workout al Logout

Opcionalmente, podríamos limpiar el workout activo al hacer logout:

```typescript
// En AuthContext
const signOut = useCallback(async () => {
  // Limpiar workout activo
  await storageService.clearActiveWorkout();
  
  // Continuar con logout normal
  const supabase = createClient();
  await supabase.auth.signOut();
}, []);
```

**Pros:**
- Evita confusión al volver a entrar
- Estado más limpio

**Contras:**
- Usuario pierde progreso si se desloguea accidentalmente
- Puede ser frustrante si el logout fue involuntario

### 2. Modal de Confirmación

Si hay un workout activo al hacer logout, mostrar confirmación:

```typescript
const handleLogout = async () => {
  if (activeWorkout) {
    const confirmed = await confirm({
      title: 'Workout en progreso',
      message: 'Tienes un entrenamiento activo. ¿Deseas guardarlo antes de salir?',
      confirmText: 'Guardar y salir',
      cancelText: 'Cancelar sin guardar'
    });
    
    if (confirmed) {
      // Guardar workout como sesión
      await saveWorkoutAsSession();
    }
  }
  
  await signOut();
};
```

### 3. Sincronización Automática

Detectar cuando el usuario vuelve a entrar con un workout activo y sincronizar:

```typescript
useEffect(() => {
  if (user && activeWorkout && routines.length === 0) {
    console.log('[App] Detected re-login with active workout, forcing data refresh');
    refreshRoutines();
    refreshSessions();
  }
}, [user, activeWorkout, routines.length]);
```

## Archivos Modificados

- ✅ `context/GymContext.tsx` - Logs mejorados y validación de usuario
- ✅ `docs/WORKOUT_PERSISTENCE_FIX.md` - Documentación del problema y solución

## Estado

✅ **COMPLETADO** - Logs agregados para debugging
⚠️ **PENDIENTE** - Verificar en producción con usuarios reales
📋 **OPCIONAL** - Implementar mejoras adicionales según feedback

## Notas

- El problema es más común en desarrollo donde se hacen logout/login frecuentes
- En producción, los usuarios raramente se desloguean durante un workout
- Los logs ayudarán a identificar si hay otros problemas de timing
- Considerar agregar un "modo de recuperación" si se detecta estado inconsistente
