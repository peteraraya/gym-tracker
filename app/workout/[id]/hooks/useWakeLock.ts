import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook para mantener la pantalla activa durante el entrenamiento
 * Usa la Wake Lock API cuando está disponible
 */
export function useWakeLock() {
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const wakeLockRef = useRef<any>(null);
  const releaseHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      setIsSupported(true);
    }
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!isSupported || typeof navigator === 'undefined' || !(navigator as any).wakeLock) {
      return false;
    }

    try {
      if (wakeLockRef.current && releaseHandlerRef.current) {
        try {
          wakeLockRef.current.removeEventListener('release', releaseHandlerRef.current);
        } catch (_) {}
      }

      wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      setIsActive(true);

      const onRelease = () => setIsActive(false);
      releaseHandlerRef.current = onRelease;
      wakeLockRef.current.addEventListener('release', onRelease);

      return true;
    } catch (err: any) {
      console.error('[WakeLock] Error al activar:', err?.message ?? err);
      setIsActive(false);
      return false;
    }
  }, [isSupported]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch (err) {
        console.error('[WakeLock] Error al liberar:', err);
      } finally {
        wakeLockRef.current = null;
        setIsActive(false);
        releaseHandlerRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isActive && !wakeLockRef.current) {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, requestWakeLock]);

  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        try {
          wakeLockRef.current.release();
        } catch (_) {}
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
