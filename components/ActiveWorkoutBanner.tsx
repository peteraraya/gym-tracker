'use client';

import { useWorkout } from '@/context/WorkoutContext';
import { useRouter } from 'next/navigation';
import { Activity, X } from 'lucide-react';
import { Button } from './ui/Button';

export function ActiveWorkoutBanner() {
  const { activeWorkout, cancelWorkout } = useWorkout();
  const router = useRouter();

  if (!activeWorkout) return null;

  const handleContinue = () => {
    router.push(`/workout/${activeWorkout.routineId}`);
  };

  const handleCancel = () => {
    if (confirm('¿Cancelar entrenamiento activo? Se perderá todo el progreso.')) {
      cancelWorkout();
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 animate-pulse" />
          <div>
            <p className="font-semibold text-sm">
              Entrenamiento activo: {activeWorkout.routineName}
            </p>
            <p className="text-xs opacity-90">
              Ejercicio {activeWorkout.currentExerciseIndex + 1} · Serie {activeWorkout.currentSet}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleContinue}
            className="text-white hover:bg-white/20"
          >
            Continuar
          </Button>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Cancelar entrenamiento"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
