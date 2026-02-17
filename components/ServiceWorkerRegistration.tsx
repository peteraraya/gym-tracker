'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Registrar Service Worker
    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('[PWA] Service Worker registered:', registration.scope);

        // Verificar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Hay una nueva versión disponible
              console.log('[PWA] New version available');
              
              // Mostrar notificación al usuario
              if (confirm('Hay una nueva versión disponible. ¿Actualizar ahora?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        });

        // Solicitar permiso para notificaciones automáticamente
        if ('Notification' in window) {
          // Intentar activar notificaciones automáticamente después de 3 segundos
          setTimeout(async () => {
            try {
              const permission = await Notification.requestPermission();
              console.log('[PWA] Notification permission:', permission);
              
              if (permission === 'granted') {
                // Suscribirse a push notifications
                await subscribeToPushNotifications(registration);
                
                // Mostrar notificación de bienvenida
                await showWelcomeNotification(registration);
              } else if (permission === 'denied') {
                console.log('[PWA] Notification permission denied by user');
              }
            } catch (error) {
              console.error('[PWA] Error requesting notification permission:', error);
            }
          }, 3000);
        }

      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
      }
    };

    registerServiceWorker();

    // Detectar cuando vuelve la conexión
    window.addEventListener('online', () => {
      console.log('[PWA] Back online');
      // Intentar sincronizar datos pendientes
      if ('serviceWorker' in navigator && 'sync' in (ServiceWorkerRegistration.prototype as any)) {
        navigator.serviceWorker.ready.then((registration: any) => {
          return registration.sync.register('sync-workouts');
        }).catch((error) => {
          console.error('[PWA] Background sync registration failed:', error);
        });
      }
    });

    window.addEventListener('offline', () => {
      console.log('[PWA] Gone offline');
    });

  }, []);

  return null;
}

async function subscribeToPushNotifications(registration: ServiceWorkerRegistration) {
  try {
    // Verificar si ya está suscrito
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('[PWA] Already subscribed to push notifications');
      // Enviar suscripción existente al servidor
      await sendSubscriptionToServer(existingSubscription);
      return;
    }

    // VAPID public key
    // En producción, genera tu propia clave con: npx web-push generate-vapid-keys
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    
    if (!vapidPublicKey) {
      console.warn('[PWA] VAPID public key not configured. Push notifications will use browser default.');
      // Suscribirse sin VAPID key (funciona para notificaciones locales)
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true
      });
      
      console.log('[PWA] Push subscription created (without VAPID):', subscription);
      await sendSubscriptionToServer(subscription);
      return;
    }
    
    // Suscribirse con VAPID key
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as any
    });

    console.log('[PWA] Push subscription created:', subscription);

    // Enviar la suscripción al servidor
    await sendSubscriptionToServer(subscription);

  } catch (error) {
    console.error('[PWA] Error subscribing to push notifications:', error);
  }
}

async function sendSubscriptionToServer(subscription: PushSubscription) {
  try {
    const response = await fetch('/api/push-subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });

    if (response.ok) {
      console.log('[PWA] Subscription sent to server successfully');
    } else {
      console.error('[PWA] Failed to send subscription to server');
    }
  } catch (error) {
    console.error('[PWA] Error sending subscription to server:', error);
  }
}

async function showWelcomeNotification(registration: ServiceWorkerRegistration) {
  try {
    const options: NotificationOptions & {
      vibrate?: number[];
      actions?: { action: string; title: string; icon?: string }[];
      requireInteraction?: boolean;
    } = {
      body: 'Las notificaciones están activadas. Te avisaremos sobre tus entrenamientos.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [200, 100, 200],
      tag: 'welcome',
      requireInteraction: false,
      actions: [
        {
          action: 'start',
          title: 'Comenzar'
        }
      ]
    };

    await registration.showNotification('¡Bienvenido a Gym Tracker! 💪', options);
  } catch (error) {
    console.error('[PWA] Error showing welcome notification:', error);
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
