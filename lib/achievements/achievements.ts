import {
  Achievement,
  AchievementCategory,
  AchievementTier,
  Streak,
  WorkoutSession,
} from "@/types";
import logger from "@/lib/logger";
import {
  calculateTotalVolume,
  calculateSessionVolume,
  calculateStreak as calculateCurrentStreak,
} from "@/lib/utils/dateUtils";

// Definición de todos los logros disponibles
const ACHIEVEMENT_DEFINITIONS: Omit<
  Achievement,
  "unlocked" | "unlockedAt" | "progress"
>[] = [
  // LOGROS DE CONSISTENCIA
  {
    id: "consistency_bronze",
    name: "Primer Paso",
    description: "Completa tu primera semana de entrenamiento",
    category: "consistency",
    tier: "bronze",
    icon: "Footprints",
    target: 3,
    unit: "entrenamientos",
  },
  {
    id: "consistency_silver",
    name: "Compromiso Sólido",
    description: "Completa 4 semanas de entrenamiento",
    category: "consistency",
    tier: "silver",
    icon: "Shield",
    target: 12,
    unit: "entrenamientos",
  },
  {
    id: "consistency_gold",
    name: "Dedicación Total",
    description: "Completa 12 semanas de entrenamiento",
    category: "consistency",
    tier: "gold",
    icon: "Crown",
    target: 36,
    unit: "entrenamientos",
  },
  {
    id: "consistency_platinum",
    name: "Guerrero Incansable",
    description: "Completa 6 meses de entrenamiento",
    category: "consistency",
    tier: "platinum",
    icon: "Sword",
    target: 72,
    unit: "entrenamientos",
  },
  {
    id: "consistency_diamond",
    name: "Leyenda del Fitness",
    description: "Completa 1 año de entrenamiento",
    category: "consistency",
    tier: "diamond",
    icon: "Gem",
    target: 150,
    unit: "entrenamientos",
  },

  // LOGROS DE VOLUMEN
  {
    id: "volume_bronze",
    name: "Fuerza Inicial",
    description: "Levanta 1,000 kg en total",
    category: "volume",
    tier: "bronze",
    icon: "Dumbbell",
    target: 1000,
    unit: "kg",
  },
  {
    id: "volume_silver",
    name: "Powerlifter Emergente",
    description: "Levanta 10,000 kg en total",
    category: "volume",
    tier: "silver",
    icon: "Anvil",
    target: 10000,
    unit: "kg",
  },
  {
    id: "volume_gold",
    name: "Titán de Hierro",
    description: "Levanta 50,000 kg en total",
    category: "volume",
    tier: "gold",
    icon: "Mountain",
    target: 50000,
    unit: "kg",
  },
  {
    id: "volume_platinum",
    name: "Fuerza Sobrehumana",
    description: "Levanta 100,000 kg en total",
    category: "volume",
    tier: "platinum",
    icon: "Zap",
    target: 100000,
    unit: "kg",
  },
  {
    id: "volume_diamond",
    name: "Monstruo del Volumen",
    description: "Levanta 250,000 kg en total",
    category: "volume",
    tier: "diamond",
    icon: "Flame",
    target: 250000,
    unit: "kg",
  },

  // LOGROS DE RACHAS
  {
    id: "streak_bronze",
    name: "Comenzando Fuerte",
    description: "Entrena 3 días consecutivos",
    category: "streak",
    tier: "bronze",
    icon: "CalendarCheck",
    target: 3,
    unit: "días",
  },
  {
    id: "streak_silver",
    name: "Semana Perfecta",
    description: "Entrena 7 días consecutivos",
    category: "streak",
    tier: "silver",
    icon: "CalendarDays",
    target: 7,
    unit: "días",
  },
  {
    id: "streak_gold",
    name: "Mes Imparable",
    description: "Entrena 30 días consecutivos",
    category: "streak",
    tier: "gold",
    icon: "Calendar",
    target: 30,
    unit: "días",
  },
  {
    id: "streak_platinum",
    name: "Máquina de Entrenar",
    description: "Entrena 60 días consecutivos",
    category: "streak",
    tier: "platinum",
    icon: "CalendarRange",
    target: 60,
    unit: "días",
  },
  {
    id: "streak_diamond",
    name: "Disciplina de Acero",
    description: "Entrena 100 días consecutivos",
    category: "streak",
    tier: "diamond",
    icon: "CalendarHeart",
    target: 100,
    unit: "días",
  },

  // LOGROS DE HITOS
  {
    id: "milestone_first",
    name: "¡Bienvenido!",
    description: "Completa tu primer entrenamiento",
    category: "milestone",
    tier: "bronze",
    icon: "PartyPopper",
    target: 1,
    unit: "entrenamientos",
  },
  {
    id: "milestone_10",
    name: "Doble Dígito",
    description: "Completa 10 entrenamientos",
    category: "milestone",
    tier: "silver",
    icon: "Trophy",
    target: 10,
    unit: "entrenamientos",
  },
  {
    id: "milestone_50",
    name: "Medio Centenar",
    description: "Completa 50 entrenamientos",
    category: "milestone",
    tier: "gold",
    icon: "Award",
    target: 50,
    unit: "entrenamientos",
  },
  {
    id: "milestone_100",
    name: "Centurión",
    description: "Completa 100 entrenamientos",
    category: "milestone",
    tier: "platinum",
    icon: "Star",
    target: 100,
    unit: "entrenamientos",
  },
  {
    id: "milestone_250",
    name: "Élite del Fitness",
    description: "Completa 250 entrenamientos",
    category: "milestone",
    tier: "diamond",
    icon: "Sparkles",
    target: 250,
    unit: "entrenamientos",
  },
];

/**
 * Calcula la racha actual y la más larga de entrenamientos consecutivos
 */
export function calculateStreak(sessions: WorkoutSession[]): Streak {
  logger.log(
    "[Achievements] Calculating streak for",
    sessions.length,
    "sessions",
  );

  if (sessions.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Ordenar sesiones por fecha (más reciente primero)
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // Obtener fechas únicas (un entrenamiento por día)
  const uniqueDates = Array.from(
    new Set(sortedSessions.map((s) => new Date(s.date).toDateString())),
  ).map((dateStr) => new Date(dateStr));

  let longestStreak = 0;
  let tempStreak = 1;

  if (uniqueDates.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Racha actual: delega en dateUtils.calculateStreak para tener una sola
  // fuente de verdad (antes había dos implementaciones independientes que
  // podían dar números distintos con los mismos datos).
  const currentStreak = calculateCurrentStreak(sessions);

  // Calcular racha más larga
  longestStreak = currentStreak;

  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = new Date(uniqueDates[i]);
    currentDate.setHours(0, 0, 0, 0);

    const previousDate = new Date(uniqueDates[i - 1]);
    previousDate.setHours(0, 0, 0, 0);

    const diff = Math.floor(
      (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  logger.log(
    "[Achievements] Current streak:",
    currentStreak,
    "| Longest:",
    longestStreak,
  );

  return {
    current: currentStreak,
    longest: longestStreak,
    lastWorkoutDate: sortedSessions[0].date,
  };
}

/**
 * Encuentra la fecha en que se alcanzó por primera vez una racha de al
 * menos `targetLength` días consecutivos.
 */
function findStreakUnlockDate(
  sessions: WorkoutSession[],
  targetLength: number,
): Date | undefined {
  const uniqueDatesAsc = Array.from(
    new Set(sessions.map((s) => new Date(s.date).toDateString())),
  )
    .map((d) => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime());

  if (uniqueDatesAsc.length === 0) return undefined;

  let runLength = 1;
  if (runLength >= targetLength) return uniqueDatesAsc[0];

  for (let i = 1; i < uniqueDatesAsc.length; i++) {
    const diffDays = Math.round(
      (uniqueDatesAsc[i].getTime() - uniqueDatesAsc[i - 1].getTime()) /
        (1000 * 60 * 60 * 24),
    );
    runLength = diffDays === 1 ? runLength + 1 : 1;
    if (runLength >= targetLength) return uniqueDatesAsc[i];
  }
  return undefined;
}

/**
 * Calcula el progreso y desbloqueo de todos los logros
 */
export function calculateAchievements(
  sessions: WorkoutSession[],
): Achievement[] {
  const totalSessions = sessions.length;
  const totalVolume = calculateTotalVolume(sessions);
  const streak = calculateStreak(sessions);

  // Sesiones ordenadas ascendente + volumen acumulado, para poder ubicar
  // exactamente cuándo (con qué sesión) se cruzó cada umbral.
  const sortedAsc = [...sessions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  let cumVolume = 0;
  const cumVolumes = sortedAsc.map((s) => {
    cumVolume += calculateSessionVolume(s.exercises);
    return cumVolume;
  });

  return ACHIEVEMENT_DEFINITIONS.map((def) => {
    let progress = 0;
    let unlockedAt: Date | undefined;

    switch (def.category) {
      case "consistency":
      case "milestone":
        progress = totalSessions;
        if (progress >= def.target) unlockedAt = sortedAsc[def.target - 1]?.date;
        break;
      case "volume": {
        progress = totalVolume;
        if (progress >= def.target) {
          const idx = cumVolumes.findIndex((v) => v >= def.target);
          unlockedAt = idx !== -1 ? sortedAsc[idx].date : undefined;
        }
        break;
      }
      case "streak":
        progress = streak.longest;
        if (progress >= def.target) unlockedAt = findStreakUnlockDate(sessions, def.target);
        break;
    }

    const unlocked = progress >= def.target;

    return {
      ...def,
      progress,
      unlocked,
      unlockedAt: unlocked ? unlockedAt : undefined,
    };
  });
}

/**
 * Obtiene los logros desbloqueados recientemente (últimos 5)
 */
export function getRecentAchievements(
  achievements: Achievement[],
): Achievement[] {
  return achievements
    .filter((a) => a.unlocked)
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
    bronze: "#CD7F32",
    silver: "#C0C0C0",
    gold: "#FFD700",
    platinum: "#E5E4E2",
    diamond: "#B9F2FF",
  };
  return colors[tier];
}

/**
 * Obtiene el porcentaje de logros completados por categoría
 */
export function getCategoryProgress(
  achievements: Achievement[],
  category: AchievementCategory,
): number {
  const categoryAchievements = achievements.filter(
    (a) => a.category === category,
  );
  const unlockedCount = categoryAchievements.filter((a) => a.unlocked).length;
  return categoryAchievements.length > 0
    ? Math.round((unlockedCount / categoryAchievements.length) * 100)
    : 0;
}
