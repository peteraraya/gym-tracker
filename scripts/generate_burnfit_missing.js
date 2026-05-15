const fs = require('fs');
const path = require('path');

const IN = path.join(__dirname, '..', 'reports', 'missing_burnfit.txt');
const OUT = path.join(__dirname, '..', 'data', 'exercises_burnfit_missing.ts');
const URL_STORAGE = 'https://hplrrjqgzefkdevbporx.supabase.co/storage/v1/object/public/routine-images/';

const raw = fs.readFileSync(IN, 'utf8');
const lines = raw.split(/\r?\n/).filter(Boolean);

function titleCase(s) {
  return s
    .split(/\s+/)
    .map(w => w.split("-").map(p => p.length ? p[0].toUpperCase() + p.slice(1) : p).join(' '))
    .join(' ')
    .replace(/\s+&\s+/g, ' & ');
}

function detectMuscleGroup(name) {
  const n = name.toLowerCase();
  // Orden de chequeo: específico → general para reducir falsos positivos
  if (/\b(calves|calf|tibialis|toe|stair)\b/.test(n)) return 'gemelos';
  if (/\b(glute|hip|thrust|bridge|kickback|glute-ham)\b/.test(n)) return 'gluteos';
  if (/\b(crunch|plank|ab|hollow|v-up|toes to bar|sit up|leg raise|hanging|pallof|rkc|dragon|ab wheel|abs|hollow rock|hollow-position|heel touch|reverse crunch|toe touches)\b/.test(n)) return 'core';
  if (/\b(run|treadmill|cycle|bike|rowing|elliptical|assault|battle|jump rope|burpee|ski|hiking|swimming|shadow|cardio|spin|stair|stairmaster|jumping-jack|double under)\b/.test(n)) return 'cardio';
  if (/\b(squat|lunge|leg|front squat|back squat|split squat|bulgarian|goblet|pistol|hack|zercher|sumo|leg press|nordic|hamstring|romanian|stiff leg|deadlift|good-morning|belt-squat)\b/.test(n)) return 'piernas';
  if (/\b(shoulder|deltoid|arnold|overhead press|overhead|upright|lateral raise|front raise|rear delt|shrug|landmine|y raise|plate shoulder|military)\b/.test(n)) return 'hombros';
  if (/\b(bench|fly|pec|push up|push-ups|pushups|dips|chest|incline bench|decline bench|bench-press|bench press|push-ups|push-ups)\b/.test(n)) return 'pecho';
  if (/\b(pull|row|lat|pulldown|chin|t-bar|pullover|rack pull|hyperextension|back extension|pendlay|meadows|seal-row|underhand lat)\b/.test(n)) return 'espalda';
  if (/\b(bicep|curl|hammer|preacher|concentration|zottman|21s|waiter|reverse-curl|ez-bar-curl)\b/.test(n)) return 'biceps';
  if (/\b(tricep|skull|kickback|pushdown|tricep|jm press|tricep extension)\b/.test(n)) return 'triceps';
  return 'piernas';
}

function detectEquipment(name) {
  const n = name.toLowerCase();
  if (/barbell|bar-bell|bar bell|bar/.test(n)) return 'Barra';
  if (/dumbbell|dumb-bell|dumb bell|dumb/.test(n)) return 'Mancuernas';
  if (/kettlebell|kettle/.test(n)) return 'Kettlebell';
  if (/machine|smith|machine|máquina|smith machine|machine/.test(n)) return 'Máquina';
  if (/cable|pulley|polea|pulldown|pulldown|cable|rope/.test(n)) return 'Poleas';
  if (/band|banda|banded/.test(n)) return 'Banda elástica';
  if (/bodyweight|body weight|push up|push-ups|pushups|burpee|handstand|air squat|box jump|sit up|plank|push up|push-up|pull up|pull-up|chin up|chin-up/.test(n)) return 'Peso corporal';
  if (/treadmill/.test(n)) return 'Trotadora';
  if (/bike|spin|stationary-bike|recumbent/.test(n)) return 'Bicicleta estática';
  if (/rope|battle|jump rope/.test(n)) return 'Cuerda de saltar';
  return 'Peso corporal';
}

function defaultSetsReps(mg, name) {
  if (mg === 'cardio') return { sets: 1, reps: 1 };
  const n = name.toLowerCase();
  if (/squat|deadlift|clean|snatch|press|bench|jerk|thruster|power|trap-bar|trap bar|trap-bar/.test(n)) return { sets: 4, reps: 8 };
  return { sets: 3, reps: 12 };
}

let out = '';
out += "import type { ExerciseTemplate } from './exercises';\n\n";
out += "export const BURNFIT_MISSING: ExerciseTemplate[] = [\n";

for (const line of lines) {
  const parts = line.split('\t');
  const slug = parts[0].trim();
  const name = (parts[1] || parts[0] || '').trim();
  if (!slug) continue;
  const title = titleCase(name);
  const mg = detectMuscleGroup(name);
  const eq = detectEquipment(name);
  const dr = defaultSetsReps(mg, name);
  out += `  {\n`;
  out += `    id: '${slug}',\n`;
  out += `    name: ${JSON.stringify(title)},\n`;
  out += `    muscleGroup: '${mg}',\n`;
  out += `    equipment: ${JSON.stringify(eq)},\n`;
  out += `    defaultSets: ${dr.sets},\n`;
  out += `    defaultReps: ${dr.reps},\n`;
  out += `    image: '${URL_STORAGE}male-${slug}-front.gif'\n`;
  out += `  },\n`;
}

out += `];\n`;

fs.writeFileSync(OUT, out, 'utf8');
console.log('WROTE', OUT, 'entries:', lines.length);
