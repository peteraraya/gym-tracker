/**
 * Script para dividir exercises.ts en archivos por grupo muscular
 * 
 * Ejecutar con: node scripts/split-exercises.js
 */

const fs = require('fs');
const path = require('path');

// Leer el archivo completo
const exercisesPath = path.join(__dirname, '../data/exercises.ts');
const content = fs.readFileSync(exercisesPath, 'utf-8');

// Extraer la constante URL_STORAGE
const urlMatch = content.match(/const URL_STORAGE = '([^']+)'/);
const URL_STORAGE = urlMatch ? urlMatch[1] : '';

// Grupos musculares
const muscleGroups = [
  'pecho', 'espalda', 'piernas', 'gluteos', 'hombros',
  'biceps', 'triceps', 'antebrazos', 'trapecio', 'cuello',
  'core', 'gemelos', 'cardio'
];

// Dividir el contenido en ejercicios individuales
const exerciseRegex = /\{[\s\S]*?id: '([^']+)'[\s\S]*?muscleGroup: '([^']+)'[\s\S]*?\},?\n/g;
const exercises = [];
let match;

while ((match = exerciseRegex.exec(content)) !== null) {
  const exerciseText = match[0];
  const id = match[1];
  const muscleGroup = match[2];
  
  exercises.push({
    id,
    muscleGroup,
    text: exerciseText.trim().replace(/,\s*$/, '') // Remover coma final si existe
  });
}

console.log(`Found ${exercises.length} exercises`);

// Agrupar ejercicios por grupo muscular
const groupedExercises = {};
muscleGroups.forEach(group => {
  groupedExercises[group] = exercises.filter(ex => ex.muscleGroup === group);
});

// Crear archivos por grupo
const groupsDir = path.join(__dirname, '../data/exercises/groups');
if (!fs.existsSync(groupsDir)) {
  fs.mkdirSync(groupsDir, { recursive: true });
}

muscleGroups.forEach(group => {
  const groupExercises = groupedExercises[group];
  
  if (groupExercises.length === 0) {
    console.warn(`Warning: No exercises found for group: ${group}`);
    return;
  }
  
  const fileContent = `/**
 * Ejercicios de ${group}
 * 
 * Este archivo es generado automáticamente por scripts/split-exercises.js
 * No editar manualmente - editar data/exercises.ts y ejecutar el script
 */

import type { ExerciseTemplate } from '../types';
import { URL_STORAGE } from '../types';

export const exercises: ExerciseTemplate[] = [
${groupExercises.map(ex => '  ' + ex.text).join(',\n')}
];
`;
  
  const filePath = path.join(groupsDir, `${group}.ts`);
  fs.writeFileSync(filePath, fileContent, 'utf-8');
  console.log(`Created ${group}.ts with ${groupExercises.length} exercises`);
});

console.log('\nDone! Exercise files created successfully.');
console.log('\nSummary:');
muscleGroups.forEach(group => {
  const count = groupedExercises[group]?.length || 0;
  console.log(`  ${group}: ${count} exercises`);
});
