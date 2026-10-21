import fs from 'fs';
import path from 'path';

// Import local data
import { EXERCISE_DATABASE, getExercisesByMuscleGroup } from '../data/exercises';
import { EXPANDED_EXERCISES } from '../data/exercises_expanded';

const mainDbHasExplicit = EXERCISE_DATABASE.filter(ex => ex.image || ex.youtubeVideoId).length;
const expandedHasExplicit = EXPANDED_EXERCISES.filter(ex => ex.image || ex.youtubeVideoId).length;

console.log(`Original DB exercises with explicit image/video: ${mainDbHasExplicit} / ${EXERCISE_DATABASE.length}`);
console.log(`Expanded DB exercises with explicit image/video: ${expandedHasExplicit} / ${EXPANDED_EXERCISES.length}`);

// We can output a list of exercises missing images to a text file
const missing = [...EXERCISE_DATABASE, ...EXPANDED_EXERCISES].filter(ex => !ex.image && !ex.youtubeVideoId);

fs.writeFileSync('missing_exercises_report.txt', missing.map(ex => `- [${ex.id}] ${ex.name} (${ex.muscleGroup})`).join('\n'), 'utf8');

console.log(`Report generated: missing_exercises_report.txt with ${missing.length} exercises.`);
