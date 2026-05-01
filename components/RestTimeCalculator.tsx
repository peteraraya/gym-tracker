'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Clock } from '@/components/icons/lucide';

export default function RestTimeCalculator() {
  const [exerciseType, setExerciseType] = useState<'compound' | 'isolation'>('compound');
  const [goal, setGoal] = useState<'strength' | 'hypertrophy' | 'endurance'>('hypertrophy');
  const [intensity, setIntensity] = useState<'high' | 'moderate' | 'low'>('moderate');

  const getRestTime = () => {
    if (goal === 'strength') {
      if (intensity === 'high') return { min: 3, max: 5, optimal: 4 };
      if (intensity === 'moderate') return { min: 2, max: 3, optimal: 2.5 };
      return { min: 1.5, max: 2, optimal: 1.5 };
    }
    
    if (goal === 'hypertrophy') {
      if (exerciseType === 'compound') {
        if (intensity === 'high') return { min: 2, max: 3, optimal: 2.5 };
        if (intensity === 'moderate') return { min: 1.5, max: 2, optimal: 1.5 };
        return { min: 1, max: 1.5, optimal: 1 };
      } else {
        if (intensity === 'high') return { min: 1.5, max: 2, optimal: 1.5 };
        if (intensity === 'moderate') return { min: 1, max: 1.5, optimal: 1 };
        return { min: 0.5, max: 1, optimal: 0.75 };
      }
    }
    
    // endurance
    if (intensity === 'high') return { min: 1, max: 1.5, optimal: 1 };
    if (intensity === 'moderate') return { min: 0.5, max: 1, optimal: 0.75 };
    return { min: 0.25, max: 0.5, optimal: 0.5 };
  };

  const restTime = getRestTime();
  const optimalMinutes = Math.floor(restTime.optimal);
  const optimalSeconds = Math.round((restTime.optimal % 1) * 60);

  return (
    <Card className="shadow-xl">
      <CardHeader className="bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-t-lg p-6">
        <CardTitle className="flex items-center gap-3">
          <Clock className="w-6 h-6" />
          Calculadora de Tiempo de Descanso
        </CardTitle>
        <p className="text-sm text-cyan-100 mt-2">
          Encuentra el tiempo de descanso óptimo según tu objetivo
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Tipo de Ejercicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tipo de Ejercicio
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExerciseType('compound')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exerciseType === 'compound'
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300'
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-gray-100">Compuesto</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Sentadilla, Press, Peso Muerto
                </div>
              </button>
              <button
                onClick={() => setExerciseType('isolation')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exerciseType === 'isolation'
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300'
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-gray-100">Aislamiento</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Curl, Extensiones, Elevaciones
                </div>
              </button>
            </div>
          </div>

          {/* Objetivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Objetivo de Entrenamiento
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'strength', label: 'Fuerza', emoji: '💪' },
                { value: 'hypertrophy', label: 'Hipertrofia', emoji: '🏋️' },
                { value: 'endurance', label: 'Resistencia', emoji: '🔥' }
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setGoal(item.value as any)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    goal === item.value
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{item.emoji}</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {item.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Intensidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Intensidad
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'high', label: 'Alta', desc: '85-100% 1RM' },
                { value: 'moderate', label: 'Moderada', desc: '70-85% 1RM' },
                { value: 'low', label: 'Baja', desc: '50-70% 1RM' }
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setIntensity(item.value as any)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    intensity === item.value
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Resultado */}
          <div className="p-6 bg-linear-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl border-2 border-cyan-200 dark:border-cyan-800">
            <div className="text-center mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Tiempo de Descanso Recomendado
              </div>
              <div className="text-5xl font-bold text-cyan-600 dark:text-cyan-400">
                {optimalMinutes > 0 && `${optimalMinutes}:`}
                {optimalSeconds.toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {optimalMinutes > 0 ? 'minutos' : 'segundos'}
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-cyan-200 dark:border-cyan-800">
              <span>Mínimo: {restTime.min} min</span>
              <span>Máximo: {restTime.max} min</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
