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

  // Rangos saludables de % de grasa según edad y sexo
  const getBodyFatCategory = (bf: number, gender: 'male' | 'female', age: number) => {
    let ranges;
    if (gender === 'male') {
      if (age < 30) {
        ranges = { essential: 5, athlete: 10, fitness: 14, average: 18, obese: 25 };
      } else if (age < 40) {
        ranges = { essential: 5, athlete: 11, fitness: 16, average: 21, obese: 25 };
      } else if (age < 50) {
        ranges = { essential: 5, athlete: 12, fitness: 18, average: 23, obese: 25 };
      } else {
        ranges = { essential: 5, athlete: 13, fitness: 20, average: 25, obese: 30 };
      }
    } else {
      if (age < 30) {
        ranges = { essential: 13, athlete: 18, fitness: 22, average: 25, obese: 32 };
      } else if (age < 40) {
        ranges = { essential: 13, athlete: 19, fitness: 23, average: 27, obese: 33 };
      } else if (age < 50) {
        ranges = { essential: 13, athlete: 21, fitness: 25, average: 30, obese: 35 };
      } else {
        ranges = { essential: 13, athlete: 22, fitness: 27, average: 32, obese: 38 };
      }
    }

    if (bf < ranges.essential) return { label: 'Muy Bajo (Riesgo)', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' };
    if (bf < ranges.athlete) return { label: 'Atleta', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' };
    if (bf < ranges.fitness) return { label: 'Fitness', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' };
    if (bf < ranges.average) return { label: 'Promedio', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
    if (bf < ranges.obese) return { label: 'Sobrepeso', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' };
    return { label: 'Obesidad', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' };
  };

  const bfCategory = getBodyFatCategory(bodyFat, gender, age);

  // Peso ideal según % de grasa objetivo
  const getIdealWeight = (targetBF: number) => {
    return leanMass / (1 - targetBF / 100);
  };

  // FFMI (Fat-Free Mass Index) - Índice de masa libre de grasa
  const ffmi = leanMass / Math.pow(height / 100, 2);
  const normalizedFFMI = ffmi + 6.1 * (1.8 - height / 100); // Normalizado a 1.8m

  const getFFMICategory = (ffmi: number, gender: 'male' | 'female') => {
    if (gender === 'male') {
      if (ffmi < 18) return { label: 'Por debajo del promedio', color: 'text-blue-600' };
      if (ffmi < 20) return { label: 'Promedio', color: 'text-green-600' };
      if (ffmi < 22) return { label: 'Por encima del promedio', color: 'text-green-600' };
      if (ffmi < 25) return { label: 'Excelente', color: 'text-purple-600' };
      if (ffmi < 26) return { label: 'Superior (límite natural)', color: 'text-orange-600' };
      return { label: 'Excepcional', color: 'text-red-600' };
    } else {
      if (ffmi < 15) return { label: 'Por debajo del promedio', color: 'text-blue-600' };
      if (ffmi < 17) return { label: 'Promedio', color: 'text-green-600' };
      if (ffmi < 18) return { label: 'Por encima del promedio', color: 'text-green-600' };
      if (ffmi < 20) return { label: 'Excelente', color: 'text-purple-600' };
      if (ffmi < 21) return { label: 'Superior', color: 'text-orange-600' };
      return { label: 'Excepcional', color: 'text-red-600' };
    }
  };

  const ffmiCategory = getFFMICategory(normalizedFFMI, gender);

  return (
    <Card className="shadow-xl">
      <CardHeader className="bg-linear-to-r from-pink-500 to-rose-600 text-white rounded-t-lg p-6">
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
              value={weight === 0 ? '' : weight}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setWeight(0);
                } else {
                  const num = parseFloat(val);
                  setWeight(isNaN(num) ? 0 : Math.max(0, num));
                }
              }}
              min="0"
              step="0.1"
              placeholder="Tu peso"
            />
            <Input
              type="number"
              label="Altura (cm)"
              value={height === 0 ? '' : height}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setHeight(0);
                } else {
                  const num = parseFloat(val);
                  setHeight(isNaN(num) ? 0 : Math.max(0, num));
                }
              }}
              min="0"
              placeholder="Tu altura"
            />
            <Input
              type="number"
              label="Edad"
              value={age === 0 ? '' : age}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setAge(0);
                } else {
                  const num = parseInt(val);
                  setAge(isNaN(num) ? 0 : Math.max(0, num));
                }
              }}
              min="0"
              placeholder="Tu edad"
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
                value={neck === 0 ? '' : neck}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setNeck(0);
                  } else {
                    const num = parseFloat(val);
                    setNeck(isNaN(num) ? 0 : Math.max(0, num));
                  }
                }}
                min="0"
                step="0.1"
                placeholder="Medida"
              />
              <Input
                type="number"
                label="Cintura (cm)"
                value={waist === 0 ? '' : waist}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setWaist(0);
                  } else {
                    const num = parseFloat(val);
                    setWaist(isNaN(num) ? 0 : Math.max(0, num));
                  }
                }}
                min="0"
                step="0.1"
                placeholder="Medida"
              />
              {gender === 'female' && (
                <Input
                  type="number"
                  label="Cadera (cm)"
                  value={hip === 0 ? '' : hip}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setHip(0);
                    } else {
                      const num = parseFloat(val);
                      setHip(isNaN(num) ? 0 : Math.max(0, num));
                    }
                  }}
                  min="0"
                  step="0.1"
                  placeholder="Medida"
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
            <div className="relative h-3 bg-linear-to-r from-blue-400 via-green-400 via-yellow-400 via-orange-400 to-red-400 rounded-full mt-4">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border-2 ${bfCategory.bg} border-${bfCategory.color.split('-')[1]}-200`}>
              <div className="text-3xl font-bold ${bfCategory.color}">
                {bodyFat.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Grasa Corporal
              </div>
              <div className={`text-xs font-semibold ${bfCategory.color} mt-1`}>
                {bfCategory.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {fatMass.toFixed(1)} kg
              </div>
            </div>
            <div className="p-4 bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
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
            <div className="p-4 bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {normalizedFFMI.toFixed(1)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                FFMI Normalizado
              </div>
              <div className={`text-xs font-semibold ${ffmiCategory.color} mt-1`}>
                {ffmiCategory.label}
              </div>
            </div>
          </div>

          {/* Rangos de % de Grasa Saludable */}
          <div className="p-4 bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-3">
              📊 Rangos de % de Grasa Corporal ({gender === 'male' ? 'Hombres' : 'Mujeres'}, {age} años)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
              <div className="text-center p-2 bg-red-100 dark:bg-red-900/30 rounded">
                <div className="font-bold text-red-700 dark:text-red-300">Esencial</div>
                <div className="text-xs text-red-600 dark:text-red-400">
                  {gender === 'male' ? '2-5%' : '10-13%'}
                </div>
              </div>
              <div className="text-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
                <div className="font-bold text-blue-700 dark:text-blue-300">Atleta</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  {gender === 'male' 
                    ? age < 30 ? '6-10%' : age < 40 ? '6-11%' : age < 50 ? '6-12%' : '6-13%'
                    : age < 30 ? '14-18%' : age < 40 ? '14-19%' : age < 50 ? '14-21%' : '14-22%'
                  }
                </div>
              </div>
              <div className="text-center p-2 bg-green-100 dark:bg-green-900/30 rounded">
                <div className="font-bold text-green-700 dark:text-green-300">Fitness</div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  {gender === 'male' 
                    ? age < 30 ? '11-14%' : age < 40 ? '12-16%' : age < 50 ? '13-18%' : '14-20%'
                    : age < 30 ? '19-22%' : age < 40 ? '20-23%' : age < 50 ? '22-25%' : '23-27%'
                  }
                </div>
              </div>
              <div className="text-center p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                <div className="font-bold text-yellow-700 dark:text-yellow-300">Promedio</div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400">
                  {gender === 'male' 
                    ? age < 30 ? '15-18%' : age < 40 ? '17-21%' : age < 50 ? '19-23%' : '21-25%'
                    : age < 30 ? '23-25%' : age < 40 ? '24-27%' : age < 50 ? '26-30%' : '28-32%'
                  }
                </div>
              </div>
              <div className="text-center p-2 bg-orange-100 dark:bg-orange-900/30 rounded">
                <div className="font-bold text-orange-700 dark:text-orange-300">Obesidad</div>
                <div className="text-xs text-orange-600 dark:text-orange-400">
                  {gender === 'male' 
                    ? age < 50 ? '>25%' : '>30%'
                    : age < 30 ? '>32%' : age < 40 ? '>33%' : age < 50 ? '>35%' : '>38%'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Peso Ideal según Objetivos */}
          <div className="p-4 bg-linear-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
            <h4 className="font-semibold text-cyan-900 dark:text-cyan-100 mb-3">
              🎯 Peso Ideal según % de Grasa Objetivo
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {gender === 'male' ? (
                <>
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Atleta (10%)</div>
                    <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                      {getIdealWeight(10).toFixed(1)} kg
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {(weight - getIdealWeight(10)) > 0 ? '-' : '+'}{Math.abs(weight - getIdealWeight(10)).toFixed(1)} kg
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Fitness (15%)</div>
                    <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                      {getIdealWeight(15).toFixed(1)} kg
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {(weight - getIdealWeight(15)) > 0 ? '-' : '+'}{Math.abs(weight - getIdealWeight(15)).toFixed(1)} kg
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Promedio (18%)</div>
                    <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                      {getIdealWeight(18).toFixed(1)} kg
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {(weight - getIdealWeight(18)) > 0 ? '-' : '+'}{Math.abs(weight - getIdealWeight(18)).toFixed(1)} kg
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Saludable (20%)</div>
                    <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                      {getIdealWeight(20).toFixed(1)} kg
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {(weight - getIdealWeight(20)) > 0 ? '-' : '+'}{Math.abs(weight - getIdealWeight(20)).toFixed(1)} kg
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Atleta (18%)</div>
                    <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                      {getIdealWeight(18).toFixed(1)} kg
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {(weight - getIdealWeight(18)) > 0 ? '-' : '+'}{Math.abs(weight - getIdealWeight(18)).toFixed(1)} kg
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Fitness (22%)</div>
                    <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                      {getIdealWeight(22).toFixed(1)} kg
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {(weight - getIdealWeight(22)) > 0 ? '-' : '+'}{Math.abs(weight - getIdealWeight(22)).toFixed(1)} kg
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Promedio (25%)</div>
                    <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                      {getIdealWeight(25).toFixed(1)} kg
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {(weight - getIdealWeight(25)) > 0 ? '-' : '+'}{Math.abs(weight - getIdealWeight(25)).toFixed(1)} kg
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Saludable (28%)</div>
                    <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                      {getIdealWeight(28).toFixed(1)} kg
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {(weight - getIdealWeight(28)) > 0 ? '-' : '+'}{Math.abs(weight - getIdealWeight(28)).toFixed(1)} kg
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Información sobre FFMI */}
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
              💪 Sobre el FFMI (Fat-Free Mass Index)
            </h4>
            <p className="text-sm text-purple-800 dark:text-purple-200 mb-2">
              El FFMI mide tu masa muscular relativa a tu altura. Es útil para evaluar tu desarrollo muscular.
            </p>
            <div className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
              <p>• <strong>FFMI actual:</strong> {ffmi.toFixed(1)} | <strong>Normalizado:</strong> {normalizedFFMI.toFixed(1)}</p>
              <p>• <strong>Límite natural:</strong> ~25 para hombres, ~21 para mujeres</p>
              <p>• <strong>Tu categoría:</strong> {ffmiCategory.label}</p>
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
