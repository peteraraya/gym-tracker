import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'data', 'exercises.ts');
const OUT_DIR = join(ROOT, 'data', 'exercises', 'by-muscle');

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const raw = readFileSync(SRC, 'utf8');

// Extraer el bloque del array EXERCISE_DATABASE
const startMarker = "export const EXERCISE_DATABASE: ExerciseTemplate[] = [";
const startIdx = raw.indexOf(startMarker);
if (startIdx === -1) {
  throw new Error('No se encontró la declaración de EXERCISE_DATABASE');
}

const endMarker = "export const MUSCLE_GROUPS";
const endIdx = raw.indexOf(endMarker, startIdx);
if (endIdx === -1) {
  throw new Error('No se encontró MUSCLE_GROUPS después de EXERCISE_DATABASE');
}

const arrayBlock = raw.slice(startIdx + startMarker.length, endIdx);

// Extraer objetos literales de nivel superior mediante balanceo de llaves {}
function extractTopLevelObjects(block) {
  const objects = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let stringChar = null;

  for (let i = 0; i < block.length; i++) {
    const ch = block[i];
    const prev = i > 0 ? block[i - 1] : '';

    if (inString) {
      if (ch === stringChar && prev !== '\\') inString = false;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      stringChar = ch;
      continue;
    }

    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        objects.push(block.slice(start, i + 1));
        start = -1;
      }
    }
  }

  return objects;
}

const exerciseBlocks = extractTopLevelObjects(arrayBlock);
console.log(`Ejercicios extraídos: ${exerciseBlocks.length}`);

// Agrupar por muscleGroup
const groups = {};
for (const block of exerciseBlocks) {
  const muscleMatch = block.match(/muscleGroup:\s*'([^']+)'/);
  if (!muscleMatch) continue; // saltar comentarios/bloques sueltos
  const muscle = muscleMatch[1];
  if (!groups[muscle]) groups[muscle] = [];
  groups[muscle].push(block);
}

const muscleOrder = [
  'pecho', 'espalda', 'piernas', 'gluteos', 'hombros', 'biceps', 'triceps',
  'antebrazos', 'trapecio', 'cuello', 'core', 'gemelos', 'cardio',
];

const URL_STORAGE = "https://hplrrjqgzefkdevbporx.supabase.co/storage/v1/object/public/routine-images/";

for (const muscle of muscleOrder) {
  const items = groups[muscle] || [];
  if (items.length === 0) continue;

  const safeName = muscle.replace(/[^a-z0-9]/gi, '_');
  const fileName = `exercises-${safeName}.ts`;
  const filePath = join(OUT_DIR, fileName);
  const constName = `EXERCISES_${muscle.charAt(0).toUpperCase() + muscle.slice(1)}`;

  const header = `/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Auto-generado por scripts/split-exercises-by-muscle.mjs
 * No editar manualmente. Los ejercicios de este grupo viven aquí para carga diferida.
 */
import type { ExerciseTemplate } from '@/data/exercises';

const URL_STORAGE = '${URL_STORAGE}';

export const ${constName}: ExerciseTemplate[] = [`;

  const footer = `];
`;

  const content = items.join(',\n') + '\n';
  const fileContent = header + '\n' + content + footer;

  writeFileSync(filePath, fileContent, 'utf8');
  console.log(`✅ ${fileName}: ${items.length} ejercicios`);
}

// Generar barrel groups.ts
const barrelLines = [
  '/* eslint-disable @typescript-eslint/no-explicit-any */',
  '/**',
  ' * Auto-generado por scripts/split-exercises-by-muscle.mjs',
  ' * Barrel de ejercicios por grupo muscular para carga diferida.',
  ' */',
  '',
];

for (const muscle of muscleOrder) {
  const safeName = muscle.replace(/[^a-z0-9]/gi, '_');
  const constName = `EXERCISES_${muscle.charAt(0).toUpperCase() + muscle.slice(1)}`;
  barrelLines.push(`export { ${constName} } from './by-muscle/exercises-${safeName}';`);
}

barrelLines.push('');
barrelLines.push('export type MuscleGroup =');
barrelLines.push("  | 'pecho'");
barrelLines.push("  | 'espalda'");
barrelLines.push("  | 'piernas'");
barrelLines.push("  | 'hombros'");
barrelLines.push("  | 'biceps'");
barrelLines.push("  | 'triceps'");
barrelLines.push("  | 'antebrazos'");
barrelLines.push("  | 'trapecio'");
barrelLines.push("  | 'cuello'");
barrelLines.push("  | 'core'");
barrelLines.push("  | 'gluteos'");
barrelLines.push("  | 'gemelos'");
barrelLines.push("  | 'cardio';");
barrelLines.push('');
barrelLines.push('export const MUSCLE_GROUP_FILES: Record<string, string> = {');
for (const muscle of muscleOrder) {
  const safeName = muscle.replace(/[^a-z0-9]/gi, '_');
  barrelLines.push(`  '${muscle}': './by-muscle/exercises-${safeName}',`);
}
barrelLines.push('};');
barrelLines.push('');

writeFileSync(join(ROOT, 'data', 'exercises', 'groups.ts'), barrelLines.join('\n'), 'utf8');
console.log('\n✅ Generado data/exercises/groups.ts');

console.log('\nResumen por grupo:');
for (const muscle of muscleOrder) {
  console.log(`  ${muscle}: ${(groups[muscle] || []).length}`);
}
