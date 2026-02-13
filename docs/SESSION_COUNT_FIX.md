# Fix: Session Count Not Updating After Workout Completion

## Problem
After completing a workout and clicking "Completar", the session count displayed in the dashboard and other pages showed fewer sessions than expected. Only after manually reloading the page would the correct total appear.

## Root Cause
The issue was caused by a race condition in the state update and navigation flow:

1. User completes workout → `finishCompleteWorkout()` is called
2. `addSession()` saves the session and calls `refreshSessions()`
3. `refreshSessions()` updates the `sessions` state in GymContext
4. Navigation happens immediately with `router.push('/sessions')`
5. React's state updates are asynchronous - the new session state might not have propagated to all consuming components before navigation
6. The target page renders with stale data from the context

## Solution
Implemented a two-part fix in both workout completion flows:

### 1. Added `router.refresh()` after navigation
This forces Next.js to re-fetch data and re-render the page with fresh state.

### 2. Added small delay before navigation
A 100ms delay ensures React has time to propagate the state update through the context before navigation occurs.

```typescript
// Before
await addSession({ ... });
success('Sesión guardada exitosamente');
router.push('/sessions');

// After
await addSession({ ... });
success('Sesión guardada exitosamente');

// Pequeña espera para asegurar que el estado se propague
await new Promise(resolve => setTimeout(resolve, 100));

// Navegar y forzar actualización del router
router.push('/sessions');
router.refresh();
```

## Files Modified
- `app/workout/[id]/page.tsx` - Fixed routine-based workout completion
- `app/workout/free/page.tsx` - Fixed free training workout completion

## Technical Details

### State Update Flow
1. `addSession()` in GymContext:
   - Saves session via `storageService.saveSession()`
   - Calls `await refreshSessions()` which updates state
   - Returns after state update completes

2. Workout completion:
   - Awaits `addSession()` to ensure save completes
   - Shows success toast
   - Waits 100ms for React state propagation
   - Navigates to sessions page
   - Calls `router.refresh()` to force re-render

### Why This Works
- The `await` on `addSession()` ensures the session is saved and `refreshSessions()` completes
- The 100ms delay gives React's state update cycle time to propagate through the context
- `router.refresh()` forces Next.js to re-fetch and re-render with the latest state
- Components using `useValidSessions()` hook will now see the updated session count

## Testing
To verify the fix:
1. Start a workout from any routine
2. Complete at least one set
3. Click "Terminar sesión" and save
4. Verify the session count updates immediately on the sessions page
5. Navigate to dashboard and verify the count is correct
6. No page reload should be necessary

## Related
- `context/GymContext.tsx` - Contains `addSession()` and `refreshSessions()` logic
- `hooks/useValidSessions.ts` - Hook that filters and provides valid sessions to components
- All components consuming session data now receive updates immediately after workout completion
