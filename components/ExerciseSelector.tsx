'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { MuscleGroup, MUSCLE_GROUPS, getExercisesByMuscleGroup, ExerciseTemplate, EXERCISE_DATABASE } from '@/data/exercises';
import { getWarmupsByMuscleGroup, WARMUP_CATEGORY_LABELS, WarmupExercise, WarmupCategory, getAllWarmups } from '@/data/warmupExercises';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AnatomicalBodyMap } from '@/components/AnatomicalBodyMap';
import { ExerciseDetails } from '@/components/ExerciseDetails';
import { MuscleGroupIcon } from '@/components/icons/MuscleGroupIcons';
import { useEquipment } from '@/context/EquipmentContext';
import { getCustomExercises, getCustomExercisesByMuscleGroup } from '@/lib/customExercises';
import { AddCustomExerciseModal } from '@/components/AddCustomExerciseModal';

interface ExerciseSelectorProps {
  onSelectExercises: (exercises: ExerciseTemplate[]) => void;
  onClose?: () => void;
}

// Función para normalizar texto: elimina acentos y convierte a minúsculas
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Elimina diacríticos (acentos)
};

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = React.memo(({ onSelectExercises, onClose }) => {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'body' | 'grid'>('grid');
  const [detailsExercise, setDetailsExercise] = useState<ExerciseTemplate | null>(null);
  const [exerciseTab, setExerciseTab] = useState<'training' | 'warmup'>('training');
  const [warmupCategoryFilter, setWarmupCategoryFilter] = useState<'all' | WarmupCategory>('all');
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customExercises, setCustomExercises] = useState<ExerciseTemplate[]>([]);
  const { hasEquipment, selectedEquipment } = useEquipment();

  // Refs para contenedores virtualizados
  const globalSearchParentRef = useRef<HTMLDivElement>(null);
  const exerciseListParentRef = useRef<HTMLDivElement>(null);

  // Cargar ejercicios personalizados al montar
  useEffect(() => {
    setCustomExercises(getCustomExercises());
  }, []);

  // Recargar ejercicios personalizados cuando se agrega uno nuevo
  const handleExerciseAdded = () => {
    setCustomExercises(getCustomExercises());
  };

  const handleMuscleSelect = (muscleGroup: MuscleGroup) => {
    setSelectedMuscle(muscleGroup);
    setSearchTerm('');
    setGlobalSearchTerm('');
    setSelectedExercises(new Set());
    setExerciseTab('training');
  };

  // Búsqueda global de ejercicios
  const globalSearchResults = useMemo(() => {
    if (!globalSearchTerm.trim() || selectedMuscle) return [];
    
    const normalizedTerm = normalizeText(globalSearchTerm);
    
    const trainingResults = EXERCISE_DATABASE
      .filter(ex => normalizeText(ex.name).includes(normalizedTerm))
      .filter(ex => hasEquipment(ex.equipment))
      .map(ex => ({ ...ex, type: 'training' as const }));
    
    const warmupResults = getAllWarmups()
      .filter(ex => normalizeText(ex.name).includes(normalizedTerm))
      .map((w: WarmupExercise) => ({
        ...w,
        name: `🔥 ${w.name}`,
        description: `${WARMUP_CATEGORY_LABELS[w.category].icon} ${WARMUP_CATEGORY_LABELS[w.category].es} • ${w.description || ''}`,
        type: 'warmup' as const
      }));
    
    // Agregar ejercicios personalizados
    const customResults = customExercises
      .filter(ex => normalizeText(ex.name).includes(normalizedTerm))
      .filter(ex => hasEquipment(ex.equipment))
      .map(ex => ({ ...ex, type: 'custom' as const }));
    
    return [...trainingResults, ...warmupResults, ...customResults];
  }, [globalSearchTerm, selectedMuscle, hasEquipment, customExercises]);

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

    // Construir lista completa de candidatos (entrenamiento, personalizados, calentamientos)
    const mappedWarmups = getAllWarmups().map((w: WarmupExercise) => ({
      ...w,
      name: `🔥 ${w.name}`,
      description: `${WARMUP_CATEGORY_LABELS[w.category].icon} ${WARMUP_CATEGORY_LABELS[w.category].es} • ${w.description || ''}`,
      type: 'warmup' as const,
    }));

    const candidates: any[] = [
      ...EXERCISE_DATABASE.map((e) => ({ ...e, type: 'training' as const })),
      ...customExercises.map((e) => ({ ...e, type: 'custom' as const })),
      ...mappedWarmups,
    ];

    const selectedIds = Array.from(selectedExercises);
    const exercises = selectedIds
      .map((id) => {
        const found = candidates.find((c) => c.id === id);
        if (!found) {
          console.warn('[ExerciseSelector] Selected id not found in candidates:', id);
          return null;
        }
        const { type, ...clean } = found as any;
        return clean as ExerciseTemplate;
      })
      .filter(Boolean) as ExerciseTemplate[];

    if (exercises.length === 0) return;

    console.log('[ExerciseSelector] Exercises to add (global):', exercises.map((e) => e.id));

    onSelectExercises(exercises);
    setSelectedMuscle(null);
    setSearchTerm('');
    setGlobalSearchTerm('');
    setSelectedExercises(new Set());
  };

  const filteredExercises = selectedMuscle
    ? [
        ...getExercisesByMuscleGroup(selectedMuscle),
        ...getCustomExercisesByMuscleGroup(selectedMuscle)
      ]
      .filter(ex => normalizeText(ex.name).includes(normalizeText(searchTerm)))
      .filter(ex => hasEquipment(ex.equipment))
    : [];

  const warmupExercises: ExerciseTemplate[] = selectedMuscle
    ? getWarmupsByMuscleGroup(selectedMuscle)
      .filter(ex => normalizeText(ex.name).includes(normalizeText(searchTerm)))
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

  // Virtualizadores
  const globalVirtualizer = useVirtualizer({
    count: globalSearchResults.length,
    getScrollElement: () => globalSearchParentRef.current,
    estimateSize: () => 100,
    overscan: 3,
  });

  const exerciseListVirtualizer = useVirtualizer({
    count: currentExercises.length,
    getScrollElement: () => exerciseListParentRef.current,
    estimateSize: () => 100,
    overscan: 3,
  });

  return (
    <div className="space-y-4 max-w-5xl w-[94vw] sm:w-[900px] lg:w-[1100px] mx-auto p-4 sm:p-6">
      {!selectedMuscle ? (
        <>
          <div className="text-center mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1"></div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Selecciona un grupo muscular
              </h3>
              <div className="flex-1 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddCustomModal(true)}
                  className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                  title="Crear ejercicio personalizado"
                >
                  ✨ Nuevo
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Haz clic en el músculo que quieres entrenar
            </p>
          </div>

          {/* Buscador Global */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Input
              placeholder="🔍 Buscar ejercicio por nombre (ej: press banca, sentadilla...)"
              value={globalSearchTerm}
              onChange={(e) => setGlobalSearchTerm(e.target.value)}
              className="pl-10 text-base"
            />
            {globalSearchTerm && (
              <button
                onClick={() => setGlobalSearchTerm('')}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Resultados de búsqueda global */}
          {globalSearchResults.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {globalSearchResults.length} resultado{globalSearchResults.length !== 1 ? 's' : ''} encontrado{globalSearchResults.length !== 1 ? 's' : ''}
                </p>
                {selectedExercises.size > 0 && (
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {selectedExercises.size} seleccionado{selectedExercises.size !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              
              <div
                ref={globalSearchParentRef}
                className="overflow-y-auto max-h-[480px]"
              >
                <div
                  style={{ height: `${globalVirtualizer.getTotalSize()}px`, position: 'relative' }}
                >
                  {globalVirtualizer.getVirtualItems().map((virtualRow) => {
                    const exercise = globalSearchResults[virtualRow.index];
                    const isSelected = selectedExercises.has(exercise.id);
                    const isWarmup = exercise.type === 'warmup';
                    const muscleGroupName = MUSCLE_GROUPS.find(m => m.id === exercise.muscleGroup)?.name || exercise.muscleGroup;
                    return (
                        <div
                          key={`${(exercise as any).type || 'training'}-${exercise.id}-${virtualRow.index}`}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              transform: `translateY(${virtualRow.start}px)`,
                              height: `${virtualRow.size}px`,
                              boxSizing: 'border-box',
                            }}
                      >
                        <div
                          className={`text-left p-3 border-2 rounded-lg transition-all cursor-pointer ${
                            isSelected
                              ? isWarmup
                                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 dark:border-amber-400 shadow-md'
                                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 shadow-md'
                              : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                          }`}
                          onClick={() => handleExerciseToggle(exercise)}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`mt-1 shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                isSelected
                                  ? isWarmup ? 'bg-amber-500 border-amber-500' : 'bg-blue-600 border-blue-600'
                                  : 'border-gray-300 dark:border-gray-500'
                              }`}>
                                {isSelected && (
                                  <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M5 13l4 4L19 7"></path>
                                  </svg>
                                )}
                              </div>
                              <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-600">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={exercise.image || '/images/not-available.svg'}
                                  alt={exercise.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    if (!target.dataset.fallback) {
                                      target.dataset.fallback = '1';
                                      target.src = '/images/not-available.svg';
                                    } else {
                                      target.style.display = 'none';
                                    }
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{exercise.name}</h4>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full">
                                    <MuscleGroupIcon muscleGroup={exercise.muscleGroup} size={12} />
                                    {muscleGroupName}
                                  </span>
                                  {exercise.id.startsWith('custom-') && (
                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full font-medium">
                                      ✨ Personalizado
                                    </span>
                                  )}
                                  {exercise.equipment && (
                                    <span className="text-xs text-gray-600 dark:text-gray-400">📦 {exercise.equipment}</span>
                                  )}
                                </div>
                                {exercise.description && (
                                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{exercise.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <div className="text-xs text-gray-500 dark:text-gray-500">
                                {exercise.defaultSets}×{exercise.defaultReps}
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); setDetailsExercise(exercise); }}
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
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="hidden sm:flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setGlobalSearchTerm('');
                    setSelectedExercises(new Set());
                  }}
                  className="w-full sm:flex-1"
                >
                  Limpiar búsqueda
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
            </div>
          ) : globalSearchTerm ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-lg font-medium mb-1">No se encontraron ejercicios</p>
              <p className="text-sm">Intenta con otro término de búsqueda</p>
            </div>
          ) : (
            <>
              <div className="text-center py-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  O navega por grupos musculares
                </p>
              </div>

              {/* Toggle de vista */}
              <div className="flex justify-center gap-2 mb-3">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  📋 Vista de Lista
                </Button>
                <Button
                  variant={viewMode === 'body' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('body')}
                >
                  👤 Cuerpo Humano
                </Button>
              </div>

              {viewMode === 'body' ? (
                <AnatomicalBodyMap
                  selectedMuscles={[]}
                  onMuscleClick={handleMuscleSelect}
                />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {MUSCLE_GROUPS.map((muscle) => {
                    const trainingCount = getExercisesByMuscleGroup(muscle.id).filter(ex => hasEquipment(ex.equipment)).length;
                    const totalTraining = getExercisesByMuscleGroup(muscle.id).length;
                    const warmupCount = getWarmupsByMuscleGroup(muscle.id).length;
                    return (
                      <button
                      key={muscle.id}
                      onClick={() => handleMuscleSelect(muscle.id)}
                      className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all group"
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
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddCustomModal(true)}
                className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                title="Crear ejercicio personalizado"
              >
                ✨ Nuevo
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedMuscle(null)}>
                ← Volver
              </Button>
            </div>
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

          <div
            ref={exerciseListParentRef}
            className="overflow-y-auto max-h-96"
          >
            {currentExercises.length > 0 ? (
              <div style={{ height: `${exerciseListVirtualizer.getTotalSize()}px`, position: 'relative' }}>
                {exerciseListVirtualizer.getVirtualItems().map((virtualRow) => {
                  const exercise = currentExercises[virtualRow.index];
                  const isSelected = selectedExercises.has(exercise.id);
                  const isWarmupTab = exerciseTab === 'warmup';
                  return (
                    <div
                      key={`${exerciseTab}-${exercise.id}-${virtualRow.index}`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualRow.start}px)`,
                        height: `${virtualRow.size}px`,
                        boxSizing: 'border-box',
                      }}
                    >
                      <div
                        className={`text-left p-5 border-2 rounded-lg transition-all cursor-pointer ${isSelected
                          ? isWarmupTab
                            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 dark:border-amber-400 shadow-md'
                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 shadow-md'
                          : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                        }`}
                        onClick={() => handleExerciseToggle(exercise)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 flex-1">
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
                            <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-600">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={exercise.image || '/images/not-available.svg'}
                                alt={exercise.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  if (!target.dataset.fallback) {
                                    target.dataset.fallback = '1';
                                    target.src = '/images/not-available.svg';
                                  } else {
                                    target.style.display = 'none';
                                  }
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{exercise.name}</h4>
                              <div className="flex items-center gap-2 flex-wrap">
                                {exercise.id.startsWith('custom-') && (
                                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full font-medium">
                                    ✨ Personalizado
                                  </span>
                                )}
                                {exercise.equipment && (
                                  <span className="text-xs text-gray-600 dark:text-gray-400">📦 {exercise.equipment}</span>
                                )}
                              </div>
                              
                              {exercise.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{exercise.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                              {exercise.defaultSets}×{exercise.defaultReps}
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDetailsExercise(exercise); }}
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
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No se encontraron ejercicios
              </div>
            )}
          </div>

          <div className="hidden sm:flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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

      {showAddCustomModal && (
        <AddCustomExerciseModal
          onClose={() => setShowAddCustomModal(false)}
          onExerciseAdded={handleExerciseAdded}
          preselectedMuscleGroup={selectedMuscle || undefined}
        />
      )}

      {detailsExercise && (
        <ExerciseDetails
          exercise={detailsExercise}
          onClose={() => setDetailsExercise(null)}
        />
      )}

      {selectedExercises.size > 0 && (
        <div className="flex z-50 sm:hidden">
          <Button
            variant="primary"
            onClick={handleConfirmSelection}
            className="px-4 py-3 shadow-xl text-base bg-gradient-to-r from-emerald-400 to-violet-500 text-white rounded-full w-full"
          >
            Agregar ({selectedExercises.size})
          </Button>
        </div>
      )}
    </div>
  );
});

ExerciseSelector.displayName = 'ExerciseSelector';
