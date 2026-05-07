/**
 * Sistema inteligente de recomendaciones de ejercicios
 * Calcula series, repeticiones y pesos sugeridos basados en:
 * - Perfil del usuario (nivel, objetivo, género, peso)
 * - Recomendaciones del ejercicio
 * - Mejores prácticas de entrenamiento
 */

import type { UserProfile, FitnessGoal, FitnessLevel, Gender } from '@/types';
import type { ExerciseTemplate } from '@/data/exercises';

interface ExerciseRecommendation {
  sets: number;
  reps: number;
  weight: number;
  restTime: string;
}

/**
 * Calcula el peso inicial recomendado basado en el perfil del usuario
 */
function calculateInitialWeight(
  exercise: ExerciseTemplate,
  profile: UserProfile | null
): number {
  // Si no hay perfil, usar peso mínimo seguro
  if (!profile || !profile.weight) {
    return getMinimumSafeWeight(exercise);
  }

  const userWeight = profile.weight;
  const gender = profile.gender || 'male';
  const level = profile.fitnessLevel || 'beginner';

  // Factores de multiplicación según el tipo de ejercicio y nivel
  const weightFactors: Record<string, Record<FitnessLevel, number>> = {
    // Ejercicios de peso corporal
    bodyweight: {
      beginner: 0,
      intermediate: 0,
      advanced: 0
    },
    // Ejercicios compuestos (sentadilla, press banca, peso muerto)
    compound: {
      beginner: gender === 'male' ? 0.5 : 0.35,
      intermediate: gender === 'male' ? 0.75 : 0.55,
      advanced: gender === 'male' ? 1.0 : 0.75
    },
    // Ejercicios de aislamiento
    isolation: {
      beginner: gender === 'male' ? 0.15 : 0.10,
      intermediate: gender === 'male' ? 0.25 : 0.18,
      advanced: gender === 'male' ? 0.35 : 0.25
    }
  };

  // Determinar tipo de ejercicio
  let exerciseType: 'bodyweight' | 'compound' | 'isolation' = 'isolation';
  
  if (exercise.equipment === 'Peso corporal') {
    exerciseType = 'bodyweight';
  } else if (
    exercise.name.toLowerCase().includes('sentadilla') ||
    exercise.name.toLowerCase().includes('press banca') ||
    exercise.name.toLowerCase().includes('peso muerto') ||
    exercise.name.toLowerCase().includes('dominada') ||
    exercise.name.toLowerCase().includes('remo')
  ) {
    exerciseType = 'compound';
  }

  const factor = weightFactors[exerciseType][level];
  const calculatedWeight = Math.round(userWeight * factor);

  // Redondear a múltiplos de 2.5kg para facilitar carga de discos
  return Math.max(
    getMinimumSafeWeight(exercise),
    Math.round(calculatedWeight / 2.5) * 2.5
  );
}

/**
 * Obtiene el peso mínimo seguro para un ejercicio
 */
function getMinimumSafeWeight(exercise: ExerciseTemplate): number {
  if (exercise.equipment === 'Peso corporal') return 0;
  if (exercise.equipment === 'Mancuernas') return 2.5;
  if (exercise.equipment === 'Barra') return 20; // Barra olímpica vacía
  if (exercise.equipment === 'Kettlebell') return 4;
  return 5; // Peso mínimo por defecto
}

/**
 * Calcula las repeticiones recomendadas según el objetivo
 */
function calculateReps(
  exercise: ExerciseTemplate,
  goal: FitnessGoal | null | undefined
): number {
  // Si el ejercicio tiene recomendación específica, usarla
  if (exercise.recommendedReps) {
    const repsMatch = exercise.recommendedReps.match(/(\d+)-(\d+)/);
    if (repsMatch) {
      const min = parseInt(repsMatch[1]);
      const max = parseInt(repsMatch[2]);
      
      // Ajustar según objetivo
      switch (goal) {
        case 'strength':
          return min; // Menos reps, más peso
        case 'muscle_gain':
          return Math.round((min + max) / 2); // Rango medio
        case 'endurance':
          return max; // Más reps, menos peso
        default:
          return Math.round((min + max) / 2);
      }
    }
    
    // Si es un número fijo
    const fixedReps = parseInt(exercise.recommendedReps);
    if (!isNaN(fixedReps)) return fixedReps;
  }

  // Recomendaciones por defecto según objetivo
  const defaultReps: Record<FitnessGoal, number> = {
    strength: 5,
    muscle_gain: 10,
    weight_loss: 12,
    endurance: 15,
    general_fitness: 12
  };

  return defaultReps[goal || 'general_fitness'];
}

/**
 * Calcula el número de series recomendadas
 */
function calculateSets(
  exercise: ExerciseTemplate,
  level: FitnessLevel | null | undefined
): number {
  // Si el ejercicio tiene recomendación específica, usarla
  if (exercise.recommendedSets) {
    const setsMatch = exercise.recommendedSets.match(/(\d+)-(\d+)/);
    if (setsMatch) {
      const min = parseInt(setsMatch[1]);
      const max = parseInt(setsMatch[2]);
      
      // Ajustar según nivel
      switch (level) {
        case 'beginner':
          return min;
        case 'intermediate':
          return Math.round((min + max) / 2);
        case 'advanced':
          return max;
        default:
          return min;
      }
    }
    
    // Si es un número fijo
    const fixedSets = parseInt(exercise.recommendedSets);
    if (!isNaN(fixedSets)) return fixedSets;
  }

  // Recomendaciones por defecto según nivel
  const defaultSets: Record<FitnessLevel, number> = {
    beginner: 3,
    intermediate: 4,
    advanced: 5
  };

  return defaultSets[level || 'beginner'];
}

/**
 * Obtiene el tiempo de descanso recomendado
 */
function getRestTime(
  exercise: ExerciseTemplate,
  goal: FitnessGoal | null | undefined
): string {
  // Si el ejercicio tiene recomendación específica, usarla
  if (exercise.restTime) {
    return exercise.restTime;
  }

  // Recomendaciones por defecto según objetivo
  const defaultRestTime: Record<FitnessGoal, string> = {
    strength: '3-5 min',
    muscle_gain: '60-90 seg',
    weight_loss: '30-60 seg',
    endurance: '30-45 seg',
    general_fitness: '60 seg'
  };

  return defaultRestTime[goal || 'general_fitness'];
}

/**
 * Genera recomendaciones completas para un ejercicio
 */
export function getExerciseRecommendations(
  exercise: ExerciseTemplate,
  profile: UserProfile | null
): ExerciseRecommendation {
  const sets = calculateSets(exercise, profile?.fitnessLevel);
  const reps = calculateReps(exercise, profile?.fitnessGoal);
  const weight = calculateInitialWeight(exercise, profile);
  const restTime = getRestTime(exercise, profile?.fitnessGoal);

  return {
    sets,
    reps,
    weight,
    restTime
  };
}

/**
 * Genera un array de sets pre-configurados para un ejercicio
 */
export function generatePreConfiguredSets(
  exercise: ExerciseTemplate,
  profile: UserProfile | null
): Array<{ reps: number; weight: number }> {
  const recommendation = getExerciseRecommendations(exercise, profile);
  
  return Array.from({ length: recommendation.sets }, () => ({
    reps: recommendation.reps,
    weight: recommendation.weight
  }));
}

/**
 * Obtiene un mensaje explicativo de las recomendaciones
 */
export function getRecommendationExplanation(
  exercise: ExerciseTemplate,
  profile: UserProfile | null
): string {
  const recommendation = getExerciseRecommendations(exercise, profile);
  
  if (!profile) {
    return `Recomendación básica: ${recommendation.sets} series de ${recommendation.reps} repeticiones`;
  }

  const levelText = {
    beginner: 'principiante',
    intermediate: 'intermedio',
    advanced: 'avanzado'
  }[profile.fitnessLevel || 'beginner'];

  const goalText = {
    strength: 'ganar fuerza',
    muscle_gain: 'ganar músculo',
    weight_loss: 'perder peso',
    endurance: 'mejorar resistencia',
    general_fitness: 'fitness general'
  }[profile.fitnessGoal || 'general_fitness'];

  return `Recomendado para nivel ${levelText} con objetivo de ${goalText}: ${recommendation.sets} series de ${recommendation.reps} repeticiones con ${recommendation.weight}kg`;
}

/**
 * Ajusta el peso para la siguiente serie (progresión)
 */
export function suggestProgressiveWeight(
  currentWeight: number,
  setNumber: number,
  totalSets: number,
  goal: FitnessGoal | null | undefined
): number {
  // Para fuerza, usar peso constante o piramidal
  if (goal === 'strength') {
    return currentWeight;
  }

  // Para hipertrofia, mantener peso constante
  if (goal === 'muscle_gain') {
    return currentWeight;
  }

  // Para resistencia, puede reducir peso en últimas series
  if (goal === 'endurance' && setNumber > totalSets - 2) {
    return Math.max(currentWeight * 0.9, 0);
  }

  return currentWeight;
}
