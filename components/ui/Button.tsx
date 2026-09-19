'use client';

import React from 'react';
import { triggerHaptic } from '@/lib/utils/haptics';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gradient' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
  center?: boolean; // opt-in: center button horizontally
  block?: boolean;  // opt-in: full width
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  loading = false,
  center = false,
  block = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm hover:shadow-md whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900';
  
  const variants = {
    // Acción principal: azul moderno (cobalt → eléctrico)
    primary: 'bg-linear-to-r from-blue-700 via-blue-600 to-blue-500 text-white bg-[length:200%_auto] hover:bg-right shadow-lg shadow-blue-700/30',
    // Secundario: gris neutro en degradado (y versión dark)
    secondary: 'bg-linear-to-r from-[#f4f4f5] via-[#e4e4e7] to-[#d4d4d8] dark:from-[#3f3f46] dark:via-[#262626] dark:to-[#131313] text-zinc-900 dark:text-zinc-100 border border-transparent dark:border-transparent bg-[length:200%_auto] hover:bg-right shadow-sm',
    // Error: degradado rojo profesional (incluye dark)
    danger: 'bg-linear-to-r from-[#ff4d5e] via-[#e11d48] to-[#b91c1c] dark:from-[#b91c1c] dark:via-[#991b1b] dark:to-[#7f1d1d] text-white bg-[length:200%_auto] hover:bg-right shadow-lg shadow-red-500/20',
    // Información: azul eléctrico
    info: 'bg-linear-to-r from-blue-600 via-blue-500 to-blue-400 text-white bg-[length:200%_auto] hover:bg-right shadow-lg shadow-blue-600/30',
    ghost: 'bg-transparent text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 shadow-none',
    gradient: 'bg-linear-to-r from-indigo-600 via-blue-500 to-blue-400 text-white bg-[length:200%_auto] hover:bg-right shadow-lg shadow-blue-700/30',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[44px]',
    md: 'px-6 py-2.5 text-base min-h-[48px]',
    lg: 'px-8 py-3.5 text-lg min-h-[56px]',
  };

  const centerClass = center ? 'block mx-auto' : '';
  const blockClass = block ? 'w-full' : '';

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!props.disabled && !loading) {
      // Diferenciar la vibración según la importancia del botón
      if (variant === 'primary' || variant === 'danger' || variant === 'gradient') {
        triggerHaptic('medium');
      } else {
        triggerHaptic('light');
      }
    }
    if (props.onPointerDown) {
      props.onPointerDown(e);
    }
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${centerClass} ${blockClass} ${className}`}
      aria-busy={loading}
      disabled={props.disabled || loading}
      {...props}
      onPointerDown={handlePointerDown}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
