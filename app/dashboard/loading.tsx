import { DashboardSkeleton } from '@/components/ui';

/**
 * Next.js Loading UI para /dashboard.
 * Se muestra mientras cargan las métricas y sesiones recientes.
 */
export default function DashboardLoading() {
  return <DashboardSkeleton />;
}
