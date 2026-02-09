const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const repoRoot = path.resolve(__dirname, '..');
const placeholdersDir = path.join(repoRoot, 'public', 'exercises', 'placeholders');
const zipPath = path.join(repoRoot, 'public', 'exercises', 'placeholders.zip');

if (!fs.existsSync(placeholdersDir)) {
  console.error('Placeholders directory not found. Run generate-placeholders.js first.');
  process.exit(2);
}

try {
  if (process.platform === 'win32') {
    // Use PowerShell Compress-Archive
    const command = `powershell -NoProfile -Command "Compress-Archive -Path '${placeholdersDir}\\*' -DestinationPath '${zipPath}' -Force"`;
    execSync(command, { stdio: 'inherit' });
  } else {
    // Try zip (Linux/macOS). -j to junk paths
    const command = `zip -j '${zipPath}' '${placeholdersDir}'/*`;
    execSync(command, { stdio: 'inherit' });
  }
  console.log('Created', zipPath);
} catch (err) {
  console.error('Error creating ZIP. Ensure `zip` (or PowerShell on Windows) is available.', err.message);
  process.exit(1);
}
