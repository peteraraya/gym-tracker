import { ExerciseTemplate, URL_STORAGE } from '../types';

export const bicepsExercises: ExerciseTemplate[] = [
  {
    id: 'barbell-curl',
    name: 'Curl con Barra',
    muscleGroup: 'biceps',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-barbell-bicep-curl-front.gif',
    technique: [
      'Codos pegados a los costados',
      'No balancees el cuerpo',
      'Contrae el bíceps en la parte superior',
      'Baja con control hasta extensión completa'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'hammer-curl',
    name: 'Curl Martillo',
    muscleGroup: 'biceps',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-hammer-curl-front.gif',
    technique: [
      'Palmas enfrentadas entre sí durante todo el movimiento',
      'Mantén los codos fijos',
      'Sube hasta que las mancuernas estén a la altura de los hombros',
      'Trabaja el braquial y antebrazo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'concentration-curl',
    name: 'Curl Concentrado',
    muscleGroup: 'biceps',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-dumbbell-concentration-curl-front.gif',
    technique: [
      'Siéntate, apoya el codo en la parte interna del muslo',
      'Aísla completamente el bíceps',
      'Sube la mancuerna lentamente',
      'Maximiza la contracción en la parte superior'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones por brazo',
    restTime: '45-60 segundos'
  },
  {
    id: 'preacher-curl',
    name: 'Curl en Banco Scott',
    muscleGroup: 'biceps',
    equipment: 'Barra/Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-barbell-preacher-curl-front.gif',
    technique: [
      'Apoya los brazos en el banco inclinado',
      'Elimina el impulso del cuerpo',
      'Aislamiento total del bíceps',
      'No levantes los codos del pad'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'cable-curl',
    name: 'Curl en Polea',
    muscleGroup: 'biceps',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-cable-bicep-curl-front.gif',
    technique: [
      'Usa polea baja con barra o cuerda',
      'Tensión constante en el bíceps',
      'No balancees el cuerpo',
      'Contrae en la parte superior'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'zottman-curl',
    name: 'Curl Zottman',
    muscleGroup: 'biceps',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-zottman-curl-front.gif',
    technique: [
      'Sube con palmas hacia arriba (curl normal)',
      'Rota las muñecas arriba (palmas hacia abajo)',
      'Baja con palmas hacia abajo',
      'Trabaja bíceps y antebrazos simultáneamente'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'spider-curl',
    name: 'Spider Curl',
    muscleGroup: 'biceps',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-spider-curl-front.gif',
    technique: [
      'Acuéstate boca abajo en banco inclinado',
      'Brazos colgando perpendiculares al suelo',
      'Haz curl sin poder usar impulso',
      'Aislamiento total del bíceps, pico de contracción intenso'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'incline-dumbbell-curl',
    name: 'Curl Inclinado con Mancuernas',
    muscleGroup: 'biceps',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-incline-curl-front.gif',
    technique: [
      'Banco inclinado a 45-60 grados, brazos colgando',
      'Mayor estiramiento del bíceps en la posición baja',
      'Sube las mancuernas contrayendo el bíceps',
      'Trabaja la cabeza larga del bíceps'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'overhead-cable-curl',
    name: 'Curl Alto en Polea',
    muscleGroup: 'biceps',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-overhead-curl-front.gif',
    technique: [
      'Poleas altas, de pie entre ellas con brazos en cruz',
      'Flexiona los codos llevando las manos hacia la cabeza',
      'Pose de bíceps doble clásica',
      'Gran contracción pico del bíceps'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'reverse-curl',
    name: 'Curl Inverso',
    muscleGroup: 'biceps',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-barbell-reverse-curl-front.gif',
    technique: [
      'Agarre prono (palmas hacia abajo) en la barra',
      'Sube la barra flexionando los codos',
      'Trabaja el braquiorradial y los extensores del antebrazo',
      'Usa menos peso que el curl normal'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'bayesian-curl',
    name: 'Curl Bayesiano en Polea',
    muscleGroup: 'biceps',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-bayesian-curl-front.gif',
    technique: [
      'Polea baja detrás de ti, de espaldas a la máquina',
      'Brazo extendido hacia atrás al inicio',
      'Máximo estiramiento del bíceps en la posición baja',
      'Contrae llevando la mano hacia el hombro'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 por brazo',
    restTime: '45-60 segundos'
  },
  {
    id: 'drag-curl',
    name: 'Drag Curl',
    muscleGroup: 'biceps',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-barbell-drag-curl-front.gif',
    technique: [
      'Arrastra la barra pegada al cuerpo mientras subes',
      'Codos van hacia atrás en lugar de quedarse fijos',
      'Mayor activación de la cabeza larga del bíceps',
      'Movimiento único que elimina la tensión del hombro'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: '21s-curl',
    name: 'Curl 21s',
    muscleGroup: 'biceps',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 21,
    image: URL_STORAGE + 'male-barbell-21s-curl-front.gif',
    technique: [
      '7 repeticiones de la mitad inferior (abajo a medio)',
      '7 repeticiones de la mitad superior (medio a arriba)',
      '7 repeticiones completas',
      'Técnica avanzada para congestión muscular intensa'
    ],
    recommendedSets: '2-3 series',
    recommendedReps: '21 repeticiones (7+7+7)',
    restTime: '90-120 segundos'
  },
  {
    id: 'waiter-curl',
    name: 'Waiter Curl',
    muscleGroup: 'biceps',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-waiter-curl-front.gif',
    technique: [
      'Sostén una mancuerna vertical con ambas manos bajo el disco superior',
      'Como si llevaras una bandeja de camarero',
      'Curl manteniendo la mancuerna vertical',
      'Gran activación del pico del bíceps'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'cross-body-hammer-curl',
    name: 'Curl Martillo Cruzado',
    muscleGroup: 'biceps',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-cross-body-hammer-curl-front.gif',
    technique: [
      'Agarre martillo, lleva la mancuerna hacia el hombro opuesto',
      'Cruza el cuerpo en diagonal',
      'Mayor activación del braquial',
      'Alterna los brazos'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 por brazo',
    restTime: '60 segundos'
  },
  {
    id: 'ez-bar-curl',
    name: 'Curl con Barra Z',
    muscleGroup: 'biceps',
    equipment: 'Barra Z',
    defaultSets: 4,
    defaultReps: 10,
    image: URL_STORAGE + 'male-ez-bar-curl-front.gif',
    technique: [
      'Agarre en la parte angulada de la barra Z',
      'Menos estrés en las muñecas que la barra recta',
      'Curl completo con contracción en la parte superior',
      'Excelente para volumen de bíceps'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '90 segundos'
  },
  {
    id: 'cable-rope-curl',
    name: 'Curl con Cuerda en Polea',
    muscleGroup: 'biceps',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-cable-rope-curl-front.gif',
    technique: [
      'Usa cuerda en polea baja',
      'Agarre neutral, separa las manos al subir',
      'Tensión constante durante todo el movimiento',
      'Excelente para el pico del bíceps'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'single-arm-cable-curl',
    name: 'Curl Unilateral en Polea',
    muscleGroup: 'biceps',
    equipment: 'Poleas',
    description: 'Permite enfocarse en cada bíceps independientemente',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-single-arm-cable-curl-front.gif',
    difficulty: 'intermedio',
    category: 'aislamiento',
    primaryMuscles: ['Bíceps Braquial'],
    secondaryMuscles: ['Braquial', 'Braquiorradial'],
    technique: [
      'Usa una manija en polea baja',
      'De pie de lado a la máquina',
      'Curl completo con contracción máxima',
      'Corrige desbalances entre brazos'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 por brazo',
    restTime: '45-60 segundos'
  },
  {
    id: 'seated-cable-curl',
    name: 'Curl Sentado en Polea',
    muscleGroup: 'biceps',
    equipment: 'Poleas',
    description: 'Elimina el impulso del cuerpo para aislamiento total',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-seated-cable-curl-front.gif',
    difficulty: 'intermedio',
    category: 'aislamiento',
    primaryMuscles: ['Bíceps Braquial'],
    secondaryMuscles: ['Braquial'],
    technique: [
      'Siéntate en banco frente a polea baja',
      'Elimina completamente el impulso del cuerpo',
      'Tensión constante en el bíceps',
      'Ideal para finalizar el entrenamiento'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'chin-up-biceps',
    name: 'Dominadas Supinas (Bíceps)',
    muscleGroup: 'biceps',
    equipment: 'Peso corporal',
    description: 'Ejercicio compuesto que trabaja intensamente los bíceps',
    defaultSets: 3,
    defaultReps: 10,
    image: URL_STORAGE + 'male-chin-up-biceps-front.gif',
    difficulty: 'intermedio',
    category: 'compuesto',
    primaryMuscles: ['Bíceps Braquial', 'Dorsal Ancho'],
    secondaryMuscles: ['Braquial', 'Romboides'],
    technique: [
      'Agarre supino (palmas hacia ti), ancho de hombros',
      'Tira hasta que la barbilla supere la barra',
      'Mayor activación de bíceps que dominadas pronadas',
      'Excelente para fuerza y masa'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '6-12 repeticiones',
    restTime: '2-3 minutos'
  }
];


// Export genérico para carga dinámica
export const exercises = bicepsExercises;
