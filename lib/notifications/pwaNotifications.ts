/**
 * Sistema de Notificaciones PWA Mejorado
 * Notificaciones con tiempo de descanso visible y mejor UX
 */

interface RestNotificationData {
  timeLeft: number;
  totalTime: number;
  exerciseName?: string;
  nextExercise?: string;
  routineName?: string;
}

interface NotificationPermissionState {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

class PWANotificationManager {
  private updateInterval: NodeJS.Timeout | null = null;
  private currentNotificationTag: string | null = null;

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Notificaciones no soportadas en este navegador');
      return false;
    }

    try {
      if (Notification.permission === 'granted') {
        return true;
      }

      if (Notification.permission === 'denied') {
        return false;
      }

      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.warn('Error solicitando permisos de notificación:', error);
      return false;
    }
  }

  getPermissionState(): NotificationPermissionState {
    if (!this.isSupported()) {
      return { granted: false, denied: true, prompt: false };
    }

    return {
      granted: Notification.permission === 'granted',
      denied: Notification.permission === 'denied',
      prompt: Notification.permission === 'default'
    };
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  async showRestTimerNotification(data: RestNotificationData): Promise<void> {
    if (!this.getPermissionState().granted) return;

    const { timeLeft, totalTime, exerciseName, nextExercise, routineName } = data;
    
    // Formatear tiempo
    const timeFormatted = this.formatTime(timeLeft);
    const progressPercent = Math.round(((totalTime - timeLeft) / totalTime) * 100);

    const title = `⏱️ Descanso: ${timeFormatted}`;
    
    let body = `Progreso: ${progressPercent}% completado`;
    if (nextExercise) {
      body += `\nPróximo: ${nextExercise}`;
    }
    if (routineName) {
      body += `\nRutina: ${routineName}`;
    }

    const notificationOptions = {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'rest-timer-progress',
      requireInteraction: false,
      silent: true, // No sonido, solo visual
      data: {
        type: 'rest-timer',
        timeLeft,
        totalTime,
        exerciseName,
        nextExercise,
        url: window.location.href
      },
      actions: [
        {
          action: 'skip',
          title: '⏭️ Saltar',
          icon: '/icons/skip-icon.png'
        },
        {
          action: 'add-30s',
          title: '+30s',
          icon: '/icons/add-time-icon.png'
        }
      ]
    };

    try {
      await this.showNotification(title, notificationOptions as NotificationOptions);
      this.currentNotificationTag = 'rest-timer-progress';
    } catch (error) {
      console.warn('Error mostrando notificación de progreso:', error);
    }
  }

  async showRestCompleteNotification(data: Omit<RestNotificationData, 'timeLeft'>): Promise<void> {
    if (!this.getPermissionState().granted) return;

    const { exerciseName, nextExercise, routineName } = data;

    const title = '✅ ¡Descanso Completado!';
    
    let body = '¡Es hora de continuar con el entrenamiento!';
    if (nextExercise) {
      body = `Próximo ejercicio: ${nextExercise}`;
    }
    if (routineName) {
      body += `\nRutina: ${routineName}`;
    }

    const notificationOptions = {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'rest-complete',
      requireInteraction: true, // Requiere interacción para cerrar
      vibrate: [200, 100, 200, 100, 200], // Patrón de vibración más fuerte
      data: {
        type: 'rest-complete',
        exerciseName,
        nextExercise,
        url: window.location.href
      },
      actions: [
        {
          action: 'continue',
          title: '💪 Continuar',
          icon: '/icons/continue-icon.png'
        },
        {
          action: 'more-rest',
          title: '⏰ Más descanso',
          icon: '/icons/more-rest-icon.png'
        }
      ]
    };

    try {
      // Cerrar notificación de progreso si existe
      await this.closeNotification('rest-timer-progress');
      
      await this.showNotification(title, notificationOptions as NotificationOptions);
      this.currentNotificationTag = 'rest-complete';
    } catch (error) {
      console.warn('Error mostrando notificación de completado:', error);
    }
  }

  startRestTimerNotifications(data: RestNotificationData): void {
    // Limpiar intervalo anterior si existe
    this.stopRestTimerNotifications();

    // Mostrar notificación inicial
    this.showRestTimerNotification(data);

    // Actualizar cada 10 segundos
    this.updateInterval = setInterval(() => {
      if (data.timeLeft > 0) {
        data.timeLeft -= 10;
        this.showRestTimerNotification(data);
      } else {
        this.stopRestTimerNotifications();
        this.showRestCompleteNotification(data);
      }
    }, 10000);
  }

  stopRestTimerNotifications(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    // Cerrar notificaciones activas
    this.closeNotification('rest-timer-progress');
  }

  private async showNotification(title: string, options: NotificationOptions): Promise<void> {
    try {
      // Intentar usar Service Worker primero (funciona en background)
      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, options);
      } else {
        // Fallback a Notification API directa
        const notification = new Notification(title, options);
        
        // Auto-cerrar después de 30 segundos si no requiere interacción
        if (!options.requireInteraction) {
          setTimeout(() => {
            try {
              notification.close();
            } catch (e) {
              // Ignorar errores al cerrar
            }
          }, 30000);
        }

        // Manejar clicks
        notification.onclick = () => {
          try {
            window.focus();
            notification.close();
            
            // Navegar a la app si está especificado
            if (options.data?.url) {
              window.location.href = options.data.url;
            }
          } catch (e) {
            console.warn('Error manejando click de notificación:', e);
          }
        };
      }
    } catch (error) {
      console.warn('Error mostrando notificación:', error);
      throw error;
    }
  }

  private async closeNotification(tag: string): Promise<void> {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        const registration = await navigator.serviceWorker.ready;
        const notifications = await registration.getNotifications({ tag });
        notifications.forEach(notification => notification.close());
      }
    } catch (error) {
      console.warn('Error cerrando notificación:', error);
    }
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Manejar acciones de notificación (debe ser configurado en el Service Worker)
  setupNotificationActionHandlers(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'notification-action') {
          const { action, notificationData } = event.data;
          
          switch (action) {
            case 'skip':
              // Emitir evento personalizado para que la app lo maneje
              window.dispatchEvent(new CustomEvent('rest-timer-skip', {
                detail: notificationData
              }));
              break;
              
            case 'add-30s':
              window.dispatchEvent(new CustomEvent('rest-timer-add-time', {
                detail: { seconds: 30, ...notificationData }
              }));
              break;
              
            case 'continue':
              window.dispatchEvent(new CustomEvent('rest-timer-continue', {
                detail: notificationData
              }));
              break;
              
            case 'more-rest':
              window.dispatchEvent(new CustomEvent('rest-timer-more-rest', {
                detail: notificationData
              }));
              break;
          }
        }
      });
    }
  }
}

// Singleton instance
export const pwaNotificationManager = new PWANotificationManager();

// Hook para usar en componentes React
export function useRestNotifications() {
  return {
    requestPermission: () => pwaNotificationManager.requestPermission(),
    getPermissionState: () => pwaNotificationManager.getPermissionState(),
    isSupported: () => pwaNotificationManager.isSupported(),
    showRestTimer: (data: RestNotificationData) => 
      pwaNotificationManager.showRestTimerNotification(data),
    showRestComplete: (data: Omit<RestNotificationData, 'timeLeft'>) => 
      pwaNotificationManager.showRestCompleteNotification(data),
    startTimerNotifications: (data: RestNotificationData) => 
      pwaNotificationManager.startRestTimerNotifications(data),
    stopTimerNotifications: () => 
      pwaNotificationManager.stopRestTimerNotifications(),
    setupActionHandlers: () => 
      pwaNotificationManager.setupNotificationActionHandlers(),
  };
}