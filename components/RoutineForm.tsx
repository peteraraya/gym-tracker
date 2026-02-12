'use client';

import React, { useState, useEffect } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { Exercise } from '@/types';
import { Input, TextArea } from '@/components/ui/Input';
import { useTranslations } from '@/context/LocaleContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ExerciseSelector } from '@/components/ExerciseSelector';
import { EquipmentDropdown } from '@/components/EquipmentDropdown';
import { RestTimeSelector, RestTimeSelectorCompact } from '@/components/RestTimeSelector';
import { ExerciseTemplate, getExerciseByName, MuscleGroup } from '@/data/exercises';
import { WarmupExercise } from '@/data/warmupExercises';
import { WarmupRecommendation } from '@/components/WarmupRecommendation';

interface RoutineFormProps {
  routineId?: string | null;
  onClose: () => void;
}

export const RoutineForm: React.FC<RoutineFormProps> = ({ routineId, onClose }) => {
  const { addRoutine, updateRoutine, getRoutineById } = useGym();
  const { success, error } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string>('');
  const [exercises, setExercises] = useState<Omit<Exercise, 'id'>[]>([]);
  const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);
  const [restBetweenSets, setRestBetweenSets] = useState(60);
  const [restBetweenExercises, setRestBetweenExercises] = useState(120);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Array<{ exerciseIndex: number; setIndex: number; message: string }>>([]);

  useEffect(() => {
    if (routineId) {
      const routine = getRoutineById(routineId);
      if (routine) {
        setName(routine.name);
        setDescription(routine.description || '');
        setImage(routine.image || '');
        // Migrar formato antiguo a nuevo si es necesario
        const migratedExercises = routine.exercises.map(({ id, ...rest }) => {
          // Si el ejercicio usa formato antiguo (sets: number), convertir a nuevo formato
          if (typeof (rest as any).sets === 'number') {
            const oldSets = (rest as any).sets;
            const oldReps = (rest as any).reps || 10;
            const oldWeight = (rest as any).weight || 0;
            const newExercise = {
              name: rest.name,
              equipment: rest.equipment,
              notes: rest.notes,
              sets: Array(oldSets).fill(null).map(() => ({ 
                reps: oldReps, 
                weight: oldWeight 
              }))
            };
            return newExercise;
          }
          return rest;
        });
        setExercises(migratedExercises);
        setRestBetweenSets(routine.restBetweenSets || 60);
        setRestBetweenExercises(routine.restBetweenExercises || 120);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routineId]);

  const handleAddExercise = () => {
    setIsExerciseSelectorOpen(true);
  };

  const handleSelectExercises = (exerciseTemplates: ExerciseTemplate[]) => {
    const newExercises: Omit<Exercise, 'id'>[] = exerciseTemplates.map(template => {
      // Parsear restTime del template a segundos (ej: "60-90 segundos" -> 60)
      let defaultRestSecs: number | undefined;
      if (template.restTime) {
        const match = template.restTime.match(/(\d+)/);
        if (match) {
          defaultRestSecs = parseInt(match[1]);
          // Si es "2-3 minutos", convertir a segundos
          if (template.restTime.toLowerCase().includes('minuto')) {
            defaultRestSecs = defaultRestSecs * 60;
          }
        }
      }
      return {
        name: template.name,
        sets: Array(template.defaultSets || 3).fill(null).map(() => ({ 
          reps: template.defaultReps || 10, 
          weight: 0 
        })),
        equipment: template.equipment,
        notes: '',
        restBetweenSets: defaultRestSecs
      };
    });
    setExercises([...exercises, ...newExercises]);
    setIsExerciseSelectorOpen(false);
  };

  const handleAddCustomExercise = () => {
    setExercises([...exercises, { 
      name: '', 
      sets: [{ reps: 10, weight: 0 }], 
      equipment: '', 
      notes: '' 
    }]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (index: number, field: keyof Exercise, value: string) => {
    const newExercises = [...exercises];
    (newExercises[index] as any)[field] = value;
    setExercises(newExercises);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const newExercises = [...exercises];
    const exercise = newExercises[exerciseIndex];
    const lastSet = exercise.sets[exercise.sets.length - 1];
    // Pre-llenar con valores de la última serie
    exercise.sets.push({ 
      reps: lastSet?.reps || 10, 
      weight: lastSet?.weight || 0 
    });
    setExercises(newExercises);
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises];
    if (newExercises[exerciseIndex].sets.length > 1) {
      newExercises[exerciseIndex].sets.splice(setIndex, 1);
      setExercises(newExercises);
    }
  };

  const handleCopySet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises];
    const exercise = newExercises[exerciseIndex];
    const setToCopy = exercise.sets[setIndex];
    exercise.sets.splice(setIndex + 1, 0, { ...setToCopy });
    setExercises(newExercises);
  };

  const handleSetChange = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(newExercises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevenir múltiples envíos
    // Validación: asegurar que todos los pesos sean mayores a 0
    const errors: Array<{ exerciseIndex: number; setIndex: number; message: string }> = [];
    exercises.forEach((exercise, ei) => {
      exercise.sets.forEach((s, si) => {
        const weight = typeof s.weight === 'number' ? s.weight : parseFloat(String(s.weight || 0));
        if (!weight || weight <= 0) {
          errors.push({ exerciseIndex: ei, setIndex: si, message: 'Peso requerido (> 0)' });
        }
      });
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      // Enfocar en el primer campo con error si es posible
      try {
        const first = errors[0];
        const selector = `input[name=weight-${first.exerciseIndex}-${first.setIndex}]`;
        const el = typeof window !== 'undefined' ? document.querySelector(selector) as HTMLElement | null : null;
        el?.focus();
      } catch (e) {}
      return;
    }

    setValidationErrors([]);
    setIsSubmitting(true);

    const exercisesWithIds: Exercise[] = exercises.map((exercise, index) => ({
      ...exercise,
      id: routineId 
        ? getRoutineById(routineId)?.exercises[index]?.id || `ex-${routineId}-${index}`
        : `ex-new-${index}-${crypto.randomUUID()}`,
    }));

    try {
      if (routineId) {
        await updateRoutine(routineId, {
          name,
          description,
          image,
          exercises: exercisesWithIds,
          restBetweenSets,
          restBetweenExercises,
        });
      } else {
        await addRoutine({
          name,
          description,
          image,
          exercises: exercisesWithIds,
          restBetweenSets,
          restBetweenExercises,
        });
      }
      success(routineId ? t('updateSuccess') : t('createSuccess'));
      onClose();
    } catch (err) {
      console.error('Error saving routine:', err);
      error(t('saveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage('');
  };

  const t = useTranslations('routineForm');
  const tc = useTranslations('common');

  // Detectar grupos musculares de los ejercicios actuales para recomendar calentamientos
  const routineMuscleGroups: MuscleGroup[] = exercises
    .map(ex => {
      const template = getExerciseByName(ex.name);
      return template?.muscleGroup;
    })
    .filter((mg): mg is MuscleGroup => mg !== undefined);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label={t('routineName')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('routineNamePlaceholder')}
        required
      />

      <TextArea
        label={t('description')}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t('descriptionPlaceholder')}
        rows={3}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('imageLabel')}
        </label>
        {image ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={image} 
              alt={t('imagePreviewAlt')}
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label 
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <span className="text-4xl mb-2">📷</span>
              <span className="text-gray-600 dark:text-gray-400">{t('imageUploadClick')}</span>
              <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">{t('imageFormats')}</span>
            </label>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <RestTimeSelector
          label={t('restBetweenSets')}
          value={restBetweenSets}
          onChange={(v) => setRestBetweenSets(v)}
          includeZero={false}
        />
        <RestTimeSelector
          label={t('restBetweenExercises')}
          value={restBetweenExercises}
          onChange={(v) => setRestBetweenExercises(v)}
          includeZero={false}
        />
      </div>

      {/* Recomendación de calentamiento */}
      {exercises.length > 0 && (
        <WarmupRecommendation
          routineMuscleGroups={routineMuscleGroups}
          onAddWarmups={(warmups: WarmupExercise[]) => {
            const warmupExercises: Omit<Exercise, 'id'>[] = warmups.map(w => ({
              name: `🔥 ${w.name}`,
              sets: Array(w.defaultSets || 2).fill(null).map(() => ({
                reps: w.defaultReps || 10,
                weight: 0
              })),
              equipment: w.equipment,
              notes: w.duration ? `Duración: ${w.duration}` : ''
            }));
            // Insertar al inicio de la rutina
            setExercises([...warmupExercises, ...exercises]);
          }}
        />
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('exercisesTitle')}
          </h3>
          <div className="flex gap-2 flex-wrap">
            <Button type="button" variant="secondary" size="sm" onClick={handleAddExercise}>
              ➕ {t('fromLibrary')}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleAddCustomExercise}>
              ✏️ {t('manual')}
            </Button>
          </div>
        </div>

        {exercises.length === 0 && (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {t('noExercises')}
              </p>
              <Button type="button" variant="primary" size="sm" onClick={handleAddExercise}>
                {t('addFirstExercise')}
              </Button>
            </div>
        )}

        <div className="space-y-4">
          {exercises.map((exercise, exerciseIndex) => (
            <div
              key={exerciseIndex}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3 relative"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('exercise')} {exerciseIndex + 1}
                </span>
                {exercises.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveExercise(exerciseIndex)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    ❌ {t('removeExercise')}
                  </button>
                )}
              </div>

              <Input
                placeholder={t('exerciseName')}
                value={exercise.name}
                onChange={(e) => handleExerciseChange(exerciseIndex, 'name', e.target.value)}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('equipmentLabel')}
                </label>
                <EquipmentDropdown
                  value={exercise.equipment || ''}
                  onChange={(value) => handleExerciseChange(exerciseIndex, 'equipment', value)}
                  placeholder={t('equipmentPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('sets')}
                </label>
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-16">
                      {setIndex + 1}
                    </span>
                    <Input
                      type="number"
                      placeholder={t('reps')}
                      value={set.reps}
                      onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                      min="1"
                      required
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      name={`weight-${exerciseIndex}-${setIndex}`}
                      placeholder={t('weight')}
                      value={set.weight || ''}
                      onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                      min="0.1"
                      step="0.5"
                      required
                      className="flex-1"
                    />
                    {/* Mostrar error de validación para peso si existe */}
                    {validationErrors.some(err => err.exerciseIndex === exerciseIndex && err.setIndex === setIndex) && (
                      <div className="text-sm text-red-600 mt-1">Peso requerido</div>
                    )}
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopySet(exerciseIndex, setIndex)}
                        className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        title={t('copySetTitle')}
                      >
                        📋
                      </button>
                      {exercise.sets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                          className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          title={t('removeSetTitle')}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => handleAddSet(exerciseIndex)}
                  className="w-full"
                >
                  ➕ {t('addSet')}
                </Button>
              </div>

              <Input
                placeholder={t('notes')}
                value={exercise.notes || ''}
                onChange={(e) => handleExerciseChange(exerciseIndex, 'notes', e.target.value)}
              />

              {/* Descanso entre series por ejercicio */}
              <div className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                <span className="text-sm">⏱️</span>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Descanso entre series:
                </label>
                <RestTimeSelectorCompact
                  value={exercise.restBetweenSets}
                  onChange={(v) => {
                    const newExercises = [...exercises];
                    (newExercises[exerciseIndex] as any).restBetweenSets = v;
                    setExercises(newExercises);
                  }}
                  placeholder={`${Math.floor(restBetweenSets / 60)}:${(restBetweenSets % 60).toString().padStart(2, '0')} (global)`}
                  className="w-36"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:flex-1" disabled={isSubmitting}>
          {tc('cancel')}
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          className="w-full sm:flex-1" 
          disabled={exercises.length === 0 || isSubmitting}
        >
          {isSubmitting ? t('saving') : routineId ? t('updateRoutineBtn') : t('createRoutineBtn')}
        </Button>
      </div>

      <Modal
        isOpen={isExerciseSelectorOpen}
        onClose={() => setIsExerciseSelectorOpen(false)}
        title={t('selectExercisesTitle')}
      >
        <ExerciseSelector
          onSelectExercises={handleSelectExercises}
          onClose={() => setIsExerciseSelectorOpen(false)}
        />
      </Modal>
    </form>
  );
};
