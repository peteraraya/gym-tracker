/**
 * Configuración de almacenamiento
 * Determina si usar Supabase o localStorage según la variable de entorno
 */

/**
 * Verifica si la base de datos (Supabase) está habilitada
 * @returns true si NEXT_PUBLIC_ENABLE_DATABASE=true, false en caso contrario
 */
export function isDatabaseEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DATABASE === 'true';
}

/**
 * Verifica si se debe usar almacenamiento local
 * @returns true si la base de datos está deshabilitada
 */
export function isLocalStorageMode(): boolean {
  return !isDatabaseEnabled();
}

/**
 * Obtiene el modo de almacenamiento actual
 * @returns 'database' o 'local'
 */
export function getStorageMode(): 'database' | 'local' {
  return isDatabaseEnabled() ? 'database' : 'local';
}

/**
 * Log del modo de almacenamiento (útil para debugging)
 */
export function logStorageMode(): void {
  const mode = getStorageMode();
  const emoji = mode === 'database' ? '☁️' : '💾';
  console.log(`${emoji} [Storage] Modo: ${mode === 'database' ? 'Supabase (Cloud)' : 'localStorage (Local)'}`);
}
