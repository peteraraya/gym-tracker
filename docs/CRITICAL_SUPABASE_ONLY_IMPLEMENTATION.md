# Implementación: CRITICAL_SUPABASE_ONLY para Rutinas

## ✅ Completado

Se implementó la estrategia CRITICAL_SUPABASE_ONLY para:
- ✅ Rutinas (Routines)
- ✅ Sesiones (WorkoutSessions)
- ✅ Perfil (UserProfile)
- ✅ Plan Semanal (WeeklyPlan)

Todos estos datos críticos ahora solo se guardan en Supabase, sin fallback automático a localStorage, y muestran errores claros al usuario.

## Cambios Realizados

### 1. `lib/storage/storage.ts` - Rutinas sin Fallback

#### `getRoutines()`
```typescript
export async function getRoutines(): Promise<Routine[]> {
  if (!isDatabaseEnabled()) {
    throw new Error('Base de datos requerida...');
  }

  try {
    const result = await supabaseService.getRoutines();
    handleStorageSuccess();
    return result;
  } catch (err) {
    // ❌ NO FALLBACK - Lanzar error al usuario
    console.error('[CRITICAL] Error al cargar rutinas desde Supabase:', err);
    throw new Error('No se pudieron cargar las rutinas. Verifica tu conexión...');
  }
}
```

**Cambios:**
- ✅ Elimina fallback a localStorage
- ✅ Lanza error claro al usuario
- ✅ Verifica que la base de datos esté habilitada
- ✅ Log con etiqueta [CRITICAL]

#### `createRoutine()`
```typescript
export async function createRoutine(data: CreateRoutineData): Promise<Routine> {
  if (!isDatabaseEnabled()) {
    throw new Error('Base de datos requerida...');
  }

  try {
    const result = await supabaseService.createRoutine(data);
    handleStorageSuccess();
    return result;
  } catch (err) {
    // ❌ NO FALLBACK - Lanzar error al usuario
    console.error('[CRITICAL] Error al crear rutina en Supabase:', err);
    
    // 💾 Guardar borrador en localStorage para no perder el trabajo
    try {
      const draftKey = `routine-draft-${Date.now()}`;
      localStorage.setItem(draftKey, JSON.stringify({ ...data, savedAt: Date.now() }));
      console.log(`[DRAFT] Borrador guardado en localStorage: ${draftKey}`);
    } catch (draftErr) {
      console.warn('[DRAFT] No se pudo guardar borrador:', draftErr);
    }
    
    throw new Error('No se pudo crear la rutina. Verifica tu conexión. Se guardó un borrador local.');
  }
}
```

**Cambios:**
- ✅ Elimina fallback a localStorage
- ✅ Guarda borrador automáticamente para no perder trabajo
- ✅ Mensaje de error incluye información sobre el borrador
- ✅ Permite reintentar sin perder datos

#### `updateRoutine()`
```typescript
export async function updateRoutine(id: string, data: CreateRoutineData): Promise<Routine> {
  if (!isDatabaseEnabled()) {
    throw new Error('Base de datos requerida...');
  }

  try {
    const result = await supabaseService.updateRoutine(id, data);
    handleStorageSuccess();
    return result;
  } catch (err) {
    // ❌ NO FALLBACK - Lanzar error al usuario
    console.error('[CRITICAL] Error al actualizar rutina en Supabase:', err);
    
    // 💾 Guardar borrador de edición
    try {
      const draftKey = `routine-draft-${id}`;
      localStorage.setItem(draftKey, JSON.stringify({ ...data, id, savedAt: Date.now() }));
      console.log(`[DRAFT] Borrador de edición guardado en localStorage: ${draftKey}`);
    } catch (draftErr) {
      console.warn('[DRAFT] No se pudo guardar borrador:', draftErr);
    }
    
    throw new Error('No se pudo actualizar la rutina. Verifica tu conexión. Se guardó un borrador local.');
  }
}
```

**Cambios:**
- ✅ Elimina fallback a localStorage
- ✅ Guarda borrador de edición con ID de rutina
- ✅ Permite reintentar sin perder cambios

#### `deleteRoutine()`
```typescript
export async function deleteRoutine(id: string): Promise<void> {
  if (!isDatabaseEnabled()) {
    throw new Error('Base de datos requerida...');
  }

  try {
    // Eliminar sesiones asociadas primero
    if (supabaseService.deleteSessionsByRoutine) {
      await supabaseService.deleteSessionsByRoutine(id);
    }
    
    await supabaseService.deleteRoutine(id);
    handleStorageSuccess();
  } catch (err) {
    // ❌ NO FALLBACK - Lanzar error al usuario
    console.error('[CRITICAL] Error al eliminar rutina en Supabase:', err);
    throw new Error('No se pudo eliminar la rutina. Verifica tu conexión...');
  }
}
```

**Cambios:**
- ✅ Elimina fallback a localStorage
- ✅ Lanza error claro
- ✅ No guarda borrador (no tiene sentido para eliminación)

### 2. `components/RoutineForm.tsx` - Manejo de Errores Mejorado

```typescript
try {
  if (routineId) {
    await updateRoutine(routineId, { ... });
  } else {
    await addRoutine({ ... });
  }
  success(routineId ? t('updateSuccess') : t('createSuccess'));
  clearDraft();
  onClose();
} catch (err) {
  console.error('Error saving routine:', err);
  
  const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
  
  if (errorMessage.includes('conexión') || errorMessage.includes('internet')) {
    // Error de conexión
    error(
      `❌ ${errorMessage}\n\n💾 Se guardó un borrador local. Puedes intentar de nuevo cuando tengas conexión.`,
      10000
    );
  } else if (errorMessage.includes('Base de datos requerida')) {
    // Base de datos no habilitada
    error(
      '❌ La base de datos no está habilitada. Contacta al administrador del sistema.',
      8000
    );
  } else {
    // Otro tipo de error
    error(
      `❌ ${errorMessage}\n\nIntenta de nuevo o contacta soporte si el problema persiste.`,
      8000
    );
  }
  
  // ❌ NO cerrar el formulario para que el usuario pueda reintentar
  // onClose(); // Comentado intencionalmente
} finally {
  setIsSubmitting(false);
}
```

**Cambios:**
- ✅ Mensajes de error específicos según el tipo de error
- ✅ Informa al usuario sobre el borrador guardado
- ✅ NO cierra el formulario para permitir reintentar
- ✅ Duración de toast más larga (8-10 segundos)
- ✅ Emojis para mejor UX

### 3. `hooks/useConnectionStatus.ts` - Nuevo Hook

Hook para detectar el estado de conexión:

```typescript
export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isOnline: navigator.onLine,
    isSupabaseConnected: true,
    lastChecked: null,
  });

  // Detecta cambios en navigator.onLine
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { ... };
  }, []);

  // Función para verificar conexión a Supabase
  const checkSupabaseConnection = async (): Promise<boolean> => {
    const storageStatus = getStorageStatus();
    const isConnected = storageStatus.mode === 'supabase' && !storageStatus.hasError;
    setStatus({ ...prev, isSupabaseConnected: isConnected });
    return isConnected;
  };

  return { ...status, checkSupabaseConnection };
}
```

**Características:**
- ✅ Detecta conexión a internet (navigator.onLine)
- ✅ Verifica conexión a Supabase
- ✅ Actualización automática
- ✅ Función manual de verificación

### 4. `components/ConnectionIndicator.tsx` - Nuevo Componente

Indicador visual del estado de conexión:

```typescript
export const ConnectionIndicator: React.FC = () => {
  const { isOnline, isSupabaseConnected, checkSupabaseConnection } = useConnectionStatus();

  return (
    <div>
      {!isOnline ? (
        <div className="bg-red-100 text-red-700">
          <div className="w-2 h-2 bg-red-500 animate-pulse" />
          <span>Sin conexión</span>
        </div>
      ) : !isSupabaseConnected ? (
        <div className="bg-amber-100 text-amber-700">
          <div className="w-2 h-2 bg-amber-500 animate-pulse" />
          <span>Conexión limitada</span>
          <button onClick={checkSupabaseConnection}>Reintentar</button>
        </div>
      ) : (
        <div className="bg-green-100 text-green-700">
          <div className="w-2 h-2 bg-green-500" />
          <span>Conectado</span>
        </div>
      )}
    </div>
  );
};
```

**Características:**
- ✅ Indicador visual con colores (rojo/amarillo/verde)
- ✅ Animación de pulso cuando hay problemas
- ✅ Botón de reintentar
- ✅ Versión compacta disponible
- ✅ Responsive y accesible

## Beneficios

### ✅ Consistencia de Datos
- Las rutinas SIEMPRE están en Supabase
- No hay desincronización entre localStorage y Supabase
- Un solo "source of truth"

### ✅ Mejor UX
- Errores claros y específicos
- Usuario sabe exactamente qué pasó
- Opción de reintentar sin perder datos
- Borradores automáticos para no perder trabajo

### ✅ Recuperación de Errores
- Borradores guardados automáticamente
- Formulario no se cierra al fallar
- Botón de reintentar en indicador de conexión
- Mensajes con duración adecuada

### ✅ Transparencia
- Indicador de conexión visible
- Logs con etiqueta [CRITICAL]
- Usuario informado en todo momento

## Uso

### En Componentes

```typescript
import { ConnectionIndicator } from '@/components/ConnectionIndicator';

function MyComponent() {
  return (
    <div>
      <ConnectionIndicator />
      {/* Resto del componente */}
    </div>
  );
}
```

### En Layouts

```typescript
// app/layout.tsx
import { ConnectionIndicator } from '@/components/ConnectionIndicator';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ConnectionIndicator className="fixed top-4 right-4 z-50" />
        {children}
      </body>
    </html>
  );
}
```

### Versión Compacta

```typescript
import { ConnectionIndicatorCompact } from '@/components/ConnectionIndicator';

function Header() {
  return (
    <header>
      <h1>Mi App</h1>
      <ConnectionIndicatorCompact className="ml-2" />
    </header>
  );
}
```

## Testing

### Probar Sin Conexión

1. Abrir DevTools → Network
2. Seleccionar "Offline"
3. Intentar crear/editar rutina
4. Verificar:
   - ✅ Aparece error claro
   - ✅ Indicador muestra "Sin conexión"
   - ✅ Formulario NO se cierra
   - ✅ Borrador se guarda en localStorage

### Probar Con Conexión Lenta

1. DevTools → Network → "Slow 3G"
2. Intentar crear/editar rutina
3. Verificar:
   - ✅ Loading state visible
   - ✅ No timeout prematuro
   - ✅ Mensaje de éxito al completar

### Probar Supabase Desconectado

1. Detener servicio de Supabase
2. Intentar crear/editar rutina
3. Verificar:
   - ✅ Error específico de Supabase
   - ✅ Indicador muestra "Conexión limitada"
   - ✅ Botón de reintentar funciona

## Próximos Pasos

1. ✅ Implementado CRITICAL_SUPABASE_ONLY para rutinas (COMPLETADO)
2. ✅ Implementado CRITICAL_SUPABASE_ONLY para sesiones (COMPLETADO)
3. ✅ Implementado CRITICAL_SUPABASE_ONLY para perfil (COMPLETADO)
4. ✅ Implementado CRITICAL_SUPABASE_ONLY para plan semanal (COMPLETADO)
5. ⏭️ Agregar ConnectionIndicator al layout principal
6. ⏭️ Testing completo en múltiples escenarios
7. ⏭️ Documentar para el equipo

## Archivos Modificados

- ✅ `lib/storage/storage.ts` - Rutinas, sesiones, perfil y plan semanal sin fallback
- ✅ `components/RoutineForm.tsx` - Manejo de errores mejorado
- ✅ `hooks/useConnectionStatus.ts` - Nuevo hook
- ✅ `components/ConnectionIndicator.tsx` - Nuevo componente

## Archivos Creados

- ✅ `docs/CRITICAL_SUPABASE_ONLY_IMPLEMENTATION.md` - Esta documentación

---

**Fecha:** 2026-02-28  
**Estado:** ✅ Completado para Rutinas, Sesiones, Perfil y Plan Semanal  
**Próximo:** Agregar ConnectionIndicator al layout y testing
