import { useState, useCallback, useRef, useEffect } from 'react';

export interface TimerState {
  showTimer: boolean;
  timerDuration: number;
  timerTitle: string;
  nextExerciseName?: string;
  timerMinimized: boolean;
  timerStartTime: number;
  currentTimeLeft: number;
}

export interface UseWorkoutTimerReturn extends TimerState {
  startTimer: (duration: number, title: string, nextExercise?: string) => void;
  stopTimer: () => void;
  minimizeTimer: (timeLeft: number) => void;
  expandTimer: () => void;
  skipTimer: () => void;
  skipAndAdvance: () => void; // ✨ NEW: Skip timer and advance to next set/exercise
  setCurrentTimeLeft: (time: number) => void;
}

export function useWorkoutTimer(onTimerComplete: () => void): UseWorkoutTimerReturn {
  const [showTimer, setShowTimer] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
  const [timerTitle, setTimerTitle] = useState('');
  const [nextExerciseName, setNextExerciseName] = useState<string | undefined>(undefined);
  const [timerMinimized, setTimerMinimized] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState<number>(0);
  const [currentTimeLeft, setCurrentTimeLeft] = useState(0);
  
  const timerCompleteRef = useRef(onTimerComplete);
  
  // Update ref when callback changes
  useEffect(() => {
    timerCompleteRef.current = onTimerComplete;
  }, [onTimerComplete]);
  
  // Countdown when minimized
  useEffect(() => {
    if (!showTimer || !timerMinimized || !timerStartTime) {
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, currentTimeLeft - 1);
      setCurrentTimeLeft(remaining);

      if (remaining === 0 && timerCompleteRef.current) {
        timerCompleteRef.current();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [showTimer, timerMinimized, timerStartTime, currentTimeLeft]);
  
  const startTimer = useCallback((duration: number, title: string, nextExercise?: string) => {
    setShowTimer(true);
    setTimerDuration(duration);
    setTimerStartTime(Date.now());
    setCurrentTimeLeft(duration);
    setTimerTitle(title);
    setNextExerciseName(nextExercise);
    setTimerMinimized(false);
  }, []);
  
  const stopTimer = useCallback(() => {
    setShowTimer(false);
    setTimerMinimized(false);
    setTimerDuration(0);
    setCurrentTimeLeft(0);
  }, []);
  
  const minimizeTimer = useCallback((timeLeft: number) => {
    setTimerMinimized(true);
    setCurrentTimeLeft(timeLeft);
    setTimerStartTime(Date.now());
  }, []);
  
  const expandTimer = useCallback(() => {
    setTimerMinimized(false);
  }, []);
  
  const skipTimer = useCallback(() => {
    // Cerrar el timer sin ejecutar el callback completo
    setShowTimer(false);
    setTimerMinimized(false);
    setTimerDuration(0);
    setCurrentTimeLeft(0);
  }, []);
  
  const skipAndAdvance = useCallback(() => {
    // Cerrar el timer Y ejecutar el callback para avanzar
    setShowTimer(false);
    setTimerMinimized(false);
    setTimerDuration(0);
    setCurrentTimeLeft(0);
    
    // Ejecutar el callback después de cerrar el timer
    if (timerCompleteRef.current) {
      timerCompleteRef.current();
    }
  }, []);
  
  return {
    showTimer,
    timerDuration,
    timerTitle,
    nextExerciseName,
    timerMinimized,
    timerStartTime,
    currentTimeLeft,
    startTimer,
    stopTimer,
    minimizeTimer,
    expandTimer,
    skipTimer,
    skipAndAdvance,
    setCurrentTimeLeft
  };
}
