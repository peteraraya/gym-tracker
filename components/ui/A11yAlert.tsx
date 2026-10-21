'use client';

import React from 'react';

export interface A11yAlertProps {
  /** Mensaje a anunciar a lectores de pantalla */
  message?: string | null;
  /** Prioridad del anuncio: 'polite' (no interrumpe) o 'assertive' (interrumpe) */
  priority?: 'polite' | 'assertive' | 'off';
  /** ID opcional para forzar re-anuncio cuando el mensaje se repite */
  announceId?: string | number;
}

/**
 * Componente de región live (aria-live) para anuncios a lectores de pantalla.
 *
 * Úsalo para anunciar cambios de estado dinámicos sin mover el foco del usuario:
 * - Toasts (éxito, error, advertencia)
 * - Cambios de página en SPA
 * - Confirmaciones de acción (ej. "Rutina guardada")
 *
 * Ejemplo:
 *   <A11yAlert message={toastMessage} announceId={toastId} />
 *
 * El componente utiliza aria-live="polite" por defecto (no interrumpe al usuario).
 * Para anuncios urgentes, usa priority="assertive".
 */
export function A11yAlert({
  message,
  priority = 'polite',
  announceId,
}: A11yAlertProps) {
  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="absolute w-1 h-1 p-0 overflow-hidden hidden"
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
      key={announceId ?? message}
    >
      {message}
    </div>
  );
}
