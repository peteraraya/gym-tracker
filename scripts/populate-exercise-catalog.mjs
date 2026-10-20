import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = process.cwd();
const SRC = `${ROOT}/data/exercises.ts`;
const OUT = `${ROOT}/supabase/migrations/2026-10-21_populate_exercise_catalog.sql`;

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

// Extraer campos de cada ejercicio
function extractField(block, field) {
  const m = block.match(new RegExp(`${field}:\\s*'([^']*)'`));
  return m ? m[1] : null;
}

function extractArrayField(block, field) {
  const m = block.match(new RegExp(`${field}:\\s*\\[([^\\]]*)\\]`));
  if (!m) return [];
  return m[1].split(',').map(s => s.replace(/['"]/g, '').trim()).filter(Boolean);
}

const sqlLines = [
  '-- Migración: Poblar exercise_catalog con ejercicios existentes',
  '-- Fecha: 2026-10-21',
  '-- Descripción: Inserta los ejercicios de EXERCISE_DATABASE en exercise_catalog',
  '-- como ejercicios públicos del catálogo base.',
  '',
  'INSERT INTO public.exercise_catalog (',
  '  id, user_id, name, muscle_group, equipment, default_sets, default_reps,',
  '  default_rest_seconds, youtube_video_id, image_url, technique, instructions,',
  '  is_custom, is_public, created_at, updated_at',
  ') VALUES',
];

const URL_STORAGE = 'https://hplrrjqgzefkdevbporx.supabase.co/storage/v1/object/public/routine-images/';

const values = exerciseBlocks.map((block, idx) => {
  const id = extractField(block, 'id') || `ex-${idx}`;
  const name = extractField(block, 'name') || `Ejercicio ${idx}`;
  const muscleGroup = extractField(block, 'muscleGroup') || 'otro';
  const equipment = extractField(block, 'equipment');
  const defaultSets = extractField(block, 'defaultSets') || '3';
  const defaultReps = extractField(block, 'defaultReps') || '10';
  const image = extractField(block, 'image') || `URL_STORAGE + 'male-${id}.gif'`;
  const youtubeVideoId = extractField(block, 'youtubeVideoId') || null;
  const technique = extractArrayField(block, 'technique');
  const recommendedSets = extractField(block, 'recommendedSets');
  const recommendedReps = extractField(block, 'recommendedReps');
  const restTime = extractField(block, 'restTime');

  // Calcular default_rest_seconds desde restTime si existe
  let defaultRestSeconds = 60;
  if (restTime) {
    const match = restTime.match(/(\d+)/);
    if (match) {
      defaultRestSeconds = parseInt(match[1], 10);
      if (restTime.toLowerCase().includes('min')) {
        defaultRestSeconds *= 60;
      }
    }
  }

  // Escapar comillas simples en strings
  const safeName = name.replace(/'/g, "''");
  const safeEquipment = equipment ? equipment.replace(/'/g, "''") : null;
  const safeImage = image ? image.replace(/'/g, "''") : null;
  const safeYoutube = youtubeVideoId ? youtubeVideoId.replace(/'/g, "''") : null;
  const safeTechnique = technique.length > 0 
    ? `ARRAY[${technique.map(t => `'${t.replace(/'/g, "''")}'`).join(', ')}]` 
    : 'ARRAY[]::text[]';

  return `  ('${id}', NULL, '${safeName}', '${muscleGroup}', ${safeEquipment ? `'${safeEquipment}'` : 'NULL'}, ${defaultSets}, ${defaultReps}, ${defaultRestSeconds}, ${safeYoutube ? `'${safeYoutube}'` : 'NULL'}, ${safeImage ? `'${safeImage}'` : 'NULL'}, ${safeTechnique}, '[]'::jsonb, false, true, NOW(), NOW())`;
});

sqlLines.push(values.join(',\n'));
sqlLines.push(';');
sqlLines.push('');
sqlLines.push(`-- Total: ${exerciseBlocks.length} ejercicios insertados`);

const sqlContent = sqlLines.join('\n');

// Escribir archivo
writeFileSync(OUT, sqlContent, 'utf8');
console.log(`✅ Generado ${OUT} con ${exerciseBlocks.length} ejercicios`);