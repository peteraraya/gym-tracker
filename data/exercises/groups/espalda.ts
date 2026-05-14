/**
 * Ejercicios de espalda
 */

import type { ExerciseTemplate } from '../types';
import { URL_STORAGE } from '../types';

export const exercises: ExerciseTemplate[] = [
  {
    id: 'deadlift',
    name: 'Peso Muerto',
    muscleGroup: 'espalda',
    equipment: 'Barra',
    defaultSets: 4,
    defaultReps: 8,
    image: URL_STORAGE + 'male-barbell-deadlift-side.gif',
    technique: [
      'Mantén la espalda recta durante todo el movimiento',
      'Empuja con las piernas primero',
      'La barra debe rozar las piernas al subir',
      'Mantén el pecho hacia afuera y hombros hacia atrás'
    ],
    recommendedSets: '3-5 series',
    recommendedReps: '5-8 repeticiones',
    restTime: '3-5 minutos'
  },
  {
    id: 'pull-ups',
    name: 'Dominadas',
    muscleGroup: 'espalda',
    equipment: 'Peso corporal',
    defaultSets: 4,
    defaultReps: 10,
    image: URL_STORAGE + 'male-bodyweight-pullup-back.gif',
    technique: [
      'Agarre ligeramente más ancho que los hombros',
      'Tira con los codos hacia abajo',
      'Lleva el pecho hacia la barra',
      'Baja con control hasta extensión completa'
    ],
    recommendedSets: '3-5 series',
    recommendedReps: '6-12 repeticiones',
    restTime: '2-3 minutos'
  },
  {
    id: 'barbell-row',
    name: 'Remo con Barra',
    muscleGroup: 'espalda',
    equipment: 'Barra',
    defaultSets: 4,
    defaultReps: 10,
    image: URL_STORAGE + 'male-barbell-bent-over-row-back.gif',
    technique: [
      'Inclínate a 45 grados manteniendo espalda recta',
      'Tira de la barra hacia el abdomen bajo',
      'Mantén los codos cerca del cuerpo',
      'Contrae los omóplatos al final del movimiento'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'lat-pulldown',
    name: 'Jalón al Pecho',
    muscleGroup: 'espalda',
    equipment: 'Máquina',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-wide-grip-lat-pulldown-back.gif',
    technique: [
      'Agarre amplio, palmas hacia adelante',
      'Inclínate ligeramente hacia atrás',
      'Tira hasta que la barra toque el pecho superior',
      'Controla la subida, no dejes que el peso te levante'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'dumbbell-row',
    name: 'Remo con Mancuerna',
    muscleGroup: 'espalda',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-bent-over-row-back.gif',
    technique: [
      'Apoya rodilla y mano en un banco',
      'Mantén la espalda paralela al suelo',
      'Tira del codo hacia el techo',
      'Rota ligeramente el torso en la contracción'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones por lado',
    restTime: '60-90 segundos'
  },
  {
    id: 'face-pulls',
    name: 'Face Pulls',
    muscleGroup: 'espalda',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-cable-face-pull-front.gif',
    technique: [
      'Usa una cuerda en polea alta',
      'Tira hacia la cara separando las manos',
      'Rota externamente los hombros',
      'Mantén los codos altos'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 't-bar-row',
    name: 'Remo en T',
    muscleGroup: 'espalda',
    equipment: 'Barra',
    defaultSets: 4,
    defaultReps: 10,
    image: URL_STORAGE + 'male-barbell-t-bar-row-back.gif',
    technique: [
      'Coloca la barra en una esquina o usa máquina de T-bar',
      'Mantén la espalda recta, rodillas ligeramente flexionadas',
      'Tira de la barra hacia el pecho',
      'Contrae los omóplatos al final del movimiento'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'seated-cable-row',
    name: 'Remo en Polea Baja',
    muscleGroup: 'espalda',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-seated-row-back.gif',
    technique: [
      'Siéntate con los pies en la plataforma',
      'Mantén la espalda recta y el pecho hacia afuera',
      'Tira del agarre hacia el abdomen',
      'No uses impulso del cuerpo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'chin-ups',
    name: 'Dominadas Supinas',
    muscleGroup: 'espalda',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 10,
    image: URL_STORAGE + 'male-bodyweight-chin-up-back.gif',
    technique: [
      'Agarre con palmas hacia ti',
      'Tira hasta que la barbilla supere la barra',
      'Mayor activación de bíceps que dominadas pronadas',
      'Baja con control hasta extensión completa'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '6-12 repeticiones',
    restTime: '2-3 minutos'
  },
  {
    id: 'inverted-row',
    name: 'Remo Invertido',
    muscleGroup: 'espalda',
    equipment: 'TRX/Barra baja',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-bodyweight-inverted-row-back.gif',
    technique: [
      'Cuerpo en línea recta, agarrando barra baja',
      'Tira del pecho hacia la barra',
      'Mantén el core activado',
      'Excelente para principiantes'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'straight-arm-pulldown',
    name: 'Pulldown con Brazos Rectos',
    muscleGroup: 'espalda',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-straight-arm-pulldown-back.gif',
    technique: [
      'Mantén los brazos casi rectos durante todo el movimiento',
      'Tira de la barra hacia las caderas',
      'Enfoca en los dorsales',
      'No dobles los codos'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'wide-grip-cable-row',
    name: 'Remo en Polea Agarre Ancho',
    muscleGroup: 'espalda',
    equipment: 'Poleas',
    description: 'Enfoca el trabajo en la espalda superior y media',
    defaultSets: 3,
    defaultReps: 12,
    difficulty: 'intermedio',
    image: URL_STORAGE + 'male-wide-grip-cable-row-front.gif',
    category: 'compuesto',
    primaryMuscles: ['Dorsal Ancho', 'Romboides', 'Trapecio Medio'],
    secondaryMuscles: ['Deltoides Posterior', 'Bíceps'],
    technique: [
      'Usa una barra ancha en polea baja',
      'Mantén el pecho elevado y espalda recta',
      'Tira hacia el pecho superior',
      'Contrae los omóplatos al final'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '90 segundos'
  },
  {
    id: 'one-arm-cable-row',
    name: 'Remo Unilateral en Polea',
    muscleGroup: 'espalda',
    equipment: 'Poleas',
    description: 'Permite trabajar cada lado independientemente corrigiendo desbalances',
    defaultSets: 3,
    defaultReps: 12,
    difficulty: 'intermedio',
    image: URL_STORAGE + 'male-one-arm-cable-row-front.gif',
    category: 'compuesto',
    primaryMuscles: ['Dorsal Ancho', 'Romboides'],
    secondaryMuscles: ['Bíceps', 'Core'],
    technique: [
      'Usa una manija en polea baja',
      'Mantén el core activado para estabilidad',
      'Tira hacia el costado del abdomen',
      'Permite rotación natural del torso'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones por lado',
    restTime: '60-90 segundos'
  },
  {
    id: 'cable-pullover',
    name: 'Pullover en Polea',
    muscleGroup: 'espalda',
    equipment: 'Poleas',
    description: 'Excelente para aislar los dorsales con tensión constante',
    defaultSets: 3,
    defaultReps: 12,
    difficulty: 'intermedio',
    image: URL_STORAGE + 'male-cable-pullover-front.gif',
    category: 'aislamiento',
    primaryMuscles: ['Dorsal Ancho'],
    secondaryMuscles: ['Pectoral Mayor', 'Tríceps'],
    technique: [
      'Usa una barra recta en polea alta',
      'Inclínate ligeramente hacia adelante',
      'Tira de la barra hacia las caderas con brazos casi rectos',
      'Enfoca en contraer los dorsales'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'reverse-grip-lat-pulldown',
    name: 'Jalón Agarre Supino',
    muscleGroup: 'espalda',
    equipment: 'Máquina',
    description: 'Variante que enfatiza la parte baja de los dorsales y bíceps',
    defaultSets: 3,
    defaultReps: 12,
    difficulty: 'intermedio',
    image: URL_STORAGE + 'male-reverse-grip-lat-pulldown-front.gif',
    category: 'compuesto',
    primaryMuscles: ['Dorsal Ancho Inferior', 'Bíceps'],
    secondaryMuscles: ['Romboides', 'Trapecio'],
    technique: [
      'Agarre con palmas hacia ti, ancho de hombros',
      'Tira de la barra hacia el pecho superior',
      'Mantén el pecho elevado',
      'Mayor activación de bíceps que agarre prono'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '90 segundos'
  },
  {
    id: 'close-grip-lat-pulldown',
    name: 'Jalón Agarre Cerrado',
    muscleGroup: 'espalda',
    equipment: 'Máquina',
    description: 'Enfoca el trabajo en el grosor de la espalda',
    defaultSets: 3,
    defaultReps: 12,
    difficulty: 'intermedio',
    image: URL_STORAGE + 'male-close-grip-lat-pulldown-front.gif',
    category: 'compuesto',
    primaryMuscles: ['Dorsal Ancho', 'Romboides'],
    secondaryMuscles: ['Bíceps', 'Trapecio Inferior'],
    technique: [
      'Usa un agarre en V o agarre cerrado',
      'Tira hacia el pecho superior',
      'Enfoca en contraer los omóplatos',
      'Permite mayor rango de movimiento'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '90 segundos'
  },
  {
    id: 'pendlay-row',
    name: 'Remo Pendlay',
    muscleGroup: 'espalda',
    equipment: 'Barra',
    description: 'Variante explosiva del remo con barra desde el suelo',
    defaultSets: 4,
    defaultReps: 8,
    difficulty: 'avanzado',
    image: URL_STORAGE + 'male-pendlay-row-front.gif',
    category: 'compuesto',
    primaryMuscles: ['Dorsal Ancho', 'Romboides', 'Trapecio'],
    secondaryMuscles: ['Erectores Espinales', 'Glúteos'],
    technique: [
      'Torso paralelo al suelo',
      'La barra toca el suelo entre repeticiones',
      'Movimiento explosivo hacia el pecho',
      'Pausa completa en el suelo'
    ],
    recommendedSets: '3-5 series',
    recommendedReps: '5-8 repeticiones',
    restTime: '2-3 minutos'
  },
  {
    id: 'meadows-row',
    name: 'Remo Meadows',
    muscleGroup: 'espalda',
    equipment: 'Barra',
    description: 'Remo unilateral con barra que permite gran estiramiento',
    defaultSets: 3,
    defaultReps: 10,
    difficulty: 'intermedio',
    image: URL_STORAGE + 'male-meadows-row-front.gif',
    category: 'compuesto',
    primaryMuscles: ['Dorsal Ancho', 'Romboides'],
    secondaryMuscles: ['Bíceps', 'Core'],
    technique: [
      'Coloca la barra en esquina o landmine',
      'Posición de pie, inclinado hacia adelante',
      'Tira de la barra hacia la cadera',
      'Permite rotación natural del torso'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones por lado',
    restTime: '90 segundos'
  },
  {
    id: 'seal-row',
    name: 'Remo Seal',
    muscleGroup: 'espalda',
    equipment: 'Mancuernas',
    description: 'Remo en banco elevado que elimina el impulso del cuerpo',
    defaultSets: 3,
    defaultReps: 12,
    difficulty: 'intermedio',
    image: URL_STORAGE + 'male-seal-row-front.gif',
    category: 'compuesto',
    primaryMuscles: ['Dorsal Ancho', 'Romboides', 'Trapecio Medio'],
    secondaryMuscles: ['Deltoides Posterior', 'Bíceps'],
    technique: [
      'Acuéstate boca abajo en banco elevado',
      'Deja que los brazos cuelguen perpendiculares al suelo',
      'Tira de las mancuernas hacia las costillas',
      'Elimina el impulso del cuerpo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '90 segundos'
  },
  {
    id: 'cable-high-row',
    name: 'Remo Alto en Polea',
    muscleGroup: 'espalda',
    equipment: 'Poleas',
    description: 'Enfoca el trabajo en la espalda superior y trapecios medios',
    defaultSets: 3,
    defaultReps: 12,
    difficulty: 'intermedio',
    image: URL_STORAGE + 'male-cable-high-row-front.gif',
    category: 'compuesto',
    primaryMuscles: ['Trapecio Medio', 'Romboides', 'Deltoides Posterior'],
    secondaryMuscles: ['Dorsal Ancho Superior'],
    technique: [
      'Ajusta la polea en posición alta',
      'Tira hacia la cara/cuello',
      'Mantén los codos altos',
      'Contrae los omóplatos al final'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'rack-pulls',
    name: 'Rack Pulls',
    muscleGroup: 'espalda',
    equipment: 'Barra',
    description: 'Peso muerto parcial que enfoca la espalda superior y trapecios',
    defaultSets: 4,
    defaultReps: 6,
    difficulty: 'intermedio',
    image: URL_STORAGE + 'male-rack-pulls-front.gif',
    category: 'compuesto',
    primaryMuscles: ['Trapecio', 'Erectores Espinales', 'Dorsal Ancho'],
    secondaryMuscles: ['Glúteos', 'Isquiotibiales'],
    technique: [
      'Coloca la barra en el rack a altura de rodillas',
      'Ejecuta la parte superior del peso muerto',
      'Permite usar más peso que peso muerto completo',
      'Enfoca en contraer trapecios al final'
    ],
    recommendedSets: '3-5 series',
    recommendedReps: '5-8 repeticiones',
    restTime: '2-3 minutos'
  }
];
