'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { User } from '@/components/icons/lucide';

export default function BMICalculator() {
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(170);
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [neck, setNeck] = useState<number>(37);
  const [waist, setWaist] = useState<number>(85);
  const [hip, setHip] = useState<number>(95);

  const bmi = weight / Math.pow(height / 100, 2);
  
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Bajo Peso', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' };
    if (bmi < 30) return { label: 'Sobrepeso', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
    if (bmi < 35) return { label: 'Obesidad I', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' };
    if (bmi < 40) return { label: 'Obesidad II', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' };
    return { label: 'Obesidad III', color: 'text-red-800 dark:text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' };
  };

  // Fórmula US Navy para porcentaje de grasa corporal
  const getBodyFat = () => {
    if (gender === 'male') {
      return 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    } else {
      return 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
    }
  };

  const bodyFat = getBodyFat();
  const leanMass = weight * (1 - bodyFat / 100);
  const fatMass = weight - leanMass;

  const category = getBMICategory(bmi);

  return (
    <Card className="shadow-xl">
      <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-t-lg p-6">
        <CardTitle className="flex items-center gap-3">
          <User className="w-6 h-6" />
          Calculadora de IMC y Composición Corporal
        </CardTitle>
        <p className="text-sm text-pink-100 mt-2">
          Calcula tu IMC y estima tu composición corporal
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Datos Básicos */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Peso (kg)"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.1"
            />
            <Input
              type="number"
              label="Altura (cm)"
              value={height}
              onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
              min="0"
            />
            <Input
              type="number"
              label="Edad"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value) || 0)}
              min="0"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sexo
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setGender('male')}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    gender === 'male'
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  👨 Hombre
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    gender === 'female'
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  👩 Mujer
                </button>
              </div>
            </div>
          </div>

          {/* Medidas para % Grasa */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Medidas para % de Grasa Corporal (opcional)
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <Input
                type="number"
                label="Cuello (cm)"
                value={neck}
                onChange={(e) => setNeck(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
              <Input
                type="number"
                label="Cintura (cm)"
                value={waist}
                onChange={(e) => setWaist(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
              {gender === 'female' && (
                <Input
                  type="number"
                  label="Cadera (cm)"
                  value={hip}
                  onChange={(e) => setHip(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.1"
                />
              )}
            </div>
          </div>

          {/* Resultados IMC */}
          <div className={`p-6 rounded-xl border-2 ${category.bg} border-${category.color.split('-')[1]}-200 dark:border-${category.color.split('-')[1]}-800`}>
            <div className="text-center mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Índice de Masa Corporal (IMC)
              </div>
              <div className={`text-6xl font-bold ${category.color}`}>
                {bmi.toFixed(1)}
              </div>
              <div className={`text-lg font-semibold ${category.color} mt-2`}>
                {category.label}
              </div>
            </div>
            
            {/* Barra de IMC */}
            <div className="relative h-3 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 via-orange-400 to-red-400 rounded-full mt-4">
              <div
                className="absolute top-0 w-1 h-5 bg-gray-900 dark:bg-white rounded-full transform -translate-x-1/2 -translate-y-1"
                style={{ left: `${Math.min(Math.max((bmi - 15) / 25 * 100, 0), 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>15</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>40</span>
            </div>
          </div>

          {/* Composición Corporal */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {bodyFat.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Grasa Corporal
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                {fatMass.toFixed(1)} kg
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {leanMass.toFixed(1)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Masa Magra (kg)
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {((leanMass / weight) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {(weight / Math.pow(height / 100, 2) * 10).toFixed(1)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                FFMI
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                Fat-Free Mass Index
              </div>
            </div>
          </div>

          {/* Información */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
              ℹ️ Nota Importante
            </h4>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              El IMC es una guía general y no considera la composición corporal. 
              El % de grasa corporal es una estimación basada en la fórmula US Navy.
              Para resultados precisos, consulta con un profesional.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
