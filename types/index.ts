export type SetType = 
  | 'normal'      // Serie normal
  | 'warmup'      // Serie de calentamiento
  | 'dropset'     // Drop set (reducir peso)
  | 'failure'     // Serie al fallo
  | 'amrap'       // As Many Reps As Possible
  | 'rest-pause'  // Rest-pause
  | 'cluster';    // Cluster set

export interface Set {
  reps: number;
  weight?: number;
  type?: SetType; // Tipo de serie (por defecto 'normal')
  notes?: string; // Notas específicas de la serie
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
  useSmartRest?: boolean; // Usar descanso inteligente para este ejercicio
  tempo?: string; // Tempo de ejecución, ej: "3-1-2-0" (excéntrica-pausa arriba-concéntrica-pausa abajo)
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
    actualRestTimes?: number[]; // Tiempo real de descanso después de cada serie (vs planificado)
    notes?: string;
  }[];
  notes?: string;
  totalDuration?: number; // Duración total del entrenamiento en segundos
  totalPausedTime?: number; // Tiempo total pausado en el entrenamiento
  /**
   * Volumen total levantado en la sesión (kg)
   * Calculado como Σ(reps × peso) de todos los ejercicios
   */
  totalVolume?: number;
}

export type Session = WorkoutSession;

export type {
  FitnessGoal,
  FitnessLevel,
  Gender,
  UserProfile,
  WeightEntry,
} from './userProfile';

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
