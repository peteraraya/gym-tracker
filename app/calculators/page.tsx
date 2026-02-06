'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import OneRMCalculator from '@/components/OneRMCalculator';
import PlateCalculator from '@/components/PlateCalculator';
import UnitConverter from '@/components/UnitConverter';
import { Button } from '@/components/ui/Button';
import { Calculator, Dumbbell, Circle, Scale, ArrowLeft } from 'lucide-react';

type CalculatorType = '1rm' | 'plates' | 'units' | null;

export default function CalculatorsPage() {
  const [selectedCalculator, setSelectedCalculator] = useState<CalculatorType>(null);

  const calculators = [
    {
      id: '1rm' as CalculatorType,
      name: 'Calculadora de 1RM',
      description: 'Calcula tu máximo de una repetición basado en peso y reps',
      icon: Dumbbell,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      id: 'plates' as CalculatorType,
      name: 'Calculadora de Placas',
      description: 'Calcula qué placas necesitas para alcanzar un peso objetivo',
      icon: Circle,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      id: 'units' as CalculatorType,
      name: 'Conversor de Unidades',
      description: 'Convierte entre kilogramos y libras fácilmente',
      icon: Scale,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    }
  ];

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          {selectedCalculator && (
            <Button
              variant="ghost"
              onClick={() => setSelectedCalculator(null)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
              <Calculator className="w-8 h-8 text-blue-600" />
              Calculadoras de Entrenamiento
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Herramientas útiles para planificar y optimizar tus entrenamientos
            </p>
          </div>
        </div>

        {/* Vista de selección */}
        {!selectedCalculator && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {calculators.map((calc) => {
              const Icon = calc.icon;
              return (
                <button
                  key={calc.id}
                  onClick={() => setSelectedCalculator(calc.id)}
                  className={`group relative overflow-hidden bg-linear-to-br ${calc.bgColor} border ${calc.borderColor} rounded-xl p-6 text-left hover:shadow-lg transition-all duration-300 hover:scale-105`}
                >
                  <div className="relative z-10">
                    <div className={`inline-flex p-3 rounded-lg bg-linear-to-br ${calc.color} mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                      {calc.name}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {calc.description}
                    </p>
                    <div className="mt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
                      Abrir calculadora
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-linear-to-br from-white/50 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        )}

        {/* Calculadoras */}
        {selectedCalculator === '1rm' && <OneRMCalculator />}
        {selectedCalculator === 'plates' && <PlateCalculator />}
        {selectedCalculator === 'units' && <UnitConverter />}

        {/* Información adicional */}
        {!selectedCalculator && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Tips de uso */}
            <div className="bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                💡 Tips de Uso
              </h3>
              <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                  <span><strong>1RM:</strong> Usa series de 1-10 reps para mayor precisión</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                  <span><strong>Placas:</strong> Verifica qué placas tiene tu gimnasio disponibles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                  <span><strong>Unidades:</strong> La mayoría de gimnasios muestran ambas unidades</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                  <span>Guarda capturas de pantalla de tus cálculos para referencia</span>
                </li>
              </ul>
            </div>

            {/* Información de seguridad */}
            <div className="bg-linear-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                ⚠️ Seguridad Primero
              </h3>
              <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                  <span>Estas son <strong>estimaciones</strong> basadas en fórmulas científicas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                  <span>No intentes tu 1RM calculado sin supervisión</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                  <span>Siempre usa un spotter para levantamientos pesados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                  <span>Verifica siempre las placas antes de levantar</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
