const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Puedes cambiar esto a 'icon-gt.svg' o 'icon-dumbbell.svg'
const inputFile = process.argv[2] || 'public/icon-gt.svg';
const outputDir = 'public/icons';

// Crear directorio si no existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`🎨 Generando iconos para PWA desde ${inputFile}...\n`);

// Generar cada tamaño
const promises = [];

sizes.forEach(size => {
  const promise = sharp(inputFile)
    .resize(size, size)
    .png()
    .toFile(path.join(outputDir, `icon-${size}x${size}.png`))
    .then(() => console.log(`✓ Generado icon-${size}x${size}.png`))
    .catch(err => console.error(`✗ Error generando ${size}x${size}:`, err));
  
  promises.push(promise);
});

// Generar badge para notificaciones
promises.push(
  sharp(inputFile)
    .resize(72, 72)
    .png()
    .toFile(path.join(outputDir, 'badge-72x72.png'))
    .then(() => console.log('✓ Generado badge-72x72.png'))
    .catch(err => console.error('✗ Error generando badge:', err))
);

// Generar favicon (32x32)
promises.push(
  sharp(inputFile)
    .resize(32, 32)
    .png()
    .toFile('public/favicon-32x32.png')
    .then(() => console.log('✓ Generado favicon-32x32.png'))
    .catch(err => console.error('✗ Error generando favicon:', err))
);

// Generar favicon (16x16)
promises.push(
  sharp(inputFile)
    .resize(16, 16)
    .png()
    .toFile('public/favicon-16x16.png')
    .then(() => console.log('✓ Generado favicon-16x16.png'))
    .catch(err => console.error('✗ Error generando favicon:', err))
);

// Generar Apple Touch Icon
promises.push(
  sharp(inputFile)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png')
    .then(() => console.log('✓ Generado apple-touch-icon.png'))
    .catch(err => console.error('✗ Error generando apple-touch-icon:', err))
);

// Generar shortcuts icons
const shortcutIcons = [
  { name: 'workout', color: '#f97316' },  // Orange
  { name: 'progress', color: '#10b981' }, // Green
  { name: 'ai', color: '#8b5cf6' }        // Purple
];

shortcutIcons.forEach(({ name, color }) => {
  // Para shortcuts, usamos el mismo icono base
  // En una implementación más avanzada, podrías modificar el SVG para cada uno
  promises.push(
    sharp(inputFile)
      .resize(96, 96)
      .png()
      .toFile(path.join(outputDir, `shortcut-${name}.png`))
      .then(() => console.log(`✓ Generado shortcut-${name}.png`))
      .catch(err => console.error(`✗ Error generando shortcut-${name}:`, err))
  );
});

// Esperar a que todos terminen
Promise.all(promises).then(() => {
  console.log('\n✅ Todos los iconos generados exitosamente!');
  console.log(`\n📁 Ubicación: ${outputDir}/`);
  console.log(`\n🎨 Iconos generados desde: ${inputFile}`);
  console.log('\n📋 Próximos pasos:');
  console.log('1. Verifica los iconos en public/icons/');
  console.log('2. Actualiza app/layout.tsx con los favicon links ✓');
  console.log('3. Prueba la PWA en Chrome DevTools → Application → Manifest');
  console.log('4. Ejecuta Lighthouse para verificar el score PWA');
  console.log('\n💡 Para cambiar el diseño del icono:');
  console.log('   npm run generate:icons public/icon-gt.svg (letras GT)');
  console.log('   npm run generate:icons public/icon-dumbbell.svg (mancuerna)');
}).catch(err => {
  console.error('\n❌ Error durante la generación:', err);
});
