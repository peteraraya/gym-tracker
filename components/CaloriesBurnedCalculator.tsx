'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Flame } from '@/components/icons/lucide';

export default function CaloriesBurnedCalculator() {
  const [weight, setWeight] = useState<number>(70);
  const [duration, setDuration] = useState<number>(60);
  const [activityType, setActivityType] = useState<string>('weightlifting');

  const activities = [
    { id: 'weightlifting', name: 'Levantamiento de Pesas', met: 6.0, emoji: '🏋️' },
    { id: 'cardio-moderate', name: 'Cardio Moderado', met: 7.0, emoji: '🏃' },
    { id: 'cardio-intense', name: 'Cardio Intenso', met: 10.0, emoji: '🔥' },
    { id: 'hiit', name: 'HIIT', met: 12.0, emoji: '⚡' },
    { id: 'cycling', name: 'Ciclismo', met: 8.0, emoji: '🚴' },
    { id: 'swimming', name: 'Natación', met: 9.0, emoji: '🏊' },
    { id: 'yoga', name: 'Yoga', met: 3.0, emoji: '🧘' },
    { id: 'pilates', name: 'Pilates', met: 4.0, emoji: '🤸' },
    { id: 'crossfit', name: 'CrossFit', met: 11.0, emoji: '💪' },
    { id: 'boxing', name: 'Boxeo', met: 9.0, emoji: '🥊' },
  ];

  const selectedActivity = activities.find(a => a.id === activityType) || activities[0];
  
  // Fórmula: Calorías = MET × peso(kg) × tiempo(horas)
  const caloriesBurned = selectedActivity.met * weight * (duration / 60);

  return (
    <Card className="shadow-xl">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg p-6">
        <CardTitle className="flex items-center gap-3">
          <Flame className="w-6 h-6" />
          Calculadora de Calorías Quemadas
        </CardTitle>
        <p className="text-sm text-orange-100 mt-2">
          Estima las calorías quemadas durante tu entrenamiento
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Peso Corporal (kg)"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.1"
            />
            <Input
              type="number"
              label="Duración (minutos)"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>

          {/* Tipo de Actividad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tipo de Actividad
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {activities.map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => setActivityType(activity.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    activityType === activity.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{activity.emoji}</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {activity.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    MET: {activity.met}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Resultado */}
          <div className="p-8 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800">
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Calorías Quemadas Estimadas
              </div>
              <div className="flex items-center justify-center gap-3">
                <Flame className="w-12 h-12 text-orange-500" />
                <div className="text-6xl font-bold text-orange-600 dark:text-orange-400">
                  {Math.round(caloriesBurned)}
                </div>
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                kcal
              </div>
            </div>

            {/* Desglose */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-orange-200 dark:border-orange-800">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {(caloriesBurned / duration).toFixed(1)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  kcal/min
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {(caloriesBurned / weight).toFixed(1)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  kcal/kg
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {selectedActivity.met.toFixed(1)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  MET
                </div>
              </div>
            </div>
          </div>

          {/* Equivalencias */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
              📊 Equivalencias Aproximadas
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span>🍕</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {(caloriesBurned / 285).toFixed(1)} rebanadas de pizza
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>🍔</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {(caloriesBurned / 540).toFixed(1)} hamburguesas
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>🍎</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {(caloriesBurned / 95).toFixed(1)} manzanas
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>🥤</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {(caloriesBurned / 140).toFixed(1)} refrescos
                </span>
              </div>
            </div>
          </div>

          {/* Nota */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Nota:</strong> Esta es una estimación basada en valores MET promedio. 
              El gasto calórico real varía según la intensidad, técnica y metabolismo individual.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
