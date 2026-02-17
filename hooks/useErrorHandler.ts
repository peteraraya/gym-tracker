/**
 * Hook personalizado para manejo de errores consistente
 */

import { useToast } from '@/context/ToastContext';
import { useCallback, useRef, useEffect } from 'react';

interface UseErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  onError?: (error: Error) => void;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { 
    showToast = true, 
    logToConsole = process.env.NODE_ENV === 'development',
    onError 
  } = options;
  
  const toast = useToast();

  const handleError = useCallback((error: unknown, context?: string) => {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const fullMessage = context ? `${context}: ${errorMessage}` : errorMessage;

    // Log en desarrollo
    if (logToConsole) {
      console.error('[Error Handler]', fullMessage, error);
    }

    // Mostrar toast al usuario
    if (showToast && toast) {
      toast.error(fullMessage);
    }

    // Callback personalizado
    if (onError && error instanceof Error) {
      onError(error);
    }

    return fullMessage;
  }, [showToast, logToConsole, onError, toast]);

  const handleAsyncError = useCallback(async <T,>(
    promise: Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await promise;
    } catch (error) {
      handleError(error, context);
      return null;
    }
  }, [handleError]);

  return { handleError, handleAsyncError };
}

/**
 * Hook para ejecutar funciones asíncronas con manejo de loading y errores
 */
export function useAsyncAction<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  options: {
    onSuccess?: (result: Awaited<ReturnType<T>>) => void;
    onError?: (error: Error) => void;
    successMessage?: string;
    errorContext?: string;
  } = {}
) {
  const { handleError } = useErrorHandler();
  const toast = useToast();
  const optionsRef = useRef(options);
  // Keep a mutable ref to the latest options without updating it during render
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const execute = useCallback(async (...args: Parameters<T>) => {
    try {
      const result = await asyncFn(...args);
      
      if (optionsRef.current.successMessage && toast) {
        toast.success(optionsRef.current.successMessage);
      }
      
      optionsRef.current.onSuccess?.(result);
      return result;
    } catch (error) {
      handleError(error, optionsRef.current.errorContext);
      optionsRef.current.onError?.(error as Error);
      throw error;
    }
  }, [asyncFn, handleError, toast]);

  return execute;
}
