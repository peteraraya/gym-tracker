import fs from 'fs';
import path from 'path';

const exercisesDbPath = path.join(process.cwd(), 'data', 'exercises.ts');
let dbContent = fs.readFileSync(exercisesDbPath, 'utf8');

// Replace `image: URL_STORAGE + '...'` with `youtubeVideoId: '...'`
dbContent = dbContent.replace(/image:\s*URL_STORAGE\s*\+\s*['"][^'"]+['"],?/g, "youtubeVideoId: 'rT7DgCr-3pg', // TODO: Actualizar video");

// Also replace any other `image: '...'` that might exist
dbContent = dbContent.replace(/image:\s*['"][^'"]+['"],?/g, "youtubeVideoId: 'rT7DgCr-3pg', // TODO: Actualizar video");

fs.writeFileSync(exercisesDbPath, dbContent, 'utf8');
console.log('Successfully replaced all images with a generic YouTube video ID.');
