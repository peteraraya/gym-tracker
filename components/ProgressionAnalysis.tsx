'use client';

import { TrendingUp, TrendingDown, Minus, Activity, Target, Zap } from 'lucide-react';
import type { ProgressionRecommendation } from '@/lib/progression-advanced';

interface ProgressionAnalysisProps {
  recommendation: ProgressionRecommendation;
  exerciseName?: string;
}

export default function ProgressionAnalysis({
  recommendation,
  exerciseName
}: ProgressionAnalysisProps) {
  const { factors, confidence, recommend, suggestedWeight, reason, strategy } = recommendation;

  if (!factors) return null;

  const getConfidenceColor = (conf: string) => {
    switch (conf) {
      case 'high': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getConfidenceLabel = (conf: string) => {
    switch (conf) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Desconocida';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="text-green-500" size={20} />;
      case 'decreasing': return <TrendingDown className="text-red-500" size={20} />;
      case 'stable': return <Minus className="text-yellow-500" size={20} />;
      default: return null;
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'Aumentando';
      case 'decreasing': return 'Disminuyendo';
      case 'stable': return 'Estable';
      default: return 'Desconocido';
    }
  };

  const getFatigueColor = (score: number) => {
    if (score < 4) return 'text-green-600 dark:text-green-400';
    if (score < 7) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getFatigueLabel = (score: number) => {
    if (score < 4) return 'Baja';
    if (score < 7) return 'Moderada';
    return 'Alta';
  };

  const getConsistencyColor = (score: number) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      {exerciseName && (
        <h3 className="text-lg font-semibold">{exerciseName}</h3>
      )}

      {/* Recomendación Principal */}
      <div className={`p-4 rounded-lg ${
        recommend 
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
      }`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="font-semibold text-lg mb-1">
              {recommend ? '✅ Aumentar Peso' : '⏸️ Mantener Peso'}
            </div>
            <div className="text-sm mb-2">{reason}</div>
            {suggestedWeight && (
              <div className="text-2xl font-bold">
                {suggestedWeight.toFixed(1)} kg
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Confianza
            </div>
            <div className={`font-semibold ${getConfidenceColor(confidence)}`}>
              {getConfidenceLabel(confidence)}
            </div>
          </div>
        </div>
      </div>

      {/* Estrategia */}
      {strategy && (
        <div className="flex items-center gap-2 text-sm">
          <Target size={16} className="text-blue-500" />
          <span className="text-gray-600 dark:text-gray-400">Estrategia:</span>
          <span className="font-medium">
            {strategy === 'linear' ? 'Progresión Lineal' : 
             strategy === 'undulating' ? 'Progresión Ondulada' : 
             'Automática'}
          </span>
        </div>
      )}

      {/* Análisis de Factores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Regla 2-for-2 */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target size={18} className="text-blue-500" />
            <span className="font-medium text-sm">Regla 2-for-2</span>
          </div>
          <div className={`text-lg font-semibold ${
            factors.twoForTwo 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {factors.twoForTwo ? '✓ Cumplida' : '✗ No cumplida'}
          </div>
        </div>

        {/* Tendencia de Volumen */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={18} className="text-purple-500" />
            <span className="font-medium text-sm">Volumen Total</span>
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon(factors.volumeTrend)}
            <span className="text-lg font-semibold">
              {getTrendLabel(factors.volumeTrend)}
            </span>
          </div>
        </div>

        {/* Fatiga */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={18} className="text-orange-500" />
            <span className="font-medium text-sm">Nivel de Fatiga</span>
          </div>
          <div className="space-y-1">
            <div className={`text-lg font-semibold ${getFatigueColor(factors.fatigueScore)}`}>
              {factors.fatigueScore.toFixed(1)}/10 - {getFatigueLabel(factors.fatigueScore)}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  factors.fatigueScore < 4 ? 'bg-green-500' :
                  factors.fatigueScore < 7 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${(factors.fatigueScore / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Consistencia */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={18} className="text-blue-500" />
            <span className="font-medium text-sm">Consistencia</span>
          </div>
          <div className="space-y-1">
            <div className={`text-lg font-semibold ${getConsistencyColor(factors.consistencyScore)}`}>
              {factors.consistencyScore.toFixed(0)}%
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  factors.consistencyScore >= 70 ? 'bg-green-500' :
                  factors.consistencyScore >= 50 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${factors.consistencyScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Pesos */}
      {recommendation.lastWeights && recommendation.lastWeights.length > 0 && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Últimos pesos usados:
          </div>
          <div className="flex gap-2 flex-wrap">
            {recommendation.lastWeights.map((weight, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium"
              >
                {weight.toFixed(1)} kg
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
