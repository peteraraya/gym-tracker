# Collapse/Expand Exercise Headers in Session Edit

## Overview
Implemented collapsible exercise sections in the session edit modal to improve UX when editing sessions with multiple exercises.

## Features

### 1. Manual Collapse/Expand
- Click on exercise header to toggle collapse state
- Chevron icon rotates to indicate state (right = collapsed, down = expanded)
- All exercises are open by default

### 2. Auto-Collapse on Completion
- Exercises automatically collapse when all sets are completed
- A set is considered complete when both reps > 0 and weight > 0
- Visual feedback: "✓ Completo" badge and green border

### 3. Visual Indicators
- Chevron icon shows collapse state
- Green border and background when exercise is complete
- "✓ Completo" badge on completed exercises
- Set count displayed in header

### 4. Preserved Functionality
- Drag-and-drop reordering still works with collapsed exercises
- Add/remove exercise buttons remain accessible
- Add set button visible in header

## Implementation Details

### State Management
```typescript
const [collapsedExercises, setCollapsedExercises] = useState<{[key: number]: boolean}>({});
```

### Toggle Function
```typescript
const toggleExerciseCollapse = (exerciseIndex: number) => {
  setCollapsedExercises(prev => ({
    ...prev,
    [exerciseIndex]: !prev[exerciseIndex]
  }));
};
```

### Auto-Collapse Logic
```typescript
const checkAndCollapseIfComplete = (exerciseIndex: number, session: WorkoutSession) => {
  const exercise = session.exercises[exerciseIndex];
  const actualReps = exercise.actualReps || [];
  const actualWeights = exercise.actualWeight || [];
  const maxSets = Math.max(actualReps.length, actualWeights.length, 1);
  
  // Check if all sets have values > 0
  const allComplete = Array.from({ length: maxSets }).every((_, idx) => {
    const reps = actualReps[idx] || 0;
    const weight = actualWeights[idx] || 0;
    return reps > 0 && weight > 0;
  });
  
  if (allComplete) {
    setCollapsedExercises(prev => ({ ...prev, [exerciseIndex]: true }));
  }
};
```

### Header Structure
- Clickable header with hover effect
- Drag handle (6 dots) for reordering
- Chevron icon for collapse state
- Exercise name and number
- Completion badge
- Action buttons (Add Set, Remove Exercise)

### Conditional Rendering
```typescript
{!isCollapsed && (
  <div className="p-4">
    <table className="w-full text-sm">
      {/* Table content */}
    </table>
  </div>
)}
```

## User Experience

### Default State
- All exercises start expanded
- User can see all sets immediately

### Manual Control
- Click anywhere on header to toggle
- Buttons in header don't trigger collapse (stopPropagation)
- Drag handle doesn't trigger collapse

### Auto-Collapse
- Triggered when updating reps or weight
- Only collapses when ALL sets are complete
- Provides visual feedback before collapsing

### Visual Feedback
- Border color changes to green when complete
- Background tint changes to green
- Badge shows "✓ Completo"
- Chevron rotates smoothly

## Files Modified
- `components/EditSessionModal.tsx`

## Benefits
1. Cleaner interface when editing sessions with many exercises
2. Clear visual indication of completed exercises
3. Reduces scrolling when working with multiple exercises
4. Maintains full functionality while collapsed
5. Intuitive interaction pattern (click to expand/collapse)
