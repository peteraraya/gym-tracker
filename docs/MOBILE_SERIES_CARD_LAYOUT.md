# ✅ Mobile Series Card Layout Redesigned

## Overview
Redesigned the mobile layout for series controls to use a card-based design that groups all information per series in a visually organized way.

## Design Changes

### Before
```
Serie 1
Tipo: [🔥 Calentamiento]
Descanso: [90s ▼]

Serie 2
Tipo: [⬇️ Drop Set]
Descanso: [120s ▼]
```

### After
```
┌─────────────────────────────────┐
│ ① 5 reps × 55 kg                │
│                                 │
│ TIPO          DESCANSO          │
│ [🔥 Calen]    [90s ▼]           │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ ② 5 reps × 55 kg                │
│                                 │
│ TIPO          DESCANSO          │
│ [⬇️ Drop]     [120s ▼]          │
└─────────────────────────────────┘
```

## Features

### Card Design
- **Gradient Background**: Light gray to white (light mode), dark gray to darker (dark mode)
- **Border**: Subtle border for definition
- **Rounded Corners**: lg (8px) for modern look
- **Padding**: 3 units (12px) for comfortable spacing

### Serie Header
- **Number Badge**: Circular badge with serie number
  - Blue (600) if current serie
  - Gray (400/600) if not current
- **Info Line**: Shows "X reps × Y kg"
- **Visual Hierarchy**: Clear and easy to scan

### Controls Grid
- **2-Column Layout**: Type and Rest side by side
- **Labels**: Small uppercase labels above each control
- **Spacing**: 2 units (8px) between columns
- **Responsive**: Fills available width

### Type Selector
- **Cycle Button**: No label (just icon)
- **Compact**: Fits well in grid
- **Tooltip**: Shows on hover

### Rest Selector
- **Dropdown**: Full width in column
- **Styling**: White background with border
- **Focus State**: Blue ring on focus
- **Options**: 5s to 300s in 5-second intervals

## Visual Hierarchy

```
┌─────────────────────────────────┐
│ ① 5 reps × 55 kg                │  ← Serie info (prominent)
│                                 │
│ TIPO          DESCANSO          │  ← Labels (small, uppercase)
│ [🔥 Calen]    [90s ▼]           │  ← Controls (interactive)
└─────────────────────────────────┘
```

## Color Coding

### Current Serie
- Badge: Blue (600)
- Indicates which serie is being worked on

### Inactive Serie
- Badge: Gray (400 light / 600 dark)
- Shows upcoming series

### Card Background
- Light Mode: Gray-50 to Gray-100 gradient
- Dark Mode: Gray-800 to Gray-900 gradient

## Spacing & Layout

### Vertical Spacing
- Between cards: 2 units (8px)
- Within card: 2.5 units (10px)

### Horizontal Spacing
- Card padding: 3 units (12px)
- Grid gap: 2 units (8px)
- Label to control: 1 unit (4px)

## Typography

### Serie Info
- Size: sm (14px)
- Weight: semibold (600)
- Color: Gray-900 (light) / Gray-100 (dark)

### Labels
- Size: 10px
- Weight: semibold (600)
- Color: Gray-600 (light) / Gray-400 (dark)
- Transform: uppercase
- Letter-spacing: wide

### Controls
- Size: xs (12px)
- Weight: medium (500)
- Color: Gray-900 (light) / Gray-100 (dark)

## Responsive Behavior

### Mobile (< 640px)
- Shows card layout
- 2-column grid for controls
- Full width cards

### Tablet/Desktop (≥ 640px)
- Cards hidden
- Table layout shown
- All columns visible

## User Experience

### Workflow
1. User sees series cards above table
2. Each card shows:
   - Serie number (with color indicator)
   - Reps and weight info
   - Type selector (cycle button)
   - Rest time selector (dropdown)
3. User can:
   - Quickly identify current serie
   - Change type by clicking button
   - Change rest time by selecting dropdown
4. Completed series automatically hide

### Benefits
✅ **Organized**: All info for one serie in one place
✅ **Scannable**: Easy to find what you need
✅ **Compact**: Fits well on mobile screens
✅ **Visual**: Color coding shows current serie
✅ **Efficient**: Two controls side by side

## Implementation Details

### Card Structure
```typescript
<div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded-lg space-y-2.5">
  {/* Serie header with number and info */}
  {/* Controls grid with type and rest */}
</div>
```

### Badge Logic
```typescript
const badgeColor = idx === currentSet - 1 ? 'bg-blue-600' : 'bg-gray-400 dark:bg-gray-600';
```

### Grid Layout
```typescript
<div className="grid grid-cols-2 gap-2">
  {/* Type selector */}
  {/* Rest selector */}
</div>
```

## Files Modified

1. **app/workout/[id]/components/SeriesTable.tsx**
   - Redesigned mobile section
   - Added card-based layout
   - Improved visual hierarchy
   - Better spacing and typography

## Testing Scenarios

### Scenario 1: Visual Layout
1. Open workout on mobile
2. ✅ See card layout above table
3. ✅ Each card shows serie info
4. ✅ Controls are side by side
5. ✅ Current serie badge is blue

### Scenario 2: Interaction
1. Click type button
2. ✅ Type cycles to next
3. ✅ Tooltip shows on hover
4. Select rest time
5. ✅ Dropdown opens
6. ✅ Can select any option

### Scenario 3: Completed Sets
1. Mark series as complete
2. ✅ Completed series disappear
3. ✅ Only incomplete series show

### Scenario 4: Dark Mode
1. Switch to dark mode
2. ✅ Cards have dark gradient
3. ✅ Text is readable
4. ✅ Borders are visible

## Accessibility

✅ **Color**: Not only indicator (number + color)
✅ **Contrast**: High contrast for readability
✅ **Touch**: Large enough for touch targets
✅ **Labels**: Clear labels for each control
✅ **Focus**: Visible focus states

## Performance

- Minimal DOM overhead
- Efficient re-renders
- Smooth transitions
- No layout shifts

## Future Enhancements

- [ ] Swipe to navigate between series
- [ ] Drag to reorder series
- [ ] Quick presets for rest times
- [ ] Animated transitions
- [ ] Haptic feedback on mobile

---

**Date**: 27 de febrero de 2026  
**Status**: ✅ IMPLEMENTED
**Component**: SeriesTable (mobile section)
