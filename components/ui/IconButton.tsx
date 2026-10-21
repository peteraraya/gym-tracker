'use client';

import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Texto descriptivo para lectores de pantalla (requerido) */
  'aria-label': string;
  /** Ícono a renderizar (ReactNode) */
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

/**
 * Botón de ícono accesible.
 *
 * Siempre requiere `aria-label` para que los lectores de pantalla
 * puedan describir la acción del botón.
 *
 * Ejemplo:
 *   <IconButton aria-label="Cerrar modal" onClick={onClose}>
 *     <X className="w-5 h-5" />
 *   </IconButton>
 */
export function IconButton({
  'aria-label': ariaLabel,
  icon,
  size = 'md',
  variant = 'ghost',
  className = '',
  ...props
}: IconButtonProps) {
  const sizes = {
    sm: 'p-1.5 w-8 h-8 text-sm',
    md: 'p-2 w-10 h-10 text-base',
    lg: 'p-2.5 w-12 h-12 text-lg',
  };

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-600',
    ghost: 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800',
    danger: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
}
