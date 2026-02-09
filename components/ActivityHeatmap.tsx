'use client';

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useTranslations, useLocale } from '@/context/LocaleContext';

interface ActivityHeatmapProps {
  sessions: Array<{
    date: Date;
  }>;
}

export function ActivityHeatmap({ sessions }: ActivityHeatmapProps) {
  const t = useTranslations('dashboard.activityHeatmap');
  const { locale } = useLocale();
  const tDashboard = useTranslations('dashboard');
  const heatmapData = useMemo(() => {
    // Últimos 90 días
    const days = 90;
    const today = new Date();
    const data: Array<{ date: Date; count: number; level: number }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const count = sessions.filter(s => {
        const sessionDate = new Date(s.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === date.getTime();
      }).length;

      // Nivel de intensidad (0-4)
      const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count >= 3 ? 3 : 4;

      data.push({ date, count, level });
    }

    return data;
  }, [sessions]);

  const weeks = useMemo(() => {
    const result: typeof heatmapData[] = [];
    for (let i = 0; i < heatmapData.length; i += 7) {
      result.push(heatmapData.slice(i, i + 7));
    }
    return result;
  }, [heatmapData]);

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-zinc-100 dark:bg-zinc-800';
      case 1: return 'bg-emerald-200 dark:bg-emerald-900';
      case 2: return 'bg-emerald-400 dark:bg-emerald-700';
      case 3: return 'bg-emerald-600 dark:bg-emerald-500';
      case 4: return 'bg-emerald-800 dark:bg-emerald-400';
      default: return 'bg-zinc-100 dark:bg-zinc-800';
    }
  };

  const totalDays = heatmapData.filter(d => d.count > 0).length;
  const currentStreak = useMemo(() => {
    let streak = 0;
    for (let i = heatmapData.length - 1; i >= 0; i--) {
      if (heatmapData[i].count > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [heatmapData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('title')}</CardTitle>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-zinc-600 dark:text-zinc-400">{t('currentStreak')}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                🔥 {currentStreak} {tDashboard('statsCards.days')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-600 dark:text-zinc-400">{t('activeDays')}</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {totalDays} / {heatmapData.length}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Heatmap */}
          <div className="flex gap-1 overflow-x-auto pb-2">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`w-3 h-3 rounded-sm ${getLevelColor(day.level)} transition-all hover:ring-2 hover:ring-blue-500 cursor-pointer`}
                    title={`${day.date.toLocaleDateString(locale)} - ${day.count} ${day.count !== 1 ? t('sessionsPlural') : t('sessionSingular')}`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Leyenda */}
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500">
            <span>{t('less')}</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-sm ${getLevelColor(level)}`}
                />
              ))}
            </div>
            <span>{t('more')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
