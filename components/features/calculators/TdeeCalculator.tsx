'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Scale } from '@/components/icons/lucide';
import CalculatorShell from './CalculatorShell';

const ACTIVITY_FACTORS: Record<string, { label: string; factor: number }> = {
  sedentary: { label: 'Sedentario', factor: 1.2 },
  light: { label: 'Ligero (1-3 días)', factor: 1.375 },
  moderate: { label: 'Moderado (3-5 días)', factor: 1.55 },
  active: { label: 'Activo (6-7 días)', factor: 1.725 },
  very_active: { label: 'Muy Activo', factor: 1.9 },
};

const GOALS: Record<string, { label: string; adjustment: number }> = {
  cut: { label: 'Déficit (Perder peso)', adjustment: -500 },
  mild_cut: { label: 'Déficit Ligero', adjustment: -250 },
  maintenance: { label: 'Mantenimiento', adjustment: 0 },
  mild_bulk: { label: 'Superávit Ligero', adjustment: 250 },
  bulk: { label: 'Superávit (Ganar masa)', adjustment: 500 },
};

type Sex = 'male' | 'female';

function bmrMifflin(weightKg: number, heightCm: number, age: number, sex: Sex) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

export default function TdeeCalculator() {
  const [sex, setSex] = useState<Sex>('male');
  const [age, setAge] = useState<number>(30);
  const [weight, setWeight] = useState<number>(75);
  const [height, setHeight] = useState<number>(175);
  const [activity, setActivity] = useState<string>('moderate');
  const [goal, setGoal] = useState<string>('maintenance');
  const [proteinPerKg, setProteinPerKg] = useState<number>(1.8);
  const [fatPercent, setFatPercent] = useState<number>(25);

  const bmr = useMemo(() => bmrMifflin(weight, height, age, sex), [weight, height, age, sex]);
  const tdee = useMemo(() => bmr * ACTIVITY_FACTORS[activity].factor, [bmr, activity]);
  const targetCalories = useMemo(() => tdee + GOALS[goal].adjustment, [tdee, goal]);

  const proteinGrams = useMemo(() => weight * proteinPerKg, [weight, proteinPerKg]);
  const proteinCalories = useMemo(() => proteinGrams * 4, [proteinGrams]);
  const fatGrams = useMemo(() => (targetCalories * (fatPercent / 100)) / 9, [targetCalories, fatPercent]);
  const fatCalories = useMemo(() => fatGrams * 9, [fatGrams]);
  const carbsGrams = useMemo(() => Math.max(0, (targetCalories - proteinCalories - fatCalories) / 4), [targetCalories, proteinCalories, fatCalories]);
  const carbsCalories = useMemo(() => carbsGrams * 4, [carbsGrams]);

  return (
    <CalculatorShell
      title="TDEE y Macronutrientes"
      subtitle="Gasto Energético Diario Total y distribución de macros"
      icon={<Scale className="w-6 h-6" />}
      gradientStart="bg-emerald-500"
      gradientEnd="to-teal-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Sexo</label>
          <div className="grid grid-cols-2 gap-2">
            <Button variant={sex === 'male' ? 'primary' : 'secondary'} size="sm" onClick={() => setSex('male')} className="h-10 text-left py-3">
              <div className="text-xs font-bold text-white">Hombre</div>
            </Button>
            <Button variant={sex === 'female' ? 'primary' : 'secondary'} size="sm" onClick={() => setSex('female')} className="h-10 text-left py-3">
              <div className="text-xs font-bold text-white">Mujer</div>
            </Button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Edad</label>
          <Input type="number" value={age} onChange={(e) => setAge(parseInt(e.target.value) || 0)} min="1" max="120" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white font-bold focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Peso (kg)</label>
          <Input type="number" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value) || 0)} step="0.5" min="0" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white font-bold focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Altura (cm)</label>
          <Input type="number" value={height} onChange={(e) => setHeight(parseInt(e.target.value) || 0)} min="50" max="250" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white font-bold focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Actividad</label>
          <div className="space-y-1">
            {Object.entries(ACTIVITY_FACTORS).map(([key, val]) => (
              <Button key={key} variant={activity === key ? 'primary' : 'secondary'} size="sm" onClick={() => setActivity(key)} className="h-9 text-left text-xs py-2">
                <div className="text-xs font-bold text-white">{val.label}</div>
              </Button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Objetivo</label>
          <div className="space-y-1">
            {Object.entries(GOALS).map(([key, val]) => (
              <Button key={key} variant={goal === key ? 'primary' : 'secondary'} size="sm" onClick={() => setGoal(key)} className="h-9 text-left text-xs py-2">
                <div className="text-xs font-bold text-white">{val.label}</div>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700 text-center">
          <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">BMR</div>
          <div className="text-3xl font-bold text-white">{Math.round(bmr)}</div>
          <div className="text-xs text-zinc-500 mt-1">kcal en reposo</div>
        </div>
        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700 text-center">
          <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">TDEE</div>
          <div className="text-3xl font-bold text-cyan-400">{Math.round(tdee)}</div>
          <div className="text-xs text-zinc-500 mt-1">kcal diarias</div>
        </div>
        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700 text-center">
          <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Objetivo</div>
          <div className="text-3xl font-bold text-purple-400">{Math.round(targetCalories)}</div>
          <div className="text-xs text-zinc-500 mt-1">kcal objetivo</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700">
          <div className="text-xs text-zinc-400 uppercase tracking-wider mb-2">Proteínas</div>
          <div className="text-2xl font-bold text-white">{proteinGrams.toFixed(0)} g</div>
          <div className="text-sm text-zinc-500">{proteinCalories.toFixed(0)} kcal • {proteinPerKg} g/kg</div>
        </div>
        <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700">
          <div className="text-xs text-zinc-400 uppercase tracking-wider mb-2">Grasas</div>
          <div className="text-2xl font-bold text-white">{fatGrams.toFixed(0)} g</div>
          <div className="text-sm text-zinc-500">{fatCalories.toFixed(0)} kcal • {fatPercent}%</div>
        </div>
        <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700">
          <div className="text-xs text-zinc-400 uppercase tracking-wider mb-2">Carbohidratos</div>
          <div className="text-2xl font-bold text-white">{carbsGrams.toFixed(0)} g</div>
          <div className="text-sm text-zinc-500">{carbsCalories.toFixed(0)} kcal</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Proteínas (g/kg)</label>
          <Input type="number" value={proteinPerKg} onChange={(e) => setProteinPerKg(parseFloat(e.target.value) || 0)} step="0.1" min="0.5" max="3" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Grasas (% calorías)</label>
          <Input type="number" value={fatPercent} onChange={(e) => setFatPercent(parseInt(e.target.value) || 0)} min="15" max="45" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div className="flex items-end">
          <Button variant="ghost" size="sm" onClick={() => { setProteinPerKg(1.8); setFatPercent(25); }} className="h-12 w-full">
            Reset
          </Button>
        </div>
      </div>

      <div className="text-xs text-zinc-500 mt-2 border-t border-zinc-700 pt-2">
        Nota: Las fórmulas son estimaciones. Ajusta según tu progreso real y sensación.
      </div>
    </CalculatorShell>
  );
}
