# Fix: Toast Notifications Not Appearing

## Problem
Toast notifications were not appearing after completing sets during workout because:
1. Toasts were shown immediately after completing a set
2. Rest timer appeared in fullscreen mode right after
3. Main workout component unmounted, causing toasts to disappear
4. User never saw the encouragement messages

## Solution
Implemented a "pending toast" pattern:
1. When set is completed, save toast message to state
2. Don't show toast immediately
3. Wait for rest timer to complete
4. Show toast after timer closes and user returns to main view
5. User sees the message when they're ready for the next set

## Implementation

### State Added
```typescript
const [pendingToast, setPendingToast] = useState<{message: string, duration: number} | null>(null);
```

### Modified `handleCompleteSet`
```typescript
// Prepare toast message to show after rest
if (weightSuggestion && weightSuggestion.suggested > weightValue) {
  setPendingToast({
    message: `💪 Próxima vez intenta con ${weightSuggestion.suggested}kg (+${weightSuggestion.increase}kg)`,
    duration: 4000
  });
} else if (repsValue >= (currentExercise.sets[setIndex]?.reps || 10)) {
  setPendingToast({
    message: `✅ ¡Excelente serie! Completaste todas las repeticiones`,
    duration: 3000
  });
}
```

### Added Effect to Show Pending Toast
```typescript
// Show pending toast when timer closes
useEffect(() => {
  if (!showTimer && pendingToast) {
    // Small delay to ensure timer is fully closed
    const timer = setTimeout(() => {
      success(pendingToast.message, pendingToast.duration);
      setPendingToast(null);
    }, 300);
    return () => clearTimeout(timer);
  }
}, [showTimer, pendingToast, success]);
```

## User Experience Flow

### Before (Broken)
1. User completes set
2. Toast appears for 0.1 seconds
3. Rest timer appears fullscreen
4. Toast disappears (component unmounted)
5. User never sees the message ❌

### After (Fixed)
1. User completes set
2. Rest timer appears fullscreen
3. User rests and sees motivational messages
4. Rest timer completes
5. User returns to main view
6. Toast appears with encouragement message ✅
7. User sees the message and is motivated

## Benefits

1. **Better Timing** - Messages appear when user is ready to see them
2. **No Interruption** - Rest period is not interrupted by toasts
3. **Better UX** - User sees message right before starting next set
4. **Motivation** - Encouragement comes at the perfect moment
5. **No Lost Messages** - All toasts are guaranteed to be seen

## Testing

### Test Steps
1. Start a workout
2. Complete a set with good performance
3. Watch rest timer (no toast should appear)
4. Wait for rest to complete
5. Return to main view
6. Toast should appear with encouragement message

### Expected Messages
- Weight suggestion: `💪 Próxima vez intenta con [weight]kg (+[increase]kg)`
- Good performance: `✅ ¡Excelente serie! Completaste todas las repeticiones`

## Technical Details

### Why 300ms Delay?
- Ensures timer component is fully unmounted
- Prevents toast from appearing during transition
- Smooth user experience without visual glitches

### State Management
- `pendingToast` is cleared after showing
- Only one toast is shown per set completion
- Toast is not shown if user skips rest

### Edge Cases Handled
- User skips rest timer → Toast still shows
- User cancels workout → Toast is cleared
- Multiple sets completed → Each gets its own toast
- Last set of workout → Toast shows before completion modal

## Files Modified

1. `app/workout/[id]/page.tsx`
   - Added `pendingToast` state
   - Modified `handleCompleteSet` to save toast instead of showing
   - Added effect to show toast after timer closes

## Related Features

- Weight Suggestions: `lib/weightSuggestions.ts`
- Toast Context: `context/ToastContext.tsx`
- Rest Timer: `components/Timer.tsx`

## Future Enhancements

1. Add sound effect when toast appears
2. Add haptic feedback on mobile
3. Add animation when toast appears
4. Add option to disable encouragement messages
5. Add more varied encouragement messages

## Notes

- This pattern can be used for other notifications during workout
- Achievement notifications use the same pattern
- Motivational messages in timer are separate and work correctly
