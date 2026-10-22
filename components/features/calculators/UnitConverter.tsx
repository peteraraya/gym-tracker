'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Scale, ArrowLeftRight } from '@/components/icons/lucide';
import CalculatorShell from './CalculatorShell';

const KG_TO_LBS = 2.20462;
const LBS_TO_KG = 0.453592;

const COMMON_WEIGHTS = [
  { kg: 2.5, lbs: 5.5, name: 'Placa pequeña' },
  { kg: 5, lbs: 11, name: 'Placa pequeña' },
  { kg: 10, lbs: 22, name: 'Placa media' },
  { kg: 15, lbs: 33, name: 'Placa media' },
  { kg: 20, lbs: 44, name: 'Placa grande' },
  { kg: 25, lbs: 55, name: 'Placa grande' },
  { kg: 45, lbs: 100, name: 'Barra + 2×20 kg' },
  { kg: 60, lbs: 132, name: '3×20 kg' },
  { kg: 100, lbs: 220, name: '5×20 kg' },
  { kg: 140, lbs: 308, name: '7×20 kg' },
  { kg: 180, lbs: 396, name: '9×20 kg' },
] as const;

export default function UnitConverter() {
  const [kgValue, setKgValue] = useState<number>(100);
  const [lbsValue, setLbsValue] = useState<number>(220.46);
  const [activeSide, setActiveSide] = useState<'kg' | 'lbs'>('kg');

  const handleKgChange = useCallback((value: number) => {
    setKgValue(value);
    setLbsValue(value * KG_TO_LBS);
    setActiveSide('kg');
  }, []);

  const handleLbsChange = useCallback((value: number) => {
    setLbsValue(value);
    setKgValue(value * LBS_TO_KG);
    setActiveSide('lbs');
  }, []);

  const quickConversions = useMemo(() => [
    { kg: 1, lbs: 2.2, label: '1 kg ≈ 2.2 lbs' },
    { kg: 0.45, lbs: 1, label: '1 lb ≈ 0.45 kg' },
    { kg: 10, lbs: 22, label: '10 kg ≈ 22 lbs' },
    { kg: 45, lbs: 100, label: '45 lbs = Barra olímpica' },
    { kg: 20, lbs: 44, label: '20 kg ≈ 44 lbs' },
    { kg: 100, lbs: 220, label: '100 kg ≈ 220 lbs' },
  ], []);

  return (
    <CalculatorShell
      title="Conversor de Unidades"
      subtitle="Convierte entre kilogramos y libras al instante"
      icon={<Scale className="w-6 h-6" />}
      gradientStart="bg-purple-500"
      gradientEnd="to-purple-600"
    >
      {/* Convertidor Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-3">
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">Kilogramos</label>
          <Input
            type="number"
            value={kgValue}
            onChange={(e) => handleKgChange(parseFloat(e.target.value) || 0)}
            className={`w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-4 text-4xl font-bold text-white focus:ring-2 focus:ring-cyan-500 ${activeSide === 'kg' ? 'border-cyan-500 ring-1 ring-cyan-500' : ''}`}
            placeholder="0"
          />
        </div>

        <div className="hidden md:flex justify-center items-center">
          <ArrowLeftRight className="w-8 h-8 text-zinc-500 rotate-90" />
        </div>

        <div className="space-y-3 md:order-last">
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">Libras</label>
          <Input
            type="number"
            value={lbsValue}
            onChange={(e) => handleLbsChange(parseFloat(e.target.value) || 0)}
            className={`w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-4 text-4xl font-bold text-white focus:ring-2 focus:ring-purple-500 ${activeSide === 'lbs' ? 'border-purple-500 ring-1 ring-purple-500' : ''}`}
            placeholder="0"
          />
        </div>
      </div>

      {/* Pesos Comunes */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Pesos de Referencia</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {COMMON_WEIGHTS.map((w) => (
            <Button
              key={w.kg}
              variant="secondary"
              size="sm"
              onClick={() => handleKgChange(w.kg)}
              className="h-10 flex flex-col items-center justify-center gap-1"
            >
              <span className="text-xs font-bold">{w.kg} kg</span>
              <span className="text-[10px] text-zinc-500">{w.lbs} lbs</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Conversiones Rápidas */}
      <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Conversiones Rápidas</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {quickConversions.map((c) => (
            <div key={c.label} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded border border-zinc-700/50">
              <span className="text-xs font-medium text-zinc-200">{c.label}</span>
              <Button variant="ghost" size="sm" onClick={() => handleKgChange(c.kg)} className="h-6 w-6 p-0">
                <ArrowLeftRight className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Notas */}
      <div className="text-xs text-zinc-500 space-y-1 pt-2 border-t border-zinc-700">
        <p>• 1 kilogramo = 2.20462 libras (exacto)</p>
        <p>• Los kg se usan en sistemas métricos (Europa, Latinoamérica)</p>
        <p>• Las libras (lbs) se usan en EE. UU. y algunos países</p>
      </div>
    </CalculatorShell>
  );
}
