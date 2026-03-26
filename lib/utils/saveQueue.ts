/**
 * Cola de Guardado para Evitar Race Conditions
 * 
 * Centraliza todos los guardados de activeWorkout en una cola
 * para garantizar que se ejecuten en orden y sin sobrescribirse
 */

import type { ActiveWorkout } from '@/lib/storage/storage';
import * as storageService from '@/lib/storage/storage';
import logger from '@/lib/logger';

class SaveQueue {
  private queue: Promise<void> = Promise.resolve();
  private lastSaveTime: number = 0;
  private saveCount: number = 0;
  private readonly MIN_SAVE_INTERVAL = 100; // Mínimo 100ms entre guardados

  /**
   * Agrega un guardado a la cola
   * Garantiza que los guardados se ejecuten en orden
   */
  async save(data: ActiveWorkout): Promise<void> {
    this.saveCount++;
    const saveId = this.saveCount;
    
    logger.debug(`[SaveQueue] Queueing save #${saveId}`);
    
    this.queue = this.queue
      .then(async () => {
        // Throttle: esperar si el último guardado fue muy reciente
        const timeSinceLastSave = Date.now() - this.lastSaveTime;
        if (timeSinceLastSave < this.MIN_SAVE_INTERVAL) {
          const waitTime = this.MIN_SAVE_INTERVAL - timeSinceLastSave;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        logger.debug(`[SaveQueue] Executing save #${saveId}`);
        await storageService.saveActiveWorkout(data);
        this.lastSaveTime = Date.now();
        logger.debug(`[SaveQueue] Completed save #${saveId}`);
      })
      .catch(error => {
        logger.error(`[SaveQueue] Failed save #${saveId}`, {}, error instanceof Error ? error : undefined);
        // No lanzar error para no romper la cola
      });
    
    return this.queue;
  }

  /**
   * Espera a que se completen todos los guardados pendientes
   */
  async flush(): Promise<void> {
    logger.debug('[SaveQueue] Flushing queue');
    await this.queue;
    logger.debug('[SaveQueue] Queue flushed');
  }

  /**
   * Obtiene estadísticas de la cola
   */
  getStats() {
    return {
      totalSaves: this.saveCount,
      lastSaveTime: this.lastSaveTime
    };
  }
}

// Instancia singleton
export const saveQueue = new SaveQueue();
