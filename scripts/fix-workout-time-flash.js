const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app', 'workout', '[id]', 'page.tsx');

console.log('Reading file:', filePath);
let content = fs.readFileSync(filePath, 'utf8');

// Fix: Cambiar la inicialización de workoutStartTime para leer de localStorage inmediatamente
const oldPattern = /const \[workoutStartTime, setWorkoutStartTime\] = useState\(\(\) => Date\.now\(\)\);/;

const newCode = `const [workoutStartTime, setWorkoutStartTime] = useState(() => {
    // Intentar leer el tiempo de inicio guardado para evitar el flash
    try {
      const stored = localStorage.getItem('activeWorkout');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.startedAt) {
          return new Date(parsed.startedAt).getTime();
        }
      }
    } catch (e) {
      console.warn('[Workout] Could not read stored start time:', e);
    }
    return Date.now();
  });`;

if (content.match(oldPattern)) {
  content = content.replace(oldPattern, newCode);
  console.log('✅ Updated workoutStartTime initialization to read from localStorage');
} else {
  console.log('⚠️ Pattern not found, trying alternative pattern');
  
  // Intentar con el patrón anterior
  const altPattern = /const \[workoutStartTime\] = useState\(\(\) => Date\.now\(\)\);/;
  if (content.match(altPattern)) {
    const altNewCode = `const [workoutStartTime, setWorkoutStartTime] = useState(() => {
    // Intentar leer el tiempo de inicio guardado para evitar el flash
    try {
      const stored = localStorage.getItem('activeWorkout');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.startedAt) {
          return new Date(parsed.startedAt).getTime();
        }
      }
    } catch (e) {
      console.warn('[Workout] Could not read stored start time:', e);
    }
    return Date.now();
  });`;
    content = content.replace(altPattern, altNewCode);
    console.log('✅ Updated workoutStartTime initialization (alternative pattern)');
  }
}

console.log('Writing fixed file...');
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed workout time flash issue!');
