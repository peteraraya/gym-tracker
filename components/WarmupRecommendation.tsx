'use client';

import React, { useState, useMemo } from 'react';
import { MuscleGroup, MUSCLE_GROUPS } from '@/data/exercises';
import {
  WarmupCategory,
  WarmupExercise,
  getRecommendedWarmups,
  WARMUP_CATEGORY_LABELS,
} from '@/data/warmupExercises';
import { Button } from '@/components/ui/Button';
import { useTranslations } from '@/context/LocaleContext';

interface WarmupRecommendationProps {
  /** Grupos musculares de los ejercicios ya agregados en la rutina */
  routineMuscleGroups: MuscleGroup[];
  /** Callback cuando el usuario selecciona calentamientos para agregar */
  onAddWarmups: (exercises: WarmupExercise[]) => void;
}

export const WarmupRecommendation: React.FC<WarmupRecommendationProps> = ({
  routineMuscleGroups,
  onAddWarmups,
}) => {
  const t = useTranslations('warmup');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedWarmups, setSelectedWarmups] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<WarmupCategory | 'all'>('all');

  const recommendedWarmups = useMemo(() => {
    if (routineMuscleGroups.length === 0) return [];
    return getRecommendedWarmups(routineMuscleGroups);
  }, [routineMuscleGroups]);

  const filteredWarmups = useMemo(() => {
    if (activeCategory === 'all') return recommendedWarmups;
    return recommendedWarmups.filter((w) => w.category === activeCategory);
  }, [recommendedWarmups, activeCategory]);

  const toggleWarmup = (id: string) => {
    const next = new Set(selectedWarmups);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedWarmups(next);
  };

  const handleAddSelected = () => {
    const toAdd = recommendedWarmups.filter((w) => selectedWarmups.has(w.id));
    onAddWarmups(toAdd);
    setSelectedWarmups(new Set());
    setIsExpanded(false);
  };

  const handleAddAll = () => {
    // Solo agregar los de prioridad 1 (los más importantes)
    const essential = recommendedWarmups.filter((w) => w.priority === 1);
    onAddWarmups(essential);
    setIsExpanded(false);
  };

  if (routineMuscleGroups.length === 0) return null;

  const uniqueMuscles = [...new Set(routineMuscleGroups)];
  const muscleNames = uniqueMuscles
    .map((m) => MUSCLE_GROUPS.find((mg) => mg.id === m)?.name || m)
    .join(', ');

  const categoryButtons: { key: WarmupCategory | 'all'; label: string; icon: string }[] = [
    { key: 'all', label: t('allCategories'), icon: '📋' },
    { key: 'warmup', label: WARMUP_CATEGORY_LABELS.warmup.es, icon: WARMUP_CATEGORY_LABELS.warmup.icon },
    { key: 'mobility', label: WARMUP_CATEGORY_LABELS.mobility.es, icon: WARMUP_CATEGORY_LABELS.mobility.icon },
    { key: 'activation', label: WARMUP_CATEGORY_LABELS.activation.es, icon: WARMUP_CATEGORY_LABELS.activation.icon },
  ];

  return (
    <div className="border-2 border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <div>
            <h4 className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
              {t('title')}
            </h4>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {t('subtitle').replace('{muscles}', muscleNames)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full font-medium">
            {recommendedWarmups.length} {t('available')}
          </span>
          <svg
            className={`w-5 h-5 text-amber-600 dark:text-amber-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Quick add button when collapsed */}
      {!isExpanded && recommendedWarmups.length > 0 && (
        <div className="mt-3 flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleAddAll();
            }}
            className="text-xs"
          >
            ⚡ {t('addEssentials')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
            className="text-xs"
          >
            {t('viewAll')}
          </Button>
        </div>
      )}

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-4 space-y-3">
          {/* Category filters */}
          <div className="flex flex-wrap gap-1.5">
            {categoryButtons.map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  activeCategory === key
                    ? 'bg-amber-500 text-white border-amber-500 dark:bg-amber-600 dark:border-amber-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-amber-400'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Exercise list */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {filteredWarmups.map((warmup) => {
              const isSelected = selectedWarmups.has(warmup.id);
              const categoryInfo = WARMUP_CATEGORY_LABELS[warmup.category];

              return (
                <div
                  key={warmup.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-100 dark:bg-amber-900/40 border-amber-500 dark:border-amber-500'
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-500'
                  }`}
                  onClick={() => toggleWarmup(warmup.id)}
                >
                  <div className="flex items-start gap-2">
                    {/* Checkbox */}
                    <div
                      className={`mt-0.5 shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-amber-500 border-amber-500'
                          : 'border-gray-300 dark:border-gray-500'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {warmup.name}
                        </h5>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            warmup.category === 'warmup'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : warmup.category === 'mobility'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}
                        >
                          {categoryInfo.icon} {categoryInfo.es}
                        </span>
                        {warmup.priority === 1 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">
                            ✅ {t('recommended')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {warmup.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                        {warmup.duration && <span>⏱️ {warmup.duration}</span>}
                        {warmup.equipment && <span>📦 {warmup.equipment}</span>}
                        <span>
                          🎯{' '}
                          {warmup.targetMuscles
                            .map((m) => MUSCLE_GROUPS.find((mg) => mg.id === m)?.name || m)
                            .join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredWarmups.length === 0 && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                {t('noWarmups')}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-amber-200 dark:border-amber-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsExpanded(false);
                setSelectedWarmups(new Set());
              }}
              className="flex-1"
            >
              {t('close')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddAll}
              className="flex-1"
            >
              ⚡ {t('addEssentials')}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAddSelected}
              disabled={selectedWarmups.size === 0}
              className="flex-1"
            >
              ➡️ {t('addSelected').replace('{count}', String(selectedWarmups.size))}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
