'use client';

import React from 'react';
import { Skeleton } from './Skeleton';

interface PageSkeletonProps {
  variant?: 'list' | 'grid' | 'card' | 'dashboard';
  className?: string;
}

/**
 * Componente de esqueleto de página profesional para GymLogiX.
 * Proporciona estados de carga consistentes y elegantes mientras se cargan los datos.
 */
export function PageSkeleton({
  variant = 'list',
  className = '',
}: PageSkeletonProps) {
  return (
    <div
      className={`space-y-6 p-6 ${className}`}
      role="status"
      aria-busy="true"
      aria-label="Cargando contenido"
    >
      {/* Header skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
      </div>

      {/* Content based on variant */}
      <div className="space-y-6">
        {variant === 'list' && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm animate-pulse">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <div className="flex-shrink-0 w-12 h-12 bg-gray-200 dark:bg-gray-600 animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {variant === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 6, 8, 9, 12].map((i) => (
              <div key={i} className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm animate-pulse">
                <div className="h-48 rounded-lg bg-gray-200 dark:bg-gray-600 animate-pulse mb-4" />
                <div className="p-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {variant === 'card' && (
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm animate-pulse p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <div className="mt-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        )}

        {variant === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm animate-pulse p-6 h-32">
                  <div className="flex items-end justify-between">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="w-12 h-8 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm animate-pulse h-96 p-6">
                  <Skeleton className="h-8 w-1/3 mb-4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-32 w-full mt-4" />
                </div>
              </div>
              <div className="lg:col-span-1 space-y-6">
                <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm animate-pulse h-48 p-6">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm animate-pulse h-48 p-6">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}