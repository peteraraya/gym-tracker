'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Activity } from '@/components/icons/lucide';
import CalculatorShell from './CalculatorShell';

type Zone = {
  name: string;
  min: number;
  max: number;
  label: string;
  color: string;
  desc: string;
};

const ZONES: Zone[] = [
  { name: 'Reposo', min: 50, max: 60, label: 'Zona 1', color: 'text-zinc-500', desc: 'Recuperación activa' },
  { name: 'Quema de Grasa', min: 60, max: 70, label: 'Zona 2', color: 'text-emerald-500', desc: 'Resistencia aeróbica' },
  { name: 'Aeróbica', min: 70, max: 80, label: 'Zona 3', color: 'text-blue-500', desc: 'Capacidad aeróbica' },
  { name: 'Umbral', min: 80, max: 90, label: 'Zona 4', color: 'text-amber-500', desc: 'Lactato umbral' },
  { name: 'Máxima', min: 90, max: 100, label: 'Zona 5', color: 'text-rose-500', desc: 'Esfuerzo máximo' },
];

export default function HeartRateZonesCalculator() {
  const [age, setAge] = useState<number>(30);
  const [restingHR, setRestingHR] = useState<number>(60);
  const [method, setMethod] = useState<'simple' | 'karvonen'>('simple');

  const maxHR = useMemo(() => method === 'simple' ? 220 - age : 220 - age, [age, method]);
  const hrr = useMemo(() => maxHR - restingHR, [maxHR, restingHR]);

  const zones = useMemo(() =>
    ZONES.map((z) => ({
      ...z,
      bpmMin: Math.round(maxHR * (z.min / 100)),
      bpmMax: Math.round(maxHR * (z.max / 100)),
      karvonenMin: method === 'karvonen' ? Math.round(restingHR + hrr * (z.min / 100)) : 0,
      karvonenMax: method === 'karvonen' ? Math.round(restingHR + hrr * (z.max / 100)) : 0,
    })),
  [maxHR, restingHR, hrr, method]);

  return (
    <CalculatorShell
      title="Zonas de Frecuencia Cardíaca"
      subtitle="Entrena en la zona correcta según tu objetivo"
      icon={<Activity className="w-6 h-6" />}
      gradientStart="bg-rose-500"
      gradientEnd="to-orange-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Edad</label>
          <Input type="number" value={age} onChange={(e) => setAge(parseInt(e.target.value) || 0)} min="1" max="100" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white font-bold focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">FC en Reposo (bpm)</label>
          <Input type="number" value={restingHR} onChange={(e) => setRestingHR(parseInt(e.target.value) || 0)} min="30" max="200" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-3 text-white font-bold focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div className="flex items-end">
          <div className="grid grid-cols-2 gap-2">
            <Button variant={method === 'simple' ? 'primary' : 'secondary'} size="sm" onClick={() => setMethod('simple')} className="h-10">
              <div className="text-xs font-bold text-white">Simple (220-edad)</div>
            </Button>
            <Button variant={method === 'karvonen' ? 'primary' : 'secondary'} size="sm" onClick={() => setMethod('karvonen')} className="h-10">
              <div className="text-xs font-bold text-white">Karvonen</div>
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700 text-center">
        <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">FC Máxima Estimada</div>
        <div className="text-4xl font-bold text-white">{maxHR}</div>
        <div className="text-xs text-zinc-500 mt-1">bpm</div>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Zonas de Entrenamiento</h4>
        <div className="space-y-1">
          {zones.map((z) => (
            <div key={z.name} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg border border-zinc-700">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${z.color}`}></div>
                <div className="text-sm font-medium text-zinc-200">{z.label}</div>
                <div className="text-xs text-zinc-500">{z.name}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white">{method === 'karvonen' ? z.karvonenMin : z.bpmMin} - {method === 'karvonen' ? z.karvonenMax : z.bpmMax} bpm</div>
                <div className="text-[10px] text-zinc-500">{z.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-zinc-500 mt-2 border-t border-zinc-700 pt-2">
        💡 Zona 2: Base aeróbica y quema de grasa • Zona 4-5: Intervalos y potencia
      </div>
    </CalculatorShell>
  );
}
