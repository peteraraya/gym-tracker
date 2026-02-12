'use client';

import React, { useState } from 'react';
import { MuscleGroup, MUSCLE_GROUPS, getExercisesByMuscleGroup, ExerciseTemplate } from '@/data/exercises';
import { getWarmupsByMuscleGroup, WARMUP_CATEGORY_LABELS, WarmupExercise, WarmupCategory } from '@/data/warmupExercises';
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
  const [exerciseTab, setExerciseTab] = useState<'training' | 'warmup'>('training');
  const [warmupCategoryFilter, setWarmupCategoryFilter] = useState<'all' | WarmupCategory>('all');
  const { hasEquipment, selectedEquipment } = useEquipment();

  const handleMuscleSelect = (muscleGroup: MuscleGroup) => {
    setSelectedMuscle(muscleGroup);
    setSearchTerm('');
    setSelectedExercises(new Set());
    setExerciseTab('training');
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

    const allAvailable = [...filteredExercises, ...warmupExercises];
    const exercises = allAvailable.filter(ex => selectedExercises.has(ex.id));
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

  const warmupExercises: ExerciseTemplate[] = selectedMuscle
    ? getWarmupsByMuscleGroup(selectedMuscle)
      .filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(ex => warmupCategoryFilter === 'all' || ex.category === warmupCategoryFilter)
      .map((w: WarmupExercise) => ({
        ...w,
        name: `🔥 ${w.name}`,
        description: `${WARMUP_CATEGORY_LABELS[w.category].icon} ${WARMUP_CATEGORY_LABELS[w.category].es} • ${w.description || ''}`,
      }))
    : [];

  const allWarmupCount = selectedMuscle
    ? getWarmupsByMuscleGroup(selectedMuscle)
      .filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase())).length
    : 0;

  const allWarmupRaw = selectedMuscle
    ? getWarmupsByMuscleGroup(selectedMuscle)
      .filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const currentExercises = exerciseTab === 'training' ? filteredExercises : warmupExercises;

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
              {MUSCLE_GROUPS.map((muscle) => {
                const trainingCount = getExercisesByMuscleGroup(muscle.id).filter(ex => hasEquipment(ex.equipment)).length;
                const totalTraining = getExercisesByMuscleGroup(muscle.id).length;
                const warmupCount = getWarmupsByMuscleGroup(muscle.id).length;
                return (
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
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {trainingCount}/{totalTraining} ejercicios
                  </span>
                  {warmupCount > 0 && (
                    <span className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                      🔥 {warmupCount} calentamiento
                    </span>
                  )}
                  {trainingCount < totalTraining && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                      Pronto habrá más ejercicios
                    </span>
                  )}
                </button>
                );
              })}
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

          {/* Tab de entrenamiento vs calentamiento */}
          <div className="flex gap-2 mb-1">
            <button
              type="button"
              onClick={() => setExerciseTab('training')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all ${
                exerciseTab === 'training'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-300'
              }`}
            >
              🏋️ Entrenamiento ({filteredExercises.length})
            </button>
            <button
              type="button"
              onClick={() => setExerciseTab('warmup')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all ${
                exerciseTab === 'warmup'
                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 dark:border-amber-400 text-amber-700 dark:text-amber-300'
                  : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-amber-300'
              }`}
            >
              🔥 Calentamiento ({allWarmupCount})
            </button>
          </div>

          {/* Filtros de categoría para calentamiento */}
          {exerciseTab === 'warmup' && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {[
                { key: 'all' as const, label: 'Todos', count: allWarmupCount },
                { key: 'warmup' as const, label: WARMUP_CATEGORY_LABELS.warmup.icon + ' ' + WARMUP_CATEGORY_LABELS.warmup.es, count: allWarmupRaw.filter(e => e.category === 'warmup').length },
                { key: 'mobility' as const, label: WARMUP_CATEGORY_LABELS.mobility.icon + ' ' + WARMUP_CATEGORY_LABELS.mobility.es, count: allWarmupRaw.filter(e => e.category === 'mobility').length },
                { key: 'activation' as const, label: WARMUP_CATEGORY_LABELS.activation.icon + ' ' + WARMUP_CATEGORY_LABELS.activation.es, count: allWarmupRaw.filter(e => e.category === 'activation').length },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setWarmupCategoryFilter(filter.key)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-all ${
                    warmupCategoryFilter === filter.key
                      ? filter.key === 'warmup' ? 'bg-red-100 dark:bg-red-900/30 border-red-400 text-red-700 dark:text-red-300'
                      : filter.key === 'mobility' ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-400 text-purple-700 dark:text-purple-300'
                      : filter.key === 'activation' ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 text-yellow-700 dark:text-yellow-300'
                      : 'bg-amber-100 dark:bg-amber-900/30 border-amber-400 text-amber-700 dark:text-amber-300'
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          )}

          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {currentExercises.length > 0 ? (
              currentExercises.map((exercise) => {
                const isSelected = selectedExercises.has(exercise.id);
                const isWarmupTab = exerciseTab === 'warmup';
                return (
                  <div
                    key={exercise.id}
                    className={`text-left p-4 border-2 rounded-lg transition-all cursor-pointer ${isSelected
                      ? isWarmupTab
                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 dark:border-amber-400 shadow-md'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 shadow-md'
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                      }`}
                    onClick={() => handleExerciseToggle(exercise)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="flex items-start gap-3 flex-1"
                      >
                        <div className={`mt-1 shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected
                          ? isWarmupTab ? 'bg-amber-500 border-amber-500' : 'bg-blue-600 border-blue-600'
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
                                  const target = e.target as HTMLImageElement;
                                  // Evitar bucle si el placeholder también falla
                                  if (!target.dataset.fallback) {
                                    target.dataset.fallback = '1';
                                    target.src = '/images/not-available.svg';
                                  } else {
                                    // Si falla el placeholder, ocultar imagen
                                    target.style.display = 'none';
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

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              onClick={() => setSelectedMuscle(null)}
              className="w-full sm:flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmSelection}
              disabled={selectedExercises.size === 0}
              className="w-full sm:flex-1"
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
