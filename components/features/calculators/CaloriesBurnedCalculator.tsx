'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Flame } from '@/components/icons/lucide';
import CalculatorShell from './CalculatorShell';

const ACTIVITIES: { id: string; name: string; met: number; emoji: string; color: string }[] = [
  { id: 'weightlifting', name: 'Levantamiento de Pesas', met: 6.0, emoji: '🏋️', color: 'bg-blue-500' },
  { id: 'cardio-moderate', name: 'Cardio Moderado', met: 7.0, emoji: '🏃', color: 'bg-emerald-500' },
  { id: 'cardio-intense', name: 'Cardio Intenso', met: 10.0, emoji: '🔥', color: 'bg-orange-500' },
  { id: 'hiit', name: 'HIIT', met: 12.0, emoji: '⚡', color: 'bg-yellow-500' },
  { id: 'cycling', name: 'Ciclismo', met: 8.0, emoji: '🚴', color: 'bg-indigo-500' },
  { id: 'swimming', name: 'Natación', met: 9.0, emoji: '🏊', color: 'bg-cyan-500' },
  { id: 'yoga', name: 'Yoga', met: 3.0, emoji: '🧘', color: 'bg-purple-500' },
  { id: 'crossfit', name: 'CrossFit', met: 11.0, emoji: '💪', color: 'bg-rose-500' },
] as const;

export default function CaloriesBurnedCalculator() {
  const [weight, setWeight] = useState<number>(70);
  const [duration, setDuration] = useState<number>(60);
  const [activityId, setActivityId] = useState<string>('weightlifting');

  const activity = useMemo(() => ACTIVITIES.find((a) => a.id === activityId) || ACTIVITIES[0], [activityId]);
  const caloriesBurned = useMemo(() => activity.met * weight * (duration / 60), [activity, weight, duration]);

  return (
    <CalculatorShell
      title="Calorías Quemadas"
      subtitle="Estima el gasto calórico basado en valores MET"
      icon={<Flame className="w-6 h-6" />}
      gradientStart="bg-orange-500"
      gradientEnd="to-rose-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Peso (kg)</label>
          <Input type="number" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value) || 0)} step="0.5" min="0" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white font-bold focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Duración (min)</label>
          <Input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 0)} min="0" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white font-bold focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div className="flex items-end">
          <div className="grid grid-cols-2 gap-2">
            {ACTIVITIES.slice(0, 2).map((a) => (
              <Button key={a.id} variant={activityId === a.id ? 'primary' : 'secondary'} size="sm" onClick={() => setActivityId(a.id)} className="h-10">
                <div className="text-[10px] font-bold text-white">{a.emoji}</div>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {ACTIVITIES.slice(2).map((a) => (
          <Button key={a.id} variant={activityId === a.id ? 'primary' : 'secondary'} size="sm" onClick={() => setActivityId(a.id)} className="h-10">
            <div className="text-[10px] font-bold text-white">{a.emoji}</div>
          </Button>
        ))}
      </div>

      {/* Resultado */}
      <div className="bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700 text-center">
        <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Calorías Quemadas</div>
        <div className="text-5xl font-bold text-white">{Math.round(caloriesBurned)}</div>
        <div className="text-lg text-zinc-300 mt-1">kcal</div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-zinc-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-400">{caloriesBurned / duration > 0 ? (caloriesBurned / duration).toFixed(1) : '0.0'}</div>
          <div className="text-xs text-zinc-500 mt-1">kcal/min</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-rose-400">{caloriesBurned / weight > 0 ? (caloriesBurned / weight).toFixed(1) : '0.0'}</div>
          <div className="text-xs text-zinc-500 mt-1">kcal/kg</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-400">{activity.met.toFixed(1)}</div>
          <div className="text-xs text-zinc-500 mt-1">MET</div>
        </div>
      </div>

      {/* Equivalencias */}
      <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Equivalencias Aproximadas</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[['🍕', 285, 'pizza'], ['🍔', 540, 'hamburguesa'], ['🍎', 95, 'manzana'], ['🥤', 140, 'refresco']].map(([emoji, kcal, label]) => (
            <div key={label} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded border border-zinc-700/50">
              <span className="text-lg">{emoji}</span>
              <div className="text-right">
                <div className="text-sm font-bold text-zinc-200">{caloriesBurned / Number(kcal) > 0 ? (caloriesBurned / Number(kcal)).toFixed(1) : '0.0'}</div>
                <div className="text-[10px] text-zinc-500">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-zinc-500 mt-2 border-t border-zinc-700 pt-2">
        Estimación basada en valores MET promedio. El gasto real varía según intensidad y metabolismo.
      </div>
    </CalculatorShell>
  );
}
