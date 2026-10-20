/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Auto-generado por scripts/split-exercises-by-muscle.mjs
 * No editar manualmente. Los ejercicios de este grupo viven aquí para carga diferida.
 */
import type { ExerciseTemplate } from '@/data/exercises';

const URL_STORAGE = 'https://hplrrjqgzefkdevbporx.supabase.co/storage/v1/object/public/routine-images/';

export const EXERCISES_Piernas: ExerciseTemplate[] = [
{
    id: 'squat',
    name: 'Sentadilla',
    muscleGroup: 'piernas',
    equipment: 'Barra',
    defaultSets: 4,
    defaultReps: 10,
    image: URL_STORAGE + 'male-barbell-squat-front.gif',
    youtubeVideoId: 'bEv6CCg2BC8', // Ejemplo de video tutorial de Sentadilla
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
    instructions: [
      'Empieza de pie con los pies separados a la altura de los hombros y la barra apoyada sobre la parte superior de la espalda.',
      'Manteniendo la espalda recta y el core activado, flexiona las caderas hacia delante, empujando los glúteos hacia atrás como si intentaras tocar la pared detrás de ti con ellos.',
      'Baja el torso hasta que quede paralelo al suelo, sintiendo un estiramiento en los isquiotibiales.',
      'Haz una pausa breve y luego vuelve a la posición inicial apretando los glúteos y empujando las caderas hacia delante.',
      'Repite el número de repeticiones deseado.'
    ],
    description: 'Empieza de pie con los pies separados a la altura de los hombros y la barra apoyada sobre la parte superior de la espalda. Manteniendo la espalda recta y el core activado, flexiona las caderas hacia delante, empujando los glúteos hacia atrás como si intentaras tocar la pared detrás de ti con ellos. Baja el torso hasta que quede paralelo al suelo, sintiendo un estiramiento en los isquiotibiales. Haz una pausa breve y luego vuelve a la posición inicial apretando los glúteos y empujando las caderas hacia delante. Repite el número de repeticiones deseado.',
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
    instructions: [
      'Ponte de pie con los pies separados a la altura de los hombros y los dedos de los pies ligeramente hacia afuera.',
      'Sujétate de un objeto estable para mantener el equilibrio si es necesario.',
      'Baja lentamente el cuerpo doblando las rodillas e inclinándote hacia atrás, manteniendo el torso erguido.',
      'Continúa bajando hasta que los muslos queden paralelos al suelo o tan lejos como puedas llegar cómodamente.',
      'Haz una pausa breve y luego empuja con los talones para volver a la posición inicial.',
      'Repite el número de repeticiones deseado.'
    ],
    description: 'Ponte de pie con los pies separados a la altura de los hombros y los dedos de los pies ligeramente hacia afuera. Sujétate de un objeto estable para mantener el equilibrio si es necesario. Baja lentamente el cuerpo doblando las rodillas e inclinándote hacia atrás, manteniendo el torso erguido. Continúa bajando hasta que los muslos queden paralelos al suelo o tan lejos como puedas llegar cómodamente. Haz una pausa breve y luego empuja con los talones para volver a la posición inicial. Repite el número de repeticiones deseado.',
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
    instructions: [
      'Ponte de pie con los pies separados a la altura de las caderas, sujetando una mancuerna con la mano derecha.',
      'Traslada tu peso a la pierna izquierda y levanta el pie derecho ligeramente del suelo.',
      'Manteniendo la espalda recta, inclínate hacia adelante desde las caderas y baja la mancuerna hacia el suelo.',
      'Al mismo tiempo, extiende la pierna derecha recta hacia atrás, manteniendo una ligera flexión en la rodilla izquierda.',
      'Baja la mancuerna hasta que tu torso y tu pierna derecha queden paralelos al suelo.',
      'Haz una pausa por un momento, luego activa los glúteos y los isquiotibiales para volver a la posición inicial.',
      'Repite el número de repeticiones deseado, luego cambia de lado.'
    ],
    description: 'Ponte de pie con los pies separados a la altura de las caderas, sujetando una mancuerna con la mano derecha. Traslada tu peso a la pierna izquierda y levanta el pie derecho ligeramente del suelo. Manteniendo la espalda recta, inclínate hacia adelante desde las caderas y baja la mancuerna hacia el suelo. Al mismo tiempo, extiende la pierna derecha recta hacia atrás, manteniendo una ligera flexión en la rodilla izquierda. Baja la mancuerna hasta que tu torso y tu pierna derecha queden paralelos al suelo. Haz una pausa por un momento, luego activa los glúteos y los isquiotibiales para volver a la posición inicial. Repite el número de repeticiones deseado, luego cambia de lado.',
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
    image: URL_STORAGE + 'male-walking-lunges-front.gif',
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
    image: URL_STORAGE + 'male-sumo-squat-front.gif',
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
    image: URL_STORAGE + 'male-nordic-curl-front.gif',
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
    image: URL_STORAGE + 'male-wall-sit-front.gif',
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
{
    id: 'smith-squat',
    name: 'Sentadilla en Smith',
    instructions: [
      'Configura la máquina Smith con la barra a una altura adecuada para tu sentadilla.',
      'Ponte de pie con los pies separados a la altura de los hombros, con los dedos de los pies ligeramente hacia afuera.',
      'Colócate debajo de la barra, apoyándola en la parte alta de los trapecios y los hombros.',
      'Agarra la barra con un agarre amplio, un poco más ancho que la separación de los hombros.',
      'Activa el core y suelta la barra del soporte, dando un paso atrás para alejarte del soporte.',
      'Manteniendo el pecho elevado y la espalda recta, inicia la sentadilla doblando las caderas y las rodillas.',
      'Baja el cuerpo hasta que los muslos queden paralelos al suelo o un poco por debajo.',
      'Haz una pausa por un momento en la posición baja, luego empuja con los talones para volver a la posición inicial.',
      'Repite el número de repeticiones deseado.'
    ],
    description: 'Configura la máquina Smith con la barra a una altura adecuada para tu sentadilla. Ponte de pie con los pies separados a la altura de los hombros, con los dedos de los pies ligeramente hacia afuera. Colócate debajo de la barra, apoyándola en la parte alta de los trapecios y los hombros. Agarra la barra con un agarre amplio, un poco más ancho que la separación de los hombros. Activa el core y suelta la barra del soporte, dando un paso atrás para alejarte del soporte. Manteniendo el pecho elevado y la espalda recta, inicia la sentadilla doblando las caderas y las rodillas. Baja el cuerpo hasta que los muslos queden paralelos al suelo o un poco por debajo. Haz una pausa por un momento en la posición baja, luego empuja con los talones para volver a la posición inicial. Repite el número de repeticiones deseado.',
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
  }
];
