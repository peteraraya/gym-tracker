/**
 * Helpers de conversión y formato de unidades de peso.
 * El peso corporal se almacena SIEMPRE en kg; la conversión a libras
 * es solo de presentación.
 */

export type WeightUnit = 'kg' | 'lb';

const LBS_PER_KG = 2.2046226218;

/** Convierte un valor en kg a libras */
export function kgToLb(kg: number): number {
  return kg * LBS_PER_KG;
}

/** Convierte un valor en libras a kg */
export function lbToKg(lb: number): number {
  return lb / LBS_PER_KG;
}

/** Valor de kg expresado en la unidad solicitada */
export function weightToUnit(kg: number, unit: WeightUnit): number {
  return unit === 'lb' ? kgToLb(kg) : kg;
}

/** Formatea un peso (almacenado en kg) a la unidad solicitada */
export function formatWeight(
  kg: number,
  unit: WeightUnit = 'kg',
  decimals = 1,
): string {
  const value = weightToUnit(kg, unit);
  const fixed = Number.isInteger(value) ? value.toString() : value.toFixed(decimals);
  return `${fixed} ${unit}`;
}