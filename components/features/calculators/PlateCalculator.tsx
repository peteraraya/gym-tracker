'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Minus, Plus, Dumbbell, Zap } from '@/components/icons/lucide';
import { IWF_COLORS, getIWFColor, UI_TOKENS } from '@/lib/design/tokens/iwf';

const STANDARD_PLATES_KG = [25, 20, 15, 10, 5, 2.5, 2, 1.5, 1, 0.5] as const;
const STANDARD_PLATES_LBS = [45, 35, 25, 10, 5, 2.5] as const;

const BAR_WEIGHTS = {
  olympic: { kg: 20, lbs: 45, name: 'Olímpica' },
  ez: { kg: 10, lbs: 25, name: 'EZ Curl' },
  women: { kg: 15, lbs: 35, name: 'Femenina' },
  training: { kg: 10, lbs: 25, name: 'Entrenamiento' },
  trap: { kg: 25, lbs: 55, name: 'Trap Bar' }
} as const;

type BarType = keyof typeof BAR_WEIGHTS;
type Unit = 'kg' | 'lbs';
type Mode = 'calculate' | 'build';

interface PlateCalculation {
  plates: number[];
  totalPerSide: number;
  actualTotal: number;
  possible: boolean;
  difference: number;
}

export default function PlateCalculator() {
  const [mode, setMode] = useState<Mode>('calculate');
  const [targetWeight, setTargetWeight] = useState<number>(100);
  const [barType, setBarType] = useState<BarType>('olympic');
  const [unit, setUnit] = useState<Unit>('kg');
  const [selectedPlates, setSelectedPlates] = useState<number[]>([]);

  const barWeight = BAR_WEIGHTS[barType][unit];

  const handleUnitChange = useCallback((newUnit: Unit) => {
    setUnit(newUnit);
    setSelectedPlates([]);
    if (newUnit === 'lbs' && unit === 'kg') {
      setTargetWeight(Math.round(targetWeight * 2.20462));
    } else if (newUnit === 'kg' && unit === 'lbs') {
      setTargetWeight(Math.round(targetWeight / 2.20462));
    }
  }, [unit, targetWeight]);

  const BAR_TYPES: BarType[] = ['olympic', 'ez', 'women', 'training', 'trap'];

  const handleBarTypeChange = useCallback(() => {
    const currentIndex = BAR_TYPES.indexOf(barType);
    const nextIndex = (currentIndex + 1) % BAR_TYPES.length;
    setBarType(BAR_TYPES[nextIndex]);
    setSelectedPlates([]);
  }, [barType]);

  const addPlate = useCallback((weight: number) => {
    setSelectedPlates((prev) => [...prev, weight]);
  }, []);

  const removePlate = useCallback((index: number) => {
    setSelectedPlates((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearPlates = useCallback(() => setSelectedPlates([]), []);

  const calculation: PlateCalculation = useMemo(() => {
    const weightPerSide = (targetWeight - barWeight) / 2;
    if (weightPerSide <= 0) {
      return { plates: [], totalPerSide: 0, actualTotal: barWeight, possible: true, difference: 0 };
    }
    const result: number[] = [];
    let remaining = weightPerSide;
    const sortedPlates = [...(unit === 'kg' ? STANDARD_PLATES_KG : STANDARD_PLATES_LBS)].sort((a, b) => b - a);
    for (const plate of sortedPlates) {
      while (remaining >= plate - 0.01) {
        result.push(plate);
        remaining -= plate;
      }
    }
    const totalPerSide = result.reduce((sum, p) => sum + p, 0);
    const actualTotal = barWeight + totalPerSide * 2;
    return {
      plates: result,
      totalPerSide,
      actualTotal,
      possible: Math.abs(actualTotal - targetWeight) < 0.1,
      difference: targetWeight - actualTotal,
    };
  }, [targetWeight, barWeight, unit]);

  const platesPerSide = calculation.plates;
  const countByWeight = useMemo(() => {
    const counts: Record<number, number> = {};
    platesPerSide.forEach((w) => { counts[w] = (counts[w] || 0) + 1; });
    return counts;
  }, [platesPerSide]);
  const uniquePlates = useMemo(() => [...new Set(platesPerSide)].sort((a, b) => b - a), [platesPerSide]);

  return (
    <Card className="w-full max-w-2xl md:max-w-4xl mx-auto bg-zinc-900 text-zinc-100 rounded-2xl shadow-2xl overflow-hidden border border-zinc-800">
      <CardHeader className="bg-zinc-950 p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-zinc-400" />
          <h1 className="font-bold text-lg tracking-tight">Carga de Barra</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={clearPlates} className="h-8 px-2">
            Limpiar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">

        {/* Selector de modo */}
        <div className="flex gap-1 bg-zinc-800/50 rounded-lg p-1 border border-zinc-700">
          <Button
            variant={mode === 'calculate' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setMode('calculate')}
            className="flex-1 text-xs font-medium"
          >
            Calcular
          </Button>
          <Button
            variant={mode === 'build' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setMode('build')}
            className="flex-1 text-xs font-medium"
          >
            Armar
          </Button>
        </div>

        {/* Carga Total - Jerarquía principal */}
        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
          <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-1">
            Carga Total en Barra
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-white">{calculation.actualTotal.toFixed(1)}</span>
            <span className="text-xl font-semibold text-zinc-300">{unit.toUpperCase()}</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Barra {barWeight} {unit} + {platesPerSide.length} disco(s) por lado
          </p>
        </div>

        {/* Selector de tipo de barra y unidad */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">Tipo de Barra</label>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleBarTypeChange}
              className="w-full justify-start text-left text-xs font-medium"
            >
              {BAR_WEIGHTS[barType].name} ({barWeight} {unit})
            </Button>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">Unidad</label>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleUnitChange(unit === 'kg' ? 'lbs' : 'kg')}
              className="w-full text-xs font-medium"
            >
              {unit.toUpperCase()}
            </Button>
          </div>
        </div>

        {/* Input de peso objetivo (solo en modo calcular) */}
        {mode === 'calculate' && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-zinc-400 w-20">Objetivo</label>
            <Input
              type="number"
              value={targetWeight}
              onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)}
              className="flex-1 text-lg font-bold bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500"
              placeholder="0"
            />
            <span className="text-xs text-zinc-500">{unit.toUpperCase()}</span>
          </div>
        )}

        {/* Barra visual */}
        <div className="relative h-24 flex items-center justify-center overflow-x-auto pb-2">
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-zinc-700" />
          
          {/* Lado izquierdo */}
          <div className="flex items-end gap-1.5">
            {mode === 'build' 
              ? [...selectedPlates].reverse().map((weight, i) => {
                  const color = getIWFColor(weight);
                  return (
                    <div key={`left-build-${i}`} className="flex flex-col items-center gap-1">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white/20 transition-transform active:scale-95"
                        style={{
                          backgroundColor: color.hex,
                          color: color.text,
                          width: Math.max(40, 20 + weight * 4),
                          height: Math.max(40, 20 + weight * 4),
                        }}
                      >
                        {weight}
                      </div>
                    </div>
                  );
                })
              : [...platesPerSide].reverse().map((weight, i) => {
                  const color = getIWFColor(weight);
                  return (
                    <div key={`left-calc-${i}`} className="flex flex-col items-center gap-1">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white/20 transition-transform active:scale-95"
                        style={{
                          backgroundColor: color.hex,
                          color: color.text,
                          width: Math.max(40, 20 + weight * 4),
                          height: Math.max(40, 20 + weight * 4),
                        }}
                      >
                        {weight}
                      </div>
                    </div>
                  );
                })}
          </div>

          {/* Barra central */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-zinc-500 rounded-full" />
            <div className="h-3 bg-zinc-500 w-40 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Minus className="w-8 h-1 text-zinc-400" />
              </div>
            </div>
            <div className="w-3 h-3 bg-zinc-500 rounded-full" />
          </div>

          {/* Lado derecho */}
          <div className="flex items-end gap-1.5">
            {mode === 'build'
              ? selectedPlates.map((weight, i) => {
                  const color = getIWFColor(weight);
                  return (
                    <div key={`right-build-${i}`} className="flex flex-col items-center gap-1">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white/20 transition-transform active:scale-95"
                        style={{
                          backgroundColor: color.hex,
                          color: color.text,
                          width: Math.max(40, 20 + weight * 4),
                          height: Math.max(40, 20 + weight * 4),
                        }}
                      >
                        {weight}
                      </div>
                    </div>
                  );
                })
              : platesPerSide.map((weight, i) => {
                  const color = getIWFColor(weight);
                  return (
                    <div key={`right-calc-${i}`} className="flex flex-col items-center gap-1">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white/20 transition-transform active:scale-95"
                        style={{
                          backgroundColor: color.hex,
                          color: color.text,
                          width: Math.max(40, 20 + weight * 4),
                          height: Math.max(40, 20 + weight * 4),
                        }}
                      >
                        {weight}
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>

        {/* Controles por lado (solo modo calcular) */}
        {mode === 'calculate' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700">
              <p className="text-xs font-medium text-zinc-400 mb-2 uppercase">Lado Izquierdo</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-zinc-200">{calculation.totalPerSide.toFixed(1)} {unit}</span>
                <Button variant="ghost" size="sm" onClick={() => removePlate(platesPerSide.length - 1)} disabled={platesPerSide.length === 0} className="h-8 w-8 p-0">
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700">
              <p className="text-xs font-medium text-zinc-400 mb-2 uppercase">Lado Derecho</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-zinc-200">{calculation.totalPerSide.toFixed(1)} {unit}</span>
                <Button variant="ghost" size="sm" onClick={() => removePlate(0)} disabled={platesPerSide.length === 0} className="h-8 w-8 p-0">
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Selección rápida de discos */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            {mode === 'calculate' ? 'Agregar Disco' : 'Seleccionar Disco'}
          </p>
          <div className="grid grid-cols-5 gap-2">
            {(unit === 'kg' ? STANDARD_PLATES_KG : STANDARD_PLATES_LBS).map((weight) => {
              const color = getIWFColor(weight);
              return (
                <Button
                  key={weight}
                  onClick={() => addPlate(weight)}
                  className="h-10 px-2 py-1 text-xs font-bold rounded-lg shadow-sm active:scale-95 flex flex-col items-center justify-center gap-1"
                  style={{
                    backgroundColor: color.hex,
                    color: color.text,
                    border: color.hex === '#FFFFFF' ? '1px solid #E5E7EB' : 'none',
                  }}
                >
                  <span className="text-xs font-bold">{weight}</span>
                  <span className="text-[10px] opacity-80">{unit === 'kg' ? 'kg' : 'lb'}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Estado de precisión */}
        {mode === 'calculate' && !calculation.possible && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-xs text-orange-200">
            <Zap className="w-4 h-4 mr-1" />
            No se puede alcanzar exactamente {targetWeight} {unit}. Diferencia: {Math.abs(calculation.difference).toFixed(1)} {unit}
          </div>
        )}

        {mode === 'build' && selectedPlates.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-xs text-blue-200">
            <Dumbbell className="w-4 h-4 mr-1" />
            Peso construido: {(barWeight + selectedPlates.reduce((a, b) => a + b, 0) * 2).toFixed(1)} {unit}
          </div>
        )}
      </CardContent>

      {/* Footer CTA */}
      <div className="bg-zinc-950 border-t border-zinc-800 p-4">
        <Button
          onClick={() => {}}
          className="w-full h-12 bg-cyan-500 text-zinc-900 font-bold rounded-xl hover:bg-cyan-400 transition-colors"
        >
          {mode === 'calculate' ? 'Aplicar a Entrenamiento' : 'Guardar Configuración'}
        </Button>
      </div>
    </Card>
  );
}
