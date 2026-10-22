'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { User } from '@/components/icons/lucide';
import CalculatorShell from './CalculatorShell';

type Sex = 'male' | 'female';

const BMI_CATEGORIES: Record<string, { label: string; color: string; bg: string }> = {
  underweight: { label: 'Bajo Peso', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  normal: { label: 'Normal', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  overweight: { label: 'Sobrepeso', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  obese_i: { label: 'Obesidad I', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
  obese_ii: { label: 'Obesidad II', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
  obese_iii: { label: 'Obesidad III', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
} as const;

function getBMICategory(bmi: number) {
  if (bmi < 18.5) return BMI_CATEGORIES.underweight;
  if (bmi < 25) return BMI_CATEGORIES.normal;
  if (bmi < 30) return BMI_CATEGORIES.overweight;
  if (bmi < 35) return BMI_CATEGORIES.obese_i;
  if (bmi < 40) return BMI_CATEGORIES.obese_ii;
  return BMI_CATEGORIES.obese_iii;
}

function getBodyFat(sex: Sex, waist: number, neck: number, height: number, hip: number) {
  if (sex === 'male') {
    return 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
  } else {
    return 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
  }
}

export default function BMICalculator() {
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(170);
  const [age, setAge] = useState<number>(25);
  const [sex, setSex] = useState<Sex>('male');
  const [neck, setNeck] = useState<number>(37);
  const [waist, setWaist] = useState<number>(85);
  const [hip, setHip] = useState<number>(95);

  const bmi = useMemo(() => weight / Math.pow(height / 100, 2), [weight, height]);
  const category = useMemo(() => getBMICategory(bmi), [bmi]);
  const bodyFat = useMemo(() => getBodyFat(sex, waist, neck, height, sex === 'female' ? hip : 0), [sex, waist, neck, height, hip]);
  const leanMass = useMemo(() => weight * (1 - bodyFat / 100), [weight, bodyFat]);
  const fatMass = useMemo(() => weight - leanMass, [weight, leanMass]);

  const ffmi = useMemo(() => leanMass / Math.pow(height / 100, 2), [leanMass, height]);
  const normalizedFFMI = useMemo(() => ffmi + 6.1 * (1.8 - height / 100), [ffmi, height]);

  const ffmiCategory = useMemo(() => {
    if (sex === 'male') {
      if (normalizedFFMI < 18) return { label: 'Por debajo del promedio', color: 'text-blue-600' };
      if (normalizedFFMI < 21) return { label: 'Promedio', color: 'text-emerald-600' };
      if (normalizedFFMI < 25) return { label: 'Sobre el promedio', color: 'text-amber-600' };
      return { label: 'Sobresaliente', color: 'text-rose-600' };
    } else {
      if (normalizedFFMI < 15) return { label: 'Por debajo del promedio', color: 'text-blue-600' };
      if (normalizedFFMI < 18) return { label: 'Promedio', color: 'text-emerald-600' };
      if (normalizedFFMI < 21) return { label: 'Sobre el promedio', color: 'text-amber-600' };
      return { label: 'Sobresaliente', color: 'text-rose-600' };
    }
  }, [normalizedFFMI, sex]);

  return (
    <CalculatorShell
      title="IMC y Composición Corporal"
      subtitle="Índice de Masa Corporal, % grasa y FFMI"
      icon={<User className="w-6 h-6" />}
      gradientStart="bg-rose-500"
      gradientEnd="to-orange-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Peso (kg)</label>
          <Input type="number" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value) || 0)} step="0.5" min="0" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white font-bold focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Altura (cm)</label>
          <Input type="number" value={height} onChange={(e) => setHeight(parseInt(e.target.value) || 0)} min="50" max="250" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white font-bold focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Edad</label>
          <Input type="number" value={age} onChange={(e) => setAge(parseInt(e.target.value) || 0)} min="1" max="120" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white font-bold focus:ring-2 focus:ring-cyan-500" />
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Cuello (cm)</label>
          <Input type="number" value={neck} onChange={(e) => setNeck(parseFloat(e.target.value) || 0)} step="0.5" min="0" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Cintura (cm)</label>
          <Input type="number" value={waist} onChange={(e) => setWaist(parseFloat(e.target.value) || 0)} step="0.5" min="0" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white focus:ring-2 focus:ring-cyan-500" />
        </div>
        {sex === 'female' && (
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Cadera (cm)</label>
            <Input type="number" value={hip} onChange={(e) => setHip(parseFloat(e.target.value) || 0)} step="0.5" min="0" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white focus:ring-2 focus:ring-cyan-500" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700 text-center">
          <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">IMC</div>
          <div className="text-4xl font-bold text-white">{bmi.toFixed(1)}</div>
          <div className={`px-3 py-1 rounded-md text-xs font-bold mt-2 ${category.bg} ${category.color}`}>{category.label}</div>
        </div>
        <div className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700 text-center">
          <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">% Grasa Corporal</div>
          <div className="text-4xl font-bold text-white">{bodyFat.toFixed(1)}%</div>
          <div className="text-xs text-zinc-500 mt-1">Fórmula US Navy</div>
        </div>
        <div className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700 text-center">
          <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">FFMI</div>
          <div className="text-4xl font-bold text-white">{normalizedFFMI.toFixed(1)}</div>
          <div className="text-xs text-zinc-500 mt-1">{ffmiCategory.label}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700 text-center">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Masa Grasa</div>
          <div className="text-xl font-bold text-rose-400">{fatMass.toFixed(1)} kg</div>
        </div>
        <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700 text-center">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Masa Magra</div>
          <div className="text-xl font-bold text-emerald-400">{leanMass.toFixed(1)} kg</div>
        </div>
        <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700 text-center">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Peso Ideal (BMI 22)</div>
          <div className="text-xl font-bold text-cyan-400">{Math.round(22 * Math.pow(height / 100, 2))} kg</div>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-200">
        <p>⚠️ El IMC es una guía general y no considera composición corporal.</p>
        <p>💡 El % de grasa es una estimación (fórmula US Navy). Consulta a un profesional para valores precisos.</p>
      </div>
    </CalculatorShell>
  );
}
