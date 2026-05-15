const fs = require('fs');
const path = require('path');

function translateBurnfitName(enName) {
  const name = enName || '';
  let equipSuffix = '';
  if (/barbell/i.test(name)) equipSuffix = ' (Barra)';
  else if (/dumbbell/i.test(name)) equipSuffix = ' (Mancuernas)';
  else if (/kettlebell/i.test(name)) equipSuffix = ' (Kettlebell)';
  else if (/machine/i.test(name)) equipSuffix = ' (Máquina)';
  else if (/weighted/i.test(name)) equipSuffix = ' (Lastradas)';

  const phraseMap = [
    [/barbell bench press/i, 'Press de Banca (Barra)'],
    [/incline bench press/i, 'Press Inclinado'],
    [/decline bench press/i, 'Press Declinado'],
    [/bench press/i, 'Press de Banca'],
    [/dumbbell fly/i, 'Aperturas con Mancuernas'],
    [/lat pull down/i, 'Jalón al Pecho'],
    [/lat pulldown/i, 'Jalón al Pecho'],
    [/pull up/i, 'Dominadas'],
    [/chin up/i, 'Dominadas (supinado)'],
    [/push up/i, 'Flexiones'],
    [/deadlift/i, 'Peso Muerto'],
    [/squat/i, 'Sentadilla'],
    [/lunge/i, 'Zancada'],
    [/row/i, 'Remo'],
    [/shoulder press/i, 'Press de Hombros'],
    [/bicep curl/i, 'Curl de Bíceps'],
    [/tricep extension/i, 'Extensión de Tríceps'],
    [/leg raise/i, 'Elevación de Piernas'],
    [/sit up/i, 'Sit Up'],
    [/crunch/i, 'Crunch'],
    [/burpee/i, 'Burpee'],
    [/box jump/i, 'Salto al Cajón'],
    [/plank/i, 'Plancha'],
    [/toes to bar/i, 'Pies a la Barra'],
    [/hang(ing)? knee raise/i, 'Elevación de Rodillas Colgado']
  ];
  for (const [re, tx] of phraseMap) if (re.test(name)) return tx;

  const tokenMap = {
    barbell: 'Barra',
    dumbbell: 'Mancuernas',
    kettlebell: 'Kettlebell',
    machine: 'Máquina',
    bodyweight: 'Peso corporal',
    weighted: 'Lastradas',
    back: 'Trasera',
    front: 'Frontal',
    incline: 'Inclinado',
    decline: 'Declinado',
    reverse: 'Reverse',
    stiff: 'Stiff',
    single: 'Single',
    one: 'One',
    arm: 'Brazo',
    leg: 'Pierna',
    shrug: 'Encogimiento',
    press: 'Press',
    fly: 'Aperturas',
    squat: 'Sentadilla',
    deadlift: 'Peso Muerto',
    lunge: 'Zancada',
    row: 'Remo',
    pull: 'Jalón',
    push: 'Empuje',
    curl: 'Curl',
    extension: 'Extensión',
    calf: 'Gemelos',
    raise: 'Elevación',
    crunch: 'Crunch',
    plank: 'Plancha',
    burpee: 'Burpee'
  };

  const cleaned = name.replace(/[^\w\s]/g, ' ').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const translatedParts = parts.map(p => {
    const low = p.toLowerCase();
    if (tokenMap[low]) return tokenMap[low];
    return p.charAt(0).toUpperCase() + p.slice(1);
  });
  let result = translatedParts.join(' ');
  if (equipSuffix) result = result + equipSuffix;
  return result.charAt(0).toUpperCase() + result.slice(1);
}

const filePath = path.join(__dirname, '..', 'data', 'exercises_burnfit_missing.ts');
const backupPath = filePath + '.namebak';
try {
  const content = fs.readFileSync(filePath, 'utf8');
  fs.writeFileSync(backupPath, content, 'utf8');
  const newContent = content.replace(/(id:\s*'([^']+)'\s*,\s*name:\s*")([^"]+)(")/g, (m, p1, id, enName, p4) => {
    const es = translateBurnfitName(enName, id);
    return p1 + es + p4;
  });
  if (newContent === content) {
    console.log('No se encontraron nombres a traducir.');
  } else {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Nombres traducidos y respaldo creado en:', backupPath);
  }
} catch (err) {
  console.error('Error procesando el archivo:', err);
  process.exit(1);
}
