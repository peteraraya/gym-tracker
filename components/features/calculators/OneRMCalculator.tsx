'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Dumbbell } from '@/components/icons/lucide';
import CalculatorShell from './CalculatorShell';

// Fórmulas de 1RM
const FORMULAS: Record<string, { fn: (w: number, r: number) => number; label: string }> = {
  epley:   { fn: (w, r) => w * (1 + r / 30), label: 'Epley' },
  brzycki: { fn: (w, r) => w * (36 / (37 - r)), label: 'Brzycki' },
  lander:  { fn: (w, r) => (100 * w) / (101.3 - 2.67123 * r), label: 'Lander' },
  lombardi:{ fn: (w, r) => w * Math.pow(r, 0.10), label: 'Lombardi' },
  mayhew:  { fn: (w, r) => (100 * w) / (52.2 + 41.9 * Math.exp(-0.055 * r)), label: 'Mayhew' },
  oconner: { fn: (w, r) => w * (1 + r / 40), label: "O'Conner" },
  wathan:  { fn: (w, r) => (100 * w) / (48.8 + 53.8 * Math.exp(-0.075 * r)), label: 'Wathan' },
};

const PERCENTAGES = [95, 90, 85, 80, 75, 70, 65, 60, 55, 50] as const;

function getRepRange(percentage: number): string {
  if (percentage >= 95) return '1–2 reps';
  if (percentage >= 90) return '2–4 reps';
  if (percentage >= 85) return '4–6 reps';
  if (percentage >= 80) return '6–8 reps';
  if (percentage >= 75) return '8–10 reps';
  if (percentage >= 70) return '10–12 reps';
  if (percentage >= 65) return '12–15 reps';
  return '15+ reps';
}

function getTrainingType(percentage: number): string {
  if (percentage >= 90) return 'Fuerza Máxima';
  if (percentage >= 80) return 'Fuerza';
  if (percentage >= 70) return 'Hipertrofia';
  if (percentage >= 60) return 'Resistencia';
  return 'Resistencia Muscular';
}

export default function OneRMCalculator() {
  const [weight, setWeight] = useState<number>(100);
  const [reps, setReps] = useState<number>(5);
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');

  const convertUnit = (value: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs'): number => {
    if (from === to) return value;
    return from === 'kg' ? value * 2.20462 : value / 2.20462;
  };

  const calculate1RM = useCallback((formulaFn: (w: number, r: number) => number) => {
    if (reps === 1) return weight;
    if (reps > 12) return 0;
    return formulaFn(weight, reps);
  }, [weight, reps]);

  const formulaResults = useMemo(() => {
    return Object.entries(FORMULAS).map(([key, formula]) => ({
      name: key,
      label: formula.label,
      result: calculate1RM(formula.fn),
    }));
  }, [weight, reps, calculate1RM]);

  const average1RM = useMemo(() => {
    const valid = formulaResults.filter(f => f.result > 0);
    if (valid.length === 0) return 0;
    return valid.reduce((sum, f) => sum + f.result, 0) / valid.length;
  }, [formulaResults]);

  const displayWeight = useCallback((w: number) => {
    return unit === 'kg' ? w.toFixed(1) : convertUnit(w, 'kg', 'lbs').toFixed(1);
  }, [unit, convertUnit]);

  return (
    <CalculatorShell
      title="Calculadora de 1RM"
      subtitle="Una Repetición Máxima — Estima tu fuerza máxima basada en series repetitivas"
      icon={<Dumbbell className="w-6 h-6" />}
      gradientStart="bg-blue-500"
      gradientEnd="to-blue-600"
    >
      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Peso levantado</label>
          <Input
            type="number"
            value={weight === 0 ? '' : weight}
            onChange={(e) => {
              const val = e.target.value;
              setWeight(val === '' ? 0 : parseFloat(val) || 0);
            }}
            className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white text-lg font-bold focus:ring-2 focus:ring-cyan-500"
            placeholder="0"
          />
          <span className="text-xs text-zinc-500 mt-1 block">{unit.toUpperCase()}</span>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Repeticiones</label>
          <Input
            type="number"
            value={reps}
            onChange={(e) => setReps(parseInt(e.target.value) || 1)}
            min="1"
            max="20"
            className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white text-lg font-bold focus:ring-2 focus:ring-cyan-500"
          />
          <span className="text-xs text-zinc-500 mt-1 block">reps</span>
        </div>
        <div className="flex items-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setUnit(unit === 'kg' ? 'lbs' : 'kg')}
            className="h-10 w-full"
          >
            {unit.toUpperCase()}
          </Button>
        </div>
      </div>

      {/* Carga Total Destacada */}
      <div className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700">
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-5xl font-bold text-white">{average1RM.toFixed(1)}</span>
          <span className="text-xl font-semibold text-zinc-300">{unit.toUpperCase()}</span>
        </div>
        <p className="text-xs text-zinc-500">
          1RM Promedio calculado con {formulaResults.filter(f => f.result > 0).length} fórmulas válidas
        </p>
      </div>

      {/* Pesos de Entrenamiento */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Pesos de Entrenamiento Recomendados</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {PERCENTAGES.map((pct) => (
            <div key={pct} className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700 text-center">
              <div className="text-2xl font-bold text-cyan-400">{displayWeight(average1RM * (pct / 100))}</div>
              <div className="text-xs text-zinc-500">{pct}%</div>
              <div className="text-[10px] text-zinc-500">{getRepRange(pct)}</div>
              <div className="text-[10px] font-medium text-purple-400">{getTrainingType(pct)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fórmulas Individuales */}
      <div className="border-t border-zinc-700 pt-4">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Resultados por Fórmula</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {formulaResults.map((f) => (
            <div key={f.name} className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700">
              <div className="text-xs font-medium text-zinc-400 capitalize">{f.label}</div>
              <div className="text-lg font-bold text-white">
                {f.result > 0 ? `${displayWeight(f.result)} ${unit}` : 'N/A'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notas */}
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-xs text-orange-200 space-y-1">
        <p>⚠️ Las fórmulas de 1RM son estimaciones. Usa repeticiones entre 1–10 para mayor precisión.</p>
        <p>💡 Con más de 12 repeticiones, la precisión disminuye significativamente.</p>
      </div>
    </CalculatorShell>
  );
}
