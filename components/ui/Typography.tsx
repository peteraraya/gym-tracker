'use client';

import React from 'react';

export type TypographyVariant =
  | 'display-4xl'
  | 'display-3xl'
  | 'display-2xl'
  | 'heading-lg'
  | 'heading-md'
  | 'heading-sm'
  | 'body-lg'
  | 'body-base'
  | 'body-sm'
  | 'caption-md'
  | 'caption-sm'
  | 'overline';

interface TypographyProps {
  children: React.ReactNode;
  variant?: TypographyVariant;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

/**
 * Componente de tipografía semántica para GymLogiX.
 * Garantiza consistencia en tamaños, pesos y espaciado de línea en toda la app.
 *
 * Ejemplo:
 *   <Typography variant="heading-lg" as="h3">Mi Título</Typography>
 *   <Typography variant="body-base">Texto de lectura...</Typography>
 */
export function Typography({
  children,
  variant = 'body-base',
  className = '',
  as: Component = 'p',
}: TypographyProps) {
  const variantClassMap: Record<TypographyVariant, string> = {
    'display-4xl': 'text-display-4xl',
    'display-3xl': 'text-display-3xl',
    'display-2xl': 'text-display-2xl',
    'heading-lg': 'text-heading-lg',
    'heading-md': 'text-heading-md',
    'heading-sm': 'text-heading-sm',
    'body-lg': 'text-body-lg',
    'body-base': 'text-body-base',
    'body-sm': 'text-body-sm',
    'caption-md': 'text-caption-md',
    'caption-sm': 'text-caption-sm',
    overline: 'text-overline',
  };

  return (
    <Component className={`${variantClassMap[variant]} ${className}`}>
      {children}
    </Component>
  );
}
