# Fix: Auto-Advance Not Working When Timer Completes

## Problem
When the rest timer reached 0 seconds naturally, the workout page was not automatically advancing to the next exercise or series. Users had to manually click the "Continuar" (Continue) button to proceed.

## Root Cause
In the `Timer.tsx` component, when the timer countdown reached 0, the component would:
1. Set `isCompleted = true`
2. Display the completion UI
3. **BUT** it did NOT automatically call the `onComplete()` callback

The `onComplete()` callback was only being triggered when:
- User clicked the "Saltar" (Skip) button
- User manually clicked "Continuar" (Continue) after timer completed

This meant the `handleTimerComplete()` function in the workout page was never being called automatically.

## Solution
Modified the Timer component's interval effect to automatically call `onComplete()` when the timer reaches 0:

```typescript
// In components/Timer.tsx, useEffect for isRunning
if (prev <= 1) {
  setIsRunning(false);
  setIsCompleted(true);
  const realDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
  setActualDuration(realDuration);
  
  // NEW: Automatically call onComplete when timer reaches 0
  if (onComplete && !onCompleteCalledRef.current) {
    onCompleteCalledRef.current = true;
    setTimeout(() => {
      onComplete();
    }, 100);
  }
  
  return 0;
}
```

### Key Points:
1. **Guard with `onCompleteCalledRef`**: Prevents multiple calls to `onComplete()`
2. **setTimeout delay**: Allows React state to update before calling the callback
3. **Automatic trigger**: No user interaction needed - timer completion triggers advance automatically

## Impact
- ✅ Timer now automatically advances to next exercise/series when countdown reaches 0
- ✅ Maintains existing "Skip" button functionality
- ✅ Maintains existing "Continue" button functionality for manual advancement
- ✅ Prevents duplicate calls with ref guard
- ✅ Smooth UX - no manual button clicks needed

## Files Modified
- `components/Timer.tsx` - Added automatic `onComplete()` call when timer reaches 0

## Testing
1. Start a workout
2. Complete a series and wait for rest timer
3. Let the timer count down to 0 naturally
4. Verify that the page automatically advances to the next series/exercise
5. Verify that clicking "Skip" still works
6. Verify that clicking "Continue" still works
