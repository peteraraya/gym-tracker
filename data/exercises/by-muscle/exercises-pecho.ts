/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Auto-generado por scripts/split-exercises-by-muscle.mjs
 * No editar manualmente. Los ejercicios de este grupo viven aquí para carga diferida.
 */
import type { ExerciseTemplate } from '@/data/exercises';

const URL_STORAGE = 'https://hplrrjqgzefkdevbporx.supabase.co/storage/v1/object/public/routine-images/';

export const EXERCISES_Pecho: ExerciseTemplate[] = [
{
    id: 'bench-press',
    name: 'Press de Banca',
    muscleGroup: 'pecho',
    equipment: 'Barra',
    description: 'Ejercicio básico para pecho',
    defaultSets: 4,
    defaultReps: 10,
    image: URL_STORAGE + 'male-barbell-bench-press-front.gif',
    youtubeVideoId: 'rT7DgCr-3pg', // Ejemplo de video tutorial de Press de Banca
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
    instructions: [
      'Túmbate boca arriba en un banco con la cabeza en un extremo y los pies en el suelo.',
      'Sujeta una mancuerna con ambas manos y extiende los brazos rectos por encima del pecho.',
      'Manteniendo una ligera flexión en los codos, baja lentamente la mancuerna detrás de la cabeza hasta sentir un estiramiento en el pecho y los hombros.',
      'Haz una pausa por un momento, luego levanta la mancuerna de vuelta a la posición inicial.',
      'Repite el número de repeticiones deseado.'
    ],
    description: 'Túmbate boca arriba en un banco con la cabeza en un extremo y los pies en el suelo. Sujeta una mancuerna con ambas manos y extiende los brazos rectos por encima del pecho. Manteniendo una ligera flexión en los codos, baja lentamente la mancuerna detrás de la cabeza hasta sentir un estiramiento en el pecho y los hombros. Haz una pausa por un momento, luego levanta la mancuerna de vuelta a la posición inicial. Repite el número de repeticiones deseado.',
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
    image: URL_STORAGE + 'male-seated-cable-fly-front.gif',
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
    image: URL_STORAGE + 'male-incline-cable-fly-front.gif',
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
    image: URL_STORAGE + 'male-low-cable-fly-front.gif',
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
    image: URL_STORAGE + 'male-cable-press-front.gif',
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
    image: URL_STORAGE + 'male-incline-dumbbell-press-front.gif',
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
    image: URL_STORAGE + 'male-decline-dumbbell-press-front.gif',
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
    image: URL_STORAGE + 'male-dumbbell-press-front.gif',
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
    image: URL_STORAGE + 'male-incline-cable-press-front.gif',
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
    image: URL_STORAGE + 'male-chest-dips-front.gif',
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
    image: URL_STORAGE + 'male-svend-press-front.gif',
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
    instructions: [
      'Túmbate sobre un banco con los pies apoyados en el suelo y la espalda presionada contra el banco.',
      'Sujeta una mancuerna en cada mano, con las palmas hacia adelante y los brazos extendidos por encima del pecho.',
      'Baja lentamente las mancuernas hacia los lados del pecho, manteniendo los codos en un ángulo de 90 grados.',
      'Haz una pausa breve, luego empuja las mancuernas de vuelta hacia arriba hasta la posición inicial, extendiendo completamente los brazos.',
      'Repite el número de repeticiones deseado.'
    ],
    description: 'Túmbate sobre un banco con los pies apoyados en el suelo y la espalda presionada contra el banco. Sujeta una mancuerna en cada mano, con las palmas hacia adelante y los brazos extendidos por encima del pecho. Baja lentamente las mancuernas hacia los lados del pecho, manteniendo los codos en un ángulo de 90 grados. Haz una pausa breve, luego empuja las mancuernas de vuelta hacia arriba hasta la posición inicial, extendiendo completamente los brazos. Repite el número de repeticiones deseado.',
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
    instructions: [
      'Ajusta la altura de la barra de la máquina Smith a la altura del pecho.',
      'Túmbate en el banco con los pies firmemente apoyados en el suelo.',
      'Sujeta la barra con agarre prono, un poco más separado que el ancho de los hombros.',
      'Suelta la barra del soporte y bájala hacia el pecho, manteniendo los codos pegados al cuerpo.',
      'Haz una pausa por un momento cuando la barra toque el pecho.',
      'Empuja la barra de vuelta a la posición inicial, extendiendo los brazos por completo.',
      'Repite el número de repeticiones deseado.'
    ],
    description: 'Ajusta la altura de la barra de la máquina Smith a la altura del pecho. Túmbate en el banco con los pies firmemente apoyados en el suelo. Sujeta la barra con agarre prono, un poco más separado que el ancho de los hombros. Suelta la barra del soporte y bájala hacia el pecho, manteniendo los codos pegados al cuerpo. Haz una pausa por un momento cuando la barra toque el pecho. Empuja la barra de vuelta a la posición inicial, extendiendo los brazos por completo. Repite el número de repeticiones deseado.',
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
    instructions: [
      'Colócate en las barras paralelas con los brazos completamente extendidos y el cuerpo recto.',
      'Baja el cuerpo flexionando los codos hasta que los hombros queden por debajo de los codos.',
      'Empújate de vuelta hacia arriba a la posición inicial extendiendo los brazos.',
      'Repite el número de repeticiones deseado.'
    ],
    description: 'Colócate en las barras paralelas con los brazos completamente extendidos y el cuerpo recto. Baja el cuerpo flexionando los codos hasta que los hombros queden por debajo de los codos. Empújate de vuelta hacia arriba a la posición inicial extendiendo los brazos. Repite el número de repeticiones deseado.',
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
  }
];
