import { useState, useCallback } from 'react';

export interface SetExecutionState {
  showPreparation: boolean;
  showSetExecution: boolean;
  isExecutingSet: boolean;
  setStartTime: number | null;
}

export interface SetExecutionCallbacks {
  onSetStart?: () => void;
}

export function useSetExecution(callbacks?: SetExecutionCallbacks) {
  const [showPreparation, setShowPreparation] = useState(false);
  const [showSetExecution, setShowSetExecution] = useState(false);
  const [isExecutingSet, setIsExecutingSet] = useState(false);
  const [setStartTime, setSetStartTime] = useState<number | null>(null);
  
  const startSet = useCallback(() => {
    console.log('[SetExecution] startSet called - setting showPreparation to true');
    setShowPreparation(true);
  }, []);
  
  const completePreparation = useCallback((useExecutionModal: boolean, onSuccess?: (message: string, duration: number) => void) => {
    setShowPreparation(false);
    setSetStartTime(Date.now());
    
    // Llamar callback de inicio de serie (para haptic feedback)
    callbacks?.onSetStart?.();
    
    if (useExecutionModal) {
      setShowSetExecution(true);
      setIsExecutingSet(true);
    } else {
      setIsExecutingSet(true);
      onSuccess?.('✅ Serie iniciada - completa cuando termines', 2000);
    }
  }, [callbacks]);
  
  const completeSet = useCallback(() => {
    setIsExecutingSet(false);
    setShowSetExecution(false);
    setSetStartTime(null);
  }, []);
  
  const cancelSetExecution = useCallback(() => {
    setShowSetExecution(false);
    setIsExecutingSet(false);
    setSetStartTime(null);
  }, []);
  
  return {
    showPreparation,
    showSetExecution,
    isExecutingSet,
    setStartTime,
    startSet,
    completePreparation,
    completeSet,
    cancelSetExecution
  };
}
