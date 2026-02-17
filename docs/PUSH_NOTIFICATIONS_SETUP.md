# Configuración de Notificaciones Push - Guía Rápida

## ✅ Estado: COMPLETADO Y ACTIVADO

Las notificaciones push están completamente implementadas y activadas por defecto.

## Lo que se ha implementado

### 1. Iconos Generados ✅
Todos los iconos necesarios han sido generados automáticamente:
```
public/icons/
├── icon-72x72.png
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-192x192.png
├── icon-384x384.png
├── icon-512x512.png
├── badge-72x72.png
├── shortcut-workout.png
├── shortcut-progress.png
└── shortcut-ai.png

public/
├── apple-touch-icon.png
├── favicon-16x16.png
└── favicon-32x32.png
```

### 2. Activación Automática ✅
- Las notificaciones se solicitan automáticamente 3 segundos después de cargar la app
- Notificación de bienvenida al activar por primera vez
- No requiere configuración adicional del usuario

### 3. API Endpoints ✅
- `POST /api/push-subscribe` - Guardar suscripciones
- `POST /api/push-send` - Enviar notificación a un usuario
- `GET /api/push-send` - Enviar notificación a todos (testing)

### 4. Página de Configuración ✅
- Nueva página `/settings` con:
  - Configuración de tema
  - Probador de notificaciones push
  - Información de la PWA
- Enlace agregado al Navbar

### 5. Componentes ✅
- `ServiceWorkerRegistration.tsx` - Activación automática
- `PushNotificationTester.tsx` - Probador interactivo
- `app/settings/page.tsx` - Página de configuración

## Cómo Probar

### Opción 1: Automático (Recomendado)
1. Abrir la app en el navegador
2. Esperar 3 segundos
3. Aceptar el permiso cuando aparezca
4. Verás una notificación de bienvenida

### Opción 2: Manual (Página de Settings)
1. Ir a `/settings`
2. En la sección "Probador de Notificaciones Push":
   - Click en "Solicitar Permiso" (si no se activó automáticamente)
   - Click en "Verificar Suscripción" para confirmar que está activa
   - Click en "Enviar Notificación Local" para probar notificación inmediata
   - Click en "Enviar Push desde Servidor" para probar notificación desde API

### Opción 3: Desde Código
```typescript
// Enviar notificación local
const registration = await navigator.serviceWorker.ready;
await registration.showNotification('Test', {
  body: 'Mensaje de prueba',
  icon: '/icons/icon-192x192.png'
});

// Enviar notificación push
const subscription = await registration.pushManager.getSubscription();
await fetch('/api/push-send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscription,
    notification: {
      title: 'Test Push',
      body: 'Mensaje desde servidor'
    }
  })
});
```

## Verificación en Dispositivos

### Desktop (Chrome/Edge)
1. Abrir la app
2. Aceptar notificaciones
3. Minimizar el navegador
4. Ir a `/settings` y enviar notificación de prueba
5. Debería aparecer en el sistema operativo

### Android
1. Instalar la PWA desde Chrome
2. Aceptar notificaciones
3. Cerrar completamente la app
4. Enviar notificación desde otro dispositivo o desde `/api/push-send`
5. Debería aparecer en la bandeja de notificaciones

### iOS (Limitado)
- Las notificaciones push tienen soporte limitado en iOS
- Funciona mejor con notificaciones locales
- Requiere iOS 16.4+ para soporte básico

## Configuración de Producción (Opcional)

Para producción, puedes generar tus propias VAPID keys:

### 1. Generar Keys
```bash
npx web-push generate-vapid-keys
```

### 2. Configurar Variables de Entorno
Crear `.env.local`:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=tu_clave_publica
VAPID_PRIVATE_KEY=tu_clave_privada
```

### 3. Reiniciar el servidor
```bash
npm run dev
```

**Nota**: La app ya funciona con keys de desarrollo. Solo necesitas generar tus propias keys si vas a desplegar en producción.

## Casos de Uso Implementados

### 1. Notificación de Bienvenida
Se muestra automáticamente al activar notificaciones por primera vez.

### 2. Notificaciones de Prueba
Disponibles en `/settings` para verificar que todo funciona.

### 3. Listo para Implementar
El sistema está listo para agregar:
- Recordatorios de entrenamiento
- Notificaciones de fin de descanso
- Alertas de logros
- Resúmenes de progreso

## Archivos Creados

```
scripts/generate-icons.js              # Generador de iconos
app/api/push-subscribe/route.ts        # API suscripciones
app/api/push-send/route.ts             # API envío
app/settings/page.tsx                  # Página configuración
components/PushNotificationTester.tsx  # Probador
docs/PUSH_NOTIFICATIONS.md             # Documentación completa
docs/PUSH_NOTIFICATIONS_SETUP.md       # Esta guía
```

## Archivos Modificados

```
package.json                           # Agregado web-push
app/layout.tsx                         # Agregados favicon links
components/Navbar.tsx                  # Agregado enlace Settings
components/ServiceWorkerRegistration.tsx  # Activación automática
```

## Comandos Útiles

```bash
# Generar iconos (ya ejecutado)
npm run generate:icons

# Instalar dependencias (ya ejecutado)
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
npm run start

# Generar VAPID keys (opcional)
npx web-push generate-vapid-keys
```

## Troubleshooting

### Las notificaciones no aparecen
1. Verificar que el permiso esté concedido en configuración del navegador
2. Verificar que el Service Worker esté activo (DevTools → Application → Service Workers)
3. Verificar que haya una suscripción activa (usar el probador en `/settings`)

### Error al enviar notificación push
1. Verificar que la suscripción sea válida
2. Verificar que las VAPID keys estén configuradas correctamente
3. Revisar la consola del servidor para errores

### No se solicita permiso automáticamente
1. Verificar que no se haya denegado previamente
2. Limpiar datos del sitio y recargar
3. Usar el botón manual en `/settings`

## Próximos Pasos

### Integración con Funcionalidades
1. **Timer de Descanso**: Notificar cuando termine el descanso
2. **Recordatorios**: Notificar sobre entrenamientos pendientes
3. **Logros**: Notificar cuando se desbloquee un logro
4. **Progreso**: Enviar resúmenes semanales/mensuales

### Mejoras
1. Guardar suscripciones en Supabase
2. Asociar suscripciones con usuarios
3. Permitir configurar tipos de notificaciones
4. Implementar horarios de "No molestar"

## Recursos

- [Documentación Completa](./PUSH_NOTIFICATIONS.md)
- [PWA Implementation](./PWA_IMPLEMENTATION.md)
- [Icon Generation](./ICON_GENERATION.md)

---

**Estado**: ✅ Producción Ready
**Última actualización**: Febrero 2026
