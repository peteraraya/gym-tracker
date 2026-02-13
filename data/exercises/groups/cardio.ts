import { ExerciseTemplate, URL_STORAGE } from '../types';

export const cardioExercises: ExerciseTemplate[] = [
  {
    id: 'treadmill-running',
    name: 'Correr en Trotadora',
    muscleGroup: 'cardio',
    equipment: 'Trotadora',
    defaultSets: 1,
    defaultReps: 1,
    image: URL_STORAGE + 'male-treadmill-running-side.gif',
    technique: [
      'Mantén una postura erguida',
      'Aterriza con el medio del pie',
      'Brazos a 90 grados balanceándose naturalmente',
      'Ajusta velocidad e inclinación según tu nivel'
    ],
    recommendedSets: '1 sesión',
    recommendedReps: '20-45 minutos',
    restTime: 'N/A'
  },
  {
    id: 'treadmill-walking',
    name: 'Caminar en Trotadora',
    muscleGroup: 'cardio',
    equipment: 'Trotadora',
    defaultSets: 1,
    defaultReps: 1,
    image: URL_STORAGE + 'male-treadmill-walking-side.gif',
    technique: [
      'Postura erguida, hombros relajados',
      'Paso natural, talón a punta',
      'Brazos balanceándose naturalmente',
      'Excelente para principiantes o recuperación activa'
    ],
    recommendedSets: '1 sesión',
    recommendedReps: '30-60 minutos',
    restTime: 'N/A'
  },
  {
    id: 'treadmill-incline-walk',
    name: 'Caminata Inclinada en Trotadora',
    muscleGroup: 'cardio',
    equipment: 'Trotadora',
    defaultSets: 1,
    defaultReps: 1,
    image: URL_STORAGE + 'male-treadmill-incline-walk-side.gif',
    technique: [
      'Inclinación de 10-15% o más',
      'Velocidad moderada (4-6 km/h)',
      'Trabaja glúteos e isquiotibiales intensamente',
      'Menos impacto que correr'
    ],
    recommendedSets: '1 sesión',
    recommendedReps: '20-45 minutos',
    restTime: 'N/A'
  },
  {
    id: 'treadmill-hiit',
    name: 'HIIT en Trotadora',
    muscleGroup: 'cardio',
    equipment: 'Trotadora',
    defaultSets: 8,
    defaultReps: 1,
    image: URL_STORAGE + 'male-treadmill-hiit-side.gif',
    technique: [
      '30 segundos sprint máximo',
      '60-90 segundos recuperación caminando',
      'Repite 8-12 intervalos',
      'Quema calorías eficientemente'
    ],
    recommendedSets: '8-12 intervalos',
    recommendedReps: '30 seg trabajo / 60-90 seg descanso',
    restTime: 'Incluido en intervalos'
  },
  {
    id: 'stationary-bike',
    name: 'Bicicleta Estática',
    muscleGroup: 'cardio',
    equipment: 'Bicicleta estática',
    defaultSets: 1,
    defaultReps: 1,
    image: URL_STORAGE + 'male-stationary-bike-side.gif',
    technique: [
      'Ajusta el asiento a la altura correcta',
      'Mantén una cadencia constante (80-100 RPM)',
      'Bajo impacto en las articulaciones',
      'Excelente para resistencia cardiovascular'
    ],
    recommendedSets: '1 sesión',
    recommendedReps: '30-60 minutos',
    restTime: 'N/A'
  },
  {
    id: 'elliptical',
    name: 'Elíptica',
    muscleGroup: 'cardio',
    equipment: 'Elíptica',
    defaultSets: 1,
    defaultReps: 1,
    image: URL_STORAGE + 'male-elliptical-front.gif',
    technique: [
      'Mantén el cuerpo erguido',
      'Usa los brazos para trabajo de cuerpo completo',
      'Cero impacto en las articulaciones',
      'Ajusta resistencia según tu nivel'
    ],
    recommendedSets: '1 sesión',
    recommendedReps: '20-45 minutos',
    restTime: 'N/A'
  },
  {
    id: 'stair-climber',
    name: 'Escaladora',
    muscleGroup: 'cardio',
    equipment: 'Escaladora',
    defaultSets: 1,
    defaultReps: 1,
    image: URL_STORAGE + 'male-stair-climber-side.gif',
    technique: [
      'Mantén una postura erguida, no te apoyes en las barras',
      'Trabaja glúteos y piernas intensamente',
      'Quema muchas calorías',
      'Comienza con velocidad moderada'
    ],
    recommendedSets: '1 sesión',
    recommendedReps: '15-30 minutos',
    restTime: 'N/A'
  },
  {
    id: 'rowing-machine',
    name: 'Remo en Máquina',
    muscleGroup: 'cardio',
    equipment: 'Máquina de remo',
    defaultSets: 1,
    defaultReps: 1,
    image: URL_STORAGE + 'male-rowing-machine-side.gif',
    technique: [
      'Empuja con las piernas primero',
      'Luego tira con los brazos',
      'Trabaja 85% de los músculos del cuerpo',
      'Excelente cardio de bajo impacto'
    ],
    recommendedSets: '1 sesión',
    recommendedReps: '20-40 minutos',
    restTime: 'N/A'
  },
  {
    id: 'rowing-intervals',
    name: 'Remo por Intervalos',
    muscleGroup: 'cardio',
    equipment: 'Máquina de remo',
    defaultSets: 6,
    defaultReps: 1,
    image: URL_STORAGE + 'male-rowing-intervals-side.gif',
    technique: [
      '500 metros a máxima intensidad',
      '2-3 minutos de recuperación activa',
      'Repite 6-8 intervalos',
      'Desarrolla potencia y resistencia'
    ],
    recommendedSets: '6-8 intervalos',
    recommendedReps: '500m trabajo / 2-3 min descanso',
    restTime: 'Incluido en intervalos'
  },
  {
    id: 'assault-bike',
    name: 'Assault Bike',
    muscleGroup: 'cardio',
    equipment: 'Assault bike',
    defaultSets: 1,
    defaultReps: 1,
    image: URL_STORAGE + 'male-assault-bike-front.gif',
    technique: [
      'Usa brazos y piernas simultáneamente',
      'Resistencia aumenta con la velocidad',
      'Excelente para HIIT',
      'Quema calorías extremadamente rápido'
    ],
    recommendedSets: '1 sesión o intervalos',
    recommendedReps: '10-20 minutos',
    restTime: 'Variable'
  },
  {
    id: 'jump-rope',
    name: 'Saltar la Cuerda',
    muscleGroup: 'cardio',
    equipment: 'Cuerda de saltar',
    defaultSets: 5,
    defaultReps: 1,
    image: URL_STORAGE + 'male-cardio-jump-rope-side.gif',
    technique: [
      'Salta sobre las puntas de los pies',
      'Mantén los codos cerca del cuerpo',
      'Gira la cuerda con las muñecas',
      'Excelente para coordinación y resistencia'
    ],
    recommendedSets: '5-10 series',
    recommendedReps: '1-3 minutos',
    restTime: '30-60 segundos'
  },
  {
    id: 'battle-ropes',
    name: 'Cuerdas de Batalla',
    muscleGroup: 'cardio',
    equipment: 'Cuerdas de batalla',
    defaultSets: 5,
    defaultReps: 1,
    image: URL_STORAGE + 'male-battle-ropes-front.gif',
    technique: [
      'Pies al ancho de hombros, rodillas ligeramente flexionadas',
      'Alterna los brazos creando ondas',
      'Mantén el core activado',
      'Cardio de alta intensidad con trabajo de brazos'
    ],
    recommendedSets: '5-8 series',
    recommendedReps: '30-60 segundos',
    restTime: '30-60 segundos'
  },
  {
    id: 'burpees',
    name: 'Burpees',
    muscleGroup: 'cardio',
    equipment: 'Peso corporal',
    defaultSets: 4,
    defaultReps: 15,
    image: URL_STORAGE + 'male-bodyweight-burpee-side.gif',
    technique: [
      'Baja a posición de plancha',
      'Haz una flexión (opcional)',
      'Salta los pies hacia las manos',
      'Salta verticalmente con brazos arriba'
    ],
    recommendedSets: '4-6 series',
    recommendedReps: '10-20 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'high-knees',
    name: 'Rodillas Altas',
    muscleGroup: 'cardio',
    equipment: 'Peso corporal',
    defaultSets: 4,
    defaultReps: 1,
    image: URL_STORAGE + 'male-bodyweight-high-knees-front.gif',
    technique: [
      'Corre en el lugar elevando las rodillas al pecho',
      'Mantén un ritmo rápido',
      'Brazos bombeando activamente',
      'Excelente calentamiento o finisher'
    ],
    recommendedSets: '4-6 series',
    recommendedReps: '30-60 segundos',
    restTime: '30-45 segundos'
  },
  {
    id: 'mountain-climbers-cardio',
    name: 'Escaladores (Cardio)',
    muscleGroup: 'cardio',
    equipment: 'Peso corporal',
    defaultSets: 4,
    defaultReps: 1,
    image: URL_STORAGE + 'male-bodyweight-mountain-climbers-cardio-side.gif',
    technique: [
      'Posición de plancha alta',
      'Alterna rodillas al pecho rápidamente',
      'Mantén las caderas bajas',
      'Cardio intenso con trabajo de core'
    ],
    recommendedSets: '4-6 series',
    recommendedReps: '30-60 segundos',
    restTime: '30-45 segundos'
  },
  {
    id: 'box-jumps-cardio',
    name: 'Saltos al Cajón (Cardio)',
    muscleGroup: 'cardio',
    equipment: 'Cajón pliométrico',
    defaultSets: 4,
    defaultReps: 12,
    image: URL_STORAGE + 'male-bodyweight-box-jump-cardio-side.gif',
    technique: [
      'Salta explosivamente sobre el cajón',
      'Aterriza suavemente con rodillas flexionadas',
      'Baja con control',
      'Desarrolla potencia y cardio'
    ],
    recommendedSets: '4-6 series',
    recommendedReps: '8-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'swimming',
    name: 'Natación',
    muscleGroup: 'cardio',
    equipment: 'Piscina',
    defaultSets: 1,
    defaultReps: 1,
    image: URL_STORAGE + 'male-swimming-freestyle-side.gif',
    technique: [
      'Cero impacto en las articulaciones',
      'Trabaja todo el cuerpo',
      'Excelente para recuperación activa',
      'Varía los estilos para trabajo completo'
    ],
    recommendedSets: '1 sesión',
    recommendedReps: '20-45 minutos',
    restTime: 'N/A'
  },
  {
    id: 'shadow-boxing',
    name: 'Boxeo de Sombra',
    muscleGroup: 'cardio',
    equipment: 'Peso corporal',
    defaultSets: 5,
    defaultReps: 1,
    image: URL_STORAGE + 'male-bodyweight-shadow-boxing-front.gif',
    technique: [
      'Lanza combinaciones de golpes al aire',
      'Mantén movimiento constante de pies',
      'Trabaja cardio, coordinación y brazos',
      'Excelente para quemar calorías'
    ],
    recommendedSets: '5-8 series',
    recommendedReps: '2-3 minutos',
    restTime: '60 segundos'
  },
  {
    id: 'heavy-bag',
    name: 'Saco de Boxeo',
    muscleGroup: 'cardio',
    equipment: 'Saco de boxeo',
    defaultSets: 5,
    defaultReps: 1,
    image: URL_STORAGE + 'male-heavy-bag-punching-front.gif',
    technique: [
      'Golpea el saco con combinaciones',
      'Mantén guardia arriba',
      'Muévete alrededor del saco',
      'Cardio intenso con trabajo de potencia'
    ],
    recommendedSets: '5-8 series',
    recommendedReps: '2-3 minutos',
    restTime: '60 segundos'
  },
  {
    id: 'cycling-outdoor',
    name: 'Ciclismo al Aire Libre',
    muscleGroup: 'cardio',
    equipment: 'Bicicleta',
    defaultSets: 1,
    defaultReps: 1,
    image: URL_STORAGE + 'male-outdoor-cycling-side.gif',
    technique: [
      'Ajusta el asiento correctamente',
      'Mantén cadencia de 80-100 RPM',
      'Varía terreno e intensidad',
      'Excelente para resistencia de piernas'
    ],
    recommendedSets: '1 sesión',
    recommendedReps: '30-90 minutos',
    restTime: 'N/A'
  },
  {
    id: 'running-outdoor',
    name: 'Correr al Aire Libre',
    muscleGroup: 'cardio',
    equipment: 'Peso corporal',
    defaultSets: 1,
    defaultReps: 1,
    image: URL_STORAGE + 'male-outdoor-running-side.gif',
    technique: [
      'Aterriza con el medio del pie',
      'Mantén postura erguida',
      'Brazos a 90 grados',
      'Varía ritmo y terreno para mejor adaptación'
    ],
    recommendedSets: '1 sesión',
    recommendedReps: '20-60 minutos',
    restTime: 'N/A'
  },
  {
    id: 'hiking',
    name: 'Senderismo',
    muscleGroup: 'cardio',
    equipment: 'Peso corporal',
    defaultSets: 1,
    defaultReps: 1,
    image: URL_STORAGE + 'male-hiking-side.gif',
    technique: [
      'Usa bastones para mayor estabilidad',
      'Mantén ritmo constante',
      'Hidratación constante',
      'Excelente cardio de bajo impacto en naturaleza'
    ],
    recommendedSets: '1 sesión',
    recommendedReps: '1-4 horas',
    restTime: 'N/A'
  }
];


// Export genérico para carga dinámica
export const exercises = cardioExercises;
