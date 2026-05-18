const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'exercises_burnfit_missing.ts');
const backupPath = filePath + '.bak';

try {
  const content = fs.readFileSync(filePath, 'utf8');
  fs.writeFileSync(backupPath, content, 'utf8');
  const newContent = content.replace(/image:\s*'https:\/\/[^']+?\/male-([a-z0-9-]+?)(?:-front|-side)?\.gif'/gi, "image: '$1.gif'");
  if (newContent === content) {
    console.warn('No se encontraron coincidencias; no se realizaron cambios.');
  } else {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Archivo actualizado. Respaldo creado en:', backupPath);
  }
} catch (err) {
  console.error('Error procesando el archivo:', err);
  process.exit(1);
}
