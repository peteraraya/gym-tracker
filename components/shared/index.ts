/**
 * Barrel de componentes compartidos.
 * Importa desde aquí para acceder a cualquier componente reutilizable sin
 * preocuparte de su ubicación física dentro de components/.
 */

// ─── Componentes base (en shared/) ─────────────────────────────────────────
export { StatBadge } from './StatBadge';
export { EmptyStateCard } from './EmptyStateCard';
export { ActionButton } from './ActionButton';
export { SearchInput } from './SearchInput';
export { LoadingSpinner, InlineSpinner } from './LoadingSpinner';
export { FilterBar, SearchBar, FilterButtons } from './FilterBar';
export { PageSection, PageSectionCard } from './PageSection';
export { GridLayout, CardGrid, StatsGrid } from './GridLayout';

// ─── Componentes de dominio (re-exports para facilitar imports) ────────────
export { RoutineCard } from '../features/routines/RoutineCard';
export { ExerciseListItem } from '../features/exercises/ExerciseListItem';
export { SessionCard } from '../features/sessions/SessionCard';
export { AchievementCard } from '../features/achievements/AchievementCard';

// ─── Tipos ─────────────────────────────────────────────────────────────────
export type { FilterOption } from './FilterBar';
