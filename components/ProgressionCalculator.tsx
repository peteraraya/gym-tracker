'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { TrendingUp } from '@/components/icons/lucide';

export default function ProgressionCalculator() {
  const [currentWeight, setCurrentWeight] = useState<number>(60);
  const [weeks, setWeeks] = useState<number>(12);
  const [exerciseType, setExerciseType] = useState<'upper' | 'lower'>('upper');
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  const getWeeklyIncrease = () => {
    if (experience === 'beginner') {
      return exerciseType === 'upper' ? 2.5 : 5;
    } else if (experience === 'intermediate') {
      return exerciseType === 'upper' ? 1.25 : 2.5;
    } else {
      return exerciseType === 'upper' ? 0.5 : 1.25;
    }
  };

  const weeklyIncrease = getWeeklyIncrease();
  const projectedWeight = currentWeight + (weeklyIncrease * weeks);
  const totalIncrease = projectedWeight - currentWeight;
  const percentageIncrease = (totalIncrease / currentWeight) * 100;

  const weeklyProgression = Array.from({ length: Math.min(weeks, 12) }, (_, i) => ({
    week: i + 1,
    weight: currentWeight + (weeklyIncrease * (i + 1))
  }));

  return (
    <Card className="shadow-xl">
      <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg p-6">
        <CardTitle className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6" />
          Calculadora de Progresión Lineal
        </CardTitle>
        <p className="text-sm text-emerald-100 mt-2">
          Planifica tu progresión de peso semana a semana
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Peso Actual (kg)"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.5"
            />
            <Input
              type="number"
              label="Semanas a Proyectar"
              value={weeks}
              onChange={(e) => setWeeks(parseInt(e.target.value) || 0)}
              min="1"
              max="52"
            />
          </div>

          {/* Tipo de Ejercicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tipo de Ejercicio
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExerciseType('upper')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exerciseType === 'upper'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                }`}
              >
                <div className="text-2xl mb-1">💪</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">Tren Superior</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Press, Dominadas, Remo
                </div>
              </button>
              <button
                onClick={() => setExerciseType('lower')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exerciseType === 'lower'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                }`}
              >
                <div className="text-2xl mb-1">🦵</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">Tren Inferior</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Sentadilla, Peso Muerto
                </div>
              </button>
            </div>
          </div>

          {/* Nivel de Experiencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Nivel de Experiencia
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'beginner', label: 'Principiante', desc: '< 6 meses', emoji: '🌱' },
                { value: 'intermediate', label: 'Intermedio', desc: '6-24 meses', emoji: '🌿' },
                { value: 'advanced', label: 'Avanzado', desc: '> 24 meses', emoji: '🌳' }
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setExperience(item.value as any)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    experience === item.value
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{item.emoji}</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
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
          <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border-2 border-emerald-200 dark:border-emerald-800">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Peso Proyectado
                </div>
                <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                  {projectedWeight.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">kg</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Aumento Total
                </div>
                <div className="text-4xl font-bold text-teal-600 dark:text-teal-400">
                  +{totalIncrease.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">kg</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Incremento
                </div>
                <div className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">
                  {percentageIncrease.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">mejora</div>
              </div>
            </div>
            <div className="text-center pt-4 border-t border-emerald-200 dark:border-emerald-800">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Incremento Semanal Recomendado
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                +{weeklyIncrease} kg/semana
              </div>
            </div>
          </div>

          {/* Progresión Semanal */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              📈 Progresión Semanal (primeras {Math.min(weeks, 12)} semanas)
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {weeklyProgression.map((item) => (
                <div
                  key={item.week}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Semana {item.week}
                  </span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {item.weight.toFixed(1)} kg
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Consejos */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 Consejos de Progresión
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Solo aumenta peso si completaste todas las series y reps</li>
              <li>• Si fallas 2 sesiones seguidas, reduce el peso 10%</li>
              <li>• Prioriza la técnica sobre el peso</li>
              <li>• Descansa adecuadamente entre sesiones</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
