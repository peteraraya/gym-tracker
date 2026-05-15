/**
 * Gestor de Logros - Sistema automático de detección y notificación de logros
 */

import { WorkoutSession, Achievement } from "@/types";
import { calculateAchievements, calculateStreak } from "./achievements";
import {
  calculateTotalVolume,
  calculateSessionVolume,
} from "../utils/dateUtils";
import logger from "../logger";

interface AchievementNotification {
  achievement: Achievement;
  isNew: boolean;
}

class AchievementManager {
  private previousAchievements: Achievement[] = [];

  /**
   * Procesa una nueva sesión y detecta logros desbloqueados
   */
  processNewSession(
    newSession: WorkoutSession,
    allSessions: WorkoutSession[],
  ): AchievementNotification[] {
    logger.log("[AchievementManager] Processing new session:", newSession.id);

    // Calcular logros actuales
    const currentAchievements = calculateAchievements(allSessions);

    // Detectar nuevos logros desbloqueados
    const newlyUnlocked: AchievementNotification[] = [];

    currentAchievements.forEach((current) => {
      const previous = this.previousAchievements.find(
        (p) => p.id === current.id,
      );

      if (current.unlocked && (!previous || !previous.unlocked)) {
        logger.log(
          "[AchievementManager] New achievement unlocked:",
          current.name,
        );
        newlyUnlocked.push({
          achievement: current,
          isNew: true,
        });
      }
    });

    // Actualizar cache de logros previos
    this.previousAchievements = currentAchievements;

    return newlyUnlocked;
  }

  /**
   * Inicializa el manager con los logros actuales
   */
  initialize(sessions: WorkoutSession[]): void {
    logger.log(
      "[AchievementManager] Initializing with",
      sessions.length,
      "sessions",
    );
    this.previousAchievements = calculateAchievements(sessions);
  }

  /**
   * Obtiene estadísticas rápidas para mostrar en notificaciones
   */
  getQuickStats(sessions: WorkoutSession[]): {
    totalSessions: number;
    totalVolume: number;
    currentStreak: number;
    longestStreak: number;
  } {
    const streak = calculateStreak(sessions);
    const totalVolume = calculateTotalVolume(sessions);

    return {
      totalSessions: sessions.length,
      totalVolume,
      currentStreak: streak.current,
      longestStreak: streak.longest,
    };
  }

  /**
   * Verifica si una sesión es un récord personal
   */
  checkPersonalRecords(
    newSession: WorkoutSession,
    allSessions: WorkoutSession[],
  ): {
    volumeRecord: boolean;
    durationRecord: boolean;
    setsRecord: boolean;
  } {
    const sessionVolume = calculateSessionVolume(newSession.exercises);
    const sessionDuration = newSession.totalDuration || 0;
    const sessionSets = newSession.exercises.reduce(
      (total, ex) => total + ex.completedSets,
      0,
    );

    // Comparar con sesiones anteriores
    const previousSessions = allSessions.filter((s) => s.id !== newSession.id);

    const maxVolume = Math.max(
      0,
      ...previousSessions.map((s) => calculateSessionVolume(s.exercises)),
    );
    const maxDuration = Math.max(
      0,
      ...previousSessions.map((s) => s.totalDuration || 0),
    );
    const maxSets = Math.max(
      0,
      ...previousSessions.map((s) =>
        s.exercises.reduce((total, ex) => total + ex.completedSets, 0),
      ),
    );

    return {
      volumeRecord: sessionVolume > maxVolume,
      durationRecord: sessionDuration > maxDuration,
      setsRecord: sessionSets > maxSets,
    };
  }

  /**
   * Genera mensaje motivacional basado en el progreso
   */
  generateMotivationalMessage(
    newAchievements: AchievementNotification[],
    stats: ReturnType<typeof this.getQuickStats>,
  ): string {
    if (newAchievements.length > 0) {
      const achievement = newAchievements[0].achievement;
      return `🏆 ¡Logro desbloqueado: ${achievement.name}! ${achievement.description}`;
    }

    if (stats.currentStreak > 1) {
      return `🔥 ¡Racha de ${stats.currentStreak} días! Mantén el impulso.`;
    }

    if (stats.totalSessions === 1) {
      return `🎉 ¡Primer entrenamiento completado! El viaje hacia tus objetivos ha comenzado.`;
    }

    const milestones = [5, 10, 25, 50, 100, 200];
    const nextMilestone = milestones.find((m) => m > stats.totalSessions);

    if (nextMilestone) {
      const remaining = nextMilestone - stats.totalSessions;
      return `💪 Entrenamiento #${stats.totalSessions} completado. Solo ${remaining} más para llegar a ${nextMilestone}!`;
    }

    return `✅ ¡Excelente entrenamiento! Sigue construyendo tu mejor versión.`;
  }

  /**
   * Obtiene el próximo logro más cercano
   */
  getNextAchievement(sessions: WorkoutSession[]): Achievement | null {
    const achievements = calculateAchievements(sessions);
    const locked = achievements.filter((a) => !a.unlocked);

    if (locked.length === 0) return null;

    // Encontrar el logro más cercano (mayor progreso relativo)
    return locked.reduce((closest, current) => {
      const currentProgress = current.progress / current.target;
      const closestProgress = closest.progress / closest.target;

      return currentProgress > closestProgress ? current : closest;
    });
  }
}

// Singleton instance
export const achievementManager = new AchievementManager();

// Hook para usar en componentes React
export function useAchievementManager() {
  return {
    processNewSession: (
      session: WorkoutSession,
      allSessions: WorkoutSession[],
    ) => achievementManager.processNewSession(session, allSessions),
    initialize: (sessions: WorkoutSession[]) =>
      achievementManager.initialize(sessions),
    getQuickStats: (sessions: WorkoutSession[]) =>
      achievementManager.getQuickStats(sessions),
    checkPersonalRecords: (
      session: WorkoutSession,
      allSessions: WorkoutSession[],
    ) => achievementManager.checkPersonalRecords(session, allSessions),
    generateMotivationalMessage: (
      achievements: AchievementNotification[],
      stats: ReturnType<typeof achievementManager.getQuickStats>,
    ) => achievementManager.generateMotivationalMessage(achievements, stats),
    getNextAchievement: (sessions: WorkoutSession[]) =>
      achievementManager.getNextAchievement(sessions),
  };
}
