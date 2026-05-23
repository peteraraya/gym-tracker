'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dumbbell, Activity, Play, Pencil, Copy, Trash2, Flame } from '@/components/icons/lucide';
import { Spinner } from '@/components/ui/Spinner';
import { APP_CONFIG } from '@/config/app.config';
import type { Routine } from '@/types';

// Keyword map ligero: ejercicio → grupo muscular
const MUSCLE_KEYWORDS: Array<[string[], string]> = [
  [['pecho', 'press banca', 'apertura pecho', 'chest', 'bench', 'fondos pecho', 'flye', 'aperturas'], 'pecho'],
  [['espalda', 'jalón', 'remo', 'dominada', 'pull-up', 'pulldown', 'pull up', 'row', 'peso muerto rumano', 'remo con barra'], 'espalda'],
  [['pierna', 'sentadilla', 'prensa', 'leg press', 'squat', 'zancada', 'lunges', 'cuádricep', 'femoral', 'curl femoral', 'extensión de piernas'], 'piernas'],
  [['hombro', 'press militar', 'elevación lateral', 'lateral raise', 'shoulder', 'deltoid', 'elevaciones'], 'hombros'],
  [['bícep', 'curl', 'bicep', 'martillo', 'hammer curl', 'curl con barra', 'curl alterno'], 'biceps'],
  [['trícep', 'extensión', 'tricep', 'skull crusher', 'press francés', 'jalón de polea para trícep'], 'triceps'],
  [['glúteo', 'hip thrust', 'peso muerto', 'deadlift', 'glute bridge', 'patada trasera'], 'gluteos'],
  [['core', 'abdom', 'plancha', 'crunch', 'abdomen', 'oblicuo', 'plank', 'sit-up', 'leg raise'], 'core'],
  [['gemelo', 'calf', 'pantorrilla', 'elevación de talones'], 'gemelos'],
  [['cardio', 'correr', 'cinta', 'bicicleta', 'elíptica', 'hiit', 'sprint'], 'cardio'],
  [['trapecio', 'encogimiento', 'shrug'], 'trapecio'],
  [['antebrazo', 'forearm', 'muñeca'], 'antebrazos'],
];

function detectPrimaryMuscle(routine: Routine): string | null {
  const counts: Record<string, number> = {};
  routine.exercises.forEach(ex => {
    const name = ex.name.toLowerCase();
    for (const [keywords, group] of MUSCLE_KEYWORDS) {
      if (keywords.some(kw => name.includes(kw))) {
        counts[group] = (counts[group] || 0) + 1;
        break;
      }
    }
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? null;
}

interface RoutineCardProps {
  routine: Routine;
  isActive?: boolean;
  isStarting?: boolean;
  isDuplicating?: boolean;
  onStart: (routineId: string) => void;
  onEdit: (routineId: string) => void;
  onDuplicate: (routineId: string) => void;
  onDelete: (routineId: string) => void;
  compact?: boolean; // Para versión compacta en dashboard
}

export function RoutineCard({
  routine,
  isActive = false,
  isStarting = false,
  isDuplicating = false,
  onStart,
  onEdit,
  onDuplicate,
  onDelete,
  compact = false
}: RoutineCardProps) {
  const totalExercises = routine.exercises.length;
  const totalSeries = routine.exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0);
  const primaryMuscle = useMemo(() => detectPrimaryMuscle(routine), [routine]);
  const accentColor = primaryMuscle
    ? (APP_CONFIG.muscleGroupColors as Record<string, string>)[primaryMuscle]
    : undefined;

  return (
    <Card
      className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-indigo-400 dark:hover:border-indigo-500 bg-linear-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10 overflow-hidden"
      style={accentColor ? { borderLeft: `4px solid ${accentColor}` } : undefined}
    >
      <CardContent className="p-5">
        {/* Active workout badge */}
        {isActive && (
          <div className="absolute top-3 right-3 z-20">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
              <Flame className="w-3 h-3" />
              Activo
            </span>
          </div>
        )}

        {/* Header con título */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {routine.name}
            </h3>
          </div>
        </div>

        {/* Descripción */}
        {routine.description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
            {routine.description}
          </p>
        )}

        {/* Stats rápidas */}
        <div className="flex items-center gap-3 mb-4 text-sm flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <Dumbbell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-blue-700 dark:text-blue-300">
              {totalExercises}
            </span>
            <span className="text-blue-600 dark:text-blue-400 text-xs">
              ejercicio{totalExercises !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-emerald-700 dark:text-emerald-300">
              {totalSeries}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 text-xs">
              series
            </span>
          </div>
        </div>

        {/* Lista de ejercicios (primeros 3) */}
        <div className="space-y-2 mb-4 flex-1">
          {routine.exercises.slice(0, 3).map((exercise, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-2 text-sm bg-white/50 dark:bg-gray-700/30 rounded-lg p-2"
            >
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 w-5">
                {idx + 1}.
              </span>
              <span className="flex-1 text-zinc-700 dark:text-zinc-300 font-medium truncate">
                {exercise.name}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {exercise.sets?.length || 0} series
              </span>
            </div>
          ))}
          {routine.exercises.length > 3 && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
              +{routine.exercises.length - 3} más
            </p>
          )}
        </div>

        {/* Botón de acción principal */}
        <Button
          variant="gradient"
          onClick={() => onStart(routine.id)}
          disabled={isStarting}
          className="w-full gap-2 shadow-lg hover:shadow-xl transition-all bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 mb-2"
        >
          {isStarting ? (
            <>
              <Spinner size="sm" />
              Iniciando...
            </>
            
          ) : isActive ? (
            <>
              <Flame className="w-4 h-4" />
              Continuar
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Iniciar Entrenamiento
            </>
          )}
        </Button>

        {/* Botones secundarios */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(routine.id)}
            className="flex-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
          >
            <Pencil className="w-3.5 h-3.5" />
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(routine.id)}
            disabled={isDuplicating}
            className="flex-1 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800"
          >
            {isDuplicating ? (
              <>
                <Spinner size="xs" />
                Duplicando...
              </>
            
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Duplicar
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(routine.id)}
            className="flex-1 text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
