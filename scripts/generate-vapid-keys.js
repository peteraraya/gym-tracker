#!/usr/bin/env node

/**
 * Script para generar nuevas VAPID keys para notificaciones push
 * 
 * Uso:
 *   node scripts/generate-vapid-keys.js
 * 
 * Las keys generadas deben agregarse a:
 *   - .env.local (desarrollo)
 *   - .env.production (producción)
 *   - Vercel Dashboard → Settings → Environment Variables
 */

const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

console.log('🔐 Generando nuevas VAPID keys...\n');

// Generar keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ Keys generadas exitosamente!\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📋 VAPID Keys:\n');
console.log('Public Key:');
console.log(vapidKeys.publicKey);
console.log('\nPrivate Key:');
console.log(vapidKeys.privateKey);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Generar contenido para .env
const envContent = `
# VAPID Keys para Notificaciones Push
# Generadas: ${new Date().toISOString()}
NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
`;

console.log('📝 Contenido para .env.local y .env.production:\n');
console.log(envContent);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Preguntar si quiere guardar en archivo
console.log('💾 Pasos siguientes:\n');
console.log('1. Copiar las keys de arriba');
console.log('2. Agregar a .env.local (desarrollo)');
console.log('3. Agregar a .env.production (producción)');
console.log('4. Agregar a Vercel Dashboard:');
console.log('   - Ir a Settings → Environment Variables');
console.log('   - Agregar NEXT_PUBLIC_VAPID_PUBLIC_KEY (Production)');
console.log('   - Agregar VAPID_PRIVATE_KEY (Production, Secret)');
console.log('\n⚠️  IMPORTANTE: Guarda la Private Key de forma segura!');
console.log('   No la compartas ni la subas a Git.\n');

// Opcionalmente guardar en archivo temporal
const tempFile = path.join(__dirname, '..', 'vapid-keys-temp.txt');
fs.writeFileSync(tempFile, envContent);
console.log(`✅ Keys guardadas temporalmente en: ${tempFile}`);
console.log('   (Este archivo debe ser eliminado después de copiar las keys)\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
