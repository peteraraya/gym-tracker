import { GridSkeleton } from '@/components/ui';

/**
 * Next.js Loading UI para /exercises.
 * Se muestra automáticamente mientras el Server Component carga los datos.
 * Evita CLS y da feedback inmediato al usuario.
 */
export default function ExercisesLoading() {
  // El cliente alterna entre vista de grupos (grid) y lista (exercise list)
  return (
    <div className="space-y-6 p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
          <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>
        <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
      </div>
      <GridSkeleton />
    </div>
  );
}
