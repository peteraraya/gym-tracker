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
