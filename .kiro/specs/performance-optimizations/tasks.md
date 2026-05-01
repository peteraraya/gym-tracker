# Implementation Plan: Performance Optimizations

## Overview

This implementation plan follows an 8-week phased migration approach to optimize the Gym Tracker application through React Query integration, virtualization, code splitting, and memoization. The plan prioritizes stability by implementing changes incrementally with thorough testing at each phase.

## Tasks

- [x] 1. Phase 1: Setup and Configuration (Week 1)
  - [x] 1.1 Install dependencies and create QueryClient configuration
    - Install @tanstack/react-query, @tanstack/react-query-devtools, @tanstack/react-virtual, and @fast-check/jest
    - Create lib/react-query/queryClient.ts with staleTime (5 min), gcTime (10 min), retry logic (3 attempts with exponential backoff)
    - Configure networkMode as 'offlineFirst' for queries and mutations
    - _Requirements: 1.2, 5.1, 5.2, 5.6_
  
  - [x] 1.2 Set up error handling for React Query
    - Create lib/react-query/errorHandling.ts with setupQueryErrorHandling function
    - Implement global error handlers for queries and mutations
    - Configure retry logic to skip 404/401 errors
    - Integrate with ToastContext for user-friendly error messages
    - _Requirements: 5.9, 8.1_
  
  - [x] 1.3 Create query keys structure
    - Create lib/react-query/queryKeys.ts with hierarchical key structure
    - Define keys for routines, sessions, activeWorkout, profile, plans, and auth
    - Use TypeScript const assertions for type safety
    - _Requirements: 1.1, 1.10_
  
  - [x] 1.4 Add QueryClientProvider to app layout
    - Wrap app in app/layout.tsx with QueryClientProvider
    - Add React Query DevTools in development mode only
    - Ensure proper client-side rendering with 'use client' directive
    - _Requirements: 1.1, 5.10_

- [ ] 2. Phase 2: GymContext Migration (Week 2)
  - [x] 2.1 Create useRoutines custom hook
    - Create hooks/queries/useRoutines.ts with useQuery for fetching routines
    - Implement useMutation for createRoutine, updateRoutine, deleteRoutine
    - Add optimistic updates for updateRoutine with rollback on error
    - Configure cache invalidation on successful mutations
    - Return loading, error, and data states
    - _Requirements: 1.3, 1.6, 1.7, 1.8, 1.9, 1.11_
  
  - [ ]* 2.2 Write property test for query cache deduplication
    - **Property 1: Query Cache Deduplication**
    - **Validates: Requirements 1.10**
    - Test that multiple concurrent requests for same query key result in single network call
    - Use @fast-check/jest with 100+ iterations
  
  - [ ]* 2.3 Write property test for cache invalidation on mutation
    - **Property 3: Cache Invalidation on Mutation**
    - **Validates: Requirements 1.8**
    - Test that successful mutations invalidate related query caches
    - Verify refetch is triggered for active queries
  
  - [ ]* 2.4 Write property test for optimistic update rollback
    - **Property 5: Optimistic Update Rollback**
    - **Validates: Requirements 1.11, 8.5**
    - Test that failed mutations revert optimistic changes
    - Verify previous cached state is restored
  
  - [x] 2.5 Create useSessions custom hook
    - Create hooks/queries/useSessions.ts with useQuery for fetching sessions
    - Implement useMutation for addSession, updateSession, deleteSession
    - Add optimistic updates for updateSession
    - Configure cache invalidation on successful mutations
    - _Requirements: 1.3, 1.6, 1.7, 1.8, 1.9, 1.11_
  
  - [ ]* 2.6 Write unit tests for useRoutines and useSessions hooks
    - Test successful data fetching
    - Test error handling
    - Test mutation success and failure scenarios
    - Test loading states
    - _Requirements: 9.1, 9.2_
  
  - [x] 2.7 Refactor GymContext to use React Query hooks
    - Update context/GymContext.tsx to use useRoutines and useSessions
    - Add feature flag NEXT_PUBLIC_USE_REACT_QUERY for gradual rollout
    - Maintain backward compatibility with existing Context API
    - Ensure data consistency between both systems during transition
    - _Requirements: 1.3, 6.1, 6.2, 6.3, 6.4_
  
  - [ ]* 2.8 Write integration tests for GymContext migration
    - Test CRUD operations for routines
    - Test CRUD operations for sessions
    - Test cache invalidation between related entities
    - _Requirements: 9.2_

- [ ] 3. Checkpoint - Verify GymContext migration
  - Ensure all tests pass, manually test routine and session CRUD operations, ask the user if questions arise.

- [ ] 4. Phase 3: WorkoutContext Migration (Week 3)
  - [ ] 4.1 Create useActiveWorkout custom hook
    - Create hooks/queries/useActiveWorkout.ts with useQuery for active workout state
    - Implement useMutation for startWorkout, updateWorkoutProgress, finishWorkout, cancelWorkout
    - Add optimistic updates for workout progress updates
    - Implement dual-write strategy (localStorage + React Query cache)
    - _Requirements: 1.4, 1.6, 1.7, 1.8, 1.11_
  
  - [ ]* 4.2 Write property test for automatic background refetch
    - **Property 2: Automatic Background Refetch**
    - **Validates: Requirements 1.7**
    - Test that stale queries trigger background refetch on next access
    - Verify stale data is served immediately while refetching
  
  - [ ]* 4.3 Write property test for offline cache serving
    - **Property 6: Offline Cache Serving**
    - **Validates: Requirements 1.12**
    - Test that cached data is served when offline
    - Test that mutations are queued when offline
    - _Requirements: 1.12_
  
  - [ ] 4.4 Refactor WorkoutContext to use React Query
    - Update context/WorkoutContext.tsx to use useActiveWorkout
    - Replace manual state management with React Query
    - Ensure workout state persists across app restarts
    - _Requirements: 1.4, 6.2, 6.3_
  
  - [ ]* 4.5 Write unit tests for workout flows
    - Test start workout flow
    - Test update progress flow
    - Test finish workout flow
    - Test cancel workout flow
    - Test resume after app restart
    - _Requirements: 9.1_

- [x] 5. Phase 4: Virtualization (Week 4)
  - [x] 5.1 Create VirtualList component
    - Create components/VirtualList.tsx using @tanstack/react-virtual
    - Implement useVirtualizer hook with configurable estimateSize and overscan
    - Add error handling with fallback to non-virtualized rendering
    - Support dynamic height calculation with measureElement
    - _Requirements: 2.1, 2.2, 2.5, 8.7_
  
  - [ ]* 5.2 Write property test for virtualized rendering efficiency
    - **Property 7: Virtualized Rendering Efficiency**
    - **Validates: Requirements 2.2**
    - Test that lists > 20 items render only visible items plus buffer
    - Verify total rendered items < total list items
  
  - [ ]* 5.3 Write property test for virtualization performance
    - **Property 8: Virtualization Performance**
    - **Validates: Requirements 2.4**
    - Test that scrolling maintains 60fps with 1000+ items
    - Measure frame times during scroll events
  
  - [ ]* 5.4 Write property test for dynamic height calculation
    - **Property 9: Dynamic Height Calculation**
    - **Validates: Requirements 2.5**
    - Test that variable-sized items are positioned correctly
    - Verify measured heights are used for positioning
  
  - [x] 5.5 Update Sessions page with virtualization
    - Update app/sessions/page.tsx to use VirtualList component
    - Configure estimateSize based on session card height
    - Add scroll position persistence using sessionStorage
    - _Requirements: 2.1, 2.2, 2.7_
  
  - [x] 5.6 Update Exercises page with virtualization
    - Update app/exercises/page.tsx to use VirtualList for exercise list
    - Configure estimateSize for exercise items
    - Implement efficient filter updates that only recalculate visible range
    - _Requirements: 2.3, 2.6_
  
  - [ ]* 5.7 Write property test for efficient filter updates
    - **Property 10: Efficient Filter Updates**
    - **Validates: Requirements 2.6**
    - Test that filtering only recalculates visible range
    - Verify full list is not re-rendered on filter change
  
  - [ ]* 5.8 Write property test for selective item updates
    - **Property 12: Selective Item Updates**
    - **Validates: Requirements 2.8**
    - Test that single item updates only re-render that item
    - Verify other items in list are not re-rendered
  
  - [x] 5.9 Add keyboard navigation support to VirtualList
    - Implement arrow key navigation in VirtualList component
    - Maintain focus and scroll to keep focused items visible
    - Add proper ARIA attributes for screen readers
    - _Requirements: 2.9, 2.10_
  
  - [ ]* 5.10 Write unit tests for VirtualList component
    - Test rendering with various list sizes
    - Test scroll behavior
    - Test error handling and fallback
    - Test keyboard navigation
    - _Requirements: 9.3_

- [ ] 6. Checkpoint - Verify virtualization implementation
  - Ensure all tests pass, manually test scrolling performance with large lists, ask the user if questions arise.

- [x] 7. Phase 5: Code Splitting (Week 5)
  - [x] 7.1 Create lazy-loaded dashboard components
    - Create app/dashboard/components.lazy.tsx with lazy-loaded chart components
    - Export VolumeChart, ProgressChart, StatsCards as lazy components
    - Add Suspense boundaries with loading skeletons
    - _Requirements: 3.1, 3.7_
  
  - [x] 7.2 Create lazy-loaded progress components
    - Create app/progress/components.lazy.tsx with lazy-loaded visualization components
    - Export ActivityHeatmap, ProgressCharts as lazy components
    - Add Suspense boundaries with loading indicators
    - _Requirements: 3.2, 3.7_
  
  - [x] 7.3 Create LazyErrorBoundary component
    - Create components/LazyErrorBoundary.tsx to handle chunk load failures
    - Implement retry logic with exponential backoff (1s, 2s, 4s)
    - Show loading indicator during retry attempts
    - Provide reload option if all retries fail
    - _Requirements: 3.6, 3.10, 8.2, 8.3_
  
  - [ ]* 7.4 Write property test for chunk load retry
    - **Property 14: Chunk Load Retry**
    - **Validates: Requirements 3.10**
    - Test that failed chunk loads retry with exponential backoff
    - Verify retry delays are 1s, 2s, 4s
  
  - [ ]* 7.5 Write property test for chunk load retry with indicator
    - **Property 19: Chunk Load Retry with Indicator**
    - **Validates: Requirements 8.2**
    - Test that loading indicator is shown during retry attempts
    - Verify user-friendly error after all retries fail
  
  - [x] 7.6 Update Dashboard page with lazy loading
    - Update app/dashboard/page.tsx to use lazy-loaded components
    - Wrap lazy components with LazyErrorBoundary
    - Add loading skeletons for better UX
    - _Requirements: 3.1, 3.3, 3.6_
  
  - [x] 7.7 Update Progress page with lazy loading
    - Update app/progress/page.tsx to use lazy-loaded components
    - Wrap lazy components with LazyErrorBoundary
    - Add loading indicators
    - _Requirements: 3.2, 3.3, 3.6_
  
  - [x] 7.8 Implement route-based code splitting
    - Add dynamic imports for major routes (sessions, exercises, routines)
    - Configure Next.js prefetch for critical routes
    - _Requirements: 3.5, 3.9_
  
  - [ ]* 7.9 Write unit tests for lazy loading
    - Test successful component loading
    - Test chunk load failure and retry
    - Test error boundary behavior
    - Test loading states
    - _Requirements: 9.4_
  
  - [ ]* 7.10 Measure bundle size reduction
    - Run webpack-bundle-analyzer to measure bundle sizes
    - Verify initial bundle reduced by at least 30%
    - Document bundle size metrics
    - _Requirements: 3.4, 7.5_

- [x] 8. Phase 6: Memoization (Week 6)
  - [x] 8.1 Memoize StatsCard component
    - Wrap components/StatsCard.tsx with React.memo
    - Implement custom comparison function for props
    - Add displayName for debugging
    - _Requirements: 4.1, 4.5, 4.9_
  
  - [x] 8.2 Memoize ExerciseSelector component
    - Wrap components/ExerciseSelector.tsx with React.memo
    - Use useCallback for event handlers passed as props
    - _Requirements: 4.2, 4.5, 4.7_
  
  - [x] 8.3 Memoize VolumeChart component
    - Wrap chart component with React.memo
    - Use useMemo for expensive chart data calculations
    - _Requirements: 4.3, 4.5, 4.6_
  
  - [x] 8.4 Memoize ActivityHeatmap component
    - Wrap components/ActivityHeatmap.tsx with React.memo
    - Use useMemo for heatmap data transformations
    - _Requirements: 4.4, 4.5, 4.6_
  
  - [ ]* 8.5 Write property test for memoization prevents re-renders
    - **Property 15: Memoization Prevents Re-renders**
    - **Validates: Requirements 4.5**
    - Test that memoized components don't re-render when props unchanged
    - Verify re-render count remains 1 despite parent re-renders
  
  - [x] 8.6 Add useMemo for dashboard statistics
    - Update app/dashboard/page.tsx to use useMemo for expensive calculations
    - Memoize workout statistics, volume calculations, PR calculations
    - _Requirements: 4.6_
  
  - [x] 8.7 Add useCallback for event handlers
    - Update components passing handlers to memoized children
    - Wrap event handlers with useCallback to prevent breaking memoization
    - _Requirements: 4.7_
  
  - [ ]* 8.8 Write unit tests for memoized components
    - Test that components skip re-render with unchanged props
    - Test that components re-render with changed props
    - Test custom comparison functions
    - _Requirements: 9.1_
  
  - [ ]* 8.9 Measure re-render reduction
    - Use React Profiler to measure re-render counts
    - Verify at least 40% reduction in re-renders for dashboard
    - Document re-render metrics
    - _Requirements: 4.10, 7.4_

- [ ] 9. Checkpoint - Verify memoization and code splitting
  - Ensure all tests pass, verify bundle size and re-render reductions meet targets, ask the user if questions arise.

- [-] 10. Phase 7: Testing and Optimization (Week 7)
  - [ ] 10.1 Complete property-based test suite
    - Write remaining property tests for query state transitions (Property 4)
    - Write property test for mutation retry with backoff (Property 16)
    - Write property test for scroll position persistence (Property 11)
    - Write property test for keyboard navigation (Property 13)
    - _Requirements: 9.1, 9.2_
  
  - [ ]* 10.2 Write property test for query state transitions
    - **Property 4: Query State Transitions**
    - **Validates: Requirements 1.9**
    - Test that queries transition correctly: pending → success/error
    - Verify states are accessible to consuming components
  
  - [ ]* 10.3 Write property test for mutation retry with backoff
    - **Property 16: Mutation Retry with Backoff**
    - **Validates: Requirements 5.5**
    - Test that failed mutations retry up to 3 times
    - Verify exponential backoff delays (1s, 2s, 4s)
  
  - [ ]* 10.4 Write integration tests for cache invalidation
    - Test that deleting routine invalidates sessions cache
    - Test that updating workout invalidates related queries
    - Test cross-context cache invalidation
    - _Requirements: 9.2_
  
  - [ ]* 10.5 Write integration tests for offline behavior
    - Test that app serves cached data when offline
    - Test that mutations are queued when offline
    - Test that queued mutations execute when back online
    - _Requirements: 9.7_
  
  - [ ]* 10.6 Write integration tests for optimistic updates
    - Test optimistic update flow for routine updates
    - Test rollback on mutation failure
    - Test UI consistency during optimistic updates
    - _Requirements: 9.8_
  
  - [x] 10.7 Set up performance monitoring
    - Create lib/performance/monitor.ts with usePerformanceMonitor hook
    - Implement measureBundleSize function
    - Implement measureCacheHitRate function
    - Add performance logging in development mode
    - _Requirements: 7.1, 7.2, 7.3, 7.8_
  
  - [x] 10.8 Measure and document performance metrics
    - Measure initial page load time (FCP, LCP, TTI)
    - Measure cache hit rate (target: 70%+)
    - Measure API request reduction (target: 60%+)
    - Document all metrics in performance report
    - _Requirements: 7.2, 7.3, 7.6, 7.7_
  
  - [x] 10.9 Create performance documentation
    - Update README with React Query setup and usage
    - Document virtualization implementation
    - Document code splitting strategy
    - Document memoization guidelines
    - Create troubleshooting guide
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [ ] 11. Phase 8: Cleanup and Launch (Week 8)
  - [ ] 11.1 Remove feature flags and old Context API code
    - Remove NEXT_PUBLIC_USE_REACT_QUERY feature flag
    - Remove old manual useState/useEffect patterns from contexts
    - Clean up deprecated code and comments
    - _Requirements: 6.6_
  
  - [ ] 11.2 Final regression testing
    - Test all CRUD operations for routines, sessions, workouts
    - Test offline functionality
    - Test error scenarios
    - Test performance with large datasets
    - _Requirements: 6.7, 6.8_
  
  - [ ] 11.3 Validate success criteria
    - Verify bundle size reduced by 30%+ (measured)
    - Verify API requests reduced by 60%+ (measured)
    - Verify 60fps scrolling with 1000+ items (measured)
    - Verify re-renders reduced by 40%+ (measured)
    - Verify TTI improved by 25%+ (measured)
    - Verify cache hit rate 70%+ (measured)
    - Verify no functionality regressions
    - Verify test coverage 80%+
    - _Requirements: 7.1-7.8_
  
  - [ ] 11.4 Create rollback plan documentation
    - Document immediate rollback procedure
    - Document data integrity verification steps
    - Document user communication plan
    - Document post-mortem process
    - _Requirements: 6.9_
  
  - [ ] 11.5 Final documentation updates
    - Update README with final performance metrics
    - Create migration guide for future reference
    - Document lessons learned
    - Create developer guide for maintaining optimizations
    - _Requirements: 10.8, 10.9, 10.10_

- [ ] 12. Final checkpoint - Launch readiness
  - Ensure all tests pass, all success criteria met, documentation complete, ask the user if ready to launch.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples and edge cases
- The 8-week phased approach ensures stability during migration
- Feature flags enable gradual rollout and easy rollback if needed
- Performance metrics are measured at each phase to validate improvements
