'use client';

import React from 'react';
import { WifiOff, RefreshCw, Dumbbell, Clock } from '@/components/icons/lucide';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-950 via-neutral-900 to-neutral-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-brand-600 to-brand-400 rounded-2xl mb-6 shadow-lg shadow-brand-500/30">
            <WifiOff className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-neutral-50 dark:text-neutral-50 mb-3 tracking-tight">
            Sin Conexión
          </h1>
          
          <p className="text-neutral-400 text-sm mb-6">
            Estás sin conexión a internet. Puedes seguir usando GymLogiX en modo offline y tus datos se sincronizarán automáticamente cuando recuperes la conexión.
          </p>
        </div>

        <Card className="mb-8 premium-card premium-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-brand-500" />
              Funciones Disponibles Offline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-brand-400" />
              <span className="text-neutral-300 text-sm">Registrar entrenamientos</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-brand-400" />
              <span className="text-neutral-300 text-sm">Ver rutinas guardadas</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-brand-400" />
              <span className="text-neutral-300 text-sm">Ver progreso y estadísticas</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-brand-400" />
              <span className="text-neutral-300 text-sm">Consultar catálogo de ejercicios</span>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleRetry}
          variant="primary"
          className="w-full min-h-[56px]"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Reconectar
        </Button>

        <p className="text-neutral-500 text-xs mt-6">
          Los datos se sincronizarán automáticamente al recuperar la conexión
        </p>
      </div>
    </div>
  );
}
