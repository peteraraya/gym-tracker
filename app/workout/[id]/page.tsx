'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGym } from '@/context/GymContext';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Timer } from '@/components/Timer';
import { Input } from '@/components/ui/Input';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function WorkoutPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { getRoutineById, addSession } = useGym();
  const [routine, setRoutine] = useState(getRoutineById(id));
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [showTimer, setShowTimer] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
  const [timerTitle, setTimerTitle] = useState('');
  const [completedSets, setCompletedSets] = useState<{[key: string]: number}>({});
  const [actualReps, setActualReps] = useState<{[key: string]: number[]}>({});
  const [actualWeights, setActualWeights] = useState<{[key: string]: number[]}>({});
  const [currentReps, setCurrentReps] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(0);

  useEffect(() => {
    const foundRoutine = getRoutineById(id);
    if (!foundRoutine) {
      router.push('/routines');
      return;
    }
    setRoutine(foundRoutine);
    
    // Inicializar valores
    if (foundRoutine.exercises[0]) {
      setCurrentReps(foundRoutine.exercises[0].reps);
      setCurrentWeight(foundRoutine.exercises[0].weight || 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!routine) {
    return null;
  }

  const currentExercise = routine.exercises[currentExerciseIndex];
  const isLastSet = currentSet >= currentExercise.sets;
  const isLastExercise = currentExerciseIndex >= routine.exercises.length - 1;

  const handleCompleteSet = () => {
    const exerciseId = currentExercise.id;
    
    // Guardar repeticiones y peso de esta serie
    setActualReps(prev => ({
      ...prev,
      [exerciseId]: [...(prev[exerciseId] || []), currentReps]
    }));
    
    setActualWeights(prev => ({
      ...prev,
      [exerciseId]: [...(prev[exerciseId] || []), currentWeight]
    }));

    setCompletedSets(prev => ({
      ...prev,
      [exerciseId]: (prev[exerciseId] || 0) + 1
    }));

    if (isLastSet) {
      if (isLastExercise) {
        // Finalizar entrenamiento
        finishWorkout();
      } else {
        // Pasar al siguiente ejercicio
        setShowTimer(true);
        setTimerDuration(routine.restBetweenExercises || 120);
        setTimerTitle('Descanso entre ejercicios');
      }
    } else {
      // Descanso entre series
      setShowTimer(true);
      setTimerDuration(routine.restBetweenSets || 60);
      setTimerTitle(`Descanso - Serie ${currentSet + 1}/${currentExercise.sets}`);
    }
  };

  const handleTimerComplete = () => {
    setShowTimer(false);
    
    if (isLastSet && !isLastExercise) {
      // Siguiente ejercicio
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      setCurrentSet(1);
      setCurrentReps(routine.exercises[nextIndex].reps);
      setCurrentWeight(routine.exercises[nextIndex].weight || 0);
    } else {
      // Siguiente serie
      setCurrentSet(currentSet + 1);
    }
  };

  const finishWorkout = async () => {
    // Guardar sesión
    const sessionExercises = routine.exercises.map(ex => ({
      exerciseId: ex.id,
      completedSets: completedSets[ex.id] || 0,
      actualReps: actualReps[ex.id] || [],
      actualWeight: actualWeights[ex.id] || []
    }));

    try {
      await addSession({
        routineId: routine.id,
        date: new Date(),
        exercises: sessionExercises,
        notes: ''
      });
      router.push('/sessions');
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Error al guardar la sesión');
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
          />
          <div className="mt-4 text-center">
            <Button variant="ghost" onClick={skipTimer}>
              Saltar descanso
            </Button>
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
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => router.push('/routines')}
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
    </div>
    </ProtectedRoute>
  );
}
