'use client';

/**
 * Utility for triggering haptic feedback (vibrations) on supported mobile devices.
 * Uses the Vibration API. Falls back gracefully on unsupported devices.
 */

export const HAPTIC_PATTERNS = {
  // Light tap, good for simple buttons or typing
  light: [10],
  // Medium tap, good for secondary actions
  medium: [20],
  // Heavy tap, good for primary actions
  heavy: [40],
  // Success pattern, good for completing a set or a workout
  success: [30, 60, 40],
  // Error pattern
  error: [50, 50, 50, 50, 50],
  // Warning pattern
  warning: [30, 40, 30],
  // Toggle on
  toggleOn: [15, 30, 20],
  // Toggle off
  toggleOff: [10, 20, 10],
};

export type HapticType = keyof typeof HAPTIC_PATTERNS;

/**
 * Triggers a haptic feedback pattern
 * @param type The type of haptic pattern to trigger
 */
export const triggerHaptic = (type: HapticType = 'light') => {
  if (typeof window === 'undefined' || !window.navigator || !window.navigator.vibrate) {
    return;
  }

  try {
    window.navigator.vibrate(HAPTIC_PATTERNS[type]);
  } catch (error) {
    // Ignore errors on unsupported devices
    console.warn('Haptic feedback failed:', error);
  }
};
