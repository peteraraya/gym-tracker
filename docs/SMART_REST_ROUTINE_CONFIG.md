# ✅ Smart Rest Configuration in Routine Editor

## Feature Overview
Users can now enable intelligent rest time calculation for each exercise when creating or editing routines. This allows exercises to automatically calculate optimal rest times based on their characteristics (sets, reps, exercise type).

## How It Works

### In Routine Editor
When editing an exercise in the routine form, users see a new "🧠 Inteligente" button next to the rest time selector:

```
⏱️ Descanso entre series:
   [🧠 Inteligente] [Manual selector]
```

### Toggle Behavior
- **OFF (Gray)**: Manual rest time - user can set a specific value
- **ON (Purple)**: Smart rest - automatically calculated based on exercise characteristics

### When Smart Rest is Enabled
- The manual rest selector is hidden
- A message shows: "El descanso se calculará automáticamente según el tipo de ejercicio"
- The exercise stores `useSmartRest: true`

## Smart Rest Calculation

When `useSmartRest` is enabled, the system calculates rest based on:

1. **Exercise Type Detection**
   - Compound exercises (squats, bench press, rows) → longer rest
   - Isolation exercises (curls, leg extensions) → shorter rest

2. **Training Type**
   - Strength (1-5 reps) → 240s (4 min)
   - Power (3-8 reps) → 180s (3 min)
   - Hypertrophy (6-12 reps) → 90s (1.5 min)
   - Endurance (12+ reps) → 45s

3. **Fitness Level**
   - Beginner → +20% rest
   - Intermediate → standard
   - Advanced → -20% rest

## Priority Order During Workout

When a workout is running, rest time is determined by this priority:

1. **Per-set override** (user changed individual set rest)
2. **Exercise override** (user changed rest in SeriesTable)
3. **Exercise config** (manual rest set in routine editor)
4. **Smart rest** (if `useSmartRest: true`)
5. **Routine default** (global rest setting)
6. **Fallback** (60 seconds)

## Example Scenarios

### Scenario 1: Strength Exercise with Smart Rest
```
Exercise: Sentadillas (Squats)
Sets: 5 × 5 reps
useSmartRest: true

Result:
- Detected as: Strength training (5 reps)
- Detected as: Compound exercise (squats)
- Calculated rest: 240s × 1.2 (compound) = 288s (4m 48s)
- Rounded to: 285s (4m 45s) - nearest 5s interval
```

### Scenario 2: Hypertrophy Exercise with Manual Rest
```
Exercise: Curl Bíceps (Bicep Curls)
Sets: 3 × 10 reps
useSmartRest: false
restBetweenSets: 120

Result:
- Uses manual value: 120s (2 min)
- Smart rest is ignored
```

### Scenario 3: Mixed Configuration
```
Exercise: Press Banca (Bench Press)
Sets: 4 × 8 reps
useSmartRest: true

During workout:
- Series 1: Uses smart rest (90s)
- Series 2: User changes to 120s (override)
- Series 3: Uses override (120s)
- Series 4: Uses override (120s)
```

## Files Modified

### 1. `types/index.ts`
- Added `useSmartRest?: boolean` field to Exercise interface

### 2. `components/RoutineForm.tsx`
- Added toggle button for smart rest in exercise settings
- Shows/hides manual rest selector based on toggle state
- Displays info message when smart rest is enabled

### 3. `app/workout/[id]/page.tsx`
- Updated `smartRestTime` useMemo to check `useSmartRest` flag
- Only calculates smart rest if exercise has it enabled

### 4. `app/workout/[id]/utils/workoutCalculations.ts`
- Updated `calculateNextRestTime` to respect `useSmartRest` flag
- Changed priority: manual rest only used if `useSmartRest` is false
- Smart rest only applied if both global flag and exercise flag are true

## UI/UX Details

### Routine Editor
```
┌─────────────────────────────────────────┐
│ ⏱️ Descanso entre series:               │
│    [🧠 Inteligente] [Manual selector]   │
│                                         │
│ El descanso se calculará automáticamente│
│ según el tipo de ejercicio              │
└─────────────────────────────────────────┘
```

### Workout Page - SeriesTable
- If exercise has `useSmartRest: true`, the smart rest button shows the calculated value
- Button: "🧠 Aplicar Descanso Inteligente a Todas (X min Y seg)"
- Clicking applies the calculated rest to all sets

## Benefits

✅ **Automatic Optimization**: Rest times adjust based on exercise characteristics
✅ **Flexibility**: Can mix smart rest and manual rest in same routine
✅ **User Control**: Can override smart rest during workout
✅ **Consistency**: Same exercise always gets same smart rest value
✅ **Science-Based**: Uses proven rest recommendations for different training types

## Testing Checklist

- [ ] Create routine with smart rest enabled for one exercise
- [ ] Create routine with smart rest disabled for another exercise
- [ ] Edit routine and toggle smart rest on/off
- [ ] Start workout and verify smart rest is applied
- [ ] Override smart rest during workout
- [ ] Verify rest time priority order works correctly
- [ ] Test with different exercise types (compound vs isolation)
- [ ] Test with different rep ranges (strength vs endurance)

---

**Date**: 27 de febrero de 2026  
**Status**: ✅ IMPLEMENTED
