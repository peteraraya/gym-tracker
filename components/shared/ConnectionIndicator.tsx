'use client';

import React, { useEffect, useState } from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';

interface ConnectionIndicatorProps {
  showWhenOnline?: boolean; // Mostrar indicador incluso cuando está online
  className?: string;
}

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({
  showWhenOnline = false,
  className = '',
}) => {
  const { isOnline, isSupabaseConnected, checkSupabaseConnection } = useConnectionStatus();
  const [isChecking, setIsChecking] = useState(false);

  // Verificar conexión a Supabase periódicamente
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      checkSupabaseConnection();
    }, 30000); // Cada 30 segundos

    // Verificar inmediatamente al montar
    checkSupabaseConnection();

    return () => clearInterval(interval);
  }, [isOnline, checkSupabaseConnection]);

  const handleRetry = async () => {
    setIsChecking(true);
    await checkSupabaseConnection();
    setIsChecking(false);
  };

  // No mostrar nada si está online y no se configuró showWhenOnline
  if (isOnline && isSupabaseConnected && !showWhenOnline) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Indicador de estado */}
      <div className="flex items-center gap-2">
        {!isOnline ? (
          // Sin conexión a internet
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-medium">Sin conexión</span>
          </div>
        ) : !isSupabaseConnected ? (
          // Conexión a internet pero no a Supabase
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-sm">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-medium">Conexión limitada</span>
            <button
              onClick={handleRetry}
              disabled={isChecking}
              className="ml-1 px-2 py-0.5 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 rounded text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isChecking ? '...' : 'Reintentar'}
            </button>
          </div>
        ) : showWhenOnline ? (
          // Conectado (solo si showWhenOnline está activo)
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="font-medium">Conectado</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

/**
 * Versión compacta del indicador (solo icono)
 */
export const ConnectionIndicatorCompact: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isOnline, isSupabaseConnected } = useConnectionStatus();

  if (isOnline && isSupabaseConnected) {
    return null;
  }

  return (
    <div className={`flex items-center ${className}`} title={!isOnline ? 'Sin conexión a internet' : 'Conexión limitada a la base de datos'}>
      <div className={`w-2 h-2 rounded-full animate-pulse ${!isOnline ? 'bg-red-500' : 'bg-amber-500'}`} />
    </div>
  );
};
