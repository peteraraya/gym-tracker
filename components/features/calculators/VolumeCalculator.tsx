'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BarChart3, Plus, Trash2 } from '@/components/icons/lucide';
import CalculatorShell from './CalculatorShell';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export default function VolumeCalculator() {
  const [exercises, setExercises] = useState<Exercise[]>([
    { id: '1', name: 'Press Banca', sets: 3, reps: 10, weight: 60 },
  ]);

  const addExercise = useCallback(() => {
    setExercises((prev) => [
      ...prev,
      { id: Date.now().toString(), name: '', sets: 3, reps: 10, weight: 0 },
    ]);
  }, []);

  const removeExercise = useCallback((id: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
  }, []);

  const updateExercise = useCallback((id: string, field: keyof Exercise, value: string | number) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex)),
    );
  }, []);

  const totals = useMemo(() => {
    const volume = exercises.reduce((sum, ex) => sum + ex.sets * ex.reps * ex.weight, 0);
    const sets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
    const reps = exercises.reduce((sum, ex) => sum + ex.sets * ex.reps, 0);
    return { volume, sets, reps };
  }, [exercises]);

  return (
    <CalculatorShell
      title="Volumen de Entrenamiento"
      subtitle="Calcula el volumen total de tu sesión (Series × Repeticiones × Peso)"
      icon={<BarChart3 className="w-6 h-6" />}
      gradientStart="bg-emerald-500"
      gradientEnd="to-teal-600"
    >
      <div className="space-y-4">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-400">Ejercicio</span>
                <Input
                  type="text"
                  placeholder="Nombre del ejercicio"
                  value={exercise.name}
                  onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                  className="flex-1 bg-zinc-900 border-zinc-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeExercise(exercise.id)}
                className="text-zinc-500 hover:text-red-400"
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
                className="bg-zinc-900 border-zinc-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500"
              />
              <Input
                type="number"
                label="Reps"
                value={exercise.reps}
                onChange={(e) => updateExercise(exercise.id, 'reps', parseInt(e.target.value) || 0)}
                min="0"
                className="bg-zinc-900 border-zinc-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500"
              />
              <Input
                type="number"
                label="Peso (kg)"
                value={exercise.weight}
                onChange={(e) => updateExercise(exercise.id, 'weight', parseFloat(e.target.value) || 0)}
                step="0.5"
                min="0"
                className="bg-zinc-900 border-zinc-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-700/50">
              <span className="text-sm text-zinc-400">Volumen del ejercicio:</span>
              <span className="text-lg font-bold text-emerald-400">
                {(exercise.sets * exercise.reps * exercise.weight).toLocaleString()} kg
              </span>
            </div>
          </div>
        ))}

        <div className="pt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={addExercise}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Ejercicio
          </Button>
        </div>

        {/* Totales */}
        <div className="mt-6 bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-emerald-400">{totals.volume.toLocaleString()}</div>
              <div className="text-xs text-zinc-500 mt-1">Volumen Total (kg)</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-400">{totals.sets}</div>
              <div className="text-xs text-zinc-500 mt-1">Series Totales</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">{totals.reps}</div>
              <div className="text-xs text-zinc-500 mt-1">Repeticiones Totales</div>
            </div>
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}
