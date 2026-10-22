'use client';

import React from 'react';
import { triggerHaptic } from '@/lib/shared/utils/haptics';

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
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900';
  
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-dark dark:text-zinc-950',
    secondary: 'border border-border-light bg-surface-alt text-zinc-900 hover:bg-surface dark:text-zinc-100',
    danger: 'bg-red-700 text-white hover:bg-red-800 dark:bg-red-500 dark:text-zinc-950 dark:hover:bg-red-400',
    info: 'bg-brand text-white hover:bg-brand-dark dark:text-zinc-950',
    ghost: 'bg-transparent text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
    gradient: 'bg-brand text-white hover:bg-brand-dark dark:text-zinc-950',
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
