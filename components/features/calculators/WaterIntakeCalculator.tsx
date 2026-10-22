'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Flame } from '@/components/icons/lucide';
import CalculatorShell from './CalculatorShell';

type ActivityLevel = 'sedentary' | 'moderate' | 'active' | 'very_active';

const ACTIVITY_ADJUSTMENT: Record<ActivityLevel, { label: string; factor: number }> = {
  sedentary: { label: 'Poco activo', factor: 30 },
  moderate: { label: 'Moderado', factor: 35 },
  active: { label: 'Activo', factor: 40 },
  very_active: { label: 'Muy activo', factor: 45 },
};

export default function WaterIntakeCalculator() {
  const [weight, setWeight] = useState<number>(70);
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [climate, setClimate] = useState<'normal' | 'hot' | 'cold'>('normal');
  [weight, activity, climate];

  const baseML = useMemo(() => weight * ACTIVITY_ADJUSTMENT[activity].factor, [weight, activity]);
  const climateFactor = useMemo(() => climate === 'hot' ? 1.2 : climate === 'cold' ? 0.9 : 1.0, [climate]);
  const totalML = useMemo(() => Math.round(baseML * climateFactor), [baseML, climateFactor]);
  const totalLiters = useMemo(() => (totalML / 1000).toFixed(1), [totalML]);
  const glasses = useMemo(() => Math.round(totalML / 250), [totalML]);

  return (
    <CalculatorShell
      title="Ingesta de Agua Diaria"
      subtitle="Cuánta agua necesitas beber según tu peso y actividad"
      icon={<Flame className="w-6 h-6" />}
      gradientStart="bg-cyan-500"
      gradientEnd="to-blue-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Peso (kg)</label>
          <Input type="number" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value) || 0)} step="0.5" min="0" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white font-bold focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div className="flex items-end">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(ACTIVITY_ADJUSTMENT).map(([key, val]) => (
              <Button key={key} variant={activity === key ? 'primary' : 'secondary'} size="sm" onClick={() => setActivity(key as ActivityLevel)} className="h-10 text-left text-xs py-3">
                <div className="text-xs font-bold text-white">{val.label}</div>
                <div className="text-[10px] text-zinc-500">{val.factor} ml/kg</div>
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-end">
          <div className="grid grid-cols-3 gap-2">
            {(['normal', 'hot', 'cold'] as const).map((c) => (
              <Button key={c} variant={climate === c ? 'primary' : 'secondary'} size="sm" onClick={() => setClimate(c)} className="h-10 text-left text-xs py-3">
                <div className="text-xs font-bold text-white">{c === 'hot' ? 'Caluroso' : c === 'cold' ? 'Frío' : 'Normal'}</div>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700 text-center">
        <div className="text-xs text-zinc-400 uppercase tracking-wider mb-2">Ingesta Diaria Recomendada</div>
        <div className="text-5xl font-bold text-cyan-400">{totalLiters}</div>
        <div className="text-xl text-zinc-300 mt-1">litros por día</div>
        <div className="text-xs text-zinc-500 mt-2">≈ {glasses} vasos de 250 ml</div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700 text-center">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Desayuno</div>
          <div className="text-xl font-bold text-white">{Math.round(totalML * 0.25 / 250)} vasos</div>
        </div>
        <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700 text-center">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Entrenamiento</div>
          <div className="text-xl font-bold text-white">{Math.round(totalML * 0.35 / 250)} vasos</div>
        </div>
        <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700 text-center">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Resto del día</div>
          <div className="text-xl font-bold text-white">{Math.round(totalML * 0.40 / 250)} vasos</div>
        </div>
      </div>

      <div className="text-xs text-zinc-500 mt-2 border-t border-zinc-700 pt-2">
        💡 Bebe antes de tener sed • Aumenta la ingesta en días de entrenamiento intenso
      </div>
    </CalculatorShell>
  );
}
