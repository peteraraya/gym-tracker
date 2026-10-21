'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Trophy } from '@/components/icons/lucide';
import CalculatorShell from './CalculatorShell';

type Sex = 'male' | 'female';

const WILKS_COEFFICIENTS: Record<Sex, { a: number; b: number; c: number; d: number; e: number; f: number }> = {
  male: { a: -216.0475144, b: 16.2606339, c: -0.002388645, d: -0.00113732, e: 7.01863e-6, f: -1.291e-8 },
  female: { a: 594.31747775582, b: -27.23842536447, c: 0.82112226871, d: -0.00930733913, e: 4.731582e-5, f: -9.054e-8 },
};

const RATINGS: Record<Sex, { min: number; max: number; label: string; color: string }[]> = {
  male: [
    { min: 0, max: 250, label: 'Principiante', color: 'text-zinc-600 dark:text-zinc-400' },
    { min: 250, max: 325, label: 'Novato', color: 'text-blue-600 dark:text-blue-400' },
    { min: 325, max: 400, label: 'Intermedio', color: 'text-emerald-600 dark:text-emerald-400' },
    { min: 400, max: 450, label: 'Avanzado', color: 'text-amber-600 dark:text-amber-400' },
    { min: 450, max: 500, label: 'Élite', color: 'text-orange-600 dark:text-orange-400' },
    { min: 500, max: 9999, label: 'Clase Mundial', color: 'text-rose-600 dark:text-rose-400' },
  ],
  female: [
    { min: 0, max: 200, label: 'Principiante', color: 'text-zinc-600 dark:text-zinc-400' },
    { min: 200, max: 275, label: 'Novato', color: 'text-blue-600 dark:text-blue-400' },
    { min: 275, max: 350, label: 'Intermedio', color: 'text-emerald-600 dark:text-emerald-400' },
    { min: 350, max: 400, label: 'Avanzado', color: 'text-amber-600 dark:text-amber-400' },
    { min: 400, max: 450, label: 'Élite', color: 'text-orange-600 dark:text-orange-400' },
    { min: 450, max: 9999, label: 'Clase Mundial', color: 'text-rose-600 dark:text-rose-400' },
  ],
} as const;

function calculateWilks(total: number, bw: number, sex: Sex) {
  const coef = WILKS_COEFFICIENTS[sex];
  const denominator = coef.a + coef.b * bw + coef.c * Math.pow(bw, 2) +
    coef.d * Math.pow(bw, 3) + coef.e * Math.pow(bw, 4) + coef.f * Math.pow(bw, 5);
  return (total * 500) / denominator;
}

function getRating(score: number, sex: Sex) {
  const ratings = RATINGS[sex];
  return ratings.find((r) => score >= r.min && score < r.max) || ratings[ratings.length - 1];
}

export default function WilksCalculator() {
  const [bodyWeight, setBodyWeight] = useState<number>(75);
  const [sex, setSex] = useState<Sex>('male');
  const [squat, setSquat] = useState<number>(140);
  const [bench, setBench] = useState<number>(100);
  const [deadlift, setDeadlift] = useState<number>(180);

  const total = useMemo(() => squat + bench + deadlift, [squat, bench, deadlift]);
  const wilksScore = useMemo(() => calculateWilks(total, bodyWeight, sex), [total, bodyWeight, sex]);
  const rating = useMemo(() => getRating(wilksScore, sex), [wilksScore, sex]);

  return (
    <CalculatorShell
      title="Wilks Score"
      subtitle="Compara tu fuerza relativa independientemente del peso corporal"
      icon={<Trophy className="w-6 h-6" />}
      gradientStart="bg-amber-500"
      gradientEnd="to-orange-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Peso Corporal (kg)</label>
          <Input type="number" value={bodyWeight} onChange={(e) => setBodyWeight(parseFloat(e.target.value) || 0)} step="0.5" min="0" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white font-bold focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div className="flex items-end">
          <div className="grid grid-cols-2 gap-2">
            <Button variant={sex === 'male' ? 'primary' : 'secondary'} size="sm" onClick={() => setSex('male')} className="h-10">
              <div className="text-xs font-bold text-white">Hombre</div>
            </Button>
            <Button variant={sex === 'female' ? 'primary' : 'secondary'} size="sm" onClick={() => setSex('female')} className="h-10">
              <div className="text-xs font-bold text-white">Mujer</div>
            </Button>
          </div>
        </div>
        <div className="flex items-end">
          <Button variant="secondary" size="sm" onClick={() => { setSquat(140); setBench(100); setDeadlift(180); }} className="h-10 w-full">
            Valores por defecto
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Sentadilla (kg)</label>
          <Input type="number" value={squat} onChange={(e) => setSquat(parseFloat(e.target.value) || 0)} step="0.5" min="0" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white font-bold focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Press Banca (kg)</label>
          <Input type="number" value={bench} onChange={(e) => setBench(parseFloat(e.target.value) || 0)} step="0.5" min="0" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white font-bold focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Peso Muerto (kg)</label>
          <Input type="number" value={deadlift} onChange={(e) => setDeadlift(parseFloat(e.target.value) || 0)} step="0.5" min="0" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white font-bold focus:ring-2 focus:ring-cyan-500" />
        </div>
      </div>

      {/* Resultados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700 text-center">
          <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Total (kg)</div>
          <div className="text-3xl font-bold text-white">{total.toFixed(1)}</div>
        </div>
          <div className="p-6 rounded-xl border border-zinc-700 text-center">
          <div className="text-xs text-zinc-400 uppercase tracking-wider mb-2">Wilks Score</div>
          <div className={`text-5xl font-bold ${rating.color} mb-1`}>{wilksScore.toFixed(1)}</div>
          <div className={`text-xl font-semibold ${rating.color}`}>{rating.label}</div>
        </div>
      </div>

      {/* Desglose */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700 text-center">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Sentadilla</div>
          <div className="text-2xl font-bold text-purple-400">{((squat / total) * 100).toFixed(0)}%</div>
        </div>
        <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700 text-center">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Press Banca</div>
          <div className="text-2xl font-bold text-blue-400">{((bench / total) * 100).toFixed(0)}%</div>
        </div>
        <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700 text-center">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Peso Muerto</div>
          <div className="text-2xl font-bold text-rose-400">{((deadlift / total) * 100).toFixed(0)}%</div>
        </div>
      </div>

      <div className="text-xs text-zinc-500 mt-2 border-t border-zinc-700 pt-2">
        El Wilks Score permite comparar la fuerza relativa entre atletas de diferentes pesos corporales.
      </div>
    </CalculatorShell>
  );
}
