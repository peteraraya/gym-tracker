import { useState, useCallback } from 'react';
import { useAchievementManager } from '@/lib/achievements/achievementManager';
import { useConfirm } from '@/context/NotificationContext';
import { usePlanning } from '@/hooks/usePlanning';
import { EXERCISE_DATABASE } from '@/data/exercises';
import { getActualSetsThisWeek } from '@/types/planning';
import type { CompleteSplashStats } from '@/components/features/workout/WorkoutCompleteSplash';

interface UseWorkoutCompletionProps {
  routine: any;
  workoutStartTime: number;
  totalPausedTime: number;
  sessions: any[];
  addSession: (session: any) => Promise<void>;
  finishWorkoutContext: () => Promise<void>;
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
  const [completeSplash, setCompleteSplash] = useState<CompleteSplashStats | null>(null);
  const [pendingNavigate, setPendingNavigate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // ✨ Usar el nuevo sistema de logros
  const achievementManager = useAchievementManager();
  const { confirm } = useConfirm();
  // Integración con planificación: actualizar actualSets cuando se guarda una sesión
  const planning = usePlanning();
  
  const openCompletionModal = useCallback((duration?: number) => {
    const calculatedDuration = duration || Math.floor((Date.now() - workoutStartTime - totalPausedTime) / 1000);
    // Redondear a intervalos de 5 segundos
    const roundedDuration = Math.round(calculatedDuration / 5) * 5;
    setProposedDuration(Math.max(roundedDuration, 60));
    setShowNotesModal(true);
  }, [workoutStartTime, totalPausedTime]);
  
  const finishWorkout = useCallback(async (workoutData: any, confirmedDuration?: number) => {
    if (!routine) return;

    // Prioridad: duración pasada directamente desde el modal > proposedDuration > cálculo automático
    const totalDuration = confirmedDuration && confirmedDuration > 0
      ? confirmedDuration
      : proposedDuration && proposedDuration > 0
        ? proposedDuration
        : Math.floor((Date.now() - workoutStartTime - totalPausedTime) / 1000);

    // Validación: más de 5 horas (18000 segundos)
    if (totalDuration > 18000) {
      const hours = Math.floor(totalDuration / 3600);
      const minutes = Math.floor((totalDuration % 3600) / 60);
      const confirmed = await confirm({
        title: 'Duración inusualmente larga',
        message: `Estás a punto de registrar ${hours}h ${minutes}m de entrenamiento. ¿Es correcto?`,
        confirmText: 'Sí, guardar',
        cancelText: 'Corregir duración',
      });
      if (!confirmed) return;
    }

    setIsSaving(true);

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
    // Id real (no "temp-" + timestamp): así, si esta misma sesión se
    // reintenta guardar (retry de red, doble tap), saveSession puede
    // hacer upsert por id en vez de crear una fila duplicada.
    const sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const newSession = {
      id: sessionId,
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

      // Actualizar planning: si hay un mesociclo activo, recalcular series de la
      // semana del mesociclo donde cayó esta sesión y persistirlas en weeklyPlan.actualSets
      try {
        const active = planning.activeMesocycle;
        if (active) {
          const sessionDate = new Date(newSession.date);
          const mesoStart = new Date(active.startDate);
          const diffDays = Math.floor((sessionDate.getTime() - mesoStart.getTime()) / (1000 * 60 * 60 * 24));
          const weekIdx = Math.min(Math.max(Math.floor(diffDays / 7), 0), active.weeks - 1);
          const weekNumber = weekIdx + 1;
          const weekStart = new Date(mesoStart);
          weekStart.setDate(mesoStart.getDate() + weekIdx * 7);
          weekStart.setHours(0, 0, 0, 0);

          // Calcular series reales incluyendo la nueva sesión
          const sessionsWithNew = [...sessions, newSession];
          const sets = getActualSetsThisWeek(sessionsWithNew as any, EXERCISE_DATABASE as any, weekStart as any);
          planning.archiveWeekActualSets(active.id, weekNumber, sets);
        }
      } catch (e) {
        console.warn('Error actualizando planning after session save:', e);
      }

      // Esperar a que el activeWorkout se limpie correctamente antes de continuar
      await finishWorkoutContext();

      onSuccess('Sesión guardada exitosamente');

      // Cerrar el modal antes del splash
      setShowNotesModal(false);
      setIsSaving(false);

      await new Promise(resolve => setTimeout(resolve, 100));

      // Mostrar splash de completación antes de navegar
      setCompleteSplash({
        routineName: routine.name || 'Entrenamiento',
        exerciseCount: sessionExercises.length,
        totalSets: sessionExercises.reduce((sum: number, ex: any) => sum + ex.completedSets, 0),
        totalVolume: Math.round(totalVolume),
        durationSeconds: totalDuration,
      });
      setPendingNavigate(true);
    } catch (err) {
      console.error('Error saving session:', err);

      // Fallback: intentar guardar la sesión localmente para no perder datos
      try {
        const localSvc = await import('@/lib/storage/localStorage');
        await localSvc.saveSession(newSession as any);
        onSuccess('Sesión guardada localmente (sin conexión)', 4000);

        // Asegurarnos de limpiar active workout aunque la subida fallara
        try {
          await finishWorkoutContext();
        } catch (e) {
          console.error('Error clearing active workout after local save fallback:', e);
        }

        setShowNotesModal(false);
        setIsSaving(false);

        await new Promise(resolve => setTimeout(resolve, 100));
        setCompleteSplash({
          routineName: routine?.name || 'Entrenamiento',
          exerciseCount: 0,
          totalSets: 0,
          totalVolume: 0,
          durationSeconds: 0,
        });
        setPendingNavigate(true);
        return;
      } catch (localErr) {
        console.error('Error saving session locally as fallback:', localErr);
        onError('Error al guardar la sesión. Por favor, intenta nuevamente.');
        setIsSaving(false);
        return;
      }
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
    onAchievementUnlocked,
    confirm,
  ]);
  
  return {
    showNotesModal,
    setShowNotesModal,
    proposedDuration,
    setProposedDuration,
    sessionNotes,
    setSessionNotes,
    openCompletionModal,
    finishWorkout,
    completeSplash,
    isSaving,
    onCompleteSplashDone: useCallback(() => {
      setCompleteSplash(null);
      // El splash solo aparece tras completar exitosamente → siempre navegar a /sessions
      router.replace('/sessions');
      router.refresh();
    }, [router]),
  };
}
