'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

export function useHaptics() {
  const isNative = useRef(Capacitor.isNativePlatform());
  const isAvailable = useRef(false);

  useEffect(() => {
    if (!isNative.current) {
      isAvailable.current = 'vibrate' in navigator;
    } else {
      isAvailable.current = true;
    }
  }, []);

  const haptic = useCallback(async (type: HapticType) => {
    if (!isAvailable.current) return;

    try {
      if (isNative.current) {
        switch (type) {
          case 'light':
            await Haptics.impact({ style: ImpactStyle.Light });
            break;
          case 'medium':
            await Haptics.impact({ style: ImpactStyle.Medium });
            break;
          case 'heavy':
            await Haptics.impact({ style: ImpactStyle.Heavy });
            break;
          case 'success':
            await Haptics.notification({ type: 'success' });
            break;
          case 'warning':
            await Haptics.notification({ type: 'warning' });
            break;
          case 'error':
            await Haptics.notification({ type: 'error' });
            break;
          case 'selection':
            await Haptics.impact({ style: ImpactStyle.Light });
            break;
        }
      } else {
        const patterns: Record<HapticType, number | number[]> = {
          light: 10,
          medium: 20,
          heavy: 50,
          success: [10, 50, 10],
          warning: [20, 50, 20],
          error: [50, 50, 50, 50],
          selection: 5,
        };
        navigator.vibrate(patterns[type]);
      }
    } catch (e) {
      console.debug('Haptic failed:', e);
    }
  }, []);

  return { haptic };
}