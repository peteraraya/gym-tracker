'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Target } from '@/components/icons/lucide';

export default function PercentageRMCalculator() {
  const [oneRM, setOneRM] = useState<number>(100);

  const percentages = [
    { percent: 100, reps: '1', intensity: 'Máximo' },
    { percent: 95, reps: '2', intensity: 'Muy Alto' },
    { percent: 90, reps: '3-4', intensity: 'Alto' },
    { percent: 85, reps: '5-6', intensity: 'Alto' },
    { percent: 80, reps: '7-8', intensity: 'Moderado-Alto' },
    { percent: 75, reps: '9-10', intensity: 'Moderado' },
    { percent: 70, reps: '11-12', intensity: 'Moderado' },
    { percent: 65, reps: '13-15', intensity: 'Moderado-Bajo' },
    { percent: 60, reps: '16-20', intensity: 'Bajo' },
    { percent: 50, reps: '20+', intensity: 'Muy Bajo' },
  ];

  return (
    <Card className="shadow-xl">
      <CardHeader className="bg-linear-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg p-6">
        <CardTitle className="flex items-center gap-3">
          <Target className="w-6 h-6" />
          Calculadora de Porcentaje de 1RM
        </CardTitle>
        <p className="text-sm text-indigo-100 mt-2">
          Calcula qué peso usar para diferentes porcentajes de tu 1RM
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <Input
            type="number"
            label="Tu 1RM (kg)"
            value={oneRM}
            onChange={(e) => setOneRM(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.5"
            className="text-lg"
          />
        </div>

        <div className="space-y-3">
          {percentages.map((item) => {
            const weight = (oneRM * item.percent) / 100;
            return (
              <div
                key={item.percent}
                className="flex items-center justify-between p-4 bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[60px]">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {item.percent}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.reps} reps
                    </div>
                  </div>
                  <div className="h-12 w-px bg-gray-300 dark:bg-gray-600" />
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {weight.toFixed(1)} kg
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Intensidad: {item.intensity}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 Guía de Uso
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• <strong>85-100%:</strong> Fuerza máxima (1-6 reps)</li>
            <li>• <strong>70-85%:</strong> Hipertrofia (6-12 reps)</li>
            <li>• <strong>50-70%:</strong> Resistencia muscular (12+ reps)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
