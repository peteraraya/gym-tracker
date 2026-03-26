import { useState, useCallback } from 'react';

export interface SetExecutionState {
  // ❌ Removido: showPreparation (ya no se usa)
  showSetExecution: boolean;
  isExecutingSet: boolean;
  setStartTime: number | null;
}

export interface SetExecutionCallbacks {
  onSetStart?: () => void;
}

/**
 * Hook simplificado para ejecución de series
 * ✅ Removida la cuenta atrás de preparación para evitar inconsistencias
 * Ahora startSet() inicia la serie inmediatamente
 */
export function useSetExecution(callbacks?: SetExecutionCallbacks) {
  // ❌ Removido: showPreparation
  const [showSetExecution, setShowSetExecution] = useState(false);
  const [isExecutingSet, setIsExecutingSet] = useState(false);
  const [setStartTime, setSetStartTime] = useState<number | null>(null);
  
  /**
   * Inicia una serie inmediatamente (sin cuenta atrás de preparación)
   */
  const startSet = useCallback(() => {
    console.log('[SetExecution] startSet called - starting immediately');
    setSetStartTime(Date.now());
    setIsExecutingSet(true);
    
    // Llamar callback de inicio de serie (para haptic feedback)
    callbacks?.onSetStart?.();
  }, [callbacks]);
  
  /**
   * ❌ Removido: completePreparation (ya no se necesita)
   */
  
  /**
   * Completa la serie actual y resetea el timer
   */
  const completeSet = useCallback(() => {
    setIsExecutingSet(false);
    setShowSetExecution(false);
    setSetStartTime(null);
  }, []);
  
  /**
   * Cancela la ejecución de la serie
   */
  const cancelSetExecution = useCallback(() => {
    setShowSetExecution(false);
    setIsExecutingSet(false);
    setSetStartTime(null);
  }, []);
  
  return {
    // ❌ Removido: showPreparation
    showSetExecution,
    isExecutingSet,
    setStartTime,
    startSet,
    // ❌ Removido: completePreparation
    completeSet,
    cancelSetExecution
  };
}

