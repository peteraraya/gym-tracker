import { ExerciseTemplate, URL_STORAGE } from '../types';

export const hombrosExercises: ExerciseTemplate[] = [
  {
    id: 'overhead-press',
    name: 'Press Militar',
    muscleGroup: 'hombros',
    equipment: 'Barra',
    defaultSets: 4,
    defaultReps: 10,
    image: URL_STORAGE + 'male-barbell-standing-overhead-press-front.gif',
    technique: [
      'Pies al ancho de hombros',
      'Empuja la barra desde los hombros hacia arriba',
      'Lleva la cabeza ligeramente hacia atrás al subir',
      'Bloquea los codos arriba',
      'Mantén el core activado'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '6-10 repeticiones',
    restTime: '2-3 minutos'
  },
  {
    id: 'lateral-raises',
    name: 'Elevaciones Laterales',
    muscleGroup: 'hombros',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-dumbbell-lateral-raise-front.gif',
    technique: [
      'Codos ligeramente flexionados',
      'Eleva los brazos hasta la altura de los hombros',
      'Lidera el movimiento con los codos',
      'Baja con control, no dejes caer el peso'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'front-raises',
    name: 'Elevaciones Frontales',
    muscleGroup: 'hombros',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-front-raise-front.gif',
    technique: [
      'Brazos ligeramente flexionados',
      'Eleva hasta la altura de los ojos',
      'No uses impulso del cuerpo',
      'Alterna los brazos o hazlo simultáneamente'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'arnold-press',
    name: 'Press Arnold',
    muscleGroup: 'hombros',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 10,
    image: URL_STORAGE + 'male-dumbbell-arnold-press-front.gif',
    technique: [
      'Inicia con palmas hacia ti a la altura del pecho',
      'Rota las muñecas mientras empujas hacia arriba',
      'Termina con palmas hacia adelante',
      'Regresa rotando en sentido inverso'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '90 segundos'
  },
  {
    id: 'rear-delt-fly',
    name: 'Elevaciones Posteriores',
    muscleGroup: 'hombros',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-dumbbell-rear-delt-fly-front.gif',
    technique: [
      'Inclínate hacia adelante o siéntate en el borde de un banco',
      'Brazos ligeramente flexionados',
      'Eleva las mancuernas hacia los lados',
      'Trabaja el deltoides posterior'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'upright-row',
    name: 'Remo al Cuello',
    muscleGroup: 'hombros',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-barbell-upright-row-front.gif',
    technique: [
      'Agarre estrecho en la barra',
      'Tira de la barra hacia la barbilla',
      'Los codos van más altos que las manos',
      'Trabaja deltoides y trapecios'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'seated-dumbbell-press',
    name: 'Press con Mancuernas Sentado',
    muscleGroup: 'hombros',
    equipment: 'Mancuernas',
    defaultSets: 4,
    defaultReps: 10,
    image: URL_STORAGE + 'male-dumbbell-shoulder-press-front.gif',
    technique: [
      'Siéntate con respaldo vertical',
      'Inicia con mancuernas a la altura de los hombros',
      'Empuja hacia arriba hasta casi tocar las mancuernas',
      'Mayor aislamiento que el press de pie'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'cable-lateral-raise',
    name: 'Elevaciones Laterales en Polea',
    muscleGroup: 'hombros',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-cable-lateral-raise-front.gif',
    technique: [
      'Párate de lado a la polea',
      'Tensión constante durante todo el movimiento',
      'Eleva hasta la altura del hombro',
      'Mayor control que con mancuernas'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones por lado',
    restTime: '45-60 segundos'
  },
  {
    id: 'machine-shoulder-press',
    name: 'Press de Hombros en Máquina',
    muscleGroup: 'hombros',
    equipment: 'Máquina',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-machine-shoulder-press-front.gif',
    technique: [
      'Ajusta el asiento para que las agarraderas queden a la altura de los hombros',
      'Empuja hacia arriba sin bloquear completamente los codos',
      'Baja con control hasta 90 grados',
      'Ideal para principiantes o al final de la rutina'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'dumbbell-shrugs',
    name: 'Encogimientos con Mancuernas',
    muscleGroup: 'hombros',
    equipment: 'Mancuernas',
    defaultSets: 4,
    defaultReps: 15,
    image: URL_STORAGE + 'male-dumbbell-shrugs-front.gif',
    technique: [
      'Mancuernas a los lados del cuerpo',
      'Eleva los hombros hacia las orejas',
      'Mantén 1-2 segundos arriba apretando los trapecios',
      'Baja lentamente sin rebotar'
    ],
    recommendedSets: '3-5 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'cable-face-pull-rear',
    name: 'Face Pull con Cuerda',
    muscleGroup: 'hombros',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-cable-face-pull-rear-delt-front.gif',
    technique: [
      'Polea a la altura de la cara',
      'Tira de la cuerda hacia la cara separando las manos',
      'Rota externamente los hombros al final del movimiento',
      'Excelente para salud del hombro y postura'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'behind-neck-press',
    name: 'Press Tras Nuca',
    muscleGroup: 'hombros',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 10,
    image: URL_STORAGE + 'male-barbell-behind-neck-press-front.gif',
    technique: [
      'Baja la barra detrás de la cabeza hasta la altura de las orejas',
      'Requiere buena movilidad de hombros',
      'Trabaja las tres cabezas del deltoides',
      'Usa peso moderado y control total'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'smith-overhead-press',
    name: 'Press Militar en Smith',
    muscleGroup: 'hombros',
    equipment: 'Máquina Smith',
    defaultSets: 4,
    defaultReps: 10,
    image: URL_STORAGE + 'male-smith-overhead-press-front.gif',
    technique: [
      'Sentado con la espalda apoyada bajo la barra Smith',
      'Empuja hacia arriba sin bloquear completamente',
      'La guía fija permite enfocarte en los deltoides',
      'Seguro para entrenar pesado sin compañero'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'cable-front-raise',
    name: 'Elevación Frontal en Polea',
    muscleGroup: 'hombros',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-front-raise-front.gif',
    technique: [
      'Polea baja detrás de ti',
      'Eleva el brazo hasta la altura de los ojos',
      'Tensión constante durante todo el recorrido',
      'Más efectivo que con mancuernas para el deltoides anterior'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 por brazo',
    restTime: '45-60 segundos'
  },
  {
    id: 'reverse-pec-deck',
    name: 'Pec Deck Inverso',
    muscleGroup: 'hombros',
    equipment: 'Máquina',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-machine-reverse-pec-deck-front.gif',
    technique: [
      'Siéntate mirando hacia la máquina',
      'Abre los brazos hacia atrás en arco',
      'Contrae los deltoides posteriores y romboides',
      'Excelente para postura y equilibrio del hombro'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'landmine-press',
    name: 'Press Landmine',
    muscleGroup: 'hombros',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 10,
    image: URL_STORAGE + 'male-barbell-landmine-press-front.gif',
    technique: [
      'Barra anclada en una esquina o accesorio landmine',
      'De pie o arrodillado, empuja el extremo de la barra hacia arriba',
      'Movimiento angular amigable con los hombros',
      'Menos estrés articular que el press vertical'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 por brazo',
    restTime: '60-90 segundos'
  },
  {
    id: 'plate-front-raise',
    name: 'Elevación Frontal con Disco',
    muscleGroup: 'hombros',
    equipment: 'Disco',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-plate-front-raise-front.gif',
    technique: [
      'Sostén un disco con ambas manos por los lados',
      'Eleva hasta la altura de los ojos con brazos extendidos',
      'Mantén el core apretado para no balancearte',
      'Baja con control sin dejar caer el peso'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'band-pull-apart',
    name: 'Band Pull Apart',
    muscleGroup: 'hombros',
    equipment: 'Banda elástica',
    defaultSets: 3,
    defaultReps: 20,
    image: URL_STORAGE + 'male-band-pull-apart-front.gif',
    technique: [
      'Banda a la altura de los hombros con brazos extendidos',
      'Separa las manos estirando la banda',
      'Contrae los deltoides posteriores y romboides',
      'Excelente para calentamiento y salud del hombro'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-25 repeticiones',
    restTime: '30-45 segundos'
  },
  {
    id: 'cable-rear-delt-fly',
    name: 'Aperturas Posteriores en Polea',
    muscleGroup: 'hombros',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-cable-rear-delt-fly-front.gif',
    technique: [
      'Poleas cruzadas a la altura del hombro',
      'Tira hacia atrás abriendo los brazos',
      'Trabaja el deltoides posterior con tensión constante',
      'Mantén una ligera flexión en los codos'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'dumbbell-y-raise',
    name: 'Elevación en Y con Mancuernas',
    muscleGroup: 'hombros',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-y-raise-front.gif',
    technique: [
      'De pie o en banco inclinado boca abajo',
      'Eleva los brazos formando una Y',
      'Trabaja deltoides y trapecio inferior',
      'Usa peso ligero, enfoca en la conexión mente-músculo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '45-60 segundos'
  }
];


// Export genérico para carga dinámica
export const exercises = hombrosExercises;
