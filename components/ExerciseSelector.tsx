'use client';

import React, { useState } from 'react';
import { MuscleGroup, MUSCLE_GROUPS, getExercisesByMuscleGroup, ExerciseTemplate } from '@/data/exercises';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BodyMap } from '@/components/BodyMap';
import { ExerciseDetails } from '@/components/ExerciseDetails';
import { ExerciseIcon } from '@/components/ExerciseIcon';
import { MuscleGroupIcon } from '@/components/icons/MuscleGroupIcons';
import { useEquipment } from '@/context/EquipmentContext';

interface ExerciseSelectorProps {
  onSelectExercises: (exercises: ExerciseTemplate[]) => void;
  onClose?: () => void;
}

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({ onSelectExercises, onClose }) => {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'body' | 'grid'>('body');
  const [detailsExercise, setDetailsExercise] = useState<ExerciseTemplate | null>(null);
  const { hasEquipment, selectedEquipment } = useEquipment();

  const handleMuscleSelect = (muscleGroup: MuscleGroup) => {
    setSelectedMuscle(muscleGroup);
    setSearchTerm('');
    setSelectedExercises(new Set());
  };

  const handleExerciseToggle = (exercise: ExerciseTemplate) => {
    const newSelected = new Set(selectedExercises);
    if (newSelected.has(exercise.id)) {
      newSelected.delete(exercise.id);
    } else {
      newSelected.add(exercise.id);
    }
    setSelectedExercises(newSelected);
  };

  const handleConfirmSelection = () => {
    if (selectedExercises.size === 0) return;

    const exercises = filteredExercises.filter(ex => selectedExercises.has(ex.id));
    onSelectExercises(exercises);
    setSelectedMuscle(null);
    setSearchTerm('');
    setSelectedExercises(new Set());
  };

  const filteredExercises = selectedMuscle
    ? getExercisesByMuscleGroup(selectedMuscle)
      .filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(ex => hasEquipment(ex.equipment))
    : [];

  const totalExercises = selectedMuscle ? getExercisesByMuscleGroup(selectedMuscle).length : 0;

  return (
    <div className="space-y-6">
      {!selectedMuscle ? (
        <>
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Selecciona un grupo muscular
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Haz clic en el músculo que quieres entrenar
            </p>
          </div>

          {/* Toggle de vista */}
          <div className="flex justify-center gap-2 mb-4">
            <Button
              variant={viewMode === 'body' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('body')}
            >
              👤 Cuerpo Humano
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              📋 Vista de Lista
            </Button>
          </div>

          {viewMode === 'body' ? (
            <BodyMap
              selectedMuscles={[]}
              onMuscleClick={handleMuscleSelect}
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {MUSCLE_GROUPS.map((muscle) => (
                <button
                  key={muscle.id}
                  onClick={() => handleMuscleSelect(muscle.id)}
                  className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all group"
                >
                  <div className="mb-2 group-hover:scale-110 transition-transform">
                    <MuscleGroupIcon
                      muscleGroup={muscle.id}
                      size={40}
                      className="text-blue-500 dark:text-blue-400"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-center">
                    {muscle.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Ejercicios de {MUSCLE_GROUPS.find(m => m.id === selectedMuscle)?.name}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredExercises.length} de {totalExercises} disponibles
                </p>
                {selectedExercises.size > 0 && (
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    • {selectedExercises.size} seleccionado{selectedExercises.size !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              {selectedEquipment.size > 0 && filteredExercises.length < totalExercises && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  Algunos ejercicios están ocultos por tu equipamiento
                </p>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedMuscle(null)}>
              ← Volver
            </Button>
          </div>

          <Input
            placeholder="Buscar ejercicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {filteredExercises.length > 0 ? (
              filteredExercises.map((exercise) => {
                const isSelected = selectedExercises.has(exercise.id);
                return (
                  <div
                    key={exercise.id}
                    className={`text-left p-4 border-2 rounded-lg transition-all cursor-pointer ${isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 shadow-md'
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                      }`}
                    onClick={() => handleExerciseToggle(exercise)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="flex items-start gap-3 flex-1"
                      >
                        <div className={`mt-1 shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 dark:border-gray-500'
                          }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                          )}
                        </div>
                        {exercise.image ? (
                          <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-600">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={exercise.image}
                              alt={exercise.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                // Si la imagen falla, mostrar el icono
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = '';
                                  parent.className = 'shrink-0 w-16 h-16';
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <ExerciseIcon
                            muscleGroup={exercise.muscleGroup}
                            className="shrink-0 w-16 h-16"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {exercise.name}
                          </h4>
                          {exercise.equipment && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              📦 {exercise.equipment}
                            </p>
                          )}
                          {exercise.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                              {exercise.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="text-right">
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            {exercise.defaultSets}×{exercise.defaultReps}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailsExercise(exercise);
                          }}
                          className="shrink-0 p-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                          title="Ver detalles"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No se encontraron ejercicios
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              onClick={() => setSelectedMuscle(null)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmSelection}
              disabled={selectedExercises.size === 0}
              className="flex-1"
            >
              Agregar {selectedExercises.size > 0 ? `(${selectedExercises.size})` : ''}
            </Button>
          </div>
        </>
      )}

      {onClose && (
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      )}

      {detailsExercise && (
        <ExerciseDetails
          exercise={detailsExercise}
          onClose={() => setDetailsExercise(null)}
        />
      )}
    </div>
  );
};
