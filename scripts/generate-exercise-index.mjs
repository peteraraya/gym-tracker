import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'data', 'exercises.ts');
const OUT = join(ROOT, 'data', 'exercises', 'index.ts');

const raw = readFileSync(SRC, 'utf8');

const startMarker = "export const EXERCISE_DATABASE: ExerciseTemplate[] = [";
const startIdx = raw.indexOf(startMarker);
if (startIdx === -1) throw new Error('No se encontró EXERCISE_DATABASE');

const endMarker = "export const MUSCLE_GROUPS";
const endIdx = raw.indexOf(endMarker, startIdx);
if (endIdx === -1) throw new Error('No se encontró MUSCLE_GROUPS');

const arrayBlock = raw.slice(startIdx + startMarker.length, endIdx);

// Extraer objetos de nivel superior mediante balanceo de llaves {}
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

const blocks = extractTopLevelObjects(arrayBlock);

// Extraer solo campos ligeros de cada bloque
function extractField(block, field) {
  const m = block.match(new RegExp(`${field}:\\s*'([^']*)'`));
  return m ? m[1] : null;
}

const indexEntries = [];
for (const block of blocks) {
  const id = extractField(block, 'id');
  const name = extractField(block, 'name');
  const muscleGroup = extractField(block, 'muscleGroup');
  const equipment = extractField(block, 'equipment');
  const image = extractField(block, 'image');
  const youtubeVideoId = extractField(block, 'youtubeVideoId');

  if (!id || !name || !muscleGroup) continue;

  // Construir objeto ligero como string TS
  const lines = [
    `  {`,
    `    id: '${id}',`,
    `    name: ${JSON.stringify(name)},`,
    `    muscleGroup: '${muscleGroup}',`,
    equipment ? `    equipment: ${JSON.stringify(equipment)},` : '',
    image ? `    image: ${JSON.stringify(image)},` : '',
    youtubeVideoId ? `    youtubeVideoId: ${JSON.stringify(youtubeVideoId)},` : '',
    `  },`,
  ].filter(Boolean).join('\n');

  indexEntries.push(lines);
}

const tsContent = `/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Auto-generado por scripts/generate-exercise-index.mjs
 * Índice LIGERO de ejercicios (solo metadatos esenciales).
 * Se usa para la vista de grupos, conteos y búsqueda rápida sin cargar detalles completos.
 * No incluir technique, instructions, ni arrays grandes.
 */
import type { ExerciseTemplate, MuscleGroup } from '@/data/exercises';

export interface ExerciseIndexEntry {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment?: string;
  image?: string;
  youtubeVideoId?: string;
}

export const EXERCISE_INDEX: ExerciseIndexEntry[] = [
${indexEntries.join('\n')}
];

export const EXERCISE_INDEX_COUNT = EXERCISE_INDEX.length;

export function getIndexByMuscleGroup(muscleGroup: MuscleGroup): ExerciseIndexEntry[] {
  return EXERCISE_INDEX.filter((e) => e.muscleGroup === muscleGroup);
}

export function getIndexEntryById(id: string): ExerciseIndexEntry | undefined {
  return EXERCISE_INDEX.find((e) => e.id === id);
}
`;

writeFileSync(OUT, tsContent, 'utf8');
console.log(`✅ Generado ${OUT} con ${indexEntries.length} entradas`);
console.log(`   Tamaño aproximado: ${(tsContent.length / 1024).toFixed(1)} KB`);