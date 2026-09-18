'use client';

import React, { useState } from 'react';
import { ChevronLeft, BookOpen, AlertCircle, Lightbulb, Zap } from '@/components/icons/lucide';
import type { ExerciseTemplate } from '@/data/exercises/types';
import YouTubeEmbed from '@/components/shared/YouTubeEmbed';

interface ExerciseInfoPanelProps {
  exercise: ExerciseTemplate;
  onClose: () => void;
}

type TabType = 'info' | 'tecnica' | 'errores' | 'consejos';

export const ExerciseInfoPanel: React.FC<ExerciseInfoPanelProps> = ({ exercise, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('info');

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'info', label: 'Información', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'tecnica', label: 'Técnica', icon: <Zap className="w-4 h-4" /> },
    { id: 'errores', label: 'Errores', icon: <AlertCircle className="w-4 h-4" /> },
    { id: 'consejos', label: 'Consejos', icon: <Lightbulb className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center pt-4 pb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4">
          {/* Header con imagen */}
          <div className="relative">
            {/* Imagen del ejercicio o Video de YouTube */}
            <div className="w-full h-64 sm:h-80 overflow-hidden rounded-t-2xl relative">
              {exercise.youtubeVideoId ? (
                <YouTubeEmbed 
                  videoId={exercise.youtubeVideoId} 
                  title={exercise.name}
                  className="w-full h-full rounded-none"
                />
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={exercise.image || '/images/not-available.svg'}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.dataset.fallback) {
                        target.dataset.fallback = '1';
                        target.src = '/images/not-available.svg';
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center">
                    {/* Botón de YouTube grande centrado cuando no hay imagen ni video */}
                    {(!exercise.image && !exercise.youtubeVideoId) && (
                      <a 
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent('ejercicio técnica ' + exercise.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-red-600/90 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:scale-105 transition-transform backdrop-blur-sm z-10"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        Buscar Técnica
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 z-10 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-lg"
              aria-label="Cerrar"
            >
              <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-gray-100" />
            </button>

            {/* Título sobre la imagen */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {exercise.name}
              </h2>
              <div className="flex flex-wrap gap-2">
                {exercise.muscleGroup && (
                  <span className="px-3 py-1 bg-blue-500/80 text-white text-sm font-medium rounded-full">
                    {exercise.muscleGroup}
                  </span>
                )}
                {exercise.difficulty && (
                  <span className={`px-3 py-1 text-white text-sm font-medium rounded-full ${
                    exercise.difficulty === 'principiante' ? 'bg-green-500/80' :
                    exercise.difficulty === 'intermedio' ? 'bg-yellow-500/80' :
                    'bg-red-500/80'
                  }`}>
                    {exercise.difficulty}
                  </span>
                )}
                {exercise.category && (
                  <span className="px-3 py-1 bg-purple-500/80 text-white text-sm font-medium rounded-full">
                    {exercise.category}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Pestañas */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contenido de pestañas */}
          <div className="p-4 sm:p-6 space-y-4">
            {/* Información General */}
            {activeTab === 'info' && (
              <div className="space-y-4">
                {exercise.description && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Descripción
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {exercise.description}
                    </p>
                  </div>
                )}

                {exercise.equipment && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Equipo
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {exercise.equipment}
                    </p>
                  </div>
                )}

                {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Músculos Primarios
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {exercise.primaryMuscles.map((muscle) => (
                        <span
                          key={muscle}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full"
                        >
                          {muscle}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Músculos Secundarios
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {exercise.secondaryMuscles.map((muscle) => (
                        <span
                          key={muscle}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                        >
                          {muscle}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {exercise.benefits && exercise.benefits.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Beneficios
                    </h3>
                    <ul className="space-y-2">
                      {exercise.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex gap-2 text-gray-700 dark:text-gray-300">
                          <span className="text-green-500 font-bold">✓</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Técnica */}
            {activeTab === 'tecnica' && (
              <div className="space-y-4">
                {exercise.instructions && exercise.instructions.length > 0 ? (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Pasos de Ejecución
                    </h3>
                    <ol className="space-y-3">
                      {exercise.instructions.map((instruction, idx) => (
                        <li key={idx} className="flex gap-3">
                          <span className="shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300 pt-0.5">
                            {instruction}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No hay instrucciones disponibles
                  </p>
                )}

                {exercise.technique && exercise.technique.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Puntos Clave
                    </h3>
                    <ul className="space-y-2">
                      {exercise.technique.map((point, idx) => (
                        <li key={idx} className="flex gap-2 text-gray-700 dark:text-gray-300">
                          <span className="text-blue-500">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Errores Comunes */}
            {activeTab === 'errores' && (
              <div className="space-y-4">
                {exercise.commonMistakes && exercise.commonMistakes.length > 0 ? (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Errores a Evitar
                    </h3>
                    <ul className="space-y-3">
                      {exercise.commonMistakes.map((mistake, idx) => (
                        <li key={idx} className="flex gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <span className="text-red-500 font-bold shrink-0">✕</span>
                          <span className="text-gray-700 dark:text-gray-300">{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No hay errores comunes documentados
                  </p>
                )}

                {exercise.safetyNotes && exercise.safetyNotes.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Notas de Seguridad
                    </h3>
                    <ul className="space-y-3">
                      {exercise.safetyNotes.map((note, idx) => (
                        <li key={idx} className="flex gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <span className="text-yellow-600 font-bold shrink-0">⚠</span>
                          <span className="text-gray-700 dark:text-gray-300">{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Consejos */}
            {activeTab === 'consejos' && (
              <div className="space-y-4">
                {exercise.tips && exercise.tips.length > 0 ? (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Consejos Pro
                    </h3>
                    <ul className="space-y-3">
                      {exercise.tips.map((tip, idx) => (
                        <li key={idx} className="flex gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <span className="text-purple-500 font-bold shrink-0">💡</span>
                          <span className="text-gray-700 dark:text-gray-300">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No hay consejos disponibles
                  </p>
                )}

                {exercise.variations && (
                  <div className="space-y-3">
                    {exercise.variations.easier && exercise.variations.easier.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">
                          Variaciones Más Fáciles
                        </h4>
                        <ul className="space-y-1">
                          {exercise.variations.easier.map((variation, idx) => (
                            <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                              <span>→</span>
                              <span>{variation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {exercise.variations.harder && exercise.variations.harder.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">
                          Variaciones Más Difíciles
                        </h4>
                        <ul className="space-y-1">
                          {exercise.variations.harder.map((variation, idx) => (
                            <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                              <span>→</span>
                              <span>{variation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {exercise.variations.alternative && exercise.variations.alternative.length > 0 && (
                      <div>
                        <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">
                          Ejercicios Alternativos
                        </h4>
                        <ul className="space-y-1">
                          {exercise.variations.alternative.map((variation, idx) => (
                            <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                              <span>→</span>
                              <span>{variation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botón para volver */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              ← Volver al Entrenamiento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
