# Feature: Eliminar Sesiones del Historial

## Descripción
Implementación de la funcionalidad para eliminar sesiones de entrenamiento del historial con confirmación del usuario.

## Cambios Realizados

### 1. Context (`context/GymContext.tsx`)

#### Interface actualizada
```typescript
interface SessionsContextType {
  sessions: WorkoutSession[];
  loading: boolean;
  addSession: (session: Omit<WorkoutSession, 'id'>) => Promise<void>;
  updateSession: (session: WorkoutSession) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>; // ✅ NUEVO
  refreshSessions: () => Promise<void>;
}
```

#### Función `deleteSession`
```typescript
const deleteSession = useCallback(async (sessionId: string) => {
  try {
    console.log('[GymContext] deleteSession called for session:', sessionId);
    
    // Eliminar sesión del storage
    await storageService.deleteSession(sessionId);
    
    // Refrescar sesiones para obtener la lista actualizada
    await refreshSessions();
    
    console.log('[GymContext] Session deleted successfully');
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
}, [refreshSessions]);
```

### 2. Storage Service (`lib/storage/storage.ts`)

#### Función `deleteSession`
```typescript
export async function deleteSession(sessionId: string): Promise<void> {
    if (!isDatabaseEnabled()) {
        throw new Error('Base de datos requerida. Las sesiones solo se pueden eliminar con Supabase habilitado.');
    }

    try {
        const supabaseModule = await import('@/lib/supabase/service');
        const supabaseService = supabaseModule as unknown as SupabaseServicePartial & { deleteSession?: (id: string) => Promise<void> };
        
        if (!supabaseService.deleteSession) {
            throw new Error('Servicio de eliminación de sesiones no disponible');
        }
        
        await supabaseService.deleteSession(sessionId);
        handleStorageSuccess();
        
        logger.info('Sesión eliminada exitosamente', { sessionId });
    } catch (err) {
        logger.error('Error al eliminar sesión en Supabase', { critical: true, sessionId }, err instanceof Error ? err : undefined);
        throw new Error('No se pudo eliminar la sesión de entrenamiento. Verifica tu conexión.');
    }
}
```

### 3. Supabase Service (`lib/supabase/service.ts`)

#### Función `deleteSession`
```typescript
/**
 * Delete a workout session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  if (!sessionId) throw new Error('Session ID is required for deletion');

  // Delete session exercises first (cascade should handle this, but being explicit)
  const { error: exercisesError } = await supabase
    .from('session_exercises')
    .delete()
    .eq('session_id', sessionId);

  if (exercisesError) {
    console.warn('Error al eliminar ejercicios de la sesión:', exercisesError.message);
  }

  // Delete the session
  const { error: sessionError } = await supabase
    .from('workout_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', user.id);

  if (sessionError) {
    throw new Error(`Error al eliminar sesión: ${sessionError.message}`);
  }
}
```

### 4. UI - Página de Sesiones (`app/sessions/page.tsx`)

#### Handler de eliminación con confirmación
```typescript
const handleDeleteSession = async (session: WorkoutSession) => {
  const routineName = getRoutineName(session.routineId);
  const sessionDate = new Date(session.date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const confirmed = await confirm(
    '¿Eliminar sesión?',
    `¿Estás seguro de que quieres eliminar la sesión de "${routineName}" del ${sessionDate}? Esta acción no se puede deshacer.`,
    'Eliminar',
    'Cancelar'
  );

  if (!confirmed) return;

  try {
    await deleteSession(session.id);
    success('🗑️ Sesión eliminada exitosamente');
  } catch (err) {
    console.error('Error deleting session:', err);
    showError('Error al eliminar la sesión');
  }
};
```

#### Botón de eliminar
```tsx
<button
  onClick={() => handleDeleteSession(session)}
  className="px-3 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
  title="Eliminar sesión"
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
  <span className="hidden sm:inline">Eliminar</span>
</button>
```

## Características

### Seguridad
- ✅ Requiere autenticación (verifica `user.id`)
- ✅ Solo permite eliminar sesiones del usuario actual
- ✅ Confirmación obligatoria antes de eliminar
- ✅ Mensaje claro con nombre de rutina y fecha

### UX
- ✅ Botón con icono de papelera
- ✅ Colores rojos para indicar acción destructiva
- ✅ Modal de confirmación con detalles de la sesión
- ✅ Toast de éxito/error después de la acción
- ✅ Responsive (texto oculto en móviles)

### Datos
- ✅ Elimina ejercicios de la sesión primero
- ✅ Elimina la sesión de la base de datos
- ✅ Refresca la lista automáticamente
- ✅ Manejo de errores robusto

## Flujo de Usuario

1. Usuario navega a la página de historial de sesiones
2. Ve la lista de sesiones con botones "Editar" y "Eliminar"
3. Hace clic en "Eliminar" en una sesión
4. Aparece modal de confirmación con:
   - Título: "¿Eliminar sesión?"
   - Mensaje: "¿Estás seguro de que quieres eliminar la sesión de '[Nombre Rutina]' del [Fecha]? Esta acción no se puede deshacer."
   - Botones: "Eliminar" (rojo) y "Cancelar"
5. Si confirma:
   - Se elimina la sesión de Supabase
   - Se muestra toast: "🗑️ Sesión eliminada exitosamente"
   - La lista se actualiza automáticamente
6. Si cancela:
   - No pasa nada, modal se cierra

## Archivos Modificados

1. `context/GymContext.tsx` - Agregado `deleteSession` al contexto
2. `lib/storage/storage.ts` - Agregado función `deleteSession`
3. `lib/supabase/service.ts` - Implementado eliminación en Supabase
4. `app/sessions/page.tsx` - Agregado UI y handler de eliminación

## Testing

### Casos de Prueba
1. ✅ Eliminar sesión normal → debe eliminarse correctamente
2. ✅ Cancelar eliminación → no debe eliminar nada
3. ✅ Eliminar sin conexión → debe mostrar error
4. ✅ Eliminar sesión de otro usuario → debe fallar (seguridad)
5. ✅ Eliminar sesión con rutina eliminada → debe funcionar igual
6. ✅ UI responsive → botón debe verse bien en móvil y desktop

### Comandos de Verificación
```bash
# Verificar que compile
npm run build

# Probar en desarrollo
npm run dev
# Navegar a /sessions
# Intentar eliminar una sesión
```

## Notas Importantes

- La eliminación es permanente y no se puede deshacer
- Solo funciona con Supabase habilitado (no hay fallback a localStorage)
- Los ejercicios de la sesión se eliminan automáticamente (cascade)
- La confirmación es obligatoria para evitar eliminaciones accidentales
- El botón usa colores rojos para indicar que es una acción destructiva

## Mejoras Futuras

- [ ] Opción de "papelera" para recuperar sesiones eliminadas
- [ ] Eliminación masiva de sesiones
- [ ] Filtro para ver solo sesiones eliminadas (soft delete)
- [ ] Exportar sesión antes de eliminar
- [ ] Estadísticas de sesiones eliminadas
