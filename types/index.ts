export interface Set {
  reps: number;
  weight?: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  notes?: string;
  equipment?: string; // Equipamiento necesario
  technique?: string[]; // Recomendaciones de técnica
  recommendedSets?: string; // Ej: "3-4 series"
  recommendedReps?: string; // Ej: "8-12 repeticiones"
  restTime?: string; // Ej: "60-90 segundos"
  restBetweenSets?: number; // Descanso entre series en segundos (override por ejercicio)
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  image?: string; // URL o base64 de la imagen
  exercises: Exercise[];
  restBetweenSets?: number; // segundos de descanso entre series
  restBetweenExercises?: number; // segundos de descanso entre ejercicios
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutSession {
  id: string;
  routineId: string;
  routineName?: string;
  date: Date;
  startedAt?: Date;
  completedAt?: Date;
  exercises: {
    exerciseId: string;
    exerciseName?: string; // Nombre del ejercicio para facilitar búsqueda
    completedSets: number;
    actualReps: number[];
    actualWeight: number[];
    setDurations?: number[]; // Duración de cada serie en segundos
    pauseDurations?: number[]; // Tiempo total pausado en cada serie en segundos
    notes?: string;
  }[];
  notes?: string;
  totalDuration?: number; // Duración total del entrenamiento en segundos
  totalPausedTime?: number; // Tiempo total pausado en el entrenamiento
}

export type FitnessGoal = 
  | 'muscle_gain'      // Ganar músculo/hipertrofia
  | 'strength'         // Ganar fuerza
  | 'weight_loss'      // Perder peso
  | 'endurance'        // Resistencia
  | 'general_fitness'; // Fitness general

export type FitnessLevel = 
  | 'beginner'         // Principiante (0-6 meses)
  | 'intermediate'     // Intermedio (6-24 meses)
  | 'advanced';        // Avanzado (2+ años)

export type Gender = 'male' | 'female' | 'other';

export interface UserProfile {
  id: string;
  userId: string;
  // Datos personales
  age?: number;
  gender?: Gender;
  height?: number;        // en cm
  weight?: number;        // en kg
  // Objetivos y nivel
  fitnessGoal?: FitnessGoal;
  fitnessLevel?: FitnessLevel;
  // Datos adicionales
  weeklyWorkouts?: number; // Días que puede entrenar por semana
  // Metadatos
  createdAt: Date;
  updatedAt: Date;
}

// Sistema de Logros/Badges
export type AchievementCategory = 'consistency' | 'volume' | 'streak' | 'milestone';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon: string; // Nombre del ícono de lucide-react
  target: number; // Valor objetivo para desbloquear
  unit: string; // Ej: "entrenamientos", "kg", "días"
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number; // Valor actual del usuario
}

export interface Streak {
  current: number; // Racha actual en días
  longest: number; // Racha más larga alcanzada
  lastWorkoutDate?: Date;
}
