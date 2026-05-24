import React from 'react';

interface SkeletonProps {
  className?: string;
  circle?: boolean;
  style?: React.CSSProperties;
}

export function Skeleton({ className = '', circle = false, style }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-800 ${
        circle ? 'rounded-full' : 'rounded-lg'
      } ${className}`}
      style={style}
    />
  );
}

// Composiciones comunes para no tener que armarlas de cero cada vez

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12" circle />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
      <Skeleton className="w-10 h-10" circle />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="w-8 h-8 rounded-lg" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-6 shadow-sm">
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <div className="flex items-end gap-2 h-40 pt-4">
        {[40, 70, 45, 90, 65, 80, 50].map((height, i) => (
          <Skeleton key={i} className="flex-1 rounded-t-md rounded-b-none" style={{ height: `${height}%` }} />
        ))}
      </div>
    </div>
  );
}
