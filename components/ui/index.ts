/**
 * Barrel de componentes UI primitivos.
 * Importa desde '@/components/ui' o directamente desde cada archivo.
 */

// ─── Primitivos base ─────────────────────────────────────────────────────────
export { Button } from './Button';
export { Card, CardHeader, CardTitle, CardContent } from './Card';
export { Input } from './Input';
export { Select } from './Select';
export { Toggle } from './Toggle';
export { Spinner } from './Spinner';
export { Modal } from './Modal';
export { BottomSheet } from './BottomSheet';
export { NumericInput } from './NumericInput';
export { PasswordInput } from './PasswordInput';
export { SearchInput } from './SearchInput';
export { default as InfoTooltip } from './InfoTooltip';
export { Skeleton, CardSkeleton, ListItemSkeleton, ChartSkeleton } from './Skeleton';

// ─── Display / Feedback ──────────────────────────────────────────────────────
export { EmptyState } from './EmptyState';
export { EmptyStateCard } from './EmptyStateCard';
export { LoadingState } from './LoadingState';
export { LoadingSpinner, InlineSpinner } from './LoadingSpinner';
export { StatBadge } from './StatBadge';
export { FilterButton, FilterPanel } from './FilterPanel';
export { Pagination } from './Pagination';

// ─── Layout ──────────────────────────────────────────────────────────────────
export { GridLayout, CardGrid, StatsGridLayout } from './GridLayout';
export { PageSection, PageSectionCard } from './PageSection';

// ─── Utilidades ──────────────────────────────────────────────────────────────
export { ClientOnly } from './ClientOnly';
export { VirtualList } from './VirtualList';
export { ExerciseImage } from './ExerciseImage';
export { Typography } from './Typography';
export type { TypographyVariant } from './Typography';
export {
  ExerciseListSkeleton,
  GridSkeleton,
  DashboardSkeleton,
  DetailSkeleton,
  ContentSkeleton,
} from './PageLoading';
export { Breadcrumb } from './Breadcrumb';
export type { BreadcrumbItem } from './Breadcrumb';
export { StandardEmptyState } from './StandardEmptyState';
export type { StandardEmptyStateProps } from './StandardEmptyState';
export { A11yAlert } from './A11yAlert';
export type { A11yAlertProps } from './A11yAlert';
export { IconButton } from './IconButton';
export type { IconButtonProps } from './IconButton';
export { PageSkeleton } from './PageSkeleton';
export { MobileGestures } from './MobileGestures';
export type { MobileGesturesProps } from './MobileGestures';
