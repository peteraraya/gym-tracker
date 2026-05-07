/**
 * Ejercicios de glúteos
 */

import type { ExerciseTemplate } from '../types';
import { URL_STORAGE } from '../types';

export const exercises: ExerciseTemplate[] = [
  {
    id: 'hip-thrust',
    name: 'Hip Thrust',
    muscleGroup: 'gluteos',
    equipment: 'Barra',
    defaultSets: 4,
    defaultReps: 12,
    image: URL_STORAGE + 'male-barbell-hip-thrust-side.gif',
    technique: [
      'Apoya la espalda alta en un banco',
      'Pies firmes en el suelo, rodillas a 90 grados arriba',
      'Empuja con los talones, no con los pies',
      'Contrae los glúteos en la parte superior',
      'Barbilla hacia el pecho'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Sentadilla Búlgara',
    muscleGroup: 'gluteos',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-bulgarian-split-squat-front.gif',
    technique: [
      'Apoya el pie trasero en un banco',
      'Baja en vertical manteniendo el torso erguido',
      'La rodilla delantera no debe sobrepasar el pie',
      'Empuja con el talón para subir'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones por pierna',
    restTime: '60-90 segundos'
  },
  {
    id: 'glute-bridge',
    name: 'Puente de Glúteos',
    muscleGroup: 'gluteos',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-bodyweight-glute-bridge-side.gif',
    technique: [
      'Acuéstate boca arriba, rodillas dobladas',
      'Pies cerca de los glúteos',
      'Empuja las caderas hacia arriba',
      'Contrae fuertemente los glúteos arriba'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'cable-kickback',
    name: 'Patada de Glúteo en Polea',
    muscleGroup: 'gluteos',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-cable-kickback-side.gif',
    technique: [
      'Coloca una correa en el tobillo',
      'Mantén el torso ligeramente inclinado',
      'Extiende la pierna hacia atrás',
      'Contrae el glúteo en la extensión máxima'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones por pierna',
    restTime: '45-60 segundos'
  },
  {
    id: 'sumo-deadlift',
    name: 'Peso Muerto Sumo',
    muscleGroup: 'gluteos',
    equipment: 'Barra',
    defaultSets: 4,
    defaultReps: 10,
    image: URL_STORAGE + 'male-barbell-sumo-deadlift-front.gif',
    technique: [
      'Stance amplio, pies apuntando hacia afuera',
      'Mayor activación de glúteos e internos de pierna',
      'Mantén la espalda recta',
      'Empuja el suelo con los talones'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '6-10 repeticiones',
    restTime: '2-3 minutos'
  },
  {
    id: 'donkey-kicks',
    name: 'Patadas de Burro',
    muscleGroup: 'gluteos',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-bodyweight-donkey-kicks-side.gif',
    technique: [
      'En cuatro puntos de apoyo',
      'Eleva una pierna manteniendo rodilla a 90 grados',
      'Empuja el talón hacia el techo',
      'Contrae el glúteo en la parte superior'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-20 repeticiones por pierna',
    restTime: '45 segundos'
  },
  {
    id: 'step-ups',
    name: 'Step Ups',
    muscleGroup: 'gluteos',
    equipment: 'Banco/Cajón',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-step-up-side.gif',
    technique: [
      'Sube al banco con una pierna',
      'Empuja con el talón de la pierna que sube',
      'No uses impulso de la pierna trasera',
      'Baja con control'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones por pierna',
    restTime: '60-90 segundos'
  },
  {
    id: 'single-leg-hip-thrust',
    name: 'Hip Thrust a Una Pierna',
    muscleGroup: 'gluteos',
    equipment: 'Banco',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-bodyweight-single-leg-hip-thrust-side.gif',
    technique: [
      'Espalda apoyada en un banco, una pierna extendida',
      'Empuja con el pie de apoyo elevando la cadera',
      'Aprieta el glúteo arriba durante 2 segundos',
      'Baja con control y repite antes de cambiar pierna'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 por pierna',
    restTime: '60-90 segundos'
  },
  {
    id: 'cable-pull-through',
    name: 'Pull Through en Polea',
    muscleGroup: 'gluteos',
    equipment: 'Polea baja',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-pull-through-side.gif',
    technique: [
      'De espaldas a la polea, agarra la cuerda entre las piernas',
      'Inclínate hacia adelante desde la cadera',
      'Empuja las caderas hacia adelante para subir',
      'Aprieta los glúteos en la posición final'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'reverse-lunge',
    name: 'Zancada Inversa',
    muscleGroup: 'gluteos',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 10,
    image: URL_STORAGE + 'male-dumbbell-reverse-lunge-front.gif',
    technique: [
      'Da un paso hacia atrás manteniendo el torso erguido',
      'Baja hasta que la rodilla trasera casi toque el suelo',
      'Empuja con el pie delantero para volver a la posición',
      'Mayor activación de glúteos que la zancada frontal'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-12 por pierna',
    restTime: '60-90 segundos'
  },
  {
    id: 'frog-pumps',
    name: 'Frog Pumps',
    muscleGroup: 'gluteos',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 20,
    image: URL_STORAGE + 'male-bodyweight-frog-pumps-side.gif',
    technique: [
      'Acostado boca arriba, junta las plantas de los pies',
      'Rodillas abiertas hacia los lados',
      'Empuja las caderas hacia arriba apretando glúteos',
      'Mantén la contracción 1 segundo arriba'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-25 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'cable-squat',
    name: 'Sentadilla en Polea',
    muscleGroup: 'gluteos',
    equipment: 'Poleas',
    defaultSets: 4,
    defaultReps: 12,
    technique: [
      'Polea baja con cuerda o barra',
      'Stance amplio con pies apuntando hacia afuera',
      'Baja hasta que muslos estén paralelos al suelo',
      'Empuja con los talones y aprieta glúteos arriba'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'cable-romanian-deadlift',
    name: 'Peso Muerto Rumano en Polea',
    muscleGroup: 'gluteos',
    equipment: 'Poleas',
    defaultSets: 4,
    defaultReps: 12,
    technique: [
      'Polea baja, de frente a la máquina',
      'Rodillas ligeramente flexionadas',
      'Empuja las caderas hacia atrás manteniendo espalda recta',
      'Siente el estiramiento en glúteos e isquiotibiales'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'cable-single-leg-rdl',
    name: 'Peso Muerto Rumano Unilateral en Polea',
    muscleGroup: 'gluteos',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    technique: [
      'Polea baja, equilibrio en una pierna',
      'Empuja la cadera hacia atrás mientras inclinas el torso',
      'Pierna libre se extiende hacia atrás',
      'Excelente para estabilidad y corregir desbalances'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-12 por pierna',
    restTime: '60-90 segundos'
  },
  {
    id: 'cable-reverse-lunge',
    name: 'Zancada Inversa en Polea',
    muscleGroup: 'gluteos',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    technique: [
      'Polea baja, agarra con una mano',
      'Da un paso hacia atrás en zancada',
      'Baja hasta que rodilla trasera casi toque el suelo',
      'Mayor activación de glúteos que zancada frontal'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 por pierna',
    restTime: '60-90 segundos'
  },
  {
    id: 'cable-hip-abduction',
    name: 'Abducción de Cadera en Polea',
    muscleGroup: 'gluteos',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    technique: [
      'Correa en tobillo, de lado a la máquina',
      'Levanta la pierna hacia el lado',
      'Trabaja el glúteo medio para estabilidad',
      'Mantén la pierna relativamente recta'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-20 por pierna',
    restTime: '45-60 segundos'
  },
  {
    id: 'lateral-lunge',
    name: 'Zancada Lateral',
    muscleGroup: 'gluteos',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    technique: [
      'Da un paso amplio hacia el lado',
      'Baja doblando la pierna lateral, otra pierna recta',
      'Empuja con el talón para volver al centro',
      'Trabaja glúteos y aductores'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 por pierna',
    restTime: '60-90 segundos'
  },
  {
    id: 'curtsy-lunge',
    name: 'Zancada Reverencia',
    muscleGroup: 'gluteos',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    technique: [
      'Cruza una pierna detrás de la otra en diagonal',
      'Baja como haciendo una reverencia',
      'Enfatiza el glúteo medio y mayor',
      'Mantén el torso erguido'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 por pierna',
    restTime: '60 segundos'
  },
  {
    id: 'good-morning',
    name: 'Buenos Días',
    muscleGroup: 'gluteos',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 12,
    technique: [
      'Barra en la espalda alta como sentadilla',
      'Rodillas ligeramente flexionadas',
      'Inclínate hacia adelante desde la cadera',
      'Excelente para glúteos, isquiotibiales y espalda baja'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'kettlebell-swing',
    name: 'Balanceo con Kettlebell',
    muscleGroup: 'gluteos',
    equipment: 'Kettlebell',
    defaultSets: 3,
    defaultReps: 15,
    technique: [
      'Balancea la kettlebell entre las piernas',
      'Empuja explosivamente las caderas hacia adelante',
      'La kettlebell sube por el impulso de cadera, no de brazos',
      'Excelente para potencia de glúteos'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-20 repeticiones',
    restTime: '60-90 segundos'
  }
];
