/**
 * Hook para detectar el estado de conexión a internet
 * Útil para mostrar indicadores visuales y deshabilitar acciones cuando no hay conexión
 */

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { getStorageStatus } from '@/lib/infrastructure/storage/storage';
import { isDatabaseEnabled } from '@/lib/infrastructure/storage/storageConfig';

export interface ConnectionStatus {
  isOnline: boolean;
  isSupabaseConnected: boolean;
  isLocalMode: boolean;
  hasStorageError: boolean;
  lastChecked: Date | null;
}

function subscribeToNetworkStatus(onChange: () => void): () => void {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

function getNetworkStatus(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}

function getInitialStatus(): ConnectionStatus {
  const storageStatus = getStorageStatus();
  const isLocalMode = !isDatabaseEnabled();
  const hasStorageError = storageStatus.hasError;

  return {
    isOnline: getNetworkStatus(),
    isSupabaseConnected:
      !isLocalMode &&
      storageStatus.mode === 'supabase' &&
      !hasStorageError &&
      storageStatus.hasVerifiedConnection,
    isLocalMode,
    hasStorageError,
    lastChecked: null,
  };
}

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>(getInitialStatus);
  const isOnline = useSyncExternalStore(subscribeToNetworkStatus, getNetworkStatus, () => true);

  const refreshStorageStatus = useCallback(() => {
    const storageStatus = getStorageStatus();
    const localMode = !isDatabaseEnabled();
    const hasStorageError = storageStatus.hasError;
    const isSupabaseConnected =
      !localMode &&
      storageStatus.mode === 'supabase' &&
      !hasStorageError &&
      storageStatus.hasVerifiedConnection;

    setStatus(prev => ({
      ...prev,
      isSupabaseConnected,
      isLocalMode: localMode,
      hasStorageError,
      lastChecked: new Date(),
    }));

    return isSupabaseConnected;
  }, []);

  useEffect(() => {
    const handleOnline = () => refreshStorageStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('gym-logix:storage-status', refreshStorageStatus);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('gym-logix:storage-status', refreshStorageStatus);
    };
  }, [refreshStorageStatus]);

  return {
    ...status,
    isOnline,
    refreshStorageStatus,
  };
}
