'use client';

import { ReactNode } from 'react';

type StatBadgeColor = 'blue' | 'emerald' | 'purple' | 'orange' | 'red' | 'amber';

interface StatBadgeProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  color?: StatBadgeColor;
  size?: 'sm' | 'md' | 'lg';
  /** Custom gradient/class to apply instead of the predefined `color` classes */
  gradientClass?: string;
  /** Optional extra className to apply to the outer container */
  className?: string;
  /** Optional extra classes for the icon container */
  iconClassName?: string;
}

const colorClasses: Record<StatBadgeColor, string> = {
  blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300',
  emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
  purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800 text-purple-700 dark:text-purple-300',
  orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800 text-orange-700 dark:text-orange-300',
  red: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-700 dark:text-red-300',
  amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800 text-amber-700 dark:text-amber-300'
};

const iconColorClasses: Record<StatBadgeColor, string> = {
  blue: 'text-blue-600 dark:text-blue-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  purple: 'text-purple-600 dark:text-purple-400',
  orange: 'text-orange-600 dark:text-orange-400',
  red: 'text-red-600 dark:text-red-400',
  amber: 'text-amber-600 dark:text-amber-400'
};

const labelColorClasses: Record<StatBadgeColor, string> = {
  blue: 'text-blue-600 dark:text-blue-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  purple: 'text-purple-600 dark:text-purple-400',
  orange: 'text-orange-600 dark:text-orange-400',
  red: 'text-red-600 dark:text-red-400',
  amber: 'text-amber-600 dark:text-amber-400'
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs gap-1',
  md: 'px-3 py-1.5 text-sm gap-1.5',
  lg: 'px-4 py-2 text-base gap-2'
};

const iconSizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
};

export function StatBadge({ 
  icon, 
  value, 
  label, 
  color = 'blue',
  size = 'md',
  gradientClass,
  className,
  iconClassName
}: StatBadgeProps) {
  const gradient = gradientClass ?? colorClasses[color];
  const iconClass = `${iconSizeClasses[size]} ${iconColorClasses[color]} ${iconClassName ?? ''}`.trim();

  return (
    <div className={`flex items-center rounded-lg border ${sizeClasses[size]} ${gradient} ${className ?? ''}`}>
      <span className={iconClass}>
        {icon}
      </span>
      <span className="font-semibold">
        {value}
      </span>
      <span className={`${labelColorClasses[color]}`}>
        {label}
      </span>
    </div>
  );
}
