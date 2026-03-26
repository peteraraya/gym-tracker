import { useCallback } from 'react';

/**
 * Patrones de vibración para diferentes acciones
 */
const HAPTIC_PATTERNS = {
  // Acciones básicas
  light: [10],                          // Tap ligero
  medium: [50],                         // Tap medio
  heavy: [100],                         // Tap fuerte
  
  // Acciones de entrenamiento
  setStart: [50, 30, 50],              // Inicio de serie: dos pulsos
  setComplete: [100, 50, 100],         // Serie completada: dos pulsos fuertes
  
  // Descansos
  restStart: [30, 20, 30, 20, 30],     // Inicio descanso: tres pulsos cortos
  restWarning: [50, 30, 50, 30, 50],   // Advertencia (10s restantes): tres pulsos medios
  restComplete: [100, 50, 100, 50, 100], // Fin descanso: tres pulsos fuertes
  
  // Ejercicios
  exerciseChange: [80, 40, 80],        // Cambio de ejercicio: dos pulsos
  
  // Logros
  success: [50, 30, 50, 30, 100],      // Éxito: crescendo
  achievement: [100, 50, 100, 50, 100, 50, 150], // Logro especial: patrón largo
  
  // Completar entrenamiento
  workoutComplete: [100, 50, 100, 50, 100, 100, 200], // Celebración: patrón especial
  
  // Errores/advertencias
  warning: [50, 100, 50],              // Advertencia: pulso-pausa-pulso
  error: [200],                         // Error: pulso largo
} as const;

type HapticPattern = keyof typeof HAPTIC_PATTERNS;

/**
 * Hook para feedback háptico mejorado durante el entrenamiento
 */
export function useHapticFeedback() {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const vibrate = useCallback((pattern: HapticPattern | number | number[]) => {
    if (!isSupported) {
      return false;
    }

    try {
      // Si es un patrón predefinido
      if (typeof pattern === 'string' && pattern in HAPTIC_PATTERNS) {
        navigator.vibrate(HAPTIC_PATTERNS[pattern]);
        return true;
      }
      
      // Si es un número o array personalizado
      if (typeof pattern === 'number' || Array.isArray(pattern)) {
        navigator.vibrate(pattern);
        return true;
      }

      return false;
    } catch (err) {
      console.warn('[Haptic] Error al vibrar:', err);
      return false;
    }
  }, [isSupported]);

  // Funciones específicas para cada acción
  const haptics = {
    // Acciones básicas
    light: () => vibrate('light'),
    medium: () => vibrate('medium'),
    heavy: () => vibrate('heavy'),
    
    // Series
    setStart: () => vibrate('setStart'),
    setComplete: () => vibrate('setComplete'),
    
    // Descansos
    restStart: () => vibrate('restStart'),
    restWarning: () => vibrate('restWarning'),
    restComplete: () => vibrate('restComplete'),
    
    // Ejercicios
    exerciseChange: () => vibrate('exerciseChange'),
    
    // Logros
    success: () => vibrate('success'),
    achievement: () => vibrate('achievement'),
    
    // Completar
    workoutComplete: () => vibrate('workoutComplete'),
    
    // Errores
    warning: () => vibrate('warning'),
    error: () => vibrate('error'),
    
    // Personalizado
    custom: (pattern: number | number[]) => vibrate(pattern),
  };

  return {
    isSupported,
    vibrate,
    ...haptics,
  };
}
