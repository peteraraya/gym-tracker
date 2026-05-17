'use client';

import { useEffect, useState, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';

export function ServiceWorkerRegistration() {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const newWorkerRef = useRef<ServiceWorker | null>(null);

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

              // Guardar referencia al nuevo worker y mostrar modal para actualizar
              newWorkerRef.current = newWorker;
              setShowUpdateModal(true);
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

                // Nota: no mostramos notificación de bienvenida por defecto
                // para evitar que otras notificaciones (p.ej. temporizadores)
                // queden sobreescritas o mezcladas. Si quieres activar la
                // notificación de bienvenida, setea `localStorage.setItem('pwa_show_welcome','true')`.
                try {
                  const showWelcome = localStorage.getItem('pwa_show_welcome') === 'true';
                  if (showWelcome) {
                    await showWelcomeNotification(registration);
                  }
                } catch (e) {
                  // Si localStorage no está disponible, simplemente no mostrar bienvenida
                }
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
      // Intentar sincronizar datos pendientes (si background sync está disponible)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          const regWithSync = registration as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } };
          if (regWithSync.sync && typeof regWithSync.sync.register === 'function') {
            regWithSync.sync.register('sync-workouts').catch((error) => {
              console.error('[PWA] Background sync registration failed:', error);
            });
          }
        }).catch((error) => {
          console.error('[PWA] Error waiting for service worker ready:', error);
        });
      }
    });

    window.addEventListener('offline', () => {
      console.log('[PWA] Gone offline');
    });


    return () => {
      // cleanup listeners (if any were added globally earlier)
    };
  }, []);

  const applyUpdate = () => {
    const newWorker = newWorkerRef.current;
    if (!newWorker) return;
    try {
      // ServiceWorker.postMessage acepta cualquier dato; no necesitamos cast
      newWorker.postMessage({ type: 'SKIP_WAITING' });
    } catch (e) {
      console.error('[PWA] Error sending SKIP_WAITING message:', e);
    }
    setShowUpdateModal(false);
    // Al esperar a que el nuevo SW tome control, forzamos recarga.
    window.location.reload();
  };

  const cancelUpdate = () => {
    // Simplemente cerrar modal y mantener la versión actual
    newWorkerRef.current = null;
    setShowUpdateModal(false);
  };

  return (
    <>
      <Modal isOpen={showUpdateModal} onClose={cancelUpdate} title="Nueva versión disponible">
        <p>Hay una nueva versión de la aplicación. ¿Deseas actualizar ahora para usarla?</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={cancelUpdate}
            className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200"
          >
            Cancelar
          </button>
          <button
            onClick={applyUpdate}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Actualizar
          </button>
        </div>
      </Modal>
    </>
  );
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
      console.log('[PWA] VAPID public key not configured. Skipping push notification subscription.');
      // No intentar suscribirse sin VAPID key para evitar errores
      return;
    }
    
    // Suscribirse con VAPID key
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    // Cast a Uint8Array to ArrayBuffer to satisfy TypeScript's DOM types (BufferSource)
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as unknown as ArrayBuffer
    });

    console.log('[PWA] Push subscription created:', subscription);

    // Enviar la suscripción al servidor
    await sendSubscriptionToServer(subscription);

  } catch (error: any) {
    // Manejo silencioso de errores comunes
    if (error?.name === 'AbortError') {
      console.log('[PWA] Push notification subscription aborted (service not available). This is normal if VAPID keys are not configured.');
    } else if (error?.name === 'NotAllowedError') {
      console.log('[PWA] Push notification permission denied by user.');
    } else if (error?.name === 'NotSupportedError') {
      console.log('[PWA] Push notifications not supported in this browser.');
    } else {
      console.log('[PWA] Push notification subscription skipped:', error?.message || 'Unknown error');
    }
    // No lanzar el error para no interrumpir la experiencia del usuario
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
