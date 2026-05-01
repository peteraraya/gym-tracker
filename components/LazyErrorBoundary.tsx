'use client';

import { Component, ReactNode } from 'react';

interface LazyErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface LazyErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
  isRetrying: boolean;
}

const RETRY_DELAYS = [1000, 2000, 4000]; // 1s, 2s, 4s
const MAX_RETRIES = RETRY_DELAYS.length;

export class LazyErrorBoundary extends Component<LazyErrorBoundaryProps, LazyErrorBoundaryState> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: LazyErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<LazyErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[LazyErrorBoundary] Chunk load error:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-retry if we haven't exceeded max retries
    if (this.state.retryCount < MAX_RETRIES) {
      this.scheduleRetry();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  scheduleRetry = () => {
    const delay = RETRY_DELAYS[this.state.retryCount];
    
    this.setState({ isRetrying: true });

    this.retryTimeout = setTimeout(() => {
      this.setState(prev => ({
        hasError: false,
        error: null,
        retryCount: prev.retryCount + 1,
        isRetrying: false,
      }));
    }, delay);
  };

  handleManualRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      retryCount: 0,
      isRetrying: false,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.state.isRetrying) {
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4" />
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
              Reintentando cargar componente... (Intento {this.state.retryCount + 1}/{MAX_RETRIES})
            </p>
          </div>
        );
      }

      if (this.state.retryCount >= MAX_RETRIES) {
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-3xl mb-3">⚠️</div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
              Error al cargar componente
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4 text-center max-w-md">
              No se pudo cargar este componente después de {MAX_RETRIES} intentos. 
              Esto puede deberse a problemas de conexión o archivos faltantes.
            </p>
            <div className="flex gap-3">
              <button
                onClick={this.handleManualRetry}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm"
              >
                Reintentar
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors text-sm"
              >
                Recargar página
              </button>
            </div>
          </div>
        );
      }

      // Custom fallback if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }
    }

    return this.props.children;
  }
}
