import { useState, useCallback } from 'react';
import { useAchievementManager } from '@/lib/achievementManager';

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
  
  // ✨ Usar el nuevo sistema de logros
  const achievementManager = useAchievementManager();
  
  const openCompletionModal = useCallback((duration?: number) => {
    const calculatedDuration = duration || Math.floor((Date.now() - workoutStartTime - totalPausedTime) / 1000);
    // Redondear a intervalos de 5 segundos
    const roundedDuration = Math.round(calculatedDuration / 5) * 5;
    setProposedDuration(Math.max(roundedDuration, 60));
    setShowNotesModal(true);
  }, [workoutStartTime, totalPausedTime]);
  
  const finishWorkout = useCallback(async (workoutData: any) => {
    if (!routine) return;

    const totalDuration = proposedDuration && proposedDuration > 0
      ? proposedDuration
      : Math.floor((Date.now() - workoutStartTime - totalPausedTime) / 1000);

    // Calculate total volume
    let totalVolume = 0;
    routine.exercises.forEach((ex: any) => {
      const reps = workoutData.actualReps[ex.id] || [];
      const weights = workoutData.actualWeights[ex.id] || [];
      reps.forEach((rep: number, idx: number) => {
        totalVolume += rep * (weights[idx] || 0);
      });
    });

    type SessionExercise = {
      exerciseId: string;
      exerciseName: string;
      completedSets: number;
      actualReps: number[];
      actualWeight: number[];
      setDurations: number[];
      pauseDurations: number[];
      actualRestTimes: number[];
    };

    const sessionExercises: SessionExercise[] = routine.exercises.map((ex: any) => ({
      exerciseId: String(ex.id),
      exerciseName: ex.name,
      completedSets: workoutData.completedSets[ex.id] || 0,
      actualReps: workoutData.actualReps[ex.id] || [],
      actualWeight: workoutData.actualWeights[ex.id] || [],
      setDurations: workoutData.actualSetDurations[ex.id] || [],
      pauseDurations: workoutData.actualPauseDurations[ex.id] || [],
      actualRestTimes: workoutData.actualRestTimes[ex.id] || []
    }));

    // ✨ Crear la nueva sesión
    const newSession = {
      id: `temp-${Date.now()}`, // ID temporal
      routineId: routine.id,
      routineName: routine.name,
      date: new Date(),
      exercises: sessionExercises,
      notes: sessionNotes.trim() || '',
      totalDuration,
      totalPausedTime,
      totalVolume: Math.round(totalVolume)
    };

    try {
      // ✨ Procesar logros ANTES de guardar
      const allSessionsWithNew = [...sessions, newSession];
      const newAchievements = achievementManager.processNewSession(newSession, allSessionsWithNew);
      const stats = achievementManager.getQuickStats(allSessionsWithNew);
      const records = achievementManager.checkPersonalRecords(newSession, allSessionsWithNew);

      // Guardar la sesión
      await addSession(newSession);
      
      // ✨ Mostrar notificaciones de logros
      if (newAchievements.length > 0) {
        newAchievements.forEach(({ achievement }) => {
          if (!shownAchievements.has(achievement.id)) {
            onSuccess(`🏆 ¡Logro desbloqueado! ${achievement.name}`, 5000);
            setShownAchievements(prev => new Set([...prev, achievement.id]));
            onAchievementUnlocked?.();
          }
        });
      }

      // ✨ Mostrar notificaciones de récords personales
      if (records.volumeRecord) {
        onSuccess(`💪 ¡Nuevo récord de volumen! ${Math.round(totalVolume)}kg`, 4000);
      }
      if (records.setsRecord) {
        const totalSets = sessionExercises.reduce((sum, ex) => sum + ex.completedSets, 0);
        onSuccess(`🔥 ¡Nuevo récord de series! ${totalSets} series`, 4000);
      }

      // ✨ Mensaje motivacional
      const motivationalMessage = achievementManager.generateMotivationalMessage(newAchievements, stats);
      if (newAchievements.length === 0) {
        onSuccess(motivationalMessage, 3000);
      }
      
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
  }, [
    routine, 
    proposedDuration, 
    workoutStartTime, 
    totalPausedTime, 
    sessionNotes, 
    addSession, 
    finishWorkoutContext, 
    onSuccess, 
    onError, 
    router, 
    sessions, 
    shownAchievements,
    achievementManager,
    onWorkoutComplete,
    onAchievementUnlocked
  ]);
  
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
