'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { MuscleGroup, DifficultyLevel, ExerciseCategory } from '@/data/exercises/types';
import { MUSCLE_GROUPS } from '@/data/exercises/types';
import { saveCustomExercise, validateExercise } from '@/lib/exercises/customExercises';
import { EquipmentDropdown } from '@/components/features/equipment/EquipmentDropdown';

interface AddCustomExerciseModalProps {
  onClose: () => void;
  onExerciseAdded: () => void;
  preselectedMuscleGroup?: MuscleGroup;
}

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string }[] = [
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' },
];

const CATEGORY_OPTIONS: { value: ExerciseCategory; label: string }[] = [
  { value: 'compuesto', label: 'Compuesto' },
  { value: 'aislamiento', label: 'Aislamiento' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'movilidad', label: 'Movilidad' },
];

const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  pecho: 'Pecho',
  espalda: 'Espalda',
  piernas: 'Piernas',
  gluteos: 'Glúteos',
  hombros: 'Hombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  antebrazos: 'Antebrazos',
  trapecio: 'Trapecio',
  cuello: 'Cuello',
  core: 'Core',
  gemelos: 'Gemelos',
  cardio: 'Cardio',
};

export const AddCustomExerciseModal: React.FC<AddCustomExerciseModalProps> = ({
  onClose,
  onExerciseAdded,
  preselectedMuscleGroup,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    muscleGroup: preselectedMuscleGroup || ('pecho' as MuscleGroup),
    equipment: '',
    description: '',
    defaultSets: 3,
    defaultReps: 10,
    difficulty: 'intermedio' as DifficultyLevel,
    category: 'compuesto' as ExerciseCategory,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsSubmitting(true);

    // Validar
    const validation = validateExercise(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Guardar ejercicio
      saveCustomExercise({
        ...formData,
        equipment: formData.equipment || undefined,
        description: formData.description || undefined,
      });

      // Notificar éxito
      onExerciseAdded();
      onClose();
    } catch (error) {
      setErrors(['Error al guardar el ejercicio. Intenta de nuevo.']);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">✨ Crear Ejercicio Personalizado</h2>
              <p className="text-blue-100 text-sm mt-1">
                Agrega tus propios ejercicios a la biblioteca
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Errores */}
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h4 className="font-semibold text-red-800 dark:text-red-300 mb-1">
                    Errores de validación:
                  </h4>
                  <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-400 space-y-1">
                    {errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span className="text-2xl">📝</span>
              Información Básica
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del ejercicio *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Press de banca con agarre cerrado"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Grupo muscular *
                </label>
                <select
                  value={formData.muscleGroup}
                  onChange={(e) => setFormData({ ...formData, muscleGroup: e.target.value as MuscleGroup })}
                  className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30 transition-colors"
                  required
                >
                  {MUSCLE_GROUPS.map((muscle) => (
                    <option key={muscle} value={muscle}>
                      {MUSCLE_GROUP_LABELS[muscle]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Equipamiento
                </label>
                <EquipmentDropdown
                  value={formData.equipment}
                  onChange={(value) => setFormData({ ...formData, equipment: value })}
                  placeholder="Seleccionar equipamiento"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe brevemente el ejercicio..."
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Configuración */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              Configuración
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Series
                </label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.defaultSets}
                  onChange={(e) => setFormData({ ...formData, defaultSets: parseInt(e.target.value) || 3 })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reps
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.defaultReps}
                  onChange={(e) => setFormData({ ...formData, defaultReps: parseInt(e.target.value) || 10 })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dificultad
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as DifficultyLevel })}
                  className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30 transition-colors"
                >
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ExerciseCategory })}
                  className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30 transition-colors"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Info adicional */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-1">💡 Consejo:</p>
                <p>
                  Los ejercicios personalizados se guardan localmente en tu navegador. 
                  Puedes editarlos o eliminarlos más adelante desde la configuración.
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="w-full sm:flex-1"
            >
              {isSubmitting ? 'Guardando...' : '✨ Crear Ejercicio'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
