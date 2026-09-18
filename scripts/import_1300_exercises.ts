import fs from 'fs';
import path from 'path';

const externalDataPath = path.join(process.cwd(), 'data', 'external_exercises.json');
const outputPath = path.join(process.cwd(), 'data', 'exercises_expanded.ts');
const exercisesDbPath = path.join(process.cwd(), 'data', 'exercises.ts');

if (!fs.existsSync(externalDataPath)) {
  console.error('external_exercises.json not found.');
  process.exit(1);
}

const externalData = JSON.parse(fs.readFileSync(externalDataPath, 'utf8'));
const dbContent = fs.readFileSync(exercisesDbPath, 'utf8');

// Build a set of existing exercise names/ids to avoid duplicates
const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
const existingNames = new Set<string>();

const exerciseRegex = /name:\s*['"]([^'"]+)['"]/g;
let match;
while ((match = exerciseRegex.exec(dbContent)) !== null) {
  existingNames.add(normalize(match[1]));
}

// Function to translate and format names
const tokenMap: Record<string, string> = {
  barbell: 'Barra',
  dumbbell: 'Mancuernas',
  kettlebell: 'Kettlebell',
  machine: 'Máquina',
  cable: 'Polea',
  band: 'Banda',
  bodyweight: 'Peso corporal',
  weighted: 'Lastrado',
  back: 'Espalda',
  front: 'Frontal',
  incline: 'Inclinado',
  decline: 'Declinado',
  reverse: 'Inverso',
  stiff: 'Rígido',
  single: 'Una',
  one: 'Un',
  arm: 'Brazo',
  leg: 'Pierna',
  shrug: 'Encogimiento',
  press: 'Press',
  fly: 'Aperturas',
  squat: 'Sentadilla',
  deadlift: 'Peso Muerto',
  lunge: 'Zancada',
  row: 'Remo',
  pull: 'Jalón',
  push: 'Empuje',
  curl: 'Curl',
  extension: 'Extensión',
  calf: 'Gemelos',
  raise: 'Elevación',
  crunch: 'Crunch',
  plank: 'Plancha',
  burpee: 'Burpee',
  mobility: 'Movilidad',
  sit: 'Sentado',
  up: 'Arriba',
  down: 'Abajo',
  chest: 'Pecho',
  shoulder: 'Hombro',
  triceps: 'Tríceps',
  biceps: 'Bíceps',
  standing: 'de Pie',
  seated: 'Sentado',
  lying: 'Acostado'
};

function translateName(enName: string): string {
  const phraseMap: Array<[RegExp, string]> = [
    [/barbell bench press/i, 'Press de Banca con Barra'],
    [/incline bench press/i, 'Press Inclinado'],
    [/decline bench press/i, 'Press Declinado'],
    [/bench press/i, 'Press de Banca'],
    [/dumbbell fly/i, 'Aperturas con Mancuernas'],
    [/lat pull down/i, 'Jalón al Pecho'],
    [/pull up/i, 'Dominadas'],
    [/push up/i, 'Flexiones'],
    [/deadlift/i, 'Peso Muerto'],
    [/squat/i, 'Sentadilla'],
    [/lunge/i, 'Zancada'],
    [/sit up/i, 'Sit Up'],
  ];

  for (const [re, tx] of phraseMap) {
    if (re.test(enName)) return tx;
  }

  const cleaned = enName.replace(/[^\w\s-]/g, ' ').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const translatedParts = parts.map(p => {
    const low = p.toLowerCase();
    if (tokenMap[low]) return tokenMap[low];
    return p.charAt(0).toUpperCase() + p.slice(1);
  });
  
  return translatedParts.join(' ');
}

// Map muscle groups to our format
const muscleMap: Record<string, string> = {
  'chest': 'pecho',
  'lats': 'espalda',
  'upper back': 'espalda',
  'middle back': 'espalda',
  'lower back': 'core',
  'quads': 'piernas',
  'hamstrings': 'piernas',
  'calves': 'gemelos',
  'glutes': 'gluteos',
  'shoulders': 'hombros',
  'biceps': 'biceps',
  'triceps': 'triceps',
  'forearms': 'antebrazos',
  'traps': 'trapecio',
  'neck': 'cuello',
  'abs': 'core',
  'waist': 'core',
  'cardio': 'cardio'
};

const newExercises: any[] = [];

externalData.forEach((ex: any) => {
  const normName = normalize(ex.name);
  if (existingNames.has(normName)) return; // Skip if already exists

  const translatedName = translateName(ex.name);
  
  // Basic mapping
  const muscleGroup = muscleMap[ex.target] || muscleMap[ex.body_part] || 'core';
  
  let equipment = 'Peso corporal';
  if (ex.equipment !== 'body weight') {
    equipment = translateName(ex.equipment);
  }

  const instructions = ex.instruction_steps?.es || [];
  const description = ex.instructions?.es || '';

  newExercises.push({
    id: `ext-${ex.id}`,
    name: translatedName,
    muscleGroup,
    equipment,
    description,
    instructions,
    defaultSets: 3,
    defaultReps: 12,
    restTime: '60 segundos'
  });
});

// Generate TypeScript file content
let tsContent = `import { ExerciseTemplate } from './types';\n\n`;
tsContent += `export const EXPANDED_EXERCISES: ExerciseTemplate[] = [\n`;

newExercises.forEach((ex) => {
  const instructionsStr = ex.instructions.length > 0 
    ? `\n    instructions: [\n      ${ex.instructions.map((s: string) => `'${s.replace(/'/g, "\\'")}'`).join(',\n      ')}\n    ],`
    : '';

  tsContent += `  {
    id: '${ex.id}',
    name: '${ex.name.replace(/'/g, "\\'")}',
    muscleGroup: '${ex.muscleGroup}' as any,
    equipment: '${ex.equipment.replace(/'/g, "\\'")}',
    description: '${ex.description.replace(/'/g, "\\'")}',
    defaultSets: ${ex.defaultSets},
    defaultReps: ${ex.defaultReps},
    restTime: '${ex.restTime}',${instructionsStr}
  },\n`;
});

tsContent += `];\n`;

fs.writeFileSync(outputPath, tsContent, 'utf8');

console.log(`Successfully generated exercises_expanded.ts with ${newExercises.length} new exercises.`);
