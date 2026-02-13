/**
 * Ejercicios de pecho
 */

import type { ExerciseTemplate } from '../types';
import { URL_STORAGE } from '../types';

export const exercises: ExerciseTemplate[] = [
  {
    id: 'bench-press',
    name: 'Press de Banca',
    muscleGroup: 'pecho',
    equipment: 'Barra',
    description: 'Ejercicio básico para pecho',
    defaultSets: 4,
    defaultReps: 10,
    image: URL_STORAGE + 'male-barbell-bench-press-front.gif',
    technique: [
      'Mantén los pies firmes en el suelo',
      'Baja la barra hasta el pecho con control',
      'Mantén los codos a 45 grados del cuerpo',
      'Empuja con fuerza manteniendo los omóplatos retraídos'
    ],
    recommendedSets: '3-5 series',
    recommendedReps: '6-12 repeticiones',
    restTime: '2-3 minutos'
  },
  {
    id: 'incline-bench',
    name: 'Press Inclinado',
    muscleGroup: 'pecho',
    equipment: 'Barra/Mancuernas',
    defaultSets: 3,
    defaultReps: 10,
    image: URL_STORAGE + 'male-barbell-incline-bench-press-front.gif',
    technique: [
      'Ajusta el banco a 30-45 grados',
      'Mantén la espalda pegada al respaldo',
      'Baja el peso con control hasta el pecho superior'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'chest-fly',
    name: 'Aperturas con Mancuernas',
    muscleGroup: 'pecho',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-chest-fly-front.gif',
    technique: [
      'Mantén una ligera flexión en los codos',
      'Baja las mancuernas en arco amplio',
      'Siente el estiramiento en el pecho',
      'No bajes más allá de la línea de los hombros'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'push-ups',
    name: 'Flexiones',
    muscleGroup: 'pecho',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-bodyweight-push-up-front.gif',
    technique: [
      'Mantén el cuerpo recto como una tabla',
      'Manos a la altura de los hombros',
      'Baja hasta que el pecho casi toque el suelo',
      'Mantén el core activado'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-20 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'cable-crossover',
    name: 'Cruces en Polea',
    muscleGroup: 'pecho',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-chest-fly-front.gif',
    technique: [
      'Inclínate ligeramente hacia adelante',
      'Mantén los codos semiflexionados',
      'Cruza las manos al frente',
      'Contrae el pecho en la posición final'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'decline-bench',
    name: 'Press Declinado',
    muscleGroup: 'pecho',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 10,
    image: URL_STORAGE + 'male-barbell-decline-bench-press-front.gif',
    technique: [
      'Ajusta el banco a 15-30 grados de decline',
      'Enfoca el trabajo en el pecho inferior',
      'Baja la barra al pecho bajo con control',
      'Empuja explosivamente manteniendo control'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'dumbbell-pullover',
    name: 'Pullover con Mancuerna',
    muscleGroup: 'pecho',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-pullover-side.gif',
    technique: [
      'Acuéstate perpendicular en un banco',
      'Sostén una mancuerna con ambas manos sobre el pecho',
      'Baja el peso detrás de la cabeza con brazos semiflexionados',
      'Siente el estiramiento en pecho y dorsales'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'pec-deck',
    name: 'Pec Deck (Mariposa)',
    muscleGroup: 'pecho',
    equipment: 'Máquina',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-machine-pec-deck-front.gif',
    technique: [
      'Ajusta el asiento para alinear las manijas con el pecho',
      'Mantén la espalda pegada al respaldo',
      'Junta las manijas al frente contrayendo el pecho',
      'Regresa con control sin soltar la tensión'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'diamond-push-ups',
    name: 'Flexiones Diamante',
    muscleGroup: 'pecho',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-bodyweight-diamond-push-up-front.gif',
    technique: [
      'Forma un diamante con tus manos bajo el pecho',
      'Mantén los codos cerca del cuerpo',
      'Enfoca el trabajo en tríceps y pecho interno',
      'Baja hasta que el pecho casi toque las manos'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-15 repeticiones',
    restTime: '60-90 segundos'
  }
];
