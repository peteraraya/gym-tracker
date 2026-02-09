const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const exercisesData = path.join(repoRoot, 'data', 'exercises.ts');
const publicExercisesDir = path.join(repoRoot, 'public', 'exercises');

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error('Error leyendo', filePath, err.message);
    process.exit(2);
  }
}

const content = readFileSafe(exercisesData);

// Regex to capture image paths like /exercises/name.ext
const re = /['"](\/exercises\/[\w\-./]+\.(?:gif|png|jpg|jpeg|webp))['"]/gi;
const expected = new Set();
let m;
while ((m = re.exec(content)) !== null) {
  // store relative path without leading slash
  const rel = m[1].replace(/^\//, '');
  expected.add(rel);
}

// Read actual files in public/exercises
let actualFiles = [];
try {
  actualFiles = fs.readdirSync(publicExercisesDir);
} catch (err) {
  console.error('No se pudo leer public/exercises. Comprueba que la carpeta existe.');
  process.exit(2);
}

const actualSet = new Set(actualFiles.map(f => path.join('exercises', f)));

const missing = [];
for (const rel of expected) {
  if (!actualSet.has(rel)) missing.push(rel);
}

console.log('\n--- Resultado comprobación imágenes de ejercicios ---\n');
console.log('Imágenes esperadas en el código:', expected.size);
console.log('Imágenes encontradas en public/exercises:', actualFiles.length);

if (missing.length === 0) {
  console.log('\n✔ No faltan imágenes.');
  process.exit(0);
} else {
  console.log(`\n❌ Faltan ${missing.length} imágenes:\n`);
  missing.forEach(p => console.log('- ' + p));
  console.log('\nSugerencia: coloca las imágenes en public/exercises/ con los nombres listados.');
  process.exit(1);
}
