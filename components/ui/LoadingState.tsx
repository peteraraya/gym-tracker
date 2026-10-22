'use client';

import React from 'react';
import { useTranslations } from '@/context/LocaleContext';

interface LoadingStateProps {
  message?: string;
  description?: string;
}

export function LoadingState({
  message,
  description
}: LoadingStateProps) {
  const t = useTranslations('common');

  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center justify-center py-6 text-center">
      <div aria-hidden="true" className="mb-3 flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-surface-alt" />
        <div className="space-y-2">
          <div className="h-3 w-36 animate-pulse rounded-full bg-surface-alt" />
          <div className="h-3 w-24 animate-pulse rounded-full bg-surface-alt" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-1.5">
        {message ?? t('loading')}
      </h3>
      {description && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      )}
    </div>
  );
}
