import { ExerciseTemplate, URL_STORAGE } from '../types';

export const cuelExercises: ExerciseTemplate[] = [
  {
    id: 'neck-flexion',
    name: 'Flexión de Cuello',
    muscleGroup: 'cuello',
    equipment: 'Disco/Arnés',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-neck-flexion-front.gif',
    technique: [
      'Acostado boca arriba en banco, cabeza fuera del borde',
      'Disco en la frente o usa arnés de cuello',
      'Flexiona el cuello llevando la barbilla al pecho',
      'Movimiento lento y controlado',
      'Fortalece la parte frontal del cuello'
    ],
    recommendedSets: '2-3 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'neck-extension',
    name: 'Extensión de Cuello',
    muscleGroup: 'cuello',
    equipment: 'Disco/Arnés',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-neck-extension-side.gif',
    technique: [
      'Acostado boca abajo en banco, cabeza fuera del borde',
      'Disco en la parte posterior de la cabeza o arnés',
      'Extiende el cuello hacia arriba',
      'Movimiento controlado sin impulso',
      'Fortalece la parte posterior del cuello'
    ],
    recommendedSets: '2-3 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'neck-lateral-flexion',
    name: 'Flexión Lateral de Cuello',
    muscleGroup: 'cuello',
    equipment: 'Disco/Arnés',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-neck-lateral-flexion-side.gif',
    technique: [
      'Acostado de lado en banco, cabeza fuera del borde',
      'Disco en el lado de la cabeza o arnés',
      'Flexiona el cuello hacia el hombro',
      'Trabaja los músculos laterales del cuello',
      'Repite en ambos lados'
    ],
    recommendedSets: '2-3 series',
    recommendedReps: '12-20 repeticiones por lado',
    restTime: '60 segundos'
  },
  {
    id: 'neck-harness-extension',
    name: 'Extensión con Arnés de Cuello',
    muscleGroup: 'cuello',
    equipment: 'Arnés de cuello',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-neck-harness-extension-side.gif',
    technique: [
      'De pie o sentado con arnés de cuello',
      'Peso colgando del arnés',
      'Extiende y flexiona el cuello con control',
      'Método más seguro para cargas pesadas',
      'Permite trabajar todos los ángulos'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'isometric-neck-hold',
    name: 'Isométrico de Cuello',
    muscleGroup: 'cuello',
    equipment: 'Peso corporal',
    defaultSets: 4,
    defaultReps: 1,
    image: URL_STORAGE + 'male-isometric-neck-hold-front.gif',
    technique: [
      'Presiona la cabeza contra tu mano (o pared)',
      'Mantén la posición sin movimiento',
      'Trabaja en 4 direcciones: frente, atrás, ambos lados',
      'Excelente para principiantes',
      'Bajo riesgo de lesión'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '20-30 segundos por dirección',
    restTime: '45 segundos'
  },
  {
    id: 'neck-bridge',
    name: 'Puente de Cuello',
    muscleGroup: 'cuello',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 1,
    image: URL_STORAGE + 'male-neck-bridge-side.gif',
    technique: [
      'Acostado boca arriba, arquea el cuerpo apoyándote en la cabeza',
      'Solo para practicantes avanzados',
      'Desarrolla fuerza extrema del cuello',
      'Común en lucha libre y artes marciales',
      'PRECAUCIÓN: Requiere progresión gradual'
    ],
    recommendedSets: '2-3 series',
    recommendedReps: '15-30 segundos',
    restTime: '90-120 segundos'
  },
  {
    id: 'resistance-band-neck',
    name: 'Cuello con Banda Elástica',
    muscleGroup: 'cuello',
    equipment: 'Banda elástica',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-band-neck-flexion-front.gif',
    technique: [
      'Banda alrededor de la cabeza, anclada detrás',
      'Flexiona el cuello contra la resistencia',
      'Trabaja en todas las direcciones',
      'Portátil y seguro para principiantes',
      'Resistencia progresiva ajustable'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones por dirección',
    restTime: '45-60 segundos'
  },
  {
    id: 'manual-resistance-neck',
    name: 'Resistencia Manual de Cuello',
    muscleGroup: 'cuello',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-manual-neck-resistance-front.gif',
    technique: [
      'Compañero aplica resistencia con las manos',
      'Mueve el cuello en todas las direcciones',
      'Resistencia variable según la fuerza',
      'Excelente para control y conexión mente-músculo',
      'No requiere equipo'
    ],
    recommendedSets: '2-3 series',
    recommendedReps: '10-15 repeticiones por dirección',
    restTime: '60 segundos'
  },
  {
    id: 'neck-rotation',
    name: 'Rotación de Cuello con Resistencia',
    muscleGroup: 'cuello',
    equipment: 'Banda elástica',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-neck-rotation-resistance-side.gif',
    technique: [
      'Banda alrededor de la cabeza, anclada al lado',
      'Rota la cabeza contra la resistencia',
      'Fortalece los músculos rotadores del cuello',
      'Importante para deportes de contacto',
      'Previene lesiones por impacto lateral'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones por lado',
    restTime: '45-60 segundos'
  },
  {
    id: 'prone-neck-raise',
    name: 'Elevación de Cuello Prono',
    muscleGroup: 'cuello',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-prone-neck-raise-side.gif',
    technique: [
      'Acostado boca abajo, frente en el suelo',
      'Levanta la cabeza hacia arriba sin usar las manos',
      'Mantén 1-2 segundos arriba',
      'Baja con control',
      'Fortalece extensores del cuello sin equipo'
    ],
    recommendedSets: '2-3 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45 segundos'
  }
];


// Export genérico para carga dinámica
export const exercises = cuelExercises;
