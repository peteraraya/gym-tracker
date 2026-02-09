export type MuscleGroup =
  | 'pecho'
  | 'espalda'
  | 'piernas'
  | 'hombros'
  | 'brazos'
  | 'core'
  | 'gluteos'
  | 'gemelos';

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
    image: '/exercises/male-barbell-bench-press-front.gif',
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
    image: '/exercises/male-barbell-incline-bench-press-front.gif',
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
    image: '/exercises/male-dumbbell-chest-fly-front.gif',
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
    image: '/exercises/male-bodyweight-push-up-front.gif',
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
    image: '/exercises/male-cable-chest-fly-front.gif',
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
    image: '/exercises/male-barbell-decline-bench-press-front.gif',
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
    image: '/exercises/male-dumbbell-pullover-side.gif',
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
    image: '/exercises/male-machine-pec-deck-front.gif',
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
    image: '/exercises/male-bodyweight-diamond-push-up-front.gif',
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

  // ESPALDA
  {
    id: 'deadlift',
    name: 'Peso Muerto',
    muscleGroup: 'espalda',
    equipment: 'Barra',
    defaultSets: 4,
    defaultReps: 8,
    image: '/exercises/male-barbell-deadlift-side.gif',
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
    image: '/exercises/male-bodyweight-pullup-back.gif',
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
    image: '/exercises/male-barbell-bent-over-row-back.gif',
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
    image: '/exercises/male-cable-wide-grip-lat-pulldown-back.gif',
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
    image: '/exercises/male-dumbbell-bent-over-row-back.gif',
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
    image: '/exercises/male-cable-face-pull-front.gif',
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
    image: '/exercises/male-barbell-t-bar-row-back.gif',
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
    image: '/exercises/male-cable-seated-row-back.gif',
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
    image: '/exercises/male-bodyweight-chin-up-back.gif',
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
    image: '/exercises/male-bodyweight-inverted-row-back.gif',
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
    image: '/exercises/male-cable-straight-arm-pulldown-back.gif',
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

  // PIERNAS
  {
    id: 'squat',
    name: 'Sentadilla',
    muscleGroup: 'piernas',
    equipment: 'Barra',
    defaultSets: 4,
    defaultReps: 10,
    image: '/exercises/male-barbell-squat-front.gif',
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
    image: '/exercises/male-machine-leg-press-front.gif',
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
    image: '/exercises/male-machine-leg-extension-front.gif',
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
    image: '/exercises/male-machine-leg-curl-front.gif',
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
    image: '/exercises/male-dumbbell-lunge-front.gif',
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
    image: '/exercises/male-barbell-front-squat-front.gif',
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
    image: '/exercises/male-barbell-romanian-deadlift-side.gif',
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
    image: '/exercises/male-dumbbell-goblet-squat-front.gif',
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
    image: '/exercises/male-machine-single-leg-press-front.gif',
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
    image: '/exercises/male-machine-hack-squat-front.gif',
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
    image: '/exercises/male-bodyweight-box-jump-side.gif',
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

  // GLÚTEOS
  {
    id: 'hip-thrust',
    name: 'Hip Thrust',
    muscleGroup: 'gluteos',
    equipment: 'Barra',
    defaultSets: 4,
    defaultReps: 12,
    image: '/exercises/male-barbell-hip-thrust-side.gif',
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
    image: '/exercises/male-dumbbell-bulgarian-split-squat-front.gif',
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
    image: '/exercises/male-bodyweight-glute-bridge-side.gif',
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
    image: '/exercises/male-cable-kickback-side.gif',
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
    image: '/exercises/male-barbell-sumo-deadlift-front.gif',
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
    image: '/exercises/male-bodyweight-donkey-kicks-side.gif',
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
    image: '/exercises/male-dumbbell-step-up-side.gif',
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

  // HOMBROS
  {
    id: 'overhead-press',
    name: 'Press Militar',
    muscleGroup: 'hombros',
    equipment: 'Barra',
    defaultSets: 4,
    defaultReps: 10,
    image: '/exercises/male-barbell-standing-overhead-press-front.gif',
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
    image: '/exercises/male-dumbbell-lateral-raise-front.gif',
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
    image: '/exercises/male-dumbbell-front-raise-front.gif',
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
    image: '/exercises/male-dumbbell-arnold-press-front.gif',
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
    image: '/exercises/male-dumbbell-rear-delt-fly-front.gif',
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
    image: '/exercises/male-barbell-upright-row-front.gif',
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
    image: '/exercises/male-dumbbell-shoulder-press-front.gif',
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
    image: '/exercises/male-cable-lateral-raise-front.gif',
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

  // BRAZOS
  {
    id: 'barbell-curl',
    name: 'Curl con Barra',
    muscleGroup: 'brazos',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 12,
    image: '/exercises/male-barbell-bicep-curl-front.gif',
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
    muscleGroup: 'brazos',
    equipment: 'Peso corporal',
    defaultSets: 3,
    defaultReps: 12,
    image: '/exercises/male-bodyweight-tricep-dip-front.gif',
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
    muscleGroup: 'brazos',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: '/exercises/male-dumbbell-hammer-curl-front.gif',
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
    muscleGroup: 'brazos',
    equipment: 'Mancuernas/Polea',
    defaultSets: 3,
    defaultReps: 12,
    image: '/exercises/male-dumbbell-overhead-tricep-extension-front.gif',
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
    muscleGroup: 'brazos',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 15,
    image: '/exercises/male-dumbbell-concentration-curl-front.gif',
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
    muscleGroup: 'brazos',
    equipment: 'Barra',
    defaultSets: 4,
    defaultReps: 10,
    image: '/exercises/male-barbell-close-grip-bench-press-front.gif',
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
    muscleGroup: 'brazos',
    equipment: 'Barra/Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: '/exercises/male-barbell-preacher-curl-front.gif',
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
    muscleGroup: 'brazos',
    equipment: 'Barra',
    defaultSets: 3,
    defaultReps: 12,
    image: '/exercises/male-barbell-skull-crusher-side.gif',
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
    muscleGroup: 'brazos',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    image: '/exercises/male-cable-bicep-curl-front.gif',
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
    muscleGroup: 'brazos',
    equipment: 'Poleas',
    defaultSets: 3,
    defaultReps: 15,
    image: '/exercises/male-cable-tricep-pushdown-front.gif',
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
    muscleGroup: 'brazos',
    equipment: 'Mancuernas',
    defaultSets: 3,
    defaultReps: 12,
    image: '/exercises/male-dumbbell-zottman-curl-front.gif',
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
    image: '/exercises/male-bodyweight-plank-side.gif',
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
    image: '/exercises/male-bodyweight-crunch-side.gif',
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
    image: '/exercises/male-bodyweight-russian-twist-side.gif',
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
    image: '/exercises/male-bodyweight-leg-raise-side.gif',
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
    image: '/exercises/male-bodyweight-bicycle-crunch-side.gif',
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
    image: '/exercises/male-bodyweight-mountain-climbers-side.gif',
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
    image: '/exercises/male-bodyweight-dead-bug-side.gif',
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
    image: '/exercises/male-cable-wood-chop-front.gif',
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
    image: '/exercises/male-bodyweight-hanging-knee-raise-side.gif',
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
    image: '/exercises/male-wheel-ab-wheel-rollout-side.gif',
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
    image: '/exercises/male-bodyweight-side-plank-side.gif',
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
    image: '/exercises/male-barbell-standing-calf-raise-side.gif',
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
    image: '/exercises/male-machine-seated-calf-raise-side.gif',
    technique: [
      'Coloca las puntas de los pies en la plataforma',
      'Trabaja específicamente el músculo sóleo',
      'Rango de movimiento completo',
      'Pausa en la contracción máxima'
    ],
    recommendedSets: '3-4 series',
    recommendedReps: '15-25 repeticiones',
    restTime: '45 segundos'
  }
];

export const MUSCLE_GROUPS: { id: MuscleGroup; name: string }[] = [
  { id: 'pecho', name: 'Pecho' },
  { id: 'espalda', name: 'Espalda' },
  { id: 'piernas', name: 'Piernas' },
  { id: 'gluteos', name: 'Glúteos' },
  { id: 'hombros', name: 'Hombros' },
  { id: 'brazos', name: 'Brazos' },
  { id: 'core', name: 'Core/Abdomen' },
  { id: 'gemelos', name: 'Gemelos' }
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
