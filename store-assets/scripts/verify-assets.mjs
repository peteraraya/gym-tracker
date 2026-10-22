import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const ERRORS = [];
const WARNINGS = [];

function checkExists(relativePath, description) {
  const fullPath = path.join(ROOT, relativePath);
  if (fs.existsSync(fullPath)) {
    const stat = fs.statSync(fullPath);
    const sizeKB = (stat.size / 1024).toFixed(1);
    console.log(`✅ ${description}: ${relativePath} (${sizeKB} KB)`);
    return true;
  } else {
    ERRORS.push(`FALTA: ${description} — ${relativePath}`);
    console.log(`❌ ${description}: ${relativePath} — NO ENCONTRADO`);
    return false;
  }
}

function checkIconSizes() {
  console.log('\n📐 Verificando tamaños de iconos PWA...');
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  let allPresent = true;
  for (const size of sizes) {
    const p = `public/icons/icon-${size}x${size}.png`;
    if (!fs.existsSync(path.join(ROOT, p))) {
      ERRORS.push(`FALTA ícono PWA: ${p}`);
      console.log(`❌ Ícono PWA ${size}x${size}: NO ENCONTRADO`);
      allPresent = false;
    } else {
      console.log(`✅ Ícono PWA ${size}x${size}: OK`);
    }
  }
  return allPresent;
}

function checkAndroidLauncherIcons() {
  console.log('\n🤖 Verificando íconos de launcher Android...');
  const densities = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];
  let allPresent = true;
  for (const density of densities) {
    const p = `android/app/src/main/res/mipmap-${density}/ic_launcher.png`;
    if (!fs.existsSync(path.join(ROOT, p))) {
      ERRORS.push(`FALTA ícono launcher: ${p}`);
      console.log(`❌ Ícono launcher ${density}: NO ENCONTRADO`);
      allPresent = false;
    } else {
      console.log(`✅ Ícono launcher ${density}: OK`);
    }
  }
  return allPresent;
}

function checkScreenshots() {
  console.log('\n📸 Verificando capturas de pantalla...');
  const phoneDir = path.join(ROOT, 'store-assets/images/phone-screenshots');
  const files = fs.existsSync(phoneDir) ? fs.readdirSync(phoneDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg')) : [];
  if (files.length === 0) {
    WARNINGS.push('No hay capturas de pantalla de teléfono. Se requieren al menos 2 para Play Store.');
    console.log('⚠️  Capturas teléfono: NINGUNA ENCONTRADA (mínimo 2 requeridas)');
  } else {
    console.log(`✅ Capturas teléfono: ${files.length} archivo(s) encontrado(s)`);
    for (const f of files) console.log(`   📄 ${f}`);
  }
}

function checkMetadata() {
  console.log('\n📝 Verificando metadatos de Play Store...');
  const locales = ['es-ES', 'en-US'];
  const requiredFiles = ['title.txt', 'shortDescription.txt', 'fullDescription.txt'];
  
  for (const locale of locales) {
    for (const file of requiredFiles) {
      const p = `store-assets/metadata/android/${locale}/${file}`;
      checkExists(p, `Metadato ${locale}/${file}`);
    }
  }
}

function checkFeatureGraphic() {
  console.log('\n🎨 Verificando feature graphic...');
  const p = 'store-assets/images/feature-graphic';
  if (fs.existsSync(p)) {
    const files = fs.readdirSync(path.join(ROOT, p)).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
    if (files.length === 0) {
      WARNINGS.push('No hay feature graphic. Recomendado para Play Store.');
      console.log('⚠️  Feature graphic: NO ENCONTRADO (opcional pero recomendado)');
    } else {
      console.log(`✅ Feature graphic: ${files.length} archivo(s) encontrado(s)`);
    }
  } else {
    WARNINGS.push('No hay carpeta de feature graphic.');
    console.log('⚠️  Feature graphic: CARPETA NO ENCONTRADA');
  }
}

function checkAndroidManifest() {
  console.log('\n📱 Verificando AndroidManifest.xml...');
  checkExists('android/app/src/main/AndroidManifest.xml', 'AndroidManifest principal');
  
  const manifest = fs.readFileSync(path.join(ROOT, 'android/app/src/main/AndroidManifest.xml'), 'utf8');
  const hasInternet = manifest.includes('android.permission.INTERNET');
  const hasVibrate = manifest.includes('android.permission.VIBRATE');
  console.log(`   ${hasInternet ? '✅' : '❌'} Permiso INTERNET: ${hasInternet ? 'OK' : 'FALTANTE'}`);
  console.log(`   ${hasVibrate ? '✅' : '❌'} Permiso VIBRATE: ${hasVibrate ? 'OK' : 'FALTANTE'}`);
}

console.log('🔍 VERIFICADOR DE ACTIVOS PARA GOOGLE PLAY STORE\n');
console.log('=' .repeat(60));

checkIconSizes();
checkAndroidLauncherIcons();
checkScreenshots();
checkMetadata();
checkFeatureGraphic();
checkAndroidManifest();

console.log('\n' + '=' .repeat(60));
console.log('📊 RESUMEN\n');

if (ERRORS.length > 0) {
  console.log(`❌ ERRORES CRÍTICOS (${ERRORS.length}):`);
  for (const e of ERRORS) console.log(`   • ${e}`);
} else {
  console.log('✅ No hay errores críticos');
}

if (WARNINGS.length > 0) {
  console.log(`\n⚠️  ADVERTENCIAS (${WARNINGS.length}):`);
  for (const w of WARNINGS) console.log(`   • ${w}`);
} else {
  console.log('✅ No hay advertencias');
}

const ready = ERRORS.length === 0;
console.log(`\n${ready ? '🚀 LISTO PARA SUBIR A PLAY STORE' : '🔧 REQUIERE CORRECCIONES ANTES DE SUBIR'}\n`);