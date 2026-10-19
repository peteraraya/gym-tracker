'use client';

import { useEffect, useState, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useTranslations } from '@/context/LocaleContext';

export function ServiceWorkerRegistration() {
  const t = useTranslations('pwa');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const newWorkerRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let disposed = false;
    // Registrar Service Worker
    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        // console.log('[PWA] Service Worker registered:', registration.scope);

        // Verificar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (!disposed && newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Hay una nueva versión disponible
              // console.log('[PWA] New version available');

              // Guardar referencia al nuevo worker y mostrar modal para actualizar
              newWorkerRef.current = newWorker;
              setShowUpdateModal(true);
            }
          });
        });

      } catch (error) {
        if (!disposed) console.error('[PWA] Service Worker registration failed:', error);
      }
    };

    registerServiceWorker();

    const handleOnline = () => {
      // console.log('[PWA] Back online');
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
    };

    const handleOffline = () => {
      console.warn('[PWA] Gone offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      disposed = true;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
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
      <Modal isOpen={showUpdateModal} onClose={cancelUpdate} title={t('updateTitle')}>
        <p>{t('updatePrompt')}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={cancelUpdate}
            className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200"
          >
            {t('cancel')}
          </button>
          <button
            onClick={applyUpdate}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            {t('update')}
          </button>
        </div>
      </Modal>
    </>
  );
}
