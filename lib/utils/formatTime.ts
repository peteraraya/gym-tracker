/**
 * Formatea segundos a formato legible para el usuario (minutos y segundos)
 * @param seconds - Tiempo en segundos
 * @returns String formateado como "Xm Ys" o "Xs" si es menos de 60 segundos
 */
export function formatRestTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Formatea segundos a formato MM:SS
 * @param seconds - Tiempo en segundos
 * @returns String formateado como "MM:SS"
 */
export function formatTimeMMSS(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
