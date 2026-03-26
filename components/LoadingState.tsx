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
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-5xl mb-4 animate-bounce">⏳</div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
        {message}
      </h3>
      {description && (
        <p className="text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      )}
    </div>
  );
}
