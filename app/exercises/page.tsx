'use client';

import { useState, useMemo } from 'react';
import { MUSCLE_GROUPS, getExercisesByMuscleGroup, ExerciseTemplate, MuscleGroup } from '@/data/exercises';
import { getWarmupsByMuscleGroup, WARMUP_CATEGORY_LABELS, WarmupExercise, WarmupCategory } from '@/data/warmupExercises';
import { useToast } from '@/context/ToastContext';
import { EQUIPMENT_LIST } from '@/data/equipment';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ExerciseDetails } from '@/components/ExerciseDetails';
import { ExerciseIcon } from '@/components/ExerciseIcon';
import { MuscleGroupIcon } from '@/components/icons/MuscleGroupIcons';
import { useEquipment } from '@/context/EquipmentContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/Button';

const ITEMS_PER_PAGE = 5;

export default function ExercisesPage() {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseTemplate | null>(null);
  const [exerciseTab, setExerciseTab] = useState<'training' | 'warmup'>('training');
  const [currentPage, setCurrentPage] = useState(1);
  const { hasEquipment, selectedEquipment, setEquipment, clearEquipment, toggleEquipment } = useEquipment();
  const toast = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [warmupCategoryFilter, setWarmupCategoryFilter] = useState<'all' | WarmupCategory>('all');

  const filteredExercises = useMemo(() => {
    if (!selectedMuscle) return [];
    return getExercisesByMuscleGroup(selectedMuscle)
      .filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(ex => hasEquipment(ex.equipment));
  }, [selectedMuscle, searchTerm, hasEquipment]);

  const allWarmupExercises: WarmupExercise[] = useMemo(() => {
    if (!selectedMuscle) return [];
    return getWarmupsByMuscleGroup(selectedMuscle)
      .filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [selectedMuscle, searchTerm]);

  const warmupExercises: WarmupExercise[] = useMemo(() => {
    return warmupCategoryFilter === 'all'
      ? allWarmupExercises
      : allWarmupExercises.filter(ex => ex.category === warmupCategoryFilter);
  }, [allWarmupExercises, warmupCategoryFilter]);

  const currentExercises: ExerciseTemplate[] = exerciseTab === 'training' ? filteredExercises : warmupExercises;

  // Pagination
  const totalPages = Math.ceil(currentExercises.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedExercises = currentExercises.slice(startIndex, endIndex);

  // Reset page when changing filters
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleTabChange = (tab: 'training' | 'warmup') => {
    setExerciseTab(tab);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: 'all' | WarmupCategory) => {
    setWarmupCategoryFilter(category);
    setCurrentPage(1);
  };

  const availableCount = currentExercises.length;
  const totalCount = selectedMuscle 
    ? exerciseTab === 'training' 
      ? getExercisesByMuscleGroup(selectedMuscle).length 
      : getWarmupsByMuscleGroup(selectedMuscle).length
    : 0;

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">💡 Guía de Ejercicios</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Explora ejercicios con técnicas y recomendaciones profesionales</p>

            <div className="mt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm"
              >
                ⚙️ Equipamiento
              </Button>
            </div>

            {selectedEquipment.size > 0 && (
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400">🏋️</span>
                    <span className="text-sm text-blue-800 dark:text-blue-300">Filtrando por {selectedEquipment.size} equipamiento{selectedEquipment.size !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setEquipment(new Set(EQUIPMENT_LIST.map(e => e.id)));
                        toast.success('Seleccionado todo el equipamiento');
                      }}
                      className=""
                    >
                        ✅ Todo
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        clearEquipment();
                        toast.info('Selección limpiada');
                      }}
                      className=""
                    >
                      🗑️ Limpiar
                    </Button>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => setDrawerOpen(true)}
                      className=""
                    >
                      ⚙️ Editar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!selectedMuscle ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Selecciona un grupo muscular</h2>
                
                {/* Buscador principal */}
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xl">🔍</span>
                  </div>
                  <Input 
                    placeholder="Buscar grupo muscular..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-10 py-3 text-base"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <span className="text-xl">×</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {MUSCLE_GROUPS
                  .filter(muscle => 
                    muscle.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((muscle) => {
                  const exercisesForMuscle = getExercisesByMuscleGroup(muscle.id);
                  const total = exercisesForMuscle.length;
                  const available = exercisesForMuscle.filter(ex => hasEquipment(ex.equipment)).length;
                  const warmupCount = getWarmupsByMuscleGroup(muscle.id).length;
                  return (
                    <button
                      key={muscle.id}
                      onClick={() => { 
                        setSelectedMuscle(muscle.id); 
                        setExerciseTab('training');
                        setSearchTerm('');
                        setCurrentPage(1);
                      }}
                      className="flex flex-col items-center justify-center p-4 md:p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl hover:scale-105 transition-all duration-200 group"
                      aria-label={`Seleccionar grupo ${muscle.name}, ${total} ejercicios`}
                    >
                      <div className="mb-2 group-hover:scale-110 transition-transform duration-200">
                        <MuscleGroupIcon muscleGroup={muscle.id} size={56} className="text-blue-500 dark:text-blue-400" />
                      </div>
                      <span className="text-sm md:text-base font-bold text-gray-900 dark:text-gray-100 text-center mb-1">{muscle.name}</span>
                      
                      <div className="flex flex-col items-center gap-1 mt-1">
                        {selectedEquipment.size > 0 ? (
                          <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">
                            {available}/{total} ejercicios
                          </span>
                        ) : (
                          <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">
                            {total} ejercicios
                          </span>
                        )}
                        {warmupCount > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                            🔥 {warmupCount} calentamiento
                          </span>
                        )}
                      </div>

                      {total > 0 && total < 11 && (
                        <div className="mt-2 text-center">
                          <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 italic">Pronto más</div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* No results message */}
              {searchTerm && MUSCLE_GROUPS.filter(muscle => 
                muscle.name.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    No se encontraron grupos musculares
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Intenta con otro término de búsqueda
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Limpiar búsqueda
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{MUSCLE_GROUPS.find(m => m.id === selectedMuscle)?.name}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {availableCount} de {totalCount} ejercicios disponibles
                    {selectedEquipment.size > 0 && availableCount < totalCount && (
                      <span className="ml-2 text-blue-600 dark:text-blue-400">(filtrado por equipamiento)</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedMuscle(null);
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  ← Volver
                </button>
              </div>

              <div className="mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xl">🔍</span>
                  </div>
                  <Input 
                    placeholder="Buscar ejercicio por nombre..." 
                    value={searchTerm} 
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-12 pr-10 py-3 text-base"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => handleSearchChange('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <span className="text-xl">×</span>
                    </button>
                  )}
                </div>
                {searchTerm && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {availableCount} resultado{availableCount !== 1 ? 's' : ''} para &quot;{searchTerm}&quot;
                  </p>
                )}
              </div>

              {/* Tab entrenam. vs calentamiento */}
              <div className="flex gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => handleTabChange('training')}
                  className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-xl border-2 transition-all ${
                    exerciseTab === 'training'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300'
                  }`}
                >
                  🏋️ Entrenamiento ({filteredExercises.length})
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('warmup')}
                  className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-xl border-2 transition-all ${
                    exerciseTab === 'warmup'
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 dark:border-amber-400 text-amber-700 dark:text-amber-300'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-300'
                  }`}
                >
                  🔥 Calentamiento y Movilidad ({allWarmupExercises.length})
                </button>
              </div>

              {/* Filtros de categoría para calentamiento */}
              {exerciseTab === 'warmup' && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {[
                    { key: 'all' as const, label: '🔥 Todos', count: allWarmupExercises.length },
                    { key: 'warmup' as const, label: WARMUP_CATEGORY_LABELS.warmup.icon + ' ' + WARMUP_CATEGORY_LABELS.warmup.es, count: allWarmupExercises.filter(e => e.category === 'warmup').length },
                    { key: 'mobility' as const, label: WARMUP_CATEGORY_LABELS.mobility.icon + ' ' + WARMUP_CATEGORY_LABELS.mobility.es, count: allWarmupExercises.filter(e => e.category === 'mobility').length },
                    { key: 'activation' as const, label: WARMUP_CATEGORY_LABELS.activation.icon + ' ' + WARMUP_CATEGORY_LABELS.activation.es, count: allWarmupExercises.filter(e => e.category === 'activation').length },
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => handleCategoryChange(filter.key)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all ${
                        warmupCategoryFilter === filter.key
                          ? filter.key === 'warmup' ? 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-600 text-red-700 dark:text-red-300'
                          : filter.key === 'mobility' ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-400 dark:border-purple-600 text-purple-700 dark:text-purple-300'
                          : filter.key === 'activation' ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300'
                          : 'bg-amber-100 dark:bg-amber-900/30 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-300'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-300'
                      }`}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>
              )}

              {totalCount > 0 && totalCount < 11 && (
                <div className="mb-6 p-6 bg-linear-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl text-center">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Pronto habrá más ejercicios</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Estamos trabajando en ampliar esta sección. Mientras tanto puedes explorar otros grupos musculares o suscribirte para recibir notificaciones.</p>
                </div>
              )}

              <div className="space-y-4">
                {paginatedExercises.map((exercise) => {
                  const warmup = exerciseTab === 'warmup' ? exercise as WarmupExercise : null;
                  const categoryInfo = warmup ? WARMUP_CATEGORY_LABELS[warmup.category] : null;
                  return (
                  <Card key={exercise.id} className={`hover:shadow-lg transition-shadow ${exerciseTab === 'warmup' ? 'border-amber-200 dark:border-amber-800' : ''}`}>
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Image/Icon Section */}
                      <div className="md:w-48 flex-shrink-0">
                        {exercise.image ? (
                          <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={exercise.image} alt={exercise.name} className="w-full h-full object-cover" loading="lazy" onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (!target.dataset.fallback) {
                                target.dataset.fallback = '1';
                                target.src = '/images/not-available.svg';
                              } else {
                                const parent = target.parentElement;
                                if (parent) parent.style.display = 'none';
                              }
                            }} />
                          </div>
                        ) : (
                          <div className={`flex justify-center items-center h-48 ${exerciseTab === 'warmup' 
                            ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20' 
                            : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700'} rounded-t-lg md:rounded-l-lg md:rounded-tr-none`}>
                            {exerciseTab === 'warmup' ? (
                              <div className="flex flex-col items-center gap-2">
                                <span className="text-5xl">🔥</span>
                                {categoryInfo && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    warmup?.category === 'warmup' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    : warmup?.category === 'mobility' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  }`}>
                                    {categoryInfo.icon} {categoryInfo.es}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <ExerciseIcon muscleGroup={exercise.muscleGroup} className="w-24 h-24" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 p-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{exercise.name}</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                {exercise.equipment}
                              </span>
                              {warmup && categoryInfo && (
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  warmup.category === 'warmup' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                  : warmup.category === 'mobility' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                }`}>
                                  {categoryInfo.icon} {categoryInfo.es}
                                </span>
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={() => setSelectedExercise(exercise)} 
                            className={`px-4 py-2 ${exerciseTab === 'warmup' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold rounded-lg transition-colors whitespace-nowrap`}
                          >
                            Ver técnica
                          </button>
                        </div>

                        {exercise.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{exercise.description}</p>
                        )}

                        <div className="flex flex-wrap gap-3">
                          {exercise.recommendedSets && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <span className="text-green-700 dark:text-green-400 font-semibold text-sm">Series:</span>
                              <span className="text-green-900 dark:text-green-200 text-sm">{exercise.recommendedSets}</span>
                            </div>
                          )}
                          {exercise.recommendedReps && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <span className="text-blue-700 dark:text-blue-400 font-semibold text-sm">Reps:</span>
                              <span className="text-blue-900 dark:text-blue-200 text-sm">{exercise.recommendedReps}</span>
                            </div>
                          )}
                          {exercise.restTime && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <span className="text-gray-700 dark:text-gray-400 text-sm">⏱️ {exercise.restTime}</span>
                            </div>
                          )}
                          {warmup && warmup.duration && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                              <span className="text-amber-700 dark:text-amber-400 text-sm">⏱️ {warmup.duration}</span>
                            </div>
                          )}
                        </div>

                        {warmup && warmup.targetMuscles && warmup.targetMuscles.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {warmup.targetMuscles.map(m => (
                              <span key={m} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                🎯 {MUSCLE_GROUPS.find(mg => mg.id === m)?.name || m}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrando {startIndex + 1}-{Math.min(endIndex, currentExercises.length)} de {currentExercises.length} ejercicios
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      ← Anterior
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                            currentPage === page
                              ? exerciseTab === 'warmup'
                                ? 'bg-amber-500 text-white'
                                : 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              )}

              {currentExercises.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">{exerciseTab === 'warmup' ? '🔥' : '🔍'}</div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {exerciseTab === 'warmup' ? 'No se encontraron ejercicios de calentamiento' : 'No se encontraron ejercicios'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">Intenta con otro término de búsqueda</p>
                </div>
              )}
            </>
          )}
        </div>

        {selectedExercise && (
          <ExerciseDetails exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
        )}
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setDrawerOpen(false)} />
          <aside className="ml-auto w-full sm:w-96 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 max-h-screen overflow-y-auto p-6 z-60">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">⚙️ Mi Equipamiento</h3>
              <button onClick={() => setDrawerOpen(false)} className="text-gray-500">×</button>
            </div>

            <div className="flex gap-2 mb-4">
              <button onClick={() => { setEquipment(new Set(EQUIPMENT_LIST.map(e => e.id))); toast.success('Seleccionado todo el equipamiento'); }} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm">✅ Seleccionar todo</button>
              <button onClick={() => { clearEquipment(); toast.info('Selección limpiada'); }} className="px-3 py-2 rounded-lg bg-transparent border text-sm">🗑️ Limpiar</button>
            </div>

            <div className="space-y-3">
              {EQUIPMENT_LIST.map((eq) => {
                const isSelected = selectedEquipment.has(eq.id);
                return (
                  <button
                    key={eq.id}
                    onClick={() => {
                      toggleEquipment(eq.id);
                      if (isSelected) {
                        toast.info(`${eq.name} eliminado`);
                      } else {
                        toast.success(`${eq.name} seleccionado`);
                      }
                      setDrawerOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{eq.emoji}</div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">{eq.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{eq.description}</div>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center border-2">{isSelected ? '✓' : ''}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      )}

    </ProtectedRoute>
  );
}
