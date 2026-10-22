'use client';

import { useCallback, useRef, useEffect } from 'react';

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const isSupportedRef = useRef(false);

  useEffect(() => {
    isSupportedRef.current = 'wakeLock' in navigator;
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!isSupportedRef.current || wakeLockRef.current) return;

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      wakeLockRef.current.addEventListener('release', () => {
        wakeLockRef.current = null;
      });
      console.debug('[WakeLock] Activated');
    } catch (err) {
      console.debug('[WakeLock] Failed:', err);
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (!wakeLockRef.current) return;

    try {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      console.debug('[WakeLock] Released');
    } catch (err) {
      console.debug('[WakeLock] Release failed:', err);
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !wakeLockRef.current) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [requestWakeLock]);

  return { requestWakeLock, releaseWakeLock, isSupported: isSupportedRef.current };
}