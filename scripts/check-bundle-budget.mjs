import { readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const NEXT_DIR = join(ROOT, '.next');
const BUDGET_KB = 250; // Presupuesto de JS inicial: 250 KB gzipped

function gzipSizeEstimate(bytes) {
  // Estimación conservadora: gzip reduce ~65% para JS típico
  return bytes * 0.35;
}

function findServerChunks(dir) {
  const chunks = [];
  if (!existsSync(dir)) return chunks;

  function walk(d) {
    const entries = existsSync(d) ? require('node:fs').readdirSync(d, { withFileTypes: true }) : [];
    for (const entry of entries) {
      const full = join(d, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith('.js')) {
        try {
          const size = statSync(full).size;
          chunks.push({ path: full, size });
        } catch {}
      }
    }
  }
  walk(dir);
  return chunks;
}

const serverChunks = findServerChunks(join(NEXT_DIR, 'server'));
const totalBytes = serverChunks.reduce((sum, c) => sum + c.size, 0);
const estimatedGzipKB = Math.round(gzipSizeEstimate(totalBytes) / 1024);

console.log('📊 Bundle Budget Check');
console.log(`   Server chunks encontrados: ${serverChunks.length}`);
console.log(`   Tamaño total (sin comprimir): ${Math.round(totalBytes / 1024)} KB`);
console.log(`   Tamaño estimado (gzip): ${estimatedGzipKB} KB`);
console.log(`   Presupuesto: ${BUDGET_KB} KB`);

if (estimatedGzipKB > BUDGET_KB) {
  console.error(`\n❌ PRESUPUESTO EXCEDIDO: ${estimatedGzipKB} KB > ${BUDGET_KB} KB`);
  process.exit(1);
} else {
  console.log(`\n✅ Presupuesto cumplido: ${estimatedGzipKB} KB <= ${BUDGET_KB} KB`);
  process.exit(0);
}
