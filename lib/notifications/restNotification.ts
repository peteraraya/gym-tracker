// Helpers para notificaciones de descanso (cliente)
let _restInterval: number | null = null;

function isRunningOnCapacitorNative() {
  try {
    return typeof window !== 'undefined' && !!((window as any).Capacitor && (window as any).Capacitor.isNativePlatform && (window as any).Capacitor.isNativePlatform());
  } catch (e) {
    return false;
  }
}

async function ensurePermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const p = await Notification.requestPermission();
  return p === 'granted';
}

async function postToSW(msg: any) {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(msg);
    } else if (reg && reg.active) {
      reg.active.postMessage(msg);
    }
  } catch (err) {
    console.warn('[restNotification] No SW ready', err);
  }
}

export async function startRestNotification(
  duration: number,
  title = 'Descanso',
  nextExercise?: string,
  tag = 'rest-timer',
) {
  if (typeof window === 'undefined') return;
  const ok = await ensurePermission();
  if (!ok) return;
  // Si estamos en la app nativa (Capacitor Android), delegar al plugin nativo
  if (isRunningOnCapacitorNative()) {
    try {
      const Plugins = (window as any).Capacitor?.Plugins || (window as any).Plugins;
      if (Plugins && Plugins.RestForeground && typeof Plugins.RestForeground.start === 'function') {
        await Plugins.RestForeground.start({ duration, nextExercise, tag });
        return;
      }
    } catch (e) {
      console.warn('[restNotification] error calling native plugin', e);
    }
  }

  const endTime = Date.now() + duration * 1000;
  postToSW({ type: 'START_REST', duration, title, endTime, nextExercise, tag });

  if (_restInterval) {
    clearInterval(_restInterval);
    _restInterval = null;
  }

  // Intervalo solo como heartbeat por si el SW se reinicia.
  // El SW maneja sus propias actualizaciones cada 5s.
  _restInterval = window.setInterval(() => {
    const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    postToSW({ type: 'UPDATE_REST', remaining, title, nextExercise, tag });
    if (remaining <= 0) {
      if (_restInterval) {
        clearInterval(_restInterval);
        _restInterval = null;
      }
    }
  }, 30000);
}

export async function updateRestNotification(remaining: number, tag = 'rest-timer') {
  if (typeof window === 'undefined') return;
  if (isRunningOnCapacitorNative()) {
    try {
      const Plugins = (window as any).Capacitor?.Plugins || (window as any).Plugins;
      if (Plugins && Plugins.RestForeground && typeof Plugins.RestForeground.update === 'function') {
        await Plugins.RestForeground.update({ remaining });
        return;
      }
    } catch (e) {
      console.warn('[restNotification] error calling native plugin update', e);
    }
  }

  postToSW({ type: 'UPDATE_REST', remaining, tag });
}

export async function endRestNotification(tag = 'rest-timer') {
  if (typeof window === 'undefined') return;
  if (_restInterval) {
    clearInterval(_restInterval);
    _restInterval = null;
  }
  if (isRunningOnCapacitorNative()) {
    try {
      const Plugins = (window as any).Capacitor?.Plugins || (window as any).Plugins;
      if (Plugins && Plugins.RestForeground && typeof Plugins.RestForeground.stop === 'function') {
        await Plugins.RestForeground.stop();
        return;
      }
    } catch (e) {
      console.warn('[restNotification] error calling native plugin stop', e);
    }
  }

  postToSW({ type: 'END_REST', tag });
}
