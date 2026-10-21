import fs from 'fs';
import path from 'path';

const exercisesDbPath = path.join(process.cwd(), 'data', 'exercises.ts');
let dbContent = fs.readFileSync(exercisesDbPath, 'utf8');

// Fix duplicates
dbContent = dbContent.replace(/youtubeVideoId:\s*['"]rT7DgCr-3pg['"],\s*\/\/\s*TODO:\s*Actualizar\s*video\n\s*youtubeVideoId:\s*['"][^'"]+['"],?[^\n]*/g, "youtubeVideoId: 'rT7DgCr-3pg', // TODO: Actualizar video");

dbContent = dbContent.replace(/youtubeVideoId:\s*['"][^'"]+['"],?[^\n]*\n\s*youtubeVideoId:\s*['"]rT7DgCr-3pg['"],\s*\/\/\s*TODO:\s*Actualizar\s*video/g, "youtubeVideoId: 'rT7DgCr-3pg', // TODO: Actualizar video");

// Fix remaining URL_STORAGE references that might not have been caught
dbContent = dbContent.replace(/image:\s*URL_STORAGE\s*\+\s*`[^`]+`,?/g, "");

fs.writeFileSync(exercisesDbPath, dbContent, 'utf8');
console.log('Fixed duplicates.');
