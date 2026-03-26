/**
 * Sistema de Backup para Entrenamientos
 * 
 * Guarda backups automáticos antes de limpiar datos
 * Permite recuperación de entrenamientos perdidos
 */

import logger from '@/lib/logger';

const BACKUP_PREFIX = 'workout-backup-';
const MAX_BACKUPS = 5;
const BACKUP_EXPIRY_DAYS = 7;

export interface WorkoutBackup {
  timestamp: number;
  data: any;
  reason: string;
}

/**
 * Guarda un backup del workout antes de limpiarlo
 */
export function saveBackup(data: any, reason: string): string {
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
export function restoreBackup(backupKey: string): any | null {
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
export function attemptPartialRecovery(data: any): any | null {
  try {
    // Validar campos mínimos requeridos
    if (!data.routineId || !data.routineName) {
      return null;
    }
    
    // Construir objeto con valores por defecto seguros
    const recovered = {
      routineId: String(data.routineId),
      routineName: String(data.routineName),
      currentExerciseIndex: 0,
      currentSet: 1,
      completedSets: {},
      actualReps: {},
      actualWeights: {},
      startedAt: data.startedAt ? new Date(data.startedAt) : new Date()
    };
    
    // Intentar recuperar datos parciales
    if (typeof data.currentExerciseIndex === 'number' && data.currentExerciseIndex >= 0) {
      recovered.currentExerciseIndex = data.currentExerciseIndex;
    }
    
    if (typeof data.currentSet === 'number' && data.currentSet >= 1) {
      recovered.currentSet = data.currentSet;
    }
    
    // Recuperar completedSets si es válido
    if (typeof data.completedSets === 'object' && data.completedSets !== null && !Array.isArray(data.completedSets)) {
      recovered.completedSets = data.completedSets;
    }
    
    // Recuperar actualReps si es válido
    if (typeof data.actualReps === 'object' && data.actualReps !== null && !Array.isArray(data.actualReps)) {
      recovered.actualReps = data.actualReps;
    }
    
    // Recuperar actualWeights si es válido
    if (typeof data.actualWeights === 'object' && data.actualWeights !== null && !Array.isArray(data.actualWeights)) {
      recovered.actualWeights = data.actualWeights;
    }
    
    logger.info('Partial recovery successful', { recovered });
    return recovered;
  } catch (error) {
    logger.error('Partial recovery failed', {}, error instanceof Error ? error : undefined);
    return null;
  }
}
