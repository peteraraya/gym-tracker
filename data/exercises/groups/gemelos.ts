import { ExerciseTemplate, URL_STORAGE } from '../types';

export const gemelosExercises: ExerciseTemplate[] = [
  {
    id: 'calf-raises',
    name: 'Elevación de Talones',
    muscleGroup: 'gemelos',
    equipment: 'Máquina/Mancuernas',
    defaultSets: 4,
    defaultReps: 20,
    image: URL_STORAGE + 'male-barbell-standing-calf-raise-side.gif',
    technique: [
      'Elévate sobre las puntas de los pies',
      'Sube lo más alto posible',
      'Pausa arriba contrayendo',
      'Baja hasta sentir estiramiento'
    ],
    recommendedSets: '4-5 series',
    recommendedReps: '15-25 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'seated-calf-raises',
    name: 'Elevación de Talones Sentado',
    muscleGroup: 'gemelos',
    equipment: 'Máquina',
    defaultSets: 3,
    defaultReps: 20,
    image: URL_STORAGE + 'male-machine-seated-calf-raise-side.gif',
    technique: [
      'Coloca las puntas de los pies en la plataforma',
      'Trabaja específicamente el músculo sóleo',
      'Rango de movimiento completo',
      'Pausa en la contracción máxima'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-25 repeticiones',
    restTime: '45 segundos'
  },
  {
    id: 'donkey-calf-raises',
    name: 'Elevación de Talones tipo Burro',
    muscleGroup: 'gemelos',
    equipment: 'Máquina/Peso corporal',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-machine-donkey-calf-raise-side.gif',
    technique: [
      'Inclínate hacia adelante con la cadera a 90 grados',
      'Puntas de los pies en la plataforma',
      'Eleva los talones contrayendo los gemelos',
      'Mayor estiramiento que el ejercicio de pie'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'single-leg-calf-raise',
    name: 'Elevación de Talón a Una Pierna',
    muscleGroup: 'gemelos',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-bodyweight-single-leg-calf-raise-side.gif',
    technique: [
      'De pie sobre un escalón con una pierna',
      'Baja el talón por debajo de la plataforma',
      'Sube lo más alto posible contrayendo el gemelo',
      'Sujétate de algo para mantener el equilibrio'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-18 por pierna',
    restTime: '30-45 segundos'
  },
  {
    id: 'leg-press-calf-raise',
    name: 'Elevación de Talones en Prensa',
    muscleGroup: 'gemelos',
    equipment: 'Máquina',
    defaultSets: 4,
    defaultReps: 15,
    image: URL_STORAGE + 'male-machine-leg-press-calf-raise-side.gif',
    technique: [
      'Coloca solo las puntas de los pies en la plataforma de la prensa',
      'Empuja extendiendo los tobillos',
      'Rango completo de movimiento',
      'Permite usar cargas más altas de forma segura'
    ],
    recommendedSets: '3-5 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'smith-machine-calf-raise',
    name: 'Elevación de Talones en Smith',
    muscleGroup: 'gemelos',
    equipment: 'Máquina Smith',
    defaultSets: 4,
    defaultReps: 15,
    image: URL_STORAGE + 'male-smith-machine-calf-raise-side.gif',
    technique: [
      'Barra apoyada en los trapecios dentro de la máquina Smith',
      'Puntas de los pies sobre un disco o step',
      'Sube lo más alto posible',
      'La Smith proporciona estabilidad para enfocarte en el gemelo'
    ],
    recommendedSets: '3-5 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'tibialis-raise',
    name: 'Elevación de Tibial Anterior',
    muscleGroup: 'gemelos',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-bodyweight-tibialis-raise-front.gif',
    technique: [
      'Apoya la espalda contra una pared, pies adelantados',
      'Eleva las puntas de los pies hacia las espinillas',
      'Mantén 1 segundo arriba',
      'Fortalece el tibial anterior para prevenir lesiones'
    ],
    recommendedSets: '2-3 series',
    recommendedReps: '15-25 repeticiones',
    restTime: '30-45 segundos'
  },
  {
    id: 'jump-rope-calves',
    name: 'Saltar la Cuerda (Gemelos)',
    muscleGroup: 'gemelos',
    equipment: 'Cuerda de saltar',
    defaultSets: 3,
    defaultReps: 1,
    image: URL_STORAGE + 'male-cardio-jump-rope-side.gif',
    technique: [
      'Salta sobre las puntas de los pies sin que los talones toquen',
      'Mantén un ritmo constante',
      'Excelente para resistencia y definición de gemelos',
      'Comienza con intervalos de 30-60 segundos'
    ],
    recommendedSets: '3-5 series',
    recommendedReps: '30-60 segundos',
    restTime: '30-45 segundos'
  },
  {
    id: 'farmer-walk-calves',
    name: 'Caminata de Granjero en Puntas',
    muscleGroup: 'gemelos',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 1,
    image: URL_STORAGE + 'male-dumbbell-farmer-walk-tiptoe-side.gif',
    technique: [
      'Carga pesada en cada mano (mancuernas o kettlebells)',
      'Camina sobre las puntas de los pies',
      'Mantén el core activado y hombros atrás',
      'Trabaja gemelos, agarre y estabilidad al mismo tiempo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '20-30 metros o 30-45 segundos',
    restTime: '60 segundos'
  },
  {
    id: 'standing-calf-raise-machine',
    name: 'Gemelos de Pie en Máquina',
    muscleGroup: 'gemelos',
    equipment: 'Máquina',
    defaultSets: 4,
    defaultReps: 15,
    image: URL_STORAGE + 'male-machine-standing-calf-raise-side.gif',
    technique: [
      'Hombros bajo las almohadillas de la máquina',
      'Puntas de los pies en la plataforma',
      'Eleva los talones lo más alto posible',
      'Baja hasta sentir estiramiento completo'
    ],
    recommendedSets: '4-5 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'calf-raise-hack-machine',
    name: 'Gemelos en Hack',
    muscleGroup: 'gemelos',
    equipment: 'Máquina',
    defaultSets: 4,
    defaultReps: 15,
    image: URL_STORAGE + 'male-machine-hack-calf-raise-side.gif',
    technique: [
      'Espalda apoyada en la máquina hack',
      'Solo las puntas de los pies en la plataforma',
      'Eleva empujando con la parte delantera del pie',
      'Gran estabilidad para enfocarte en los gemelos'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'deficit-calf-raise',
    name: 'Gemelos con Déficit',
    muscleGroup: 'gemelos',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-dumbbell-deficit-calf-raise-side.gif',
    technique: [
      'De pie en un step o disco, talones al aire',
      'Mancuernas en las manos para agregar peso',
      'Baja los talones por debajo de la plataforma',
      'Mayor rango de movimiento para estiramiento completo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'barbell-seated-calf-raise',
    name: 'Gemelos Sentado con Barra',
    muscleGroup: 'gemelos',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-barbell-seated-calf-raise-side.gif',
    technique: [
      'Sentado en un banco, barra sobre los muslos',
      'Puntas de los pies en un step o disco',
      'Eleva los talones contrayendo el sóleo',
      'Alternativa cuando no hay máquina de gemelos sentado'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-25 repeticiones',
    restTime: '45 segundos'
  },
  {
    id: 'toe-press-leg-press',
    name: 'Toe Press en Prensa',
    muscleGroup: 'gemelos',
    equipment: 'Máquina',
    defaultSets: 4,
    defaultReps: 15,
    image: URL_STORAGE + 'male-machine-toe-press-side.gif',
    technique: [
      'Piernas casi extendidas en la prensa',
      'Solo las puntas de los pies en la plataforma',
      'Empuja extendiendo los tobillos',
      'Permite usar cargas pesadas de forma segura'
    ],
    recommendedSets: '3-5 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'eccentric-calf-raise',
    name: 'Gemelos Excéntricos',
    muscleGroup: 'gemelos',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-bodyweight-eccentric-calf-raise-side.gif',
    technique: [
      'Sube con ambas piernas sobre un step',
      'Quita una pierna y baja lentamente con una sola',
      'Fase excéntrica de 3-5 segundos',
      'Excelente para fuerza y rehabilitación del tendón de Aquiles'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 por pierna',
    restTime: '60 segundos'
  },
  {
    id: 'explosive-calf-jump',
    name: 'Saltos Explosivos para Gemelos',
    muscleGroup: 'gemelos',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-bodyweight-calf-jump-side.gif',
    technique: [
      'Piernas rectas, salta usando solo los tobillos',
      'No flexiones las rodillas, todo el impulso viene de los gemelos',
      'Aterriza suavemente sobre las puntas',
      'Desarrolla potencia explosiva en los gemelos'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'cable-calf-raise',
    name: 'Gemelos en Polea',
    muscleGroup: 'gemelos',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-cable-calf-raise-side.gif',
    technique: [
      'Polea baja, cinturón de cadera o barra en los hombros',
      'De pie en un step con las puntas',
      'Eleva los talones contrayendo los gemelos',
      'Tensión constante durante todo el recorrido'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'stair-calf-raise',
    name: 'Gemelos en Escalón',
    muscleGroup: 'gemelos',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 20,
    image: URL_STORAGE + 'male-bodyweight-stair-calf-raise-side.gif',
    technique: [
      'De pie en un escalón con la mitad del pie fuera',
      'Baja los talones para máximo estiramiento',
      'Sube lo más alto posible contrayendo',
      'Sujétate de algo para equilibrio'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-25 repeticiones',
    restTime: '30-45 segundos'
  },
  {
    id: 'banded-calf-raise',
    name: 'Gemelos con Banda',
    muscleGroup: 'gemelos',
    equipment: 'Banda elástica',
    defaultSets: 3,
    defaultReps: 20,
    image: URL_STORAGE + 'male-band-calf-raise-side.gif',
    technique: [
      'Banda bajo los pies, extremos en las manos o hombros',
      'Eleva los talones contra la resistencia de la banda',
      'Mayor resistencia en la contracción máxima',
      'Portátil, ideal para entrenar en cualquier lugar'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-25 repeticiones',
    restTime: '30-45 segundos'
  },
];


// Export genérico para carga dinámica
export const exercises = gemelosExercises;
