import { ExerciseTemplate, URL_STORAGE } from '../types';

export const coreExercises: ExerciseTemplate[] = [
  {
    id: 'plank',
    name: 'Plancha',
    muscleGroup: 'core',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 60,
    image: URL_STORAGE + 'male-bodyweight-plank-side.gif',
    technique: [
      'Mantén el cuerpo en línea recta',
      'No dejes caer las caderas',
      'Aprieta el abdomen y glúteos',
      'Respira normalmente'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '30-60 segundos',
    restTime: '60 segundos'
  },
  {
    id: 'crunches',
    name: 'Abdominales',
    muscleGroup: 'core',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 20,
    image: URL_STORAGE + 'male-bodyweight-crunch-side.gif',
    technique: [
      'Manos detrás de la cabeza sin jalar el cuello',
      'Levanta solo los omóplatos del suelo',
      'Contrae el abdomen conscientemente',
      'No uses impulso'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-25 repeticiones',
    restTime: '45 segundos'
  },
  {
    id: 'russian-twist',
    name: 'Giros Rusos',
    muscleGroup: 'core',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 20,
    image: URL_STORAGE + 'male-bodyweight-russian-twist-side.gif',
    technique: [
      'Siéntate con rodillas dobladas, pies elevados',
      'Inclínate ligeramente hacia atrás',
      'Gira el torso de lado a lado',
      'Toca el suelo a cada lado'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '20-30 repeticiones totales',
    restTime: '45 segundos'
  },
  {
    id: 'leg-raises',
    name: 'Elevaciones de Piernas',
    muscleGroup: 'core',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-bodyweight-leg-raise-side.gif',
    technique: [
      'Acuéstate boca arriba, manos bajo los glúteos',
      'Mantén las piernas rectas',
      'Eleva las piernas hasta 90 grados',
      'Baja con control sin tocar el suelo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-20 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'bicycle-crunches',
    name: 'Bicicleta en el Aire',
    muscleGroup: 'core',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 20,
    image: URL_STORAGE + 'male-bodyweight-bicycle-crunch-side.gif',
    technique: [
      'Acuéstate boca arriba, manos detrás de la cabeza',
      'Lleva el codo al rodilla opuesta alternadamente',
      'Mantén el core contraído',
      'Excelente para oblicuos'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '20-30 repeticiones totales',
    restTime: '45 segundos'
  },
  {
    id: 'mountain-climbers',
    name: 'Escaladores',
    muscleGroup: 'core',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 30,
    image: URL_STORAGE + 'male-bodyweight-mountain-climbers-side.gif',
    technique: [
      'Posición de plancha alta',
      'Lleva las rodillas al pecho alternadamente',
      'Mantén las caderas bajas',
      'Movimiento rápido y continuo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '30-60 segundos',
    restTime: '45-60 segundos'
  },
  {
    id: 'dead-bug',
    name: 'Dead Bug',
    muscleGroup: 'core',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-bodyweight-dead-bug-side.gif',
    technique: [
      'Acuéstate boca arriba, brazos extendidos al techo',
      'Rodillas a 90 grados',
      'Baja brazo y pierna opuestos simultáneamente',
      'Mantén la espalda baja pegada al suelo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones por lado',
    restTime: '45 segundos'
  },
  {
    id: 'cable-woodchop',
    name: 'Leñador en Polea',
    muscleGroup: 'core',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-wood-chop-front.gif',
    technique: [
      'Polea alta, agarre con ambas manos',
      'Gira el torso llevando el cable en diagonal',
      'Trabaja los oblicuos y rotación',
      'Mantén los brazos extendidos'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 repeticiones por lado',
    restTime: '45-60 segundos'
  },
  {
    id: 'hanging-knee-raise',
    name: 'Elevación de Rodillas Colgado',
    muscleGroup: 'core',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-bodyweight-hanging-knee-raise-side.gif',
    technique: [
      'Cuélgate de una barra',
      'Eleva las rodillas hacia el pecho',
      'Evita balanceo excesivo',
      'Mayor dificultad que elevaciones en el suelo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-20 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'ab-wheel',
    name: 'Rueda Abdominal',
    muscleGroup: 'core',
    equipment: 'Rueda abdominal',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-wheel-ab-wheel-rollout-side.gif',
    technique: [
      'Arrodíllate, sostén la rueda con ambas manos',
      'Rueda hacia adelante manteniendo el core tenso',
      'No dejes que la espalda se arquee',
      'Regresa usando los abdominales'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'side-plank',
    name: 'Plancha Lateral',
    muscleGroup: 'core',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 45,
    image: URL_STORAGE + 'male-bodyweight-side-plank-side.gif',
    technique: [
      'Apóyate en un antebrazo y el lado del pie',
      'Mantén el cuerpo en línea recta',
      'Trabaja los oblicuos intensamente',
      'No dejes caer las caderas'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '30-60 segundos por lado',
    restTime: '45-60 segundos'
  },
  {
    id: 'cable-crunch',
    name: 'Crunch en Polea',
    muscleGroup: 'core',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-cable-crunch-front.gif',
    technique: [
      'Arrodíllate frente a la polea alta con cuerda',
      'Flexiona el torso llevando los codos a las rodillas',
      'Mantén las caderas fijas, solo mueve el torso',
      'Permite agregar resistencia progresiva al core'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'pallof-press',
    name: 'Pallof Press',
    muscleGroup: 'core',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-pallof-press-front.gif',
    technique: [
      'De pie lateral a la polea, agarre con ambas manos',
      'Extiende los brazos al frente resistiendo la rotación',
      'Mantén las caderas y hombros estables',
      'Excelente ejercicio anti-rotación para el core'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 por lado',
    restTime: '45-60 segundos'
  },
  {
    id: 'hanging-leg-raise',
    name: 'Elevación de Piernas Colgado',
    muscleGroup: 'core',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-bodyweight-hanging-leg-raise-side.gif',
    technique: [
      'Cuélgate de una barra con brazos extendidos',
      'Eleva las piernas rectas hasta 90 grados o más',
      'Evita el balanceo controlando el movimiento',
      'Más avanzado que la elevación de rodillas'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'v-ups',
    name: 'V-ups',
    muscleGroup: 'core',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-bodyweight-v-up-side.gif',
    technique: [
      'Acuéstate con brazos y piernas extendidos',
      'Sube simultáneamente torso y piernas formando una V',
      'Toca los pies con las manos en la parte superior',
      'Baja con control sin tocar completamente el suelo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'cable-reverse-crunch',
    name: 'Crunch Inverso en Polea',
    muscleGroup: 'core',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-cable-reverse-crunch-front.gif',
    technique: [
      'Acuéstate con correa en tobillos conectada a polea baja',
      'Lleva las rodillas hacia el pecho elevando las caderas',
      'Enfoca el trabajo en el abdomen inferior',
      'Baja con control sin dejar que el peso te jale'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'cable-sit-up',
    name: 'Abdominales en Polea',
    muscleGroup: 'core',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-cable-sit-up-front.gif',
    technique: [
      'Acuéstate con cuerda de polea baja sobre el pecho',
      'Haz sit-up completo contra la resistencia',
      'Tensión constante en los abdominales',
      'Permite progresión de peso'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'side-plank-cable-row',
    name: 'Remo en Plancha Lateral con Polea',
    muscleGroup: 'core',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-side-plank-cable-row-front.gif',
    technique: [
      'Plancha lateral, mano libre agarra manija de polea',
      'Haz remo mientras mantienes la plancha',
      'Desafío extremo para oblicuos y estabilidad',
      'Combina anti-rotación con fuerza de tracción'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 por lado',
    restTime: '60-90 segundos'
  },
  {
    id: 'stability-ball-russian-twist',
    name: 'Giros Rusos en Balón',
    muscleGroup: 'core',
    equipment: 'Balón de estabilidad',
    defaultSets: 3,
    defaultReps: 20,
    image: URL_STORAGE + 'male-stability-ball-russian-twist-front.gif',
    technique: [
      'Espalda apoyada en balón, pies firmes en el suelo',
      'Gira el torso de lado a lado',
      'Mayor rango de movimiento que en el suelo',
      'Desafía el equilibrio y los oblicuos'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '20-30 repeticiones totales',
    restTime: '45 segundos'
  },
  {
    id: 'hollow-body-hold',
    name: 'Posición Hueca',
    muscleGroup: 'core',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 45,
    image: URL_STORAGE + 'male-hollow-body-hold-front.gif',
    technique: [
      'Acuéstate boca arriba, eleva hombros y piernas del suelo',
      'Brazos extendidos sobre la cabeza',
      'Espalda baja pegada al suelo',
      'Ejercicio fundamental de gimnasia para core'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '30-60 segundos',
    restTime: '60 segundos'
  }
];


// Export genérico para carga dinámica
export const exercises = coreExercises;
