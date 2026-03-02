const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app', 'workout', '[id]', 'page.tsx');

console.log('Reading file:', filePath);
let content = fs.readFileSync(filePath, 'utf8');

// Fix: Cambiar la inicialización de workoutStartTime para que use el activeWorkout.startedAt si existe
const oldPattern = /const \[workoutStartTime\] = useState\(\(\) => Date\.now\(\)\);/;
const newCode = `const [workoutStartTime, setWorkoutStartTime] = useState(() => Date.now());`;

if (content.match(oldPattern)) {
  content = content.replace(oldPattern, newCode);
  console.log('✅ Changed workoutStartTime to use setter');
} else {
  console.log('⚠️ Pattern not found, workoutStartTime might already be updated');
}

// Agregar código para restaurar el tiempo de inicio en el useEffect de inicialización
// Buscar donde se restaura el storedWorkout y agregar la restauración del tiempo
const restorePattern = /(if \(storedWorkout && storedWorkout\.routineId === id\) \{[\s\S]*?const s = storedWorkout as any;)/;

if (content.match(restorePattern)) {
  const replacement = `$1
        
        // Restaurar el tiempo de inicio del entrenamiento
        if (s.startedAt) {
          const startTime = new Date(s.startedAt).getTime();
          setWorkoutStartTime(startTime);
          console.log('[Workout Init] Restored workout start time:', new Date(startTime).toISOString());
        }`;
  
  content = content.replace(restorePattern, replacement);
  console.log('✅ Added workout start time restoration');
} else {
  console.log('⚠️ Could not find restoration pattern');
}

console.log('Writing fixed file...');
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed workout time reset issue!');
