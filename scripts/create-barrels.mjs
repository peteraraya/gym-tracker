/**
 * Genera archivos index.ts barrel para cada carpeta de features y layout.
 * Uso: node scripts/create-barrels.mjs
 */

import { readdirSync, writeFileSync, existsSync } from 'fs';
import { join, basename, extname } from 'path';

const ROOT = process.cwd();

const FEATURE_DIRS = [
  'components/features/achievements',
  'components/features/workout',
  'components/features/exercises',
  'components/features/routines',
  'components/features/sessions',
  'components/features/progress',
  'components/features/calculators',
  'components/features/planning',
  'components/features/body-map',
  'components/features/ai',
  'components/features/equipment',
  'components/features/data',
  'components/features/onboarding',
  'components/features/settings',
  'components/layout',
];

for (const dir of FEATURE_DIRS) {
  const absDir = join(ROOT, dir);
  const indexPath = join(absDir, 'index.ts');

  // Obtener todos los .tsx/.ts (excepto index.ts ya existente)
  const entries = readdirSync(absDir, { withFileTypes: true });
  const exports = [];

  for (const entry of entries) {
    const name = entry.name;
    if (name === 'index.ts' || name === 'index.tsx') continue;

    if (entry.isDirectory()) {
      // Sub-directorio (ej: RoutineForm/) - exportar desde su index si existe o directamente
      exports.push(`export * from './${name}';`);
    } else if (extname(name) === '.tsx' || extname(name) === '.ts') {
      const moduleName = basename(name, extname(name));
      exports.push(`export * from './${moduleName}';`);
    }
  }

  const domainName = dir.split('/').pop();
  const content = `/**\n * Barrel de ${domainName}.\n * Importa componentes de este dominio desde aquí:\n *   import { MiComponente } from '@/components/${dir.replace('components/', '')}'\n */\n\n${exports.join('\n')}\n`;

  writeFileSync(indexPath, content, 'utf8');
  console.log(`✅ Creado: ${dir}/index.ts (${exports.length} exports)`);
}

console.log('\n🎉 Todos los barrels creados.');
