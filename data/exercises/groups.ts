/**
 * Auto-generado por scripts/split-exercises-by-muscle.mjs
 * Barrel de ejercicios por grupo muscular para carga diferida.
 */

export { EXERCISES_Pecho } from './by-muscle/exercises-pecho';
export { EXERCISES_Espalda } from './by-muscle/exercises-espalda';
export { EXERCISES_Piernas } from './by-muscle/exercises-piernas';
export { EXERCISES_Gluteos } from './by-muscle/exercises-gluteos';
export { EXERCISES_Hombros } from './by-muscle/exercises-hombros';
export { EXERCISES_Biceps } from './by-muscle/exercises-biceps';
export { EXERCISES_Triceps } from './by-muscle/exercises-triceps';
export { EXERCISES_Antebrazos } from './by-muscle/exercises-antebrazos';
export { EXERCISES_Trapecio } from './by-muscle/exercises-trapecio';
export { EXERCISES_Cuello } from './by-muscle/exercises-cuello';
export { EXERCISES_Core } from './by-muscle/exercises-core';
export { EXERCISES_Gemelos } from './by-muscle/exercises-gemelos';
export { EXERCISES_Cardio } from './by-muscle/exercises-cardio';

export const MUSCLE_GROUPS: { id: string; name: string }[] = [
  { id: 'pecho', name: 'Pecho' },
  { id: 'espalda', name: 'Espalda' },
  { id: 'piernas', name: 'Piernas' },
  { id: 'gluteos', name: 'Glúteos' },
  { id: 'hombros', name: 'Hombros' },
  { id: 'biceps', name: 'Bíceps' },
  { id: 'triceps', name: 'Tríceps' },
  { id: 'antebrazos', name: 'Antebrazos' },
  { id: 'trapecio', name: 'Trapecio' },
  { id: 'cuello', name: 'Cuello' },
  { id: 'core', name: 'Core/Abdomen' },
  { id: 'gemelos', name: 'Gemelos' },
  { id: 'cardio', name: 'Cardio' },
];

export type MuscleGroup =
  | 'pecho'
  | 'espalda'
  | 'piernas'
  | 'hombros'
  | 'biceps'
  | 'triceps'
  | 'antebrazos'
  | 'trapecio'
  | 'cuello'
  | 'core'
  | 'gluteos'
  | 'gemelos'
  | 'cardio';

export const MUSCLE_GROUP_FILES: Record<string, string> = {
  'pecho': './by-muscle/exercises-pecho',
  'espalda': './by-muscle/exercises-espalda',
  'piernas': './by-muscle/exercises-piernas',
  'gluteos': './by-muscle/exercises-gluteos',
  'hombros': './by-muscle/exercises-hombros',
  'biceps': './by-muscle/exercises-biceps',
  'triceps': './by-muscle/exercises-triceps',
  'antebrazos': './by-muscle/exercises-antebrazos',
  'trapecio': './by-muscle/exercises-trapecio',
  'cuello': './by-muscle/exercises-cuello',
  'core': './by-muscle/exercises-core',
  'gemelos': './by-muscle/exercises-gemelos',
  'cardio': './by-muscle/exercises-cardio',
};
