const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'components', 'AnatomicalBodyMap.tsx');

console.log('[Fix] Updating AnatomicalBodyMap for mobile tap support...');

let content = fs.readFileSync(filePath, 'utf8');

// Reemplazar todos los onClick para que pasen el evento
content = content.replace(/onClick=\{\(\) => handleAreaClick\('([^']+)'\)\}/g, 'onClick={(e) => handleAreaClick(\'$1\', e)}');

fs.writeFileSync(filePath, content, 'utf8');

console.log('[Fix] ✅ Successfully updated AnatomicalBodyMap');
console.log('[Fix] Now tooltips will appear on tap in mobile devices');
