const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app', 'workout', '[id]', 'page.tsx');

console.log('[Fix] Removing redundant workout start time restoration to eliminate flash...');

let content = fs.readFileSync(filePath, 'utf8');

// Remove the redundant restoration code in the useEffect
const oldCode = `        const s = storedWorkout as any;
        
        // Restaurar el tiempo de inicio del entrenamiento
        if (s.startedAt) {
          const startTime = new Date(s.startedAt).getTime();
          setWorkoutStartTime(startTime);
          console.log('[Workout Init] Restored workout start time:', new Date(startTime).toISOString());
        }
        
        workoutState.setCurrentExerciseIndex(Number(s.currentExerciseIndex ?? 0));`;

const newCode = `        const s = storedWorkout as any;
        
        // El tiempo de inicio ya fue restaurado en el useState initializer
        // No es necesario restaurarlo aquí para evitar el flash
        
        workoutState.setCurrentExerciseIndex(Number(s.currentExerciseIndex ?? 0));`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('[Fix] ✅ Successfully removed redundant restoration code');
  console.log('[Fix] The workout start time is now only read once during useState initialization');
  console.log('[Fix] This eliminates the flash caused by the useEffect overwriting the value');
} else {
  console.log('[Fix] ⚠️  Code pattern not found - may have been already fixed or modified');
}
