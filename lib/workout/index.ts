/**
 * Barrel de workout.
 * Contiene la lógica de negocio del workout activo:
 * progresión, sugerencias, descanso y periodización avanzada.
 *
 * NOTA: progression.ts y progression-advanced.ts exportan funciones con el mismo
 * nombre (estimate1RM, recommendForSession, recommendWeightIncrease).
 * Importa directamente del archivo que necesites para evitar ambigüedad:
 *   - Básico:   import { ... } from '@/lib/workout/progression'
 *   - Avanzado: import { ... } from '@/lib/workout/progression-advanced'
 */

// Solo exportamos lo que no colisiona
export * from './workoutSuggestions';
export * from './restCalculator';

// Tipos únicos de cada archivo de progresión
export type { Recommendation } from './progression';
export type { ProgressionOptions, ProgressionRecommendation, ProgressionStrategy } from './progression-advanced';
