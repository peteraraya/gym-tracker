'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

interface EmptyStateCardProps {
  icon: ReactNode | string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  gradient?: string;
}

export function EmptyStateCard({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  gradient
}: EmptyStateCardProps) {
  return (
    <div className={`mt-4 rounded-2xl border border-border-light bg-surface p-4 text-center sm:p-6 ${gradient ? `bg-linear-to-br ${gradient}` : ''}`}>
      {/* Icon */}
      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-surface-alt">
        {typeof icon === 'string' ? (
          <span className="text-4xl">{icon}</span>
        ) : (
          <div className="text-gray-600 dark:text-gray-400">
            {icon}
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-1.5 text-lg font-bold text-zinc-900 dark:text-zinc-100 sm:text-xl">
        {title}
      </h3>

      {/* Description */}
      <p className="mx-auto mb-4 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
        {description}
      </p>

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {actionLabel && onAction && (
              <Button
              variant="primary"
              onClick={onAction}
              className="gap-2"
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="secondary"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
