import { ExerciseTemplate, URL_STORAGE } from '../types';

export const trapecioExercises: ExerciseTemplate[] = [
  {
    id: 'barbell-shrugs',
    name: 'Encogimientos con Barra',
    muscleGroup: 'trapecio',
    equipment: 'Barra',
    defaultSets: 4,
    defaultReps: 15,
    image: URL_STORAGE + 'male-barbell-shrugs-front.gif',
    technique: [
      'Barra colgando frente a ti con brazos extendidos',
      'Eleva los hombros hacia las orejas',
      'Mantén 1-2 segundos arriba apretando los trapecios',
      'Baja lentamente sin rebotar',
      'No uses impulso ni gires los hombros'
    ],
    recommendedSets: '3-5 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'dumbbell-shrugs-trapezius',
    name: 'Encogimientos con Mancuernas',
    muscleGroup: 'trapecio',
    equipment: 'Mancuernas',
    defaultSets: 4,
    defaultReps: 15,
    image: URL_STORAGE + 'male-dumbbell-shrugs-front.gif',
    technique: [
      'Mancuernas a los lados del cuerpo',
      'Eleva los hombros hacia las orejas',
      'Mantén 1-2 segundos arriba apretando los trapecios',
      'Baja lentamente sin rebotar',
      'Mayor rango de movimiento que con barra'
    ],
    recommendedSets: '3-5 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'trap-bar-shrugs',
    name: 'Encogimientos con Barra Hexagonal',
    muscleGroup: 'trapecio',
    equipment: 'Barra hexagonal',
    defaultSets: 4,
    defaultReps: 12,
    image: URL_STORAGE + 'male-trap-bar-shrugs-front.gif',
    technique: [
      'Párate dentro de la barra hexagonal',
      'Agarre neutral a los lados',
      'Permite usar cargas muy pesadas de forma segura',
      'Menos estrés en la espalda baja que la barra recta'
    ],
    recommendedSets: '3-5 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'cable-shrugs',
    name: 'Encogimientos en Polea',
    muscleGroup: 'trapecio',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-cable-shrugs-front.gif',
    technique: [
      'Polea baja con barra recta o cuerda',
      'Tensión constante durante todo el movimiento',
      'Eleva los hombros contrayendo los trapecios',
      'Excelente para el pico de contracción'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'behind-back-shrugs',
    name: 'Encogimientos por Detrás',
    muscleGroup: 'trapecio',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-barbell-behind-back-shrugs-back.gif',
    technique: [
      'Barra detrás del cuerpo (como en peso muerto rumano)',
      'Eleva los hombros hacia arriba',
      'Diferente ángulo de activación del trapecio',
      'Usa menos peso que los encogimientos frontales'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-18 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'upright-row-trap',
    name: 'Remo al Cuello (Énfasis Trapecio)',
    muscleGroup: 'trapecio',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-barbell-upright-row-trap-front.gif',
    technique: [
      'Agarre estrecho o medio en la barra',
      'Tira de la barra hacia la barbilla',
      'Los codos van más altos que las manos',
      'Trabaja trapecio superior y deltoides',
      'Usa agarre más ancho si sientes molestias en hombros'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'farmer-walk-trap',
    name: 'Caminata de Granjero (Énfasis Trapecio)',
    muscleGroup: 'trapecio',
    equipment: 'Mancuernas',
    defaultSets: 4,
    defaultReps: 1,
    image: URL_STORAGE + 'male-dumbbell-farmers-walk-trap-side.gif',
    technique: [
      'Carga muy pesada en cada mano',
      'Camina con postura erguida, hombros hacia atrás',
      'Los trapecios trabajan isométricamente para estabilizar',
      'Excelente para fuerza funcional del trapecio'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '30-60 segundos o 20-40 metros',
    restTime: '90-120 segundos'
  },
  {
    id: 'overhead-shrugs',
    name: 'Encogimientos sobre Cabeza',
    muscleGroup: 'trapecio',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-barbell-overhead-shrugs-front.gif',
    technique: [
      'Barra sobre la cabeza con brazos bloqueados',
      'Empuja la barra hacia arriba encogiendo los hombros',
      'Trabaja el trapecio inferior y medio',
      'Excelente para salud del hombro'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'snatch-grip-high-pull',
    name: 'Jalón Alto con Agarre Arrancada',
    muscleGroup: 'trapecio',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 8,
    image: URL_STORAGE + 'male-barbell-snatch-grip-high-pull-front.gif',
    technique: [
      'Agarre muy amplio en la barra',
      'Movimiento explosivo desde las caderas',
      'Tira de la barra hacia arriba con los codos altos',
      'Desarrolla potencia y fuerza del trapecio'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '6-10 repeticiones',
    restTime: '2-3 minutos'
  },
  {
    id: 'rack-pulls-trap',
    name: 'Rack Pulls (Énfasis Trapecio)',
    muscleGroup: 'trapecio',
    equipment: 'Barra',
    defaultSets: 4,
    defaultReps: 6,
    image: URL_STORAGE + 'male-barbell-rack-pull-trap-side.gif',
    technique: [
      'Barra en los seguros a la altura de las rodillas',
      'Peso muerto parcial con énfasis en trapecio superior',
      'Encoge los hombros al final del movimiento',
      'Permite usar cargas muy pesadas'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '4-8 repeticiones',
    restTime: '2-3 minutos'
  },
  {
    id: 'incline-shrugs',
    name: 'Encogimientos en Banco Inclinado',
    muscleGroup: 'trapecio',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-dumbbell-incline-shrugs-front.gif',
    technique: [
      'Acostado boca abajo en banco inclinado a 45 grados',
      'Mancuernas colgando hacia el suelo',
      'Encoge los hombros hacia las orejas',
      'Trabaja el trapecio medio e inferior'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'cable-upright-row',
    name: 'Remo al Cuello en Polea',
    muscleGroup: 'trapecio',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-upright-row-front.gif',
    technique: [
      'Polea baja con barra recta o cuerda',
      'Tira hacia la barbilla con codos altos',
      'Tensión constante durante todo el movimiento',
      'Más suave para las articulaciones que con barra libre'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'cable-y-raise',
    name: 'Elevaciones en Y en Polea',
    muscleGroup: 'trapecio',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    technique: [
      'Poleas bajas, una manija en cada mano',
      'Eleva los brazos formando una "Y"',
      'Trabaja trapecio inferior y deltoides posterior',
      'Excelente para salud del hombro'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'cable-reverse-fly-trap',
    name: 'Aperturas Inversas en Polea',
    muscleGroup: 'trapecio',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    technique: [
      'Poleas a altura del pecho, cruza los cables',
      'Abre los brazos hacia los lados',
      'Aprieta los omóplatos al final',
      'Trabaja trapecio medio y deltoides posterior'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'prone-y-raise',
    name: 'Elevaciones en Y Prono',
    muscleGroup: 'trapecio',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    technique: [
      'Acostado boca abajo en banco inclinado',
      'Eleva los brazos formando una "Y"',
      'Trabaja trapecio inferior y romboides',
      'Usa peso ligero, enfócate en la contracción'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'dumbbell-high-pull',
    name: 'Jalón Alto con Mancuernas',
    muscleGroup: 'trapecio',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 10,
    technique: [
      'Mancuernas frente a ti, movimiento explosivo',
      'Tira hacia arriba con codos altos',
      'Similar al remo al cuello pero más dinámico',
      'Desarrolla potencia del trapecio'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '90 segundos'
  },
  {
    id: 'smith-machine-shrug',
    name: 'Encogimientos en Smith',
    muscleGroup: 'trapecio',
    equipment: 'Máquina Smith',
    defaultSets: 4,
    defaultReps: 15,
    technique: [
      'Barra en la Smith a la altura de los muslos',
      'Eleva los hombros hacia las orejas',
      'Mayor estabilidad que con barra libre',
      'Permite enfocarse completamente en los trapecios'
    ],
    recommendedSets: '3-5 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'single-arm-cable-shrug',
    name: 'Encogimientos Unilaterales en Polea',
    muscleGroup: 'trapecio',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    technique: [
      'Polea baja, una manija en una mano',
      'Encoge el hombro hacia la oreja',
      'Corrige desbalances entre lados',
      'Mayor rango de movimiento que bilateral'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-18 por lado',
    restTime: '45-60 segundos'
  },
  {
    id: 'kelso-shrugs',
    name: 'Encogimientos Kelso',
    muscleGroup: 'trapecio',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 15,
    technique: [
      'Acostado boca abajo en banco inclinado alto',
      'Mancuernas colgando, encoge hacia las orejas',
      'Elimina el impulso del cuerpo',
      'Aislamiento puro del trapecio superior'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-20 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'power-shrugs',
    name: 'Encogimientos de Potencia',
    muscleGroup: 'trapecio',
    equipment: 'Barra',
    defaultSets: 4,
    defaultReps: 8,
    technique: [
      'Peso muerto explosivo con encogimiento al final',
      'Movimiento dinámico desde las caderas',
      'Desarrolla potencia y fuerza explosiva',
      'Combina peso muerto con encogimiento'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '6-10 repeticiones',
    restTime: '2-3 minutos'
  }
];


// Export genérico para carga dinámica
export const exercises = trapecioExercises;
