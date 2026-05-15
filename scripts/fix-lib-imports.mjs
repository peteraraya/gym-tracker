/**
 * Script de migración de imports para lib/:
 * actualiza @/lib/X al nuevo path de dominio.
 * Uso: node scripts/fix-lib-imports.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// Mapa: NombreModulo → nuevo path relativo dentro de lib/
const LIB_MAP = {
  // achievements
  'lib/achievements':       'lib/achievements/achievements',
  'lib/achievementManager': 'lib/achievements/achievementManager',

  // workout
  'lib/progression':          'lib/workout/progression',
  'lib/progression-advanced': 'lib/workout/progression-advanced',
  'lib/workoutSuggestions':   'lib/workout/workoutSuggestions',
  'lib/restCalculator':       'lib/workout/restCalculator',

  // exercises
  'lib/personalRecords':         'lib/exercises/personalRecords',
  'lib/exerciseRecommendations': 'lib/exercises/exerciseRecommendations',
  'lib/recommendations':         'lib/exercises/recommendations',
  'lib/customExercises':         'lib/exercises/customExercises',

  // routines
  'lib/routineGenerator':  'lib/routines/routineGenerator',
  'lib/routineEstimation': 'lib/routines/routineEstimation',

  // data
  'lib/dataExport':       'lib/data/dataExport',
  'lib/weightSuggestions':'lib/data/weightSuggestions',

  // user
  'lib/localProfile': 'lib/user/localProfile',

  // utils
  'lib/formatTime': 'lib/utils/formatTime',
};

const ROOT = process.cwd();

const SCAN_DIRS = ['app', 'components', 'context', 'hooks', 'lib', 'stores', 'types', '__tests__'];

function getAllFiles(dir, exts = ['.tsx', '.ts']) {
  const results = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', '.next', '.git', 'coverage', 'out', 'android'].includes(entry.name)) {
          results.push(...getAllFiles(fullPath, exts));
        }
      } else if (exts.includes(extname(entry.name))) {
        results.push(fullPath);
      }
    }
  } catch {}
  return results;
}

let totalFiles = 0;
let modifiedFiles = 0;
let totalReplacements = 0;

for (const dir of SCAN_DIRS) {
  const files = getAllFiles(join(ROOT, dir));

  for (const filePath of files) {
    totalFiles++;
    let content = readFileSync(filePath, 'utf8');
    let modified = false;
    let fileReplacements = 0;

    for (const [oldPath, newPath] of Object.entries(LIB_MAP)) {
      // Coincide @/lib/X seguido de comilla o barra
      const regex = new RegExp(`(@/)${oldPath.replace('lib/', 'lib/')}(['"/])`, 'g');
      const newContent = content.replace(regex, `$1${newPath}$2`);
      if (newContent !== content) {
        fileReplacements++;
        content = newContent;
        modified = true;
      }
    }

    if (modified) {
      writeFileSync(filePath, content, 'utf8');
      modifiedFiles++;
      totalReplacements += fileReplacements;
      console.log(`  ✏️  ${filePath.replace(ROOT, '').replace(/\\/g, '/')} (${fileReplacements} reemplazos)`);
    }
  }
}

console.log(`\n✅ Listo: ${modifiedFiles} archivos modificados, ${totalReplacements} reemplazos en ${totalFiles} archivos escaneados.`);
