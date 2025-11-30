import type { FitnessGoal, FitnessLevel, UserProfile } from '@/types';

export interface RoutineRecommendation {
  id: string;
  name: string;
  description: string;
  reason: string; // Por qué se recomienda esta rutina
  daysPerWeek: number;
  difficulty: FitnessLevel;
  goals: FitnessGoal[];
  splitType?: string;
}

export const RECOMMENDED_ROUTINES: RoutineRecommendation[] = [
  // PRINCIPIANTE
  {
    id: 'full-body-beginner',
    name: 'Full Body - Principiante',
    description: 'Rutina de cuerpo completo ideal para comenzar. Enfoca todos los grupos musculares principales en cada sesión.',
    reason: 'Perfecta para aprender los movimientos básicos y crear una base sólida',
    daysPerWeek: 3,
    difficulty: 'beginner',
    goals: ['general_fitness', 'muscle_gain', 'strength'],
    splitType: 'Full Body'
  },
  {
    id: 'upper-lower-beginner',
    name: 'Torso/Pierna - Principiante',
    description: 'Divide el entrenamiento en días de tren superior e inferior. Mayor frecuencia muscular.',
    reason: 'Excelente para progresar desde principiante a intermedio',
    daysPerWeek: 4,
    difficulty: 'beginner',
    goals: ['muscle_gain', 'strength', 'general_fitness'],
    splitType: 'Upper/Lower'
  },

  // INTERMEDIO
  {
    id: 'ppl',
    name: 'Push Pull Legs',
    description: 'Divide el entrenamiento en empuje (pecho/hombros/tríceps), tirón (espalda/bíceps) y piernas.',
    reason: 'Ideal para hipertrofia con buena frecuencia muscular',
    daysPerWeek: 6,
    difficulty: 'intermediate',
    goals: ['muscle_gain', 'strength'],
    splitType: 'PPL'
  },
  {
    id: 'upper-lower-intermediate',
    name: 'Torso/Pierna - Intermedio',
    description: 'Versión más avanzada del split torso/pierna con mayor volumen y ejercicios.',
    reason: 'Excelente balance entre frecuencia y volumen para crecimiento muscular',
    daysPerWeek: 4,
    difficulty: 'intermediate',
    goals: ['muscle_gain', 'strength'],
    splitType: 'Upper/Lower'
  },
  {
    id: 'arnold-split',
    name: 'Arnold Split',
    description: 'Pecho/Espalda, Hombros/Brazos, Piernas. Popularizado por Arnold Schwarzenegger.',
    reason: 'Gran volumen por grupo muscular con suficiente recuperación',
    daysPerWeek: 6,
    difficulty: 'intermediate',
    goals: ['muscle_gain'],
    splitType: 'Arnold'
  },

  // AVANZADO
  {
    id: 'bro-split',
    name: 'Bro Split (5 días)',
    description: 'Un grupo muscular por día: Pecho, Espalda, Hombros, Piernas, Brazos.',
    reason: 'Máximo volumen por grupo muscular para atletas avanzados',
    daysPerWeek: 5,
    difficulty: 'advanced',
    goals: ['muscle_gain'],
    splitType: 'Bro Split'
  },
  {
    id: 'ppl-advanced',
    name: 'Push Pull Legs - Avanzado',
    description: 'PPL de alta frecuencia y volumen para atletas experimentados.',
    reason: 'Alta frecuencia muscular (2x semana) con volumen elevado',
    daysPerWeek: 6,
    difficulty: 'advanced',
    goals: ['muscle_gain', 'strength'],
    splitType: 'PPL'
  },

  // FUERZA
  {
    id: 'strength-531',
    name: 'Rutina de Fuerza 5/3/1',
    description: 'Enfocada en los 4 grandes levantamientos: Sentadilla, Press Banca, Peso Muerto, Press Militar.',
    reason: 'Periodización probada para ganar fuerza máxima',
    daysPerWeek: 4,
    difficulty: 'intermediate',
    goals: ['strength'],
    splitType: 'Strength'
  },
  {
    id: 'powerlifting',
    name: 'Powerlifting',
    description: 'Enfoque en Sentadilla, Press de Banca y Peso Muerto con periodización.',
    reason: 'Diseñada específicamente para maximizar tu 1RM',
    daysPerWeek: 3,
    difficulty: 'advanced',
    goals: ['strength'],
    splitType: 'Powerlifting'
  },

  // PÉRDIDA DE PESO
  {
    id: 'circuit-training',
    name: 'Entrenamiento en Circuito',
    description: 'Circuitos de alta intensidad combinando fuerza y cardio.',
    reason: 'Maximiza la quema de calorías mientras preserva músculo',
    daysPerWeek: 4,
    difficulty: 'beginner',
    goals: ['weight_loss', 'endurance'],
    splitType: 'Circuit'
  },
  {
    id: 'hiit-strength',
    name: 'HIIT + Fuerza',
    description: 'Combina entrenamiento de fuerza con intervalos de alta intensidad.',
    reason: 'Quema grasa eficientemente manteniendo la masa muscular',
    daysPerWeek: 5,
    difficulty: 'intermediate',
    goals: ['weight_loss', 'endurance'],
    splitType: 'HIIT'
  },

  // RESISTENCIA
  {
    id: 'endurance-circuit',
    name: 'Circuito de Resistencia',
    description: 'Altas repeticiones, descansos cortos, enfoque en resistencia muscular.',
    reason: 'Mejora la capacidad cardiovascular y resistencia muscular',
    daysPerWeek: 4,
    difficulty: 'intermediate',
    goals: ['endurance', 'general_fitness'],
    splitType: 'Endurance'
  }
];

/**
 * Recomienda rutinas basándose en el perfil del usuario
 */
export function getRecommendedRoutines(profile: UserProfile | null): RoutineRecommendation[] {
  if (!profile) {
    // Si no hay perfil, mostrar rutinas básicas para principiantes
    return RECOMMENDED_ROUTINES.filter(r => r.difficulty === 'beginner').slice(0, 3);
  }

  const { fitnessGoal, fitnessLevel, weeklyWorkouts } = profile;
  
  let recommendations = [...RECOMMENDED_ROUTINES];

  // Filtrar por nivel de experiencia
  if (fitnessLevel) {
    recommendations = recommendations.filter(r => {
      if (fitnessLevel === 'beginner') {
        return r.difficulty === 'beginner';
      } else if (fitnessLevel === 'intermediate') {
        return r.difficulty === 'beginner' || r.difficulty === 'intermediate';
      } else {
        return true; // Avanzado puede hacer cualquiera
      }
    });
  }

  // Filtrar por objetivo
  if (fitnessGoal) {
    recommendations = recommendations.filter(r => r.goals.includes(fitnessGoal));
  }

  // Filtrar por días disponibles
  if (weeklyWorkouts) {
    recommendations = recommendations.filter(r => r.daysPerWeek <= weeklyWorkouts);
  }

  // Ordenar por relevancia:
  // 1. Primero las que coinciden exactamente con el nivel
  // 2. Luego las que coinciden con los días disponibles
  recommendations.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Bonus si coincide exactamente con el nivel
    if (fitnessLevel && a.difficulty === fitnessLevel) scoreA += 3;
    if (fitnessLevel && b.difficulty === fitnessLevel) scoreB += 3;

    // Bonus si los días coinciden exactamente
    if (weeklyWorkouts && a.daysPerWeek === weeklyWorkouts) scoreA += 2;
    if (weeklyWorkouts && b.daysPerWeek === weeklyWorkouts) scoreB += 2;

    // Bonus si el objetivo principal está en la lista
    if (fitnessGoal && a.goals[0] === fitnessGoal) scoreA += 1;
    if (fitnessGoal && b.goals[0] === fitnessGoal) scoreB += 1;

    return scoreB - scoreA;
  });

  // Retornar máximo 6 recomendaciones
  return recommendations.slice(0, 6);
}

/**
 * Obtiene información detallada de por qué se recomienda una rutina
 */
export function getRecommendationReason(
  routine: RoutineRecommendation,
  profile: UserProfile | null
): string {
  if (!profile) return routine.reason;

  const reasons: string[] = [routine.reason];

  // Agregar razón basada en objetivo
  if (profile.fitnessGoal) {
    const goalReasons: Record<FitnessGoal, string> = {
      muscle_gain: 'Esta rutina está optimizada para hipertrofia muscular',
      strength: 'Diseñada para maximizar tus ganancias de fuerza',
      weight_loss: 'Ideal para quemar calorías mientras mantienes músculo',
      endurance: 'Mejora tu resistencia cardiovascular y muscular',
      general_fitness: 'Balance perfecto para un fitness integral'
    };
    
    if (routine.goals.includes(profile.fitnessGoal)) {
      reasons.push(goalReasons[profile.fitnessGoal]);
    }
  }

  // Agregar razón basada en días disponibles
  if (profile.weeklyWorkouts && routine.daysPerWeek === profile.weeklyWorkouts) {
    reasons.push(`Se ajusta perfectamente a tus ${profile.weeklyWorkouts} días disponibles`);
  }

  return reasons.join('. ');
}
