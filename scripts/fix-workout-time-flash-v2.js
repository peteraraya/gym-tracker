const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app', 'workout', '[id]', 'page.tsx');

console.log('Reading file:', filePath);
let content = fs.readFileSync(filePath, 'utf8');

// Fix: Usar la clave correcta de localStorage
const oldPattern = /const \[workoutStartTime, setWorkoutStartTime\] = useState\(\(\) => \{[\s\S]*?return Date\.now\(\);[\s\S]*?\}\);/;

const newCode = `const [workoutStartTime, setWorkoutStartTime] = useState(() => {
    // Intentar leer el tiempo de inicio guardado para evitar el flash
    try {
      const stored = localStorage.getItem('gym-tracker-active-workout');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.startedAt) {
          const startTime = new Date(parsed.startedAt).getTime();
          console.log('[Workout Init] Loaded start time from storage:', new Date(startTime).toISOString());
          return startTime;
        }
      }
    } catch (e) {
      console.warn('[Workout] Could not read stored start time:', e);
    }
    return Date.now();
  });`;

if (content.match(oldPattern)) {
  content = content.replace(oldPattern, newCode);
  console.log('✅ Updated workoutStartTime to use correct localStorage key');
} else {
  console.log('⚠️ Pattern not found');
}

console.log('Writing fixed file...');
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed workout time flash with correct key!');
