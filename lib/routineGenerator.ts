/**
 * Generador inteligente de rutinas basado en preferencias del usuario
 */

import type { Routine, Exercise } from '@/types';
import type { DifficultyLevel } from '@/data/exercises/types';

interface GeneratorConfig {
  name: string;
  daysPerWeek: number;
  minutesPerSession: number;
  level: DifficultyLevel;
  equipment: string[];
  goal: string[];
  focusAreas: string[];
}

interface ExerciseRecommendation {
  name: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  restTime: number;
  equipment: string;
}

interface DayRoutine {
  dayName: string;
  muscleGroups: string[];
}

/**
 * Genera múltiples rutinas personalizadas (una por día de entrenamiento)
 */
export async function generateRoutine(config: GeneratorConfig): Promise<Routine[]> {
  const { daysPerWeek, minutesPerSession, level, goal, focusAreas } = config;

  // Determinar split según días disponibles
  const split = determineSplit(daysPerWeek, focusAreas);
  
  // Crear una rutina por cada día
  const routines: Routine[] = [];
  
  for (let dayIndex = 0; dayIndex < split.length; dayIndex++) {
    const day = split[dayIndex];
    const exercises = await generateDayExercises(
      day.muscleGroups,
      config,
      1 // Siempre empezar desde 1 para cada rutina
    );

    const routine: Routine = {
      id: `generated-${Date.now()}-day${dayIndex + 1}`,
      name: `${config.name} - ${day.dayName}`,
      description: generateDayDescription(config, day.dayName, day.muscleGroups),
      exercises,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    routines.push(routine);
  }

  return routines;
}

/**
 * Determina el split de entrenamiento según días disponibles
 */
function determineSplit(daysPerWeek: number, focusAreas: string[]): DayRoutine[] {
  // 2 días: Full Body
  if (daysPerWeek === 2) {
    return [
      { dayName: 'Día 1 - Full Body A', muscleGroups: ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'] },
      { dayName: 'Día 2 - Full Body B', muscleGroups: ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'] }
    ];
  }

  // 3 días: Push/Pull/Legs o Full Body
  if (daysPerWeek === 3) {
    if (focusAreas.includes('legs')) {
      return [
        { dayName: 'Día 1 - Push (Empuje)', muscleGroups: ['chest', 'shoulders', 'arms'] },
        { dayName: 'Día 2 - Pull (Tirón)', muscleGroups: ['back', 'arms'] },
        { dayName: 'Día 3 - Legs (Piernas)', muscleGroups: ['legs', 'glutes', 'core'] }
      ];
    }
    return [
      { dayName: 'Día 1 - Full Body A', muscleGroups: ['chest', 'back', 'legs', 'shoulders'] },
      { dayName: 'Día 2 - Full Body B', muscleGroups: ['chest', 'back', 'legs', 'arms'] },
      { dayName: 'Día 3 - Full Body C', muscleGroups: ['chest', 'back', 'legs', 'core'] }
    ];
  }

  // 4 días: Upper/Lower
  if (daysPerWeek === 4) {
    return [
      { dayName: 'Día 1 - Upper A (Tren Superior)', muscleGroups: ['chest', 'shoulders', 'arms'] },
      { dayName: 'Día 2 - Lower A (Tren Inferior)', muscleGroups: ['legs', 'glutes', 'core'] },
      { dayName: 'Día 3 - Upper B (Tren Superior)', muscleGroups: ['back', 'shoulders', 'arms'] },
      { dayName: 'Día 4 - Lower B (Tren Inferior)', muscleGroups: ['legs', 'glutes', 'core'] }
    ];
  }

  // 5 días: Push/Pull/Legs/Upper/Lower
  if (daysPerWeek === 5) {
    return [
      { dayName: 'Día 1 - Push (Empuje)', muscleGroups: ['chest', 'shoulders', 'arms'] },
      { dayName: 'Día 2 - Pull (Tirón)', muscleGroups: ['back', 'arms'] },
      { dayName: 'Día 3 - Legs (Piernas)', muscleGroups: ['legs', 'glutes'] },
      { dayName: 'Día 4 - Upper (Tren Superior)', muscleGroups: ['chest', 'back', 'shoulders'] },
      { dayName: 'Día 5 - Lower (Tren Inferior)', muscleGroups: ['legs', 'core'] }
    ];
  }

  // 6 días: PPL x2
  return [
    { dayName: 'Día 1 - Push A (Empuje)', muscleGroups: ['chest', 'shoulders', 'arms'] },
    { dayName: 'Día 2 - Pull A (Tirón)', muscleGroups: ['back', 'arms'] },
    { dayName: 'Día 3 - Legs A (Piernas)', muscleGroups: ['legs', 'glutes', 'core'] },
    { dayName: 'Día 4 - Push B (Empuje)', muscleGroups: ['chest', 'shoulders', 'arms'] },
    { dayName: 'Día 5 - Pull B (Tirón)', muscleGroups: ['back', 'arms'] },
    { dayName: 'Día 6 - Legs B (Piernas)', muscleGroups: ['legs', 'glutes', 'core'] }
  ];
}

/**
 * Genera ejercicios para un día específico
 */
async function generateDayExercises(
  muscleGroups: string[],
  config: GeneratorConfig,
  startId: number
): Promise<Exercise[]> {
  const exercises: Exercise[] = [];
  const { level, goal, minutesPerSession, equipment } = config;

  // Determinar parámetros según objetivo
  const params = getGoalParameters(goal, level);

  // Calcular cuántos ejercicios caben en el tiempo disponible
  const avgTimePerExercise = 8; // minutos (incluyendo descanso)
  const maxExercises = Math.floor(minutesPerSession / avgTimePerExercise);

  // Distribuir ejercicios entre grupos musculares
  const exercisesPerGroup = Math.max(1, Math.floor(maxExercises / muscleGroups.length));

  let currentId = startId;

  for (const group of muscleGroups) {
    const groupExercises = getExercisesForGroup(
      group,
      exercisesPerGroup,
      equipment,
      params,
      currentId,
      level,
      goal
    );
    exercises.push(...groupExercises);
    currentId += groupExercises.length;
  }

  return exercises;
}

/**
 * Obtiene parámetros de entrenamiento según objetivo y nivel
 */
function getGoalParameters(goals: string[], level: DifficultyLevel) {
  const baseParams = {
    strength: { sets: 5, reps: 5, rest: 180 },
    hypertrophy: { sets: 4, reps: 10, rest: 90 },
    weight_loss: { sets: 3, reps: 15, rest: 60 },
    endurance: { sets: 3, reps: 20, rest: 45 },
    general: { sets: 3, reps: 12, rest: 75 }
  };

  const primaryGoal = goals.length > 0 ? goals[0] : 'general';
  const params = baseParams[primaryGoal as keyof typeof baseParams] || baseParams.general;

  // Ajustar según nivel
  if (level === 'principiante') {
    params.sets = Math.max(2, params.sets - 1);
  } else if (level === 'avanzado') {
    params.sets = Math.min(6, params.sets + 1);
  }

  return params;
}

/**
 * Calcula peso inicial recomendado según ejercicio, nivel y objetivo
 */
export function getRecommendedWeight(
  exerciseName: string,
  level: DifficultyLevel,
  goals: string[]
): number {
  // Pesos base para principiantes (en kg)
  const baseWeights: Record<string, number> = {
    // Ejercicios principales compuestos
    'Press de Banca': 20,
    'Sentadilla': 30,
    'Peso Muerto': 40,
    'Press Militar': 15,
    'Remo con Barra': 25,
    
    // Ejercicios con mancuernas
    'Press Inclinado': 10,
    'Aperturas con Mancuernas': 8,
    'Curl con Barra': 10,
    'Curl Martillo': 8,
    'Elevaciones Laterales': 5,
    'Elevaciones Frontales': 5,
    
    // Ejercicios de máquina
    'Prensa de Piernas': 50,
    'Extensión de Piernas': 20,
    'Curl de Piernas': 20,
    'Jalón al Pecho': 30,
    'Extensiones de Tríceps': 15,
    'Patada de Glúteo': 15,
    
    // Ejercicios con peso corporal
    'Dominadas': 0,
    'Flexiones': 0,
    'Plancha': 0,
    'Abdominales': 0,
    'Russian Twist': 0,
    
    // Hip Thrust
    'Hip Thrust': 30
  };

  let weight = baseWeights[exerciseName] || 10;

  // Ajustar por nivel
  const levelMultipliers = {
    principiante: 1.0,
    intermedio: 1.5,
    avanzado: 2.0
  };
  weight *= levelMultipliers[level];

  // Ajustar por objetivo
  if (goals.includes('strength')) {
    weight *= 1.2; // Más peso para fuerza
  } else if (goals.includes('endurance') || goals.includes('weight_loss')) {
    weight *= 0.7; // Menos peso para resistencia/pérdida de peso
  }

  // Redondear a múltiplos de 2.5kg (estándar de discos)
  return Math.round(weight / 2.5) * 2.5;
}

/**
 * Obtiene ejercicios recomendados para un grupo muscular
 */
function getExercisesForGroup(
  group: string,
  count: number,
  equipment: string[],
  params: { sets: number; reps: number; rest: number },
  startId: number,
  level: DifficultyLevel,
  goals: string[]
): Exercise[] {
  // Mapeo de grupos a ejercicios comunes
  const exerciseDatabase: Record<string, ExerciseRecommendation[]> = {
    chest: [
      { name: 'Press de Banca', muscleGroup: 'pecho', sets: params.sets, reps: params.reps, restTime: params.rest, equipment: 'Barra' },
      { name: 'Press Inclinado', muscleGroup: 'pecho', sets: params.sets - 1, reps: params.reps, restTime: params.rest - 30, equipment: 'Mancuernas' },
      { name: 'Aperturas con Mancuernas', muscleGroup: 'pecho', sets: 3, reps: params.reps + 2, restTime: 60, equipment: 'Mancuernas' },
      { name: 'Flexiones', muscleGroup: 'pecho', sets: 3, reps: params.reps + 5, restTime: 60, equipment: 'Peso corporal' }
    ],
    back: [
      { name: 'Peso Muerto', muscleGroup: 'espalda', sets: params.sets, reps: params.reps - 2, restTime: params.rest, equipment: 'Barra' },
      { name: 'Dominadas', muscleGroup: 'espalda', sets: params.sets - 1, reps: params.reps - 2, restTime: params.rest, equipment: 'Peso corporal' },
      { name: 'Remo con Barra', muscleGroup: 'espalda', sets: params.sets, reps: params.reps, restTime: params.rest - 30, equipment: 'Barra' },
      { name: 'Jalón al Pecho', muscleGroup: 'espalda', sets: 3, reps: params.reps, restTime: 75, equipment: 'Poleas' }
    ],
    legs: [
      { name: 'Sentadilla', muscleGroup: 'piernas', sets: params.sets, reps: params.reps, restTime: params.rest, equipment: 'Barra' },
      { name: 'Prensa de Piernas', muscleGroup: 'piernas', sets: params.sets - 1, reps: params.reps + 2, restTime: params.rest - 30, equipment: 'Máquina' },
      { name: 'Extensión de Piernas', muscleGroup: 'piernas', sets: 3, reps: params.reps + 2, restTime: 60, equipment: 'Máquina' },
      { name: 'Curl de Piernas', muscleGroup: 'piernas', sets: 3, reps: params.reps + 2, restTime: 60, equipment: 'Máquina' }
    ],
    shoulders: [
      { name: 'Press Militar', muscleGroup: 'hombros', sets: params.sets, reps: params.reps, restTime: params.rest, equipment: 'Barra' },
      { name: 'Elevaciones Laterales', muscleGroup: 'hombros', sets: 3, reps: params.reps + 2, restTime: 60, equipment: 'Mancuernas' },
      { name: 'Elevaciones Frontales', muscleGroup: 'hombros', sets: 3, reps: params.reps + 2, restTime: 60, equipment: 'Mancuernas' }
    ],
    arms: [
      { name: 'Curl con Barra', muscleGroup: 'biceps', sets: 3, reps: params.reps, restTime: 75, equipment: 'Barra' },
      { name: 'Extensiones de Tríceps', muscleGroup: 'triceps', sets: 3, reps: params.reps, restTime: 75, equipment: 'Poleas' },
      { name: 'Curl Martillo', muscleGroup: 'biceps', sets: 3, reps: params.reps, restTime: 60, equipment: 'Mancuernas' }
    ],
    glutes: [
      { name: 'Hip Thrust', muscleGroup: 'gluteos', sets: params.sets, reps: params.reps, restTime: params.rest - 30, equipment: 'Barra' },
      { name: 'Patada de Glúteo', muscleGroup: 'gluteos', sets: 3, reps: params.reps + 2, restTime: 60, equipment: 'Poleas' }
    ],
    core: [
      { name: 'Plancha', muscleGroup: 'core', sets: 3, reps: 60, restTime: 60, equipment: 'Peso corporal' },
      { name: 'Abdominales', muscleGroup: 'core', sets: 3, reps: params.reps + 5, restTime: 45, equipment: 'Peso corporal' },
      { name: 'Russian Twist', muscleGroup: 'core', sets: 3, reps: params.reps + 10, restTime: 45, equipment: 'Peso corporal' }
    ]
  };

  const availableExercises = exerciseDatabase[group] || [];
  
  // Filtrar por equipo disponible
  const filteredExercises = availableExercises.filter(ex => {
    if (ex.equipment === 'Peso corporal') return true;
    if (equipment.includes('barbell') && ex.equipment === 'Barra') return true;
    if (equipment.includes('dumbbells') && ex.equipment === 'Mancuernas') return true;
    if (equipment.includes('machines') && ex.equipment === 'Máquina') return true;
    if (equipment.includes('cables') && ex.equipment === 'Poleas') return true;
    return false;
  });

  // Seleccionar los primeros N ejercicios (con fallback si el filtro por equipo
  // deja pocos o ningún ejercicio disponible)
  let selected = filteredExercises.slice(0, count);
  if (selected.length < count) {
    // Añadir ejercicios del pool completo (sin filtrar por equipo) hasta completar
    const extras = availableExercises
      .filter((ex) => !selected.includes(ex))
      .slice(0, Math.max(0, count - selected.length));
    selected = selected.concat(extras);
  }

  // Convertir a formato Exercise con pesos recomendados
  return selected.map((ex, index) => {
    const recommendedWeight = getRecommendedWeight(ex.name, level, goals);
    
    return {
      id: `${startId + index}`,
      name: ex.name,
      sets: Array.from({ length: ex.sets }, () => ({
        reps: ex.reps,
        weight: recommendedWeight,
        type: 'normal' as const
      })),
      equipment: ex.equipment,
      restBetweenSets: ex.restTime,
      notes: recommendedWeight > 0 
        ? `Peso recomendado para nivel ${level}. Ajusta según tu capacidad.`
        : 'Ejercicio con peso corporal. Ajusta las repeticiones según tu nivel.'
    };
  });
}

/**
 * Genera descripción de la rutina para un día específico
 */
function generateDayDescription(config: GeneratorConfig, dayName: string, muscleGroups: string[]): string {
  const goalDescriptions = {
    strength: 'enfocada en fuerza máxima',
    hypertrophy: 'enfocada en hipertrofia muscular',
    weight_loss: 'enfocada en pérdida de peso',
    endurance: 'enfocada en resistencia muscular',
    general: 'de fitness general'
  };

  const levelDescriptions = {
    principiante: 'para principiantes',
    intermedio: 'para nivel intermedio',
    avanzado: 'para nivel avanzado'
  };

  const muscleGroupNames: Record<string, string> = {
    chest: 'Pecho',
    back: 'Espalda',
    legs: 'Piernas',
    shoulders: 'Hombros',
    arms: 'Brazos',
    core: 'Core',
    glutes: 'Glúteos'
  };

  const groupsText = muscleGroups.map(g => muscleGroupNames[g] || g).join(', ');

  const goalNames = config.goal.map(g => goalDescriptions[g as keyof typeof goalDescriptions]).filter(Boolean).join(' y ');
  const finalGoalText = goalNames ? goalNames : goalDescriptions.general;

  return `Rutina ${finalGoalText} ${levelDescriptions[config.level]}. Grupos musculares: ${groupsText}. Duración: ${config.minutesPerSession} minutos.`;
}
