# ✅ Set Type Cycle Button Implementation

## Overview
Replaced the dropdown selector for set types with a cycle button that changes the type on each click and shows a tooltip with the description. This eliminates the need for a dropdown menu and provides a faster, more intuitive UX.

## What Changed

### Before
- Dropdown selector with 7 options
- Required opening menu to see all types
- Took up more space
- Slower interaction

### After
- Single button that cycles through types
- Shows current type with icon and label
- Tooltip on hover shows description
- Compact design
- Faster interaction (one click to cycle)

## Component: SetTypeCycleButton

### Location
`components/SetTypeCycleButton.tsx`

### Features
- **Cycle on Click**: Each click cycles to the next type
- **Tooltip**: Hover shows type name and description
- **Responsive Sizes**: sm, md, lg
- **Optional Label**: Can show/hide the type label
- **Dark Mode**: Full dark mode support
- **Accessible**: Proper title attribute for screen readers

### Props
```typescript
interface SetTypeCycleButtonProps {
  value: SetType;                    // Current set type
  onChange: (type: SetType) => void; // Callback when type changes
  size?: 'sm' | 'md' | 'lg';        // Button size (default: 'md')
  showLabel?: boolean;               // Show type label (default: true)
}
```

### Set Types (in cycle order)
1. 💪 **Normal** - Serie estándar de trabajo
2. 🔥 **Calentamiento** - Serie de calentamiento con peso ligero
3. ⬇️ **Drop Set** - Reducir peso y continuar sin descanso
4. 🔴 **Al Fallo** - Serie hasta el fallo muscular
5. ♾️ **AMRAP** - Máximas repeticiones posibles
6. ⏸️ **Rest-Pause** - Pausas cortas dentro de la serie
7. 🔗 **Cluster** - Mini-series con descansos breves

## Usage in SeriesTable

### Desktop View
- Shows cycle button in the "Tipo" column
- Size: sm, no label (just icon)
- Compact design fits well in table

### Mobile View
- Shows cycle button above the table
- Size: sm, with label
- Better visibility on small screens

## Tooltip Behavior

### Hover State
```
┌─────────────────────────┐
│  Normal                 │
│  Serie estándar de...   │
└─────────────────────────┘
         ▼
    [💪 Normal]
```

### Tooltip Content
- **Title**: Type name (e.g., "Normal")
- **Description**: What the type means
- **Arrow**: Points to button
- **Dark Background**: High contrast for readability

## User Experience

### Desktop Workflow
1. User sees set type button in table
2. Hovers to see tooltip with description
3. Clicks to cycle to next type
4. Tooltip updates to show new type
5. Repeat until desired type is selected

### Mobile Workflow
1. User sees set type button above table
2. Taps to cycle to next type
3. Button shows new type with label
4. Can long-press to see tooltip (if supported)

## Benefits

✅ **Faster**: One click to cycle vs. opening dropdown
✅ **Compact**: Takes less space than dropdown
✅ **Intuitive**: Visual feedback with icons and colors
✅ **Accessible**: Tooltip shows meaning of each type
✅ **Mobile-Friendly**: Works great on touch devices
✅ **Consistent**: Same interaction pattern everywhere

## Implementation Details

### Color Coding
Each set type has a unique color:
- Normal: Blue
- Warmup: Orange
- Drop Set: Purple
- Failure: Red
- AMRAP: Green
- Rest-Pause: Cyan
- Cluster: Pink

### Cycle Order
The cycle order is fixed and logical:
1. Start with Normal (most common)
2. Warmup (preparation)
3. Drop Set (intensity)
4. Failure (max effort)
5. AMRAP (volume)
6. Rest-Pause (advanced)
7. Cluster (advanced)

### Tooltip Positioning
- Appears above button on hover
- Centered horizontally
- Arrow points down to button
- Stays within viewport

## Files Modified

1. **components/SetTypeCycleButton.tsx** (NEW)
   - New cycle button component
   - Tooltip implementation
   - Responsive sizing

2. **app/workout/[id]/components/SeriesTable.tsx**
   - Replaced dropdown with cycle button (desktop)
   - Replaced mobile button with cycle button
   - Added import for SetTypeCycleButton

## Testing Scenarios

### Scenario 1: Desktop Cycle
1. Open workout
2. Look at SeriesTable
3. Hover over type button → see tooltip
4. Click button → type changes
5. Repeat → cycles through all 7 types

### Scenario 2: Mobile Cycle
1. Open workout on mobile
2. Look at mobile type selector above table
3. Tap button → type changes
4. Repeat → cycles through all 7 types

### Scenario 3: Completed Set
1. Mark set as complete
2. Type button changes to badge (read-only)
3. Shows type with checkmark

### Scenario 4: Tooltip Content
1. Hover over each type
2. Verify tooltip shows correct name
3. Verify tooltip shows correct description
4. Verify tooltip positioning

## Accessibility

✅ **Keyboard**: Can be focused and activated with Enter/Space
✅ **Screen Readers**: Title attribute provides context
✅ **Color**: Not the only indicator (icon + label + color)
✅ **Contrast**: High contrast colors for readability
✅ **Touch**: Large enough for touch targets (min 44px)

## Performance

- No dropdown DOM overhead
- Minimal re-renders
- Tooltip only renders on hover
- Smooth transitions and animations

## Future Enhancements

- [ ] Keyboard shortcuts to cycle types (e.g., arrow keys)
- [ ] Customizable cycle order
- [ ] Remember last used type
- [ ] Batch change types for multiple sets
- [ ] Undo/redo for type changes

---

**Date**: 27 de febrero de 2026  
**Status**: ✅ IMPLEMENTED
**Component**: SetTypeCycleButton
