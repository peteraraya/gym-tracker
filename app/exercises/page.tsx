'use client';

import { useState, useMemo } from 'react';
import { MUSCLE_GROUPS, getExercisesByMuscleGroup, ExerciseTemplate, MuscleGroup } from '@/data/exercises';
import { getWarmupsByMuscleGroup, WARMUP_CATEGORY_LABELS, WarmupExercise, WarmupCategory } from '@/data/warmupExercises';
import { useToast } from '@/context/ToastContext';
import { EQUIPMENT_LIST } from '@/data/equipment';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ExerciseDetails } from '@/components/ExerciseDetails';
import { ExerciseIcon } from '@/components/ExerciseIcon';
import { MuscleGroupIcon } from '@/components/icons/MuscleGroupIcons';
import { useEquipment } from '@/context/EquipmentContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { APP_CONFIG } from '@/config/app.config';
import { useFilteredData } from '@/hooks/useFilteredData';
import { EmptyState } from '@/components/EmptyState';

const ITEMS_PER_PAGE = APP_CONFIG.pagination.exercisesPerPage;

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header optimizado para móvil */}
            <div className="mb-4 sm:mb-6 md:mb-8">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2 truncate">
                      💡 Guía de Ejercicios
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">
                      Explora ejercicios con técnicas profesionales
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setDrawerOpen(true)}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all text-sm"
                  >
                    <span className="text-base sm:text-lg">⚙️</span>
                    <span className="hidden sm:inline">Equipamiento</span>
                  </Button>
                </div>

            {/* Filtro de equipamiento optimizado para móvil */}
            {selectedEquipment.size > 0 && (
              <div className="mt-3 sm:mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 sm:p-4 shadow-sm">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">🏋️</span>
                    <span className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-300 flex-1">
                      Filtrando por {selectedEquipment.size} equipamiento{selectedEquipment.size !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleEquipmentSelect}
                      className="text-xs flex-1 sm:flex-none min-w-0"
                    >
                      ✅ Todo
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleEquipmentClear}
                      className="text-xs flex-1 sm:flex-none min-w-0"
                    >
                      🗑️ Limpiar
                    </Button>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => setDrawerOpen(true)}
                      className="text-xs flex-1 sm:flex-none min-w-0"
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
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                  Selecciona un grupo muscular
                </h2>
                
                {/* Buscador optimizado para móvil */}
                <div className="relative mb-4 sm:mb-6">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-lg sm:text-xl">🔍</span>
                  </div>
                  <Input 
                    placeholder="Buscar grupo muscular..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3 text-sm sm:text-base shadow-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-xl"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors active:scale-95"
                      aria-label="Limpiar búsqueda"
                    >
                      <span className="text-xl sm:text-2xl">×</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Grid optimizado para móvil */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">{MUSCLE_GROUPS
                  .filter(muscle => 
                    muscle.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((muscle) => {
                  const searchLower = searchTerm.toLowerCase();
                  const exercisesForMuscle = getExercisesByMuscleGroup(muscle.id);
                  const total = exercisesForMuscle.length;
                  const available = exercisesForMuscle.filter(ex => hasEquipment(ex.equipment)).length;
                  const warmupCount = getWarmupsByMuscleGroup(muscle.id).length;
                  return (
                    <button
                      key={muscle.id}
                      onClick={() => handleMuscleSelect(muscle.id)}
                      className="group relative flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-2xl active:scale-95 sm:hover:scale-105 transition-all duration-300 overflow-hidden touch-manipulation"
                      aria-label={`Seleccionar grupo ${muscle.name}, ${total} ejercicios`}
                    >
                      {/* Efecto de fondo en hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="relative z-10 mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                        <MuscleGroupIcon muscleGroup={muscle.id} size={48} className="text-blue-500 dark:text-blue-400 sm:w-14 sm:h-14" />
                      </div>
                      <span className="relative z-10 text-xs sm:text-sm md:text-base font-bold text-gray-900 dark:text-gray-100 text-center mb-1 sm:mb-2 line-clamp-2">
                        {muscle.name}
                      </span>
                      
                      <div className="relative z-10 flex flex-col items-center gap-1 sm:gap-1.5 mt-1">
                        {selectedEquipment.size > 0 ? (
                          <span className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                            {available}/{total}
                          </span>
                        ) : (
                          <span className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                            {total} ejercicio{total !== 1 ? 's' : ''}
                          </span>
                        )}
                        {warmupCount > 0 && (
                          <span className="text-[9px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-400 font-medium shadow-sm">
                            🔥 {warmupCount}
                          </span>
                        )}
                      </div>

                      {total > 0 && total < 11 && (
                        <div className="relative z-10 mt-1 sm:mt-2 text-center">
                          <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 dark:text-gray-400 italic">Pronto más</div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* No results message optimizado */}
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
                      className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm sm:text-base font-medium rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                      Limpiar búsqueda
                    </button>
                  }
                />
              )}
            </>
          ) : (
            <>
              {/* Vista de ejercicios optimizada para móvil */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 truncate">
                    {MUSCLE_GROUPS.find(m => m.id === selectedMuscle)?.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {currentData.total} de {totalCount} disponibles
                    {selectedEquipment.size > 0 && currentData.total < totalCount && (
                      <span className="ml-1 sm:ml-2 text-blue-600 dark:text-blue-400 font-medium">(filtrado)</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={handleBackToMuscles}
                  className="flex-shrink-0 px-3 sm:px-4 py-2 text-sm sm:text-base text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all font-medium active:scale-95"
                >
                  ← Volver
                </button>
              </div>

              {/* Buscador optimizado */}
              <div className="mb-4 sm:mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-lg sm:text-xl">🔍</span>
                  </div>
                  <Input 
                    placeholder="Buscar ejercicio..." 
                    value={searchTerm} 
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3 text-sm sm:text-base shadow-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-xl"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => handleSearchChange('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors active:scale-95"
                      aria-label="Limpiar búsqueda"
                    >
                      <span className="text-xl sm:text-2xl">×</span>
                    </button>
                  )}
                </div>
                {searchTerm && (
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {currentData.total} resultado{currentData.total !== 1 ? 's' : ''} para &quot;{searchTerm}&quot;
                  </p>
                )}
              </div>

              {/* Tabs optimizados para móvil */}
              <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
                <button
                  type="button"
                  onClick={() => handleTabChange('training')}
                  className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-xl border-2 transition-all shadow-sm active:scale-95 ${
                    exerciseTab === 'training'
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300 shadow-md'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300 hover:shadow'
                  }`}
                >
                  <span className="hidden sm:inline">🏋️ Entrenamiento</span>
                  <span className="sm:hidden">🏋️</span>
                  <span className="ml-1">({filteredExercises.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('warmup')}
                  className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-xl border-2 transition-all shadow-sm active:scale-95 ${
                    exerciseTab === 'warmup'
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-500 dark:border-amber-400 text-amber-700 dark:text-amber-300 shadow-md'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-300 hover:shadow'
                  }`}
                >
                  <span className="hidden sm:inline">🔥 Calentamiento</span>
                  <span className="sm:hidden">🔥</span>
                  <span className="ml-1">({allWarmupExercises.length})</span>
                </button>
              </div>

              {/* Filtros de categoría optimizados */}
              {exerciseTab === 'warmup' && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                  {[
                    { key: 'all' as const, label: '🔥 Todos', count: allWarmupExercises.length },
                    { key: 'warmup' as const, label: WARMUP_CATEGORY_LABELS.warmup.icon + ' ' + WARMUP_CATEGORY_LABELS.warmup.es, count: allWarmupExercises.filter(e => e.category === 'warmup').length },
                    { key: 'mobility' as const, label: WARMUP_CATEGORY_LABELS.mobility.icon + ' ' + WARMUP_CATEGORY_LABELS.mobility.es, count: allWarmupExercises.filter(e => e.category === 'mobility').length },
                    { key: 'activation' as const, label: WARMUP_CATEGORY_LABELS.activation.icon + ' ' + WARMUP_CATEGORY_LABELS.activation.es, count: allWarmupExercises.filter(e => e.category === 'activation').length },
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => handleCategoryChange(filter.key)}
                      className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full border-2 transition-all shadow-sm active:scale-95 ${
                        warmupCategoryFilter === filter.key
                          ? filter.key === 'warmup' ? 'bg-gradient-to-r from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/20 border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 shadow-md'
                          : filter.key === 'mobility' ? 'bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 border-purple-400 dark:border-purple-600 text-purple-700 dark:text-purple-300 shadow-md'
                          : filter.key === 'activation' ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/20 border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300 shadow-md'
                          : 'bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-300 shadow-md'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-300 hover:shadow'
                      }`}
                    >
                      <span className="hidden sm:inline">{filter.label}</span>
                      <span className="sm:hidden">{filter.label.split(' ')[0]}</span>
                      <span className="ml-1">({filter.count})</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Mensaje "Pronto más" optimizado */}
              {totalCount > 0 && totalCount < 11 && (
                <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl sm:rounded-2xl text-center shadow-sm">
                  <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🚀</div>
                  <h3 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">Pronto habrá más ejercicios</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Estamos trabajando en ampliar esta sección.
                  </p>
                </div>
              )}

              {/* Lista de ejercicios optimizada para móvil */}
              <div className="space-y-3 sm:space-y-4">
                {currentData.data.map((exercise) => {
                  const warmup = exerciseTab === 'warmup' ? exercise as WarmupExercise : null;
                  const categoryInfo = warmup ? WARMUP_CATEGORY_LABELS[warmup.category] : null;
                  return (
                  <Card key={exercise.id} className={`hover:shadow-xl transition-all duration-300 overflow-hidden active:scale-[0.99] ${exerciseTab === 'warmup' ? 'border-amber-200 dark:border-amber-800' : 'border-gray-200 dark:border-gray-700'}`}>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      {/* Image/Icon Section optimizada */}
                      <div className="sm:w-40 md:w-48 flex-shrink-0">
                        {exercise.image ? (
                          <div className="w-full h-40 sm:h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={exercise.image} alt={exercise.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" onError={(e) => {
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
                          <div className={`flex justify-center items-center h-40 sm:h-full ${exerciseTab === 'warmup' 
                            ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20' 
                            : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700'} rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none`}>
                            {exerciseTab === 'warmup' ? (
                              <div className="flex flex-col items-center gap-2">
                                <span className="text-5xl sm:text-6xl">🔥</span>
                                {categoryInfo && (
                                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shadow-sm ${
                                    warmup?.category === 'warmup' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    : warmup?.category === 'mobility' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  }`}>
                                    {categoryInfo.icon} {categoryInfo.es}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <ExerciseIcon muscleGroup={exercise.muscleGroup} className="w-20 h-20 sm:w-24 sm:h-24" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Content Section optimizada para móvil */}
                      <div className="flex-1 p-3 sm:p-4 md:p-5">
                        <div className="flex flex-col gap-3 mb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">{exercise.name}</h3>
                              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                <span className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 text-blue-800 dark:text-blue-200 shadow-sm">
                                  {exercise.equipment}
                                </span>
                                {warmup && categoryInfo && (
                                  <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium shadow-sm ${
                                    warmup.category === 'warmup' ? 'bg-gradient-to-r from-red-100 to-red-50 text-red-700 dark:from-red-900/30 dark:to-red-800/20 dark:text-red-400'
                                    : warmup.category === 'mobility' ? 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 dark:from-purple-900/30 dark:to-purple-800/20 dark:text-purple-400'
                                    : 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 dark:from-yellow-900/30 dark:to-yellow-800/20 dark:text-yellow-400'
                                  }`}>
                                    {categoryInfo.icon} {categoryInfo.es}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button 
                              onClick={() => setSelectedExercise(exercise)} 
                              className={`flex-shrink-0 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 text-xs sm:text-sm ${exerciseTab === 'warmup' ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'} text-white font-semibold rounded-lg sm:rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap`}
                            >
                              <span className="hidden sm:inline">Ver técnica</span>
                              <span className="sm:hidden">Ver</span>
                            </button>
                          </div>

                          {exercise.description && (
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 sm:line-clamp-none">{exercise.description}</p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 sm:gap-3">
                          {exercise.recommendedSets && (
                            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg shadow-sm">
                              <span className="text-green-700 dark:text-green-400 font-semibold text-[10px] sm:text-sm">Series:</span>
                              <span className="text-green-900 dark:text-green-200 text-[10px] sm:text-sm font-medium">{exercise.recommendedSets}</span>
                            </div>
                          )}
                          {exercise.recommendedReps && (
                            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg shadow-sm">
                              <span className="text-blue-700 dark:text-blue-400 font-semibold text-[10px] sm:text-sm">Reps:</span>
                              <span className="text-blue-900 dark:text-blue-200 text-[10px] sm:text-sm font-medium">{exercise.recommendedReps}</span>
                            </div>
                          )}
                          {exercise.restTime && (
                            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg shadow-sm">
                              <span className="text-gray-700 dark:text-gray-400 text-[10px] sm:text-sm font-medium">⏱️ {exercise.restTime}</span>
                            </div>
                          )}
                          {warmup && warmup.duration && (
                            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg shadow-sm">
                              <span className="text-amber-700 dark:text-amber-400 text-[10px] sm:text-sm font-medium">⏱️ {warmup.duration}</span>
                            </div>
                          )}
                        </div>

                        {warmup && warmup.targetMuscles && warmup.targetMuscles.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
                            {warmup.targetMuscles.map(m => (
                              <span key={m} className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full font-medium">
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

              {/* Paginación optimizada para móvil */}
              {currentData.totalPages > 1 && (
                <div className="mt-6 sm:mt-8 flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium text-center sm:text-left">
                    Mostrando {(currentData.currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentData.currentPage * ITEMS_PER_PAGE, currentData.total)} de {currentData.total}
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3">
                    <button
                      onClick={() => currentData.setCurrentPage((prev: number) => Math.max(1, prev - 1))}
                      disabled={!currentData.hasPrevPage}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-400 transition-all font-medium shadow-sm text-sm active:scale-95"
                    >
                      ← Anterior
                    </button>
                    <div className="flex gap-1.5 sm:gap-2 overflow-x-auto max-w-full px-2">
                      {Array.from({ length: currentData.totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => currentData.setCurrentPage(page)}
                          className={`min-w-[36px] sm:min-w-[40px] h-9 sm:h-10 rounded-lg sm:rounded-xl font-semibold transition-all shadow-sm text-sm active:scale-95 ${
                            currentData.currentPage === page
                              ? exerciseTab === 'warmup'
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-400'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => currentData.setCurrentPage((prev: number) => Math.min(currentData.totalPages, prev + 1))}
                      disabled={!currentData.hasNextPage}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-400 transition-all font-medium shadow-sm text-sm active:scale-95"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              )}

              {/* Mensaje sin resultados optimizado */}
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

        {/* Modal de detalles */}
        {selectedExercise && (
          <ExerciseDetails exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
        )}
          </div>
        </div>
      </div>
      {/* Drawer mejorado */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity" onClick={() => setDrawerOpen(false)} />
          <aside className="ml-auto w-full sm:w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 max-h-screen overflow-y-auto p-6 z-60 shadow-2xl">
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
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
              >
                ✅ Seleccionar todo
              </button>
              <button 
                onClick={() => { 
                  clearEquipment(); 
                  toast.info('Selección limpiada'); 
                }} 
                className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500 text-gray-700 dark:text-gray-300 text-sm font-semibold transition-all"
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
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all shadow-sm hover:shadow-md ${
                      isSelected 
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-400 dark:border-blue-500' 
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
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
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

    </ProtectedRoute>
  );
}
