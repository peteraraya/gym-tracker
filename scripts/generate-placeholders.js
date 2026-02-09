const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const exercisesData = path.join(repoRoot, 'data', 'exercises.ts');
const publicExercisesDir = path.join(repoRoot, 'public', 'exercises');
const placeholdersDir = path.join(publicExercisesDir, 'placeholders');

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error('Error leyendo', filePath, err.message);
    process.exit(2);
  }
}

const content = readFileSafe(exercisesData);
const re = /['"](\/exercises\/[\w\-./]+\.(?:gif|png|jpg|jpeg|webp))['"]/gi;
const expected = new Set();
let m;
while ((m = re.exec(content)) !== null) {
  const rel = m[1].replace(/^\//, '');
  expected.add(rel);
}

if (!fs.existsSync(placeholdersDir)) fs.mkdirSync(placeholdersDir, { recursive: true });

// 1x1 transparent GIF base64
const tinyGifBase64 = 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const tinyGifBuffer = Buffer.from(tinyGifBase64, 'base64');

let created = 0;
for (const rel of expected) {
  const filename = path.basename(rel);
  const outPath = path.join(placeholdersDir, filename);
  if (!fs.existsSync(outPath)) {
    fs.writeFileSync(outPath, tinyGifBuffer);
    created++;
  }
}

console.log(`Created ${created} placeholder files in ${placeholdersDir}`);
console.log('Next: run `node scripts/zip-placeholders.js` or npm script `npm run generate:placeholders` to create the ZIP.');
