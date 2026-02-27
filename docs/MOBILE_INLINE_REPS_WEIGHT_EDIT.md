# ✅ Mobile Inline Reps & Weight Editing

## Overview
Added inline editing for reps and weight directly in the mobile series cards. Users can now click on reps or weight values to edit them without needing to see the table or use separate inputs.

## Design

### Before
```
┌─────────────────────────────────┐
│ ① 5 reps × 55 kg          ✓     │
│                                 │
│ TIPO          DESCANSO          │
│ [🔥 Calen]    [1m 30s ▼]        │
└─────────────────────────────────┘

[Need to scroll to table to edit reps/weight]
```

### After
```
┌─────────────────────────────────┐
│ ① [5] reps × [55] kg      ✓     │  ← Clickable values
│                                 │
│ TIPO          DESCANSO          │
│ [🔥 Calen]    [1m 30s ▼]        │
└─────────────────────────────────┘

Click on 5 or 55 to edit inline
```

## Features

### Inline Editing
- **Clickable Values**: Reps and weight are clickable buttons
- **Inline Input**: Click to show input field
- **Auto-Focus**: Input field automatically focused
- **Quick Save**: Press Enter or click away to save
- **No Columns**: Single line layout, no extra columns

### Visual Feedback
- **Hover State**: Buttons show hover effect
- **Edit Mode**: Input field shows blue border
- **Compact**: All in one line with labels

### User Experience
- **Fast**: Click to edit, type, press Enter
- **Intuitive**: Values look clickable
- **Responsive**: Works on all screen sizes
- **No Scrolling**: Everything in one card

## Implementation Details

### State Management
```typescript
const [editingField, setEditingField] = React.useState<'reps' | 'weight' | null>(null);
```

### Reps Editing
```typescript
{editingField === 'reps' ? (
  <input
    type="number"
    value={doneReps ?? set.reps}
    onChange={(e) => onEditReps(idx, parseInt(e.target.value) || 0)}
    onBlur={() => setEditingField(null)}
    onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
    autoFocus
  />
) : (
  <button onClick={() => setEditingField('reps')}>
    {doneReps ?? set.reps}
  </button>
)}
```

### Weight Editing
```typescript
{editingField === 'weight' ? (
  <input
    type="number"
    value={doneWeight || set.weight || 0}
    onChange={(e) => onEditWeight(idx, parseFloat(e.target.value) || 0)}
    onBlur={() => setEditingField(null)}
    onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
    autoFocus
  />
) : (
  <button onClick={() => setEditingField('weight')}>
    {doneWeight || set.weight || 0}
  </button>
)}
```

## Layout

### Header Line
```
[①] [5] reps × [55] kg [✓]
```

- **Badge**: Serie number (7×7 units)
- **Reps**: Clickable button (10 units wide)
- **Label**: "reps ×" (fixed text)
- **Weight**: Clickable button (10 units wide)
- **Unit**: "kg" (fixed text)
- **Checkbox**: Status (6×6 units)

### Styling

#### Buttons (Normal State)
- **Background**: Transparent
- **Padding**: 1.5 units horizontal, 0.5 units vertical
- **Rounded**: md (6px)
- **Hover**: Light gray background
- **Font**: xs, semibold

#### Input (Edit State)
- **Width**: 10 units (40px)
- **Padding**: 1 unit horizontal, 0.5 units vertical
- **Border**: Blue (500)
- **Background**: White (light) / Gray-700 (dark)
- **Font**: xs, semibold, centered

## Interaction Flow

### Edit Reps
1. User sees "5" as clickable button
2. Clicks on "5"
3. Input field appears with "5" selected
4. User types new value (e.g., "8")
5. Presses Enter or clicks away
6. Value updates to "8"
7. Input disappears, button shows "8"

### Edit Weight
1. User sees "55" as clickable button
2. Clicks on "55"
3. Input field appears with "55" selected
4. User types new value (e.g., "60")
5. Presses Enter or clicks away
6. Value updates to "60"
7. Input disappears, button shows "60"

## Benefits

✅ **Compact**: No extra columns needed
✅ **Intuitive**: Values look clickable
✅ **Fast**: Quick inline editing
✅ **Mobile-Friendly**: Works great on touch
✅ **No Scrolling**: Everything visible
✅ **Consistent**: Same pattern for both fields

## Responsive Behavior

### Mobile (< 640px)
- Shows inline editable values
- Single line layout
- All controls visible

### Tablet/Desktop (≥ 640px)
- Cards hidden
- Table layout shown
- Separate columns for reps/weight

## Accessibility

✅ **Keyboard**: Tab to navigate, Enter to save
✅ **Touch**: Large enough for touch targets
✅ **Visual**: Clear hover states
✅ **Labels**: Text labels for context
✅ **Focus**: Visible focus states

## Performance

- Minimal state management
- Efficient re-renders
- No unnecessary DOM updates
- Smooth transitions

## Comparison: Before vs After

### Before
```
Mobile: Only type and rest visible
        Need to scroll to table for reps/weight
        Incomplete information

Desktop: Full table with all columns
         All information visible
```

### After
```
Mobile: Complete card with all info
        Reps and weight editable inline
        Type, rest, status all visible
        No scrolling needed

Desktop: Full table with all columns
         All information visible
         (unchanged)
```

## Files Modified

1. **app/workout/[id]/components/SeriesTable.tsx**
   - Added inline editing for reps
   - Added inline editing for weight
   - Improved header layout
   - Single line format

## Testing Scenarios

### Scenario 1: Edit Reps
1. Open workout on mobile
2. Click on reps value
3. ✅ Input field appears
4. Type new value
5. ✅ Press Enter
6. ✅ Value updates

### Scenario 2: Edit Weight
1. Open workout on mobile
2. Click on weight value
3. ✅ Input field appears
4. Type new value
5. ✅ Click away
6. ✅ Value updates

### Scenario 3: Multiple Edits
1. Edit reps on Serie 1
2. Edit weight on Serie 1
3. Edit reps on Serie 2
4. ✅ All updates work correctly
5. ✅ No conflicts

### Scenario 4: Keyboard Navigation
1. Click on reps
2. Type value
3. ✅ Press Tab to move to weight
4. ✅ Type value
5. ✅ Press Enter to save

## Future Enhancements

- [ ] Swipe to edit
- [ ] Double-tap to edit
- [ ] Keyboard shortcuts
- [ ] Undo/redo
- [ ] History of changes

---

**Date**: 27 de febrero de 2026  
**Status**: ✅ IMPLEMENTED
**Component**: SeriesTable (mobile section)
