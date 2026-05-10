"use client";

import React from 'react';

/**
 * Sistema de Error Monitoring y Analytics
 * Tracking de errores, performance y uso de la aplicación
 */

interface ErrorContext {
  userId?: string;
  routineId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  context?: Record<string, any>;
}

class ErrorTracker {
  private errors: Array<{ error: Error; context: ErrorContext; timestamp: number }> = [];
  private metrics: PerformanceMetric[] = [];
  private maxErrors = 100;
  private maxMetrics = 200;

  // Error tracking
  trackError(error: Error, context: ErrorContext = {}) {
    const errorEntry = {
      error,
      context,
      timestamp: Date.now(),
    };

    this.errors.push(errorEntry);
    
    // Mantener solo los últimos N errores
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error tracked:', {
        message: error.message,
        stack: error.stack,
        context,
      });
    }

    // En producción, enviar a servicio de monitoring
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(errorEntry);
    }
  }

  // Performance tracking
  trackPerformance(name: string, value: number, context?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      context,
    };

    this.metrics.push(metric);
    
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log métricas importantes
    if (value > 1000) { // > 1 segundo
      console.warn(`⚠️ Slow operation: ${name} took ${value}ms`);
    }
  }

  // User action tracking
  trackUserAction(action: string, context: ErrorContext = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.log('👤 User action:', action, context);
    }
    
    // Analytics en producción
    this.trackPerformance(`user_action_${action}`, Date.now(), context);
  }

  // Obtener estadísticas de errores
  getErrorStats() {
    const last24h = Date.now() - 24 * 60 * 60 * 1000;
    const recentErrors = this.errors.filter(e => e.timestamp > last24h);
    
    return {
      total: this.errors.length,
      last24h: recentErrors.length,
      byComponent: this.groupBy(recentErrors, e => e.context.component || 'unknown'),
      byAction: this.groupBy(recentErrors, e => e.context.action || 'unknown'),
    };
  }

  // Obtener métricas de performance
  getPerformanceStats() {
    const last24h = Date.now() - 24 * 60 * 60 * 1000;
    const recentMetrics = this.metrics.filter(m => m.timestamp > last24h);
    
    return {
      total: recentMetrics.length,
      averageByName: this.averageBy(recentMetrics, 'name'),
      slowOperations: recentMetrics.filter(m => m.value > 1000),
    };
  }

  private groupBy<T>(array: T[], keyFn: (item: T) => string) {
    return array.reduce((acc, item) => {
      const key = keyFn(item);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private averageBy(metrics: PerformanceMetric[], groupBy: keyof PerformanceMetric) {
    const groups = metrics.reduce((acc, metric) => {
      const key = String(metric[groupBy]);
      if (!acc[key]) acc[key] = [];
      acc[key].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(groups).reduce((acc, [key, values]) => {
      acc[key] = values.reduce((sum, val) => sum + val, 0) / values.length;
      return acc;
    }, {} as Record<string, number>);
  }

  private async sendToMonitoring(errorEntry: any) {
    try {
      // Aquí integrarías con Sentry, LogRocket, etc.
      // Por ahora, guardamos en localStorage para debug
      const stored = localStorage.getItem('gym_tracker_errors') || '[]';
      const errors = JSON.parse(stored);
      errors.push({
        message: errorEntry.error.message,
        stack: errorEntry.error.stack,
        context: errorEntry.context,
        timestamp: errorEntry.timestamp,
      });
      
      // Mantener solo los últimos 50 errores en localStorage
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('gym_tracker_errors', JSON.stringify(errors));
    } catch (e) {
      console.error('Failed to store error:', e);
    }
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker();

// Hook para usar en componentes React
export function useErrorTracking() {
  return {
    trackError: errorTracker.trackError.bind(errorTracker),
    trackPerformance: errorTracker.trackPerformance.bind(errorTracker),
    trackUserAction: errorTracker.trackUserAction.bind(errorTracker),
    getStats: () => ({
      errors: errorTracker.getErrorStats(),
      performance: errorTracker.getPerformanceStats(),
    }),
  };
}

// HOC para wrappear componentes con error tracking
export function withErrorTracking<T extends object>(
  Component: React.ComponentType<T>,
  componentName: string
) {
  return function TrackedComponent(props: T) {
    const { trackError } = useErrorTracking();

    const handleError = (error: Error, errorInfo: any) => {
      trackError(error, {
        component: componentName,
        action: 'render_error',
        metadata: errorInfo,
      });
    };

    return (
      <ErrorBoundary onError={handleError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Error Boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error, errorInfo: any) => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold">Algo salió mal</h3>
          <p className="text-red-600 text-sm mt-1">
            Ha ocurrido un error inesperado. Por favor, recarga la página.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
