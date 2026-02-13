import { ExerciseTemplate, URL_STORAGE } from '../types';

export const tricepsExercises: ExerciseTemplate[] = [
  {
    id: 'tricep-dips',
    name: 'Fondos en Paralelas',
    muscleGroup: 'triceps',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-bodyweight-tricep-dip-front.gif',
    technique: [
      'Mantén el cuerpo vertical para enfoque en tríceps',
      'Baja hasta que codos formen 90 grados',
      'No bajes demasiado para evitar lesiones en hombros',
      'Empuja con fuerza para subir'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-15 repeticiones',
    restTime: '90 segundos'
  },
  {
    id: 'tricep-extension',
    name: 'Extensión de Tríceps',
    muscleGroup: 'triceps',
    equipment: 'Mancuernas/Polea',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-overhead-tricep-extension-front.gif',
    technique: [
      'Mantén los codos quietos y apuntando hacia arriba',
      'Solo mueve los antebrazos',
      'Extiende completamente para máxima contracción',
      'Control total en el regreso'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'close-grip-bench',
    name: 'Press de Banca Agarre Cerrado',
    muscleGroup: 'triceps',
    equipment: 'Barra',
    defaultSets: 4,
    defaultReps: 10,
    image: URL_STORAGE + 'male-barbell-close-grip-bench-press-front.gif',
    technique: [
      'Manos separadas al ancho de los hombros o menos',
      'Mantén los codos cerca del cuerpo',
      'Excelente para tríceps',
      'Baja la barra al pecho medio/bajo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '6-10 repeticiones',
    restTime: '2-3 minutos'
  },
  {
    id: 'skull-crushers',
    name: 'Rompecráneos',
    muscleGroup: 'triceps',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-barbell-skull-crusher-side.gif',
    technique: [
      'Acuéstate en un banco, barra sobre la frente',
      'Mantén los codos fijos apuntando al techo',
      'Baja la barra hacia la frente con control',
      'Extiende solo usando los tríceps'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'tricep-pushdown',
    name: 'Extensión de Tríceps en Polea',
    muscleGroup: 'triceps',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-cable-tricep-pushdown-front.gif',
    technique: [
      'Usa barra recta o cuerda en polea alta',
      'Mantén los codos pegados a los costados',
      'Empuja hacia abajo hasta extensión completa',
      'No uses impulso del cuerpo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'dip-machine',
    name: 'Fondos en Máquina',
    muscleGroup: 'triceps',
    equipment: 'Máquina',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-machine-tricep-dip-front.gif',
    technique: [
      'Siéntate, agarra las barras a los lados',
      'Empuja hacia abajo extendiendo los codos',
      'Ajusta el peso según tu nivel',
      'Alternativa asistida a los fondos libres'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'cable-overhead-tricep',
    name: 'Extensión de Tríceps sobre Cabeza en Polea',
    muscleGroup: 'triceps',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-overhead-tricep-extension-front.gif',
    technique: [
      'Polea baja, cuerda por encima de la cabeza',
      'De espaldas a la polea, un pie adelante',
      'Extiende los brazos hacia adelante sin mover los codos',
      'Mayor estiramiento de la cabeza larga del tríceps'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'kickback-tricep',
    name: 'Patada de Tríceps',
    muscleGroup: 'triceps',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-tricep-kickback-side.gif',
    technique: [
      'Inclínate hacia adelante, codo pegado al costado',
      'Extiende el antebrazo hacia atrás',
      'Contrae el tríceps en la extensión completa',
      'Baja con control sin impulso'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 por brazo',
    restTime: '45-60 segundos'
  },
  {
    id: 'diamond-push-up-tricep',
    name: 'Flexiones Diamante para Tríceps',
    muscleGroup: 'triceps',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-bodyweight-diamond-push-up-tricep-front.gif',
    technique: [
      'Manos juntas formando un diamante bajo el pecho',
      'Codos pegados al cuerpo',
      'Baja hasta que el pecho casi toque las manos',
      'Uno de los mejores ejercicios de tríceps con peso corporal'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'overhead-dumbbell-extension',
    name: 'Extensión con Mancuerna sobre Cabeza',
    muscleGroup: 'triceps',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-overhead-extension-front.gif',
    technique: [
      'Sostén una mancuerna con ambas manos sobre la cabeza',
      'Baja detrás de la cabeza flexionando solo los codos',
      'Extiende de vuelta arriba',
      'Gran estiramiento de la cabeza larga del tríceps'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'cable-rope-overhead-extension',
    name: 'Extensión con Cuerda sobre Cabeza',
    muscleGroup: 'triceps',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-rope-overhead-extension-front.gif',
    technique: [
      'Polea baja, cuerda con ambas manos',
      'De espaldas a la polea, da un paso adelante',
      'Extiende los brazos sobre la cabeza',
      'Tensión constante en todo el rango'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'bench-dips',
    name: 'Fondos en Banco',
    muscleGroup: 'triceps',
    equipment: 'Banco',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-bodyweight-bench-dip-side.gif',
    technique: [
      'Manos en el borde del banco detrás de ti',
      'Piernas extendidas o flexionadas según nivel',
      'Baja hasta que codos formen 90 grados',
      'Empuja de vuelta arriba'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'tate-press',
    name: 'Tate Press',
    muscleGroup: 'triceps',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-tate-press-front.gif',
    technique: [
      'Acostado en banco, mancuernas con agarre neutral',
      'Baja los codos hacia los lados manteniendo mancuernas juntas',
      'Extiende de vuelta arriba',
      'Movimiento único para aislar tríceps'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'jm-press',
    name: 'JM Press',
    muscleGroup: 'triceps',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 10,
    image: URL_STORAGE + 'male-barbell-jm-press-side.gif',
    technique: [
      'Acostado en banco, barra sobre el pecho',
      'Híbrido entre press de banca y skull crusher',
      'Baja hacia la garganta/cuello con codos hacia adentro',
      'Excelente para fuerza de tríceps'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '90 segundos'
  },
  {
    id: 'cable-tricep-extension-single',
    name: 'Extensión de Tríceps Unilateral en Polea',
    muscleGroup: 'triceps',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-single-arm-tricep-extension-front.gif',
    technique: [
      'Polea alta, agarre con una mano',
      'Extiende el brazo completamente hacia abajo',
      'Corrige desbalances entre brazos',
      'Mayor rango de movimiento que bilateral'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 por brazo',
    restTime: '45-60 segundos'
  },
  {
    id: 'reverse-grip-pushdown',
    name: 'Extensión en Polea con Agarre Supino',
    muscleGroup: 'triceps',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-reverse-grip-pushdown-front.gif',
    technique: [
      'Polea alta, agarre supino (palmas hacia arriba)',
      'Empuja hacia abajo manteniendo codos fijos',
      'Mayor activación de la cabeza medial del tríceps',
      'Excelente para definición'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 repeticiones',
    restTime: '45-60 segundos'
  }
];


// Export genérico para carga dinámica
export const exercises = tricepsExercises;
