'use client';

import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  className?: string;
  variant?: 'default' | 'error' | 'success' | 'warning' | 'info';
}

/**
 * Componente de estado vacío unificado y profesional para GymLogiX.
 * Proporciona una experiencia consistente cuando no hay datos para mostrar.
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
  className = '',
  variant = 'default',
}: EmptyStateProps) {
  const variantStyles = {
    default: 'text-gray-600 dark:text-gray-400',
    error: 'text-red-600 dark:text-red-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  const iconColors = {
    default: 'text-gray-400 dark:text-gray-500',
    error: 'text-red-500 dark:text-red-400',
    success: 'text-green-500 dark:text-green-400',
    warning: 'text-amber-500 dark:text-amber-400',
    info: 'text-blue-500 dark:text-blue-400',
  };

  const variantBg = {
    default: 'bg-gray-100 dark:bg-gray-800',
    error: 'bg-red-50 dark:bg-red-900/20',
    success: 'bg-green-50 dark:bg-green-900/20',
    warning: 'bg-amber-50 dark:bg-amber-900/20',
    info: 'bg-blue-50 dark:bg-blue-900/20',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 text-center ${className}`}
    >
      {/* Icon container */}
      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
        <div
          className={`w-full h-full rounded-full flex items-center justify-center ${variantBg[variant]}`}
        >
          {icon && (
            <span className={`${variantStyles[variant]} ${iconColors[variant]}`}>
              {icon}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      )}

      {/* Actions */}
      {(actionLabel || onAction) && (
        <div className="flex items-center justify-center gap-3">
          {actionLabel && (
            <Button
              variant="primary"
              onClick={onAction}
              className="px-6 py-3 font-medium shadow-sm hover:shadow-md"
            >
              {actionIcon && <span className="mr-2">{actionIcon}</span>}
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
