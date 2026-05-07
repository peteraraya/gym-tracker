export type MuscleGroup =
  | 'pecho'
  | 'espalda'
  | 'piernas'
  | 'hombros'
  | 'biceps'
  | 'triceps'
  | 'antebrazos'
  | 'trapecio'
  | 'cuello'
  | 'core'
  | 'gluteos'
  | 'gemelos'
  | 'cardio';

export interface ExerciseTemplate {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment?: string;
  description?: string;
  defaultSets?: number;
  defaultReps?: number;
  image?: string; // URL de la imagen/GIF del ejercicio (opcional)
  technique?: string[]; // Recomendaciones de técnica
  recommendedSets?: string; // Ej: "3-4 series"
  recommendedReps?: string; // Ej: "8-12 repeticiones"
  restTime?: string; // Ej: "60-90 segundos"
}
const URL_STORAGE = 'https://hplrrjqgzefkdevbporx.supabase.co/storage/v1/object/public/routine-images/'
export const EXERCISE_DATABASE: ExerciseTemplate[] = [
  // PECHO
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
  },
  {
    id: 'seated-cable-fly',
    name: 'Aperturas en Polea Sentado',
    muscleGroup: 'pecho',
    equipment: 'Poleas',
    description: 'Ejercicio de aislamiento que mantiene tensión constante en los pectorales',
    defaultSets: 3,
    defaultReps: 12,
    technique: [
      'Siéntate en un banco entre dos poleas ajustadas a la altura del pecho',
      'Agarra las manijas con los brazos extendidos a los lados',
      'Mantén una ligera flexión en los codos',
      'Junta las manijas al frente en un movimiento de abrazo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'incline-cable-fly',
    name: 'Aperturas en Polea Inclinado',
    muscleGroup: 'pecho',
    equipment: 'Poleas',
    description: 'Enfoca el trabajo en el pecho superior con tensión constante',
    defaultSets: 3,
    defaultReps: 12,
    technique: [
      'Ajusta las poleas en posición baja',
      'Inclínate ligeramente hacia adelante',
      'Junta las manijas hacia arriba y al centro',
      'Enfoca el trabajo en el pecho superior'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'low-cable-fly',
    name: 'Aperturas en Polea Baja',
    muscleGroup: 'pecho',
    equipment: 'Poleas',
    description: 'Trabaja el pecho inferior con tensión constante',
    defaultSets: 3,
    defaultReps: 12,
    technique: [
      'Ajusta las poleas en posición alta',
      'Inclínate ligeramente hacia adelante',
      'Junta las manijas hacia abajo y al centro',
      'Enfoca el trabajo en el pecho inferior'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'cable-press',
    name: 'Press en Polea',
    muscleGroup: 'pecho',
    equipment: 'Poleas',
    description: 'Variante del press que mantiene tensión constante',
    defaultSets: 3,
    defaultReps: 10,
    technique: [
      'Colócate de espaldas a las poleas',
      'Agarra las manijas a la altura del pecho',
      'Da un paso adelante para crear tensión',
      'Empuja hacia adelante extendiendo los brazos'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '90 segundos'
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Press Inclinado con Mancuernas',
    muscleGroup: 'pecho',
    equipment: 'Mancuernas',
    description: 'Desarrolla el pecho superior con mayor rango de movimiento',
    defaultSets: 3,
    defaultReps: 10,
    technique: [
      'Ajusta el banco a 30-45 grados',
      'Sostén las mancuernas a los lados del pecho',
      'Empuja hacia arriba juntando las mancuernas al final',
      'Baja con control hasta sentir estiramiento'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'decline-dumbbell-press',
    name: 'Press Declinado con Mancuernas',
    muscleGroup: 'pecho',
    equipment: 'Mancuernas',
    description: 'Enfoca el trabajo en el pecho inferior',
    defaultSets: 3,
    defaultReps: 10,
    technique: [
      'Ajusta el banco a 15-30 grados de decline',
      'Asegura los pies en los soportes',
      'Baja las mancuernas al pecho inferior',
      'Empuja hacia arriba con control'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'dumbbell-press',
    name: 'Press con Mancuernas',
    muscleGroup: 'pecho',
    equipment: 'Mancuernas',
    description: 'Variante del press que permite mayor rango de movimiento',
    defaultSets: 4,
    defaultReps: 10,
    technique: [
      'Acuéstate en banco plano con mancuernas',
      'Comienza con las mancuernas a los lados del pecho',
      'Empuja hacia arriba hasta extender los brazos',
      'Baja con control más allá de la línea del pecho'
    ],
    recommendedSets: '3-5 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'incline-cable-press',
    name: 'Press Inclinado en Polea',
    muscleGroup: 'pecho',
    equipment: 'Poleas',
    description: 'Press inclinado con tensión constante para pecho superior',
    defaultSets: 3,
    defaultReps: 10,
    technique: [
      'Ajusta las poleas en posición baja',
      'Colócate de espaldas a las poleas',
      'Empuja hacia arriba y adelante en ángulo',
      'Mantén el core activado'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '90 segundos'
  },
  {
    id: 'chest-dips',
    name: 'Fondos en Paralelas (Pecho)',
    muscleGroup: 'pecho',
    equipment: 'Peso corporal',
    description: 'Ejercicio compuesto que enfatiza el pecho inferior',
    defaultSets: 3,
    defaultReps: 10,
    technique: [
      'Agarra las barras paralelas e inclínate hacia adelante',
      'Baja el cuerpo doblando los codos',
      'Mantén los codos ligeramente abiertos',
      'Empuja hacia arriba hasta extender los brazos'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-15 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'svend-press',
    name: 'Press Svend',
    muscleGroup: 'pecho',
    equipment: 'Discos',
    description: 'Ejercicio de contracción isométrica para pecho interno',
    defaultSets: 3,
    defaultReps: 15,
    technique: [
      'Sostén un disco o dos discos juntos frente al pecho',
      'Aprieta fuertemente los discos entre tus manos',
      'Extiende los brazos hacia adelante manteniendo la presión',
      'Regresa al pecho sin soltar la tensión'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '60 segundos'
  },

  // ESPALDA
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
    technique: [
      'Coloca la barra en el rack a altura de rodillas',
      'Ejecuta la parte superior del peso muerto',
      'Permite usar más peso que peso muerto completo',
      'Enfoca en contraer trapecios al final'
    ],
    recommendedSets: '3-5 series',
    recommendedReps: '5-8 repeticiones',
    restTime: '2-3 minutos'
  },

  // PIERNAS
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
  },
  {
    id: 'walking-lunges',
    name: 'Zancadas Caminando',
    muscleGroup: 'piernas',
    equipment: 'Mancuernas',
    description: 'Variante dinámica de zancadas que mejora equilibrio y coordinación',
    defaultSets: 3,
    defaultReps: 20,
    technique: [
      'Da un paso largo hacia adelante',
      'Baja hasta que ambas rodillas formen 90 grados',
      'Empuja con el pie delantero y avanza con la otra pierna',
      'Continúa alternando piernas mientras caminas'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 pasos por pierna',
    restTime: '90 segundos'
  },
  {
    id: 'sumo-squat',
    name: 'Sentadilla Sumo',
    muscleGroup: 'piernas',
    equipment: 'Mancuernas',
    description: 'Enfatiza los aductores y glúteos con stance amplio',
    defaultSets: 3,
    defaultReps: 12,
    technique: [
      'Stance muy amplio, pies apuntando hacia afuera 45 grados',
      'Sostén una mancuerna con ambas manos entre las piernas',
      'Baja manteniendo el torso erguido',
      'Empuja con los talones para subir'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '90 segundos'
  },
  {
    id: 'nordic-curl',
    name: 'Nordic Curl',
    muscleGroup: 'piernas',
    equipment: 'Peso corporal',
    description: 'Ejercicio avanzado para isquiotibiales con control excéntrico',
    defaultSets: 3,
    defaultReps: 6,
    technique: [
      'Arrodíllate con los tobillos asegurados',
      'Mantén el cuerpo recto desde rodillas hasta cabeza',
      'Baja lentamente hacia adelante controlando con isquiotibiales',
      'Usa las manos para amortiguar la caída si es necesario'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '5-10 repeticiones',
    restTime: '2-3 minutos'
  },
  {
    id: 'wall-sit',
    name: 'Sentadilla Isométrica en Pared',
    muscleGroup: 'piernas',
    equipment: 'Peso corporal',
    description: 'Ejercicio isométrico que desarrolla resistencia en cuádriceps',
    defaultSets: 3,
    defaultReps: 1,
    technique: [
      'Apoya la espalda contra una pared',
      'Deslízate hacia abajo hasta que muslos estén paralelos al suelo',
      'Rodillas a 90 grados, directamente sobre los tobillos',
      'Mantén la posición el tiempo indicado'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '30-60 segundos',
    restTime: '60-90 segundos'
  },

  // GLÚTEOS
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

  // HOMBROS
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
    id: 'dumbbell-shrugs-shoulders',
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

  // BÍCEPS
  {
    id: 'barbell-curl',
    name: 'Curl con Barra',
    muscleGroup: 'biceps',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-barbell-bicep-curl-front.gif',
    technique: [
      'Codos pegados a los costados',
      'No balancees el cuerpo',
      'Contrae el bíceps en la parte superior',
      'Baja con control hasta extensión completa'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'tricep-dips',
    name: 'Fondos en Paralelas',
    muscleGroup: 'triceps',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-bodyweight-tricep-dip-front.gif',
    technique: [
      'Mantén el cuerpo vertical para enfoque en tríceps',
      'Baja hasta que codos formen 90 grados',
      'No bajes demasiado para evitar lesiones en hombros',
      'Empuja con fuerza para subir'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-15 repeticiones',
    restTime: '90 segundos'
  },
  {
    id: 'hammer-curl',
    name: 'Curl Martillo',
    muscleGroup: 'biceps',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-hammer-curl-front.gif',
    technique: [
      'Palmas enfrentadas entre sí durante todo el movimiento',
      'Mantén los codos fijos',
      'Sube hasta que las mancuernas estén a la altura de los hombros',
      'Trabaja el braquial y antebrazo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'tricep-extension',
    name: 'Extensión de Tríceps',
    muscleGroup: 'triceps',
    equipment: 'Mancuernas/Polea',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-overhead-tricep-extension-front.gif',
    technique: [
      'Mantén los codos quietos y apuntando hacia arriba',
      'Solo mueve los antebrazos',
      'Extiende completamente para máxima contracción',
      'Control total en el regreso'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'concentration-curl',
    name: 'Curl Concentrado',
    muscleGroup: 'biceps',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-dumbbell-concentration-curl-front.gif',
    technique: [
      'Siéntate, apoya el codo en la parte interna del muslo',
      'Aísla completamente el bíceps',
      'Sube la mancuerna lentamente',
      'Maximiza la contracción en la parte superior'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones por brazo',
    restTime: '45-60 segundos'
  },
  {
    id: 'close-grip-bench',
    name: 'Press de Banca Agarre Cerrado',
    muscleGroup: 'triceps',
    equipment: 'Barra',
    defaultSets: 4,
    defaultReps: 10,
    image: URL_STORAGE + 'male-barbell-close-grip-bench-press-front.gif',
    technique: [
      'Manos separadas al ancho de los hombros o menos',
      'Mantén los codos cerca del cuerpo',
      'Excelente para tríceps',
      'Baja la barra al pecho medio/bajo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '6-10 repeticiones',
    restTime: '2-3 minutos'
  },
  {
    id: 'preacher-curl',
    name: 'Curl en Banco Scott',
    muscleGroup: 'biceps',
    equipment: 'Barra/Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-barbell-preacher-curl-front.gif',
    technique: [
      'Apoya los brazos en el banco inclinado',
      'Elimina el impulso del cuerpo',
      'Aislamiento total del bíceps',
      'No levantes los codos del pad'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'skull-crushers',
    name: 'Rompecráneos',
    muscleGroup: 'triceps',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-barbell-skull-crusher-side.gif',
    technique: [
      'Acuéstate en un banco, barra sobre la frente',
      'Mantén los codos fijos apuntando al techo',
      'Baja la barra hacia la frente con control',
      'Extiende solo usando los tríceps'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'cable-curl',
    name: 'Curl en Polea',
    muscleGroup: 'biceps',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-cable-bicep-curl-front.gif',
    technique: [
      'Usa polea baja con barra o cuerda',
      'Tensión constante en el bíceps',
      'No balancees el cuerpo',
      'Contrae en la parte superior'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'tricep-pushdown',
    name: 'Extensión de Tríceps en Polea',
    muscleGroup: 'triceps',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-cable-tricep-pushdown-front.gif',
    technique: [
      'Usa barra recta o cuerda en polea alta',
      'Mantén los codos pegados a los costados',
      'Empuja hacia abajo hasta extensión completa',
      'No uses impulso del cuerpo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'zottman-curl',
    name: 'Curl Zottman',
    muscleGroup: 'biceps',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-zottman-curl-front.gif',
    technique: [
      'Sube con palmas hacia arriba (curl normal)',
      'Rota las muñecas arriba (palmas hacia abajo)',
      'Baja con palmas hacia abajo',
      'Trabaja bíceps y antebrazos simultáneamente'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },

  // CORE
  {
    id: 'plank',
    name: 'Plancha',
    muscleGroup: 'core',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 60,
    image: URL_STORAGE + 'male-bodyweight-plank-side.gif',
    technique: [
      'Mantén el cuerpo en línea recta',
      'No dejes caer las caderas',
      'Aprieta el abdomen y glúteos',
      'Respira normalmente'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '30-60 segundos',
    restTime: '60 segundos'
  },
  {
    id: 'crunches',
    name: 'Abdominales',
    muscleGroup: 'core',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 20,
    image: URL_STORAGE + 'male-bodyweight-crunch-side.gif',
    technique: [
      'Manos detrás de la cabeza sin jalar el cuello',
      'Levanta solo los omóplatos del suelo',
      'Contrae el abdomen conscientemente',
      'No uses impulso'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-25 repeticiones',
    restTime: '45 segundos'
  },
  {
    id: 'russian-twist',
    name: 'Giros Rusos',
    muscleGroup: 'core',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 20,
    image: URL_STORAGE + 'male-bodyweight-russian-twist-side.gif',
    technique: [
      'Siéntate con rodillas dobladas, pies elevados',
      'Inclínate ligeramente hacia atrás',
      'Gira el torso de lado a lado',
      'Toca el suelo a cada lado'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '20-30 repeticiones totales',
    restTime: '45 segundos'
  },
  {
    id: 'leg-raises',
    name: 'Elevaciones de Piernas',
    muscleGroup: 'core',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-bodyweight-leg-raise-side.gif',
    technique: [
      'Acuéstate boca arriba, manos bajo los glúteos',
      'Mantén las piernas rectas',
      'Eleva las piernas hasta 90 grados',
      'Baja con control sin tocar el suelo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-20 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'bicycle-crunches',
    name: 'Bicicleta en el Aire',
    muscleGroup: 'core',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 20,
    image: URL_STORAGE + 'male-bodyweight-bicycle-crunch-side.gif',
    technique: [
      'Acuéstate boca arriba, manos detrás de la cabeza',
      'Lleva el codo al rodilla opuesta alternadamente',
      'Mantén el core contraído',
      'Excelente para oblicuos'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '20-30 repeticiones totales',
    restTime: '45 segundos'
  },
  {
    id: 'mountain-climbers',
    name: 'Escaladores',
    muscleGroup: 'core',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 30,
    image: URL_STORAGE + 'male-bodyweight-mountain-climbers-side.gif',
    technique: [
      'Posición de plancha alta',
      'Lleva las rodillas al pecho alternadamente',
      'Mantén las caderas bajas',
      'Movimiento rápido y continuo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '30-60 segundos',
    restTime: '45-60 segundos'
  },
  {
    id: 'dead-bug',
    name: 'Dead Bug',
    muscleGroup: 'core',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-bodyweight-dead-bug-side.gif',
    technique: [
      'Acuéstate boca arriba, brazos extendidos al techo',
      'Rodillas a 90 grados',
      'Baja brazo y pierna opuestos simultáneamente',
      'Mantén la espalda baja pegada al suelo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones por lado',
    restTime: '45 segundos'
  },
  {
    id: 'cable-woodchop',
    name: 'Leñador en Polea',
    muscleGroup: 'core',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-wood-chop-front.gif',
    technique: [
      'Polea alta, agarre con ambas manos',
      'Gira el torso llevando el cable en diagonal',
      'Trabaja los oblicuos y rotación',
      'Mantén los brazos extendidos'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 repeticiones por lado',
    restTime: '45-60 segundos'
  },
  {
    id: 'hanging-knee-raise',
    name: 'Elevación de Rodillas Colgado',
    muscleGroup: 'core',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-bodyweight-hanging-knee-raise-side.gif',
    technique: [
      'Cuélgate de una barra',
      'Eleva las rodillas hacia el pecho',
      'Evita balanceo excesivo',
      'Mayor dificultad que elevaciones en el suelo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-20 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'ab-wheel',
    name: 'Rueda Abdominal',
    muscleGroup: 'core',
    equipment: 'Rueda abdominal',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-wheel-ab-wheel-rollout-side.gif',
    technique: [
      'Arrodíllate, sostén la rueda con ambas manos',
      'Rueda hacia adelante manteniendo el core tenso',
      'No dejes que la espalda se arquee',
      'Regresa usando los abdominales'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'side-plank',
    name: 'Plancha Lateral',
    muscleGroup: 'core',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 45,
    image: URL_STORAGE + 'male-bodyweight-side-plank-side.gif',
    technique: [
      'Apóyate en un antebrazo y el lado del pie',
      'Mantén el cuerpo en línea recta',
      'Trabaja los oblicuos intensamente',
      'No dejes caer las caderas'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '30-60 segundos por lado',
    restTime: '45-60 segundos'
  },

  // GEMELOS
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

  // ============================
  // PECHO - EJERCICIOS ADICIONALES
  // ============================
  {
    id: 'chest-press-machine',
    name: 'Press de Pecho en Máquina',
    muscleGroup: 'pecho',
    equipment: 'Máquina',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-machine-chest-press-front.gif',
    technique: [
      'Ajusta el asiento para que las agarraderas queden a la altura del pecho',
      'Empuja hacia adelante sin bloquear los codos',
      'Regresa con control manteniendo tensión',
      'Ideal para principiantes o series finales'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Press Inclinado con Mancuernas',
    muscleGroup: 'pecho',
    equipment: 'Mancuernas',
    defaultSets: 4,
    defaultReps: 10,
    image: URL_STORAGE + 'male-dumbbell-incline-bench-press-front.gif',
    technique: [
      'Banco inclinado a 30-45 grados',
      'Mancuernas a la altura de los hombros al inicio',
      'Empuja hacia arriba juntando ligeramente las mancuernas',
      'Mayor activación del pecho superior que con barra'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'decline-dumbbell-press',
    name: 'Press Declinado con Mancuernas',
    muscleGroup: 'pecho',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 10,
    image: URL_STORAGE + 'male-dumbbell-decline-bench-press-front.gif',
    technique: [
      'Banco declinado a 15-30 grados',
      'Baja las mancuernas hacia el pecho inferior',
      'Empuja hacia arriba contrayendo el pecho',
      'Mayor rango de movimiento que con barra'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'dumbbell-bench-press',
    name: 'Press de Banca con Mancuernas',
    muscleGroup: 'pecho',
    equipment: 'Mancuernas',
    defaultSets: 4,
    defaultReps: 10,
    image: URL_STORAGE + 'male-dumbbell-bench-press-front.gif',
    technique: [
      'Acuéstate en banco plano con mancuernas a los lados del pecho',
      'Empuja verticalmente juntando las mancuernas arriba',
      'Mayor rango de movimiento que el press con barra',
      'Corrige desbalances entre ambos lados'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'smith-bench-press',
    name: 'Press de Banca en Smith',
    muscleGroup: 'pecho',
    equipment: 'Máquina Smith',
    defaultSets: 4,
    defaultReps: 10,
    image: URL_STORAGE + 'male-smith-bench-press-front.gif',
    technique: [
      'Ajusta el banco debajo de la barra de la Smith',
      'La guía fija permite enfocarte en la contracción',
      'Ideal para entrenar sin compañero',
      'Baja hasta el pecho con control'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'low-cable-fly',
    name: 'Aperturas en Polea Baja',
    muscleGroup: 'pecho',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-low-fly-front.gif',
    technique: [
      'Poleas en posición baja',
      'Tira hacia arriba y al centro con brazos semiflexionados',
      'Enfoca el trabajo en la porción superior del pecho',
      'Contrae fuertemente al juntar las manos arriba'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'high-cable-fly',
    name: 'Aperturas en Polea Alta',
    muscleGroup: 'pecho',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-high-fly-front.gif',
    technique: [
      'Poleas en posición alta',
      'Tira hacia abajo y al centro',
      'Enfoca el trabajo en la porción inferior del pecho',
      'Inclínate ligeramente hacia adelante'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'incline-cable-fly',
    name: 'Aperturas Inclinadas en Polea',
    muscleGroup: 'pecho',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-incline-fly-front.gif',
    technique: [
      'Banco inclinado entre las poleas bajas',
      'Brazos semiflexionados, junta las manos sobre el pecho',
      'Tensión constante durante todo el recorrido',
      'Excelente aislamiento del pecho superior'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'chest-dip',
    name: 'Fondos para Pecho',
    muscleGroup: 'pecho',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-bodyweight-chest-dip-front.gif',
    technique: [
      'Inclínate hacia adelante durante el movimiento',
      'Codos ligeramente abiertos',
      'Baja hasta sentir estiramiento en el pecho',
      'La inclinación diferencia del fondo para tríceps'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-15 repeticiones',
    restTime: '90 segundos'
  },
  {
    id: 'svend-press',
    name: 'Svend Press',
    muscleGroup: 'pecho',
    equipment: 'Disco',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-plate-svend-press-front.gif',
    technique: [
      'Sujeta un disco entre las palmas a la altura del pecho',
      'Aprieta las manos mientras empujas hacia adelante',
      'Contracción isométrica intensa del pecho',
      'Excelente como finisher o pre-agotamiento'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'wide-push-ups',
    name: 'Flexiones Abiertas',
    muscleGroup: 'pecho',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-bodyweight-wide-push-up-front.gif',
    technique: [
      'Manos más abiertas que el ancho de los hombros',
      'Mayor activación del pecho externo',
      'Mantén el core activado y el cuerpo recto',
      'Baja hasta que el pecho casi toque el suelo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-20 repeticiones',
    restTime: '60 segundos'
  },

  // ============================
  // ESPALDA - EJERCICIOS ADICIONALES
  // ============================
  {
    id: 'close-grip-pulldown',
    name: 'Jalón Agarre Cerrado',
    muscleGroup: 'espalda',
    equipment: 'Máquina',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-close-grip-lat-pulldown-back.gif',
    technique: [
      'Usa agarre en V o triángulo',
      'Tira hacia el pecho medio manteniendo espalda recta',
      'Mayor activación de la zona media de la espalda',
      'Controla la fase excéntrica'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'single-arm-cable-row',
    name: 'Remo Unilateral en Polea',
    muscleGroup: 'espalda',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-single-arm-row-back.gif',
    technique: [
      'Polea baja, agarre con una mano',
      'Tira del codo hacia atrás rotando ligeramente el torso',
      'Mayor rango de movimiento que bilateral',
      'Corrige desbalances entre ambos lados'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 por lado',
    restTime: '60-90 segundos'
  },
  {
    id: 'machine-row',
    name: 'Remo en Máquina',
    muscleGroup: 'espalda',
    equipment: 'Máquina',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-machine-seated-row-back.gif',
    technique: [
      'Ajusta el pad del pecho para contacto firme',
      'Tira de las agarraderas hacia el abdomen',
      'Aprieta los omóplatos al final',
      'Ideal para mantener forma estricta'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'pendlay-row',
    name: 'Remo Pendlay',
    muscleGroup: 'espalda',
    equipment: 'Barra',
    defaultSets: 4,
    defaultReps: 8,
    image: URL_STORAGE + 'male-barbell-pendlay-row-back.gif',
    technique: [
      'Torso paralelo al suelo, barra en el piso',
      'Tira explosivamente hacia el abdomen',
      'La barra regresa al piso en cada repetición',
      'Desarrolla fuerza y potencia en la espalda'
    ],
    recommendedSets: '3-5 series',
    recommendedReps: '5-8 repeticiones',
    restTime: '2-3 minutos'
  },
  {
    id: 'rack-pulls',
    name: 'Rack Pulls',
    muscleGroup: 'espalda',
    equipment: 'Barra',
    defaultSets: 4,
    defaultReps: 6,
    image: URL_STORAGE + 'male-barbell-rack-pull-side.gif',
    technique: [
      'Barra apoyada en los seguros del rack a la altura de las rodillas',
      'Peso muerto parcial enfocado en la espalda alta y trapecios',
      'Mantén la espalda recta y empuja las caderas hacia adelante',
      'Permite usar cargas más altas que el peso muerto completo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '4-8 repeticiones',
    restTime: '2-3 minutos'
  },
  {
    id: 'cable-pullover',
    name: 'Pullover en Polea',
    muscleGroup: 'espalda',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-pullover-back.gif',
    technique: [
      'Polea alta con barra recta o cuerda',
      'Brazos semiflexionados, tira hacia las caderas',
      'Aísla los dorsales sin involucrar bíceps',
      'Tensión constante durante todo el movimiento'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'hyperextension',
    name: 'Hiperextensiones',
    muscleGroup: 'espalda',
    equipment: 'Banco romano',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-bodyweight-hyperextension-side.gif',
    technique: [
      'Caderas en el borde del banco romano',
      'Baja el torso con control',
      'Sube contrayendo los erectores espinales',
      'Puedes agregar peso con disco o mancuerna'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'meadows-row',
    name: 'Remo Meadows',
    muscleGroup: 'espalda',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 10,
    image: URL_STORAGE + 'male-barbell-meadows-row-back.gif',
    technique: [
      'Barra anclada en una esquina (landmine)',
      'Posición perpendicular a la barra',
      'Agarre con una mano en el extremo',
      'Tira con el codo hacia arriba y atrás'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 por lado',
    restTime: '60-90 segundos'
  },
  {
    id: 'wide-grip-seated-row',
    name: 'Remo Sentado Agarre Ancho',
    muscleGroup: 'espalda',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-wide-grip-seated-row-back.gif', // es wooman
    technique: [
      'Usa barra larga en la polea baja',
      'Agarre ancho prono (palmas hacia abajo)',
      'Tira hacia el pecho superior',
      'Mayor énfasis en romboides y trapecios medios'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },

  // ============================
  // PIERNAS - EJERCICIOS ADICIONALES
  // ============================
  {
    id: 'smith-squat',
    name: 'Sentadilla en Smith',
    muscleGroup: 'piernas',
    equipment: 'Máquina Smith',
    defaultSets: 4,
    defaultReps: 10,
    image: URL_STORAGE + 'male-smith-squat-front.gif',
    technique: [
      'Pies ligeramente adelantados respecto a la barra',
      'La guía de la Smith aporta estabilidad',
      'Baja hasta 90 grados o más',
      'Ideal para entrenar pesado sin compañero'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'walking-lunges',
    name: 'Zancadas Caminando',
    muscleGroup: 'piernas',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-walking-lunge-front.gif',
    technique: [
      'Da pasos amplios hacia adelante sin detenerte',
      'Cada paso es una zancada completa',
      'Rodilla trasera casi toca el suelo',
      'Excelente para resistencia y coordinación'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 por pierna',
    restTime: '90 segundos'
  },
  {
    id: 'pendulum-squat',
    name: 'Sentadilla Péndulo',
    muscleGroup: 'piernas',
    equipment: 'Máquina',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-machine-pendulum-squat-front.gif',
    technique: [
      'Espalda apoyada en el pad, pies adelantados',
      'Movimiento pendular enfocado en cuádriceps',
      'Gran estiramiento en la parte baja',
      'Menor estrés en la espalda baja que la sentadilla libre'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '90 segundos'
  },
  {
    id: 'belt-squat',
    name: 'Belt Squat',
    muscleGroup: 'piernas',
    equipment: 'Máquina',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-machine-belt-squat-front.gif',
    technique: [
      'Cinturón conectado al peso, sin carga en la espalda',
      'Baja profundo manteniendo torso erguido',
      'Cero estrés en la columna vertebral',
      'Ideal para quienes tienen problemas de espalda'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '90 segundos'
  },

  // ============================
  // GLÚTEOS - EJERCICIOS ADICIONALES
  // ============================
  {
    id: 'hip-thrust-machine',
    name: 'Hip Thrust en Máquina',
    muscleGroup: 'gluteos',
    equipment: 'Máquina',
    defaultSets: 4,
    defaultReps: 12,
    image: URL_STORAGE + 'male-machine-hip-thrust-side.gif',
    technique: [
      'Siéntate en la máquina, pad sobre las caderas',
      'Empuja las caderas hacia arriba contrayendo glúteos',
      'Más cómodo y estable que con barra',
      'Ideal para cargas pesadas de forma segura'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'smith-hip-thrust',
    name: 'Hip Thrust en Smith',
    muscleGroup: 'gluteos',
    equipment: 'Máquina Smith',
    defaultSets: 4,
    defaultReps: 12,
    image: URL_STORAGE + 'male-smith-hip-thrust-side.gif',
    technique: [
      'Espalda en un banco, barra de la Smith sobre las caderas',
      'La guía fija permite enfocarte en la contracción',
      'Empuja con los talones elevando las caderas',
      'Alternativa estable al hip thrust con barra libre'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'cable-hip-abduction',
    name: 'Abducción de Cadera en Polea',
    muscleGroup: 'gluteos',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-cable-hip-abduction-side.gif',
    technique: [
      'Correa en el tobillo, polea baja',
      'De pie, abre la pierna hacia el lado',
      'Mantén el torso erguido sin inclinarte',
      'Trabaja glúteo medio y menor'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 por pierna',
    restTime: '45-60 segundos'
  },
  {
    id: 'barbell-glute-bridge',
    name: 'Puente de Glúteos con Barra',
    muscleGroup: 'gluteos',
    equipment: 'Barra',
    defaultSets: 4,
    defaultReps: 12,
    image: URL_STORAGE + 'male-barbell-glute-bridge-side.gif',
    technique: [
      'Acuéstate en el suelo con la barra sobre las caderas',
      'Pies firmes, rodillas a 90 grados',
      'Empuja las caderas hacia arriba',
      'Pausa 2 segundos arriba apretando glúteos'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '90 segundos'
  },
  {
    id: 'curtsy-lunge',
    name: 'Zancada Cruzada',
    muscleGroup: 'gluteos',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-curtsy-lunge-front.gif',
    technique: [
      'Da un paso hacia atrás y cruzando detrás de la pierna de apoyo',
      'Baja hasta que la rodilla trasera casi toque el suelo',
      'Mayor activación de glúteo medio',
      'Mantén el torso erguido durante todo el movimiento'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 por pierna',
    restTime: '60-90 segundos'
  },
  {
    id: 'lateral-band-walk',
    name: 'Caminata Lateral con Banda',
    muscleGroup: 'gluteos',
    equipment: 'Banda elástica',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-band-lateral-walk-front.gif', // wooman
    technique: [
      'Banda elástica alrededor de los tobillos o sobre las rodillas',
      'Posición de media sentadilla',
      'Da pasos laterales manteniendo tensión en la banda',
      'Excelente activación de glúteo medio'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 pasos por lado',
    restTime: '45-60 segundos'
  },
  {
    id: 'kickback-machine',
    name: 'Patadas en Máquina',
    muscleGroup: 'gluteos',
    equipment: 'Máquina',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-machine-glute-kickback-side.gif', // wooman
    technique: [
      'Apoya el pie en la plataforma de la máquina',
      'Empuja la pierna hacia atrás extendiendo la cadera',
      'Contrae el glúteo en la extensión completa',
      'Regresa con control sin soltar la tensión'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 por pierna',
    restTime: '45-60 segundos'
  },
  {
    id: 'fire-hydrants',
    name: 'Fire Hydrants',
    muscleGroup: 'gluteos',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-bodyweight-fire-hydrant-side.gif',// wooman
    technique: [
      'En cuatro puntos de apoyo',
      'Eleva la pierna hacia el lado manteniendo la rodilla a 90 grados',
      'Trabaja el glúteo medio y los rotadores de cadera',
      'Mantén la cadera estable sin rotar el torso'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-20 por pierna',
    restTime: '45 segundos'
  },
  {
    id: 'good-morning-dumbbell',
    name: 'Buenos Días con Mancuernas',
    muscleGroup: 'gluteos',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-good-morning-side.gif',
    technique: [
      'Mancuernas sobre los hombros o colgando frente al pecho',
      'Inclínate hacia adelante desde la cadera',
      'Siente el estiramiento en glúteos e isquiotibiales',
      'Sube contrayendo glúteos y manteniendo espalda recta'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
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
    id: 'cable-romanian-deadlift-glutes',
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
    id: 'cable-reverse-lunge-glutes',
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
    id: 'cable-hip-abduction-standing',
    name: 'Abducción de Cadera en Polea de Pie',
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
    id: 'curtsy-lunge-dumbbell',
    name: 'Zancada Reverencia con Mancuernas',
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
    id: 'good-morning-barbell',
    name: 'Buenos Días con Barra',
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
  },

  // ============================
  // HOMBROS - EJERCICIOS ADICIONALES
  // ============================
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
  },

  // ============================
  // BÍCEPS - EJERCICIOS ADICIONALES
  // ============================
  {
    id: 'spider-curl',
    name: 'Spider Curl',
    muscleGroup: 'biceps',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-spider-curl-front.gif',
    technique: [
      'Acuéstate boca abajo en banco inclinado',
      'Brazos colgando perpendiculares al suelo',
      'Haz curl sin poder usar impulso',
      'Aislamiento total del bíceps, pico de contracción intenso'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'incline-dumbbell-curl',
    name: 'Curl Inclinado con Mancuernas',
    muscleGroup: 'biceps',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-incline-curl-front.gif',
    technique: [
      'Banco inclinado a 45-60 grados, brazos colgando',
      'Mayor estiramiento del bíceps en la posición baja',
      'Sube las mancuernas contrayendo el bíceps',
      'Trabaja la cabeza larga del bíceps'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'overhead-cable-curl',
    name: 'Curl Alto en Polea',
    muscleGroup: 'biceps',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-overhead-curl-front.gif',
    technique: [
      'Poleas altas, de pie entre ellas con brazos en cruz',
      'Flexiona los codos llevando las manos hacia la cabeza',
      'Pose de bíceps doble clásica',
      'Gran contracción pico del bíceps'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'dip-machine',
    name: 'Fondos en Máquina',
    muscleGroup: 'triceps',
    equipment: 'Máquina',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-machine-tricep-dip-front.gif',
    technique: [
      'Siéntate, agarra las barras a los lados',
      'Empuja hacia abajo extendiendo los codos',
      'Ajusta el peso según tu nivel',
      'Alternativa asistida a los fondos libres'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'cable-overhead-tricep',
    name: 'Extensión de Tríceps sobre Cabeza en Polea',
    muscleGroup: 'triceps',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-overhead-tricep-extension-front.gif',
    technique: [
      'Polea baja, cuerda por encima de la cabeza',
      'De espaldas a la polea, un pie adelante',
      'Extiende los brazos hacia adelante sin mover los codos',
      'Mayor estiramiento de la cabeza larga del tríceps'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'reverse-curl',
    name: 'Curl Inverso',
    muscleGroup: 'biceps',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-barbell-reverse-curl-front.gif',
    technique: [
      'Agarre prono (palmas hacia abajo) en la barra',
      'Sube la barra flexionando los codos',
      'Trabaja el braquiorradial y los extensores del antebrazo',
      'Usa menos peso que el curl normal'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'bayesian-curl',
    name: 'Curl Bayesiano en Polea',
    muscleGroup: 'biceps',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-bayesian-curl-front.gif',
    technique: [
      'Polea baja detrás de ti, de espaldas a la máquina',
      'Brazo extendido hacia atrás al inicio',
      'Máximo estiramiento del bíceps en la posición baja',
      'Contrae llevando la mano hacia el hombro'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 por brazo',
    restTime: '45-60 segundos'
  },
  {
    id: 'drag-curl',
    name: 'Drag Curl',
    muscleGroup: 'biceps',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-barbell-drag-curl-front.gif',
    technique: [
      'Arrastra la barra pegada al cuerpo mientras subes',
      'Codos van hacia atrás en lugar de quedarse fijos',
      'Mayor activación de la cabeza larga del bíceps',
      'Movimiento único que elimina la tensión del hombro'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: '21s-curl',
    name: 'Curl 21s',
    muscleGroup: 'biceps',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 21,
    image: URL_STORAGE + 'male-barbell-21s-curl-front.gif',
    technique: [
      '7 repeticiones de la mitad inferior (abajo a medio)',
      '7 repeticiones de la mitad superior (medio a arriba)',
      '7 repeticiones completas',
      'Técnica avanzada para congestión muscular intensa'
    ],
    recommendedSets: '2-3 series',
    recommendedReps: '21 repeticiones (7+7+7)',
    restTime: '90-120 segundos'
  },
  {
    id: 'waiter-curl',
    name: 'Waiter Curl',
    muscleGroup: 'biceps',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-waiter-curl-front.gif',
    technique: [
      'Sostén una mancuerna vertical con ambas manos bajo el disco superior',
      'Como si llevaras una bandeja de camarero',
      'Curl manteniendo la mancuerna vertical',
      'Gran activación del pico del bíceps'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'cross-body-hammer-curl',
    name: 'Curl Martillo Cruzado',
    muscleGroup: 'biceps',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-cross-body-hammer-curl-front.gif',
    technique: [
      'Agarre martillo, lleva la mancuerna hacia el hombro opuesto',
      'Cruza el cuerpo en diagonal',
      'Mayor activación del braquial',
      'Alterna los brazos'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 por brazo',
    restTime: '60 segundos'
  },
  {
    id: 'ez-bar-curl',
    name: 'Curl con Barra Z',
    muscleGroup: 'biceps',
    equipment: 'Barra Z',
    defaultSets: 4,
    defaultReps: 10,
    image: URL_STORAGE + 'male-ez-bar-curl-front.gif',
    technique: [
      'Agarre en la parte angulada de la barra Z',
      'Menos estrés en las muñecas que la barra recta',
      'Curl completo con contracción en la parte superior',
      'Excelente para volumen de bíceps'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '90 segundos'
  },
  {
    id: 'cable-rope-curl',
    name: 'Curl con Cuerda en Polea',
    muscleGroup: 'biceps',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-cable-rope-curl-front.gif',
    technique: [
      'Usa cuerda en polea baja',
      'Agarre neutral, separa las manos al subir',
      'Tensión constante durante todo el movimiento',
      'Excelente para el pico del bíceps'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'single-arm-cable-curl',
    name: 'Curl Unilateral en Polea',
    muscleGroup: 'biceps',
    equipment: 'Poleas',
    description: 'Permite enfocarse en cada bíceps independientemente',
    defaultSets: 3,
    defaultReps: 12,
    technique: [
      'Usa una manija en polea baja',
      'De pie de lado a la máquina',
      'Curl completo con contracción máxima',
      'Corrige desbalances entre brazos'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 por brazo',
    restTime: '45-60 segundos'
  },
  {
    id: 'seated-cable-curl',
    name: 'Curl Sentado en Polea',
    muscleGroup: 'biceps',
    equipment: 'Poleas',
    description: 'Elimina el impulso del cuerpo para aislamiento total',
    defaultSets: 3,
    defaultReps: 15,
    technique: [
      'Siéntate en banco frente a polea baja',
      'Elimina completamente el impulso del cuerpo',
      'Tensión constante en el bíceps',
      'Ideal para finalizar el entrenamiento'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'chin-up-biceps',
    name: 'Dominadas Supinas (Bíceps)',
    muscleGroup: 'biceps',
    equipment: 'Peso corporal',
    description: 'Ejercicio compuesto que trabaja intensamente los bíceps',
    defaultSets: 3,
    defaultReps: 10,
    technique: [
      'Agarre supino (palmas hacia ti), ancho de hombros',
      'Tira hasta que la barbilla supere la barra',
      'Mayor activación de bíceps que dominadas pronadas',
      'Excelente para fuerza y masa'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '6-12 repeticiones',
    restTime: '2-3 minutos'
  },
  {
    id: 'kickback-tricep',
    name: 'Patada de Tríceps',
    muscleGroup: 'triceps',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-tricep-kickback-side.gif',
    technique: [
      'Inclínate hacia adelante, codo pegado al costado',
      'Extiende el antebrazo hacia atrás',
      'Contrae el tríceps en la extensión completa',
      'Baja con control sin impulso'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 por brazo',
    restTime: '45-60 segundos'
  },
  {
    id: 'diamond-push-up-tricep',
    name: 'Flexiones Diamante para Tríceps',
    muscleGroup: 'triceps',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-bodyweight-diamond-push-up-tricep-front.gif',
    technique: [
      'Manos juntas formando un diamante bajo el pecho',
      'Codos pegados al cuerpo',
      'Baja hasta que el pecho casi toque las manos',
      'Uno de los mejores ejercicios de tríceps con peso corporal'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'overhead-dumbbell-extension',
    name: 'Extensión con Mancuerna sobre Cabeza',
    muscleGroup: 'triceps',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-overhead-extension-front.gif',
    technique: [
      'Sostén una mancuerna con ambas manos sobre la cabeza',
      'Baja detrás de la cabeza flexionando solo los codos',
      'Extiende de vuelta arriba',
      'Gran estiramiento de la cabeza larga del tríceps'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'cable-rope-overhead-extension',
    name: 'Extensión con Cuerda sobre Cabeza',
    muscleGroup: 'triceps',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-rope-overhead-extension-front.gif',
    technique: [
      'Polea baja, cuerda con ambas manos',
      'De espaldas a la polea, da un paso adelante',
      'Extiende los brazos sobre la cabeza',
      'Tensión constante en todo el rango'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'bench-dips',
    name: 'Fondos en Banco',
    muscleGroup: 'triceps',
    equipment: 'Banco',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-bodyweight-bench-dip-side.gif',
    technique: [
      'Manos en el borde del banco detrás de ti',
      'Piernas extendidas o flexionadas según nivel',
      'Baja hasta que codos formen 90 grados',
      'Empuja de vuelta arriba'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'tate-press',
    name: 'Tate Press',
    muscleGroup: 'triceps',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-tate-press-front.gif',
    technique: [
      'Acostado en banco, mancuernas con agarre neutral',
      'Baja los codos hacia los lados manteniendo mancuernas juntas',
      'Extiende de vuelta arriba',
      'Movimiento único para aislar tríceps'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'jm-press',
    name: 'JM Press',
    muscleGroup: 'triceps',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 10,
    image: URL_STORAGE + 'male-barbell-jm-press-side.gif',
    technique: [
      'Acostado en banco, barra sobre el pecho',
      'Híbrido entre press de banca y skull crusher',
      'Baja hacia la garganta/cuello con codos hacia adentro',
      'Excelente para fuerza de tríceps'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-12 repeticiones',
    restTime: '90 segundos'
  },
  {
    id: 'cable-tricep-extension-single',
    name: 'Extensión de Tríceps Unilateral en Polea',
    muscleGroup: 'triceps',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-single-arm-tricep-extension-front.gif',
    technique: [
      'Polea alta, agarre con una mano',
      'Extiende el brazo completamente hacia abajo',
      'Corrige desbalances entre brazos',
      'Mayor rango de movimiento que bilateral'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 por brazo',
    restTime: '45-60 segundos'
  },
  {
    id: 'reverse-grip-pushdown',
    name: 'Extensión en Polea con Agarre Supino',
    muscleGroup: 'triceps',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-reverse-grip-pushdown-front.gif',
    technique: [
      'Polea alta, agarre supino (palmas hacia arriba)',
      'Empuja hacia abajo manteniendo codos fijos',
      'Mayor activación de la cabeza medial del tríceps',
      'Excelente para definición'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'cable-lying-tricep-extension',
    name: 'Extensión Acostado en Polea',
    muscleGroup: 'triceps',
    equipment: 'Poleas',
    description: 'Mayor rango de movimiento que skull crushers tradicionales',
    defaultSets: 3,
    defaultReps: 12,
    technique: [
      'Acuéstate en banco frente a polea baja',
      'Agarra la barra con brazos extendidos hacia arriba',
      'Baja la barra detrás de la cabeza flexionando codos',
      'Extiende de vuelta manteniendo codos fijos'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'incline-cable-tricep-extension',
    name: 'Extensión Inclinado en Polea',
    muscleGroup: 'triceps',
    equipment: 'Poleas',
    description: 'Ajusta el ángulo para enfatizar diferentes cabezas del tríceps',
    defaultSets: 3,
    defaultReps: 12,
    technique: [
      'Siéntate en banco inclinado frente a polea baja',
      'Agarra la cuerda con ambas manos detrás de la cabeza',
      'Extiende los brazos hacia arriba',
      'Ángulo ajustable para variar el énfasis'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'cable-high-cross-tricep-extension',
    name: 'Extensión Cruzada Alta en Polea',
    muscleGroup: 'triceps',
    equipment: 'Poleas',
    description: 'Híbrido entre pushdown y kickback con gran contracción',
    defaultSets: 3,
    defaultReps: 12,
    technique: [
      'Coloca ambas poleas en posición alta',
      'Agarra el cable derecho con mano izquierda y viceversa',
      'Extiende los brazos cruzando al frente',
      'Contracción intensa en la posición final'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'cable-concentration-tricep-extension',
    name: 'Extensión Concentrada en Polea',
    muscleGroup: 'triceps',
    equipment: 'Poleas',
    description: 'Aislamiento total del tríceps con tensión constante',
    defaultSets: 3,
    defaultReps: 12,
    technique: [
      'Siéntate en banco, agarra manija de polea baja',
      'Apoya el codo en la parte interna del muslo',
      'Extiende el brazo completamente',
      'Enfoque total en el tríceps trabajado'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 por brazo',
    restTime: '45-60 segundos'
  },

  // ============================
  // ANTEBRAZOS
  // ============================
  {
    id: 'wrist-curl',
    name: 'Curl de Muñeca',
    muscleGroup: 'antebrazos',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 20,
    image: URL_STORAGE + 'male-dumbbell-wrist-curl-front.gif',
    technique: [
      'Antebrazos apoyados en los muslos o en un banco',
      'Flexiona las muñecas hacia arriba',
      'Trabaja los flexores del antebrazo',
      'Movimiento controlado, sin impulso'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-25 repeticiones',
    restTime: '30-45 segundos'
  },
  {
    id: 'reverse-wrist-curl',
    name: 'Curl de Muñeca Inverso',
    muscleGroup: 'antebrazos',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 20,
    image: URL_STORAGE + 'male-dumbbell-reverse-wrist-curl-front.gif',
    technique: [
      'Antebrazos apoyados, palmas hacia abajo',
      'Extiende las muñecas hacia arriba',
      'Trabaja los extensores del antebrazo',
      'Usa menos peso que el curl de muñeca normal'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-25 repeticiones',
    restTime: '30-45 segundos'
  },
  {
    id: 'barbell-wrist-curl',
    name: 'Curl de Muñeca con Barra',
    muscleGroup: 'antebrazos',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 20,
    image: URL_STORAGE + 'male-barbell-wrist-curl-front.gif',
    technique: [
      'Antebrazos en un banco, barra en las manos',
      'Deja que la barra ruede hasta los dedos',
      'Enrolla de vuelta y flexiona las muñecas',
      'Mayor rango de movimiento que con mancuernas'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-25 repeticiones',
    restTime: '45 segundos'
  },
  {
    id: 'barbell-reverse-wrist-curl',
    name: 'Curl de Muñeca Inverso con Barra',
    muscleGroup: 'antebrazos',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 20,
    image: URL_STORAGE + 'male-barbell-reverse-wrist-curl-front.gif',
    technique: [
      'Antebrazos en un banco, palmas hacia abajo',
      'Extiende las muñecas hacia arriba',
      'Trabaja extensores del antebrazo',
      'Previene desequilibrios musculares'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-25 repeticiones',
    restTime: '45 segundos'
  },
  {
    id: 'farmers-walk',
    name: 'Caminata de Granjero',
    muscleGroup: 'antebrazos',
    equipment: 'Mancuernas',
    defaultSets: 4,
    defaultReps: 1,
    image: URL_STORAGE + 'male-dumbbell-farmers-walk-side.gif',
    technique: [
      'Carga pesada en cada mano',
      'Camina con postura erguida',
      'Aprieta fuerte las mancuernas',
      'Excelente para fuerza de agarre y antebrazos'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '30-60 segundos o 20-40 metros',
    restTime: '90 segundos'
  },
  {
    id: 'plate-pinch',
    name: 'Pinza con Discos',
    muscleGroup: 'antebrazos',
    equipment: 'Discos',
    defaultSets: 3,
    defaultReps: 1,
    image: URL_STORAGE + 'male-plate-pinch-hold-side.gif',
    technique: [
      'Sostén uno o dos discos con los dedos',
      'Pinza entre pulgar y dedos',
      'Mantén el tiempo que puedas',
      'Desarrolla fuerza de agarre específica'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '20-45 segundos por mano',
    restTime: '60 segundos'
  },
  {
    id: 'dead-hang',
    name: 'Colgarse de la Barra',
    muscleGroup: 'antebrazos',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 1,
    image: URL_STORAGE + 'male-bodyweight-dead-hang-back.gif',
    technique: [
      'Cuélgate de una barra con brazos extendidos',
      'Relaja los hombros y respira',
      'Mantén el tiempo que puedas',
      'Excelente para fuerza de agarre y descompresión espinal'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '30-60 segundos',
    restTime: '90 segundos'
  },
  {
    id: 'towel-pull-ups',
    name: 'Dominadas con Toalla',
    muscleGroup: 'antebrazos',
    equipment: 'Toalla',
    defaultSets: 3,
    defaultReps: 8,
    image: URL_STORAGE + 'male-towel-pull-up-back.gif',
    technique: [
      'Cuelga una toalla sobre la barra',
      'Agarra ambos extremos de la toalla',
      'Haz dominadas sosteniendo la toalla',
      'Desafío extremo para antebrazos y agarre'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '5-10 repeticiones',
    restTime: '2-3 minutos'
  },
  {
    id: 'hammer-curl-forearm',
    name: 'Curl Martillo (Énfasis Antebrazo)',
    muscleGroup: 'antebrazos',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-dumbbell-hammer-curl-forearm-front.gif',
    technique: [
      'Agarre neutral durante todo el movimiento',
      'Enfoca en apretar fuerte las mancuernas',
      'Trabaja braquiorradial intensamente',
      'Movimiento lento y controlado'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'reverse-curl-forearm',
    name: 'Curl Inverso (Énfasis Antebrazo)',
    muscleGroup: 'antebrazos',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-barbell-reverse-curl-forearm-front.gif',
    technique: [
      'Agarre prono (palmas hacia abajo)',
      'Curl completo enfocando en antebrazos',
      'Trabaja braquiorradial y extensores',
      'Excelente para equilibrio muscular'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'wrist-roller',
    name: 'Rodillo de Muñeca',
    muscleGroup: 'antebrazos',
    equipment: 'Rodillo de muñeca',
    defaultSets: 3,
    defaultReps: 3,
    image: URL_STORAGE + 'male-wrist-roller-front.gif',
    technique: [
      'Sostén el rodillo con brazos extendidos',
      'Enrolla la cuerda subiendo el peso',
      'Luego desenrolla bajando con control',
      'Quema intensa en antebrazos'
    ],
    recommendedSets: '2-3 series',
    recommendedReps: '2-3 subidas y bajadas',
    restTime: '90-120 segundos'
  },
  {
    id: 'fat-grip-curl',
    name: 'Curl con Agarre Grueso',
    muscleGroup: 'antebrazos',
    equipment: 'Mancuernas + Fat Grips',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-dumbbell-fat-grip-curl-front.gif',
    technique: [
      'Usa adaptadores de agarre grueso o toalla',
      'Curl normal pero con agarre más ancho',
      'Mayor activación de antebrazos',
      'Desarrolla fuerza de agarre funcional'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'finger-curls',
    name: 'Curl de Dedos',
    muscleGroup: 'antebrazos',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 20,
    image: URL_STORAGE + 'male-barbell-finger-curl-front.gif',
    technique: [
      'Barra en las manos con antebrazos apoyados',
      'Deja que la barra ruede hasta las puntas de los dedos',
      'Enrolla de vuelta con los dedos',
      'Fortalece dedos y agarre'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-25 repeticiones',
    restTime: '45 segundos'
  },
  {
    id: 'gripper-squeeze',
    name: 'Apretón con Gripper',
    muscleGroup: 'antebrazos',
    equipment: 'Hand gripper',
    defaultSets: 4,
    defaultReps: 15,
    image: URL_STORAGE + 'male-hand-gripper-squeeze-side.gif',
    technique: [
      'Usa un gripper de mano ajustable',
      'Aprieta completamente cerrando el gripper',
      'Mantén 1-2 segundos',
      'Suelta con control'
    ],
    recommendedSets: '3-5 series',
    recommendedReps: '10-20 repeticiones por mano',
    restTime: '45-60 segundos'
  },
  {
    id: 'radial-deviation',
    name: 'Desviación Radial',
    muscleGroup: 'antebrazos',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-dumbbell-radial-deviation-side.gif',
    technique: [
      'Sostén mancuerna vertical con pulgar arriba',
      'Antebrazo apoyado, mueve la muñeca hacia el pulgar',
      'Trabaja los músculos laterales del antebrazo',
      'Movimiento pequeño pero efectivo'
    ],
    recommendedSets: '2-3 series',
    recommendedReps: '12-20 repeticiones por lado',
    restTime: '30-45 segundos'
  },

  // ============================
  // TRAPECIO
  // ============================
  {
    id: 'barbell-shrugs',
    name: 'Encogimientos con Barra',
    muscleGroup: 'trapecio',
    equipment: 'Barra',
    defaultSets: 4,
    defaultReps: 15,
    image: URL_STORAGE + 'male-barbell-shrugs-front.gif',
    technique: [
      'Barra colgando frente a ti con brazos extendidos',
      'Eleva los hombros hacia las orejas',
      'Mantén 1-2 segundos arriba apretando los trapecios',
      'Baja lentamente sin rebotar',
      'No uses impulso ni gires los hombros'
    ],
    recommendedSets: '3-5 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'dumbbell-shrugs-trapezius',
    name: 'Encogimientos con Mancuernas',
    muscleGroup: 'trapecio',
    equipment: 'Mancuernas',
    defaultSets: 4,
    defaultReps: 15,
    image: URL_STORAGE + 'male-dumbbell-shrugs-front.gif',
    technique: [
      'Mancuernas a los lados del cuerpo',
      'Eleva los hombros hacia las orejas',
      'Mantén 1-2 segundos arriba apretando los trapecios',
      'Baja lentamente sin rebotar',
      'Mayor rango de movimiento que con barra'
    ],
    recommendedSets: '3-5 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'trap-bar-shrugs',
    name: 'Encogimientos con Barra Hexagonal',
    muscleGroup: 'trapecio',
    equipment: 'Barra hexagonal',
    defaultSets: 4,
    defaultReps: 12,
    image: URL_STORAGE + 'male-trap-bar-shrugs-front.gif',
    technique: [
      'Párate dentro de la barra hexagonal',
      'Agarre neutral a los lados',
      'Permite usar cargas muy pesadas de forma segura',
      'Menos estrés en la espalda baja que la barra recta'
    ],
    recommendedSets: '3-5 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'cable-shrugs',
    name: 'Encogimientos en Polea',
    muscleGroup: 'trapecio',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-cable-shrugs-front.gif',
    technique: [
      'Polea baja con barra recta o cuerda',
      'Tensión constante durante todo el movimiento',
      'Eleva los hombros contrayendo los trapecios',
      'Excelente para el pico de contracción'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'behind-back-shrugs',
    name: 'Encogimientos por Detrás',
    muscleGroup: 'trapecio',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-barbell-behind-back-shrugs-back.gif',
    technique: [
      'Barra detrás del cuerpo (como en peso muerto rumano)',
      'Eleva los hombros hacia arriba',
      'Diferente ángulo de activación del trapecio',
      'Usa menos peso que los encogimientos frontales'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-18 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'upright-row-trap',
    name: 'Remo al Cuello (Énfasis Trapecio)',
    muscleGroup: 'trapecio',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-barbell-upright-row-trap-front.gif',
    technique: [
      'Agarre estrecho o medio en la barra',
      'Tira de la barra hacia la barbilla',
      'Los codos van más altos que las manos',
      'Trabaja trapecio superior y deltoides',
      'Usa agarre más ancho si sientes molestias en hombros'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'farmer-walk-trap',
    name: 'Caminata de Granjero (Énfasis Trapecio)',
    muscleGroup: 'trapecio',
    equipment: 'Mancuernas',
    defaultSets: 4,
    defaultReps: 1,
    image: URL_STORAGE + 'male-dumbbell-farmers-walk-trap-side.gif',
    technique: [
      'Carga muy pesada en cada mano',
      'Camina con postura erguida, hombros hacia atrás',
      'Los trapecios trabajan isométricamente para estabilizar',
      'Excelente para fuerza funcional del trapecio'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '30-60 segundos o 20-40 metros',
    restTime: '90-120 segundos'
  },
  {
    id: 'overhead-shrugs',
    name: 'Encogimientos sobre Cabeza',
    muscleGroup: 'trapecio',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-barbell-overhead-shrugs-front.gif',
    technique: [
      'Barra sobre la cabeza con brazos bloqueados',
      'Empuja la barra hacia arriba encogiendo los hombros',
      'Trabaja el trapecio inferior y medio',
      'Excelente para salud del hombro'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'snatch-grip-high-pull',
    name: 'Jalón Alto con Agarre Arrancada',
    muscleGroup: 'trapecio',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 8,
    image: URL_STORAGE + 'male-barbell-snatch-grip-high-pull-front.gif',
    technique: [
      'Agarre muy amplio en la barra',
      'Movimiento explosivo desde las caderas',
      'Tira de la barra hacia arriba con los codos altos',
      'Desarrolla potencia y fuerza del trapecio'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '6-10 repeticiones',
    restTime: '2-3 minutos'
  },
  {
    id: 'rack-pulls-trap',
    name: 'Rack Pulls (Énfasis Trapecio)',
    muscleGroup: 'trapecio',
    equipment: 'Barra',
    defaultSets: 4,
    defaultReps: 6,
    image: URL_STORAGE + 'male-barbell-rack-pull-trap-side.gif',
    technique: [
      'Barra en los seguros a la altura de las rodillas',
      'Peso muerto parcial con énfasis en trapecio superior',
      'Encoge los hombros al final del movimiento',
      'Permite usar cargas muy pesadas'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '4-8 repeticiones',
    restTime: '2-3 minutos'
  },
  {
    id: 'incline-shrugs',
    name: 'Encogimientos en Banco Inclinado',
    muscleGroup: 'trapecio',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-dumbbell-incline-shrugs-front.gif',
    technique: [
      'Acostado boca abajo en banco inclinado a 45 grados',
      'Mancuernas colgando hacia el suelo',
      'Encoge los hombros hacia las orejas',
      'Trabaja el trapecio medio e inferior'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '60 segundos'
  },
  {
    id: 'cable-upright-row',
    name: 'Remo al Cuello en Polea',
    muscleGroup: 'trapecio',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-upright-row-front.gif',
    technique: [
      'Polea baja con barra recta o cuerda',
      'Tira hacia la barbilla con codos altos',
      'Tensión constante durante todo el movimiento',
      'Más suave para las articulaciones que con barra libre'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 repeticiones',
    restTime: '60-90 segundos'
  },

  // ============================
  // CUELLO
  // ============================
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
  },

  // ============================
  // CORE - EJERCICIOS ADICIONALES
  // ============================
  {
    id: 'cable-crunch',
    name: 'Crunch en Polea',
    muscleGroup: 'core',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-cable-crunch-front.gif',
    technique: [
      'Arrodíllate frente a la polea alta con cuerda',
      'Flexiona el torso llevando los codos a las rodillas',
      'Mantén las caderas fijas, solo mueve el torso',
      'Permite agregar resistencia progresiva al core'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'pallof-press',
    name: 'Pallof Press',
    muscleGroup: 'core',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-cable-pallof-press-front.gif',
    technique: [
      'De pie lateral a la polea, agarre con ambas manos',
      'Extiende los brazos al frente resistiendo la rotación',
      'Mantén las caderas y hombros estables',
      'Excelente ejercicio anti-rotación para el core'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 por lado',
    restTime: '45-60 segundos'
  },
  {
    id: 'hanging-leg-raise',
    name: 'Elevación de Piernas Colgado',
    muscleGroup: 'core',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-bodyweight-hanging-leg-raise-side.gif',
    technique: [
      'Cuélgate de una barra con brazos extendidos',
      'Eleva las piernas rectas hasta 90 grados o más',
      'Evita el balanceo controlando el movimiento',
      'Más avanzado que la elevación de rodillas'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '8-15 repeticiones',
    restTime: '60-90 segundos'
  },
  {
    id: 'decline-crunch',
    name: 'Crunch Declinado',
    muscleGroup: 'core',
    equipment: 'Banco declinado',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-bodyweight-decline-crunch-side.gif',
    technique: [
      'Piernas sujetas en el banco declinado',
      'Sube el torso contrayendo los abdominales',
      'Mayor rango de movimiento que el crunch en el suelo',
      'Puedes agregar peso con disco para más dificultad'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'dragon-flag',
    name: 'Dragon Flag',
    muscleGroup: 'core',
    equipment: 'Banco',
    defaultSets: 3,
    defaultReps: 8,
    image: URL_STORAGE + 'male-bodyweight-dragon-flag-side.gif',
    technique: [
      'Acuéstate en un banco, agárrate del borde detrás de la cabeza',
      'Eleva el cuerpo recto como una tabla',
      'Baja lentamente manteniendo el cuerpo rígido',
      'Ejercicio avanzado que trabaja todo el core'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '5-10 repeticiones',
    restTime: '90-120 segundos'
  },
  {
    id: 'v-ups',
    name: 'V-ups',
    muscleGroup: 'core',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 15,
    image: URL_STORAGE + 'male-bodyweight-v-up-side.gif',
    technique: [
      'Acuéstate con brazos y piernas extendidos',
      'Sube simultáneamente torso y piernas formando una V',
      'Toca los pies con las manos en la parte superior',
      'Baja con control sin tocar completamente el suelo'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '12-20 repeticiones',
    restTime: '45-60 segundos'
  },
  {
    id: 'suitcase-carry',
    name: 'Caminata con Maleta',
    muscleGroup: 'core',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 1,
    image: URL_STORAGE + 'male-dumbbell-suitcase-carry-front.gif',
    technique: [
      'Carga una mancuerna pesada en una mano',
      'Camina recto sin inclinarte hacia el lado cargado',
      'Trabaja oblicuos y estabilización anti-lateral',
      'Mantén los hombros nivelados'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '20-30 metros por lado',
    restTime: '60 segundos'
  },
  {
    id: 'landmine-rotation',
    name: 'Rotación con Landmine',
    muscleGroup: 'core',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 12,
    image: URL_STORAGE + 'male-barbell-landmine-rotation-front.gif',
    technique: [
      'Barra anclada, sostén el extremo con ambas manos',
      'Rota el torso llevando la barra de lado a lado',
      'Mantén los brazos extendidos',
      'Trabaja oblicuos y rotación funcional del core'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '10-15 por lado',
    restTime: '60 segundos'
  },
  {
    id: 'toe-touches',
    name: 'Toe Touches',
    muscleGroup: 'core',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 20,
    image: URL_STORAGE + 'male-bodyweight-toe-touch-side.gif',
    technique: [
      'Acuéstate boca arriba, piernas rectas hacia el techo',
      'Sube el torso intentando tocar los dedos de los pies',
      'Contrae los abdominales superiores',
      'Baja con control sin dejar caer el torso'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-25 repeticiones',
    restTime: '45 segundos'
  },

  // ============================
  // GEMELOS - EJERCICIOS ADICIONALES
  // ============================
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
  {
    id: 'box-calf-raise',
    name: 'Gemelos en Cajón',
    muscleGroup: 'gemelos',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 20,
    image: URL_STORAGE + 'male-bodyweight-box-calf-raise-side.gif',
    technique: [
      'De pie en el borde de un cajón pliométrico',
      'Rango de movimiento amplio por la altura del cajón',
      'Sube y baja controlando cada repetición',
      'Agrega mancuernas para mayor intensidad'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-25 repeticiones',
    restTime: '30-45 segundos'
  },
  {
    id: 'squat-hold-calf-raise',
    name: 'Gemelos en Posición de Sentadilla',
    muscleGroup: 'gemelos',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 15,
    technique: [
      'Mantén una posición de sentadilla (muslos paralelos al suelo)',
      'Eleva los talones mientras mantienes la posición de sentadilla',
      'Trabaja gemelos bajo tensión isométrica de piernas',
      'Excelente para resistencia y estabilidad'
    ],
    recommendedSets: '2-3 series',
    recommendedReps: '15-20 repeticiones',
    restTime: '60 segundos'
  },

  // ============================
  // CARDIO
  // ============================
  {
    id: 'treadmill-running',
    name: 'Correr en Trotadora',
    muscleGroup: 'cardio',
    equipment: 'Trotadora',
    defaultSets: 1,
    defaultReps: 1,
    image: URL_STORAGE + 'male-cardio-treadmill-running-side.gif',
    description: 'Ejercicio cardiovascular de alto impacto en cinta de correr',
    technique: [
      'Mantén una postura erguida con mirada al frente',
      'Aterriza con la parte media del pie',
      'Brazos doblados a 90 grados balanceándose naturalmente',
      'Ajusta velocidad e inclinación según tu nivel',
      'Hidrátate durante sesiones largas'
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
    image: URL_STORAGE + 'male-cardio-treadmill-walking-side.gif',
    description: 'Ejercicio cardiovascular de bajo impacto ideal para principiantes',
    technique: [
      'Mantén la espalda recta y hombros relajados',
      'Paso natural, talón primero',
      'Aumenta la inclinación para mayor intensidad',
      'Ideal para calentamiento o recuperación activa',
      'Perfecto para quemar calorías sin impacto en articulaciones'
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
    image: URL_STORAGE + 'male-cardio-treadmill-incline-walk-side.gif',
    description: 'Caminata con inclinación para mayor activación de glúteos y piernas',
    technique: [
      'Ajusta la inclinación entre 10-15%',
      'Mantén el torso erguido, no te inclines hacia adelante',
      'Paso firme y controlado',
      'Excelente para glúteos e isquiotibiales',
      'Quema más calorías que la caminata plana'
    ],
    recommendedSets: '1 sesión',
    recommendedReps: '20-40 minutos',
    restTime: 'N/A'
  },
  {
    id: 'treadmill-hiit',
    name: 'HIIT en Trotadora',
    muscleGroup: 'cardio',
    equipment: 'Trotadora',
    defaultSets: 8,
    defaultReps: 1,
    image: URL_STORAGE + 'male-cardio-treadmill-hiit-side.gif',
    description: 'Entrenamiento de intervalos de alta intensidad',
    technique: [
      'Alterna entre sprints de 30-60 segundos y recuperación activa',
      'Sprint: 80-90% de tu velocidad máxima',
      'Recuperación: caminar o trotar ligero 1-2 minutos',
      'Excelente para quemar grasa y mejorar resistencia',
      'Sesiones cortas pero muy efectivas'
    ],
    recommendedSets: '6-10 intervalos',
    recommendedReps: '30-60 seg sprint + 1-2 min recuperación',
    restTime: 'Incluido en intervalos'
  },
  {
    id: 'stationary-bike',
    name: 'Bicicleta Estática',
    muscleGroup: 'cardio',
    equipment: 'Bicicleta estática',
    defaultSets: 1,
    defaultReps: 1,
    image: URL_STORAGE + 'male-cardio-stationary-bike-side.gif',
    description: 'Ejercicio cardiovascular de bajo impacto para piernas',
    technique: [
      'Ajusta el asiento a la altura correcta (rodilla ligeramente flexionada)',
      'Mantén la espalda recta y core activado',
      'Pedalea con ritmo constante',
      'Ajusta la resistencia según tu nivel',
      'Bajo impacto en rodillas y articulaciones'
    ],
    recommendedSets: '1 sesión',
    recommendedReps: '20-45 minutos',
    restTime: 'N/A'
  },
  {
    id: 'spin-bike',
    name: 'Bicicleta de Spinning',
    muscleGroup: 'cardio',
    equipment: 'Bicicleta de spinning',
    defaultSets: 1,
    defaultReps: 1,
    image: URL_STORAGE + 'male-cardio-spin-bike-side.gif',
    description: 'Ciclismo indoor de alta intensidad',
    technique: [
      'Posición aerodinámica con manos en el manubrio',
      'Alterna entre sentado y de pie',
      'Ajusta resistencia para simular subidas',
      'Mantén cadencia entre 80-110 RPM',
      'Excelente para resistencia y quema de calorías'
    ],
    recommendedSets: '1 sesión',
    recommendedReps: '30-60 minutos',
    restTime: 'N/A'
  },
  {
    id: 'recumbent-bike',
    name: 'Bicicleta Reclinada',
    muscleGroup: 'cardio',
    equipment: 'Bicicleta reclinada',
    defaultSets: 1,
    defaultReps: 1,
    image: URL_STORAGE + 'male-cardio-recumbent-bike-side.gif',
    description: 'Bicicleta con respaldo, ideal para personas con problemas de espalda',
    technique: [
      'Espalda completamente apoyada en el respaldo',
      'Piernas extendidas al frente',
      'Menor estrés en espalda baja que bicicleta vertical',
      'Ideal para rehabilitación o personas mayores',
      'Mantén un ritmo constante y cómodo'
    ],
    recommendedSets: '1 sesión',
    recommendedReps: '25-50 minutos',
    restTime: 'N/A'
  },
  {
    id: 'elliptical',
    name: 'Elíptica',
    muscleGroup: 'cardio',
    equipment: 'Elíptica',
    defaultSets: 1,
    defaultReps: 1,
    image: URL_STORAGE + 'male-cardio-elliptical-front.gif',
    description: 'Ejercicio cardiovascular de cuerpo completo sin impacto',
    technique: [
      'Mantén el torso erguido y core activado',
      'Empuja y tira de las manijas para trabajar brazos',
      'Movimiento fluido y continuo',
      'Cero impacto en articulaciones',
      'Trabaja piernas, glúteos y brazos simultáneamente'
    ],
    recommendedSets: '1 sesión',
    recommendedReps: '20-45 minutos',
    restTime: 'N/A'
  },
  {
    id: 'elliptical-reverse',
    name: 'Elíptica Reversa',
    muscleGroup: 'cardio',
    equipment: 'Elíptica',
    defaultSets: 1,
    defaultReps: 1,
    image: URL_STORAGE + 'male-cardio-elliptical-reverse-front.gif',
    description: 'Movimiento inverso en elíptica para mayor activación de glúteos',
    technique: [
      'Pedalea hacia atrás en la elíptica',
      'Mayor activación de glúteos e isquiotibiales',
      'Mantén postura erguida',
      'Agarra las manijas fijas para equilibrio',
      'Alterna con movimiento hacia adelante'
    ],
    recommendedSets: '1 sesión',
    recommendedReps: '15-30 minutos',
    restTime: 'N/A'
  },
  {
    id: 'stair-climber',
    name: 'Escaladora',
    muscleGroup: 'cardio',
    equipment: 'Escaladora',
    defaultSets: 1,
    defaultReps: 1,
    image: URL_STORAGE + 'male-cardio-stair-climber-side.gif',
    description: 'Simula subir escaleras, excelente para piernas y glúteos',
    technique: [
      'Mantén el torso erguido, no te inclines sobre la consola',
      'Paso completo en cada escalón',
      'No te apoyes demasiado en las manijas',
      'Gran activación de glúteos y cuádriceps',
      'Quema muchas calorías en poco tiempo'
    ],
    recommendedSets: '1 sesión',
    recommendedReps: '15-30 minutos',
    restTime: 'N/A'
  },
  {
    id: 'stairmaster',
    name: 'StairMaster',
    muscleGroup: 'cardio',
    equipment: 'StairMaster',
    defaultSets: 1,
    defaultReps: 1,
    image: URL_STORAGE + 'male-cardio-stairmaster-side.gif',
    description: 'Escaleras rotativas continuas para cardio intenso',
    technique: [
      'Postura erguida, manos ligeramente en las barandas',
      'Paso natural como si subieras escaleras reales',
      'Ajusta la velocidad según tu nivel',
      'Uno de los mejores ejercicios para glúteos',
      'Mantén el core activado durante todo el ejercicio'
    ],
    recommendedSets: '1 sesión',
    recommendedReps: '10-25 minutos',
    restTime: 'N/A'
  },
  {
    id: 'rowing-machine',
    name: 'Remo en Máquina',
    muscleGroup: 'cardio',
    equipment: 'Máquina de remo',
    defaultSets: 1,
    defaultReps: 1,
    image: URL_STORAGE + 'male-cardio-rowing-machine-side.gif',
    description: 'Ejercicio cardiovascular de cuerpo completo',
    technique: [
      'Secuencia: piernas, core, brazos al tirar',
      'Secuencia inversa al regresar: brazos, core, piernas',
      'Mantén la espalda recta durante todo el movimiento',
      'Trabaja 85% de los músculos del cuerpo',
      'Excelente para cardio y fuerza simultáneamente'
    ],
    recommendedSets: '1 sesión',
    recommendedReps: '15-30 minutos',
    restTime: 'N/A'
  },
  {
    id: 'rowing-intervals',
    name: 'Remo por Intervalos',
    muscleGroup: 'cardio',
    equipment: 'Máquina de remo',
    defaultSets: 6,
    defaultReps: 1,
    image: URL_STORAGE + 'male-cardio-rowing-intervals-side.gif',
    description: 'HIIT en máquina de remo para máxima quema de calorías',
    technique: [
      'Alterna entre remadas intensas y recuperación',
      'Intenso: 30-60 segundos a máxima potencia',
      'Recuperación: 1-2 minutos a ritmo suave',
      'Mantén técnica correcta incluso en intervalos intensos',
      'Excelente para mejorar VO2 max'
    ],
    recommendedSets: '6-10 intervalos',
    recommendedReps: '30-60 seg intenso + 1-2 min recuperación',
    restTime: 'Incluido en intervalos'
  },
  {
    id: 'assault-bike',
    name: 'Assault Bike',
    muscleGroup: 'cardio',
    equipment: 'Assault bike',
    defaultSets: 1,
    defaultReps: 1,
    image: URL_STORAGE + 'male-cardio-assault-bike-side.gif',
    description: 'Bicicleta de aire para cardio de alta intensidad',
    technique: [
      'Empuja y tira de las manijas mientras pedaleas',
      'Cuanto más fuerte, mayor resistencia',
      'Trabaja todo el cuerpo simultáneamente',
      'Ideal para HIIT y acondicionamiento',
      'Muy demandante, comienza con intervalos cortos'
    ],
    recommendedSets: '1 sesión',
    recommendedReps: '10-20 minutos',
    restTime: 'N/A'
  },
  {
    id: 'ski-erg',
    name: 'Ski Erg',
    muscleGroup: 'cardio',
    equipment: 'Ski erg',
    defaultSets: 1,
    defaultReps: 1,
    image: URL_STORAGE + 'male-cardio-ski-erg-front.gif',
    description: 'Simula esquí de fondo, excelente para core y brazos',
    technique: [
      'Tira de las cuerdas hacia abajo con fuerza',
      'Usa core y brazos, no solo los brazos',
      'Inclínate ligeramente hacia adelante',
      'Movimiento explosivo hacia abajo, controlado hacia arriba',
      'Gran trabajo de core y parte superior del cuerpo'
    ],
    recommendedSets: '1 sesión',
    recommendedReps: '10-20 minutos',
    restTime: 'N/A'
  },
  {
    id: 'jump-rope',
    name: 'Saltar la Cuerda',
    muscleGroup: 'cardio',
    equipment: 'Cuerda de saltar',
    defaultSets: 5,
    defaultReps: 1,
    image: URL_STORAGE + 'male-cardio-jump-rope-side.gif',
    description: 'Ejercicio cardiovascular portátil y efectivo',
    technique: [
      'Salta sobre las puntas de los pies',
      'Gira la cuerda con las muñecas, no los brazos',
      'Saltos pequeños y rápidos',
      'Mantén el core activado',
      'Excelente para coordinación y resistencia'
    ],
    recommendedSets: '3-5 series',
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
    image: URL_STORAGE + 'male-cardio-battle-ropes-front.gif',
    description: 'Ejercicio de alta intensidad para brazos, hombros y core',
    technique: [
      'Pies al ancho de hombros, rodillas ligeramente flexionadas',
      'Alterna brazos creando ondas en las cuerdas',
      'Mantén el core activado y espalda recta',
      'Movimiento explosivo y continuo',
      'Combina cardio con fuerza de agarre'
    ],
    recommendedSets: '4-6 series',
    recommendedReps: '20-45 segundos',
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
    description: 'Ejercicio de cuerpo completo que combina fuerza y cardio',
    technique: [
      'Desde de pie, baja a posición de plancha',
      'Haz una flexión (opcional)',
      'Salta los pies hacia las manos',
      'Salta verticalmente con brazos arriba',
      'Uno de los ejercicios más completos que existen'
    ],
    recommendedSets: '3-5 series',
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
    description: 'Ejercicio cardiovascular que eleva la frecuencia cardíaca rápidamente',
    technique: [
      'Corre en el lugar elevando las rodillas al pecho',
      'Brazos bombeando al ritmo de las piernas',
      'Mantén el torso erguido',
      'Aterriza suavemente sobre las puntas de los pies',
      'Excelente para calentamiento o HIIT'
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
    image: URL_STORAGE + 'male-bodyweight-mountain-climbers-side.gif',
    description: 'Ejercicio dinámico que trabaja core y cardio',
    technique: [
      'Posición de plancha alta',
      'Alterna rodillas al pecho rápidamente',
      'Mantén las caderas bajas y estables',
      'Movimiento continuo y rápido',
      'Combina trabajo de core con cardio intenso'
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
    image: URL_STORAGE + 'male-bodyweight-box-jump-side.gif',
    description: 'Ejercicio pliométrico para potencia y cardio',
    technique: [
      'Salta explosivamente sobre el cajón',
      'Aterriza suavemente con rodillas flexionadas',
      'Baja con control o salta hacia abajo',
      'Desarrolla potencia explosiva',
      'Excelente para atletas y deportes'
    ],
    recommendedSets: '3-5 series',
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
    image: URL_STORAGE + 'male-cardio-swimming-side.gif',
    description: 'Ejercicio cardiovascular de cuerpo completo sin impacto',
    technique: [
      'Técnica correcta según el estilo (crol, espalda, pecho, mariposa)',
      'Respiración rítmica y controlada',
      'Cero impacto en articulaciones',
      'Trabaja todos los grupos musculares',
      'Ideal para recuperación o cardio de bajo impacto'
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
    image: URL_STORAGE + 'male-cardio-shadow-boxing-front.gif',
    description: 'Simula combate de boxeo para cardio y coordinación',
    technique: [
      'Posición de guardia, pies en movimiento',
      'Lanza combinaciones de golpes (jab, cross, hook, uppercut)',
      'Mantén las manos arriba protegiendo la cara',
      'Movimiento constante de pies',
      'Excelente para cardio, coordinación y técnica'
    ],
    recommendedSets: '3-5 rounds',
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
    image: URL_STORAGE + 'male-cardio-heavy-bag-front.gif',
    description: 'Golpear el saco para cardio intenso y liberación de estrés',
    technique: [
      'Usa guantes de boxeo o vendas',
      'Combina golpes de puño con movimiento de pies',
      'Mantén la guardia arriba entre combinaciones',
      'Golpea con técnica correcta para evitar lesiones',
      'Excelente para cardio, fuerza y coordinación'
    ],
    recommendedSets: '3-5 rounds',
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
    image: URL_STORAGE + 'male-cardio-cycling-outdoor-side.gif',
    description: 'Ciclismo en exteriores para cardio y exploración',
    technique: [
      'Ajusta el asiento a la altura correcta',
      'Mantén la espalda ligeramente inclinada',
      'Usa casco y equipo de seguridad',
      'Varía la intensidad con terreno y velocidad',
      'Excelente para resistencia cardiovascular'
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
    image: URL_STORAGE + 'male-cardio-running-outdoor-side.gif',
    description: 'Carrera en exteriores para cardio y resistencia',
    technique: [
      'Aterriza con la parte media del pie',
      'Mantén postura erguida y mirada al frente',
      'Brazos a 90 grados balanceándose naturalmente',
      'Respira rítmicamente (2-3 pasos inhalar, 2-3 exhalar)',
      'Usa calzado adecuado para correr'
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
    image: URL_STORAGE + 'male-cardio-hiking-side.gif',
    description: 'Caminata en terreno irregular para cardio y naturaleza',
    technique: [
      'Usa calzado apropiado con buen agarre',
      'Bastones de trekking para mayor estabilidad (opcional)',
      'Mantén un ritmo constante y sostenible',
      'Hidratación constante',
      'Excelente para cardio de bajo impacto y salud mental'
    ],
    recommendedSets: '1 sesión',
    recommendedReps: '1-4 horas',
    restTime: 'N/A'
  }
];

export const MUSCLE_GROUPS: { id: MuscleGroup; name: string }[] = [
  { id: 'pecho', name: 'Pecho' },
  { id: 'espalda', name: 'Espalda' },
  { id: 'piernas', name: 'Piernas' },
  { id: 'gluteos', name: 'Glúteos' },
  { id: 'hombros', name: 'Hombros' },
  { id: 'biceps', name: 'Bíceps' },
  { id: 'triceps', name: 'Tríceps' },
  { id: 'antebrazos', name: 'Antebrazos' },
  { id: 'trapecio', name: 'Trapecio' },
  { id: 'cuello', name: 'Cuello' },
  { id: 'core', name: 'Core/Abdomen' },
  { id: 'gemelos', name: 'Gemelos' },
  { id: 'cardio', name: 'Cardio' }
];

export const getExercisesByMuscleGroup = (muscleGroup: MuscleGroup): ExerciseTemplate[] => {
  return EXERCISE_DATABASE.filter(ex => ex.muscleGroup === muscleGroup);
};

export const getExerciseById = (id: string): ExerciseTemplate | undefined => {
  return EXERCISE_DATABASE.find(ex => ex.id === id);
};

export const getExerciseByName = (name: string): ExerciseTemplate | undefined => {
  // Búsqueda exacta
  const exactMatch = EXERCISE_DATABASE.find(
    ex => ex.name.toLowerCase() === name.toLowerCase()
  );
  if (exactMatch) return exactMatch;

  // Búsqueda parcial
  return EXERCISE_DATABASE.find(
    ex => ex.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(ex.name.toLowerCase())
  );
};

// Fallback: asegurar que todos los ejercicios tengan una imagen válida
const DEFAULT_PLACEHOLDER_IMAGE = '/images/not-available.svg';
EXERCISE_DATABASE.forEach(ex => {
  if (!ex.image) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ex as any).image = DEFAULT_PLACEHOLDER_IMAGE;
  }
});
