'use client';

import { useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from '@/context/LocaleContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { RefreshCw } from '@/components/icons/lucide';
import * as storageService from '@/lib/infrastructure/storage/storage';
import { queryKeys } from '@/lib/infrastructure/react-query/queryKeys';

export function ServiceWorkerRegistration() {
  const t = useTranslations('pwa');
  const queryClient = useQueryClient();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const newWorkerRef = useRef<ServiceWorker | null>(null);
  const [showConnectivityBanner, setShowConnectivityBanner] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'complete' | 'error'>('idle');
  const [pendingCount, setPendingCount] = useState(0);
  const [syncedCount, setSyncedCount] = useState(0);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let disposed = false;
    const registerServiceWorker = async () => {
      if (!('serviceWorker' in navigator)) return;
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

    void registerServiceWorker();

    const synchronizePendingData = async () => {
      if (!navigator.onLine) return;
      try {
        const result = await storageService.syncPendingLocalData();
        if (disposed) return;
        setPendingCount(result.pending);
        setSyncedCount(result.synced);
        setSyncState(
          result.errors > 0 || result.pending > 0
            ? 'error'
            : result.synced > 0
              ? 'complete'
              : 'idle',
        );
        if (result.synced > 0 && result.pending === 0 && result.errors === 0) {
          if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
          successTimeoutRef.current = setTimeout(() => setSyncState('idle'), 4000);
        }
        if (result.synced > 0) {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.routines.all }),
            queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all }),
          ]);
        }
      } catch (error) {
        console.error('[PWA] Could not synchronize offline changes:', error);
        if (!disposed) setSyncState('error');
      }
    };

    const handleOnline = () => {
      setIsOnline(true);
      setShowConnectivityBanner(false);
      void synchronizePendingData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowConnectivityBanner(true);
    };

    const handleSyncStatus = (event: Event) => {
      const detail = (event as CustomEvent<{
        state: 'syncing' | 'complete' | 'error';
        pending: number;
        synced: number;
      }>).detail;
      if (!detail) return;
      setPendingCount(detail.pending);
      setSyncedCount(detail.synced);
      setSyncState(detail.state);
      if (detail.state === 'complete' && detail.synced > 0) {
        if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
        successTimeoutRef.current = setTimeout(() => setSyncState('idle'), 4000);
      }
    };

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_REQUESTED') {
        void synchronizePendingData();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('gym-logix:sync-status', handleSyncStatus);
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);
    if (navigator.onLine) void synchronizePendingData();
    return () => {
      disposed = true;
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('gym-logix:sync-status', handleSyncStatus);
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [queryClient]);

  const applyUpdate = () => {
    const newWorker = newWorkerRef.current;
    if (!newWorker) return;
    try {
      navigator.serviceWorker.addEventListener(
        'controllerchange',
        () => window.location.reload(),
        { once: true },
      );
      newWorker.postMessage({ type: 'SKIP_WAITING' });
    } catch (e) {
      console.error('[PWA] Error sending SKIP_WAITING message:', e);
      return;
    }
    setShowUpdateModal(false);
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
      {((!isOnline && showConnectivityBanner) || (isOnline && (syncState === 'error' || syncState === 'syncing' || (syncState === 'complete' && syncedCount > 0)))) && (
        <div className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-xs font-medium shadow-lg backdrop-blur-sm ${
          syncState === 'error'
            ? 'bg-amber-700 text-white'
            : syncState === 'complete'
              ? 'bg-emerald-700 text-white'
              : 'bg-brand-600 text-white'
        }`}>
          <span role={syncState === 'error' ? 'alert' : 'status'} aria-live="polite">
            {!isOnline
              ? t('offlineStatus')
              : syncState === 'syncing'
                ? t('syncingStatus')
                : syncState === 'complete'
                  ? t('syncCompleteStatus').replace('{count}', String(syncedCount))
                  : t('syncErrorStatus').replace('{count}', String(pendingCount))}
          </span>
          {!isOnline && (
            <button onClick={dismissConnectivityBanner} className="ml-2 hover:underline">
              {t('dismissOffline')}
            </button>
          )}
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
