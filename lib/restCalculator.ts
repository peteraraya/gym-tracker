/**
 * Sistema de descanso inteligente para calcular tiempos de descanso óptimos
 * basados en el tipo de ejercicio, objetivo de entrenamiento y nivel del usuario
 */

import { ExerciseTemplate } from '@/data/exercises';

export type RestRecommendationType = 'strength' | 'hypertrophy' | 'endurance' | 'power';

interface RestRecommendation {
  min: number; // segundos mínimos
  max: number; // segundos máximos
  recommended: number; // tiempo recomendado
  type: RestRecommendationType;
  description: string;
}

/**
 * Determina el tipo de entrenamiento basado en las series y repeticiones
 */
export function determineTrainingType(sets: number, reps: number): RestRecommendationType {
  // Fuerza: pocas reps (1-5), alto peso
  if (reps <= 5) return 'strength';
  
  // Potencia: reps bajas-medias (3-8), explosivo
  if (reps <= 8 && sets <= 5) return 'power';
  
  // Hipertrofia: reps medias (6-12)
  if (reps >= 6 && reps <= 12) return 'hypertrophy';
  
  // Resistencia: muchas reps (12+)
  return 'endurance';
}

/**
 * Calcula el tiempo de descanso recomendado entre series
 */
export function calculateRestBetweenSets(
  exercise: ExerciseTemplate,
  sets: number = 3,
  reps: number = 10,
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
): RestRecommendation {
  const trainingType = determineTrainingType(sets, reps);
  
  // Factores de ajuste según nivel
  const levelMultiplier = {
    beginner: 1.2,      // Principiantes necesitan más descanso
    intermediate: 1.0,  // Tiempo estándar
    advanced: 0.8       // Avanzados pueden descansar menos
  };
  
  const multiplier = levelMultiplier[fitnessLevel];
  
  // Tiempos base según tipo de entrenamiento
  const baseRecommendations: Record<RestRecommendationType, RestRecommendation> = {
    strength: {
      min: 180,
      max: 300,
      recommended: 240, // 4 minutos
      type: 'strength',
      description: 'Descanso largo para recuperación completa de fuerza'
    },
    power: {
      min: 120,
      max: 240,
      recommended: 180, // 3 minutos
      type: 'power',
      description: 'Descanso medio-largo para mantener la explosividad'
    },
    hypertrophy: {
      min: 60,
      max: 120,
      recommended: 90, // 1.5 minutos
      type: 'hypertrophy',
      description: 'Descanso medio para mantener la tensión muscular'
    },
    endurance: {
      min: 30,
      max: 60,
      recommended: 45, // 45 segundos
      type: 'endurance',
      description: 'Descanso corto para mantener el ritmo cardíaco'
    }
  };
  
  const base = baseRecommendations[trainingType];
  
  // Ajustar según equipamiento (ejercicios compuestos necesitan más descanso)
  const isCompound = isCompoundExercise(exercise);
  const compoundMultiplier = isCompound ? 1.2 : 1.0;
  
  return {
    ...base,
    min: Math.round(base.min * multiplier),
    max: Math.round(base.max * multiplier),
    recommended: Math.round(base.recommended * multiplier * compoundMultiplier)
  };
}

/**
 * Calcula el tiempo de descanso entre ejercicios diferentes
 */
export function calculateRestBetweenExercises(
  currentExercise: ExerciseTemplate,
  nextExercise: ExerciseTemplate,
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
): RestRecommendation {
  // Si trabajan el mismo grupo muscular, más descanso
  const sameMusleGroup = currentExercise.muscleGroup === nextExercise.muscleGroup;
  
  const levelMultiplier = {
    beginner: 1.3,
    intermediate: 1.0,
    advanced: 0.8
  };
  
  const multiplier = levelMultiplier[fitnessLevel];
  
  const baseTime = sameMusleGroup ? 120 : 90; // 2 min mismo músculo, 1.5 min diferente
  const recommended = Math.round(baseTime * multiplier);
  
  return {
    min: Math.round(60 * multiplier),
    max: Math.round(180 * multiplier),
    recommended,
    type: sameMusleGroup ? 'hypertrophy' : 'endurance',
    description: sameMusleGroup 
      ? 'Mismo grupo muscular - descanso extendido'
      : 'Diferente grupo muscular - descanso estándar'
  };
}

/**
 * Determina si un ejercicio es compuesto (multiarticular)
 */
function isCompoundExercise(exercise: ExerciseTemplate): boolean {
  // Lista de ejercicios compuestos comunes
  const compoundKeywords = [
    'press', 'sentadilla', 'squat', 'deadlift', 'peso muerto',
    'dominadas', 'pull-up', 'remo', 'row', 'dip', 'fondos',
    'clean', 'snatch', 'thruster', 'lunge', 'estocada'
  ];
  
  const exerciseName = exercise.name.toLowerCase();
  return compoundKeywords.some(keyword => exerciseName.includes(keyword));
}

/**
 * Formatea el tiempo en un formato legible
 */
export function formatRestTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (remainingSeconds === 0) {
    return `${minutes}min`;
  }
  
  return `${minutes}min ${remainingSeconds}s`;
}

/**
 * Obtiene un mensaje motivacional según el tiempo de descanso
 */
export function getRestMessage(secondsRemaining: number, totalSeconds: number): string {
  const percentage = (secondsRemaining / totalSeconds) * 100;
  
  if (secondsRemaining === 0) {
    return '¡Vamos! Es hora de la próxima serie 💪';
  }
  
  if (percentage > 80) {
    return 'Respira profundo y recupérate 🧘';
  }
  
  if (percentage > 60) {
    return 'Recuperando energía... 💚';
  }
  
  if (percentage > 40) {
    return 'Casi listo para continuar 🔥';
  }
  
  if (percentage > 20) {
    return 'Prepárate para la siguiente serie 💪';
  }
  
  if (percentage > 5) {
    return '¡Últimos segundos! 🚀';
  }
  
  return '¡Muy bien! ¡A darle! 💥';
}

/**
 * Configuración de notificaciones del navegador
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Este navegador no soporta notificaciones');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

/**
 * Muestra una notificación cuando el descanso termina
 */
export function showRestCompleteNotification(exerciseName?: string): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  try {
    if (Notification.permission === 'granted') {
      const notification = new Notification('⏰ Descanso Terminado', {
        body: exerciseName 
          ? `Es hora de continuar con ${exerciseName}!`
          : '¡Es hora de la siguiente serie!',
        icon: '/icon-192x192.png', // Puedes crear un ícono para la app
        badge: '/icon-192x192.png',
        tag: 'rest-timer',
        requireInteraction: false
      });

      // Auto-cerrar después de 5 segundos si el método está disponible
      try {
        setTimeout(() => {
          if (typeof notification.close === 'function') notification.close();
        }, 5000);
      } catch (e) {
        // ignore
      }

      // Click en la notificación enfoca la ventana (proteger por si onclick falla)
      try {
        notification.onclick = () => {
          try {
            window.focus();
          } catch (e) {
            // ignore
          }
          try {
            if (typeof notification.close === 'function') notification.close();
          } catch (e) {
            // ignore
          }
        };
      } catch (e) {
        // ignore
      }
    }
  } catch (err) {
    // Evitar que errores en entornos limitados (webviews móviles) rompan la app
     
    console.warn('showRestCompleteNotification failed:', err);
  }
}

/**
 * Reproduce un sonido al terminar el descanso
 */
export function playRestCompleteSound(): void {
  try {
    // Crear un contexto de audio
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configurar el sonido
    oscillator.frequency.value = 800; // Frecuencia en Hz
    oscillator.type = 'sine';
    
    // Fade in/out
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
    
    // Reproducir
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.warn('No se pudo reproducir el sonido:', error);
  }
}
