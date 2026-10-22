'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Target } from '@/components/icons/lucide';
import CalculatorShell from './CalculatorShell';

const PERCENTAGES = [
  { percent: 100, reps: '1', intensity: 'Máximo' },
  { percent: 95, reps: '2', intensity: 'Muy Alto' },
  { percent: 90, reps: '3–4', intensity: 'Alto' },
  { percent: 85, reps: '5–6', intensity: 'Alto' },
  { percent: 80, reps: '7–8', intensity: 'Moderado-Alto' },
  { percent: 75, reps: '9–10', intensity: 'Moderado' },
  { percent: 70, reps: '11–12', intensity: 'Moderado' },
  { percent: 65, reps: '13–15', intensity: 'Moderado-Bajo' },
  { percent: 60, reps: '16–20', intensity: 'Bajo' },
  { percent: 50, reps: '20+', intensity: 'Muy Bajo' },
] as const;

export default function PercentageRMCalculator() {
  const [oneRM, setOneRM] = useState<number>(100);
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');

  const convertUnit = (value: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs'): number => {
    if (from === to) return value;
    return from === 'kg' ? value * 2.20462 : value / 2.20462;
  };

  const displayWeight = (w: number) => unit === 'kg' ? w.toFixed(1) : convertUnit(w, 'kg', 'lbs').toFixed(1);

  const rows = useMemo(() =>
    PERCENTAGES.map((p) => ({
      ...p,
      weight: (oneRM * p.percent) / 100,
    })),
  [oneRM]);

  return (
    <CalculatorShell
      title="Porcentaje de 1RM"
      subtitle="Calcula el peso a usar para diferentes porcentajes de tu 1RM"
      icon={<Target className="w-6 h-6" />}
      gradientStart="bg-indigo-500"
      gradientEnd="to-purple-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Tu 1RM</label>
          <Input
            type="number"
            value={oneRM}
            onChange={(e) => setOneRM(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.5"
            className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-4 text-2xl font-bold text-white focus:ring-2 focus:ring-cyan-500"
            placeholder="0"
          />
        </div>
        <div className="flex items-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setUnit(unit === 'kg' ? 'lbs' : 'kg')}
            className="h-12 w-full"
          >
            {unit.toUpperCase()}
          </Button>
        </div>
        <div className="flex items-end">
          <Button variant="ghost" size="sm" className="h-12 w-full" onClick={() => {}}>
            Limpiar
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Tabla de Porcentajes</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {rows.map((row) => (
            <div key={row.percent} className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-indigo-400">{row.percent}%</div>
                <div className="text-xs text-zinc-500">{row.reps} reps</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{displayWeight(row.weight)} {unit}</div>
                <div className="text-xs font-medium text-purple-400">{row.intensity}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-xs text-blue-200 space-y-1">
        <p>• <strong>85–100%:</strong> Fuerza máxima (1–6 reps)</p>
        <p>• <strong>70–85%:</strong> Hipertrofia (6–12 reps)</p>
        <p>• <strong>50–70%:</strong> Resistencia muscular (12+ reps)</p>
      </div>
    </CalculatorShell>
  );
}
