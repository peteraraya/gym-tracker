'use client';

import React, { useEffect, useState, useRef } from 'react';

interface RestNotificationProps {
  show: boolean;
  message: string;
  onClose?: () => void;
  duration?: number; // milisegundos
}

/**
 * Notificación visual para cuando el descanso termina
 * Se usa como fallback si las notificaciones del navegador están desactivadas
 */
export const RestNotification: React.FC<RestNotificationProps> = ({
  show,
  message,
  onClose,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    let mountTimer: ReturnType<typeof setTimeout> | undefined;
    let afterHideTimer: ReturnType<typeof setTimeout> | undefined;

    if (show) {
      // schedule state update to avoid synchronous setState inside effect
      mountTimer = setTimeout(() => setIsVisible(true), 0);

      const timer = setTimeout(() => {
        setIsVisible(false);
        afterHideTimer = setTimeout(() => {
          onCloseRef.current?.();
        }, 300); // Esperar a que termine la animación
      }, duration);

      return () => {
        clearTimeout(mountTimer);
        clearTimeout(timer);
        clearTimeout(afterHideTimer);
      };
    } else {
      const t = setTimeout(() => setIsVisible(false), 0);
      return () => clearTimeout(t);
    }
  }, [show, duration]);

  if (!show && !isVisible) return null;

  return (
    <div
      className={`fixed top-20 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-linear-to-r from-green-500 to-emerald-500 rounded-lg shadow-2xl p-6 border-2 border-green-300">
        <div className="flex items-start gap-3">
          <div className="shrink-0 text-4xl animate-bounce">
            ⏰
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold text-lg mb-1">
              ¡Descanso Terminado!
            </h4>
            <p className="text-green-50 text-sm">
              {message}
            </p>
          </div>
          {onClose && (
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onCloseRef.current?.(), 300);
              }}
              className="shrink-0 text-white hover:text-green-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
