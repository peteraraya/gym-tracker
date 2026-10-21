'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from '@/components/icons/lucide';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ErrorBoundary] Error caught:', error, errorInfo);
    
    this.setState({
      errorInfo: errorInfo.componentStack
    });
    
    // Enviar a servicio de tracking si está disponible
    if (typeof window !== 'undefined') {
      // Google Analytics
      if ((window as any).gtag) {
        (window as any).gtag('event', 'exception', {
          description: error.message,
          fatal: true
        });
      }
      
      // Vercel Analytics
      if ((window as any).va) {
        (window as any).va('track', 'error', {
          message: error.message,
          stack: error.stack
        });
      }
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
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
              La aplicación encontró un error inesperado. No te preocupes, tus datos están seguros.
            </p>

            {/* Detalles del error (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm font-mono text-red-800 dark:text-red-300 break-all">
                  {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer">
                      Ver stack trace
                    </summary>
                    <pre className="mt-2 text-xs text-red-700 dark:text-red-300 overflow-auto max-h-40">
                      {this.state.errorInfo}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Acciones */}
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Recargar Página
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 py-3 px-4 rounded-lg font-medium transition-colors"
              >
                <Home className="w-4 h-4" />
                Ir al Inicio
              </button>
            </div>

            {/* Mensaje de ayuda */}
            <p className="mt-6 text-xs text-center text-zinc-500 dark:text-zinc-500">
              Si el problema persiste, intenta limpiar el caché del navegador o contacta a soporte.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
