/**
 * Configuración central de la aplicación
 *
 * Centraliza constantes, configuraciones y valores mágicos
 * que estaban dispersos por toda la aplicación.
 */

import type { MuscleGroup } from "@/data/exercises";

export const APP_CONFIG = {
  // Configuración de paginación
  pagination: {
    exercisesPerPage: 5,
    sessionsPerPage: 10,
    routinesPerPage: 12,
    achievementsPerPage: 6,
  },

  // Colores por grupo muscular
  muscleGroupColors: {
    pecho: "#ef4444", // red
    espalda: "#3b82f6", // blue
    piernas: "#10b981", // green
    gluteos: "#ec4899", // pink
    hombros: "#8b5cf6", // purple
    biceps: "#f97316", // orange
    triceps: "#fb923c", // orange-400
    antebrazos: "#fdba74", // orange-300
    trapecio: "#a855f7", // purple-500
    cuello: "#c084fc", // purple-400
    core: "#eab308", // yellow
    gemelos: "#14b8a6", // teal
    cardio: "#f43f5e", // rose
  } as Record<MuscleGroup, string>,

  // Etiquetas de grupos musculares — translation keys del namespace 'muscles'
  // Uso: useTranslations('muscles') → t(mg)  (nunca leer .muscleGroupLabels directamente en UI)
  muscleGroupLabels: {
    pecho: "muscles.pecho",
    espalda: "muscles.espalda",
    piernas: "muscles.piernas",
    gluteos: "muscles.gluteos",
    hombros: "muscles.hombros",
    biceps: "muscles.biceps",
    triceps: "muscles.triceps",
    antebrazos: "muscles.antebrazos",
    trapecio: "muscles.trapecio",
    cuello: "muscles.cuello",
    core: "muscles.core",
    gemelos: "muscles.gemelos",
    cardio: "muscles.cardio",
  } as Record<MuscleGroup, string>,

  // Keys de localStorage
  storage: {
    keys: {
      sessions: "gym-sessions",
      routines: "gym-routines",
      profile: "gym-profile",
      weeklyPlan: "gym-weekly-plan",
      planning: "gym-planning-data",
      equipment: "gym-equipment",
      lastSavedSession: "gym_tracker_last_saved_session_local",
    },
  },

  // Configuración de URLs
  urls: {
    exerciseImages:
      "https://hplrrjqgzefkdevbporx.supabase.co/storage/v1/object/public/routine-images/",
  },

  // Configuración de tiempos (en segundos)
  timers: {
    defaultRestTime: 90,
    minRestTime: 30,
    maxRestTime: 300,
    autoSaveInterval: 30,
  },

  // Configuración de validación
  validation: {
    minSets: 1,
    maxSets: 10,
    minReps: 1,
    maxReps: 100,
    minWeight: 0,
    maxWeight: 1000,
    maxRoutineNameLength: 50,
    maxNotesLength: 500,
  },

  // Configuración de features
  features: {
    enableOfflineMode: true,
    enableNotifications: true,
    enableAnalytics: false,
    enableExperimentalFeatures: false,
  },
} as const;

// Type helpers
export type AppConfig = typeof APP_CONFIG;
export type MuscleGroupColor = typeof APP_CONFIG.muscleGroupColors;
export type StorageKeys = typeof APP_CONFIG.storage.keys;
