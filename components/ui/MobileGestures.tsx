'use client';

import React, { useEffect, useCallback } from 'react';

interface MobileGesturesProps {
  /** Contenido hijo del componente */
  children: React.ReactNode;
  /** Prevenir selección de texto en elementos interactivos */
  preventTextSelection?: boolean;
  /** Prevenir pull-to-refresh en iOS Safari */
  preventPullToRefresh?: boolean;
  /** Prevenir doble tap zoom */
  preventDoubleTapZoom?: boolean;
  /** Habilitar retroalimentación háptica en touch */
  enableHapticFeedback?: boolean;
}

/**
 * Componente wrapper para optimizar gestos móviles nativos.
 * Previene comportamientos del navegador que interfieren con la experiencia
 * de app nativa en dispositivos móviles.
 */
export function MobileGestures({
  children,
  preventTextSelection = true,
  preventPullToRefresh = true,
  preventDoubleTapZoom = true,
  enableHapticFeedback = false,
}: MobileGesturesProps) {
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (preventDoubleTapZoom && e.touches.length === 2) {
      e.preventDefault();
    }
  }, [preventDoubleTapZoom]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (preventPullToRefresh) {
      // Prevenir scroll en el body para evitar pull-to-refresh
      if (e.scale !== 1) {
        e.preventDefault();
      }
    }
  }, [preventPullToRefresh]);

  useEffect(() => {
    if (preventTextSelection) {
      const style = document.createElement('style');
      style.textContent = `
        * {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent;
        }
        input, textarea, select, [contenteditable="true"] {
          -webkit-user-select: auto;
          -moz-user-select: auto;
          -ms-user-select: auto;
          user-select: auto;
        }
      `;
      document.head.appendChild(style);
      return () => document.head.removeChild(style);
    }
  }, [preventTextSelection]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      style={{ touchAction: 'manipulation' }}
    >
      {children}
    </div>
  );
}

/**
 * Hook para detectar estado de conectividad y notificar cambios.
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}