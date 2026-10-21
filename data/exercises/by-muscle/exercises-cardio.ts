/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Auto-generado por scripts/split-exercises-by-muscle.mjs
 * No editar manualmente. Los ejercicios de este grupo viven aquí para carga diferida.
 */
import type { ExerciseTemplate } from '@/data/exercises';

const URL_STORAGE = 'https://hplrrjqgzefkdevbporx.supabase.co/storage/v1/object/public/routine-images/';

export const EXERCISES_Cardio: ExerciseTemplate[] = [
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
    instructions: [
      'Sujeta las asas de la cuerda de saltar con las manos, palmas hacia adentro.',
      'Ponte de pie con los pies separados a la altura de los hombros y las rodillas ligeramente flexionadas.',
      'Balancea la cuerda por encima de la cabeza y salta sobre ella cuando se acerque a los pies.',
      'Aterriza suavemente sobre la punta de los pies y repite el salto cuando la cuerda vuelva a pasar.',
      'Continúa saltando durante el tiempo o el número de repeticiones deseado.'
    ],
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
