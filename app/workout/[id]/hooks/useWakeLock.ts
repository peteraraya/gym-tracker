import { useEffect, useRef, useState } from 'react';

/**
 * Hook para mantener la pantalla activa durante el entrenamiento
 * Usa la Wake Lock API cuando está disponible
 */
export function useWakeLock() {
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    // Verificar si Wake Lock API está disponible
    if ('wakeLock' in navigator) {
      setIsSupported(true);
    }
  }, []);

  const requestWakeLock = async () => {
    if (!isSupported) {
      return false;
    }

    try {
      // Solicitar wake lock
      wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      setIsActive(true);

      // Listener para cuando se libera el wake lock (ej: cambio de pestaña)
      wakeLockRef.current.addEventListener('release', () => {
        setIsActive(false);
      });

      return true;
    } catch (err: any) {
      console.error('[WakeLock] Error al activar:', err.message);
      setIsActive(false);
      return false;
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setIsActive(false);
        console.log('[WakeLock] Liberado manualmente');
      } catch (err) {
        console.error('[WakeLock] Error al liberar:', err);
      }
    }
  };

  // Re-adquirir wake lock cuando la página vuelve a ser visible
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isActive && !wakeLockRef.current) {
        console.log('[WakeLock] Página visible de nuevo, re-activando...');
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, []);

  return {
    isSupported,
    isActive,
    requestWakeLock,
    releaseWakeLock,
  };
}
