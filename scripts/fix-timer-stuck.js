const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app', 'workout', '[id]', 'page.tsx');

console.log('Reading file:', filePath);
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Add onSkip to Timer component
content = content.replace(
  /(<Timer\s+duration=\{timerHandlers\.timerDuration\}[\s\S]*?onComplete=\{handleTimerComplete\})/,
  '$1\n          onSkip={timerHandlers.skipAndAdvance}'
);

// Fix 2: Update MinimizedTimer to use skipAndAdvance
content = content.replace(
  /onSkip=\{timerHandlers\.skipTimer\}/g,
  'onSkip={timerHandlers.skipAndAdvance}'
);

console.log('Writing fixed file...');
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed timer stuck issue!');
