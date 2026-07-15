'use client';

import { useState } from 'react';
import { ExerciseTemplate } from '@/data/exercises/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import YouTubeEmbed from '@/components/shared/YouTubeEmbed';
import { 
  Info, 
  AlertTriangle, 
  Lightbulb, 
  Target, 
  TrendingUp,
  Shield,
  Play,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Clock,
  BarChart3
} from '@/components/icons/lucide';

interface ExerciseGuideProps {
  exercise: ExerciseTemplate;
  onClose?: () => void;
}

export default function ExerciseGuide({ exercise, onClose }: ExerciseGuideProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'technique' | 'variations'>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['instructions']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'principiante': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'intermedio': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'avanzado': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'compuesto': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'aislamiento': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'cardio': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'movilidad': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8 shadow-2xl animate-fadeIn">
        {/* Header */}
        <CardHeader className="bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-t-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-white mb-2">
                {exercise.name}
              </CardTitle>
              <p className="text-blue-100 text-sm mb-3">
                {exercise.description || 'Ejercicio para desarrollo muscular'}
              </p>
              <div className="flex flex-wrap gap-2">
                {exercise.difficulty && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(exercise.difficulty)}`}>
                    {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                  </span>
                )}
                {exercise.category && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(exercise.category)}`}>
                    {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)}
                  </span>
                )}
                {exercise.equipment && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
                    <Dumbbell className="w-3 h-3 inline mr-1" />
                    {exercise.equipment}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <span className="text-2xl text-white">×</span>
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Info className="w-4 h-4 inline mr-2" />
              Información General
            </button>
            <button
              onClick={() => setActiveTab('technique')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'technique'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Target className="w-4 h-4 inline mr-2" />
              Técnica
            </button>
            <button
              onClick={() => setActiveTab('variations')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'variations'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Variaciones
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Image/Video */}
                <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {exercise.youtubeVideoId ? (
                    <YouTubeEmbed 
                      videoId={exercise.youtubeVideoId}
                      title={exercise.name}
                    />
                  ) : (
                    <>
                      <img
                        src={exercise.image || '/images/not-available.svg'}
                        alt={exercise.name}
                        className="w-full h-64 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.dataset.fallback) {
                            target.dataset.fallback = '1';
                            target.src = '/images/not-available.svg';
                          }
                        }}
                      />
                      {exercise.videoUrl && (
                        <a
                          href={exercise.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
                        >
                          <Play className="w-4 h-4" />
                          Ver Video
                        </a>
                      )}
                    </>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
                    <div className="text-xs text-gray-600 dark:text-gray-400">Series</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {exercise.recommendedSets || `${exercise.defaultSets || 3} series`}
                    </div>
                  </div>
                  <div className="p-4 bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <Target className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-2" />
                    <div className="text-xs text-gray-600 dark:text-gray-400">Repeticiones</div>
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {exercise.recommendedReps || `${exercise.defaultReps || 10} reps`}
                    </div>
                  </div>
                  <div className="p-4 bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
                    <Clock className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" />
                    <div className="text-xs text-gray-600 dark:text-gray-400">Descanso</div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {exercise.restTime || '60-90s'}
                    </div>
                  </div>
                </div>

                {/* Muscles Worked */}
                {(exercise.primaryMuscles || exercise.secondaryMuscles) && (
                  <div className="p-4 bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Músculos Trabajados
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">
                            Principales:
                          </div>
                          <ul className="space-y-1">
                            {exercise.primaryMuscles.map((muscle, idx) => (
                              <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                                {muscle}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">
                            Secundarios:
                          </div>
                          <ul className="space-y-1">
                            {exercise.secondaryMuscles.map((muscle, idx) => (
                              <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                                {muscle}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {exercise.benefits && exercise.benefits.length > 0 && (
                  <div className="p-4 bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Beneficios
                    </h4>
                    <ul className="space-y-2">
                      {exercise.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Technique Tab */}
            {activeTab === 'technique' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Instructions */}
                {exercise.instructions && exercise.instructions.length > 0 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      Instrucciones Paso a Paso
                    </h4>
                    <ol className="space-y-3">
                      {exercise.instructions.map((instruction, idx) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex gap-3">
                          <span className="shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="pt-0.5">{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Technique Points */}
                {exercise.technique && exercise.technique.length > 0 && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Puntos Clave de Técnica
                    </h4>
                    <ul className="space-y-2">
                      {exercise.technique.map((point, idx) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Common Mistakes */}
                {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Errores Comunes a Evitar
                    </h4>
                    <ul className="space-y-2">
                      {exercise.commonMistakes.map((mistake, idx) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-red-600 dark:text-red-400 mt-0.5">✗</span>
                          {mistake}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tips */}
                {exercise.tips && exercise.tips.length > 0 && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      Consejos Pro
                    </h4>
                    <ul className="space-y-2">
                      {exercise.tips.map((tip, idx) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">💡</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Safety Notes */}
                {exercise.safetyNotes && exercise.safetyNotes.length > 0 && (
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Notas de Seguridad
                    </h4>
                    <ul className="space-y-2">
                      {exercise.safetyNotes.map((note, idx) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-orange-600 dark:text-orange-400 mt-0.5">⚠️</span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Variations Tab */}
            {activeTab === 'variations' && (
              <div className="space-y-6 animate-fadeIn">
                {exercise.variations?.easier && exercise.variations.easier.length > 0 && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">
                      ✅ Variaciones Más Fáciles (Principiantes)
                    </h4>
                    <ul className="space-y-2">
                      {exercise.variations.easier.map((variation, idx) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-green-600 dark:text-green-400 mt-0.5">→</span>
                          {variation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {exercise.variations?.harder && exercise.variations.harder.length > 0 && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-3">
                      🔥 Variaciones Más Difíciles (Avanzados)
                    </h4>
                    <ul className="space-y-2">
                      {exercise.variations.harder.map((variation, idx) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-red-600 dark:text-red-400 mt-0.5">→</span>
                          {variation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {exercise.variations?.alternative && exercise.variations.alternative.length > 0 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                      🔄 Ejercicios Alternativos
                    </h4>
                    <ul className="space-y-2">
                      {exercise.variations.alternative.map((variation, idx) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-blue-600 dark:text-blue-400 mt-0.5">→</span>
                          {variation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(!exercise.variations || 
                  (!exercise.variations.easier?.length && 
                   !exercise.variations.harder?.length && 
                   !exercise.variations.alternative?.length)) && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No hay variaciones disponibles para este ejercicio</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
