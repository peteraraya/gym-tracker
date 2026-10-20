'use client';

import { Skeleton } from './Skeleton';

/**
 * Esqueleto de nivel de página para listas (ejercicios, rutinas, sesiones).
 * Se usa en `loading.tsx` de Next.js para mostrar estado de carga inmediato
 * sin saltos de layout (CLS = 0).
 */
export function ExerciseListSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-10 w-1/2" />
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-4 shadow-sm animate-pulse">
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
        </div>
      ))}
    </div>
  );
}

/**
 * Esqueleto para vista de cuadrícula (tarjetas de ejercicios/rutinas).
 */
export function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
        <div key={i} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-4 shadow-sm animate-pulse">
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
        </div>
      ))}
    </div>
  );
}

/**
 * Esqueleto para dashboard con tarjetas de estadísticas y lista.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm animate-pulse h-24">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-1/3" />
      <GridSkeleton />
    </div>
  );
}

/**
 * Esqueleto para páginas de detalle (ejercicio, rutina, sesión individual).
 */
export function DetailSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm animate-pulse h-96">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

/**
 * Esqueleto simple para contenido textual (perfil, configuración).
 */
export function ContentSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}
