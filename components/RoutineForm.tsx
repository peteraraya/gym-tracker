'use client';

import React, { useState, useEffect } from 'react';
import { useGym } from '@/context/GymContext';
import { Exercise } from '@/types';
import { Input, TextArea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ExerciseSelector } from '@/components/ExerciseSelector';
import { EquipmentDropdown } from '@/components/EquipmentDropdown';
import { ExerciseTemplate } from '@/data/exercises';

interface RoutineFormProps {
  routineId?: string | null;
  onClose: () => void;
}

export const RoutineForm: React.FC<RoutineFormProps> = ({ routineId, onClose }) => {
  const { addRoutine, updateRoutine, getRoutineById } = useGym();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string>('');
  const [exercises, setExercises] = useState<Omit<Exercise, 'id'>[]>([]);
  const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);
  const [restBetweenSets, setRestBetweenSets] = useState(60);
  const [restBetweenExercises, setRestBetweenExercises] = useState(120);

  useEffect(() => {
    if (routineId) {
      const routine = getRoutineById(routineId);
      if (routine) {
        setName(routine.name);
        setDescription(routine.description || '');
        setImage(routine.image || '');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setExercises(routine.exercises.map(({ id, ...rest }) => rest));
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
    const newExercises: Omit<Exercise, 'id'>[] = exerciseTemplates.map(template => ({
      name: template.name,
      sets: template.defaultSets || 3,
      reps: template.defaultReps || 10,
      weight: 0,
      equipment: template.equipment,
      notes: ''
    }));
    setExercises([...exercises, ...newExercises]);
    setIsExerciseSelectorOpen(false);
  };

  const handleAddCustomExercise = () => {
    setExercises([...exercises, { name: '', sets: 3, reps: 10, weight: 0, equipment: '', notes: '' }]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (index: number, field: keyof Exercise, value: string | number) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      onClose();
    } catch (error) {
      console.error('Error saving routine:', error);
      alert('Error al guardar la rutina. Por favor intenta de nuevo.');
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Nombre de la rutina"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ej: Rutina de piernas"
        required
      />

      <TextArea
        label="Descripción (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe tu rutina..."
        rows={3}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Imagen (opcional)
        </label>
        {image ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={image} 
              alt="Vista previa" 
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
              <span className="text-gray-600 dark:text-gray-400">Haz clic para subir una imagen</span>
              <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">JPG, PNG o GIF</span>
            </label>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            type="number"
            label="Descanso entre series (segundos)"
            value={restBetweenSets}
            onChange={(e) => setRestBetweenSets(parseInt(e.target.value) || 0)}
            min="0"
            step="5"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            ⏱️ {Math.floor(restBetweenSets / 60)}:{(restBetweenSets % 60).toString().padStart(2, '0')} minutos
          </p>
        </div>
        <div>
          <Input
            type="number"
            label="Descanso entre ejercicios (segundos)"
            value={restBetweenExercises}
            onChange={(e) => setRestBetweenExercises(parseInt(e.target.value) || 0)}
            min="0"
            step="5"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            ⏱️ {Math.floor(restBetweenExercises / 60)}:{(restBetweenExercises % 60).toString().padStart(2, '0')} minutos
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Ejercicios
          </h3>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={handleAddExercise}>
              ➕ Desde biblioteca
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleAddCustomExercise}>
              ✏️ Manual
            </Button>
          </div>
        </div>

        {exercises.length === 0 && (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No hay ejercicios agregados
            </p>
            <Button type="button" variant="primary" size="sm" onClick={handleAddExercise}>
              Agregar primer ejercicio
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {exercises.map((exercise, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3 relative"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ejercicio {index + 1}
                </span>
                {exercises.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveExercise(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    ❌ Eliminar
                  </button>
                )}
              </div>

              <Input
                placeholder="Nombre del ejercicio"
                value={exercise.name}
                onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Equipamiento
                </label>
                <EquipmentDropdown
                  value={exercise.equipment || ''}
                  onChange={(value) => handleExerciseChange(index, 'equipment', value)}
                  placeholder="Seleccionar equipamiento (opcional)"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  type="number"
                  label="Series"
                  value={exercise.sets}
                  onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value))}
                  min="1"
                  required
                />
                <Input
                  type="number"
                  label="Repeticiones"
                  value={exercise.reps}
                  onChange={(e) => handleExerciseChange(index, 'reps', parseInt(e.target.value))}
                  min="1"
                  required
                />
                <Input
                  type="number"
                  label="Peso (kg)"
                  value={exercise.weight || ''}
                  onChange={(e) => handleExerciseChange(index, 'weight', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.5"
                />
              </div>

              <Input
                placeholder="Notas (opcional)"
                value={exercise.notes || ''}
                onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" variant="primary" className="flex-1" disabled={exercises.length === 0}>
          {routineId ? 'Actualizar' : 'Crear'} Rutina
        </Button>
      </div>

      <Modal
        isOpen={isExerciseSelectorOpen}
        onClose={() => setIsExerciseSelectorOpen(false)}
        title="Seleccionar Ejercicios"
      >
        <ExerciseSelector
          onSelectExercises={handleSelectExercises}
          onClose={() => setIsExerciseSelectorOpen(false)}
        />
      </Modal>
    </form>
  );
};
