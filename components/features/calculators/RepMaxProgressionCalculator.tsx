'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TrendingUp } from '@/components/icons/lucide';
import CalculatorShell from './CalculatorShell';

export default function RepMaxProgressionCalculator() {
  [TrendingUp];
  const [current1RM, setCurrent1RM] = useState<number>(100);
  const [weeks, setWeeks] = useState<number>(12);
  const [progressionRate, setProgressionRate] = useState<number>(2.5);

  const projected1RM = useMemo(() => current1RM + (weeks * progressionRate), [current1RM, weeks, progressionRate]);
  const weeklyTargets = useMemo(() => {
    const targets: number[] = [];
    for (let i = 0; i <= weeks; i++) {
      targets.push(Math.round((current1RM + (i * progressionRate)) * 10) / 10);
    }
    return targets;
  }, [current1RM, weeks, progressionRate]);

  return (
    <CalculatorShell
      title="Progresión de Rep Máximo"
      subtitle="Proyecta tu 1RM futuro basado en tu tasa de progresión semanal"
      icon={<TrendingUp className="w-6 h-6" />}
      gradientStart="bg-emerald-500"
      gradientEnd="to-teal-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">1RM Actual (kg)</label>
          <Input type="number" value={current1RM} onChange={(e) => setCurrent1RM(parseFloat(e.target.value) || 0)} step="0.5" min="0" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white font-bold focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Semanas</label>
          <Input type="number" value={weeks} onChange={(e) => setWeeks(parseInt(e.target.value) || 0)} min="1" max="52" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white font-bold focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Progresión Semanal (kg)</label>
          <Input type="number" value={progressionRate} onChange={(e) => setProgressionRate(parseFloat(e.target.value) || 0)} step="0.5" min="0" max="10" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white font-bold focus:ring-2 focus:ring-cyan-500" />
        </div>
      </div>

      <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700 text-center">
        <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">1RM Proyectado</div>
        <div className="text-4xl font-bold text-white">{projected1RM.toFixed(1)} kg</div>
        <div className="text-xs text-zinc-500 mt-1">Después de {weeks} semanas</div>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Hitos Semanales</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {weeklyTargets.filter((_, i) => i % Math.max(1, Math.floor(weeks / 4)) === 0 || i === weeks).map((target, i) => {
            const week = Math.round((i / (weeklyTargets.length - 1)) * weeks);
            return (
              <div key={i} className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700 text-center">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Semana {week}</div>
                <div className="text-xl font-bold text-cyan-400">{target} kg</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-xs text-zinc-500 mt-2 border-t border-zinc-700 pt-2">
        💡 Progresión realista: 0.5-2.5 kg por semana para levantadores intermedios
      </div>
    </CalculatorShell>
  );
}
