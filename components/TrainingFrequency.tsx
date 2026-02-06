'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { WorkoutSession } from '@/types';
import { Calendar } from 'lucide-react';

interface TrainingFrequencyProps {
  sessions: WorkoutSession[];
}

export const TrainingFrequency: React.FC<TrainingFrequencyProps> = ({ sessions }) => {
  const stats = React.useMemo(() => {
    if (sessions.length === 0) {
      return {
        thisWeek: 0,
        lastWeek: 0,
        avgPerWeek: 0,
        avgPerMonth: 0,
        mostActiveDay: 'N/A',
        totalWeeks: 0
      };
    }

    const now = new Date();
    const today = now.setHours(0, 0, 0, 0);
    const weekAgo = today - 7 * 24 * 60 * 60 * 1000;
    const twoWeeksAgo = today - 14 * 24 * 60 * 60 * 1000;

    // Sesiones esta semana
    const thisWeek = sessions.filter(s => {
      const date = new Date(s.date).setHours(0, 0, 0, 0);
      return date >= weekAgo && date <= today;
    }).length;

    // Sesiones semana pasada
    const lastWeek = sessions.filter(s => {
      const date = new Date(s.date).setHours(0, 0, 0, 0);
      return date >= twoWeeksAgo && date < weekAgo;
    }).length;

    // Calcular promedio por semana
    const oldestSession = new Date(
      Math.min(...sessions.map(s => new Date(s.date).getTime()))
    );
    const daysDiff = Math.ceil((now.getTime() - oldestSession.getTime()) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.max(daysDiff / 7, 1);
    const avgPerWeek = sessions.length / totalWeeks;
    const avgPerMonth = avgPerWeek * 4.33; // Promedio de semanas en un mes

    // Día más activo
    const dayCount: Record<string, number> = {};
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    sessions.forEach(s => {
      const day = new Date(s.date).getDay();
      const dayName = dayNames[day];
      dayCount[dayName] = (dayCount[dayName] || 0) + 1;
    });

    const mostActiveDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      thisWeek,
      lastWeek,
      avgPerWeek: Math.round(avgPerWeek * 10) / 10,
      avgPerMonth: Math.round(avgPerMonth * 10) / 10,
      mostActiveDay,
      totalWeeks: Math.round(totalWeeks)
    };
  }, [sessions]);

  const weekTrend = stats.thisWeek - stats.lastWeek;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Frecuencia de Entrenamiento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Esta semana */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-blue-800 dark:text-blue-200 mb-1">
              Esta Semana
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.thisWeek}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                sesiones
              </div>
            </div>
            {weekTrend !== 0 && (
              <div className={`text-xs mt-1 flex items-center gap-1 ${
                weekTrend > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {weekTrend > 0 ? '↗' : '↘'}
                <span>{Math.abs(weekTrend)} vs semana anterior</span>
              </div>
            )}
          </div>

          {/* Semana pasada */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Semana Pasada
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.lastWeek}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                sesiones
              </div>
            </div>
          </div>

          {/* Promedio semanal */}
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-sm text-purple-800 dark:text-purple-200 mb-1">
              Promedio Semanal
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.avgPerWeek}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">
                sesiones
              </div>
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              últimas {stats.totalWeeks} semanas
            </div>
          </div>

          {/* Promedio mensual */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-sm text-green-800 dark:text-green-200 mb-1">
              Promedio Mensual
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.avgPerMonth}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                sesiones
              </div>
            </div>
          </div>
        </div>

        {/* Día más activo */}
        <div className="mt-4 p-4 bg-linear-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-orange-800 dark:text-orange-200 mb-1">
                Tu día favorito para entrenar
              </div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.mostActiveDay}
              </div>
            </div>
            <div className="text-4xl">
              📅
            </div>
          </div>
        </div>

        {/* Recomendaciones */}
        {stats.avgPerWeek < 3 && sessions.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              💡 <strong>Consejo:</strong> Para mejores resultados, intenta entrenar al menos 3-4 veces por semana.
            </p>
          </div>
        )}

        {stats.avgPerWeek >= 5 && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-xs text-green-800 dark:text-green-200">
              🔥 <strong>¡Excelente!</strong> Mantienes una frecuencia de entrenamiento muy buena. ¡Sigue así!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
