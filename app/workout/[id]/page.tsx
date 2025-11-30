'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGym } from '@/context/GymContext';
import { useWorkout } from '@/context/WorkoutContext';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Timer } from '@/components/Timer';
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
  const { activeWorkout, startWorkout, updateWorkoutProgress, finishWorkout: finishWorkoutContext, cancelWorkout } = useWorkout();
  
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
  const [currentReps, setCurrentReps] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [sessionNotes, setSessionNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);

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
      
      const currentExercise = foundRoutine.exercises[activeWorkout.currentExerciseIndex];
      if (currentExercise) {
        setCurrentReps(currentExercise.reps);
        setCurrentWeight(currentExercise.weight || 0);
      }
    } else if (!activeWorkout) {
      // Si no hay workout activo, iniciar uno nuevo
      startWorkout(foundRoutine);
      
      // Inicializar valores del primer ejercicio
      if (foundRoutine.exercises && foundRoutine.exercises.length > 0 && foundRoutine.exercises[0]) {
        setCurrentReps(foundRoutine.exercises[0].reps);
        setCurrentWeight(foundRoutine.exercises[0].weight || 0);
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

  const isLastSet = currentSet >= currentExercise.sets;
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
        // Pasar al siguiente ejercicio - usar descanso inteligente
        const nextExercise = routine.exercises[currentExerciseIndex + 1];
        const nextExerciseTemplate = EXERCISE_DATABASE.find(e => e.name === nextExercise.name);
        const currentExerciseTemplate = EXERCISE_DATABASE.find(e => e.name === currentExercise.name);
        
        let restTime = routine.restBetweenExercises || 120;
        
        if (currentExerciseTemplate && nextExerciseTemplate) {
          const restRecommendation = calculateRestBetweenExercises(
            currentExerciseTemplate,
            nextExerciseTemplate,
            'intermediate' // Podrías obtener esto del perfil del usuario
          );
          restTime = restRecommendation.recommended;
        }
        
        setShowTimer(true);
        setTimerDuration(restTime);
        setTimerTitle('Descanso entre ejercicios');
        setNextExerciseName(nextExercise.name);
      }
    } else {
      // Descanso entre series - usar descanso inteligente
      const exerciseTemplate = EXERCISE_DATABASE.find(e => e.name === currentExercise.name);
      
      let restTime = routine.restBetweenSets || 60;
      
      if (exerciseTemplate) {
        const restRecommendation = calculateRestBetweenSets(
          exerciseTemplate,
          currentExercise.sets,
          currentExercise.reps,
          'intermediate' // Podrías obtener esto del perfil del usuario
        );
        restTime = restRecommendation.recommended;
      }
      
      setShowTimer(true);
      setTimerDuration(restTime);
      setTimerTitle(`Descanso - Serie ${currentSet + 1}/${currentExercise.sets}`);
      setNextExerciseName(undefined);
    }
  };

  const handleTimerComplete = () => {
    setShowTimer(false);
    
    if (isLastSet && !isLastExercise) {
      // Siguiente ejercicio
      const nextIndex = currentExerciseIndex + 1;
      if (routine.exercises[nextIndex]) {
        setCurrentExerciseIndex(nextIndex);
        setCurrentSet(1);
        setCurrentReps(routine.exercises[nextIndex].reps);
        setCurrentWeight(routine.exercises[nextIndex].weight || 0);
        
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
    // Guardar sesión
    const sessionExercises = routine.exercises.map(ex => ({
      exerciseId: ex.id,
      exerciseName: ex.name, // Guardar el nombre para facilitar búsquedas
      completedSets: completedSets[ex.id] || 0,
      actualReps: actualReps[ex.id] || [],
      actualWeight: actualWeights[ex.id] || []
    }));

    try {
      await addSession({
        routineId: routine.id,
        date: new Date(),
        exercises: sessionExercises,
        notes: sessionNotes.trim() || ''
      });
      
      // Limpiar el contexto de workout activo
      finishWorkoutContext();
      
      router.push('/sessions');
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Error al guardar la sesión. Por favor, intenta nuevamente.');
    }
  };

  const handleCancelWorkout = () => {
    if (confirm('¿Estás seguro de que quieres cancelar el entrenamiento? Se perderá todo el progreso.')) {
      cancelWorkout();
      router.push('/routines');
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
            <div className="text-xs text-gray-500 dark:text-gray-400">
              💡 Tip: Aprovecha este tiempo para hidratarte y respirar profundo
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
            <span>Serie {currentSet}/{currentExercise.sets}</span>
          </div>
        </div>

        {/* Progreso */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{
                width: `${((currentExerciseIndex * currentExercise.sets + currentSet - 1) / 
                  (routine.exercises.reduce((acc, ex) => acc + ex.sets, 0))) * 100}%`
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
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {currentExercise.sets}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Series</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {currentExercise.reps}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Repeticiones</div>
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
              
              {/* Información de descanso inteligente */}
              {(() => {
                const exerciseTemplate = EXERCISE_DATABASE.find(e => e.name === currentExercise.name);
                if (exerciseTemplate) {
                  const restRecommendation = calculateRestBetweenSets(
                    exerciseTemplate,
                    currentExercise.sets,
                    currentExercise.reps,
                    'intermediate'
                  );
                  return (
                    <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">⏱️</span>
                        <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                          Descanso recomendado
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                        {formatRestTime(restRecommendation.recommended)}
                      </div>
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        {restRecommendation.description}
                      </p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                        Rango: {formatRestTime(restRecommendation.min)} - {formatRestTime(restRecommendation.max)}
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
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
          <Button
            variant="primary"
            onClick={handleCompleteSet}
            className="flex-1"
            size="lg"
          >
            {isLastSet && isLastExercise 
              ? '✓ Finalizar entrenamiento' 
              : isLastSet 
                ? '→ Siguiente ejercicio' 
                : '✓ Completar serie'}
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
                    {exercise.sets}×{exercise.reps}
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
