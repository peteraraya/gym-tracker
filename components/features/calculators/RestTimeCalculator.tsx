'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Clock } from '@/components/icons/lucide';
import CalculatorShell from './CalculatorShell';

type ExerciseType = 'compound' | 'isolation';
type Goal = 'strength' | 'hypertrophy' | 'endurance';
type Intensity = 'high' | 'moderate' | 'low';

function getRestTime(exerciseType: ExerciseType, goal: Goal, intensity: Intensity) {
  if (goal === 'strength') {
    if (intensity === 'high') return { min: 3, max: 5, optimal: 4 };
    if (intensity === 'moderate') return { min: 2, max: 3, optimal: 2.5 };
    return { min: 1.5, max: 2, optimal: 1.5 };
  }
  if (goal === 'hypertrophy') {
    if (exerciseType === 'compound') {
      if (intensity === 'high') return { min: 2, max: 3, optimal: 2.5 };
      if (intensity === 'moderate') return { min: 1.5, max: 2, optimal: 1.5 };
      return { min: 1, max: 1.5, optimal: 1 };
    } else {
      if (intensity === 'high') return { min: 1.5, max: 2, optimal: 1.5 };
      if (intensity === 'moderate') return { min: 1, max: 1.5, optimal: 1 };
      return { min: 0.5, max: 1, optimal: 0.75 };
    }
  }
  // endurance
  if (intensity === 'high') return { min: 1, max: 1.5, optimal: 1 };
  if (intensity === 'moderate') return { min: 0.5, max: 1, optimal: 0.75 };
  return { min: 0.25, max: 0.5, optimal: 0.5 };
}

const GOAL_OPTIONS: { value: Goal; label: string; emoji: string }[] = [
  { value: 'strength', label: 'Fuerza', emoji: '💪' },
  { value: 'hypertrophy', label: 'Hipertrofia', emoji: '🏋️' },
  { value: 'endurance', label: 'Resistencia', emoji: '🔥' },
];

const INTENSITY_OPTIONS: { value: Intensity; label: string; desc: string }[] = [
  { value: 'high', label: 'Alta', desc: '85–100% 1RM' },
  { value: 'moderate', label: 'Moderada', desc: '70–85% 1RM' },
  { value: 'low', label: 'Baja', desc: '50–70% 1RM' },
];

export default function RestTimeCalculator() {
  const [exerciseType, setExerciseType] = useState<ExerciseType>('compound');
  const [goal, setGoal] = useState<Goal>('hypertrophy');
  const [intensity, setIntensity] = useState<Intensity>('moderate');

  const restTime = useMemo(() => getRestTime(exerciseType, goal, intensity), [exerciseType, goal, intensity]);
  const optimalMinutes = Math.floor(restTime.optimal);
  const optimalSeconds = Math.round((restTime.optimal % 1) * 60);

  return (
    <CalculatorShell
      title="Tiempo de Descanso"
      subtitle="Encuentra el descanso óptimo entre series según tu objetivo"
      icon={<Clock className="w-6 h-6" />}
      gradientStart="bg-cyan-500"
      gradientEnd="to-blue-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tipo de Ejercicio */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Tipo de Ejercicio</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={exerciseType === 'compound' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setExerciseType('compound')}
              className="h-10 text-left py-3"
            >
              <div className="text-xs font-bold text-white">Compuesto</div>
              <div className="text-[10px] text-zinc-400">Sentadilla, Press</div>
            </Button>
            <Button
              variant={exerciseType === 'isolation' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setExerciseType('isolation')}
              className="h-10 text-left py-3"
            >
              <div className="text-xs font-bold text-white">Aislamiento</div>
              <div className="text-[10px] text-zinc-400">Curl, Extensión</div>
            </Button>
          </div>
        </div>

        {/* Objetivo */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Objetivo</label>
          <div className="grid grid-cols-3 gap-2">
            {GOAL_OPTIONS.map((item) => (
              <Button
                key={item.value}
                variant={goal === item.value ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setGoal(item.value)}
                className="h-10 flex flex-col items-center justify-center gap-1"
              >
                <div className="text-xl">{item.emoji}</div>
                <div className="text-xs font-bold text-white">{item.label}</div>
              </Button>
            ))}
          </div>
        </div>

        {/* Intensidad */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Intensidad</label>
          <div className="grid grid-cols-3 gap-2">
            {INTENSITY_OPTIONS.map((item) => (
              <Button
                key={item.value}
                variant={intensity === item.value ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setIntensity(item.value)}
                className="h-10 flex flex-col items-center justify-center gap-1"
              >
                <div className="text-xs font-bold text-white">{item.label}</div>
                <div className="text-[10px] text-zinc-400">{item.desc}</div>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Resultado */}
      <div className="bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700 text-center">
        <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Tiempo de Descanso Recomendado</div>
        <div className="text-5xl font-bold text-cyan-400 mb-1">
          {optimalMinutes > 0 && `${optimalMinutes}:`}
          {optimalSeconds.toString().padStart(2, '0')}
        </div>
        <div className="text-xs text-zinc-500">
          {optimalMinutes > 0 ? 'minutos' : 'segundos'}
        </div>
        <div className="mt-4 flex justify-between text-sm text-zinc-500 pt-2 border-t border-zinc-700/50">
          <span>Mínimo: {restTime.min} min</span>
          <span>Óptimo: {restTime.optimal} min</span>
          <span>Máximo: {restTime.max} min</span>
        </div>
      </div>
    </CalculatorShell>
  );
}
