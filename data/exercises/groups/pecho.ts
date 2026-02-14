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
    description: 'Ejercicio fundamental para desarrollo del pecho, hombros y tríceps',
    defaultSets: 4,
    defaultReps: 10,
    image: URL_STORAGE + 'male-barbell-bench-press-front.gif',
    difficulty: 'intermedio',
    category: 'compuesto',
    primaryMuscles: ['Pectoral Mayor', 'Pectoral Menor'],
    secondaryMuscles: ['Tríceps', 'Deltoides Anterior', 'Serrato Anterior'],
    instructions: [
      'Acuéstate en el banco con los pies firmes en el suelo',
      'Agarra la barra con las manos un poco más anchas que el ancho de hombros',
      'Retrae los omóplatos y mantén el pecho elevado',
      'Baja la barra de forma controlada hasta que toque tu pecho',
      'Empuja la barra hacia arriba hasta extender los brazos completamente',
      'Mantén los codos a 45 grados del cuerpo durante todo el movimiento'
    ],
    technique: [
      'Mantén los pies firmes en el suelo',
      'Baja la barra hasta el pecho con control',
      'Mantén los codos a 45 grados del cuerpo',
      'Empuja con fuerza manteniendo los omóplatos retraídos',
      'Respira: inhala al bajar, exhala al subir'
    ],
    commonMistakes: [
      'Rebotar la barra en el pecho',
      'Levantar los glúteos del banco',
      'Abrir demasiado los codos (90 grados)',
      'No retraer los omóplatos',
      'Arquear excesivamente la espalda baja'
    ],
    tips: [
      'Imagina que estás empujando tu cuerpo hacia el banco, no solo la barra hacia arriba',
      'Mantén tensión en todo el cuerpo, incluyendo piernas y core',
      'La barra debe seguir una trayectoria ligeramente diagonal hacia tus ojos',
      'Usa un agarre que permita que tus antebrazos estén verticales en la posición baja'
    ],
    benefits: [
      'Desarrollo masivo del pecho',
      'Mejora la fuerza de empuje del tren superior',
      'Fortalece hombros y tríceps',
      'Ejercicio fundamental para fuerza funcional',
      'Permite cargar mucho peso de forma segura'
    ],
    variations: {
      easier: [
        'Press de banca con mancuernas (más estabilidad)',
        'Press en máquina Smith',
        'Flexiones con rodillas apoyadas'
      ],
      harder: [
        'Press de banca con pausa en el pecho',
        'Press de banca con cadenas o bandas',
        'Press de banca con agarre cerrado',
        'Press de banca con tempo lento (4-0-1)'
      ],
      alternative: [
        'Press con mancuernas',
        'Flexiones',
        'Press en máquina',
        'Fondos en paralelas'
      ]
    },
    safetyNotes: [
      'Siempre usa un spotter cuando levantes peso pesado',
      'No bloquees completamente los codos en la posición superior si tienes problemas articulares',
      'Calienta adecuadamente con series ligeras',
      'Si sientes dolor en los hombros, revisa tu técnica o reduce el peso'
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
    difficulty: 'principiante',
    category: 'compuesto',
    primaryMuscles: ['Pectoral Mayor', 'Tríceps'],
    secondaryMuscles: ['Deltoides Anterior', 'Core', 'Serrato Anterior'],
    instructions: [
      'Colócate en posición de plancha con las manos a la altura de los hombros',
      'Mantén el cuerpo recto desde la cabeza hasta los talones',
      'Baja el cuerpo doblando los codos hasta que el pecho casi toque el suelo',
      'Mantén los codos cerca del cuerpo (no los abras completamente)',
      'Empuja hacia arriba hasta extender los brazos completamente',
      'Mantén el core activado durante todo el movimiento'
    ],
    technique: [
      'Mantén el cuerpo recto como una tabla',
      'Manos a la altura de los hombros',
      'Baja hasta que el pecho casi toque el suelo',
      'Mantén el core activado'
    ],
    commonMistakes: [
      'Dejar caer las caderas (perder la línea recta)',
      'Elevar demasiado las caderas',
      'Abrir los codos a 90 grados',
      'No bajar lo suficiente',
      'Mover la cabeza hacia adelante'
    ],
    tips: [
      'Imagina que estás empujando el suelo lejos de ti',
      'Aprieta los glúteos para mantener la línea recta',
      'Mira al suelo ligeramente adelante de tus manos',
      'Respira: inhala al bajar, exhala al subir'
    ],
    benefits: [
      'No requiere equipo, puedes hacerlas en cualquier lugar',
      'Fortalece pecho, brazos y core simultáneamente',
      'Mejora la estabilidad del core',
      'Ejercicio funcional que mejora la fuerza de empuje',
      'Infinitas variaciones para todos los niveles'
    ],
    variations: {
      easier: [
        'Flexiones con rodillas apoyadas',
        'Flexiones inclinadas (manos en banco o pared)',
        'Flexiones con manos elevadas'
      ],
      harder: [
        'Flexiones con pies elevados',
        'Flexiones diamante',
        'Flexiones con palmada',
        'Flexiones arqueras',
        'Flexiones a una mano'
      ],
      alternative: [
        'Press de banca',
        'Press con mancuernas',
        'Fondos en paralelas'
      ]
    },
    safetyNotes: [
      'Si sientes dolor en las muñecas, prueba usar puños cerrados o paralelas',
      'No fuerces el rango de movimiento si tienes problemas de hombro',
      'Mantén siempre el core activado para proteger la espalda baja'
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
