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
  gradient = 'from-blue-50 to-purple-50 dark:from-zinc-800 dark:to-zinc-800'
}: EmptyStateCardProps) {
  return (
    <div className={`bg-linear-to-br ${gradient} border-2 border-gray-200 dark:border-zinc-700 rounded-2xl p-8 text-center mt-4`}>
      {/* Icon */}
      <div className="w-20 h-20 mx-auto mb-4 bg-white/50 dark:bg-gray-700/50 rounded-full flex items-center justify-center">
        {typeof icon === 'string' ? (
          <span className="text-5xl">{icon}</span>
        ) : (
          <div className="text-gray-600 dark:text-gray-400">
            {icon}
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
        {description}
      </p>

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
