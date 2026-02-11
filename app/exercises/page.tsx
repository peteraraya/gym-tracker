'use client';

import React, { useState } from 'react';
// import Link from 'next/link';
import { MUSCLE_GROUPS, getExercisesByMuscleGroup, ExerciseTemplate, MuscleGroup } from '@/data/exercises';
import { getWarmupsByMuscleGroup, WARMUP_CATEGORY_LABELS, WarmupExercise, WarmupCategory } from '@/data/warmupExercises';
import { useToast } from '@/context/ToastContext';
import { EQUIPMENT_LIST } from '@/data/equipment';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
// Button reused styles via plain buttons; no import needed
import { ExerciseDetails } from '@/components/ExerciseDetails';
import { ExerciseIcon } from '@/components/ExerciseIcon';
import { MuscleGroupIcon } from '@/components/icons/MuscleGroupIcons';
import { useEquipment } from '@/context/EquipmentContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ExercisesPage() {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseTemplate | null>(null);
  const [exerciseTab, setExerciseTab] = useState<'training' | 'warmup'>('training');
  const { hasEquipment, selectedEquipment, setEquipment, clearEquipment, toggleEquipment } = useEquipment();
  const toast = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [warmupCategoryFilter, setWarmupCategoryFilter] = useState<'all' | WarmupCategory>('all');

  const filteredExercises = selectedMuscle
    ? getExercisesByMuscleGroup(selectedMuscle)
      .filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(ex => hasEquipment(ex.equipment))
    : [];

  const allWarmupExercises: WarmupExercise[] = selectedMuscle
    ? getWarmupsByMuscleGroup(selectedMuscle)
      .filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const warmupExercises: WarmupExercise[] = warmupCategoryFilter === 'all'
    ? allWarmupExercises
    : allWarmupExercises.filter(ex => ex.category === warmupCategoryFilter);

  const currentExercises: ExerciseTemplate[] = exerciseTab === 'training' ? filteredExercises : warmupExercises;

  const availableCount = exerciseTab === 'training' ? filteredExercises.length : warmupExercises.length;
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
              <button
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm"
              >
                ⚙️ Equipamiento
              </button>
            </div>

            {selectedEquipment.size > 0 && (
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400">🏋️</span>
                    <span className="text-sm text-blue-800 dark:text-blue-300">Filtrando por {selectedEquipment.size} equipamiento{selectedEquipment.size !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEquipment(new Set(EQUIPMENT_LIST.map(e => e.id)));
                        toast.success('Seleccionado todo el equipamiento');
                      }}
                      className="px-3 py-1 rounded-lg bg-white dark:bg-zinc-800 text-sm border"
                    >
                      ✅ Todo
                    </button>
                    <button
                      onClick={() => {
                        clearEquipment();
                        toast.info('Selección limpiada');
                      }}
                      className="px-3 py-1 rounded-lg bg-transparent text-sm border"
                    >
                      🗑️ Limpiar
                    </button>
                    <button
                      onClick={() => setDrawerOpen(true)}
                      className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm"
                    >
                      ⚙️ Editar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!selectedMuscle ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Selecciona un grupo muscular</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {MUSCLE_GROUPS.map((muscle) => {
                  const exercisesForMuscle = getExercisesByMuscleGroup(muscle.id);
                  const total = exercisesForMuscle.length;
                  const available = exercisesForMuscle.filter(ex => hasEquipment(ex.equipment)).length;
                  const warmupCount = getWarmupsByMuscleGroup(muscle.id).length;
                  return (
                    <button
                      key={muscle.id}
                      onClick={() => { setSelectedMuscle(muscle.id); setExerciseTab('training'); }}
                      className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all group"
                      aria-label={`Seleccionar grupo ${muscle.name}, ${total} ejercicios`}
                    >
                      <div className="mb-1 group-hover:scale-110 transition-transform">
                        <MuscleGroupIcon muscleGroup={muscle.id} size={48} className="text-blue-500 dark:text-blue-400" />
                      </div>
                      <span className="text-base font-semibold text-gray-900 dark:text-gray-100 text-center">{muscle.name}</span>
                      {selectedEquipment.size > 0 ? (
                        <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">{available}/{total} ejercicios</span>
                      ) : (
                        <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">{total} ejercicios</span>
                      )}
                      {warmupCount > 0 && (
                        <span className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                          🔥 {warmupCount} calentamiento
                        </span>
                      )}

                      {total > 0 && total < 11 && (
                        <div className="mt-2 text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Pronto habrá más ejercicios</div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
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
                  }}
                  className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  ← Volver
                </button>
              </div>

              <div className="mb-6">
                <Input placeholder="Buscar ejercicio..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>

              {/* Tab entrenam. vs calentamiento */}
              <div className="flex gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setExerciseTab('training')}
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
                  onClick={() => setExerciseTab('warmup')}
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
                      onClick={() => setWarmupCategoryFilter(filter.key)}
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

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentExercises.map((exercise) => {
                  const warmup = exerciseTab === 'warmup' ? exercise as WarmupExercise : null;
                  const categoryInfo = warmup ? WARMUP_CATEGORY_LABELS[warmup.category] : null;
                  return (
                  <Card key={exercise.id} className={`hover:shadow-lg transition-shadow ${exerciseTab === 'warmup' ? 'border-amber-200 dark:border-amber-800' : ''}`}>
                    {exercise.image ? (
                      <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
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
                      <div className={`flex justify-center p-6 ${exerciseTab === 'warmup' 
                        ? 'bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20' 
                        : 'bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700'}`}>
                        {exerciseTab === 'warmup' ? (
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-6xl">🔥</span>
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
                          <ExerciseIcon muscleGroup={exercise.muscleGroup} className="w-32 h-32" />
                        )}
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg">{exercise.name}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">{exercise.equipment}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {exercise.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{exercise.description}</p>
                        )}

                        {warmup && warmup.duration && (
                          <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
                            <span>⏱️</span>
                            <span>Duración: {warmup.duration}</span>
                          </div>
                        )}

                        {warmup && warmup.targetMuscles && (
                          <div className="flex flex-wrap gap-1">
                            {warmup.targetMuscles.map(m => (
                              <span key={m} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                🎯 {MUSCLE_GROUPS.find(mg => mg.id === m)?.name || m}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {exercise.recommendedSets && (
                            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                              <div className="text-green-700 dark:text-green-400 font-semibold">Series</div>
                              <div className="text-green-900 dark:text-green-200">{exercise.recommendedSets}</div>
                            </div>
                          )}
                          {exercise.recommendedReps && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                              <div className="text-blue-700 dark:text-blue-400 font-semibold">Reps</div>
                              <div className="text-blue-900 dark:text-blue-200">{exercise.recommendedReps}</div>
                            </div>
                          )}
                        </div>

                        {exercise.restTime && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>⏱️</span>
                            <span>Descanso: {exercise.restTime}</span>
                          </div>
                        )}

                        <button onClick={() => setSelectedExercise(exercise)} className={`w-full mt-3 py-2 ${exerciseTab === 'warmup' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold rounded-lg transition-colors`}>Ver técnica completa</button>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>

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
