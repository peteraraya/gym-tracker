'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MUSCLE_GROUPS, getExercisesByMuscleGroup, ExerciseTemplate, MuscleGroup } from '@/data/exercises';
import { useToast } from '@/context/ToastContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ExerciseDetails } from '@/components/ExerciseDetails';
import { ExerciseIcon } from '@/components/ExerciseIcon';
import { MuscleGroupIcon } from '@/components/icons/MuscleGroupIcons';
import { useEquipment } from '@/context/EquipmentContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ExercisesPage() {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseTemplate | null>(null);
  const { hasEquipment, selectedEquipment } = useEquipment();
  const toast = useToast();

  const filteredExercises = selectedMuscle
    ? getExercisesByMuscleGroup(selectedMuscle)
      .filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(ex => hasEquipment(ex.equipment))
    : [];

  const availableCount = filteredExercises.length;
  const totalCount = selectedMuscle ? getExercisesByMuscleGroup(selectedMuscle).length : 0;

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              💡 Guía de Ejercicios
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Explora ejercicios con técnicas y recomendaciones profesionales
            </p>
            {selectedEquipment.size > 0 && (
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400">🏋️</span>
                    <span className="text-sm text-blue-800 dark:text-blue-300">
                      Filtrando por {selectedEquipment.size} equipamiento{selectedEquipment.size !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <Link href="/equipment">
                    <Button variant="ghost" size="sm">
                      ⚙️ Configurar
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {!selectedMuscle ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Selecciona un grupo muscular
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {MUSCLE_GROUPS.map((muscle) => {
                  const exercisesForMuscle = getExercisesByMuscleGroup(muscle.id);
                  const total = exercisesForMuscle.length;
                  const available = exercisesForMuscle.filter(ex => hasEquipment(ex.equipment)).length;
                  return (
                    <button
                      key={muscle.id}
                      onClick={() => setSelectedMuscle(muscle.id)}
                      className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all group"
                      aria-label={`Seleccionar grupo ${muscle.name}, ${total} ejercicios`}
                    >
                      <div className="mb-1 group-hover:scale-110 transition-transform">
                        <MuscleGroupIcon
                          muscleGroup={muscle.id}
                          size={48}
                          className="text-blue-500 dark:text-blue-400"
                        />
                      </div>
                      <span className="text-base font-semibold text-gray-900 dark:text-gray-100 text-center">
                        {muscle.name}
                      </span>
                      {selectedEquipment.size > 0 ? (
                        <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {available}/{total} ejercicios
                        </span>
                      ) : (
                        <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {total} ejercicios
                        </span>
                      )}

                      {total > 0 && total < 11 && (
                        <div className="mt-2 text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Pronto habrá más ejercicios
                          </div>
                          {/*
                          <small>
                            <button
                              onClick={() => toast.info(`Te avisaremos cuando agreguemos más ejercicios en ${muscle.name}`)}
                              className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Avisarme
                            </button>
                          </small>
                          */}
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
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {MUSCLE_GROUPS.find(m => m.id === selectedMuscle)?.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {availableCount} de {totalCount} ejercicios disponibles
                    {selectedEquipment.size > 0 && availableCount < totalCount && (
                      <span className="ml-2 text-blue-600 dark:text-blue-400">
                        (filtrado por equipamiento)
                      </span>
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
                <Input
                  placeholder="Buscar ejercicio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {totalCount > 0 && totalCount < 11 && (
                <div className="mb-6 p-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl text-center">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Pronto habrá más ejercicios</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Estamos trabajando en ampliar esta sección. Mientras tanto puedes explorar otros grupos musculares o suscribirte para recibir notificaciones.</p>
                  <div className="mt-4">
                    {/*
                    <button
                      onClick={() => toast.info(`Te avisaremos cuando agreguemos más ejercicios en ${MUSCLE_GROUPS.find(m=>m.id===selectedMuscle)?.name}`)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
                    >
                      Avisarme
                    </button>
                    */}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExercises.map((exercise) => (
                  <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
                    {exercise.image ? (
                      <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={exercise.image}
                          alt={exercise.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            // Si la imagen falla, ocultar contenedor
                            const target = e.target as HTMLImageElement;
                            const parent = target.parentElement;
                            if (parent) {
                              parent.style.display = 'none';
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex justify-center p-6 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <ExerciseIcon
                          muscleGroup={exercise.muscleGroup}
                          className="w-32 h-32"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg">{exercise.name}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {exercise.equipment}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {exercise.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {exercise.description}
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {exercise.recommendedSets && (
                            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                              <div className="text-green-700 dark:text-green-400 font-semibold">
                                Series
                              </div>
                              <div className="text-green-900 dark:text-green-200">
                                {exercise.recommendedSets}
                              </div>
                            </div>
                          )}
                          {exercise.recommendedReps && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                              <div className="text-blue-700 dark:text-blue-400 font-semibold">
                                Reps
                              </div>
                              <div className="text-blue-900 dark:text-blue-200">
                                {exercise.recommendedReps}
                              </div>
                            </div>
                          )}
                        </div>

                        {exercise.restTime && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>⏱️</span>
                            <span>Descanso: {exercise.restTime}</span>
                          </div>
                        )}

                        <button
                          onClick={() => setSelectedExercise(exercise)}
                          className="w-full mt-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                        >
                          Ver técnica completa
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredExercises.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    No se encontraron ejercicios
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Intenta con otro término de búsqueda
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {selectedExercise && (
          <ExerciseDetails
            exercise={selectedExercise}
            onClose={() => setSelectedExercise(null)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
