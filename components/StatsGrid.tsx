'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: number;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink';
  loading?: boolean;
}

const colorClasses = {
  blue: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
  green: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
  purple: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
  orange: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
  red: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
  pink: 'from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20'
};

const iconColorClasses = {
  blue: 'text-blue-500',
  green: 'text-green-500',
  purple: 'text-purple-500',
  orange: 'text-orange-500',
  red: 'text-red-500',
  pink: 'text-pink-500'
};

export function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  loading = false
}: StatCardProps) {
  return (
    <Card className={`bg-linear-to-br ${colorClasses[color]} border-0`}>
      <CardContent className="flex items-center justify-between p-6">
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            {loading ? '...' : value}
          </p>
          {trend !== undefined && (
            <p className={`text-xs mt-2 font-semibold ${
              trend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        {icon && (
          <div className={`text-3xl opacity-20 ${iconColorClasses[color]}`}>
            {icon}
          </div>
        )}
      </CardContent>
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
