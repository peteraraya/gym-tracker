'use client';

import React from 'react';
import { WifiOff, RefreshCw } from '@/components/icons/lucide';
import { Button } from '@/components/ui/Button';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-orange-500 to-red-600 rounded-full mb-4">
            <WifiOff className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Sin Conexión
          </h1>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            No hay conexión a internet. Algunas funciones pueden estar limitadas, pero puedes seguir usando la app en modo offline.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-left">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              ✅ Disponible offline:
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Ver rutinas guardadas</li>
              <li>• Registrar entrenamientos</li>
              <li>• Ver progreso y estadísticas</li>
              <li>• Usar calculadoras</li>
              <li>• Consultar ejercicios</li>
            </ul>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 text-left">
            <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
              ⚠️ Requiere conexión:
            </h3>
            <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
              <li>• Sincronizar con la nube</li>
              <li>• Asistente IA avanzado</li>
              <li>• Actualizar perfil</li>
            </ul>
          </div>
        </div>

        <Button
          onClick={handleRetry}
          variant="primary"
          className="w-full"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Reintentar Conexión
        </Button>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
          Los datos se sincronizarán automáticamente cuando vuelva la conexión
        </p>
      </div>
    </div>
  );
}
