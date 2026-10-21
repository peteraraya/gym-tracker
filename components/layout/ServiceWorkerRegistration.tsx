'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from '@/context/LocaleContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { RefreshCw } from '@/components/icons/lucide';

export function ServiceWorkerRegistration() {
  const t = useTranslations('pwa');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const newWorkerRef = useRef<ServiceWorker | null>(null);
  const [showConnectivityBanner, setShowConnectivityBanner] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let disposed = false;
    // Registrar Service Worker
    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // Verificar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (
              !disposed &&
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              newWorkerRef.current = newWorker;
              setShowUpdateModal(true);
            }
          });
        });
      } catch (error) {
        if (!disposed)
          console.error('[PWA] Service Worker registration failed:', error);
      }
    };

    registerServiceWorker();

    const handleOnline = () => {
      setIsOnline(true);
      setShowConnectivityBanner(false);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          const regWithSync = registration as ServiceWorkerRegistration & {
            sync?: {
              register: (tag: string) => Promise<void>;
            };
          };
          if (regWithSync.sync && typeof regWithSync.sync.register === 'function') {
            regWithSync.sync
              .register('sync-workout-data')
              .catch((error) => {
                console.error(
                  '[PWA] Background sync registration failed:',
                  error
                );
              });
          }
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowConnectivityBanner(true);
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
      newWorker.postMessage({ type: 'SKIP_WAITING' });
    } catch (e) {
      console.error('[PWA] Error sending SKIP_WAITING message:', e);
    }
    setShowUpdateModal(false);
    window.location.reload();
  };

  const cancelUpdate = () => {
    newWorkerRef.current = null;
    setShowUpdateModal(false);
  };

  const dismissConnectivityBanner = () => {
    setShowConnectivityBanner(false);
  };

  return (
    <>
      {/* Banner de conectividad */}
      {!isOnline && showConnectivityBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 px-4 py-2 bg-brand-600 text-white text-center text-xs font-medium shadow-lg backdrop-blur-sm">
          📱 Sin conexión - Modo offline activado
          <button
            onClick={dismissConnectivityBanner}
            className="ml-2 hover:underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Modal de actualización */}
      <Modal
        isOpen={showUpdateModal}
        onClose={cancelUpdate}
        title={t('updateTitle')}
        contentClassName="premium-card premium-card-hover"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-brand-500" />
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              {t('updatePrompt')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={cancelUpdate}
              variant="ghost"
              className="flex-1 min-h-[44px]"
            >
              {t('later')}
            </Button>
            <Button
              onClick={applyUpdate}
              variant="primary"
              className="flex-1 min-h-[44px]"
            >
              {t('update')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
