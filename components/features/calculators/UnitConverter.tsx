'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ArrowLeftRight, Scale } from '@/components/icons/lucide';

export default function UnitConverter() {
  const [kgValue, setKgValue] = useState<number>(100);
  const [lbsValue, setLbsValue] = useState<number>(220.46);

  const KG_TO_LBS = 2.20462;
  const LBS_TO_KG = 0.453592;

  const handleKgChange = (value: number) => {
    setKgValue(value);
    setLbsValue(value * KG_TO_LBS);
  };

  const handleLbsChange = (value: number) => {
    setLbsValue(value);
    setKgValue(value * LBS_TO_KG);
  };

  // Pesos comunes para referencia
  const commonWeights = [
    { kg: 2.5, lbs: 5.5, name: 'Placa pequeña' },
    { kg: 5, lbs: 11, name: 'Placa pequeña' },
    { kg: 10, lbs: 22, name: 'Placa media' },
    { kg: 15, lbs: 33, name: 'Placa media' },
    { kg: 20, lbs: 44, name: 'Placa grande' },
    { kg: 25, lbs: 55, name: 'Placa grande' },
    { kg: 45, lbs: 100, name: 'Dos placas 20kg + barra' },
    { kg: 60, lbs: 132, name: 'Tres placas 20kg' },
    { kg: 100, lbs: 220, name: 'Cinco placas 20kg' },
    { kg: 140, lbs: 308, name: 'Siete placas 20kg' },
    { kg: 180, lbs: 396, name: 'Nueve placas 20kg' }
  ];

  return (
    <Card>
      <CardHeader className="bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-t-lg p-6">
        <CardTitle className="flex items-center gap-2 text-white">
          <Scale className="w-5 h-5" />
          Conversor de Unidades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Convertidor principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Kilogramos */}
            <div className="space-y-2">
              <Input
                type="number"
                label="Kilogramos (kg)"
                value={kgValue}
                onChange={(e) => handleKgChange(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {kgValue.toFixed(2)}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">kg</div>
              </div>
            </div>

            {/* Icono de conversión */}
            <div className="hidden md:flex justify-center">
              <ArrowLeftRight className="w-8 h-8 text-zinc-400" />
            </div>
            <div className="flex md:hidden justify-center my-2">
              <ArrowLeftRight className="w-6 h-6 text-zinc-400 rotate-90" />
            </div>

            {/* Libras */}
            <div className="space-y-2 md:order-last">
              <Input
                type="number"
                label="Libras (lbs)"
                value={lbsValue}
                onChange={(e) => handleLbsChange(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                  {lbsValue.toFixed(2)}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">lbs</div>
              </div>
            </div>
          </div>

          {/* Información */}
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-zinc-600 dark:text-zinc-400 mb-1">Fórmula kg → lbs</p>
                <p className="font-mono text-zinc-900 dark:text-zinc-100">
                  kg × 2.20462
                </p>
              </div>
              <div>
                <p className="text-zinc-600 dark:text-zinc-400 mb-1">Fórmula lbs → kg</p>
                <p className="font-mono text-zinc-900 dark:text-zinc-100">
                  lbs × 0.453592
                </p>
              </div>
            </div>
          </div>

          {/* Tabla de referencia */}
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              Pesos Comunes de Referencia
            </h4>
            <div className="space-y-2">
              {commonWeights.map((weight, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-2 items-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-750 transition-colors cursor-pointer"
                  onClick={() => {
                    handleKgChange(weight.kg);
                  }}
                >
                  <div className="font-semibold text-blue-600 dark:text-blue-400">
                    {weight.kg} kg
                  </div>
                  <div className="text-center">
                    <ArrowLeftRight className="w-4 h-4 text-zinc-400 mx-auto" />
                  </div>
                  <div className="font-semibold text-purple-600 dark:text-purple-400 text-right">
                    {weight.lbs} lbs
                  </div>
                  <div className="col-span-3 text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    {weight.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversiones rápidas */}
          <div className="bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              💡 Conversiones Rápidas (aproximadas)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  <strong>1 kg</strong> ≈ 2.2 lbs
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  <strong>1 lb</strong> ≈ 0.45 kg
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  <strong>10 kg</strong> ≈ 22 lbs
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  <strong>100 lbs</strong> ≈ 45 kg
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  <strong>20 kg</strong> ≈ 44 lbs
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  <strong>45 lbs</strong> = Barra olímpica
                </span>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <p>💡 <strong>Nota:</strong> 1 kilogramo = 2.20462 libras (exacto)</p>
            <p>🌍 Los kg se usan principalmente en sistemas métricos (Europa, Latinoamérica)</p>
            <p>🇺🇸 Las libras (lbs) se usan en Estados Unidos y algunos países</p>
            <p>🏋️ La mayoría de equipamiento de gimnasio muestra ambas unidades</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
