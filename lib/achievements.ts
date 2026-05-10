import { Achievement, AchievementCategory, AchievementTier, Streak, WorkoutSession } from '@/types';

// Definición de todos los logros disponibles
const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
  // LOGROS DE CONSISTENCIA
  {
    id: 'consistency_bronze',
    name: 'Primer Paso',
    description: 'Completa tu primera semana de entrenamiento',
    category: 'consistency',
    tier: 'bronze',
    icon: 'Footprints',
    target: 3,
    unit: 'entrenamientos'
  },
  {
    id: 'consistency_silver',
    name: 'Compromiso Sólido',
    description: 'Completa 4 semanas de entrenamiento',
    category: 'consistency',
    tier: 'silver',
    icon: 'Shield',
    target: 12,
    unit: 'entrenamientos'
  },
  {
    id: 'consistency_gold',
    name: 'Dedicación Total',
    description: 'Completa 12 semanas de entrenamiento',
    category: 'consistency',
    tier: 'gold',
    icon: 'Crown',
    target: 36,
    unit: 'entrenamientos'
  },
  {
    id: 'consistency_platinum',
    name: 'Guerrero Incansable',
    description: 'Completa 6 meses de entrenamiento',
    category: 'consistency',
    tier: 'platinum',
    icon: 'Sword',
    target: 72,
    unit: 'entrenamientos'
  },
  {
    id: 'consistency_diamond',
    name: 'Leyenda del Fitness',
    description: 'Completa 1 año de entrenamiento',
    category: 'consistency',
    tier: 'diamond',
    icon: 'Gem',
    target: 150,
    unit: 'entrenamientos'
  },

  // LOGROS DE VOLUMEN
  {
    id: 'volume_bronze',
    name: 'Fuerza Inicial',
    description: 'Levanta 1,000 kg en total',
    category: 'volume',
    tier: 'bronze',
    icon: 'Dumbbell',
    target: 1000,
    unit: 'kg'
  },
  {
    id: 'volume_silver',
    name: 'Powerlifter Emergente',
    description: 'Levanta 10,000 kg en total',
    category: 'volume',
    tier: 'silver',
    icon: 'Anvil',
    target: 10000,
    unit: 'kg'
  },
  {
    id: 'volume_gold',
    name: 'Titán de Hierro',
    description: 'Levanta 50,000 kg en total',
    category: 'volume',
    tier: 'gold',
    icon: 'Mountain',
    target: 50000,
    unit: 'kg'
  },
  {
    id: 'volume_platinum',
    name: 'Fuerza Sobrehumana',
    description: 'Levanta 100,000 kg en total',
    category: 'volume',
    tier: 'platinum',
    icon: 'Zap',
    target: 100000,
    unit: 'kg'
  },
  {
    id: 'volume_diamond',
    name: 'Monstruo del Volumen',
    description: 'Levanta 250,000 kg en total',
    category: 'volume',
    tier: 'diamond',
    icon: 'Flame',
    target: 250000,
    unit: 'kg'
  },

  // LOGROS DE RACHAS
  {
    id: 'streak_bronze',
    name: 'Comenzando Fuerte',
    description: 'Entrena 3 días consecutivos',
    category: 'streak',
    tier: 'bronze',
    icon: 'CalendarCheck',
    target: 3,
    unit: 'días'
  },
  {
    id: 'streak_silver',
    name: 'Semana Perfecta',
    description: 'Entrena 7 días consecutivos',
    category: 'streak',
    tier: 'silver',
    icon: 'CalendarDays',
    target: 7,
    unit: 'días'
  },
  {
    id: 'streak_gold',
    name: 'Mes Imparable',
    description: 'Entrena 30 días consecutivos',
    category: 'streak',
    tier: 'gold',
    icon: 'Calendar',
    target: 30,
    unit: 'días'
  },
  {
    id: 'streak_platinum',
    name: 'Máquina de Entrenar',
    description: 'Entrena 60 días consecutivos',
    category: 'streak',
    tier: 'platinum',
    icon: 'CalendarRange',
    target: 60,
    unit: 'días'
  },
  {
    id: 'streak_diamond',
    name: 'Disciplina de Acero',
    description: 'Entrena 100 días consecutivos',
    category: 'streak',
    tier: 'diamond',
    icon: 'CalendarHeart',
    target: 100,
    unit: 'días'
  },

  // LOGROS DE HITOS
  {
    id: 'milestone_first',
    name: '¡Bienvenido!',
    description: 'Completa tu primer entrenamiento',
    category: 'milestone',
    tier: 'bronze',
    icon: 'PartyPopper',
    target: 1,
    unit: 'entrenamientos'
  },
  {
    id: 'milestone_10',
    name: 'Doble Dígito',
    description: 'Completa 10 entrenamientos',
    category: 'milestone',
    tier: 'silver',
    icon: 'Trophy',
    target: 10,
    unit: 'entrenamientos'
  },
  {
    id: 'milestone_50',
    name: 'Medio Centenar',
    description: 'Completa 50 entrenamientos',
    category: 'milestone',
    tier: 'gold',
    icon: 'Award',
    target: 50,
    unit: 'entrenamientos'
  },
  {
    id: 'milestone_100',
    name: 'Centurión',
    description: 'Completa 100 entrenamientos',
    category: 'milestone',
    tier: 'platinum',
    icon: 'Star',
    target: 100,
    unit: 'entrenamientos'
  },
  {
    id: 'milestone_250',
    name: 'Élite del Fitness',
    description: 'Completa 250 entrenamientos',
    category: 'milestone',
    tier: 'diamond',
    icon: 'Sparkles',
    target: 250,
    unit: 'entrenamientos'
  }
];

/**
 * Calcula el volumen total levantado en todas las sesiones
 */
export function calculateTotalVolume(sessions: WorkoutSession[]): number {
  console.log('[Achievements] Calculating volume for', sessions.length, 'sessions');
  
  return sessions.reduce((total, session) => {
    if (!session.exercises || !Array.isArray(session.exercises)) {
      console.log('[Achievements] Session has no exercises:', session.id);
      return total;
    }
    
    const sessionVolume = session.exercises.reduce((exerciseTotal, exercise) => {
      // Verificar diferentes formatos de datos y usar checks seguros
      const actualWeights: number[] = Array.isArray(exercise.actualWeight)
        ? exercise.actualWeight
        : Array.isArray((exercise as any).actualWeights)
        ? (exercise as any).actualWeights
        : [];

      const actualReps: number[] = Array.isArray(exercise.actualReps)
        ? exercise.actualReps
        : Array.isArray((exercise as any).actualReps)
        ? (exercise as any).actualReps
        : [];

      if (!Array.isArray(actualWeights) || !Array.isArray(actualReps)) {
        console.log('[Achievements] Invalid exercise data format:', exercise);
        return exerciseTotal;
      }

      const exerciseVolume = actualWeights.reduce((setTotal, weight, index) => {
        const reps = actualReps[index] || 0;
        const setVolume = (weight || 0) * reps;
        console.log(`[Achievements] Set ${index}: ${weight}kg x ${reps} reps = ${setVolume}kg`);
        return setTotal + setVolume;
      }, 0);
      
      console.log(`[Achievements] Exercise ${exercise.exerciseName || exercise.exerciseId} volume: ${exerciseVolume}kg`);
      return exerciseTotal + exerciseVolume;
    }, 0);
    
    console.log(`[Achievements] Session ${session.id} volume: ${sessionVolume}kg`);
    return total + sessionVolume;
  }, 0);
}

/**
 * Calcula la racha actual y la más larga de entrenamientos consecutivos
 */
export function calculateStreak(sessions: WorkoutSession[]): Streak {
  console.log('[Achievements] Calculating streak for', sessions.length, 'sessions');
  
  if (sessions.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Ordenar sesiones por fecha (más reciente primero)
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  console.log('[Achievements] Sorted sessions:', sortedSessions.map(s => ({
    id: s.id,
    date: new Date(s.date).toDateString()
  })));

  // Obtener fechas únicas (un entrenamiento por día)
  const uniqueDates = Array.from(new Set(
    sortedSessions.map(s => new Date(s.date).toDateString())
  )).map(dateStr => new Date(dateStr));

  console.log('[Achievements] Unique dates:', uniqueDates.map(d => d.toDateString()));

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (uniqueDates.length === 0) {
    return { current: 0, longest: 0 };
  }

  const lastWorkoutDate = new Date(uniqueDates[0]);
  lastWorkoutDate.setHours(0, 0, 0, 0);

  // Calcular racha actual
  const daysDifference = Math.floor((today.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24));
  
  console.log('[Achievements] Days since last workout:', daysDifference);
  console.log('[Achievements] Last workout date:', lastWorkoutDate.toDateString());
  console.log('[Achievements] Today:', today.toDateString());
  
  if (daysDifference <= 1) {
    // La racha sigue activa (hoy o ayer)
    currentStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i]);
      currentDate.setHours(0, 0, 0, 0);
      
      const previousDate = new Date(uniqueDates[i - 1]);
      previousDate.setHours(0, 0, 0, 0);

      const diff = Math.floor((previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calcular racha más larga
  longestStreak = currentStreak;

  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = new Date(uniqueDates[i]);
    currentDate.setHours(0, 0, 0, 0);
    
    const previousDate = new Date(uniqueDates[i - 1]);
    previousDate.setHours(0, 0, 0, 0);

    const diff = Math.floor((previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  console.log('[Achievements] Current streak:', currentStreak);
  console.log('[Achievements] Longest streak:', longestStreak);

  return {
    current: currentStreak,
    longest: longestStreak,
    lastWorkoutDate: sortedSessions[0].date
  };
}

/**
 * Calcula el progreso y desbloqueo de todos los logros
 */
export function calculateAchievements(sessions: WorkoutSession[]): Achievement[] {
  const totalSessions = sessions.length;
  const totalVolume = calculateTotalVolume(sessions);
  const streak = calculateStreak(sessions);

  return ACHIEVEMENT_DEFINITIONS.map(def => {
    let progress = 0;
    let unlocked = false;

    switch (def.category) {
      case 'consistency':
        progress = totalSessions;
        break;
      case 'volume':
        progress = totalVolume;
        break;
      case 'streak':
        progress = streak.longest;
        break;
      case 'milestone':
        progress = totalSessions;
        break;
    }

    unlocked = progress >= def.target;

    return {
      ...def,
      progress,
      unlocked,
      unlockedAt: unlocked ? new Date() : undefined // En producción, guardarías la fecha real
    };
  });
}

/**
 * Obtiene los logros desbloqueados recientemente (últimos 5)
 */
export function getRecentAchievements(achievements: Achievement[]): Achievement[] {
  return achievements
    .filter(a => a.unlocked)
    .sort((a, b) => {
      if (!a.unlockedAt || !b.unlockedAt) return 0;
      return b.unlockedAt.getTime() - a.unlockedAt.getTime();
    })
    .slice(0, 5);
}

/**
 * Obtiene el color del tier
 */
export function getTierColor(tier: AchievementTier): string {
  const colors = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF'
  };
  return colors[tier];
}

/**
 * Obtiene el porcentaje de logros completados por categoría
 */
export function getCategoryProgress(achievements: Achievement[], category: AchievementCategory): number {
  const categoryAchievements = achievements.filter(a => a.category === category);
  const unlockedCount = categoryAchievements.filter(a => a.unlocked).length;
  return categoryAchievements.length > 0 
    ? Math.round((unlockedCount / categoryAchievements.length) * 100)
    : 0;
}
