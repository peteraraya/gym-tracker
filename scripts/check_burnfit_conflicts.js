const fs = require('fs');
const path = require('path');

function readFile(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch (e) {
    console.error('No se pudo leer', p, e.message);
    process.exit(1);
  }
}

function normalizeNameForCompare(n) {
  if (!n) return '';
  return n
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

function extractEntriesLoosely(fileText) {
  const idRe = /id:\s*['"]([^'\"]+)['"]/gi;
  const entries = [];
  let m;
  while ((m = idRe.exec(fileText))) {
    const id = m[1];
    const idx = m.index;
    // find object boundaries: find last '{' before idx and matching '}' after idx
    const startBrace = fileText.lastIndexOf('{', idx);
    let objText = null;
    if (startBrace !== -1) {
      let depth = 0;
      let inStr = false;
      let strChar = null;
      for (let i = startBrace; i < fileText.length; i++) {
        const ch = fileText[i];
        if (inStr) {
          if (ch === '\\') { i++; continue; }
          if (ch === strChar) { inStr = false; strChar = null; }
          continue;
        }
        if (ch === '"' || ch === "'") { inStr = true; strChar = ch; continue; }
        if (ch === '{') depth++;
        else if (ch === '}') {
          depth--;
          if (depth === 0) {
            objText = fileText.slice(startBrace, i + 1);
            break;
          }
        }
      }
    }
    let name = null;
    if (objText) {
      const nameMatch = objText.match(/name:\s*['"]([^'\"]+)['"]/i);
      if (nameMatch) name = nameMatch[1];
    }
    // fallback: try to find a name shortly after id if not found in object
    if (!name) {
      const after = fileText.slice(idx, idx + 200);
      const nameMatch2 = after.match(/name:\s*['"]([^'\"]+)['"]/i);
      if (nameMatch2) name = nameMatch2[1];
    }
    entries.push({ id, name, objText });
  }
  return entries;
}

const repoRoot = path.join(__dirname, '..');
const dataExercises = readFile(path.join(repoRoot, 'data', 'exercises.ts'));
const dataBurnfit = readFile(path.join(repoRoot, 'data', 'exercises_burnfit_missing.ts'));

const exEntries = extractEntriesLoosely(dataExercises);
const burnEntries = extractEntriesLoosely(dataBurnfit);

const exById = new Map();
for (const e of exEntries) if (e.id) exById.set(e.id, e.name || null);
const burnById = new Map();
for (const b of burnEntries) if (b.id) burnById.set(b.id, b.name || null);

const duplicatesById = [];
for (const [id, name] of burnById.entries()) {
  if (exById.has(id)) duplicatesById.push({ id, existingName: exById.get(id), burnfitName: name });
}

// Duplicates by normalized name
const exNameMap = new Map();
for (const e of exEntries) if (e.name) exNameMap.set(normalizeNameForCompare(e.name), e.id || null);
const duplicatesByName = [];
for (const b of burnEntries) {
  if (!b.name) continue;
  const norm = normalizeNameForCompare(b.name);
  if (exNameMap.has(norm)) duplicatesByName.push({ burnfitId: b.id, burnfitName: b.name, existingId: exNameMap.get(norm) });
}

// Missing fields in burn entries
const missingFields = [];
for (const b of burnEntries) {
  const objText = b.objText || '';
  const missing = [];
  if (!/\btechnique\b/.test(objText)) missing.push('technique');
  if (!/\bdescription\b/.test(objText)) missing.push('description');
  if (!/\brecommendedSets\b/.test(objText)) missing.push('recommendedSets');
  if (!/\brecommendedReps\b/.test(objText)) missing.push('recommendedReps');
  if (!/\brestTime\b/.test(objText)) missing.push('restTime');
  if (!/\bdefaultSets\b/.test(objText)) missing.push('defaultSets');
  if (!/\bdefaultReps\b/.test(objText)) missing.push('defaultReps');
  if (missing.length) missingFields.push({ id: b.id, name: b.name, missing });
}

const report = {
  counts: {
    ex_total: exEntries.length,
    burn_total: burnEntries.length,
    duplicates_by_id: duplicatesById.length,
    duplicates_by_name: duplicatesByName.length,
    burn_missing_fields: missingFields.length
  },
  duplicatesById,
  duplicatesByName,
  missingFields
};

const reportsDir = path.join(repoRoot, 'reports');
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
const outPath = path.join(reportsDir, 'burnfit_conflicts.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
console.log('Reporte creado en', outPath);
console.log('Resumen:', report.counts);
