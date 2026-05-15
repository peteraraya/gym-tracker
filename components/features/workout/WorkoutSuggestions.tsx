'use client';

import React, { useState } from 'react';
import type { WorkoutSuggestion } from '@/lib/workout/workoutSuggestions';
import { X, ChevronDown, ChevronUp } from '@/components/icons/lucide';

interface WorkoutSuggestionsProps {
  suggestions: WorkoutSuggestion[];
  onDismiss?: (index: number) => void;
  compact?: boolean;
}

export default function WorkoutSuggestions({ 
  suggestions, 
  onDismiss,
  compact = false 
}: WorkoutSuggestionsProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (suggestions.length === 0) return null;

  const variantStyles = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100',
    danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${variantStyles[suggestion.variant]} animate-fadeIn`}
          >
            <div className="flex items-start gap-2">
              <span className="text-xl shrink-0">{suggestion.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{suggestion.title}</p>
                <p className="text-xs opacity-90 mt-0.5">{suggestion.message}</p>
              </div>
              {onDismiss && (
                <button
                  onClick={() => onDismiss(index)}
                  className="shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                  aria-label="Cerrar sugerencia"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <span>💡</span>
          <span>Sugerencias Inteligentes</span>
          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold">
            {suggestions.length}
          </span>
        </h3>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          aria-label={collapsed ? 'Expandir sugerencias' : 'Colapsar sugerencias'}
        >
          {collapsed ? (
            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {!collapsed && (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${variantStyles[suggestion.variant]} animate-fadeIn`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">{suggestion.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                    {onDismiss && (
                      <button
                        onClick={() => onDismiss(index)}
                        className="shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                        aria-label="Cerrar sugerencia"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm opacity-90">{suggestion.message}</p>
                  
                  {/* Datos adicionales si existen */}
                  {suggestion.data && (
                    <div className="mt-2 pt-2 border-t border-current/20">
                      <div className="text-xs opacity-75 space-y-1">
                        {suggestion.type === 'weight_increase' && suggestion.data.suggestedWeight && (
                          <p>
                            💪 Peso sugerido: <strong>{suggestion.data.suggestedWeight}kg</strong>
                          </p>
                        )}
                        {suggestion.type === 'rest_warning' && (
                          <p>
                            ⏱️ Rango recomendado: <strong>{suggestion.data.recommendedMin}-{suggestion.data.recommendedMax}s</strong>
                          </p>
                        )}
                        {suggestion.type === 'overtraining' && (
                          <p>
                            📅 Días consecutivos: <strong>{suggestion.data.consecutiveDays}</strong>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
