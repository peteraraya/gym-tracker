'use client';

import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      {icon && (
        <div className="text-4xl mb-3 opacity-50">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-1.5">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 max-w-sm">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
