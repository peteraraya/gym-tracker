import { Exercise } from '@/types';

export interface RecommendedRoutine {
  id: string;
  name: string;
  description: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  frequency: string; // Ej: "3 días/semana", "5 días/semana"
  duration: string; // Ej: "45-60 min"
  goal: string; // Ej: "Fuerza", "Hipertrofia", "Resistencia"
  image?: string;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    notes?: string;
  }[];
  restBetweenSets: number;
  restBetweenExercises: number;
}

export const RECOMMENDED_ROUTINES: RecommendedRoutine[] = [
  // ============ PUSH PULL LEGS ============
  {
    id: 'ppl-push',
    name: 'Push Pull Legs - Push (Empuje)',
    description: 'Día de empuje: pecho, hombros y tríceps. Ideal para desarrollar fuerza en la parte superior del cuerpo.',
    category: 'intermediate',
    frequency: '2 veces/semana',
    duration: '60-75 min',
    goal: 'Hipertrofia',
    exercises: [
      { name: 'Press de Banca', sets: 4, reps: 8, weight: 0 },
      { name: 'Press Inclinado', sets: 3, reps: 10, weight: 0 },
      { name: 'Press Militar', sets: 4, reps: 8, weight: 0 },
      { name: 'Elevaciones Laterales', sets: 3, reps: 15, weight: 0 },
      { name: 'Fondos en Paralelas', sets: 3, reps: 10, weight: 0 },
      { name: 'Extensión de Tríceps', sets: 3, reps: 12, weight: 0 },
    ],
    restBetweenSets: 90,
    restBetweenExercises: 120,
  },
  {
    id: 'ppl-pull',
    name: 'Push Pull Legs - Pull (Tracción)',
    description: 'Día de tracción: espalda y bíceps. Desarrolla la musculatura posterior del tren superior.',
    category: 'intermediate',
    frequency: '2 veces/semana',
    duration: '60-75 min',
    goal: 'Hipertrofia',
    exercises: [
      { name: 'Peso Muerto', sets: 4, reps: 6, weight: 0 },
      { name: 'Dominadas', sets: 4, reps: 8, weight: 0 },
      { name: 'Remo con Barra', sets: 4, reps: 10, weight: 0 },
      { name: 'Jalón al Pecho', sets: 3, reps: 12, weight: 0 },
      { name: 'Face Pulls', sets: 3, reps: 15, weight: 0 },
      { name: 'Curl con Barra', sets: 3, reps: 12, weight: 0 },
      { name: 'Curl Martillo', sets: 3, reps: 12, weight: 0 },
    ],
    restBetweenSets: 90,
    restBetweenExercises: 120,
  },
  {
    id: 'ppl-legs',
    name: 'Push Pull Legs - Legs (Piernas)',
    description: 'Día de piernas completo: cuádriceps, isquiotibiales, glúteos y gemelos.',
    category: 'intermediate',
    frequency: '1-2 veces/semana',
    duration: '60-75 min',
    goal: 'Hipertrofia',
    exercises: [
      { name: 'Sentadilla', sets: 4, reps: 8, weight: 0 },
      { name: 'Prensa de Piernas', sets: 4, reps: 12, weight: 0 },
      { name: 'Zancadas', sets: 3, reps: 12, weight: 0, notes: 'Por pierna' },
      { name: 'Curl de Piernas', sets: 4, reps: 12, weight: 0 },
      { name: 'Extensión de Piernas', sets: 3, reps: 15, weight: 0 },
      { name: 'Elevación de Talones', sets: 4, reps: 20, weight: 0 },
    ],
    restBetweenSets: 120,
    restBetweenExercises: 150,
  },

  // ============ TORSO PIERNA ============
  {
    id: 'upper-lower-1',
    name: 'Torso/Pierna - Día 1 (Torso)',
    description: 'Rutina de torso completo enfocada en fuerza. Trabajo de todo el tren superior.',
    category: 'beginner',
    frequency: '2 veces/semana',
    duration: '60 min',
    goal: 'Fuerza e Hipertrofia',
    exercises: [
      { name: 'Press de Banca', sets: 4, reps: 8, weight: 0 },
      { name: 'Remo con Barra', sets: 4, reps: 8, weight: 0 },
      { name: 'Press Militar', sets: 3, reps: 10, weight: 0 },
      { name: 'Dominadas', sets: 3, reps: 10, weight: 0 },
      { name: 'Curl con Barra', sets: 3, reps: 12, weight: 0 },
      { name: 'Fondos en Paralelas', sets: 3, reps: 12, weight: 0 },
    ],
    restBetweenSets: 90,
    restBetweenExercises: 120,
  },
  {
    id: 'upper-lower-2',
    name: 'Torso/Pierna - Día 2 (Piernas)',
    description: 'Rutina de pierna completa. Desarrollo equilibrado del tren inferior.',
    category: 'beginner',
    frequency: '2 veces/semana',
    duration: '60 min',
    goal: 'Fuerza e Hipertrofia',
    exercises: [
      { name: 'Sentadilla', sets: 4, reps: 8, weight: 0 },
      { name: 'Peso Muerto', sets: 4, reps: 6, weight: 0 },
      { name: 'Prensa de Piernas', sets: 3, reps: 12, weight: 0 },
      { name: 'Curl de Piernas', sets: 3, reps: 12, weight: 0 },
      { name: 'Elevación de Talones', sets: 4, reps: 20, weight: 0 },
      { name: 'Plancha', sets: 3, reps: 60, weight: 0, notes: 'Segundos' },
    ],
    restBetweenSets: 120,
    restBetweenExercises: 150,
  },

  // ============ FULL BODY ============
  {
    id: 'fullbody-beginner',
    name: 'Cuerpo Completo - Principiante',
    description: 'Rutina básica de cuerpo completo para principiantes. 3 días por semana.',
    category: 'beginner',
    frequency: '3 días/semana',
    duration: '45-50 min',
    goal: 'Acondicionamiento general',
    exercises: [
      { name: 'Sentadilla', sets: 3, reps: 10, weight: 0 },
      { name: 'Press de Banca', sets: 3, reps: 10, weight: 0 },
      { name: 'Remo con Mancuerna', sets: 3, reps: 12, weight: 0, notes: 'Por lado' },
      { name: 'Press Militar', sets: 3, reps: 10, weight: 0 },
      { name: 'Curl de Piernas', sets: 3, reps: 12, weight: 0 },
      { name: 'Plancha', sets: 3, reps: 45, weight: 0, notes: 'Segundos' },
    ],
    restBetweenSets: 60,
    restBetweenExercises: 90,
  },

  // ============ BRO SPLIT ============
  {
    id: 'bro-chest',
    name: 'Bro Split - Pecho',
    description: 'Día dedicado exclusivamente al pecho. Volumen alto para hipertrofia máxima.',
    category: 'advanced',
    frequency: '1 vez/semana',
    duration: '60-70 min',
    goal: 'Hipertrofia',
    exercises: [
      { name: 'Press de Banca', sets: 4, reps: 8, weight: 0 },
      { name: 'Press Inclinado', sets: 4, reps: 10, weight: 0 },
      { name: 'Aperturas con Mancuernas', sets: 4, reps: 12, weight: 0 },
      { name: 'Cruces en Polea', sets: 3, reps: 15, weight: 0 },
      { name: 'Flexiones', sets: 3, reps: 15, weight: 0 },
    ],
    restBetweenSets: 90,
    restBetweenExercises: 120,
  },
  {
    id: 'bro-back',
    name: 'Bro Split - Espalda',
    description: 'Día de espalda completo. Enfoque en grosor y ancho.',
    category: 'advanced',
    frequency: '1 vez/semana',
    duration: '60-70 min',
    goal: 'Hipertrofia',
    exercises: [
      { name: 'Peso Muerto', sets: 4, reps: 6, weight: 0 },
      { name: 'Dominadas', sets: 4, reps: 10, weight: 0 },
      { name: 'Remo con Barra', sets: 4, reps: 10, weight: 0 },
      { name: 'Jalón al Pecho', sets: 4, reps: 12, weight: 0 },
      { name: 'Remo con Mancuerna', sets: 3, reps: 12, weight: 0, notes: 'Por lado' },
      { name: 'Face Pulls', sets: 3, reps: 15, weight: 0 },
    ],
    restBetweenSets: 90,
    restBetweenExercises: 120,
  },
  {
    id: 'bro-shoulders',
    name: 'Bro Split - Hombros',
    description: 'Día de hombros. Desarrollo de los tres deltoides.',
    category: 'advanced',
    frequency: '1 vez/semana',
    duration: '50-60 min',
    goal: 'Hipertrofia',
    exercises: [
      { name: 'Press Militar', sets: 4, reps: 8, weight: 0 },
      { name: 'Press Arnold', sets: 4, reps: 10, weight: 0 },
      { name: 'Elevaciones Laterales', sets: 4, reps: 15, weight: 0 },
      { name: 'Elevaciones Frontales', sets: 3, reps: 12, weight: 0 },
      { name: 'Face Pulls', sets: 4, reps: 15, weight: 0 },
    ],
    restBetweenSets: 60,
    restBetweenExercises: 90,
  },
  {
    id: 'bro-legs',
    name: 'Bro Split - Piernas',
    description: 'Día de piernas intenso. No skippear leg day.',
    category: 'advanced',
    frequency: '1 vez/semana',
    duration: '70-80 min',
    goal: 'Hipertrofia',
    exercises: [
      { name: 'Sentadilla', sets: 5, reps: 8, weight: 0 },
      { name: 'Prensa de Piernas', sets: 4, reps: 12, weight: 0 },
      { name: 'Zancadas', sets: 4, reps: 12, weight: 0, notes: 'Por pierna' },
      { name: 'Curl de Piernas', sets: 4, reps: 12, weight: 0 },
      { name: 'Extensión de Piernas', sets: 4, reps: 15, weight: 0 },
      { name: 'Elevación de Talones', sets: 5, reps: 20, weight: 0 },
    ],
    restBetweenSets: 120,
    restBetweenExercises: 150,
  },
  {
    id: 'bro-arms',
    name: 'Bro Split - Brazos',
    description: 'Día de brazos. Bíceps y tríceps con volumen alto.',
    category: 'advanced',
    frequency: '1 vez/semana',
    duration: '50-60 min',
    goal: 'Hipertrofia',
    exercises: [
      { name: 'Curl con Barra', sets: 4, reps: 10, weight: 0 },
      { name: 'Fondos en Paralelas', sets: 4, reps: 10, weight: 0 },
      { name: 'Curl Martillo', sets: 4, reps: 12, weight: 0 },
      { name: 'Extensión de Tríceps', sets: 4, reps: 12, weight: 0 },
      { name: 'Curl Concentrado', sets: 3, reps: 15, weight: 0, notes: 'Por brazo' },
    ],
    restBetweenSets: 60,
    restBetweenExercises: 90,
  },

  // ============ RUTINAS ESPECIALIZADAS ============
  {
    id: 'glutes-focused',
    name: 'Enfoque Glúteos',
    description: 'Rutina especializada en desarrollo de glúteos. Alta activación del glúteo medio y mayor.',
    category: 'intermediate',
    frequency: '2-3 veces/semana',
    duration: '50-60 min',
    goal: 'Hipertrofia de glúteos',
    exercises: [
      { name: 'Hip Thrust', sets: 4, reps: 12, weight: 0 },
      { name: 'Sentadilla Búlgara', sets: 4, reps: 12, weight: 0, notes: 'Por pierna' },
      { name: 'Sentadilla', sets: 4, reps: 10, weight: 0 },
      { name: 'Zancadas', sets: 3, reps: 15, weight: 0, notes: 'Por pierna' },
      { name: 'Puente de Glúteos', sets: 4, reps: 20, weight: 0 },
    ],
    restBetweenSets: 90,
    restBetweenExercises: 120,
  },
  {
    id: 'strength-5x5',
    name: 'Fuerza 5x5 - Día A',
    description: 'Programa de fuerza clásico 5x5. Enfoque en levantamientos básicos con progresión lineal.',
    category: 'intermediate',
    frequency: '3 veces/semana',
    duration: '50-60 min',
    goal: 'Fuerza',
    exercises: [
      { name: 'Sentadilla', sets: 5, reps: 5, weight: 0 },
      { name: 'Press de Banca', sets: 5, reps: 5, weight: 0 },
      { name: 'Remo con Barra', sets: 5, reps: 5, weight: 0 },
      { name: 'Plancha', sets: 3, reps: 60, weight: 0, notes: 'Segundos' },
    ],
    restBetweenSets: 180,
    restBetweenExercises: 180,
  },
  {
    id: 'strength-5x5-b',
    name: 'Fuerza 5x5 - Día B',
    description: 'Programa de fuerza 5x5. Alterna con Día A para desarrollo balanceado.',
    category: 'intermediate',
    frequency: '3 veces/semana',
    duration: '50-60 min',
    goal: 'Fuerza',
    exercises: [
      { name: 'Sentadilla', sets: 5, reps: 5, weight: 0 },
      { name: 'Press Militar', sets: 5, reps: 5, weight: 0 },
      { name: 'Peso Muerto', sets: 5, reps: 5, weight: 0 },
      { name: 'Elevaciones de Piernas', sets: 3, reps: 15, weight: 0 },
    ],
    restBetweenSets: 180,
    restBetweenExercises: 180,
  },
  {
    id: 'abs-core',
    name: 'Core y Abdominales',
    description: 'Rutina enfocada en el desarrollo del core. Ideal para complementar otras rutinas.',
    category: 'beginner',
    frequency: '2-3 veces/semana',
    duration: '20-30 min',
    goal: 'Fuerza del core',
    exercises: [
      { name: 'Plancha', sets: 4, reps: 60, weight: 0, notes: 'Segundos' },
      { name: 'Abdominales', sets: 4, reps: 25, weight: 0 },
      { name: 'Giros Rusos', sets: 4, reps: 30, weight: 0, notes: 'Total' },
      { name: 'Elevaciones de Piernas', sets: 4, reps: 15, weight: 0 },
    ],
    restBetweenSets: 45,
    restBetweenExercises: 60,
  },
];

export const getRoutinesByCategory = (category: 'beginner' | 'intermediate' | 'advanced') => {
  return RECOMMENDED_ROUTINES.filter(r => r.category === category);
};

export const getRoutineById = (id: string) => {
  return RECOMMENDED_ROUTINES.find(r => r.id === id);
};
