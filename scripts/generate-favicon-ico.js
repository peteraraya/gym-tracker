const sharp = require('sharp');
const fs = require('fs');

console.log('🎨 Generando favicon.ico...\n');

// Generar múltiples tamaños para el ICO (16, 32, 48)
const sizes = [16, 32, 48];
const tempFiles = [];

Promise.all(
  sizes.map(size => {
    const tempFile = `public/favicon-temp-${size}.png`;
    tempFiles.push(tempFile);
    return sharp('public/icon-gt.svg')
      .resize(size, size)
      .png()
      .toFile(tempFile)
      .then(() => console.log(`✓ Generado temporal ${size}x${size}`));
  })
).then(() => {
  console.log('\n✅ Archivos temporales generados!');
  console.log('\n⚠️  Para crear favicon.ico necesitas:');
  console.log('1. Usar una herramienta online: https://www.icoconverter.com/');
  console.log('2. O instalar imagemagick y ejecutar:');
  console.log('   convert public/favicon-temp-16.png public/favicon-temp-32.png public/favicon-temp-48.png public/favicon.ico');
  console.log('\n📁 Archivos PNG temporales creados en public/');
  console.log('   Puedes subirlos a icoconverter.com para crear el .ico');
}).catch(err => {
  console.error('❌ Error:', err);
});
