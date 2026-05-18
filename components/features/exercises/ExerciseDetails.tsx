'use client';

import React, { useEffect, useState } from 'react';
import * as storageService from '@/lib/storage/storage';
import { ExerciseTemplate } from '@/data/exercises';
import type { ProgressRecommendation } from '@/lib/storage/localStorage';
import { ExerciseIcon } from '@/components/features/exercises/ExerciseIcon';

interface ExerciseDetailsProps {
  exercise: ExerciseTemplate;
  onClose: () => void;
}

export const ExerciseDetails: React.FC<ExerciseDetailsProps> = React.memo(({ exercise, onClose }: ExerciseDetailsProps) => {
  const [recommendation, setRecommendation] = useState<ProgressRecommendation | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const recs = (await storageService.getRecommendations()) as ProgressRecommendation[];
        const rec = (recs || []).find((r) => r.exerciseId === exercise.id || r.exerciseId === exercise.name);
        if (mounted && rec) setRecommendation(rec);
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [exercise.id, exercise.name]);

  const techniqueItems = React.useMemo(() => {
    return exercise.technique?.map((tip, index) => (
      <li
        key={index}
        className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
      >
        <span className="shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold mt-0.5">
          {index + 1}
        </span>
        <span className="flex-1">{tip}</span>
      </li>
    ));
  }, [exercise.technique]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {exercise.name}
              </h2>
              <div className="flex gap-2 mt-2">
                <span className="px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {exercise.equipment}
                </span>
                <span className="px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                  {exercise.muscleGroup}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Exercise Image/Icon */}
          <div className="flex justify-center">
            <div className="w-full max-w-md rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={exercise.image || '/images/not-available.svg'}
                alt={exercise.name}
                className="w-full h-auto object-contain"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.dataset.fallback) {
                    target.dataset.fallback = '1';
                    target.src = '/images/not-available.svg';
                  } else {
                    const parent = target.parentElement;
                    if (parent) parent.style.display = 'none';
                  }
                }}
              />
            </div>
          </div>

          {/* Description */}
          {exercise.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                📋 Descripción
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {exercise.description}
              </p>
            </div>
          )}

          {/* Recommended Sets & Reps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exercise.recommendedSets && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="text-green-800 dark:text-green-300 font-semibold mb-1">
                  🔢 Series
                </div>
                <div className="text-lg font-bold text-green-900 dark:text-green-200">
                  {exercise.recommendedSets}
                </div>
              </div>
            )}
            
            {exercise.recommendedReps && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="text-blue-800 dark:text-blue-300 font-semibold mb-1">
                  🔁 Repeticiones
                </div>
                <div className="text-lg font-bold text-blue-900 dark:text-blue-200">
                  {exercise.recommendedReps}
                </div>
              </div>
            )}
            
            {exercise.restTime && (
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <div className="text-orange-800 dark:text-orange-300 font-semibold mb-1">
                  ⏱️ Descanso
                </div>
                <div className="text-lg font-bold text-orange-900 dark:text-orange-200">
                  {exercise.restTime}
                </div>
              </div>
            )}
          </div>

          {/* Progression Recommendation */}
          {recommendation && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-indigo-800 dark:text-indigo-200 font-semibold mb-1">🚀 Recomendación</div>
                  <div className="text-gray-900 dark:text-gray-100 font-bold text-lg">
                    Subir a {recommendation.suggestedWeight} kg
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{recommendation.reason}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 bg-indigo-600 text-white rounded-md"
                    onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(String(recommendation.suggestedWeight));
                          // console.log('Copied suggested weight to clipboard');
                        } catch {
                          // ignore
                        }
                      }}
                  >
                    Copiar
                  </button>
                  <button
                    className="px-3 py-2 border rounded-md"
                    onClick={async () => {
                      try {
                        const recs = (await storageService.getRecommendations()) as ProgressRecommendation[];
                        const updated = (recs || []).filter((r) => r.exerciseId !== recommendation.exerciseId);
                        await storageService.saveRecommendations(updated);
                        setRecommendation(null);
                      } catch {
                        // ignore
                      }
                    }}
                  >
                    Descartar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Technique Tips */}
          {exercise.technique && exercise.technique.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                💡 Consejos de Técnica
              </h3>
              <ul className="space-y-2">
                {techniqueItems}
              </ul>
            </div>
          )}

          {/* Safety Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <span className="text-xl">⚠️</span>
              <div>
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                  Seguridad
                </h4>
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  Mantén siempre una buena forma. Si tienes dudas, consulta con un entrenador.
                  Comienza con pesos ligeros y aumenta progresivamente.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}, (prev, next) => prev.exercise.id === next.exercise.id && prev.exercise.name === next.exercise.name && prev.onClose === next.onClose);

ExerciseDetails.displayName = 'ExerciseDetails';
