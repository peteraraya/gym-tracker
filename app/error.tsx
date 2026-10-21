'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from '@/components/icons/lucide';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error
    console.error('[GlobalError] Application error caught by Next.js boundary:', error);

    // Enviar a servicio de tracking si está disponible
    if (typeof window !== 'undefined') {
      const w = window as unknown as { 
        gtag?: (command: string, action: string, params: Record<string, unknown>) => void;
        va?: (command: string, event: string, params: Record<string, unknown>) => void;
      };
      
      if (w.gtag) {
        w.gtag('event', 'exception', {
          description: error.message,
          fatal: true
        });
      }
      if (w.va) {
        w.va('track', 'error', {
          message: error.message,
          stack: error.stack
        });
      }
    }
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-linear-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 border border-zinc-200 dark:border-zinc-800">
        {/* Icono de error */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Título */}
        <h2 className="text-2xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-2">
          ¡Oops! Algo salió mal
        </h2>

        {/* Descripción */}
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">
          La aplicación encontró un error inesperado al procesar tu solicitud. No te preocupes, tus datos locales están seguros.
        </p>

        {/* Detalles del error (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm font-mono text-red-800 dark:text-red-300 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="mt-2 text-xs font-mono text-red-600 dark:text-red-400">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="space-y-3">
          <Button
            onClick={() => reset()}
            variant="primary"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Intentar de nuevo
          </Button>
          
          <Link href="/" className="block">
            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border-none"
            >
              <Home className="w-4 h-4" />
              Volver al Inicio
            </Button>
          </Link>
        </div>

        {/* Mensaje de ayuda */}
        <p className="mt-6 text-xs text-center text-zinc-500 dark:text-zinc-500">
          Si el problema persiste, intenta recargar la página o limpiar el caché de tu navegador.
        </p>
      </div>
    </div>
  );
}
