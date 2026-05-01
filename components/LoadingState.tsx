'use client';

import React from 'react';

interface LoadingStateProps {
  message?: string;
  description?: string;
}

export function LoadingState({
  message = 'Cargando...',
  description
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="text-4xl mb-3 animate-bounce">⏳</div>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-1.5">
        {message}
      </h3>
      {description && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      )}
    </div>
  );
}
