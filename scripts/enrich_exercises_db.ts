import fs from 'fs';
import path from 'path';

// This script reads the external_exercises.json and updates data/exercises.ts
// by finding matching exercises and injecting `description` and `instructions` in Spanish.

const externalDataPath = path.join(process.cwd(), 'data', 'external_exercises.json');
const exercisesDbPath = path.join(process.cwd(), 'data', 'exercises.ts');

if (!fs.existsSync(externalDataPath)) {
  console.error('external_exercises.json not found. Please download it first.');
  process.exit(1);
}

const externalData = JSON.parse(fs.readFileSync(externalDataPath, 'utf8'));
const dbContent = fs.readFileSync(exercisesDbPath, 'utf8');

// Build a map for easy lookup by name
// We'll normalize names for better matching
const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

const externalMap = new Map();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
externalData.forEach((ex: any) => {
  const normName = normalize(ex.name);
  externalMap.set(normName, ex);
  // Also map by ID if it's somehow matching
  externalMap.set(normalize(ex.id), ex);
});

// We will use regex to find each exercise object in the EXERCISE_DATABASE array.
// This is a naive but effective approach for formatted TS files.

console.log('Starting enrichment process...');

let matchCount = 0;

// Regular expression to match each exercise object
// Assuming each starts with `{` and has an `id: '...'`
const exerciseRegex = /{\s*id:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+)['"]([^}]+)}/g;

const newDbContent = dbContent.replace(exerciseRegex, (match, id, name, restOfObject) => {
  const normName = normalize(name);
  const normId = normalize(id.replace(/-/g, ' '));
  
  // Try to find a match in the external dataset
  const externalEx = externalMap.get(normName) || externalMap.get(normId);

  if (externalEx && externalEx.instructions?.es) {
    matchCount++;
    const description = externalEx.instructions.es.replace(/'/g, "\\'");
    
    let updatedMatch = match;
    
    // Add or update description
    if (!restOfObject.includes('description:')) {
      updatedMatch = updatedMatch.replace(
        `name: '${name}',`,
        `name: '${name}',\n    description: '${description}',`
      );
    }
    
    // Add instructions if available
    const steps = externalEx.instruction_steps?.es;
    if (steps && !restOfObject.includes('instructions:')) {
      const stepsFormatted = steps.map((s: string) => `'${s.replace(/'/g, "\\'")}'`).join(',\n      ');
      updatedMatch = updatedMatch.replace(
        `name: '${name}',`,
        `name: '${name}',\n    instructions: [\n      ${stepsFormatted}\n    ],`
      );
    }
    
    return updatedMatch;
  }

  return match;
});

fs.writeFileSync(exercisesDbPath, newDbContent, 'utf8');

console.log(`Enrichment complete. Successfully matched and updated ${matchCount} exercises.`);
