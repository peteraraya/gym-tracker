/**
 * Script para extraer ejercicios faltantes del archivo antiguo
 * y organizarlos por grupo muscular
 */

const fs = require('fs');
const path = require('path');

// Leer archivo antiguo
const oldFile = fs.readFileSync('data/exercises.ts', 'utf8');

// Extraer todos los ejercicios del archivo antiguo
const exerciseRegex = /\{[\s\S]*?id: '([^']+)'[\s\S]*?muscleGroup: '([^']+)'[\s\S]*?\}/g;
const oldExercises = [];
let match;

while ((match = exerciseRegex.exec(oldFile)) !== null) {
  const exerciseText = match[0];
  const id = match[1];
  const muscleGroup = match[2];
  
  // Extraer el objeto completo
  oldExercises.push({
    id,
    muscleGroup,
    text: exerciseText
  });
}

console.log(`Total ejercicios en archivo antiguo: ${oldExercises.length}`);

// Leer ejercicios de archivos nuevos
const groupsDir = 'data/exercises/groups';
const groupFiles = fs.readdirSync(groupsDir).filter(f => f.endsWith('.ts'));
const newExerciseIds = new Set();

groupFiles.forEach(file => {
  const content = fs.readFileSync(path.join(groupsDir, file), 'utf8');
  const idMatches = content.matchAll(/id: '([^']+)'/g);
  for (const match of idMatches) {
    newExerciseIds.add(match[1]);
  }
});

console.log(`Total ejercicios en archivos nuevos: ${newExerciseIds.size}`);

// Encontrar faltantes
const missing = oldExercises.filter(ex => !newExerciseIds.has(ex.id));
console.log(`Ejercicios faltantes: ${missing.length}`);

// Agrupar por grupo muscular
const byGroup = {};
missing.forEach(ex => {
  if (!byGroup[ex.muscleGroup]) {
    byGroup[ex.muscleGroup] = [];
  }
  byGroup[ex.muscleGroup].push(ex);
});

// Generar reporte
let report = '# Ejercicios Faltantes por Grupo Muscular\n\n';
report += `Total: ${missing.length} ejercicios\n\n`;

Object.keys(byGroup).sort().forEach(group => {
  const exercises = byGroup[group];
  report += `## ${group.toUpperCase()} (${exercises.length} ejercicios)\n\n`;
  exercises.forEach(ex => {
    report += `### ${ex.id}\n\`\`\`typescript\n${ex.text}\n\`\`\`\n\n`;
  });
});

fs.writeFileSync('missing-exercises-report.md', report);
console.log('\nReporte generado: missing-exercises-report.md');

// Generar lista simple
const simpleList = missing.map(ex => `${ex.muscleGroup}: ${ex.id}`).join('\n');
fs.writeFileSync('missing-exercises-list.txt', simpleList);
console.log('Lista simple generada: missing-exercises-list.txt');
