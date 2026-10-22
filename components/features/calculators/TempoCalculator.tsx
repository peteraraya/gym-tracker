'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Clock } from '@/components/icons/lucide';
import CalculatorShell from './CalculatorShell';

const TEMPO_PRESETS: { name: string; tempo: string; values: number[]; desc: string }[] = [
  { name: 'Fuerza', tempo: '2-0-1-0', values: [2, 0, 1, 0], desc: 'Explosivo, potencia' },
  { name: 'Hipertrofia', tempo: '3-0-1-1', values: [3, 0, 1, 1], desc: 'Tensión constante' },
  { name: 'Control', tempo: '4-2-1-0', values: [4, 2, 1, 0], desc: 'Máximo control' },
  { name: 'Resistencia', tempo: '2-0-2-0', values: [2, 0, 2, 0], desc: 'Ritmo constante' },
  { name: 'Excéntrico', tempo: '5-1-1-0', values: [5, 1, 1, 0], desc: 'Énfasis fase negativa' },
];

export default function TempoCalculator() {
  const [eccentric, setEccentric] = useState<number>(3);
  const [pause1, setPause1] = useState<number>(0);
  const [concentric, setConcentric] = useState<number>(1);
  const [pause2, setPause2] = useState<number>(0);
  const [reps, setReps] = useState<number>(10);
  const [sets, setSets] = useState<number>(3);

  const timePerRep = useMemo(() => eccentric + pause1 + concentric + pause2, [eccentric, pause1, concentric, pause2]);
  const timePerSet = useMemo(() => timePerRep * reps, [timePerRep, reps]);
  const totalTime = useMemo(() => timePerSet * sets, [timePerSet, sets]);

  const applyPreset = (values: number[]) => {
    setEccentric(values[0]);
    setPause1(values[1]);
    setConcentric(values[2]);
    setPause2(values[3]);
  };

  return (
    <CalculatorShell
      title="Tempo de Repetición"
      subtitle="Calcula el tiempo bajo tensión (TUT) basado en el tempo de ejecución"
      icon={<Clock className="w-6 h-6" />}
      gradientStart="bg-indigo-500"
      gradientEnd="to-violet-600"
    >
      {/* Presets */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Presets de Tempo</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {TEMPO_PRESETS.map((preset) => (
            <Button
              key={preset.name}
              variant="secondary"
              size="sm"
              onClick={() => applyPreset(preset.values)}
              className="h-10 flex flex-col items-center justify-center gap-1 text-left"
            >
              <div className="text-xs font-bold text-white">{preset.name}</div>
              <div className="text-[10px] font-mono text-cyan-400">{preset.tempo}</div>
              <div className="text-[10px] text-zinc-500">{preset.desc}</div>
            </Button>
          ))}
        </div>
      </div>

      {/* Tempo Manual */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-zinc-800/30 rounded-xl p-4 border border-zinc-700">
        <div>
          <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Excéntrico</label>
          <Input type="number" value={eccentric} onChange={(e) => setEccentric(parseFloat(e.target.value) || 0)} step="0.5" min="0" className="w-full bg-zinc-900 border-zinc-700 rounded-lg px-3 py-2 text-white text-center text-xs font-bold focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div>
          <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Pausa Inf.</label>
          <Input type="number" value={pause1} onChange={(e) => setPause1(parseFloat(e.target.value) || 0)} step="0.5" min="0" className="w-full bg-zinc-900 border-zinc-700 rounded-lg px-3 py-2 text-white text-center text-xs font-bold focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div>
          <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Concéntrico</label>
          <Input type="number" value={concentric} onChange={(e) => setConcentric(parseFloat(e.target.value) || 0)} step="0.5" min="0" className="w-full bg-zinc-900 border-zinc-700 rounded-lg px-3 py-2 text-white text-center text-xs font-bold focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div>
          <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Pausa Sup.</label>
          <Input type="number" value={pause2} onChange={(e) => setPause2(parseFloat(e.target.value) || 0)} step="0.5" min="0" className="w-full bg-zinc-900 border-zinc-700 rounded-lg px-3 py-2 text-white text-center text-xs font-bold focus:ring-2 focus:ring-cyan-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Repeticiones</label>
          <Input type="number" value={reps} onChange={(e) => setReps(parseInt(e.target.value) || 1)} min="1" max="100" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2 text-white text-center text-xs font-bold focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div>
          <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Series</label>
          <Input type="number" value={sets} onChange={(e) => setSets(parseInt(e.target.value) || 1)} min="1" max="50" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2 text-white text-center text-xs font-bold focus:ring-2 focus:ring-cyan-500" />
        </div>
      </div>

      {/* Resultados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700 text-center">
          <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">TUT por Serie</div>
          <div className="text-2xl font-bold text-white">{timePerSet.toFixed(1)}s</div>
        </div>
        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700 text-center">
          <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Tiempo Total</div>
          <div className="text-2xl font-bold text-cyan-400">{Math.floor(totalTime / 60)}:{totalTime % 60 > 0 ? (totalTime % 60).toString().padStart(2, '0') : '00'}</div>
        </div>
        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700 text-center">
          <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">TUT Total</div>
          <div className="text-2xl font-bold text-white">{totalTime.toFixed(1)}s</div>
        </div>
      </div>

      {/* Visualización */}
      <div className="mt-6 bg-zinc-800/30 rounded-xl p-6 border border-zinc-700 text-center">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Visualización del Tempo</h4>
        <div className="flex items-center justify-center gap-2">
          <div className="text-center flex-1">
            <div className="text-3xl mb-1">⬇️</div>
            <div className="text-lg font-bold text-purple-400">{eccentric}s</div>
            <div className="text-[10px] text-zinc-500 mt-1">Excéntrico</div>
          </div>
          <div className="text-2xl text-zinc-600">→</div>
          <div className="text-center flex-1">
            <div className="text-3xl mb-1">⏸️</div>
            <div className="text-lg font-bold text-blue-400">{pause1}s</div>
            <div className="text-[10px] text-zinc-500 mt-1">Pausa Inf.</div>
          </div>
          <div className="text-2xl text-zinc-600">→</div>
          <div className="text-center flex-1">
            <div className="text-3xl mb-1">⬆️</div>
            <div className="text-lg font-bold text-rose-400">{concentric}s</div>
            <div className="text-[10px] text-zinc-500 mt-1">Concéntrico</div>
          </div>
          <div className="text-2xl text-zinc-600">→</div>
          <div className="text-center flex-1">
            <div className="text-3xl mb-1">⏸️</div>
            <div className="text-lg font-bold text-cyan-400">{pause2}s</div>
            <div className="text-[10px] text-zinc-500 mt-1">Pausa Sup.</div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700">
        <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Guía de TUT</h4>
        <ul className="text-xs text-zinc-500 space-y-1">
          <li>• <strong>20–40s:</strong> Óptimo para hipertrofia</li>
          <li>• <strong>40–70s:</strong> Resistencia muscular</li>
          <li>• <strong>&lt;20s:</strong> Fuerza y potencia</li>
        </ul>
      </div>
    </CalculatorShell>
  );
}
