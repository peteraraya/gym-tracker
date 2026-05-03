# Performance Optimization Guide

## Overview

This document describes the performance optimizations implemented in the Gym Tracker application, including React Query integration, virtualization, code splitting, and memoization strategies.

## React Query Setup

### Configuration

The app uses TanStack Query (React Query) for efficient data fetching and caching:

```typescript
// lib/react-query/queryClient.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: 'offlineFirst',
    },
  },
});
```

### Usage

Use custom hooks for data fetching:

```typescript
import { useRoutines } from '@/hooks/queries/useRoutines';
import { useSessions } from '@/hooks/queries/useSessions';

function MyComponent() {
  const { data: routines, isLoading } = useRoutines();
  const { mutate: createRoutine } = useRoutines();
  
  // ...
}
```

### Feature Flag

React Query is fully integrated for data fetching with optimistic updates.

## Virtualization

### VirtualList Component

For long lists (100+ items), use the VirtualList component:

```typescript
import { VirtualList } from '@/components/VirtualList';

<VirtualList
  items={sessions}
  estimateSize={250}
  overscan={3}
  enableKeyboardNav={true}
  ariaLabel="Lista de sesiones"
  renderItem={(session) => (
    <SessionCard session={session} />
  )}
/>
```

### Configuration

- `estimateSize`: Approximate height of each item in pixels
- `overscan`: Number of items to render outside visible area (default: 5)
- `enableKeyboardNav`: Enable arrow key navigation (default: false)

### Keyboard Navigation

When enabled, VirtualList supports:
- Arrow Up/Down: Navigate between items
- Home: Jump to first item
- End: Jump to last item

## Code Splitting

### Lazy Loading Components

Heavy components are lazy-loaded to reduce initial bundle size:

```typescript
// app/dashboard/components.lazy.tsx
export const VolumeChart = dynamic(() => import('@/components/VolumeChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
});
```

### Error Handling

Wrap lazy components with LazyErrorBoundary for automatic retry:

```typescript
import { LazyErrorBoundary } from '@/components/LazyErrorBoundary';

<LazyErrorBoundary>
  <VolumeChart sessions={sessions} />
</LazyErrorBoundary>
```

Features:
- Automatic retry with exponential backoff (1s, 2s, 4s)
- Loading indicator during retries
- Manual retry and reload options after failure

## Memoization

### Component Memoization

Use React.memo for components that receive stable props:

```typescript
export const StatsCard = React.memo(function StatsCard({ title, value, icon }) {
  // ...
});

StatsCard.displayName = 'StatsCard';
```

### Computation Memoization

Use useMemo for expensive calculations:

```typescript
const stats = useMemo(() => {
  return {
    totalVolume: calculateTotalVolume(sessions),
    totalSets: calculateTotalSets(sessions),
    // ...
  };
}, [sessions]);
```

### Callback Memoization

Use useCallback for event handlers passed to memoized components:

```typescript
const handlePeriodChange = useCallback((newPeriod: 'week' | 'month') => {
  setPeriod(newPeriod);
}, []);
```

## Performance Monitoring

### Development Monitoring

Use the performance monitor hook:

```typescript
import { usePerformanceMonitor } from '@/lib/performance/monitor';

function MyComponent() {
  usePerformanceMonitor('MyComponent');
  // ...
}
```

### Metrics Collection

Collect performance metrics programmatically:

```typescript
import { collectPerformanceMetrics, generatePerformanceReport } from '@/lib/performance/metrics';

const report = await collectPerformanceMetrics(queryClient);
console.log(generatePerformanceReport(report));
```

## Troubleshooting

### React Query Issues

**Problem**: Data not updating after mutation
**Solution**: Ensure cache invalidation is configured:

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.routines.all });
}
```

**Problem**: Stale data showing
**Solution**: Adjust staleTime or force refetch:

```typescript
const { data, refetch } = useRoutines();
// Force fresh data
refetch();
```

### Virtualization Issues

**Problem**: Items not rendering correctly
**Solution**: Ensure estimateSize matches actual item height:

```typescript
<VirtualList
  items={items}
  estimateSize={300} // Adjust based on actual item height
/>
```

**Problem**: Scroll position jumps
**Solution**: Use dynamic height measurement:

```typescript
// VirtualList automatically measures with measureElement
// Ensure items have stable keys
```

### Code Splitting Issues

**Problem**: Chunk load failed
**Solution**: LazyErrorBoundary handles this automatically with retry logic

**Problem**: Loading state flickers
**Solution**: Add appropriate loading skeletons:

```typescript
const Component = dynamic(() => import('./Component'), {
  loading: () => <Skeleton />,
});
```

### Memoization Issues

**Problem**: Component still re-rendering
**Solution**: Ensure all props are stable (use useCallback/useMemo):

```typescript
// Bad
<MemoizedComponent onClick={() => handleClick()} />

// Good
const handleClick = useCallback(() => {
  // ...
}, []);
<MemoizedComponent onClick={handleClick} />
```

## Best Practices

1. Always use React Query hooks for data fetching
2. Virtualize lists with 50+ items
3. Lazy load heavy components (charts, visualizations)
4. Memoize components that receive stable props
5. Use useCallback for event handlers passed to memoized children
6. Monitor performance in development mode
7. Test with large datasets to verify optimizations

## Performance Targets

- Initial bundle size: Reduced by 30%+
- API requests: Reduced by 60%+
- Scrolling: 60fps with 1000+ items
- Re-renders: Reduced by 40%+
- Time to Interactive: Improved by 25%+
- Cache hit rate: 70%+

## Migration Checklist

- [x] Migrate to React Query (feature flag removed)
- [x] Test all CRUD operations
- [x] Verify offline functionality
- [ ] Test with large datasets (100+ sessions)
- [ ] Measure performance metrics
