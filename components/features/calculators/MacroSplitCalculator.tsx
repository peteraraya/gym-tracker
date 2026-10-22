'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Flame } from '@/components/icons/lucide';
import CalculatorShell from './CalculatorShell';

type Macro = 'protein' | 'carbs' | 'fat';

const MACROS: Record<Macro, { label: string; color: string; caloriesPerGram: number }> = {
  protein: { label: 'Proteínas', color: 'text-emerald-500', caloriesPerGram: 4 },
  carbs: { label: 'Carbohidratos', color: 'text-blue-500', caloriesPerGram: 4 },
  fat: { label: 'Grasas', color: 'text-amber-500', caloriesPerGram: 9 },
};

const PRESETS: Record<string, { p: number; c: number; f: number }> = {
  balanced: { p: 30, c: 40, f: 30 },
  high_protein: { p: 40, c: 30, f: 30 },
  low_carb: { p: 35, c: 20, f: 45 },
  ketogenic: { p: 25, c: 5, f: 70 },
  athlete: { p: 25, c: 55, f: 20 },
};

export default function MacroSplitCalculator() {
  const [calories, setCalories] = useState<number>(2000);
  const [preset, setPreset] = useState<string>('balanced');
  const [customP, setCustomP] = useState<number>(30);
  const [customC, setCustomC] = useState<number>(40);
  const [customF, setCustomF] = useState<number>(30);

  const isCustom = preset === 'custom';
  const pctP = isCustom ? customP : PRESETS[preset].p;
  const pctC = isCustom ? customC : PRESETS[preset].c;
  const pctF = isCustom ? customF : PRESETS[preset].f;

  const proteinGrams = useMemo(() => (calories * (pctP / 100)) / 4, [calories, pctP]);
  const carbsGrams = useMemo(() => (calories * (pctC / 100)) / 4, [calories, pctC]);
  const fatGrams = useMemo(() => (calories * (pctF / 100)) / 9, [calories, pctF]);

  const proteinKcal = useMemo(() => proteinGrams * 4, [proteinGrams]);
  const carbsKcal = useMemo(() => carbsGrams * 4, [carbsGrams]);
  const fatKcal = useMemo(() => fatGrams * 9, [fatGrams]);

  return (
    <CalculatorShell
      title="Distribución de Macros"
      subtitle="Divide tus calorías diarias en proteínas, carbohidratos y grasas"
      icon={<Flame className="w-6 h-6" />}
      gradientStart="bg-orange-500"
      gradientEnd="to-amber-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Calorías Diarias</label>
          <Input type="number" value={calories} onChange={(e) => setCalories(parseInt(e.target.value) || 0)} min="500" max="10000" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white font-bold focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div className="flex items-end">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(PRESETS).map(([key, val]) => (
              <Button key={key} variant={preset === key ? 'primary' : 'secondary'} size="sm" onClick={() => setPreset(key)} className="h-10 text-left text-xs py-3">
                <div className="text-xs font-bold text-white">{val.p}p/{val.c}c/{val.f}f</div>
                <div className="text-[10px] text-zinc-500">{key}</div>
              </Button>
            ))}
            <Button variant={preset === 'custom' ? 'primary' : 'secondary'} size="sm" onClick={() => setPreset('custom')} className="h-10 text-left text-xs py-3">
              <div className="text-xs font-bold text-white">Personalizado</div>
              <div className="text-[10px] text-zinc-500">custom</div>
            </Button>
          </div>
        </div>
      </div>

      {isCustom && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Proteínas %</label>
            <Input type="number" value={customP} onChange={(e) => setCustomP(parseInt(e.target.value) || 0)} min="0" max="100" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white font-bold focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Carbs %</label>
            <Input type="number" value={customC} onChange={(e) => setCustomC(parseInt(e.target.value) || 0)} min="0" max="100" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white font-bold focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Grasas %</label>
            <Input type="number" value={customF} onChange={(e) => setCustomF(parseInt(e.target.value) || 0)} min="0" max="100" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white font-bold focus:ring-2 focus:ring-cyan-500" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700 text-center">
          <div className="text-xs font-bold text-emerald-500">{MACROS.protein.label}</div>
          <div className="text-3xl font-bold text-white">{proteinGrams.toFixed(0)} g</div>
          <div className="text-xs text-zinc-500">{proteinKcal.toFixed(0)} kcal ({pctP}%)</div>
        </div>
        <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700 text-center">
          <div className="text-xs font-bold text-blue-500">{MACROS.carbs.label}</div>
          <div className="text-3xl font-bold text-white">{carbsGrams.toFixed(0)} g</div>
          <div className="text-xs text-zinc-500">{carbsKcal.toFixed(0)} kcal ({pctC}%)</div>
        </div>
        <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700 text-center">
          <div className="text-xs font-bold text-amber-500">{MACROS.fat.label}</div>
          <div className="text-3xl font-bold text-white">{fatGrams.toFixed(0)} g</div>
          <div className="text-xs text-zinc-500">{fatKcal.toFixed(0)} kcal ({pctF}%)</div>
        </div>
      </div>

      <div className="bg-zinc-800/10 border border-zinc-700/50 rounded-lg p-3 text-xs text-zinc-500">
        <p>• Proteínas: 4 kcal/g • Carbohidratos: 4 kcal/g • Grasas: 9 kcal/g</p>
        <p>💡 Ajusta los porcentajes según tu objetivo y respuesta al entrenamiento</p>
      </div>
    </CalculatorShell>
  );
}
