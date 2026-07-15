import fs from 'fs';
import path from 'path';

// Import local data
import { EXPANDED_EXERCISES } from '../data/exercises_expanded';

const reportLines = EXPANDED_EXERCISES.map(ex => `- [${ex.id}] ${ex.name} (Músculo: ${ex.muscleGroup})`);

const reportContent = `Ejercicios sin imagen/video real (1322 nuevos importados):\n=======================================================\n` + reportLines.join('\n');

fs.writeFileSync('missing_exercises.txt', reportContent, 'utf8');

console.log(`Report generated: missing_exercises.txt with ${EXPANDED_EXERCISES.length} exercises.`);
