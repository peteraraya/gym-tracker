'use client';

import React from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useTranslations } from '@/context/LocaleContext';

interface ConnectionIndicatorProps {
  showWhenOnline?: boolean; // Mostrar indicador incluso cuando está online
  className?: string;
}

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({
  showWhenOnline = false,
  className = '',
}) => {
  const { isOnline, isSupabaseConnected, isLocalMode, hasStorageError } = useConnectionStatus();
  const t = useTranslations('connection');

  if (isOnline && !hasStorageError && !isLocalMode && (!showWhenOnline || !isSupabaseConnected)) {
    return null;
  }

  return (
    <div
      role={isOnline && !hasStorageError ? 'status' : 'alert'}
      aria-live={isOnline && !hasStorageError ? 'polite' : 'assertive'}
      className={`flex items-start gap-2 border-b px-4 py-2 text-xs ${
        !isOnline
          ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200'
          : hasStorageError
            ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200'
            : 'border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
      } ${className}`}
    >
      <span className="font-semibold">
        {!isOnline
          ? t('offlineTitle')
          : hasStorageError
            ? t('cloudUnavailableTitle')
            : isLocalMode
              ? t('localTitle')
              : t('connectedTitle')}
      </span>
      <span>
        {!isOnline
          ? t('offlineDescription')
          : hasStorageError
            ? t('cloudUnavailableDescription')
            : isLocalMode
              ? t('localDescription')
              : t('connectedDescription')}
      </span>
    </div>
  );
};

/**
 * Versión compacta del indicador (solo icono)
 */
export const ConnectionIndicatorCompact: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isOnline, hasStorageError, isLocalMode } = useConnectionStatus();
  const t = useTranslations('connection');

  if (isOnline && !hasStorageError && !isLocalMode) {
    return null;
  }

  const title = !isOnline
    ? t('offlineTitle')
    : hasStorageError
      ? t('cloudUnavailableTitle')
      : isLocalMode
        ? t('localTitle')
        : t('connectedTitle');

  return (
    <div className={`flex items-center ${className}`} title={title} aria-label={title}>
      <div className={`w-2 h-2 rounded-full animate-pulse ${!isOnline ? 'bg-red-500' : 'bg-amber-500'}`} />
    </div>
  );
};
