/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Auto-generado por scripts/split-exercises-by-muscle.mjs
 * No editar manualmente. Los ejercicios de este grupo viven aquí para carga diferida.
 */
import type { ExerciseTemplate } from '@/data/exercises';

const URL_STORAGE = 'https://hplrrjqgzefkdevbporx.supabase.co/storage/v1/object/public/routine-images/';

export const EXERCISES_Espalda: ExerciseTemplate[] = [
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
    instructions: [
      'Coloca una barra a la altura de la cintura o usa un entrenador de suspensión.',
      'Ponte de pie frente a la barra o al entrenador de suspensión, con los pies separados a la altura de los hombros.',
      'Agarra la barra o las asas con agarre prono, ligeramente más ancho que la altura de los hombros.',
      'Inclínate hacia atrás, manteniendo el cuerpo recto y los talones en el suelo.',
      'Tira del pecho hacia la barra o las asas, apretando los omóplatos entre sí.',
      'Haz una pausa breve en la parte más alta, luego baja lentamente de vuelta a la posición inicial.',
      'Repite el número de repeticiones deseado.'
    ],
    description: 'Coloca una barra a la altura de la cintura o usa un entrenador de suspensión. Ponte de pie frente a la barra o al entrenador de suspensión, con los pies separados a la altura de los hombros. Agarra la barra o las asas con agarre prono, ligeramente más ancho que la altura de los hombros. Inclínate hacia atrás, manteniendo el cuerpo recto y los talones en el suelo. Tira del pecho hacia la barra o las asas, apretando los omóplatos entre sí. Haz una pausa breve en la parte más alta, luego baja lentamente de vuelta a la posición inicial. Repite el número de repeticiones deseado.',
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
    image: URL_STORAGE + 'male-wide-grip-cable-row-back.gif',
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
    image: URL_STORAGE + 'male-one-arm-cable-row-back.gif',
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
    image: URL_STORAGE + 'male-cable-pullover-back.gif',
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
    image: URL_STORAGE + 'male-reverse-grip-lat-pulldown-back.gif',
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
    image: URL_STORAGE + 'male-close-grip-lat-pulldown-back.gif',
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
    image: URL_STORAGE + 'male-pendlay-row-back.gif',
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
    image: URL_STORAGE + 'male-meadows-row-back.gif',
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
    image: URL_STORAGE + 'male-seal-row-back.gif',
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
    image: URL_STORAGE + 'male-cable-high-row-back.gif',
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
    image: URL_STORAGE + 'male-rack-pulls-back.gif',
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
    instructions: [
      'Ajusta el banco de hiperextensiones para que la parte superior de los muslos quede apoyada en la almohadilla y los pies queden asegurados.',
      'Cruza los brazos sobre el pecho o coloca las manos detrás de la cabeza.',
      'Baja la parte superior del cuerpo hacia el suelo manteniendo la espalda recta.',
      'Haz una pausa breve en la parte baja, luego eleva la parte superior del cuerpo hasta que quede alineada con las piernas.',
      'Repite el número de repeticiones deseado.'
    ],
    description: 'Ajusta el banco de hiperextensiones para que la parte superior de los muslos quede apoyada en la almohadilla y los pies queden asegurados. Cruza los brazos sobre el pecho o coloca las manos detrás de la cabeza. Baja la parte superior del cuerpo hacia el suelo manteniendo la espalda recta. Haz una pausa breve en la parte baja, luego eleva la parte superior del cuerpo hasta que quede alineada con las piernas. Repite el número de repeticiones deseado.',
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
  }
];
