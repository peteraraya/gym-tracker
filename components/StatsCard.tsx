'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient?: string;
}

export function StatsCard({ title, value, icon, subtitle, trend, gradient = 'from-blue-600 to-blue-500' }: StatsCardProps) {
  return (
    <Card className="relative overflow-hidden group">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {value}
            </p>
          </div>
          <div className={`text-4xl p-3 rounded-2xl bg-gradient-to-br ${gradient} bg-opacity-10 group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
        </div>

        {subtitle && (
          <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-2">
            {subtitle}
          </p>
        )}

        {trend && (
          <div className="flex items-center gap-1 text-sm">
            <span className={trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </span>
            <span className="text-zinc-500 dark:text-zinc-500 text-xs">
              vs mes anterior
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
