'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Circle, Minus } from '@/components/icons/lucide';

// Pesos estándar de placas en kg
const STANDARD_PLATES_KG = [25, 20, 15, 10, 5, 2.5, 2, 1.25, 1, 0.5, 0.25];
const STANDARD_PLATES_LBS = [45, 35, 25, 10, 5, 2.5];

// Pesos de barras comunes
const BAR_WEIGHTS = {
  olympic: { kg: 20, lbs: 45, name: 'Olímpica' },
  ez: { kg: 10, lbs: 25, name: 'EZ Curl' },
  women: { kg: 15, lbs: 35, name: 'Femenina' },
  training: { kg: 10, lbs: 25, name: 'Entrenamiento' },
  trap: { kg: 25, lbs: 55, name: 'Trap Bar' }
};

type BarType = keyof typeof BAR_WEIGHTS;

export default function PlateCalculator() {
  const [targetWeight, setTargetWeight] = useState<number>(100);
  const [barType, setBarType] = useState<BarType>('olympic');
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [availablePlates, setAvailablePlates] = useState<number[]>(
    unit === 'kg' ? STANDARD_PLATES_KG : STANDARD_PLATES_LBS
  );

  const barWeight = BAR_WEIGHTS[barType][unit];

  // Cambiar unidad
  const handleUnitChange = (newUnit: 'kg' | 'lbs') => {
    setUnit(newUnit);
    setAvailablePlates(newUnit === 'kg' ? STANDARD_PLATES_KG : STANDARD_PLATES_LBS);
    // Convertir el peso objetivo
    if (newUnit === 'lbs' && unit === 'kg') {
      setTargetWeight(targetWeight * 2.20462);
    } else if (newUnit === 'kg' && unit === 'lbs') {
      setTargetWeight(targetWeight / 2.20462);
    }
  };

  // Calcular placas necesarias
  const calculatePlates = () => {
    const weightPerSide = (targetWeight - barWeight) / 2;
    
    if (weightPerSide <= 0) {
      return { plates: [], totalPerSide: 0, possible: false };
    }

    const result: number[] = [];
    let remaining = weightPerSide;
    const sortedPlates = [...availablePlates].sort((a, b) => b - a);

    for (const plate of sortedPlates) {
      while (remaining >= plate - 0.01) { // Pequeña tolerancia para decimales
        result.push(plate);
        remaining -= plate;
      }
    }

    const totalPerSide = result.reduce((sum, p) => sum + p, 0);
    const actualTotal = barWeight + (totalPerSide * 2);
    const possible = Math.abs(actualTotal - targetWeight) < 0.1;

    return {
      plates: result,
      totalPerSide,
      actualTotal,
      possible,
      difference: targetWeight - actualTotal
    };
  };

  const calculation = calculatePlates();

  // Colores para las placas (estándar IPF/IWF)
  const getPlateColor = (weight: number, unit: 'kg' | 'lbs'): string => {
    if (unit === 'kg') {
      if (weight === 25) return 'bg-red-500';
      if (weight === 20) return 'bg-blue-500';
      if (weight === 15) return 'bg-yellow-500';
      if (weight === 10) return 'bg-green-500';
      if (weight === 5) return 'bg-zinc-500';
      if (weight === 2.5) return 'bg-red-400';
      if (weight === 2) return 'bg-blue-400';
      if (weight === 1.25) return 'bg-zinc-400';
      if (weight === 1) return 'bg-green-400';
    } else {
      if (weight === 45) return 'bg-red-500';
      if (weight === 35) return 'bg-yellow-500';
      if (weight === 25) return 'bg-green-500';
      if (weight === 10) return 'bg-white border-2 border-zinc-400';
      if (weight === 5) return 'bg-red-400';
      if (weight === 2.5) return 'bg-blue-400';
    }
    return 'bg-zinc-500';
  };

  const getPlateSize = (weight: number, unit: 'kg' | 'lbs'): string => {
    if (unit === 'kg') {
      if (weight >= 20) return 'w-24 h-24';
      if (weight >= 10) return 'w-20 h-20';
      if (weight >= 5) return 'w-16 h-16';
      if (weight >= 2) return 'w-12 h-12';
      return 'w-10 h-10';
    } else {
      if (weight >= 35) return 'w-24 h-24';
      if (weight >= 25) return 'w-20 h-20';
      if (weight >= 10) return 'w-16 h-16';
      return 'w-12 h-12';
    }
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg p-6">
        <CardTitle className="flex items-center gap-2 text-white">
          <Circle className="w-5 h-5" />
          Calculadora de Placas para Barra
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Selector de unidad */}
          <div className="flex gap-2">
            <Button
              variant={unit === 'kg' ? 'primary' : 'secondary'}
              onClick={() => handleUnitChange('kg')}
              className="flex-1"
            >
              Kilogramos (kg)
            </Button>
            <Button
              variant={unit === 'lbs' ? 'primary' : 'secondary'}
              onClick={() => handleUnitChange('lbs')}
              className="flex-1"
            >
              Libras (lbs)
            </Button>
          </div>

          {/* Input de peso objetivo */}
          <div>
            <Input
              type="number"
              label={`Peso objetivo total (${unit})`}
              value={targetWeight}
              onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)}
              min="0"
              step={unit === 'kg' ? '0.5' : '1'}
            />
          </div>

          {/* Selector de tipo de barra */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Tipo de Barra
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(Object.keys(BAR_WEIGHTS) as BarType[]).map((type) => (
                <Button
                  key={type}
                  variant={barType === type ? 'primary' : 'secondary'}
                  onClick={() => setBarType(type)}
                  className="text-sm"
                >
                  {BAR_WEIGHTS[type].name}
                  <span className="text-xs opacity-75 ml-1">
                    ({BAR_WEIGHTS[type][unit]} {unit})
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Resultado */}
          {targetWeight > 0 && (
            <>
              <div className="bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                      Peso de la barra: {barWeight} {unit}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Peso por lado: {calculation.totalPerSide.toFixed(2)} {unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {calculation.actualTotal?.toFixed(2) || '0'} {unit}
                    </p>
                  </div>
                </div>

                {!calculation.possible && calculation.difference !== undefined && (
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ No es posible alcanzar exactamente {targetWeight} {unit} con las placas disponibles.
                      Diferencia: {Math.abs(calculation.difference).toFixed(2)} {unit}
                    </p>
                  </div>
                )}
              </div>

              {/* Visualización de placas */}
              {calculation.plates.length > 0 && (
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                    Configuración por lado (de dentro hacia fuera):
                  </h4>
                  
                  {/* Lista de placas */}
                  <div className="space-y-2 mb-6">
                    {calculation.plates.map((plate, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 bg-zinc-50 dark:bg-zinc-800 rounded"
                      >
                        <div className={`${getPlateColor(plate, unit)} rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold ${
                          plate === 5 || plate === 10 ? 'text-zinc-900' : 'text-white'
                        }`}>
                          {plate}
                        </div>
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {plate} {unit}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Visualización gráfica de la barra */}
                  <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-6 overflow-x-auto">
                    <div className="flex items-center justify-center gap-2 min-w-max">
                      {/* Lado izquierdo */}
                      <div className="flex items-center gap-1">
                        {[...calculation.plates].reverse().map((plate, index) => (
                          <div
                            key={`left-${index}`}
                            className={`${getPlateSize(plate, unit)} ${getPlateColor(plate, unit)} rounded-sm flex items-center justify-center font-bold text-xs ${
                              (unit === 'lbs' && plate === 10) ? 'text-zinc-900' : 'text-white'
                            } shadow-lg`}
                          >
                            {plate}
                          </div>
                        ))}
                      </div>

                      {/* Barra */}
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-zinc-400 rounded-full" />
                        <div className="h-3 bg-zinc-400" style={{ width: '120px' }}>
                          <div className="h-full flex items-center justify-center">
                            <Minus className="w-16 h-2 text-zinc-600" />
                          </div>
                        </div>
                        <div className="w-3 h-3 bg-zinc-400 rounded-full" />
                      </div>

                      {/* Lado derecho */}
                      <div className="flex items-center gap-1">
                        {calculation.plates.map((plate, index) => (
                          <div
                            key={`right-${index}`}
                            className={`${getPlateSize(plate, unit)} ${getPlateColor(plate, unit)} rounded-sm flex items-center justify-center font-bold text-xs ${
                              (unit === 'lbs' && plate === 10) ? 'text-zinc-900' : 'text-white'
                            } shadow-lg`}
                          >
                            {plate}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Leyenda de colores */}
                  <div className="mt-4 text-xs text-zinc-600 dark:text-zinc-400">
                    <p className="font-semibold mb-2">Colores estándar IPF/IWF:</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {unit === 'kg' ? (
                        <>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded-full" />
                            <span>25 kg - Rojo</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-500 rounded-full" />
                            <span>20 kg - Azul</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-500 rounded-full" />
                            <span>15 kg - Amarillo</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded-full" />
                            <span>10 kg - Verde</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-zinc-500 rounded-full" />
                            <span>5 kg - Gris</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded-full" />
                            <span>45 lbs - Rojo</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-500 rounded-full" />
                            <span>35 lbs - Amarillo</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded-full" />
                            <span>25 lbs - Verde</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-white border-2 border-zinc-400 rounded-full" />
                            <span>10 lbs - Blanco</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {calculation.plates.length === 0 && targetWeight <= barWeight && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 Solo necesitas la barra ({barWeight} {unit})
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
