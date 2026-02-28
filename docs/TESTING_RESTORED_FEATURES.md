# Testing Guide - Restored Workout Features

## Quick Test Checklist

### 1. Weight Suggestions ✓
**Location:** Exercise card during workout

**Test Steps:**
1. Start a workout with a routine that has exercises with history
2. Look for the weight suggestion banner above the weight input
3. Banner should show:
   - Suggested weight (e.g., "💪 70kg (+5kg)")
   - Reason for suggestion (e.g., "Completaste 3 series con 10 reps. ¡Hora de subir!")
   - Confidence level (color coded: green=high, blue=medium, yellow=low)
4. Click "Usar [weight]kg" button
5. Verify weight input is updated with suggested weight
6. Complete the set
7. Verify toast notification appears with encouragement message

**Expected Behavior:**
- Suggestion appears when exercise has history
- Suggestion is based on last 5 sessions
- Clicking button applies weight immediately
- Toast shows after completing set

---

### 2. Achievement Notifications ✓
**Location:** After completing and saving workout

**Test Steps:**
1. Complete a full workout
2. Fill in notes (optional)
3. Click "Guardar y finalizar"
4. Wait for session to save
5. Watch for achievement toast notifications
6. Navigate to /achievements page
7. Verify newly unlocked achievements appear

**Expected Behavior:**
- Toast notification appears for each new achievement
- Format: "🏆 ¡Logro desbloqueado! [Achievement Name]"
- Notification lasts 5 seconds
- No duplicate notifications for same achievement
- Achievements page shows all unlocked achievements

**Achievement Examples:**
- "Primer Paso" - Complete 3 workouts
- "Fuerza Inicial" - Lift 1,000 kg total
- "Compromiso Sólido" - Complete 12 workouts

---

### 3. Motivational Messages During Rest ✓
**Location:** Rest timer between sets

**Test Steps:**
1. Start a workout
2. Complete a set
3. Rest timer should appear fullscreen
4. Observe messages that appear during rest:
   - At start: Encouraging message
   - During rest: Motivational messages
   - Near end: Preparation messages
   - At completion: Celebration message
5. Messages should pulse/animate for visibility
6. Messages change as time progresses

**Expected Behavior:**
- Messages appear automatically
- Messages are contextual to remaining time
- Animation makes messages noticeable
- Messages are in Spanish
- Messages are encouraging and positive

**Example Messages:**
- "¡Vamos! Casi listo..." (Come on! Almost ready...)
- "Prepárate para la siguiente serie" (Get ready for next set)
- "✓ ¡Descanso Completado!" (Rest Complete!)

---

### 4. Auto-Start Timer ✓
**Location:** Rest timer between sets

**Test Steps:**
1. Complete a set
2. Rest timer should appear
3. Timer should start automatically (no need to click play)
4. Verify countdown begins immediately
5. Complete rest and verify next set loads

**Expected Behavior:**
- Timer starts without user interaction
- Countdown is visible and accurate
- Timer completes and advances to next set
- No manual start button needed

---

## Integration Test Scenario

**Complete Workout Flow:**

1. **Start Workout**
   - Select a routine with exercise history
   - Verify weight suggestions appear

2. **First Set**
   - See weight suggestion banner
   - Accept or ignore suggestion
   - Complete set
   - See encouragement toast

3. **Rest Period**
   - Timer appears fullscreen
   - Starts automatically
   - Shows motivational messages
   - Messages change as time progresses

4. **Subsequent Sets**
   - Weight suggestions update for each set
   - Toasts show for each completed set
   - Rest timers show motivational messages

5. **Finish Workout**
   - Complete all exercises
   - Add notes (optional)
   - Save workout
   - See achievement notifications
   - Verify session saved

---

## Debugging Tips

### Weight Suggestions Not Appearing
- Check if exercise has history (at least 1 previous session)
- Verify `generateWeightSuggestion` is being called
- Check browser console for errors
- Verify sessions data is loaded

### Achievement Notifications Not Showing
- Check if new achievements were unlocked
- Verify `calculateAchievements` is being called
- Check if achievement was already shown before
- Verify toast context is working

### Motivational Messages Not Showing
- Verify `showMotivation={true}` is set on Timer
- Check if `getRestMessage` function is working
- Verify rest timer is displaying
- Check browser console for errors

### Auto-Start Timer Not Working
- Verify `autoStart={true}` is set on Timer
- Check if timer duration is > 0
- Verify timer component is mounted
- Check browser console for errors

---

## Performance Considerations

- Weight suggestions are calculated once per exercise change
- Achievements are calculated once at workout completion
- Motivational messages are generated dynamically
- No performance impact on main workout flow

---

## Browser Compatibility

- All features work on modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design works on mobile and desktop
- Toast notifications work on all devices
- Timer animations smooth on all platforms

---

## Known Limitations

- Weight suggestions require at least 1 previous session
- Achievements are calculated after session is saved
- Motivational messages are in Spanish only
- Toast notifications may be hidden if browser notifications are disabled

---

## Rollback Instructions

If issues occur, revert these files:
1. `app/workout/[id]/page.tsx`
2. `app/workout/[id]/components/ExerciseCard.tsx`

All other files remain unchanged and can be used independently.
