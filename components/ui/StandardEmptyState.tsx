'use client';

import { ReactNode } from 'react';
import { Button } from './Button';

/**
 * Componente unificado de estado vacío para GymLogiX.
 * Combina la simplicidad de EmptyState con las acciones de EmptyStateCard.
 *
 * Uso recomendado en todas las páginas que puedan mostrar contenido vacío.
 *
 * Ejemplo:
 *   <StandardEmptyState
 *     icon="🏋️"
 *     title="No hay rutinas"
 *     description="Crea tu primera rutina para empezar a entrenar"
 *     actionLabel="Crear rutina"
 *     onAction={() => router.push('/routines/create')}
 *   />
 */
export interface StandardEmptyStateProps {
  icon?: ReactNode | string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function StandardEmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}: StandardEmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-8 text-center ${className}`}
    >
      {/* Icon */}
      <div className="w-20 h-20 mx-auto mb-4 bg-white/50 dark:bg-gray-700/50 rounded-full flex items-center justify-center">
        {typeof icon === 'string' ? (
          <span className="text-5xl">{icon}</span>
        ) : (
          <div className="text-gray-600 dark:text-gray-400">{icon}</div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white mb-1.5">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {actionLabel && onAction && (
            <Button
              variant="gradient"
              onClick={onAction}
              className="gap-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="secondary" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
