'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatBadge } from '@/components/shared/StatBadge';
import { ActionButton } from '@/components/shared/ActionButton';
import { Calendar, Clock, Dumbbell, TrendingUp, Trash2, Eye, RefreshCw } from '@/components/icons/lucide';
import type { WorkoutSession } from '@/types';

interface SessionCardProps {
  session: WorkoutSession;
  routineName?: string;
  isRoutineDeleted?: boolean;
  onView?: (session: WorkoutSession) => void;
  onEdit?: (session: WorkoutSession) => void;
  onDelete?: (session: WorkoutSession) => void;
  onSync?: (session: WorkoutSession) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function SessionCard({
  session,
  routineName,
  isRoutineDeleted = false,
  onView,
  onEdit,
  onDelete,
  onSync,
  showActions = true,
  compact = false
}: SessionCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const totalExercises = session.exercises.length;
  const totalSets = session.exercises.reduce((sum, ex) => sum + (ex.actualReps?.length || ex.completedSets || 0), 0);
  const totalVolume = session.totalVolume || session.exercises.reduce((total, ex) => {
    if (!ex.actualReps || !ex.actualWeight) return total;
    return total + ex.actualReps.reduce((sum, reps, idx) =>
      sum + reps * (ex.actualWeight?.[idx] || 0), 0);
  }, 0);

  return (
    <Card className={`hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-400 dark:hover:border-blue-500 ${
      isRoutineDeleted 
        ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10' 
        : 'border-gray-200 dark:border-gray-700'
    }`}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className={`text-lg font-bold ${
                isRoutineDeleted 
                  ? 'text-red-700 dark:text-red-400' 
                  : 'text-zinc-900 dark:text-zinc-100'
              }`}>
                {routineName || session.routineName || 'Entrenamiento Libre'}
              </h3>
              {isRoutineDeleted && (
                <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
                  Eliminada
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(session.date)}</span>
            </div>
          </div>
          {session.completedAt && (
            <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
              ✓ Completado
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-2 mb-4">
          <StatBadge
            icon={<Dumbbell className="w-4 h-4" />}
            value={totalExercises}
            label={`ejercicio${totalExercises !== 1 ? 's' : ''}`}
            color="blue"
            size="sm"
          />
          <StatBadge
            icon={<span className="text-xs">📊</span>}
            value={totalSets}
            label={`serie${totalSets !== 1 ? 's' : ''}`}
            color="emerald"
            size="sm"
          />
          {totalVolume > 0 && (
            <StatBadge
              icon={<TrendingUp className="w-4 h-4" />}
              value={`${totalVolume.toLocaleString()} kg`}
              label=""
              color="purple"
              size="sm"
            />
          )}
          {session.totalDuration && (
            <StatBadge
              icon={<Clock className="w-4 h-4" />}
              value={formatDuration(session.totalDuration)}
              label=""
              color="orange"
              size="sm"
            />
          )}
        </div>

        {/* Time info */}
        {!compact && session.startedAt && (
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            Iniciado: {formatTime(session.startedAt)}
            {session.completedAt && ` • Finalizado: ${formatTime(session.completedAt)}`}
          </div>
        )}

        {/* Exercise preview */}
        {!compact && session.exercises.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
              Ejercicios realizados:
            </div>
            <div className="space-y-1">
              {session.exercises.slice(0, 3).map((ex, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg p-2"
                >
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 w-5">
                    {idx + 1}.
                  </span>
                  <span className="flex-1 text-zinc-700 dark:text-zinc-300 font-medium truncate">
                    {ex.exerciseName || 'Ejercicio'}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {ex.actualReps?.length || ex.completedSets || 0} series
                  </span>
                </div>
              ))}
              {session.exercises.length > 3 && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                  +{session.exercises.length - 3} más
                </p>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {!compact && session.notes && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <span className="text-sm">📝</span>
              <p className="text-sm text-amber-900 dark:text-amber-200 flex-1">
                {session.notes}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(session)}
                className="flex-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
              >
                <Eye className="w-3.5 h-3.5" />
                Editar
              </Button>
            )}
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(session)}
                className="flex-1 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800"
              >
                <Eye className="w-3.5 h-3.5" />
                Ver
              </Button>
            )}
            {onSync && !isRoutineDeleted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSync(session)}
                className="flex-1 text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Sincronizar
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(session)}
                className="flex-1 text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
