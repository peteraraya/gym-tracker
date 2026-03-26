# Implementación de Wake Lock - Pantalla Siempre Activa

## Objetivo
Mantener la pantalla del dispositivo encendida durante todo el entrenamiento para evitar que se apague durante los descansos o mientras el usuario está ejecutando series.

## Problema Resuelto
- ❌ **Antes**: La pantalla se apagaba durante los descansos, perdiendo el timer
- ❌ Usuario tenía que desbloquear el teléfono constantemente
- ❌ Pérdida de contexto y flujo del entrenamiento
- ✅ **Ahora**: La pantalla permanece activa automáticamente durante todo el entrenamiento

## Implementación

### 1. Hook Personalizado: `useWakeLock`
**Ubicación**: `app/workout/[id]/hooks/useWakeLock.ts`

**Características**:
- Detecta si Wake Lock API está disponible en el navegador
- Solicita wake lock al activarse
- Re-adquiere el wake lock si la página vuelve a ser visible (cambio de pestaña)
- Libera el wake lock automáticamente al desmontar
- Maneja errores gracefully

**API Expuesta**:
```typescript
{
  isSupported: boolean,    // Si el navegador soporta Wake Lock API
  isActive: boolean,       // Si el wake lock está activo actualmente
  requestWakeLock: () => Promise<boolean>,  // Activar wake lock
  releaseWakeLock: () => Promise<void>      // Liberar wake lock
}
```

### 2. Integración en Workout Page
**Ubicación**: `app/workout/[id]/page.tsx`

**Flujo**:
1. Se inicializa el hook `useWakeLock`
2. Cuando `isInitialized` es true, se activa automáticamente el wake lock
3. Se muestra un toast de confirmación: "🔋 Pantalla activa durante el entrenamiento"
4. El wake lock se mantiene activo durante todo el entrenamiento
5. Al salir de la página, se libera automáticamente

### 3. Comportamiento Especial

**Re-activación Automática**:
- Si el usuario cambia de pestaña y vuelve, el wake lock se re-activa automáticamente
- Listener en `visibilitychange` detecta cuando la página vuelve a ser visible

**Limpieza**:
- Al desmontar el componente, se libera el wake lock
- Al cancelar o finalizar el entrenamiento, se libera automáticamente

## Compatibilidad

### Navegadores Soportados
- ✅ Chrome/Edge 84+
- ✅ Safari 16.4+ (iOS 16.4+)
- ✅ Firefox (experimental, requiere flag)
- ✅ Opera 70+

### Fallback
Si el navegador no soporta Wake Lock API:
- `isSupported` será `false`
- No se muestra el toast de confirmación
- El entrenamiento funciona normalmente sin wake lock
- Se registra un log en consola

## Beneficios

### Para el Usuario
1. **No más interrupciones**: La pantalla nunca se apaga durante el entrenamiento
2. **Mejor experiencia**: No necesita tocar la pantalla para mantenerla activa
3. **Seguridad**: No pierde el timer durante descansos largos
4. **Flujo continuo**: Mantiene el enfoque en el entrenamiento

### Técnicos
1. **Eficiente**: Solo activo durante el entrenamiento
2. **Automático**: No requiere configuración del usuario
3. **Robusto**: Maneja cambios de visibilidad y errores
4. **Compatible**: Funciona en la mayoría de navegadores modernos

## Consideraciones

### Batería
- El wake lock consume batería adicional
- Es un trade-off aceptable para la experiencia de usuario
- Solo está activo durante el entrenamiento (típicamente 30-90 min)

### Permisos
- No requiere permisos explícitos del usuario
- El navegador puede denegar la solicitud en ciertos contextos
- Se maneja gracefully si falla

## Testing

### Cómo Probar
1. Iniciar un entrenamiento
2. Verificar el toast: "🔋 Pantalla activa durante el entrenamiento"
3. Dejar el dispositivo sin tocar durante 2-3 minutos
4. Verificar que la pantalla NO se apague
5. Cambiar de pestaña y volver
6. Verificar que el wake lock se re-active (check console logs)
7. Finalizar/cancelar entrenamiento
8. Verificar que la pantalla vuelva a comportamiento normal

### Console Logs
```
[WakeLock] Activado - La pantalla permanecerá encendida
[WakeLock] Página visible de nuevo, re-activando...
[WakeLock] Liberado manualmente
```

## Archivos Modificados
- ✅ `app/workout/[id]/hooks/useWakeLock.ts` (nuevo)
- ✅ `app/workout/[id]/page.tsx` (integración)
- ✅ `docs/WAKE_LOCK_IMPLEMENTATION.md` (documentación)

## Estado
✅ Implementado y funcionando
✅ Sin errores de diagnóstico
✅ Compatible con navegadores modernos
