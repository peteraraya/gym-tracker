/**
 * Hook para detectar el estado de conexión a internet
 * Útil para mostrar indicadores visuales y deshabilitar acciones cuando no hay conexión
 */

import { useState, useEffect } from 'react';

export interface ConnectionStatus {
  isOnline: boolean;
  isSupabaseConnected: boolean;
  lastChecked: Date | null;
}

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSupabaseConnected: true, // Asumimos conectado hasta que falle
    lastChecked: null,
  });

  useEffect(() => {
    // Detectar cambios en la conexión del navegador
    const handleOnline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: true,
        lastChecked: new Date(),
      }));
    };

    const handleOffline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        isSupabaseConnected: false,
        lastChecked: new Date(),
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar estado inicial
    setStatus(prev => ({
      ...prev,
      isOnline: navigator.onLine,
      lastChecked: new Date(),
    }));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Función para verificar conexión a Supabase
  const checkSupabaseConnection = async (): Promise<boolean> => {
    try {
      const { getStorageStatus } = await import('@/lib/storage/storage');
      const storageStatus = getStorageStatus();
      
      const isConnected = storageStatus.mode === 'supabase' && !storageStatus.hasError;
      
      setStatus(prev => ({
        ...prev,
        isSupabaseConnected: isConnected,
        lastChecked: new Date(),
      }));
      
      return isConnected;
    } catch (err) {
      console.warn('[useConnectionStatus] Error checking Supabase connection:', err);
      setStatus(prev => ({
        ...prev,
        isSupabaseConnected: false,
        lastChecked: new Date(),
      }));
      return false;
    }
  };

  return {
    ...status,
    checkSupabaseConnection,
  };
}
