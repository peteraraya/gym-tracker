'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import type { ProgressionStrategy } from '@/lib/progression-advanced';

interface ProgressionSettingsProps {
  currentStrategy?: ProgressionStrategy;
  onStrategyChange?: (strategy: ProgressionStrategy) => void;
  considerFatigue?: boolean;
  onFatigueChange?: (consider: boolean) => void;
  considerVolume?: boolean;
  onVolumeChange?: (consider: boolean) => void;
}

export default function ProgressionSettings({
  currentStrategy = 'auto',
  onStrategyChange,
  considerFatigue = true,
  onFatigueChange,
  considerVolume = true,
  onVolumeChange
}: ProgressionSettingsProps) {
  const [showInfo, setShowInfo] = useState<string | null>(null);

  const strategies: Array<{
    value: ProgressionStrategy;
    label: string;
    description: string;
    bestFor: string;
  }> = [
    {
      value: 'auto',
      label: 'Automático',
      description: 'El sistema elige la mejor estrategia según tu fatiga y consistencia',
      bestFor: 'Principiantes y usuarios que prefieren no preocuparse por la periodización'
    },
    {
      value: 'linear',
      label: 'Progresión Lineal',
      description: 'Aumenta el peso constantemente cuando cumples el objetivo de repeticiones',
      bestFor: 'Principiantes e intermedios con buena recuperación'
    },
    {
      value: 'undulating',
      label: 'Progresión Ondulada',
      description: 'Alterna entre semanas pesadas, medias y ligeras para optimizar recuperación',
      bestFor: 'Intermedios y avanzados, o cuando hay fatiga acumulada'
    }
  ];

  return (
    <div className="space-y-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          Configuración de Progresión
          <button
            onClick={() => setShowInfo(showInfo ? null : 'main')}
            className="text-blue-500 hover:text-blue-600"
          >
            <Info size={18} />
          </button>
        </h3>
        
        {showInfo === 'main' && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
            <p className="text-gray-700 dark:text-gray-300">
              La progresión inteligente analiza tu historial de entrenamientos, fatiga acumulada,
              volumen total y consistencia para sugerirte cuándo aumentar el peso de forma segura y efectiva.
            </p>
          </div>
        )}
      </div>

      {/* Estrategia de Progresión */}
      <div>
        <label className="block text-sm font-medium mb-3">
          Estrategia de Progresión
        </label>
        <div className="space-y-3">
          {strategies.map(strategy => (
            <div key={strategy.value}>
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="strategy"
                  value={strategy.value}
                  checked={currentStrategy === strategy.value}
                  onChange={(e) => onStrategyChange?.(e.target.value as ProgressionStrategy)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium">{strategy.label}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {strategy.description}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    💡 {strategy.bestFor}
                  </div>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Factores Adicionales */}
      <div>
        <label className="block text-sm font-medium mb-3">
          Factores a Considerar
        </label>
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <input
              type="checkbox"
              checked={considerFatigue}
              onChange={(e) => onFatigueChange?.(e.target.checked)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-medium">Análisis de Fatiga</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Evalúa tu frecuencia de entrenamiento y volumen acumulado para detectar sobreentrenamiento
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <input
              type="checkbox"
              checked={considerVolume}
              onChange={(e) => onVolumeChange?.(e.target.checked)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-medium">Tendencia de Volumen</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Analiza si tu volumen total (peso × reps × series) está aumentando, estable o disminuyendo
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Explicación de la Regla 2-for-2 */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          📊 Regla 2-for-2
          <button
            onClick={() => setShowInfo(showInfo === '2for2' ? null : '2for2')}
            className="text-blue-500 hover:text-blue-600"
          >
            <Info size={16} />
          </button>
        </h4>
        {showInfo === '2for2' && (
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>
              La regla 2-for-2 es un método probado para progresión segura:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Si completas el objetivo de repeticiones en la última serie</li>
              <li>Durante 2 entrenamientos consecutivos</li>
              <li>Entonces es momento de aumentar el peso</li>
            </ul>
            <p className="mt-2">
              Nuestro sistema mejorado también considera fatiga, volumen y consistencia
              para hacer recomendaciones más precisas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
