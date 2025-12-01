'use client';

import React, { useState, useEffect } from 'react';
import { RECOMMENDED_ROUTINES, RecommendedRoutine } from '@/data/recommendedRoutines';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Exercise, UserProfile } from '@/types';
import { getRecommendedRoutines, getRecommendationReason, type RoutineRecommendation } from '@/lib/recommendations';
import Link from 'next/link';

export default function RecommendedRoutinesPage() {
  const { addRoutine } = useGym();
  const { success, error, info } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [selectedRoutine, setSelectedRoutine] = useState<RecommendedRoutine | null>(null);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<RoutineRecommendation[]>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const profile: UserProfile | null = await response.json();
        setUserProfile(profile);
        if (profile) {
          const recommendations = getRecommendedRoutines(profile);
          setPersonalizedRecommendations(recommendations);
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const filteredRoutines = selectedCategory === 'all'
    ? RECOMMENDED_ROUTINES
    : RECOMMENDED_ROUTINES.filter(r => r.category === selectedCategory);

  const handleSaveRoutine = async (routine: RecommendedRoutine) => {
    setSaving(true);
    try {
      // Normalizar ejercicios: soportar formato antiguo (sets: number, reps: number)
      const normalizedExercises = routine.exercises.map((exercise, index) => {
        const base: any = {
          id: `${crypto.randomUUID()}-${index}`,
          name: exercise.name,
          notes: (exercise as any).notes || undefined,
          equipment: (exercise as any).equipment || undefined,
        };

        // Si 'sets' es un número (formato antiguo), convertir a array de objetos { reps, weight }
        if (typeof (exercise as any).sets === 'number') {
          const setsCount = (exercise as any).sets;
          const reps = (exercise as any).reps || 10;
          const weight = (exercise as any).weight || 0;
          base.sets = Array.from({ length: setsCount }, () => ({ reps, weight }));
        } else if (Array.isArray((exercise as any).sets)) {
          base.sets = (exercise as any).sets;
        } else {
          base.sets = [{ reps: (exercise as any).reps || 10, weight: (exercise as any).weight || 0 }];
        }

        return base as Exercise;
      });

      await addRoutine({
        name: routine.name,
        description: routine.description,
        image: routine.image,
        exercises: normalizedExercises,
        restBetweenSets: routine.restBetweenSets,
        restBetweenExercises: routine.restBetweenExercises,
      });

      success('Rutina guardada exitosamente en "Mis Rutinas"');
      setSelectedRoutine(null);
    } catch (err) {
      console.error('Error saving routine:', err);
      error('Error al guardar la rutina');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'beginner': return '🟢 Principiante';
      case 'intermediate': return '🟡 Intermedio';
      case 'advanced': return '🔴 Avanzado';
      default: return '';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'beginner': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      default: return '';
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              🎯 Rutinas Recomendadas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Rutinas profesionales listas para guardar y comenzar a entrenar
            </p>
            {/* Botón de import masivo omitido por ahora (solicitado). */}
          </div>

          {/* Recomendaciones personalizadas */}
          {!profileLoading && personalizedRecommendations.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ✨ Recomendadas para ti
                </h2>
                {!userProfile && (
                  <Link href="/profile">
                    <Button variant="ghost" size="sm">
                      Completar perfil →
                    </Button>
                  </Link>
                )}
              </div>

              {userProfile && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🎯</span>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Basado en tu perfil
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {userProfile.fitnessGoal && (
                      <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300">
                        Objetivo: {
                          userProfile.fitnessGoal === 'muscle_gain' ? '💪 Ganar músculo' :
                          userProfile.fitnessGoal === 'strength' ? '🏋️ Fuerza' :
                          userProfile.fitnessGoal === 'weight_loss' ? '🔥 Perder peso' :
                          userProfile.fitnessGoal === 'endurance' ? '⚡ Resistencia' :
                          '🎯 Fitness general'
                        }
                      </span>
                    )}
                    {userProfile.fitnessLevel && (
                      <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300">
                        Nivel: {
                          userProfile.fitnessLevel === 'beginner' ? '🌱 Principiante' :
                          userProfile.fitnessLevel === 'intermediate' ? '📈 Intermedio' :
                          '🏆 Avanzado'
                        }
                      </span>
                    )}
                    {userProfile.weeklyWorkouts && (
                      <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300">
                        Disponibilidad: {userProfile.weeklyWorkouts} días/semana
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {personalizedRecommendations.map((rec) => (
                  <Card key={rec.id} className="hover:shadow-lg transition-shadow border-2 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg flex-1">{rec.name}</CardTitle>
                        <span className="text-2xl ml-2">⭐</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          rec.difficulty === 'beginner' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' :
                          rec.difficulty === 'intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' :
                          'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                        }`}>
                          {rec.difficulty === 'beginner' ? '🟢 Principiante' :
                           rec.difficulty === 'intermediate' ? '🟡 Intermedio' :
                           '🔴 Avanzado'}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300">
                          {rec.splitType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {rec.description}
                      </p>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
                          ¿Por qué esta rutina?
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-400">
                          {getRecommendationReason(rec, userProfile)}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                              Frecuencia
                            </div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                              {rec.daysPerWeek} días/semana
                            </div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                              Objetivos
                            </div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100 text-xs">
                              {rec.goals.length} objetivos
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="primary"
                          className="w-full"
                          onClick={() => {
                            // Scroll hasta la sección de rutinas disponibles
                            const routinesSection = document.querySelector('[data-routines-section]');
                            if (routinesSection) {
                              routinesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              
                              // Buscar rutinas relacionadas y aplicar filtro
                              const searchTerms = rec.name.toLowerCase();
                              if (searchTerms.includes('push pull legs') || searchTerms.includes('ppl')) {
                                // No cambiar filtro, dejar que el usuario vea todas las PPL disponibles
                              } else if (searchTerms.includes('principiante') || rec.difficulty === 'beginner') {
                                setSelectedCategory('beginner');
                              } else if (searchTerms.includes('intermedio') || rec.difficulty === 'intermediate') {
                                setSelectedCategory('intermediate');
                              } else if (searchTerms.includes('avanzado') || rec.difficulty === 'advanced') {
                                setSelectedCategory('advanced');
                              }
                            }
                            
                            info('Por favor, selecciona las rutinas individuales que quieres guardar de la sección "Todas las rutinas disponibles" abajo. 👇');
                          }}
                        >
                          📥 Ver rutinas disponibles
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-8" data-routines-section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Todas las rutinas disponibles
                </h2>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === 'all' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              📚 Todas ({RECOMMENDED_ROUTINES.length})
            </Button>
            <Button
              variant={selectedCategory === 'beginner' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCategory('beginner')}
            >
              🟢 Principiante
            </Button>
            <Button
              variant={selectedCategory === 'intermediate' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCategory('intermediate')}
            >
              🟡 Intermedio
            </Button>
            <Button
              variant={selectedCategory === 'advanced' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCategory('advanced')}
            >
              🔴 Avanzado
            </Button>
          </div>

          {/* Grid de rutinas */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoutines.map((routine) => (
              <Card key={routine.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg flex-1">{routine.name}</CardTitle>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(routine.category)}`}>
                      {getCategoryLabel(routine.category)}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                      {routine.goal}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {routine.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Info de la rutina */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                          Frecuencia
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {routine.frequency}
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                          Duración
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {routine.duration}
                        </div>
                      </div>
                    </div>

                    {/* Ejercicios preview */}
                    <div>
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                        Ejercicios ({routine.exercises.length}):
                      </div>
                      <div className="space-y-1">
                        {routine.exercises.slice(0, 4).map((exercise, idx) => (
                          <div
                            key={idx}
                            className="text-sm text-gray-700 dark:text-gray-300"
                          >
                            • {exercise.name} ({exercise.sets}×{exercise.reps})
                          </div>
                        ))}
                        {routine.exercises.length > 4 && (
                          <div className="text-sm text-gray-500 dark:text-gray-500">
                            +{routine.exercises.length - 4} más
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedRoutine(routine)}
                      >
                        👁️ Ver detalles
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleSaveRoutine(routine)}
                        disabled={saving}
                      >
                        💾 Guardar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRoutines.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No hay rutinas en esta categoría
              </h3>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      {selectedRoutine && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {selectedRoutine.name}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(selectedRoutine.category)}`}>
                      {getCategoryLabel(selectedRoutine.category)}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {selectedRoutine.goal}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                      {selectedRoutine.frequency}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                      {selectedRoutine.duration}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRoutine(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl ml-4"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  📋 Descripción
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedRoutine.description}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  💪 Ejercicios ({selectedRoutine.exercises.length})
                </h3>
                <div className="space-y-2">
                  {selectedRoutine.exercises.map((exercise, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {idx + 1}. {exercise.name}
                        </div>
                        {exercise.notes && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {exercise.notes}
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {exercise.sets} × {exercise.reps}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-blue-700 dark:text-blue-400 text-sm mb-1">
                    Descanso entre series
                  </div>
                  <div className="text-xl font-bold text-blue-900 dark:text-blue-200">
                    {selectedRoutine.restBetweenSets}s
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-green-700 dark:text-green-400 text-sm mb-1">
                    Descanso entre ejercicios
                  </div>
                  <div className="text-xl font-bold text-green-900 dark:text-green-200">
                    {selectedRoutine.restBetweenExercises}s
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedRoutine(null)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleSaveRoutine(selectedRoutine)}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? 'Guardando...' : '💾 Guardar en mis rutinas'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
