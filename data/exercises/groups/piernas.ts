/**
 * Ejercicios de piernas
 */

import type { ExerciseTemplate } from '../types';
import { URL_STORAGE } from '../types';

export const exercises: ExerciseTemplate[] = [
  {
    id: 'squat',
    name: 'Sentadilla',
    muscleGroup: 'piernas',
    equipment: 'Barra',
    defaultSets: 4,
    defaultReps: 10,
    image: URL_STORAGE + 'male-barbell-squat-front.gif',
    technique: [
      'Pies al ancho de hombros',
      'Baja como si te sentaras en una silla',
      'Rodillas en línea con los pies',
      'Baja al menos hasta que muslos estén paralelos al suelo',
      'Mantén el pecho arriba y mirada al frente'
    ],
    recommendedSets: '3-5 series',
    recommendedReps: '6-12 repeticiones',
    restTime: '2-3 minutos'
  },
  {
    id: 'leg-press',
    name: 'Prensa de Piernas',
    muscleGroup: 'piernas',
    equipment: 'Máquina',
    defaultSets: 4,
    defaultReps: 12,
    image: URL_STORAGE + 'male-machine-leg-press-front.gif',
    technique: [
      'Pies al ancho de hombros en la plataforma',
      'Baja hasta que rodillas formen 90 grados',
      'No despegues la espalda baja del respaldo',
      'Empuja con todo el pie, no solo los dedos'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'leg-extension',
    name: 'Extensión de Piernas',
    muscleGroup: 'piernas',
    equipment: 'Máquina',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-machine-leg-extension-front.gif',
    technique: [
      'Ajusta el respaldo para 90 grados en rodillas',
      'Extiende completamente las piernas',
      'Pausa brevemente arriba contrayendo',
      'Baja con control'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'leg-curl',
    name: 'Curl de Piernas',
    muscleGroup: 'piernas',
    equipment: 'Máquina',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-machine-leg-curl-front.gif',
    technique: [
      'Mantén las caderas pegadas al banco',
      'Lleva los talones hacia los glúteos',
      'Controla el movimiento en ambas direcciones',
      'No arquees la espalda'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'lunges',
    name: 'Zancadas',
    muscleGroup: 'piernas',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-lunge-front.gif',
    technique: [
      'Da un paso amplio hacia adelante',
      'Baja hasta que la rodilla trasera casi toque el suelo',
      'La rodilla delantera no debe pasar la punta del pie',
      'Mantén el torso erguido'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones por pierna',
    restTime: '60-90 segundos'
  },
  {
    id: 'front-squat',
    name: 'Sentadilla Frontal',
    muscleGroup: 'piernas',
    equipment: 'Barra',
    defaultSets: 4,
    defaultReps: 8,
    image: URL_STORAGE + 'male-barbell-front-squat-front.gif',
    technique: [
      'Barra en la parte frontal de los hombros',
      'Codos altos, paralelos al suelo',
      'Mayor énfasis en cuádriceps',
      'Mantén el torso más vertical que en sentadilla trasera'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '6-10 repeticiones',
    restTime: '2-3 minutos'
  },
  {
    id: 'romanian-deadlift',
    name: 'Peso Muerto Rumano',
    muscleGroup: 'piernas',
    equipment: 'Barra',
    defaultSets: 4,
    defaultReps: 10,
    image: URL_STORAGE + 'male-barbell-romanian-deadlift-side.gif',
    technique: [
      'Rodillas ligeramente flexionadas',
      'Baja la barra deslizándola por las piernas',
      'Siente el estiramiento en los isquiotibiales',
      'No redondees la espalda'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'goblet-squat',
    name: 'Sentadilla Goblet',
    muscleGroup: 'piernas',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-goblet-squat-front.gif',
    technique: [
      'Sostén una mancuerna verticalmente contra el pecho',
      'Baja profundo manteniendo el pecho arriba',
      'Los codos pasan entre las rodillas',
      'Excelente para aprender la técnica de sentadilla'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'leg-press-single',
    name: 'Prensa Unilateral',
    muscleGroup: 'piernas',
    equipment: 'Máquina',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-machine-single-leg-press-front.gif',
    technique: [
      'Trabaja una pierna a la vez',
      'Corrige desbalances musculares',
      'Mayor activación y concentración',
      'Mantén la espalda pegada al respaldo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones por pierna',
    restTime: '60-90 segundos'
  },
  {
    id: 'hack-squat',
    name: 'Sentadilla Hack',
    muscleGroup: 'piernas',
    equipment: 'Máquina',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-machine-hack-squat-front.gif',
    technique: [
      'Espalda apoyada en el pad de la máquina',
      'Pies adelante en la plataforma',
      'Gran activación de cuádriceps',
      'Baja hasta 90 grados o más'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'box-jumps',
    name: 'Saltos al Cajón',
    muscleGroup: 'piernas',
    equipment: 'Cajón pliométrico',
    defaultSets: 3,
    defaultReps: 10,
    image: URL_STORAGE + 'male-bodyweight-box-jump-side.gif',
    technique: [
      'Salta explosivamente sobre el cajón',
      'Aterriza suavemente con rodillas flexionadas',
      'Desarrolla potencia y explosividad',
      'Baja con cuidado'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'machine-adduction',
    name: 'Aducción en Máquina',
    muscleGroup: 'piernas',
    equipment: 'Máquina',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-machine-hip-adduction-front.gif',
    technique: [
      'Siéntate con las piernas abiertas en las almohadillas',
      'Junta las piernas de forma controlada',
      'Aprieta los aductores en la contracción máxima',
      'Regresa lentamente a la posición inicial'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'machine-abduction',
    name: 'Abducción en Máquina',
    muscleGroup: 'piernas',
    equipment: 'Máquina',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-machine-hip-abduction-front.gif',
    technique: [
      'Siéntate con las piernas juntas en las almohadillas',
      'Abre las piernas empujando hacia afuera',
      'Contrae los abductores y glúteo medio',
      'Regresa con control sin dejar caer el peso'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'barbell-good-morning',
    name: 'Buenos Días con Barra',
    muscleGroup: 'piernas',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 10,
    image: URL_STORAGE + 'male-barbell-good-morning-side.gif',
    technique: [
      'Barra apoyada en la parte alta de la espalda',
      'Pies al ancho de los hombros, rodillas ligeramente flexionadas',
      'Inclínate hacia adelante desde la cadera',
      'Mantén la espalda recta y sube contrayendo isquiotibiales'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '90 segundos'
  },
  {
    id: 'sissy-squat',
    name: 'Sissy Squat',
    muscleGroup: 'piernas',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-bodyweight-sissy-squat-side.gif',
    technique: [
      'De pie, sujétate de un soporte para equilibrio',
      'Inclina el torso hacia atrás y flexiona las rodillas',
      'Baja hasta sentir tensión intensa en los cuádriceps',
      'Sube con control manteniendo el torso inclinado'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'dumbbell-single-leg-deadlift',
    name: 'Peso Muerto a Una Pierna',
    muscleGroup: 'piernas',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 10,
    image: URL_STORAGE + 'male-dumbbell-single-leg-deadlift-side.gif',
    technique: [
      'De pie sobre una pierna, mancuerna en la mano opuesta',
      'Inclínate hacia adelante mientras la pierna libre sube',
      'Forma una T con el cuerpo',
      'Regresa contrayendo isquiotibial y glúteo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 por pierna',
    restTime: '60-90 segundos'
  }
];
