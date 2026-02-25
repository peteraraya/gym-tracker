/**
 * Hook para manejar el ciclo de vida de la aplicación móvil
 * Detecta cuando la app se pone en segundo plano o vuelve a primer plano
 * Útil para persistir datos críticos antes de que el sistema suspenda la app
 */

import { useEffect } from 'react';

interface AppLifecycleCallbacks {
  onAppStateChange?: (isActive: boolean) => void;
  onPause?: () => void;
  onResume?: () => void;
}

export function useAppLifecycle(callbacks: AppLifecycleCallbacks) {
  useEffect(() => {
    let App: any = null;
    let listeners: any[] = [];

    // Intentar cargar el plugin de Capacitor
    const setupCapacitorListeners = async () => {
      try {
        const { App: CapacitorApp } = await import('@capacitor/app');
        App = CapacitorApp;

        // Listener para cuando la app se pone en segundo plano
        const pauseListener = await App.addListener('pause', () => {
          console.log('[AppLifecycle] App paused (background)');
          callbacks.onPause?.();
          callbacks.onAppStateChange?.(false);
        });

        // Listener para cuando la app vuelve a primer plano
        const resumeListener = await App.addListener('resume', () => {
          console.log('[AppLifecycle] App resumed (foreground)');
          callbacks.onResume?.();
          callbacks.onAppStateChange?.(true);
        });

        listeners = [pauseListener, resumeListener];
        console.log('[AppLifecycle] Capacitor listeners registered');
      } catch (error) {
        console.log('[AppLifecycle] Capacitor not available, using web APIs');
        setupWebListeners();
      }
    };

    // Fallback para web usando Page Visibility API
    const setupWebListeners = () => {
      const handleVisibilityChange = () => {
        const isActive = !document.hidden;
        console.log('[AppLifecycle] Visibility changed:', isActive ? 'visible' : 'hidden');
        
        if (isActive) {
          callbacks.onResume?.();
        } else {
          callbacks.onPause?.();
        }
        callbacks.onAppStateChange?.(isActive);
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      // También escuchar beforeunload para guardar antes de cerrar
      const handleBeforeUnload = () => {
        console.log('[AppLifecycle] Page unloading');
        callbacks.onPause?.();
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      // Cleanup function
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    };

    // Inicializar listeners
    setupCapacitorListeners();

    // Cleanup
    return () => {
      // Remover listeners de Capacitor
      listeners.forEach(listener => {
        if (listener && typeof listener.remove === 'function') {
          listener.remove();
        }
      });
    };
  }, [callbacks]);
}
