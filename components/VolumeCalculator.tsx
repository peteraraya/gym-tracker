'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BarChart3, Plus, Trash2 } from '@/components/icons/lucide';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export default function VolumeCalculator() {
  const [exercises, setExercises] = useState<Exercise[]>([
    { id: '1', name: 'Press Banca', sets: 3, reps: 10, weight: 60 }
  ]);

  const addExercise = () => {
    setExercises([
      ...exercises,
      { id: Date.now().toString(), name: '', sets: 3, reps: 10, weight: 0 }
    ]);
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const updateExercise = (id: string, field: keyof Exercise, value: string | number) => {
    setExercises(exercises.map(ex =>
      ex.id === id ? { ...ex, [field]: value } : ex
    ));
  };

  const totalVolume = exercises.reduce((sum, ex) => 
    sum + (ex.sets * ex.reps * ex.weight), 0
  );

  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const totalReps = exercises.reduce((sum, ex) => sum + (ex.sets * ex.reps), 0);

  return (
    <Card className="shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg p-6">
        <CardTitle className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6" />
          Calculadora de Volumen de Entrenamiento
        </CardTitle>
        <p className="text-sm text-green-100 mt-2">
          Calcula el volumen total de tu sesión (Series × Reps × Peso)
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4 mb-6">
          {exercises.map((exercise, index) => (
            <div key={exercise.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                  #{index + 1}
                </span>
                <Input
                  type="text"
                  placeholder="Nombre del ejercicio"
                  value={exercise.name}
                  onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExercise(exercise.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  type="number"
                  label="Series"
                  value={exercise.sets}
                  onChange={(e) => updateExercise(exercise.id, 'sets', parseInt(e.target.value) || 0)}
                  min="0"
                />
                <Input
                  type="number"
                  label="Reps"
                  value={exercise.reps}
                  onChange={(e) => updateExercise(exercise.id, 'reps', parseInt(e.target.value) || 0)}
                  min="0"
                />
                <Input
                  type="number"
                  label="Peso (kg)"
                  value={exercise.weight}
                  onChange={(e) => updateExercise(exercise.id, 'weight', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.5"
                />
              </div>
              <div className="mt-2 text-right text-sm text-gray-600 dark:text-gray-400">
                Volumen: <span className="font-bold text-green-600 dark:text-green-400">
                  {(exercise.sets * exercise.reps * exercise.weight).toLocaleString()} kg
                </span>
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="secondary"
          onClick={addExercise}
          className="w-full mb-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Ejercicio
        </Button>

        <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {totalVolume.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Volumen Total (kg)
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {totalSets}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Series Totales
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {totalReps}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Reps Totales
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
