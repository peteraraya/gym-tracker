// Helpers para notificaciones de descanso (cliente)
let _restInterval: number | null = null;

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

  const endTime = Date.now() + duration * 1000;
  postToSW({ type: 'START_REST', duration, title, endTime, nextExercise, tag });

  if (_restInterval) {
    clearInterval(_restInterval);
    _restInterval = null;
  }

  _restInterval = window.setInterval(() => {
    const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    postToSW({ type: 'UPDATE_REST', remaining, title, nextExercise, tag });
    if (remaining <= 0) {
      if (_restInterval) {
        clearInterval(_restInterval);
        _restInterval = null;
      }
    }
  }, 1000);
}

export async function updateRestNotification(remaining: number, tag = 'rest-timer') {
  if (typeof window === 'undefined') return;
  postToSW({ type: 'UPDATE_REST', remaining, tag });
}

export async function endRestNotification(tag = 'rest-timer') {
  if (typeof window === 'undefined') return;
  if (_restInterval) {
    clearInterval(_restInterval);
    _restInterval = null;
  }
  postToSW({ type: 'END_REST', tag });
}
