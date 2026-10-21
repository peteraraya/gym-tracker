/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Auto-generado por scripts/split-warmups-by-muscle.mjs
 * Barrel de warmups por grupo muscular para carga diferida.
 */

export { WARMUPS_Pecho } from './by-muscle/warmups-pecho';
export { WARMUPS_Espalda } from './by-muscle/warmups-espalda';
export { WARMUPS_Piernas } from './by-muscle/warmups-piernas';
export { WARMUPS_Gluteos } from './by-muscle/warmups-gluteos';
export { WARMUPS_Hombros } from './by-muscle/warmups-hombros';
export { WARMUPS_Biceps } from './by-muscle/warmups-biceps';
export { WARMUPS_Triceps } from './by-muscle/warmups-triceps';
export { WARMUPS_Antebrazos } from './by-muscle/warmups-antebrazos';
export { WARMUPS_Trapecio } from './by-muscle/warmups-trapecio';
export { WARMUPS_Cuello } from './by-muscle/warmups-cuello';
export { WARMUPS_Core } from './by-muscle/warmups-core';
export { WARMUPS_Gemelos } from './by-muscle/warmups-gemelos';
export { WARMUPS_Cardio } from './by-muscle/warmups-cardio';

export type WarmupCategory =
  | 'warmup'
  | 'mobility'
  | 'activation';

export const WARMUP_GROUP_FILES: Record<string, string> = {
  'pecho': './by-muscle/warmups-pecho',
  'espalda': './by-muscle/warmups-espalda',
  'piernas': './by-muscle/warmups-piernas',
  'gluteos': './by-muscle/warmups-gluteos',
  'hombros': './by-muscle/warmups-hombros',
  'biceps': './by-muscle/warmups-biceps',
  'triceps': './by-muscle/warmups-triceps',
  'antebrazos': './by-muscle/warmups-antebrazos',
  'trapecio': './by-muscle/warmups-trapecio',
  'cuello': './by-muscle/warmups-cuello',
  'core': './by-muscle/warmups-core',
  'gemelos': './by-muscle/warmups-gemelos',
  'cardio': './by-muscle/warmups-cardio',
};
