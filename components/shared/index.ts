/**
 * Barrel de componentes compartidos.
 * Importa desde aquí para acceder a cualquier componente reutilizable sin
 * preocuparte de su ubicación física dentro de components/.
 */

// ─── Primitivos UI (ahora viven en ui/, re-exportados aquí) ─────────────────
export { StatBadge } from './StatBadge';
export { EmptyState } from './EmptyState';
export { EmptyStateCard } from './EmptyStateCard';
export { ActionButton } from './ActionButton';
export { SearchInput } from './SearchInput';
export { LoadingSpinner, InlineSpinner } from './LoadingSpinner';
export { LoadingState } from './LoadingState';
export { FilterBar, SearchBar, FilterButtons } from './FilterBar';
export { FilterButton, FilterPanel } from './FilterPanel';
export { PageSection, PageSectionCard } from './PageSection';
export { GridLayout, CardGrid, StatsGrid } from './GridLayout';
export { Pagination } from './Pagination';
export { ClientOnly } from './ClientOnly';
export { VirtualList } from './VirtualList';

// ─── Componentes de dominio (re-exports para facilitar imports) ────────────
export { RoutineCard } from '../features/routines/RoutineCard';
export { ExerciseListItem } from '../features/exercises/ExerciseListItem';
export { SessionCard } from '../features/sessions/SessionCard';
export { AchievementCard } from '../features/achievements/AchievementCard';

// ─── Tipos ─────────────────────────────────────────────────────────────────
export type { FilterOption } from './FilterBar';
