'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { WorkoutSession } from '@/types';
import { Trophy, TrendingUp } from 'lucide-react';

interface PersonalRecordsProps {
  sessions: WorkoutSession[];
}

interface PersonalRecord {
  exerciseName: string;
  maxWeight: number;
  reps: number;
  date: Date;
  estimated1RM: number;
}

/**
 * Calcula el 1RM estimado usando la fórmula de Epley
 * 1RM = peso × (1 + 0.0333 × reps)
 */
const calculate1RM = (weight: number, reps: number): number => {
  if (reps === 1) return weight;
  return weight * (1 + 0.0333 * reps);
};

export const PersonalRecords: React.FC<PersonalRecordsProps> = ({ sessions }) => {
  // Calcular récords personales
  const records = React.useMemo(() => {
    const recordsMap = new Map<string, PersonalRecord>();

    sessions.forEach(session => {
      if (!session.exercises || !Array.isArray(session.exercises)) return;
      session.exercises.forEach(ex => {
        const exerciseName = ex.exerciseName || ex.exerciseId;

        if (!ex.actualReps || !Array.isArray(ex.actualReps)) return;
        if (!ex.actualWeight || !Array.isArray(ex.actualWeight)) return;

        ex.actualReps.forEach((reps, idx) => {
          const weight = ex.actualWeight[idx] || 0;
          
          if (weight > 0 && reps > 0) {
            const estimated1RM = calculate1RM(weight, reps);
            
            const existing = recordsMap.get(exerciseName);
            
            if (!existing || estimated1RM > existing.estimated1RM) {
              recordsMap.set(exerciseName, {
                exerciseName,
                maxWeight: weight,
                reps,
                date: session.date,
                estimated1RM
              });
            }
          }
        });
      });
    });

    // Convertir a array y ordenar por 1RM estimado
    return Array.from(recordsMap.values())
      .sort((a, b) => b.estimated1RM - a.estimated1RM)
      .slice(0, 10); // Top 10
  }, [sessions]);

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Récords Personales (PR)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No hay récords aún. ¡Completa entrenamientos para establecer tus PRs!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Récords Personales (PR)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {records.map((record, index) => (
            <div
              key={record.exerciseName}
              className={`p-4 rounded-lg border-2 ${
                index === 0
                  ? 'bg-linear-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-400'
                  : index === 1
                    ? 'bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 border-gray-400'
                    : index === 2
                      ? 'bg-linear-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-400'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {index < 3 && (
                    <div className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {record.exerciseName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(record.date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {record.maxWeight} kg × {record.reps}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>1RM: ~{Math.round(record.estimated1RM)} kg</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Información sobre 1RM */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-900 dark:text-blue-100">
            💡 <strong>1RM (Una Repetición Máxima):</strong> Es el peso máximo que podrías levantar en una sola repetición.
            Se estima usando la fórmula de Epley basada en tus mejores series.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
