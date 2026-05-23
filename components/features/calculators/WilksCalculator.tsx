'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { NumericInput } from '@/components/ui/NumericInput';
import { Trophy } from '@/components/icons/lucide';

export default function WilksCalculator() {
  const [bodyWeight, setBodyWeight] = useState<number>(75);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [squat, setSquat] = useState<number>(140);
  const [bench, setBench] = useState<number>(100);
  const [deadlift, setDeadlift] = useState<number>(180);

  // Coeficientes Wilks
  const wilksCoefficients = {
    male: { a: -216.0475144, b: 16.2606339, c: -0.002388645, d: -0.00113732, e: 7.01863E-06, f: -1.291E-08 },
    female: { a: 594.31747775582, b: -27.23842536447, c: 0.82112226871, d: -0.00930733913, e: 4.731582E-05, f: -9.054E-08 }
  };

  const calculateWilks = (total: number, bw: number, isMale: boolean) => {
    const coef = isMale ? wilksCoefficients.male : wilksCoefficients.female;
    const denominator = coef.a + coef.b * bw + coef.c * Math.pow(bw, 2) + 
                       coef.d * Math.pow(bw, 3) + coef.e * Math.pow(bw, 4) + 
                       coef.f * Math.pow(bw, 5);
    return (total * 500) / denominator;
  };

  const total = squat + bench + deadlift;
  const wilksScore = calculateWilks(total, bodyWeight, gender === 'male');

  const getWilksRating = (score: number, isMale: boolean) => {
    if (isMale) {
      if (score < 250) return { label: 'Principiante', color: 'text-gray-600', bg: 'bg-gray-50' };
      if (score < 325) return { label: 'Novato', color: 'text-blue-600', bg: 'bg-blue-50' };
      if (score < 400) return { label: 'Intermedio', color: 'text-green-600', bg: 'bg-green-50' };
      if (score < 450) return { label: 'Avanzado', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      if (score < 500) return { label: 'Elite', color: 'text-orange-600', bg: 'bg-orange-50' };
      return { label: 'Clase Mundial', color: 'text-red-600', bg: 'bg-red-50' };
    } else {
      if (score < 200) return { label: 'Principiante', color: 'text-gray-600', bg: 'bg-gray-50' };
      if (score < 275) return { label: 'Novato', color: 'text-blue-600', bg: 'bg-blue-50' };
      if (score < 350) return { label: 'Intermedio', color: 'text-green-600', bg: 'bg-green-50' };
      if (score < 400) return { label: 'Avanzado', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      if (score < 450) return { label: 'Elite', color: 'text-orange-600', bg: 'bg-orange-50' };
      return { label: 'Clase Mundial', color: 'text-red-600', bg: 'bg-red-50' };
    }
  };

  const rating = getWilksRating(wilksScore, gender === 'male');

  return (
    <Card className="shadow-xl">
      <CardHeader className="bg-linear-to-r from-yellow-500 to-amber-600 text-white rounded-t-lg p-6">
        <CardTitle className="flex items-center gap-3">
          <Trophy className="w-6 h-6" />
          Calculadora de Wilks Score
        </CardTitle>
        <p className="text-sm text-yellow-100 mt-2">
          Compara tu fuerza relativa independientemente del peso corporal
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Datos Básicos */}
          <div className="grid grid-cols-2 gap-4">
            <NumericInput
              label="Peso Corporal (kg)"
              value={bodyWeight}
              onChange={(v) => setBodyWeight(v)}
              allowDecimal
              min={0}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sexo
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setGender('male')}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    gender === 'male'
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  👨 Hombre
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    gender === 'female'
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  👩 Mujer
                </button>
              </div>
            </div>
          </div>

          {/* Los 3 Grandes */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Los 3 Grandes (1RM)
            </h4>
            <div className="space-y-3">
              <NumericInput
                label="🦵 Sentadilla (kg)"
                value={squat}
                onChange={(v) => setSquat(v)}
                allowDecimal
                min={0}
              />
              <NumericInput
                label="💪 Press de Banca (kg)"
                value={bench}
                onChange={(v) => setBench(v)}
                allowDecimal
                min={0}
              />
              <NumericInput
                label="🏋️ Peso Muerto (kg)"
                value={deadlift}
                onChange={(v) => setDeadlift(v)}
                allowDecimal
                min={0}
              />
            </div>
          </div>

          {/* Total */}
          <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Powerlifting
              </div>
              <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                {total.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">kg</div>
            </div>
          </div>

          {/* Wilks Score */}
          <div className={`p-6 rounded-xl border-2 ${rating.bg} dark:${rating.bg.replace('50', '900/20')} border-${rating.color.split('-')[1]}-200 dark:border-${rating.color.split('-')[1]}-800`}>
            <div className="text-center mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Tu Wilks Score
              </div>
              <div className={`text-6xl font-bold ${rating.color} dark:${rating.color.replace('600', '400')}`}>
                {wilksScore.toFixed(1)}
              </div>
              <div className={`text-xl font-semibold ${rating.color} dark:${rating.color.replace('600', '400')} mt-3`}>
                {rating.label}
              </div>
            </div>
          </div>

          {/* Desglose por Levantamiento */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="text-center">
                <div className="text-2xl mb-1">🦵</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {((squat / total) * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Sentadilla
                </div>
              </div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-center">
                <div className="text-2xl mb-1">💪</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {((bench / total) * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Press Banca
                </div>
              </div>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-center">
                <div className="text-2xl mb-1">🏋️</div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {((deadlift / total) * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Peso Muerto
                </div>
              </div>
            </div>
          </div>

          {/* Información */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
              ℹ️ Sobre el Wilks Score
            </h4>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              El Wilks Score permite comparar la fuerza relativa entre atletas de diferentes pesos corporales.
              Un score más alto indica mayor fuerza relativa. Es el estándar en competiciones de powerlifting.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
