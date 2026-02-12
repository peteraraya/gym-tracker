'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Timer } from '@/components/Timer';
import { SetTimer } from '@/components/SetTimer';
import { Input } from '@/components/ui/Input';
import { RestTimeSelector } from '@/components/RestTimeSelector';
import { ExerciseSelector } from '@/components/ExerciseSelector';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  calculateRestBetweenSets,
  formatRestTime
} from '@/lib/restCalculator';
import { EXERCISE_DATABASE, ExerciseTemplate } from '@/data/exercises';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Zap
} from 'lucide-react';

interface FreeExercise {
  id: string;
  name: string;
  equipment?: string;
  completedSets: { reps: number; weight: number; duration?: number }[];
  restBetweenSets?: number;
}

export default function FreeWorkoutPage() {
  const router = useRouter();
  const { addSession } = useGym();
  const { success, error } = useToast();
  const { confirm } = useConfirm();

  const [exercises, setExercises] = useState<FreeExercise[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('gym-tracker-free-workout');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.exercises || [];
      }
    } catch (e) {
      console.error('Error restoring free workout:', e);
    }
    return [];
  });
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('gym-tracker-free-workout');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.activeExerciseIndex ?? null;
      }
    } catch { /* ignore */ }
    return null;
  });
  const [currentReps, setCurrentReps] = useState<number | ''>(10);
  const [currentWeight, setCurrentWeight] = useState<number | ''>(0);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [proposedDuration, setProposedDuration] = useState<number>(0); // seconds
  const [workoutStartTime] = useState(() => Date.now());
  const [totalPausedTime, setTotalPausedTime] = useState(0);

  // Timer state
  const [showTimer, setShowTimer] = useState(false);
  const [timerDuration, setTimerDuration] = useState(60);
  const [timerTitle, setTimerTitle] = useState('');

  // Smart rest
  const [useSmartRest, setUseSmartRest] = useState(true);
  const [globalRestTime, setGlobalRestTime] = useState(() => {
    if (typeof window === 'undefined') return 60;
    try {
      const stored = localStorage.getItem('gym-tracker-free-workout');
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Revisa la duración y agrega una nota antes de guardar la sesión.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selecciona duración</label>
            <select
              value={Math.floor(proposedDuration / 60)}
              onChange={(e) => setProposedDuration(Math.max(0, parseInt(e.target.value || '0')) * 60)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700"
            >
              {Array.from({ length: 59 }, (_, i) => i + 1).map(m => (
                <option key={`m-${m}`} value={m}>{m} min</option>
              ))}
              {Array.from({ length: 5 }, (_, i) => i + 1).map(h => (
                <option key={`h-${h}`} value={h * 60}>{h} h</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notas (opcional)
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Ej: Probé un nuevo ejercicio, me gustó la variación..."
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
      setActiveExerciseIndex(exercises.length);
    }
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
    if (activeExerciseIndex === index) {
      setActiveExerciseIndex(null);
    } else if (activeExerciseIndex !== null && activeExerciseIndex > index) {
      setActiveExerciseIndex(activeExerciseIndex - 1);
    }
  };

  const handleCompleteSet = () => {
    if (activeExerciseIndex === null) return;

    const exercise = exercises[activeExerciseIndex];
    if (!exercise) return;

    // Add set (normalizar valores vacíos a 0)
    const repsValue = typeof currentReps === 'number' ? currentReps : 0;
    const weightValue = typeof currentWeight === 'number' ? currentWeight : 0;

    // Add set
    const newExercises = [...exercises];
    newExercises[activeExerciseIndex] = {
      ...exercise,
      completedSets: [
        ...exercise.completedSets,
        { reps: repsValue, weight: weightValue }
      ]
    };
    setExercises(newExercises);

    // Calculate rest time
    let restTime: number;

    if (exercise.restBetweenSets && exercise.restBetweenSets > 0) {
      restTime = exercise.restBetweenSets;
    } else if (useSmartRest) {
      const template = EXERCISE_DATABASE.find(e => e.name === exercise.name);
      if (template) {
        const rec = calculateRestBetweenSets(
          template,
          exercise.completedSets.length + 1,
          currentReps,
          'intermediate'
        );
        restTime = rec.recommended;
      } else {
        restTime = globalRestTime;
      }
    } else {
      restTime = globalRestTime;
    }

    const setNumber = exercise.completedSets.length + 1;
    setTimerTitle(`Descanso - Serie ${setNumber} completada`);
    setTimerDuration(restTime);
    setShowTimer(true);
  };

  const handleSetTimerComplete = (duration: number, pausedTime: number) => {
    setTotalPausedTime(prev => prev + pausedTime);
    handleCompleteSet();
  };

  const handleTimerComplete = () => {
    setShowTimer(false);
  };

  const handleFinishWorkout = () => {
    if (exercises.length === 0 || exercises.every(e => e.completedSets.length === 0)) {
      error('No hay series completadas para guardar');
      return;
    }
    const duration = Math.floor((Date.now() - workoutStartTime) / 1000);
    setProposedDuration(Math.max(duration, 60));
    setShowNotesModal(true);
  };

  const finishCompleteWorkout = async () => {
    const totalDuration = proposedDuration && proposedDuration > 0
      ? proposedDuration
      : Math.floor((Date.now() - workoutStartTime) / 1000);

    const sessionExercises = exercises
      .filter(ex => ex.completedSets.length > 0)
      .map(ex => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        completedSets: ex.completedSets.length,
        actualReps: ex.completedSets.map(s => s.reps),
        actualWeight: ex.completedSets.map(s => s.weight),
        setDurations: ex.completedSets.map(s => s.duration || 0),
        pauseDurations: []
      }));

    try {
      await addSession({
        routineId: 'free-training',
        routineName: '🏋️ Entrenamiento Libre',
        date: new Date(),
        exercises: sessionExercises,
        notes: sessionNotes.trim() || '',
        totalDuration,
        totalPausedTime
      });

      clearStorage();
      success('¡Sesión de entrenamiento libre guardada!');
      router.push('/sessions');
    } catch (err) {
      console.error('Error saving free training session:', err);
      error('Error al guardar la sesión');
    }
  };

  const handleCancelWorkout = async () => {
    const confirmed = await confirm({
      title: 'Cancelar entrenamiento',
      message: '¿Estás seguro? Se perderá todo el progreso del entrenamiento libre.',
      confirmText: 'Sí, cancelar',
      cancelText: 'Continuar',
      variant: 'danger'
    });

    if (confirmed) {
      clearStorage();
      router.replace('/routines');
    }
  };

  const toggleCollapse = (index: number) => {
    setCollapsedExercises(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const activeExercise = activeExerciseIndex !== null ? exercises[activeExerciseIndex] : null;

  // Timer screen
  if (showTimer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Timer
            duration={timerDuration}
            onComplete={handleTimerComplete}
            autoStart={true}
            title={timerTitle}
            showMotivation={true}
          />
          <div className="mt-6 text-center space-y-3">
            <Button variant="ghost" onClick={handleTimerComplete} className="w-full">
              ⏭️ Saltar descanso
            </Button>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>💡 Tip: Aprovecha para hidratarte y respirar profundo</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3 mb-2">
              <div className="p-2 bg-linear-to-br from-orange-500 to-red-600 rounded-xl">
                <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              Entrenamiento Libre
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Entrena sin rutina predefinida. Agrega ejercicios y registra series sobre la marcha.
            </p>
          </div>

          {/* Configuración de descanso */}
          <Card className="mb-6">
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 w-full">
                  <RestTimeSelector
                    label="⏱️ Descanso por defecto"
                    value={globalRestTime}
                    onChange={setGlobalRestTime}
                    includeZero={false}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">🧠 Inteligente</span>
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
              </div>
            </CardContent>
          </Card>

          {/* Ejercicio activo */}
          {activeExercise && (
            <Card className="mb-6 border-2 border-orange-400 dark:border-orange-600">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-orange-500" />
                  {activeExercise.name || 'Ejercicio sin nombre'}
                </CardTitle>
                {activeExercise.equipment && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    🏋️ {activeExercise.equipment}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Set timer */}
                  <div className="mb-4">
                    <SetTimer
                      onComplete={handleSetTimerComplete}
                      autoStart={true}
                    />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {activeExercise.completedSets.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Series hechas</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {activeExercise.completedSets.reduce((sum, s) => sum + s.reps, 0)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Reps totales</div>
                    </div>
                  </div>

                  {/* Input reps/weight */}
                  <div className="space-y-3">
                    <Input
                      type="number"
                      label="Repeticiones"
                      value={currentReps}
                      onChange={(e) => setCurrentReps(e.target.value === '' ? '' : parseInt(e.target.value))}
                      min="0"
                    />
                    <Input
                      type="number"
                      label="Peso (kg)"
                      value={currentWeight}
                      onChange={(e) => setCurrentWeight(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      min="0"
                      step="0.5"
                    />
                  </div>

                  {/* Complete set button */}
                  <Button
                    variant="primary"
                    onClick={handleCompleteSet}
                    className="w-full text-lg py-3"
                  >
                    ✅ Completar serie {activeExercise.completedSets.length + 1}
                  </Button>

                  {/* Sets history */}
                  {activeExercise.completedSets.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Series completadas:</p>
                      <div className="space-y-1">
                        {activeExercise.completedSets.map((set, i) => (
                          <div key={i} className="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <span className="text-gray-600 dark:text-gray-400">Serie {i + 1}</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {set.reps} reps × {set.weight}kg
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Smart rest info */}
                  {useSmartRest && (() => {
                    const template = EXERCISE_DATABASE.find(e => e.name === activeExercise.name);
                    if (template) {
                      const rec = calculateRestBetweenSets(template, activeExercise.completedSets.length + 1, currentReps, 'intermediate');
                      return (
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-2 mb-1">
                            <span>🧠</span>
                            <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                              Descanso sugerido: {formatRestTime(rec.recommended)}
                            </span>
                          </div>
                          <p className="text-xs text-purple-700 dark:text-purple-300">{rec.description}</p>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de ejercicios */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Ejercicios ({exercises.length})
              </h2>
              <div className="flex gap-2">
                <Button variant="primary" size="sm" onClick={() => setShowExerciseSelector(true)}>
                  <Plus className="w-4 h-4" />
                  Agregar
                </Button>
              </div>
            </div>

            {exercises.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Dumbbell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Aún no has agregado ejercicios
                </p>
                <Button variant="primary" onClick={() => setShowExerciseSelector(true)}>
                  <Plus className="w-4 h-4" />
                  Agregar ejercicio
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {exercises.map((exercise, index) => {
                  const isActive = activeExerciseIndex === index;
                  const isCollapsed = collapsedExercises.has(index);

                  return (
                    <div
                      key={exercise.id}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        isActive
                          ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-600'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300'
                      }`}
                      onClick={() => {
                        if (!isActive) setActiveExerciseIndex(index);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-bold ${
                            isActive ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500'
                          }`}>
                            {index + 1}
                          </span>
                          <div>
                            <p className={`font-medium ${
                              isActive ? 'text-orange-900 dark:text-orange-100' : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {exercise.name || 'Sin nombre'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {exercise.completedSets.length} series completadas
                              {exercise.completedSets.length > 0 && (
                                <> • {exercise.completedSets.reduce((s, set) => s + set.reps, 0)} reps totales</>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {exercise.completedSets.length > 0 && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); toggleCollapse(index); }}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleRemoveExercise(index); }}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded sets */}
                      {!isCollapsed && exercise.completedSets.length > 0 && (
                        <div className="mt-2 pl-8 space-y-1">
                          {exercise.completedSets.map((set, i) => (
                            <div key={i} className="text-xs text-gray-600 dark:text-gray-400 flex justify-between">
                              <span>Serie {i + 1}</span>
                              <span>{set.reps} reps × {set.weight}kg</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 sticky bottom-4">
            <Button
              variant="ghost"
              onClick={handleCancelWorkout}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleFinishWorkout}
              className="flex-1"
              disabled={exercises.every(e => e.completedSets.length === 0)}
            >
              ✅ Finalizar entrenamiento
            </Button>
          </div>
        </div>
      </div>

      {/* Notes modal */}
      <Modal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        title="¡Entrenamiento completado! 🎉"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            ¿Quieres agregar alguna nota sobre este entrenamiento libre?
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notas (opcional)
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Ej: Probé un nuevo ejercicio, me gustó la variación..."
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

      {/* Exercise selector modal */}
      <Modal
        isOpen={showExerciseSelector}
        onClose={() => setShowExerciseSelector(false)}
        title="Seleccionar ejercicios"
      >
        <ExerciseSelector
          onSelectExercises={handleAddExercises}
          onClose={() => setShowExerciseSelector(false)}
        />
      </Modal>
    </ProtectedRoute>
  );
}
