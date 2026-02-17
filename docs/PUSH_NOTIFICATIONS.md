# Push Notifications - Gym Tracker

## Estado: ✅ ACTIVADO POR DEFECTO

Las notificaciones push están completamente implementadas y se activan automáticamente.

## Características

### Activación Automática
- Las notificaciones se solicitan automáticamente 3 segundos después de cargar la app
- No requiere acción del usuario (excepto aceptar el permiso)
- Notificación de bienvenida al activar por primera vez
- Suscripción persistente entre sesiones

### Soporte Multiplataforma
- ✅ Android (Chrome, Edge, Firefox)
- ✅ Desktop (Chrome, Edge, Firefox, Safari)
- ⚠️ iOS (soporte limitado, requiere iOS 16.4+)

### Tipos de Notificaciones
1. **Notificaciones Locales**: Se muestran inmediatamente desde el cliente
2. **Push Notifications**: Enviadas desde el servidor, funcionan con la app cerrada

## Componentes

### ServiceWorkerRegistration.tsx
Maneja el registro del Service Worker y la suscripción a notificaciones:
- Solicita permiso automáticamente después de 3 segundos
- Crea suscripción push con VAPID keys
- Envía suscripción al servidor
- Muestra notificación de bienvenida

### PushNotificationTester.tsx
Componente de prueba disponible en `/settings`:
- Verificar estado del permiso
- Solicitar permiso manualmente
- Verificar suscripción activa
- Enviar notificación local de prueba
- Enviar notificación push desde servidor

### Service Worker (sw.js)
Maneja las notificaciones push:
- Recibe notificaciones del servidor
- Muestra notificaciones con iconos y acciones
- Maneja clicks en notificaciones
- Abre la app en la URL correcta

## API Endpoints

### POST /api/push-subscribe
Guarda suscripciones de usuarios.

**Request:**
```json
{
  "endpoint": "https://fcm.googleapis.com/...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription saved successfully"
}
```

### POST /api/push-send
Envía notificación push a un usuario específico.

**Request:**
```json
{
  "subscription": {
    "endpoint": "...",
    "keys": { ... }
  },
  "notification": {
    "title": "Título",
    "body": "Mensaje",
    "tag": "mi-tag",
    "data": { "url": "/ruta" }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent successfully"
}
```

### GET /api/push-send
Envía notificación a todos los usuarios suscritos (para testing).

**Response:**
```json
{
  "success": true,
  "sent": 10,
  "failed": 0,
  "total": 10
}
```

## Uso en Código

### Enviar Notificación Local
```typescript
const registration = await navigator.serviceWorker.ready;

await registration.showNotification('Título', {
  body: 'Mensaje',
  icon: '/icons/icon-192x192.png',
  badge: '/icons/badge-72x72.png',
  vibrate: [200, 100, 200],
  tag: 'mi-tag',
  actions: [
    { action: 'open', title: 'Abrir' },
    { action: 'close', title: 'Cerrar' }
  ]
});
```

### Enviar Notificación Push
```typescript
const registration = await navigator.serviceWorker.ready;
const subscription = await registration.pushManager.getSubscription();

await fetch('/api/push-send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscription,
    notification: {
      title: '¡Hora de entrenar! 💪',
      body: 'No olvides completar tu rutina de hoy',
      tag: 'workout-reminder',
      data: { url: '/routines' }
    }
  })
});
```

## Casos de Uso

### 1. Recordatorio de Entrenamiento
```typescript
{
  title: '¡Hora de entrenar! 💪',
  body: 'No olvides completar tu rutina de hoy',
  tag: 'workout-reminder',
  data: { url: '/routines' },
  requireInteraction: false
}
```

### 2. Fin del Descanso
```typescript
{
  title: '⏰ Descanso terminado',
  body: 'Es hora de continuar con tu siguiente serie',
  tag: 'rest-timer',
  requireInteraction: true,
  vibrate: [200, 100, 200, 100, 200]
}
```

### 3. Logro Desbloqueado
```typescript
{
  title: '🏆 ¡Nuevo logro!',
  body: 'Has completado 10 entrenamientos este mes',
  tag: 'achievement',
  data: { url: '/achievements' }
}
```

### 4. Resumen Semanal
```typescript
{
  title: '📊 Resumen Semanal',
  body: 'Has entrenado 4 veces esta semana. ¡Sigue así!',
  tag: 'weekly-summary',
  data: { url: '/progress' }
}
```

## Testing

### En Desarrollo
1. Abrir la app en `http://localhost:3000`
2. Esperar 3 segundos
3. Aceptar el permiso de notificaciones
4. Verificar que aparezca la notificación de bienvenida

### Probador de Notificaciones
1. Ir a `/settings`
2. Usar el componente "Probador de Notificaciones Push"
3. Probar notificaciones locales y push

### Chrome DevTools
1. DevTools → Application → Service Workers
2. Verificar que el SW esté activo
3. Application → Push Messaging
4. Verificar que haya una suscripción activa

### Dispositivos Reales

#### Android
1. Instalar la PWA desde Chrome
2. Aceptar notificaciones
3. Cerrar completamente la app
4. Enviar notificación desde `/api/push-send`
5. Verificar que aparezca en la bandeja de notificaciones

#### Desktop
1. Instalar la PWA o usar en navegador
2. Aceptar notificaciones
3. Minimizar la app
4. Enviar notificación de prueba
5. Verificar que aparezca en el sistema

#### iOS (Limitado)
1. Agregar a pantalla de inicio desde Safari
2. Las notificaciones push tienen soporte limitado
3. Usar notificaciones locales como alternativa

## Configuración de Producción

### 1. Generar VAPID Keys
```bash
npm install -g web-push
npx web-push generate-vapid-keys
```

### 2. Configurar Variables de Entorno
Crear `.env.local`:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=tu_clave_publica_aqui
VAPID_PRIVATE_KEY=tu_clave_privada_aqui
```

### 3. Actualizar ServiceWorkerRegistration.tsx
La clave pública ya está configurada para usar la variable de entorno.

### 4. Guardar Suscripciones en Base de Datos
Actualizar `/api/push-subscribe/route.ts` para guardar en Supabase:
```typescript
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const subscription = await request.json();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  await supabase.from('push_subscriptions').upsert({
    user_id: user?.id,
    endpoint: subscription.endpoint,
    keys: subscription.keys,
    updated_at: new Date().toISOString()
  });
  
  return NextResponse.json({ success: true });
}
```

## Limitaciones

### iOS/Safari
- Soporte limitado para push notifications en PWAs
- Requiere iOS 16.4+ para soporte básico
- Las notificaciones pueden no funcionar con la app cerrada
- Alternativa: usar notificaciones locales

### Navegadores
- Chrome/Edge: Soporte completo ✅
- Firefox: Soporte completo en desktop, limitado en móvil ✅
- Safari: Soporte limitado, requiere configuración adicional ⚠️
- Opera: Soporte completo ✅

### Permisos
- El usuario puede denegar el permiso
- Si se deniega, no se puede volver a solicitar automáticamente
- El usuario debe ir a configuración del navegador para cambiar

## Mejoras Futuras

### 1. Notificaciones Inteligentes
- Recordatorios basados en horarios de entrenamiento del usuario
- Notificaciones de progreso personalizadas
- Sugerencias de ejercicios basadas en historial

### 2. Configuración Avanzada
- Permitir activar/desactivar tipos específicos de notificaciones
- Configurar horarios de "No molestar"
- Frecuencia de recordatorios personalizable

### 3. Analytics
- Tracking de tasa de apertura
- Efectividad de diferentes tipos de mensajes
- Optimización de horarios de envío

### 4. Notificaciones Programadas
- Recordatorios diarios/semanales
- Notificaciones basadas en eventos (fin de descanso, nuevo PR, etc.)
- Resúmenes periódicos de progreso

## Recursos

- [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [web-push library](https://github.com/web-push-libs/web-push)
- [VAPID Protocol](https://datatracker.ietf.org/doc/html/rfc8292)

---

**Última actualización**: Febrero 2026
**Estado**: Producción Ready ✅
