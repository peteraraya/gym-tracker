'use client';

import React from 'react';
import { WeightSuggestion } from '@/lib/weightSuggestions';
import { TrendingUp, Check, X } from 'lucide-react';

interface WeightSuggestionBannerProps {
  suggestion: WeightSuggestion;
  onAccept: () => void;
  onDismiss: () => void;
  className?: string;
}

export function WeightSuggestionBanner({
  suggestion,
  onAccept,
  onDismiss,
  className = ''
}: WeightSuggestionBannerProps) {
  const confidenceColors = {
    high: 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700',
    medium: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
    low: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
  };

  const confidenceTextColors = {
    high: 'text-green-700 dark:text-green-300',
    medium: 'text-blue-700 dark:text-blue-300',
    low: 'text-yellow-700 dark:text-yellow-300'
  };

  return (
    <div className={`p-3 rounded-lg border-2 ${confidenceColors[suggestion.confidence]} ${className}`}>
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5">
          <TrendingUp className={`w-5 h-5 ${confidenceTextColors[suggestion.confidence]}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-semibold ${confidenceTextColors[suggestion.confidence]}`}>
              Sugerencia de Peso
            </span>
            {suggestion.increase > 0 && (
              <span className="px-1.5 py-0.5 text-xs font-bold bg-green-500 text-white rounded">
                +{suggestion.increase}kg
              </span>
            )}
          </div>
          
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            {suggestion.reason}
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onAccept}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              <Check className="w-3 h-3" />
              Usar {suggestion.suggested}kg
            </button>
            
            <button
              onClick={onDismiss}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-3 h-3" />
              Ignorar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
