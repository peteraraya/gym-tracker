/**
 * Tipo unificado de UserProfile
 * Compatible con localStorage y Supabase
 * 
 * Este archivo centraliza la definición de UserProfile para evitar
 * inconsistencias entre diferentes partes de la aplicación.
 */

export type Gender = 'male' | 'female' | 'other';

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

/** Entrada individual de peso corporal (almacenada siempre en kg) */
export interface WeightEntry {
    date: string;   // ISO YYYY-MM-DD
    weight: number; // en kg (peso actual)
}

export interface UserProfile {
    // Campos opcionales del sistema
    id?: string;
    userId?: string;

    // Datos básicos (requeridos)
    name: string;
    email: string;

    // Datos de avatar
    avatarUrl?: string;

    // Datos físicos (opcionales)
    age?: number;
    gender?: Gender;
    height?: number;        // en cm
    weight?: number;        // en kg (peso actual)
    currentWeight?: number; // alias para compatibilidad con algunas partes del código
    targetWeight?: number;
    weightHistory?: WeightEntry[]; // historial de peso corporal (ordenado por fecha asc)

    // Objetivos (opcionales)
    fitnessGoal?: FitnessGoal;
    fitnessLevel?: FitnessLevel;
    weeklyWorkouts?: number; // Días que puede entrenar por semana

    // Metadatos
    createdAt?: Date;
    updatedAt?: Date;
}
