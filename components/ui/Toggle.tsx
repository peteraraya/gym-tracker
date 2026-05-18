'use client';

import React from 'react';

interface ToggleProps {
  /** Estado controlado del toggle */
  checked: boolean;
  /** Callback al cambiar estado */
  onChange: (checked: boolean) => void;
  /** Color de fondo cuando está activo. Por defecto: 'bg-blue-600' */
  activeColor?: string;
  /** Desactiva el toggle */
  disabled?: boolean;
  /** Accesibilidad: label descriptivo del switch */
  label?: string;
  className?: string;
}

/**
 * Toggle (switch) accesible reutilizable.
 * Reemplaza el patrón manual `relative inline-flex h-6 w-11 rounded-full` repetido en la app.
 */
export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  activeColor = 'bg-blue-600',
  disabled = false,
  label,
  className = '',
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? activeColor : 'bg-gray-300 dark:bg-gray-600'
      } ${className}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};
