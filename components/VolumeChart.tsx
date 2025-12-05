'use client';

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { WorkoutSession } from '@/types';

interface VolumeChartProps {
  sessions: WorkoutSession[];
  period: 'week' | 'month';
}

export function VolumeChart({ sessions, period }: VolumeChartProps) {
  const chartData = useMemo(() => {
    const days = period === 'week' ? 7 : 30;
    const today = new Date();
    const data: Array<{ date: Date; volume: number; sessions: number }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const daySessions = sessions.filter(s => {
        const sessionDate = new Date(s.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === date.getTime();
      });

      const volume = daySessions.reduce((total, session) => {
        if (!session.exercises || !Array.isArray(session.exercises)) return total;
        return total + session.exercises.reduce((exTotal, ex) => {
          if (!ex.actualReps || !Array.isArray(ex.actualReps)) return exTotal;
          return exTotal + ex.actualReps.reduce((repTotal, reps, idx) => {
            return repTotal + (reps * (ex.actualWeight?.[idx] || 0));
          }, 0);
        }, 0);
      }, 0);

      data.push({ date, volume, sessions: daySessions.length });
    }

    return data;
  }, [sessions, period]);

  const maxVolume = Math.max(...chartData.map(d => d.volume), 1);
  const totalVolume = chartData.reduce((sum, d) => sum + d.volume, 0);
  const avgVolume = Math.round(totalVolume / chartData.length);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Volumen de Entrenamiento ({period === 'week' ? 'Última Semana' : 'Último Mes'})</CardTitle>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Promedio: <span className="font-bold text-blue-600 dark:text-blue-400">{avgVolume.toLocaleString()} kg</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Gráfica de barras */}
          <div className="flex items-end justify-between gap-1 h-48">
            {chartData.map((day, index) => {
              const height = maxVolume > 0 ? (day.volume / maxVolume) * 100 : 0;
              const isToday = new Date().toDateString() === day.date.toDateString();
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full h-full flex items-end">
                    <div
                      className={`w-full rounded-t-lg transition-all cursor-pointer ${
                        day.volume > 0
                          ? isToday
                            ? 'bg-gradient-to-t from-purple-600 to-purple-400 shadow-lg shadow-purple-500/30'
                            : 'bg-gradient-to-t from-blue-600 to-blue-400 group-hover:from-blue-700 group-hover:to-blue-500'
                          : 'bg-zinc-200 dark:bg-zinc-800'
                      }`}
                      style={{ height: `${height}%` }}
                      title={`${day.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}\nVolumen: ${day.volume.toLocaleString()} kg\nSesiones: ${day.sessions}`}
                    />
                    {day.volume > 0 && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs px-2 py-1 rounded whitespace-nowrap">
                          {day.volume.toLocaleString()} kg
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-500 text-center">
                    {day.date.toLocaleDateString('es-ES', { weekday: 'short' })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Total</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {totalVolume.toLocaleString()}
                <span className="text-sm text-zinc-500 dark:text-zinc-500 ml-1">kg</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Promedio</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {avgVolume.toLocaleString()}
                <span className="text-sm text-zinc-500 dark:text-zinc-500 ml-1">kg/día</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Sesiones</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {chartData.filter(d => d.sessions > 0).length}
                <span className="text-sm text-zinc-500 dark:text-zinc-500 ml-1">días</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
