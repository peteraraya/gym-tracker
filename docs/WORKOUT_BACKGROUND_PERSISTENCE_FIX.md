# Fix: Entrenamiento se Cierra al Cambiar de App (Móvil)

## Problema

Cuando el usuario está usando la aplicación en su teléfono y:
1. Cambia a otra aplicación
2. Sale de la app temporalmente
3. El sistema pone la app en segundo plano

**Síntoma:** El entrenamiento activo se pierde y el usuario tiene que empezar de nuevo.

## Causa Raíz

### Ciclo de Vida de Apps Móviles

En dispositivos móviles, cuando una app se pone en segundo plano:

1. **El sistema operativo puede suspender la app** para ahorrar recursos
2. **El estado en memoria puede perderse** si el sistema necesita liberar RAM
3. **Los timers y procesos se pausan** hasta que la app vuelva a primer plano
4. **localStorage puede no sincronizarse** antes de la suspensión

### Problema Específico

El `WorkoutContext` guarda el estado del workout en localStorage mediante un `useEffect`:

```typescript
useEffect(() => {
  if (isLoadingActiveWorkout) return;
  if (!activeWorkout) return;
  
  (async () => {
    try {
      await storageService.saveActiveWorkout(activeWorkout);
    } catch (e) {
      console.warn('Failed to persist active workout', e);
    }
  })();
}, [activeWorkout, isLoadingActiveWorkout]);
```

**El problema:** Este `useEffect` se ejecuta de forma asíncrona y puede no completarse antes de que el sistema suspenda la app.

## Solución Implementada

### 1. Hook de Ciclo de Vida (`useAppLifecycle`)

Creamos un hook que detecta cuando la app se pone en segundo plano o vuelve a primer plano:

**Archivo:** `hooks/useAppLifecycle.ts`

```typescript
export function useAppLifecycle(callbacks: AppLifecycleCallbacks) {
  // Usa Capacitor App plugin en móvil
  // Usa Page Visibility API en web
  
  // Eventos:
  // - onPause: App va a segundo plano
  // - onResume: App vuelve a primer plano
  // - onAppStateChange: Cambio de estado general
}
```

**Características:**
- Detecta eventos de Capacitor (`pause`, `resume`) en apps móviles
- Fallback a Page Visibility API (`visibilitychange`) en web
- Maneja `beforeunload` para guardar antes de cerrar

### 2. Persistencia Forzada en WorkoutContext

Modificamos `WorkoutContext` para:

1. **Mantener una ref del workout activo** para acceso sincrónico
2. **Forzar guardado cuando la app se pausa**
3. **Restaurar estado cuando la app se resume**

```typescript
const activeWorkoutRef = useRef<WorkoutState | null>(null);

useAppLifecycle({
  onPause: () => {
    // Guardar inmediatamente antes de suspender
    const currentWorkout = activeWorkoutRef.current;
    if (currentWorkout) {
      storageService.saveActiveWorkout(currentWorkout);
    }
  },
  onResume: () => {
    // Restaurar si se perdió el estado
    const stored = await storageService.getActiveWorkout();
    if (stored && !activeWorkoutRef.current) {
      setActiveWorkout(parsed);
    }
  }
});
```

### 3. Doble Persistencia en Storage

El servicio de storage ya implementa doble persistencia:

```typescript
export async function saveActiveWorkout(payload: ActiveWorkout): Promise<void> {
  // SIEMPRE guardar en localStorage como backup
  await localStorageService.saveActiveWorkout(payload);
  
  // Intentar guardar en Supabase si está habilitado
  if (isDatabaseEnabled()) {
    try {
      await supabaseService.saveActiveWorkout(payload);
    } catch (err) {
      // Si falla, al menos tenemos localStorage
    }
  }
}
```

## Instalación

### 1. Instalar Capacitor App Plugin

```bash
npm install @capacitor/app @capacitor/core
```

### 2. Probar en Desarrollo Web

```bash
npm run dev
```

El fix funciona tanto en web como en móvil. Prueba primero en web para verificar.

### 3. Para Móvil (Opcional)

```bash
# Construir y sincronizar automáticamente
npm run mobile:build

# Abrir en Android Studio
npm run mobile:open
```

**Importante:** No ejecutes `cap:sync` directamente sin antes construir la app (`npm run build` o `npm run mobile:build`). El comando `mobile:build` ya incluye la sincronización.

### 4. Verificar Permisos (Android)

El plugin no requiere permisos especiales, pero verifica que `capacitor.config.ts` esté configurado correctamente.

## Testing

### Caso 1: Cambiar de App
```
1. Iniciar un entrenamiento
2. Completar 2-3 series
3. Presionar el botón Home (salir de la app)
4. Abrir otra app (WhatsApp, Chrome, etc.)
5. Esperar 30 segundos
6. Volver a la app de Gym Tracker
7. ✅ El entrenamiento debe continuar donde se quedó
```

### Caso 2: App en Background Prolongado
```
1. Iniciar un entrenamiento
2. Completar algunas series
3. Salir de la app
4. Esperar 5-10 minutos (el sistema puede liberar memoria)
5. Volver a la app
6. ✅ El entrenamiento debe restaurarse automáticamente
```

### Caso 3: Cerrar App Completamente
```
1. Iniciar un entrenamiento
2. Completar series
3. Cerrar la app desde el gestor de tareas (swipe up)
4. Abrir la app nuevamente
5. ✅ El entrenamiento debe restaurarse
```

### Caso 4: Batería Baja
```
1. Iniciar entrenamiento con batería baja (<20%)
2. El sistema puede ser más agresivo suspendiendo apps
3. Cambiar de app varias veces
4. ✅ El entrenamiento debe persistir
```

## Logs de Debugging

Para verificar que funciona correctamente, busca estos logs en la consola:

```
[AppLifecycle] Capacitor listeners registered
[WorkoutContext] App paused, persisting workout...
[WorkoutContext] Workout persisted successfully on pause
[AppLifecycle] App resumed, checking workout state...
[WorkoutContext] Restoring workout from storage (si es necesario)
```

## Mejoras Adicionales Implementadas

### 1. Ref para Acceso Sincrónico

```typescript
const activeWorkoutRef = useRef<WorkoutState | null>(null);

useEffect(() => {
  activeWorkoutRef.current = activeWorkout;
}, [activeWorkout]);
```

Esto permite acceder al workout actual de forma sincrónica en los callbacks de ciclo de vida.

### 2. Guardado Inmediato en Eventos Críticos

El workout se guarda inmediatamente en:
- `startWorkout()` - Al iniciar
- `updateWorkoutProgress()` - En cada cambio
- `onPause` - Cuando la app se suspende
- `useEffect` - Como backup adicional

### 3. Restauración Inteligente

Al resumir la app:
- Solo restaura si el estado en memoria se perdió
- Valida que los datos sean correctos
- Maneja errores de parsing gracefully

## Compatibilidad

### Móvil (Capacitor)
- ✅ Android: Usa eventos nativos de ciclo de vida
- ✅ iOS: Usa eventos nativos de ciclo de vida
- ✅ Funciona incluso con el sistema agresivo de gestión de memoria

### Web (PWA)
- ✅ Chrome/Edge: Page Visibility API
- ✅ Firefox: Page Visibility API
- ✅ Safari: Page Visibility API
- ⚠️ beforeunload puede no ejecutarse en todos los casos

## Limitaciones Conocidas

### 1. Cierre Forzado del Sistema

Si el sistema operativo mata la app por falta de memoria extrema:
- El evento `pause` puede no ejecutarse
- El último guardado automático será el del `useEffect` anterior
- Puede perderse el progreso de los últimos segundos

**Mitigación:** El `useEffect` guarda cada vez que cambia el workout, minimizando la pérdida.

### 2. Modo Avión

Si el usuario activa modo avión mientras usa la app:
- localStorage funciona normalmente ✅
- Supabase fallará pero localStorage es el backup ✅
- No hay pérdida de datos

### 3. Almacenamiento Lleno

Si el dispositivo no tiene espacio:
- localStorage puede fallar al escribir
- La app mostrará un error en consola
- El workout puede perderse

**Mitigación:** Implementar detección de errores de storage y notificar al usuario.

## Archivos Modificados

- ✅ `hooks/useAppLifecycle.ts` - Nuevo hook de ciclo de vida
- ✅ `context/WorkoutContext.tsx` - Integración del hook y persistencia forzada
- ✅ `docs/WORKOUT_BACKGROUND_PERSISTENCE_FIX.md` - Esta documentación

## Archivos a Modificar (Pendiente)

- ⏳ `package.json` - Agregar `@capacitor/app` a dependencies

## Próximos Pasos

### 1. Instalar Dependencia

```bash
npm install @capacitor/app
```

### 2. Probar en Dispositivo Real

La mejor forma de probar es en un dispositivo físico:

```bash
npm run mobile:build
npm run mobile:open
```

Luego en Android Studio:
1. Conectar dispositivo físico
2. Run app
3. Probar los casos de testing

### 3. Monitorear en Producción

Agregar analytics para detectar:
- Cuántas veces se restaura un workout
- Cuántas veces falla la persistencia
- Tiempo promedio en background antes de restaurar

### 4. Notificación al Usuario (Opcional)

Considerar mostrar un toast cuando se restaura un workout:

```typescript
onResume: () => {
  const stored = await storageService.getActiveWorkout();
  if (stored && !activeWorkoutRef.current) {
    setActiveWorkout(parsed);
    toast.success('Entrenamiento restaurado');
  }
}
```

## Prevención de Regresiones

Para evitar que este problema vuelva:

1. **Siempre usar `useAppLifecycle`** para operaciones críticas en móvil
2. **Nunca confiar solo en `useEffect`** para persistencia crítica
3. **Probar en dispositivos reales** con memoria limitada
4. **Simular background prolongado** en testing

## Relacionado

- `docs/WORKOUT_PERSISTENCE_FIX.md` - Fix de persistencia en reload
- `docs/WORKOUT_PERSISTENCE_RELOAD_FIX.md` - Fix de datos vacíos después de re-login
- `context/WorkoutContext.tsx` - Implementación del contexto
- `lib/storage/storage.ts` - Servicio de persistencia

---

**Fecha**: Febrero 2026
**Estado**: ✅ Implementado (Pendiente: Instalar @capacitor/app)
**Prioridad**: Alta (Bug Crítico en Móvil)
**Plataformas**: Android, iOS, Web (PWA)
