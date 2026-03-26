/**
 * Utilidades para feedback háptico
 * Compatible con Capacitor y Web Vibration API
 */

import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const haptics = {
  /**
   * Vibración ligera (completar serie, marcar checkbox)
   */
  light: async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    } catch (e) {
      console.debug('Haptics not available', e);
    }
  },

  /**
   * Vibración media (iniciar serie, countdown)
   */
  medium: async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } else if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
    } catch (e) {
      console.debug('Haptics not available', e);
    }
  },

  /**
   * Vibración fuerte (completar ejercicio, finalizar entrenamiento)
   */
  heavy: async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } else if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } catch (e) {
      console.debug('Haptics not available', e);
    }
  },

  /**
   * Vibración de éxito (logro desbloqueado, PR)
   */
  success: async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.notification({ type: 'SUCCESS' });
      } else if ('vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    } catch (e) {
      console.debug('Haptics not available', e);
    }
  },

  /**
   * Vibración de advertencia (error, validación)
   */
  warning: async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.notification({ type: 'WARNING' });
      } else if ('vibrate' in navigator) {
        navigator.vibrate([50, 100, 50]);
      }
    } catch (e) {
      console.debug('Haptics not available', e);
    }
  },

  /**
   * Vibración de error
   */
  error: async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.notification({ type: 'ERROR' });
      } else if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch (e) {
      console.debug('Haptics not available', e);
    }
  },

  /**
   * Patrón personalizado de vibración
   */
  pattern: async (pattern: number[]) => {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (e) {
      console.debug('Haptics not available', e);
    }
  }
};
