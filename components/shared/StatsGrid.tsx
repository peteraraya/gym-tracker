'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  subtitle?: string;
  trend?: number | { isPositive: boolean; value: number };
  /** Predefined color key (ignored if `gradientClass` is provided) */
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink';
  /** Custom gradient/class to apply instead of the predefined `color` classes */
  gradientClass?: string;
  /** Optional extra className to apply to the outer Card */
  className?: string;
  /** Optional override for icon color classes */
  iconClassName?: string;
  loading?: boolean;
}

const colorClasses = {
  blue: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
  green: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
  purple: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
  orange: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
  red: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
  pink: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'
};

const iconColorClasses = {
  blue: 'text-blue-500',
  green: 'text-green-500',
  purple: 'text-purple-500',
  orange: 'text-orange-500',
  red: 'text-red-500',
  pink: 'text-blue-500'
};

export function StatCard({
  title,
  value,
  icon,
  subtitle,
  trend,
  color = 'blue',
  gradientClass,
  className,
  iconClassName,
  loading = false
}: StatCardProps) {
  const gradient = gradientClass ?? colorClasses[color];

  let trendIsPositive = false;
  let trendVal = 0;
  if (trend !== undefined) {
    if (typeof trend === 'number') {
      trendIsPositive = trend >= 0;
      trendVal = Math.abs(trend);
    } else {
      trendIsPositive = trend.isPositive;
      trendVal = Math.abs(trend.value);
    }
  }

  const iconClass = `${iconColorClasses[color]} ${iconClassName ?? ''}`.trim();

  return (
    <Card className={`relative overflow-hidden group border-0 ${className ?? ''}`}>
      <div className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-15 group-hover:opacity-25 transition-opacity`} />

      <div className="relative">
        <CardContent className="flex items-start justify-between p-6 pb-2">
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-24 mb-1" />
            ) : (
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
            )}
          </div>

          <div className={`text-3xl p-2.5 rounded-xl bg-linear-to-br ${gradient} bg-opacity-10 group-hover:scale-110 transition-transform ${iconClass}`}>
            {icon}
          </div>
        </CardContent>

        <div className="px-6 pb-6 h-12 flex flex-col justify-end">
          {loading ? (
            <div className="space-y-2 mt-2">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ) : (
            <>
              {subtitle && (
                <p className="text-xs text-zinc-500 dark:text-zinc-500 line-clamp-2">{subtitle}</p>
              )}
              {trend !== undefined && (
                <div className="flex items-center gap-1 text-sm mt-1">
                  <span className={trendIsPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                    {trendIsPositive ? '↗' : '↘'} {trendVal}%
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-500 text-xs">vs mes anterior</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

interface StatsGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
}

export function StatsGrid({ children, columns = 4 }: StatsGridProps) {
  const colClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }[columns];

  return (
    <div className={`grid ${colClass} gap-4`}>
      {children}
    </div>
  );
}
