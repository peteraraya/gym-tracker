'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Dumbbell } from '@/components/icons/lucide';

export default function OneRMCalculator() {
  const [weight, setWeight] = useState<number>(100);
  const [reps, setReps] = useState<number>(5);
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');

  // Fórmulas de 1RM
  const formulas = {
    epley: (w: number, r: number) => w * (1 + r / 30),
    brzycki: (w: number, r: number) => w * (36 / (37 - r)),
    lander: (w: number, r: number) => (100 * w) / (101.3 - 2.67123 * r),
    lombardi: (w: number, r: number) => w * Math.pow(r, 0.10),
    mayhew: (w: number, r: number) => (100 * w) / (52.2 + 41.9 * Math.exp(-0.055 * r)),
    oconner: (w: number, r: number) => w * (1 + r / 40),
    wathan: (w: number, r: number) => (100 * w) / (48.8 + 53.8 * Math.exp(-0.075 * r))
  };

  const calculate1RM = (formula: keyof typeof formulas) => {
    if (reps === 1) return weight;
    if (reps > 12) return 0; // No recomendado para más de 12 reps
    return formulas[formula](weight, reps);
  };

  const average1RM = Object.keys(formulas).reduce((sum, key) => {
    const result = calculate1RM(key as keyof typeof formulas);
    return sum + (result || 0);
  }, 0) / Object.keys(formulas).length;

  // Calcular porcentajes de 1RM
  const percentages = [95, 90, 85, 80, 75, 70, 65, 60, 55, 50];
  
  const getRepRange = (percentage: number): string => {
    if (percentage >= 95) return '1-2 reps';
    if (percentage >= 90) return '2-4 reps';
    if (percentage >= 85) return '4-6 reps';
    if (percentage >= 80) return '6-8 reps';
    if (percentage >= 75) return '8-10 reps';
    if (percentage >= 70) return '10-12 reps';
    if (percentage >= 65) return '12-15 reps';
    return '15+ reps';
  };

  const getTrainingType = (percentage: number): string => {
    if (percentage >= 90) return 'Fuerza Máxima';
    if (percentage >= 80) return 'Fuerza';
    if (percentage >= 70) return 'Hipertrofia';
    if (percentage >= 60) return 'Resistencia';
    return 'Resistencia Muscular';
  };

  const convertUnit = (value: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs'): number => {
    if (from === to) return value;
    return from === 'kg' ? value * 2.20462 : value / 2.20462;
  };

  const displayWeight = (w: number) => {
    return unit === 'kg' ? w.toFixed(1) : convertUnit(w, 'kg', 'lbs').toFixed(1);
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg p-6">
        <CardTitle className="flex items-center gap-2 text-white">
          <Dumbbell className="w-5 h-5" />
          Calculadora de 1RM (Una Repetición Máxima)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                type="number"
                label={`Peso levantado (${unit})`}
                value={weight === 0 ? '' : weight}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setWeight(0);
                  } else {
                    const num = parseFloat(val);
                    setWeight(isNaN(num) ? 0 : Math.max(0, num));
                  }
                }}
                min="0"
                step="0.5"
                placeholder="Peso"
              />
            </div>
            <div>
              <Input
                type="number"
                label="Repeticiones realizadas"
                value={reps === 0 ? '' : reps}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setReps(1);
                  } else {
                    const num = parseInt(val);
                    setReps(isNaN(num) ? 1 : Math.max(1, Math.min(12, num)));
                  }
                }}
                min="1"
                max="12"
                placeholder="Reps"
              />
            </div>
          </div>

          {/* Selector de unidad */}
          <div className="flex gap-2">
            <Button
              variant={unit === 'kg' ? 'primary' : 'secondary'}
              onClick={() => setUnit('kg')}
              className="flex-1"
            >
              Kilogramos (kg)
            </Button>
            <Button
              variant={unit === 'lbs' ? 'primary' : 'secondary'}
              onClick={() => setUnit('lbs')}
              className="flex-1"
            >
              Libras (lbs)
            </Button>
          </div>

          {/* Resultado Principal */}
          {reps > 0 && reps <= 12 && (
            <>
              <div className="bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  Tu 1RM estimado (promedio de 7 fórmulas)
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                    {displayWeight(average1RM)}
                  </span>
                  <span className="text-2xl text-zinc-600 dark:text-zinc-400">{unit}</span>
                </div>
              </div>

              {/* Tabla de porcentajes */}
              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                  Pesos de Entrenamiento Recomendados
                </h4>
                <div className="grid gap-2">
                  {percentages.map((pct) => (
                    <div
                      key={pct}
                      className="grid grid-cols-4 gap-2 items-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-750 transition-colors"
                    >
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {pct}%
                      </div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {displayWeight(average1RM * (pct / 100))} {unit}
                      </div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        {getRepRange(pct)}
                      </div>
                      <div className="text-xs font-medium text-purple-600 dark:text-purple-400">
                        {getTrainingType(pct)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fórmulas individuales */}
              <details className="group">
                <summary className="cursor-pointer font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Ver resultados por fórmula individual
                </summary>
                <div className="mt-3 space-y-2">
                  {Object.entries(formulas).map(([name]) => {
                    const result = calculate1RM(name as keyof typeof formulas);
                    return (
                      <div
                        key={name}
                        className="flex justify-between items-center p-2 bg-zinc-50 dark:bg-zinc-800 rounded"
                      >
                        <span className="text-sm capitalize text-zinc-700 dark:text-zinc-300">
                          {name}
                        </span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {result > 0 ? `${displayWeight(result)} ${unit}` : 'N/A'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </details>

              {/* Notas */}
              <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <p>💡 <strong>Nota:</strong> Estas son estimaciones basadas en fórmulas científicas.</p>
                <p>⚠️ Para mayor precisión, usa repeticiones entre 1-10.</p>
                <p>🎯 El 1RM real puede variar según técnica, experiencia y condición física.</p>
              </div>
            </>
          )}

          {reps > 12 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Las fórmulas de 1RM son menos precisas con más de 12 repeticiones. 
                Se recomienda usar series de 1-10 reps para cálculos más exactos.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
