import { GridSkeleton } from '@/components/ui';

/**
 * Next.js Loading UI para /routines.
 * Se muestra mientras cargan las rutinas del usuario.
 */
export default function RoutinesLoading() {
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
      </div>
      <GridSkeleton />
    </div>
  );
}
