import { ExerciseTemplate, URL_STORAGE } from '../types';

export const antebrazosExercises: ExerciseTemplate[] = [
  {
    id: 'wrist-curl',
    name: 'Curl de Muñeca',
    muscleGroup: 'antebrazos',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 20,
    image: URL_STORAGE + 'male-dumbbell-wrist-curl-front.gif',
    technique: [
      'Antebrazos apoyados en los muslos o en un banco',
      'Flexiona las muñecas hacia arriba',
      'Trabaja los flexores del antebrazo',
      'Movimiento controlado, sin impulso'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-25 repeticiones',
    restTime: '30-45 segundos'
  },
  {
    id: 'reverse-wrist-curl',
    name: 'Curl de Muñeca Inverso',
    muscleGroup: 'antebrazos',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 20,
    image: URL_STORAGE + 'male-dumbbell-reverse-wrist-curl-front.gif',
    technique: [
      'Antebrazos apoyados, palmas hacia abajo',
      'Extiende las muñecas hacia arriba',
      'Trabaja los extensores del antebrazo',
      'Usa menos peso que el curl de muñeca normal'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-25 repeticiones',
    restTime: '30-45 segundos'
  },
  {
    id: 'barbell-wrist-curl',
    name: 'Curl de Muñeca con Barra',
    muscleGroup: 'antebrazos',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 20,
    image: URL_STORAGE + 'male-barbell-wrist-curl-front.gif',
    technique: [
      'Antebrazos en un banco, barra en las manos',
      'Deja que la barra ruede hasta los dedos',
      'Enrolla de vuelta y flexiona las muñecas',
      'Mayor rango de movimiento que con mancuernas'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-25 repeticiones',
    restTime: '45 segundos'
  },
  {
    id: 'barbell-reverse-wrist-curl',
    name: 'Curl de Muñeca Inverso con Barra',
    muscleGroup: 'antebrazos',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 20,
    image: URL_STORAGE + 'male-barbell-reverse-wrist-curl-front.gif',
    technique: [
      'Antebrazos en un banco, palmas hacia abajo',
      'Extiende las muñecas hacia arriba',
      'Trabaja extensores del antebrazo',
      'Previene desequilibrios musculares'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-25 repeticiones',
    restTime: '45 segundos'
  },
  {
    id: 'farmers-walk',
    name: 'Caminata de Granjero',
    muscleGroup: 'antebrazos',
    equipment: 'Mancuernas',
    defaultSets: 4,
    defaultReps: 1,
    image: URL_STORAGE + 'male-dumbbell-farmers-walk-side.gif',
    technique: [
      'Carga pesada en cada mano',
      'Camina con postura erguida',
      'Aprieta fuerte las mancuernas',
      'Excelente para fuerza de agarre y antebrazos'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '30-60 segundos o 20-40 metros',
    restTime: '90 segundos'
  },
  {
    id: 'plate-pinch',
    name: 'Pinza con Discos',
    muscleGroup: 'antebrazos',
    equipment: 'Discos',
    defaultSets: 3,
    defaultReps: 1,
    image: URL_STORAGE + 'male-plate-pinch-hold-side.gif',
    technique: [
      'Sostén uno o dos discos con los dedos',
      'Pinza entre pulgar y dedos',
      'Mantén el tiempo que puedas',
      'Desarrolla fuerza de agarre específica'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '20-45 segundos por mano',
    restTime: '60 segundos'
  },
  {
    id: 'dead-hang',
    name: 'Colgarse de la Barra',
    muscleGroup: 'antebrazos',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 1,
    image: URL_STORAGE + 'male-bodyweight-dead-hang-back.gif',
    technique: [
      'Cuélgate de una barra con brazos extendidos',
      'Relaja los hombros y respira',
      'Mantén el tiempo que puedas',
      'Excelente para fuerza de agarre y descompresión espinal'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '30-60 segundos',
    restTime: '90 segundos'
  },
  {
    id: 'towel-pull-ups',
    name: 'Dominadas con Toalla',
    muscleGroup: 'antebrazos',
    equipment: 'Toalla',
    defaultSets: 3,
    defaultReps: 8,
    image: URL_STORAGE + 'male-towel-pull-up-back.gif',
    technique: [
      'Cuelga una toalla sobre la barra',
      'Agarra ambos extremos de la toalla',
      'Haz dominadas sosteniendo la toalla',
      'Desafío extremo para antebrazos y agarre'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '5-10 repeticiones',
    restTime: '2-3 minutos'
  },
  {
    id: 'hammer-curl-forearm',
    name: 'Curl Martillo (Énfasis Antebrazo)',
    muscleGroup: 'antebrazos',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-dumbbell-hammer-curl-forearm-front.gif',
    technique: [
      'Agarre neutral durante todo el movimiento',
      'Enfoca en apretar fuerte las mancuernas',
      'Trabaja braquiorradial intensamente',
      'Movimiento lento y controlado'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'reverse-curl-forearm',
    name: 'Curl Inverso (Énfasis Antebrazo)',
    muscleGroup: 'antebrazos',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-barbell-reverse-curl-forearm-front.gif',
    technique: [
      'Agarre prono (palmas hacia abajo)',
      'Curl completo enfocando en antebrazos',
      'Trabaja braquiorradial y extensores',
      'Excelente para equilibrio muscular'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'wrist-roller',
    name: 'Rodillo de Muñeca',
    muscleGroup: 'antebrazos',
    equipment: 'Rodillo de muñeca',
    defaultSets: 3,
    defaultReps: 3,
    image: URL_STORAGE + 'male-wrist-roller-front.gif',
    technique: [
      'Sostén el rodillo con brazos extendidos',
      'Enrolla la cuerda subiendo el peso',
      'Luego desenrolla bajando con control',
      'Quema intensa en antebrazos'
    ],
    recommendedSets: '2-3 series',
    recommendedReps: '2-3 subidas y bajadas',
    restTime: '90-120 segundos'
  },
  {
    id: 'fat-grip-curl',
    name: 'Curl con Agarre Grueso',
    muscleGroup: 'antebrazos',
    equipment: 'Mancuernas + Fat Grips',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-fat-grip-curl-front.gif',
    technique: [
      'Usa adaptadores de agarre grueso o toalla',
      'Curl normal pero con agarre más ancho',
      'Mayor activación de antebrazos',
      'Desarrolla fuerza de agarre funcional'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'finger-curls',
    name: 'Curl de Dedos',
    muscleGroup: 'antebrazos',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 20,
    image: URL_STORAGE + 'male-barbell-finger-curl-front.gif',
    technique: [
      'Barra en las manos con antebrazos apoyados',
      'Deja que la barra ruede hasta las puntas de los dedos',
      'Enrolla de vuelta con los dedos',
      'Fortalece dedos y agarre'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-25 repeticiones',
    restTime: '45 segundos'
  },
  {
    id: 'gripper-squeeze',
    name: 'Apretón con Gripper',
    muscleGroup: 'antebrazos',
    equipment: 'Hand gripper',
    defaultSets: 4,
    defaultReps: 15,
    image: URL_STORAGE + 'male-hand-gripper-squeeze-side.gif',
    technique: [
      'Usa un gripper de mano ajustable',
      'Aprieta completamente cerrando el gripper',
      'Mantén 1-2 segundos',
      'Suelta con control'
    ],
    recommendedSets: '3-5 series',
    recommendedReps: '10-20 repeticiones por mano',
    restTime: '45-60 segundos'
  },
  {
    id: 'radial-deviation',
    name: 'Desviación Radial',
    muscleGroup: 'antebrazos',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-dumbbell-radial-deviation-side.gif',
    technique: [
      'Sostén mancuerna vertical con pulgar arriba',
      'Antebrazo apoyado, mueve la muñeca hacia el pulgar',
      'Trabaja los músculos laterales del antebrazo',
      'Movimiento pequeño pero efectivo'
    ],
    recommendedSets: '2-3 series',
    recommendedReps: '12-20 repeticiones por lado',
    restTime: '30-45 segundos'
  },
  {
    id: 'cable-wrist-curl',
    name: 'Curl de Muñeca en Polea',
    muscleGroup: 'antebrazos',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-cable-wrist-curl-front.gif',
    technique: [
      'Polea baja con barra recta',
      'Antebrazos apoyados o brazos extendidos',
      'Flexiona las muñecas hacia arriba',
      'Tensión constante en los flexores del antebrazo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-25 repeticiones',
    restTime: '45 segundos'
  },
  {
    id: 'cable-reverse-wrist-curl',
    name: 'Curl de Muñeca Inverso en Polea',
    muscleGroup: 'antebrazos',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-cable-reverse-wrist-curl-front.gif',
    technique: [
      'Polea baja con barra, agarre prono',
      'Extiende las muñecas hacia arriba',
      'Trabaja los extensores del antebrazo',
      'Tensión constante durante todo el movimiento'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-25 repeticiones',
    restTime: '45 segundos'
  },
  {
    id: 'cable-ulnar-deviation',
    name: 'Desviación Ulnar en Polea',
    muscleGroup: 'antebrazos',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-cable-ulnar-deviation-front.gif',
    technique: [
      'Polea baja, manija en una mano',
      'Mueve la muñeca llevando el meñique hacia el antebrazo',
      'Trabaja el lado ulnar del antebrazo',
      'Mejora movilidad y estabilidad de muñeca'
    ],
    recommendedSets: '2-3 series',
    recommendedReps: '12-20 repeticiones por lado',
    restTime: '30-45 segundos'
  },
  {
    id: 'cable-zottman-curl',
    name: 'Curl Zottman en Polea',
    muscleGroup: 'antebrazos',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-zottman-curl-front.gif',
    technique: [
      'Polea baja, curl con palmas arriba',
      'Rota las muñecas arriba (palmas abajo)',
      'Baja con palmas hacia abajo',
      'Trabaja supinación y pronación del antebrazo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'cable-static-hold',
    name: 'Agarre Estático en Polea',
    muscleGroup: 'antebrazos',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 1,
    image: URL_STORAGE + 'male-cable-static-hold-front.gif',
    technique: [
      'Polea baja con cuerda o barra',
      'Sostén el peso con brazos extendidos',
      'Mantén el tiempo que puedas',
      'Excelente para fuerza de agarre y resistencia'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '30-60 segundos',
    restTime: '90 segundos'
  }
];


// Export genérico para carga dinámica
export const exercises = antebrazosExercises;
