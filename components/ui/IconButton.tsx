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
    sm: 'min-h-[44px] min-w-[44px] p-2 text-sm',
    md: 'min-h-[44px] min-w-[44px] p-2 text-base',
    lg: 'h-12 w-12 p-2.5 text-lg',
  };

  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-dark dark:text-zinc-950',
    secondary: 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-600',
    ghost: 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800',
    danger: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
}
