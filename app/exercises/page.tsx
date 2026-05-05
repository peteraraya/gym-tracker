'use client';

import { useState, useMemo } from 'react';
import { MUSCLE_GROUPS, getExercisesByMuscleGroup, ExerciseTemplate, MuscleGroup } from '@/data/exercises';
import { getWarmupsByMuscleGroup, WARMUP_CATEGORY_LABELS, WarmupExercise, WarmupCategory } from '@/data/warmupExercises';
import { useToast } from '@/context/ToastContext';
import { EQUIPMENT_LIST } from '@/data/equipment';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Image from 'next/image';
import { ExerciseDetails } from '@/components/ExerciseDetails';
import { ExerciseIcon } from '@/components/ExerciseIcon';
import { MuscleGroupIcon } from '@/components/icons/MuscleGroupIcons';
import { useEquipment } from '@/context/EquipmentContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { APP_CONFIG } from '@/config/app.config';
import { useFilteredData } from '@/hooks/useFilteredData';
import { EmptyState } from '@/components/EmptyState';
import { VirtualList } from '@/components/VirtualList';

const ITEMS_PER_PAGE = APP_CONFIG.pagination.exercisesPerPage;

function ExerciseImage({ exercise }: { exercise: ExerciseTemplate }) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <div className="w-full h-40 sm:h-full relative bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none">
      <Image
        src={exercise.image!}
        alt={exercise.name}
        fill
        className="object-cover hover:scale-105 transition-transform duration-300"
        sizes="(max-width: 640px) 100vw, 160px"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

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

  // Cachear ejercicios del músculo seleccionado para evitar llamadas repetidas
  const muscleExercises = useMemo(() => {
    if (!selectedMuscle) return [];
    return getExercisesByMuscleGroup(selectedMuscle);
  }, [selectedMuscle]);

  const muscleWarmups = useMemo(() => {
    if (!selectedMuscle) return [];
    return getWarmupsByMuscleGroup(selectedMuscle);
  }, [selectedMuscle]);

  // Filtrar ejercicios de entrenamiento
  const filteredExercises = useMemo(() => {
    return muscleExercises
      .filter(ex => hasEquipment(ex.equipment));
  }, [muscleExercises, hasEquipment]);

  // Usar hook genérico para filtrado y paginación
  const trainingData = useFilteredData(
    filteredExercises,
    searchTerm,
    (ex, search) => ex.name.toLowerCase().includes(search),
    { itemsPerPage: ITEMS_PER_PAGE }
  );

  // Filtrar ejercicios de calentamiento
  const allWarmupExercises = useMemo(() => {
    return muscleWarmups;
  }, [muscleWarmups]);

  const warmupExercises = useMemo(() => {
    return warmupCategoryFilter === 'all'
      ? allWarmupExercises
      : allWarmupExercises.filter(ex => ex.category === warmupCategoryFilter);
  }, [allWarmupExercises, warmupCategoryFilter]);

  // Usar hook genérico para warmups
  const warmupData = useFilteredData(
    warmupExercises,
    searchTerm,
    (ex, search) => ex.name.toLowerCase().includes(search),
    { itemsPerPage: ITEMS_PER_PAGE }
  );

  // Datos actuales según tab
  const currentData = exerciseTab === 'training' ? trainingData : warmupData;
  const totalCount = exerciseTab === 'training' ? muscleExercises.length : muscleWarmups.length;

  // Handlers optimizados
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleTabChange = (tab: 'training' | 'warmup') => {
    setExerciseTab(tab);
    setWarmupCategoryFilter('all');
  };

  const handleCategoryChange = (category: 'all' | WarmupCategory) => {
    setWarmupCategoryFilter(category);
  };

  const handleMuscleSelect = (muscleId: MuscleGroup) => {
    setSelectedMuscle(muscleId);
    setExerciseTab('training');
    setSearchTerm('');
    setWarmupCategoryFilter('all');
  };

  const handleBackToMuscles = () => {
    setSelectedMuscle(null);
    setSearchTerm('');
    setExerciseTab('training');
    setWarmupCategoryFilter('all');
  };

  const handleEquipmentSelect = () => {
    setEquipment(new Set(EQUIPMENT_LIST.map(e => e.id)));
    toast.success('Seleccionado todo el equipamiento');
  };

  const handleEquipmentClear = () => {
    clearEquipment();
    toast.info('Selección limpiada');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-6 sm:py-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <span className="text-2xl">💡</span>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                      Guía de Ejercicios
                    </h1>
                    <p className="text-white/80 mt-1 text-sm sm:text-base">
                      Explora ejercicios con técnicas profesionales
                    </p>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setDrawerOpen(true)}
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white border-white/30 hover:bg-white/30 transition-all text-sm"
                >
                  <span className="text-base">⚙️</span>
                  <span className="hidden sm:inline">Equipamiento</span>
                </Button>
              </div>

              {/* Filtro de equipamiento */}
              {selectedEquipment.size > 0 && (
                <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🏋️</span>
                      <span className="text-sm font-medium text-white">
                        Filtrando por {selectedEquipment.size} equipamiento{selectedEquipment.size !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleEquipmentSelect}
                        className="text-xs bg-white/30 hover:bg-white/40 text-white border-0"
                      >
                        ✅ Todo
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={handleEquipmentClear}
                        className="text-xs bg-red-500/30 hover:bg-red-500/40 text-white border-0"
                      >
                        🗑️ Limpiar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto">
            {/* Rest of the content remains the same... */}
            {!selectedMuscle ? (
              <>
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Selecciona un grupo muscular
                  </h2>
                 
                  {/* Buscador */}
                  <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-xl">🔍</span>
                    </div>
                    <Input 
                      placeholder="Buscar grupo muscular..." 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-10 py-3 text-base shadow-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-xl"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label="Limpiar búsqueda"
                      >
                        <span className="text-2xl">×</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid de grupos musculares */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
                          onClick={() => handleMuscleSelect(muscle.id)}
                          className="group relative flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
                          aria-label={`Seleccionar grupo ${muscle.name}, ${total} ejercicios`}
                        >
                          <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          <div className="relative z-10 mb-3 group-hover:scale-110 transition-transform duration-300">
                            <MuscleGroupIcon muscleGroup={muscle.id} size={56} className="text-blue-500 dark:text-blue-400" />
                          </div>
                          <span className="relative z-10 text-base font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
                            {muscle.name}
                          </span>
                          
                          <div className="relative z-10 flex flex-col items-center gap-1.5">
                            {selectedEquipment.size > 0 ? (
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                                {available}/{total} disponibles
                              </span>
                            ) : (
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                                {total} ejercicio{total !== 1 ? 's' : ''}
                              </span>
                            )}
                            {warmupCount > 0 && (
                              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                                🔥 {warmupCount} calentamiento{warmupCount !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                </div>

                {/* No results */}
                {searchTerm && MUSCLE_GROUPS.filter(muscle => 
                  muscle.name.toLowerCase().includes(searchTerm.toLowerCase())
                ).length === 0 && (
                  <EmptyState
                    icon="🔍"
                    title="No se encontraron grupos"
                    description="Intenta con otro término"
                    action={
                      <button
                        onClick={() => setSearchTerm('')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all shadow-md hover:shadow-lg"
                      >
                        Limpiar búsqueda
                      </button>
                    }
                  />
                )}
              </>
            ) : (
              <>
                {/* Vista de ejercicios */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {MUSCLE_GROUPS.find(m => m.id === selectedMuscle)?.name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {currentData.total} de {totalCount} disponibles
                      {selectedEquipment.size > 0 && currentData.total < totalCount && (
                        <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">(filtrado)</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={handleBackToMuscles}
                    className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all font-medium"
                  >
                    ← Volver a grupos
                  </button>
                </div>

                {/* Buscador de ejercicios */}
                <div className="mb-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-xl">🔍</span>
                    </div>
                    <Input 
                      placeholder="Buscar ejercicio..." 
                      value={searchTerm} 
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-12 pr-10 py-3 text-base shadow-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-xl"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => handleSearchChange('')}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label="Limpiar búsqueda"
                      >
                        <span className="text-2xl">×</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => handleTabChange('training')}
                    className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl border-2 transition-all ${
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
                    className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl border-2 transition-all ${
                      exerciseTab === 'warmup'
                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 dark:border-amber-400 text-amber-700 dark:text-amber-300'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-300'
                    }`}
                  >
                    🔥 Calentamiento ({allWarmupExercises.length})
                  </button>
                </div>

                {/* Filtros de categoría */}
                {exerciseTab === 'warmup' && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {[
                      { key: 'all' as const, label: '🔥 Todos', count: allWarmupExercises.length },
                      { key: 'warmup' as const, label: '🌡️ Calentamiento', count: allWarmupExercises.filter(e => e.category === 'warmup').length },
                      { key: 'mobility' as const, label: '🧘 Movilidad', count: allWarmupExercises.filter(e => e.category === 'mobility').length },
                      { key: 'activation' as const, label: '⚡ Activación', count: allWarmupExercises.filter(e => e.category === 'activation').length },
                    ].map((filter) => (
                      <button
                        key={filter.key}
                        onClick={() => handleCategoryChange(filter.key)}
                        className={`px-3 py-2 text-xs font-medium rounded-full border-2 transition-all ${
                          warmupCategoryFilter === filter.key
                            ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-400 text-amber-700 dark:text-amber-300'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-300'
                        }`}
                      >
                        {filter.label} ({filter.count})
                      </button>
                    ))}
                  </div>
                )}

                {/* Lista de ejercicios */}
                <VirtualList
                  items={currentData.data}
                  estimateSize={250}
                  overscan={3}
                  className="space-y-4"
                  renderItem={(exercise) => {
                    const warmup = exerciseTab === 'warmup' ? exercise as WarmupExercise : null;
                    const categoryInfo = warmup ? WARMUP_CATEGORY_LABELS[warmup.category] : null;
                    return (
                      <Card key={exercise.id} className={`hover:shadow-xl transition-all duration-300 overflow-hidden ${
                        exerciseTab === 'warmup' ? 'border-amber-200 dark:border-amber-800' : 'border-gray-200 dark:border-gray-700'
                      }`}>
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Image/Icon */}
                          <div className="sm:w-48 shrink-0">
                            {exercise.image ? (
                              <ExerciseImage exercise={exercise} />
                            ) : (
                              <div className={`flex justify-center items-center h-40 sm:h-full ${
                                exerciseTab === 'warmup' 
                                  ? 'bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20' 
                                  : 'bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700'
                              } rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none`}>
                                {exerciseTab === 'warmup' ? (
                                  <div className="flex flex-col items-center gap-2">
                                    <span className="text-6xl">🔥</span>
                                    {categoryInfo && (
                                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
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

                          {/* Content */}
                          <div className="flex-1 p-5">
                            <div className="flex flex-col gap-3 mb-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{exercise.name}</h3>
                                  <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                      {exercise.equipment}
                                    </span>
                                    {warmup && categoryInfo && (
                                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                        {categoryInfo.icon} {categoryInfo.es}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button 
                                  onClick={() => setSelectedExercise(exercise)} 
                                  className="shrink-0 px-5 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                                >
                                  Ver técnica
                                </button>
                              </div>

                              {exercise.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{exercise.description}</p>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-3">
                              {exercise.recommendedSets && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                  <span className="text-green-700 dark:text-green-400 font-semibold text-sm">Series:</span>
                                  <span className="text-green-900 dark:text-green-200 text-sm font-medium">{exercise.recommendedSets}</span>
                                </div>
                              )}
                              {exercise.recommendedReps && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                  <span className="text-blue-700 dark:text-blue-400 font-semibold text-sm">Reps:</span>
                                  <span className="text-blue-900 dark:text-blue-200 text-sm font-medium">{exercise.recommendedReps}</span>
                                </div>
                              )}
                              {exercise.restTime && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <span className="text-gray-700 dark:text-gray-400 text-sm">⏱️ {exercise.restTime}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  }}
                />

                {/* Paginación */}
                {currentData.totalPages > 1 && (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Mostrando {(currentData.currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentData.currentPage * ITEMS_PER_PAGE, currentData.total)} de {currentData.total}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => currentData.setCurrentPage((prev: number) => Math.max(1, prev - 1))}
                        disabled={!currentData.hasPrevPage}
                        className="px-4 py-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-sm"
                      >
                        ← Anterior
                      </button>
                      {Array.from({ length: currentData.totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => currentData.setCurrentPage(page)}
                          className={`w-10 h-10 rounded-xl font-semibold transition-all text-sm ${
                            currentData.currentPage === page
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => currentData.setCurrentPage((prev: number) => Math.min(currentData.totalPages, prev + 1))}
                        disabled={!currentData.hasNextPage}
                        className="px-4 py-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-sm"
                      >
                        Siguiente →
                      </button>
                    </div>
                  </div>
                )}

                {/* No results */}
                {currentData.total === 0 && (
                  <EmptyState
                    icon={exerciseTab === 'warmup' ? '🔥' : '🔍'}
                    title={exerciseTab === 'warmup' ? 'No hay ejercicios de calentamiento' : 'No se encontraron ejercicios'}
                    description="Intenta con otro término"
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal de detalles */}
        {selectedExercise && (
          <ExerciseDetails exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
        )}

        {/* Drawer de equipamiento */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
            <aside className="ml-auto w-full sm:w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 max-h-screen overflow-y-auto p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">⚙️ Mi Equipamiento</h3>
                <button 
                  onClick={() => setDrawerOpen(false)} 
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl leading-none transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="flex gap-2 mb-6">
                <button 
                  onClick={() => { 
                    setEquipment(new Set(EQUIPMENT_LIST.map(e => e.id))); 
                    toast.success('Seleccionado todo el equipamiento'); 
                  }} 
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  ✅ Seleccionar todo
                </button>
                <button 
                  onClick={() => { 
                    clearEquipment(); 
                    toast.info('Selección limpiada'); 
                  }} 
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-red-400 text-gray-700 dark:text-gray-300 text-sm font-semibold transition-all"
                >
                  🗑️ Limpiar
                </button>
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
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500' 
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{eq.emoji}</div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100">{eq.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{eq.description}</div>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                          isSelected 
                            ? 'bg-blue-600 border-blue-600 text-white' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && '✓'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
