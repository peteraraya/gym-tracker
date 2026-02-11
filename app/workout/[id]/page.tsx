'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGym } from '@/context/GymContext';
import { useWorkout } from '@/context/WorkoutContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Timer } from '@/components/Timer';
import { SetTimer } from '@/components/SetTimer';
import { Input } from '@/components/ui/Input';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  calculateRestBetweenSets, 
  calculateRestBetweenExercises,
  formatRestTime 
} from '@/lib/restCalculator';
import { EXERCISE_DATABASE } from '@/data/exercises';

export default function WorkoutPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { getRoutineById, addSession } = useGym();
  const { activeWorkout, startWorkout, updateWorkoutProgress, clearRestState, finishWorkout: finishWorkoutContext, cancelWorkout } = useWorkout();
  const { success, error } = useToast();
  const { confirm } = useConfirm();
  
  const [routine, setRoutine] = useState(getRoutineById(id));
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [showTimer, setShowTimer] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
  const [timerTitle, setTimerTitle] = useState('');
  const [nextExerciseName, setNextExerciseName] = useState<string | undefined>(undefined);
  const [completedSets, setCompletedSets] = useState<{[key: string]: number}>({});
  const [actualReps, setActualReps] = useState<{[key: string]: number[]}>({});
  const [actualWeights, setActualWeights] = useState<{[key: string]: number[]}>({});
  const [actualSetDurations, setActualSetDurations] = useState<{[key: string]: number[]}>({});
  const [actualPauseDurations, setActualPauseDurations] = useState<{[key: string]: number[]}>({});
  const [currentReps, setCurrentReps] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [sessionNotes, setSessionNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [workoutStartTime] = useState(Date.now());
  const [totalPausedTime, setTotalPausedTime] = useState(0);
  const [useSmartRest, setUseSmartRest] = useState(true); // Descanso inteligente activado por defecto

  useEffect(() => {
    const foundRoutine = getRoutineById(id);
    if (!foundRoutine) {
      router.push('/routines');
      return;
    }
    setRoutine(foundRoutine);
    
    // Si hay un workout activo y coincide con esta rutina, restaurar el estado
    if (activeWorkout && activeWorkout.routineId === id) {
      setCurrentExerciseIndex(activeWorkout.currentExerciseIndex);
      setCurrentSet(activeWorkout.currentSet);
      setCompletedSets(activeWorkout.completedSets);
      setActualReps(activeWorkout.actualReps);
      setActualWeights(activeWorkout.actualWeights);
      
      // Restaurar estado del timer de descanso si estaba descansando
      if (activeWorkout.isResting && activeWorkout.restTimerDuration && activeWorkout.restTimerStartedAt) {
        const elapsed = Math.floor((Date.now() - activeWorkout.restTimerStartedAt) / 1000);
        const remaining = activeWorkout.restTimerDuration - elapsed;
        if (remaining > 0) {
          setShowTimer(true);
          setTimerDuration(remaining);
          setTimerTitle(activeWorkout.restTimerTitle || 'Descanso');
          setNextExerciseName(activeWorkout.restTimerNextExercise);
        }
      }
      
      const currentExercise = foundRoutine.exercises[activeWorkout.currentExerciseIndex];
      if (currentExercise) {
        const currentSetData = currentExercise.sets[activeWorkout.currentSet - 1];
        if (currentSetData) {
          setCurrentReps(currentSetData.reps);
          setCurrentWeight(currentSetData.weight || 0);
        }
      }
    } else if (!activeWorkout) {
      // Si no hay workout activo, iniciar uno nuevo
      startWorkout(foundRoutine);
      
      // Inicializar valores del primer ejercicio (primera serie)
      if (foundRoutine.exercises && foundRoutine.exercises.length > 0 && foundRoutine.exercises[0]) {
        const firstExercise = foundRoutine.exercises[0];
        const firstSet = firstExercise.sets[0];
        if (firstSet) {
          setCurrentReps(firstSet.reps);
          setCurrentWeight(firstSet.weight || 0);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!routine || !routine.exercises || routine.exercises.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Esta rutina no tiene ejercicios configurados.
            </p>
            <Button onClick={() => router.push('/routines')}>
              Volver a rutinas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentExercise = routine.exercises[currentExerciseIndex];
  
  if (!currentExercise) {
    return null;
  }

  const isLastSet = currentSet >= currentExercise.sets.length;
  const isLastExercise = currentExerciseIndex >= routine.exercises.length - 1;

  const handleCompleteSet = () => {
    const exerciseId = currentExercise.id;
    
    // Guardar repeticiones y peso de esta serie
    const newActualReps = {
      ...actualReps,
      [exerciseId]: [...(actualReps[exerciseId] || []), currentReps]
    };
    
    const newActualWeights = {
      ...actualWeights,
      [exerciseId]: [...(actualWeights[exerciseId] || []), currentWeight]
    };

    const newCompletedSets = {
      ...completedSets,
      [exerciseId]: (completedSets[exerciseId] || 0) + 1
    };

    setActualReps(newActualReps);
    setActualWeights(newActualWeights);
    setCompletedSets(newCompletedSets);

    // Actualizar el contexto global
    updateWorkoutProgress(
      currentExerciseIndex,
      currentSet,
      newCompletedSets,
      newActualReps,
      newActualWeights
    );

    if (isLastSet) {
      if (isLastExercise) {
        // Mostrar modal para notas antes de finalizar
        setShowNotesModal(true);
      } else {
        // Pasar al siguiente ejercicio
        const nextExercise = routine.exercises[currentExerciseIndex + 1];
        const nextExerciseTemplate = EXERCISE_DATABASE.find(e => e.name === nextExercise.name);
        const currentExerciseTemplate = EXERCISE_DATABASE.find(e => e.name === currentExercise.name);
        
        // Prioridad: 1) Override del ejercicio, 2) Valor de la rutina, 3) Cálculo inteligente, 4) Fallback
        let restTime = routine.restBetweenExercises || 120;
        
        if (useSmartRest && currentExerciseTemplate && nextExerciseTemplate) {
          const restRecommendation = calculateRestBetweenExercises(
            currentExerciseTemplate,
            nextExerciseTemplate,
            'intermediate'
          );
          restTime = restRecommendation.recommended;
        }
        
        setShowTimer(true);
        setTimerDuration(restTime);
        setTimerTitle('Descanso entre ejercicios');
        setNextExerciseName(nextExercise.name);
        
        // Persistir estado del timer
        updateWorkoutProgress(
          currentExerciseIndex,
          currentSet,
          newCompletedSets,
          newActualReps,
          newActualWeights,
          { isResting: true, restTimerDuration: restTime, restTimerTitle: 'Descanso entre ejercicios', restTimerNextExercise: nextExercise.name, restTimerStartedAt: Date.now() }
        );
      }
    } else {
      // Descanso entre series
      // Prioridad: 1) Override del ejercicio actual, 2) Valor global de la rutina, 3) Cálculo inteligente, 4) Fallback 60s
      let restTime: number;
      
      if (currentExercise.restBetweenSets && currentExercise.restBetweenSets > 0) {
        // El ejercicio tiene su propio tiempo de descanso configurado
        restTime = currentExercise.restBetweenSets;
      } else if (routine.restBetweenSets && routine.restBetweenSets > 0) {
        // Usar el valor global de la rutina
        restTime = routine.restBetweenSets;
      } else if (useSmartRest) {
        // Cálculo inteligente como fallback
        const exerciseTemplate = EXERCISE_DATABASE.find(e => e.name === currentExercise.name);
        if (exerciseTemplate) {
          const currentSetData = currentExercise.sets[currentSet - 1];
          const restRecommendation = calculateRestBetweenSets(
            exerciseTemplate,
            currentExercise.sets.length,
            currentSetData?.reps || 10,
            'intermediate'
          );
          restTime = restRecommendation.recommended;
        } else {
          restTime = 60;
        }
      } else {
        restTime = 60;
      }
      
      const timerTitleText = `Descanso - Serie ${currentSet + 1}/${currentExercise.sets.length}`;
      
      setShowTimer(true);
      setTimerDuration(restTime);
      setTimerTitle(timerTitleText);
      setNextExerciseName(undefined);
      
      // Persistir estado del timer
      updateWorkoutProgress(
        currentExerciseIndex,
        currentSet,
        newCompletedSets,
        newActualReps,
        newActualWeights,
        { isResting: true, restTimerDuration: restTime, restTimerTitle: timerTitleText, restTimerStartedAt: Date.now() }
      );
    }
  };

  const handleSetTimerComplete = (duration: number, pausedTime: number) => {
    const exerciseId = currentExercise.id;
    
    // Guardar duración y tiempo pausado de esta serie
    const newActualSetDurations = {
      ...actualSetDurations,
      [exerciseId]: [...(actualSetDurations[exerciseId] || []), duration]
    };
    
    const newActualPauseDurations = {
      ...actualPauseDurations,
      [exerciseId]: [...(actualPauseDurations[exerciseId] || []), pausedTime]
    };

    setActualSetDurations(newActualSetDurations);
    setActualPauseDurations(newActualPauseDurations);
    setTotalPausedTime(prev => prev + pausedTime);

    // Completar la serie después de registrar los tiempos
    handleCompleteSet();
  };

  const handleTimerComplete = () => {
    setShowTimer(false);
    clearRestState(); // Limpiar estado de descanso persistido
    
    if (isLastSet && !isLastExercise) {
      // Siguiente ejercicio
      const nextIndex = currentExerciseIndex + 1;
      if (routine.exercises[nextIndex]) {
        setCurrentExerciseIndex(nextIndex);
        setCurrentSet(1);
        const nextExercise = routine.exercises[nextIndex];
        const firstSet = nextExercise.sets[0];
        if (firstSet) {
          setCurrentReps(firstSet.reps);
          setCurrentWeight(firstSet.weight || 0);
        }
        
        // Actualizar contexto
        updateWorkoutProgress(
          nextIndex,
          1,
          completedSets,
          actualReps,
          actualWeights
        );
      }
    } else {
      // Siguiente serie
      const newSet = currentSet + 1;
      setCurrentSet(newSet);
      
      // Actualizar valores con los de la siguiente serie
      const nextSetData = currentExercise.sets[newSet - 1];
      if (nextSetData) {
        setCurrentReps(nextSetData.reps);
        setCurrentWeight(nextSetData.weight || 0);
      }
      
      // Actualizar contexto
      updateWorkoutProgress(
        currentExerciseIndex,
        newSet,
        completedSets,
        actualReps,
        actualWeights
      );
    }
  };

  const finishCompleteWorkout = async () => {
    // Calcular duración total del entrenamiento
    const totalDuration = Math.floor((Date.now() - workoutStartTime) / 1000);

    // Guardar sesión
    const sessionExercises = routine.exercises.map(ex => ({
      exerciseId: ex.id,
      exerciseName: ex.name, // Guardar el nombre para facilitar búsquedas
      completedSets: completedSets[ex.id] || 0,
      actualReps: actualReps[ex.id] || [],
      actualWeight: actualWeights[ex.id] || [],
      setDurations: actualSetDurations[ex.id] || [],
      pauseDurations: actualPauseDurations[ex.id] || []
    }));

    try {
      await addSession({
        routineId: routine.id,
        date: new Date(),
        exercises: sessionExercises,
        notes: sessionNotes.trim() || '',
        totalDuration,
        totalPausedTime
      });
      
      // Limpiar el contexto de workout activo
      finishWorkoutContext();
      
      success('Sesión guardada exitosamente');
      router.push('/sessions');
    } catch (err) {
      console.error('Error saving session:', err);
      error('Error al guardar la sesión. Por favor, intenta nuevamente.');
    }
  };

  const handleCancelWorkout = async () => {
    const confirmed = await confirm({
      title: 'Cancelar entrenamiento',
      message: '¿Estás seguro de que quieres cancelar el entrenamiento? Se perderá todo el progreso.',
      confirmText: 'Sí, cancelar',
      cancelText: 'Continuar entrenamiento',
      variant: 'danger'
    });
    
    if (confirmed) {
      try {
        localStorage.setItem('gym-tracker-cancelled', Date.now().toString());
      } catch (e) {}

      // Remove any modal/backdrop elements that might have been left behind
      try {
        document.querySelectorAll('.modal-backdrop, .modal-overlay, [data-backdrop]').forEach(el => el.remove());
      } catch (e) {}

      cancelWorkout();
      // Use replace so user doesn't return to the canceled workout via back
      router.replace('/routines');
    }
  };

  const skipTimer = () => {
    handleTimerComplete();
  };

  if (showTimer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Timer
            duration={timerDuration}
            onComplete={handleTimerComplete}
            autoStart={true}
            title={timerTitle}
            nextExerciseName={nextExerciseName}
            showMotivation={true}
          />
          <div className="mt-6 text-center space-y-3">
            <Button variant="ghost" onClick={skipTimer} className="w-full">
              ⏭️ Saltar descanso
            </Button>
            {/* Indicador del tiempo configurado */}
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>⏱️ Tiempo configurado: {Math.floor(timerDuration / 60)}:{(timerDuration % 60).toString().padStart(2, '0')}</p>
              <p>💡 Tip: Aprovecha este tiempo para hidratarte y respirar profundo</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {routine.name}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Ejercicio {currentExerciseIndex + 1}/{routine.exercises.length}</span>
            <span>•</span>
            <span>Serie {currentSet}/{currentExercise.sets.length}</span>
          </div>
        </div>

        {/* Progreso */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{
                width: `${((currentExerciseIndex * currentExercise.sets.length + currentSet - 1) / 
                  (routine.exercises.reduce((acc, ex) => acc + ex.sets.length, 0))) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Ejercicio actual */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{currentExercise.name}</CardTitle>
            {currentExercise.notes && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {currentExercise.notes}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Cronómetro de serie */}
              <div className="mb-6">
                <SetTimer 
                  onComplete={handleSetTimerComplete}
                  autoStart={true}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {currentExercise.sets.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Series totales</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {currentExercise.sets[currentSet - 1]?.reps || 10}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Reps (Serie {currentSet})</div>
                </div>
              </div>

              <div className="space-y-3">
                <Input
                  type="number"
                  label="Repeticiones realizadas"
                  value={currentReps}
                  onChange={(e) => setCurrentReps(parseInt(e.target.value) || 0)}
                  min="0"
                />
                <Input
                  type="number"
                  label="Peso utilizado (kg)"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.5"
                />
              </div>
              
              {/* Información de descanso */}
              <div className="mt-4 space-y-3">
                {/* Tiempo de descanso configurado */}
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⏱️</span>
                      <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        Descanso entre series
                      </span>
                    </div>
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {(() => {
                        const restSecs = currentExercise.restBetweenSets || routine.restBetweenSets || 60;
                        return `${Math.floor(restSecs / 60)}:${(restSecs % 60).toString().padStart(2, '0')}`;
                      })()}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {currentExercise.restBetweenSets 
                      ? '⚙️ Configurado para este ejercicio'
                      : routine.restBetweenSets 
                        ? '⚙️ Configurado en la rutina'
                        : '⚙️ Valor por defecto (60s)'}
                  </p>
                </div>

                {/* Toggle y sugerencia inteligente */}
                {(() => {
                  const exerciseTemplate = EXERCISE_DATABASE.find(e => e.name === currentExercise.name);
                  if (exerciseTemplate) {
                    const currentSetData = currentExercise.sets[currentSet - 1];
                    const restRecommendation = calculateRestBetweenSets(
                      exerciseTemplate,
                      currentExercise.sets.length,
                      currentSetData?.reps || 10,
                      'intermediate'
                    );
                    return (
                      <div className={`p-3 rounded-lg border ${
                        useSmartRest 
                          ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' 
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🧠</span>
                            <span className={`text-sm font-semibold ${
                              useSmartRest 
                                ? 'text-purple-900 dark:text-purple-100' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              Descanso inteligente
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setUseSmartRest(!useSmartRest)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              useSmartRest ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              useSmartRest ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                        {useSmartRest ? (
                          <>
                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-1">
                              {formatRestTime(restRecommendation.recommended)}
                            </div>
                            <p className="text-xs text-purple-700 dark:text-purple-300">
                              {restRecommendation.description}
                            </p>
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                              Rango: {formatRestTime(restRecommendation.min)} - {formatRestTime(restRecommendation.max)}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Actívalo para usar tiempos calculados según el tipo de ejercicio y series
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={handleCancelWorkout}
            className="flex-1"
          >
            Cancelar
          </Button>
        </div>

        {/* Lista de ejercicios siguientes */}
        {currentExerciseIndex < routine.exercises.length - 1 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Próximos ejercicios
            </h3>
            <div className="space-y-2">
              {routine.exercises.slice(currentExerciseIndex + 1).map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="text-gray-900 dark:text-gray-100">{exercise.name}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {exercise.sets.length} series
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de notas al finalizar */}
      <Modal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        title="¡Entrenamiento completado! 🎉"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            ¿Quieres agregar alguna nota sobre este entrenamiento?
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notas (opcional)
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Ej: Me sentí muy fuerte hoy, aumentar peso la próxima vez..."
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setSessionNotes('');
                setShowNotesModal(false);
                finishCompleteWorkout();
              }}
              className="flex-1"
            >
              Omitir
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowNotesModal(false);
                finishCompleteWorkout();
              }}
              className="flex-1"
            >
              Guardar y finalizar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
    </ProtectedRoute>
  );
}
