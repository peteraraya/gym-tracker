import { useState, useCallback, useRef, useEffect } from 'react';
import { useWorkout } from '@/context/WorkoutContext';

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
  const { activeWorkout, updateWorkoutProgress } = useWorkout();
  
  const [showTimer, setShowTimer] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
  const [timerTitle, setTimerTitle] = useState('');
  const [nextExerciseName, setNextExerciseName] = useState<string | undefined>(undefined);
  const [timerMinimized, setTimerMinimized] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState<number>(0);
  const [currentTimeLeft, setCurrentTimeLeft] = useState(0);
  
  const timerCompleteRef = useRef(onTimerComplete);
  const hasRestoredRef = useRef(false);
  
  // Update ref when callback changes
  useEffect(() => {
    timerCompleteRef.current = onTimerComplete;
  }, [onTimerComplete]);
  
  // Restaurar estado del temporizador al montar
  useEffect(() => {
    if (hasRestoredRef.current || !activeWorkout) return;
    
    if (activeWorkout.isResting && activeWorkout.restTimerStartedAt && activeWorkout.restTimerDuration) {
      const elapsed = Math.floor((Date.now() - activeWorkout.restTimerStartedAt) / 1000);
      const remaining = Math.max(0, activeWorkout.restTimerDuration - elapsed);
      
      if (remaining > 0) {
        setShowTimer(true);
        setTimerDuration(activeWorkout.restTimerDuration);
        setTimerStartTime(activeWorkout.restTimerStartedAt);
        setCurrentTimeLeft(remaining);
        setTimerTitle(activeWorkout.restTimerTitle || 'Descanso');
        setNextExerciseName(activeWorkout.restTimerNextExercise);
        setTimerMinimized(false);
        
        hasRestoredRef.current = true;
      }
    }
  }, [activeWorkout]);
  
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
    const startTime = Date.now();
    
    setShowTimer(true);
    setTimerDuration(duration);
    setTimerStartTime(startTime);
    setCurrentTimeLeft(duration);
    setTimerTitle(title);
    setNextExerciseName(nextExercise);
    setTimerMinimized(false);
    
    // Persistir estado del temporizador
    if (activeWorkout && updateWorkoutProgress) {
      updateWorkoutProgress(
        activeWorkout.currentExerciseIndex,
        activeWorkout.currentSet,
        activeWorkout.completedSets,
        activeWorkout.actualReps,
        activeWorkout.actualWeights,
        {
          isResting: true,
          restTimerDuration: duration,
          restTimerTitle: title,
          restTimerNextExercise: nextExercise,
          restTimerStartedAt: startTime
        }
      );
    }
  }, [activeWorkout, updateWorkoutProgress]);
  
  const stopTimer = useCallback(() => {
    setShowTimer(false);
    setTimerMinimized(false);
    setTimerDuration(0);
    setCurrentTimeLeft(0);
    
    // Limpiar estado persistido
    if (activeWorkout && updateWorkoutProgress) {
      updateWorkoutProgress(
        activeWorkout.currentExerciseIndex,
        activeWorkout.currentSet,
        activeWorkout.completedSets,
        activeWorkout.actualReps,
        activeWorkout.actualWeights,
        {
          isResting: false,
          restTimerDuration: undefined,
          restTimerTitle: undefined,
          restTimerNextExercise: undefined,
          restTimerStartedAt: undefined
        }
      );
    }
  }, [activeWorkout, updateWorkoutProgress]);
  
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
    
    // Limpiar estado persistido
    if (activeWorkout && updateWorkoutProgress) {
      updateWorkoutProgress(
        activeWorkout.currentExerciseIndex,
        activeWorkout.currentSet,
        activeWorkout.completedSets,
        activeWorkout.actualReps,
        activeWorkout.actualWeights,
        {
          isResting: false,
          restTimerDuration: undefined,
          restTimerTitle: undefined,
          restTimerNextExercise: undefined,
          restTimerStartedAt: undefined
        }
      );
    }
  }, [activeWorkout, updateWorkoutProgress]);
  
  const skipAndAdvance = useCallback(() => {
    // Cerrar el timer Y ejecutar el callback para avanzar
    setShowTimer(false);
    setTimerMinimized(false);
    setTimerDuration(0);
    setCurrentTimeLeft(0);
    
    // Limpiar estado persistido
    if (activeWorkout && updateWorkoutProgress) {
      updateWorkoutProgress(
        activeWorkout.currentExerciseIndex,
        activeWorkout.currentSet,
        activeWorkout.completedSets,
        activeWorkout.actualReps,
        activeWorkout.actualWeights,
        {
          isResting: false,
          restTimerDuration: undefined,
          restTimerTitle: undefined,
          restTimerNextExercise: undefined,
          restTimerStartedAt: undefined
        }
      );
    }
    
    // Ejecutar el callback después de cerrar el timer
    if (timerCompleteRef.current) {
      timerCompleteRef.current();
    }
  }, [activeWorkout, updateWorkoutProgress]);
  
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
