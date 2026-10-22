/**
 * Sistema de Backup para Entrenamientos
 * 
 * Guarda backups automáticos antes de limpiar datos
 * Permite recuperación de entrenamientos perdidos
 */

import logger from '@/lib/shared/logger';

const BACKUP_PREFIX = 'workout-backup-';
const MAX_BACKUPS = 5;
const BACKUP_EXPIRY_DAYS = 7;

export interface WorkoutBackup {
  timestamp: number;
  data: unknown;
  reason: string;
}

/**
 * Guarda un backup del workout antes de limpiarlo
 */
export function saveBackup(data: unknown, reason: string): string {
  if (typeof window === 'undefined') return '';
  
  try {
    const backupKey = `${BACKUP_PREFIX}${Date.now()}`;
    const backup: WorkoutBackup = {
      timestamp: Date.now(),
      data,
      reason
    };
    
    localStorage.setItem(backupKey, JSON.stringify(backup));
    logger.info('Workout backup saved', { backupKey, reason });
    
    // Limpiar backups antiguos
    cleanOldBackups();
    
    return backupKey;
  } catch (error) {
    logger.error('Failed to save workout backup', {}, error instanceof Error ? error : undefined);
    return '';
  }
}

/**
 * Obtiene todos los backups disponibles
 */
export function getBackups(): Array<{ key: string; backup: WorkoutBackup }> {
  if (typeof window === 'undefined') return [];
  
  const backups: Array<{ key: string; backup: WorkoutBackup }> = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(BACKUP_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const backup = JSON.parse(value) as WorkoutBackup;
            backups.push({ key, backup });
          } catch (e) {
            // Backup corrupto, ignorar
          }
        }
      }
    }
    
    // Ordenar por timestamp descendente (más reciente primero)
    backups.sort((a, b) => b.backup.timestamp - a.backup.timestamp);
  } catch (error) {
    logger.error('Failed to get backups', {}, error instanceof Error ? error : undefined);
  }
  
  return backups;
}

/**
 * Restaura un backup específico
 */
export function restoreBackup(backupKey: string): unknown | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const value = localStorage.getItem(backupKey);
    if (!value) return null;
    
    const backup = JSON.parse(value) as WorkoutBackup;
    logger.info('Workout backup restored', { backupKey });
    
    return backup.data;
  } catch (error) {
    logger.error('Failed to restore backup', { backupKey }, error instanceof Error ? error : undefined);
    return null;
  }
}

/**
 * Elimina un backup específico
 */
export function deleteBackup(backupKey: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(backupKey);
    logger.info('Workout backup deleted', { backupKey });
  } catch (error) {
    logger.error('Failed to delete backup', { backupKey }, error instanceof Error ? error : undefined);
  }
}

/**
 * Limpia backups antiguos (más de 7 días o más de 5 backups)
 */
function cleanOldBackups(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const backups = getBackups();
    const now = Date.now();
    const expiryTime = BACKUP_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    
    // Eliminar backups antiguos
    backups.forEach(({ key, backup }) => {
      if (now - backup.timestamp > expiryTime) {
        localStorage.removeItem(key);
        logger.debug('Deleted expired backup', { key });
      }
    });
    
    // Mantener solo los últimos MAX_BACKUPS
    const remaining = getBackups();
    if (remaining.length > MAX_BACKUPS) {
      const toDelete = remaining.slice(MAX_BACKUPS);
      toDelete.forEach(({ key }) => {
        localStorage.removeItem(key);
        logger.debug('Deleted excess backup', { key });
      });
    }
  } catch (error) {
    logger.error('Failed to clean old backups', {}, error instanceof Error ? error : undefined);
  }
}

/**
 * Intenta recuperar datos parciales de un workout corrupto
 */
export function attemptPartialRecovery(data: unknown): Record<string, unknown> | null {
  try {
    // Validar campos mínimos requeridos
    if (!data || typeof data !== 'object') {
      return null;
    }

    const obj = data as Record<string, unknown>;
    if (!obj.routineId || !obj.routineName) {
      return null;
    }
    
    // Construir objeto con valores por defecto seguros
    const recovered: Record<string, unknown> = {
      routineId: String(obj.routineId),
      routineName: String(obj.routineName),
      currentExerciseIndex: 0,
      currentSet: 1,
      completedSets: {},
      actualReps: {},
      actualWeights: {},
      startedAt: obj.startedAt ? new Date(String(obj.startedAt)) : new Date()
    };
    
    // Intentar recuperar datos parciales
    if (typeof obj.currentExerciseIndex === 'number' && obj.currentExerciseIndex >= 0) {
      recovered.currentExerciseIndex = obj.currentExerciseIndex;
    }
    
    if (typeof obj.currentSet === 'number' && obj.currentSet >= 1) {
      recovered.currentSet = obj.currentSet;
    }
    
    // Recuperar completedSets si es válido
    if (typeof obj.completedSets === 'object' && obj.completedSets !== null && !Array.isArray(obj.completedSets)) {
      recovered.completedSets = obj.completedSets as Record<string, number>;
    }
    
    // Recuperar actualReps si es válido
    if (typeof obj.actualReps === 'object' && obj.actualReps !== null && !Array.isArray(obj.actualReps)) {
      recovered.actualReps = obj.actualReps as Record<string, number[]>;
    }
    
    // Recuperar actualWeights si es válido
    if (typeof obj.actualWeights === 'object' && obj.actualWeights !== null && !Array.isArray(obj.actualWeights)) {
      recovered.actualWeights = obj.actualWeights as Record<string, number[]>;
    }
    
    logger.info('Partial recovery successful', { recovered });
    return recovered;
  } catch (error) {
    logger.error('Partial recovery failed', {}, error instanceof Error ? error : undefined);
    return null;
  }
}
