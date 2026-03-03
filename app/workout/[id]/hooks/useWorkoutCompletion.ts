import { useState, useCallback } from 'react';
import { calculateAchievements, getRecentAchievements } from '@/lib/achievements';

interface UseWorkoutCompletionProps {
  routine: any;
  workoutStartTime: number;
  totalPausedTime: number;
  sessions: any[];
  addSession: (session: any) => Promise<void>;
  finishWorkoutContext: () => void;
  onSuccess: (message: string, duration?: number) => void;
  onError: (message: string) => void;
  router: any;
  onWorkoutComplete?: () => void;
  onAchievementUnlocked?: () => void;
}

export function useWorkoutCompletion({
  routine,
  workoutStartTime,
  totalPausedTime,
  sessions,
  addSession,
  finishWorkoutContext,
  onSuccess,
  onError,
  router,
  onWorkoutComplete,
  onAchievementUnlocked
}: UseWorkoutCompletionProps) {
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [proposedDuration, setProposedDuration] = useState<number>(0);
  const [sessionNotes, setSessionNotes] = useState('');
  const [shownAchievements, setShownAchievements] = useState<Set<string>>(new Set());
  
  const openCompletionModal = useCallback((duration?: number) => {
    const calculatedDuration = duration || Math.floor((Date.now() - workoutStartTime) / 1000);
    // Redondear a intervalos de 5 segundos
    const roundedDuration = Math.round(calculatedDuration / 5) * 5;
    setProposedDuration(Math.max(roundedDuration, 60));
    setShowNotesModal(true);
  }, [workoutStartTime]);
  
  const finishWorkout = useCallback(async (workoutData: any) => {
    if (!routine) return;

    const totalDuration = proposedDuration && proposedDuration > 0
      ? proposedDuration
      : Math.floor((Date.now() - workoutStartTime) / 1000);

    // Calculate total volume
    let totalVolume = 0;
    routine.exercises.forEach((ex: any) => {
      const reps = workoutData.actualReps[ex.id] || [];
      const weights = workoutData.actualWeights[ex.id] || [];
      reps.forEach((rep: number, idx: number) => {
        totalVolume += rep * (weights[idx] || 0);
      });
    });

    const sessionExercises = routine.exercises.map((ex: any) => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      completedSets: workoutData.completedSets[ex.id] || 0,
      actualReps: workoutData.actualReps[ex.id] || [],
      actualWeight: workoutData.actualWeights[ex.id] || [],
      setDurations: workoutData.actualSetDurations[ex.id] || [],
      pauseDurations: workoutData.actualPauseDurations[ex.id] || [],
      actualRestTimes: workoutData.actualRestTimes[ex.id] || []
    }));

    try {
      await addSession({
        routineId: routine.id,
        date: new Date(),
        exercises: sessionExercises,
        notes: sessionNotes.trim() || '',
        totalDuration,
        totalPausedTime,
        totalVolume: Math.round(totalVolume)
      });
      
      // Check for new achievements
      const updatedSessions = [...sessions, {
        routineId: routine.id,
        date: new Date(),
        exercises: sessionExercises,
        notes: sessionNotes.trim() || '',
        totalDuration,
        totalPausedTime
      } as any];

      const achievements = calculateAchievements(updatedSessions);
      const recentAchievements = getRecentAchievements(achievements);
      
      // Show achievement notifications
      recentAchievements.forEach(achievement => {
        if (achievement.unlocked && !shownAchievements.has(achievement.id)) {
          onSuccess(`🏆 ¡Logro desbloqueado! ${achievement.name}`, 5000);
          setShownAchievements(prev => new Set([...prev, achievement.id]));
          // Haptic feedback para logro
          onAchievementUnlocked?.();
        }
      });
      
      // Haptic feedback al completar entrenamiento
      onWorkoutComplete?.();
      
      finishWorkoutContext();
      onSuccess('Sesión guardada exitosamente');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      router.replace('/sessions');
      router.refresh();
    } catch (err) {
      console.error('Error saving session:', err);
      onError('Error al guardar la sesión. Por favor, intenta nuevamente.');
    }
  }, [routine, proposedDuration, workoutStartTime, totalPausedTime, sessionNotes, addSession, finishWorkoutContext, onSuccess, onError, router, sessions, shownAchievements]);
  
  return {
    showNotesModal,
    setShowNotesModal,
    proposedDuration,
    setProposedDuration,
    sessionNotes,
    setSessionNotes,
    openCompletionModal,
    finishWorkout
  };
}
