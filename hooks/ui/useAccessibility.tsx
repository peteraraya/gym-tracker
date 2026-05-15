"use client";

import { useEffect, useState } from 'react';

interface AccessibilityPreferences {
  reduceMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  screenReader: boolean;
}

export function useAccessibility() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    reduceMotion: false,
    highContrast: false,
    fontSize: 'medium',
    screenReader: false,
  });

  useEffect(() => {
    // Detectar preferencias del sistema
    const mediaQueries = {
      reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      screenReader: window.navigator.userAgent.includes('NVDA') || 
                   window.navigator.userAgent.includes('JAWS') ||
                   window.speechSynthesis !== undefined,
    };

    const updatePreferences = () => {
      setPreferences(prev => ({
        ...prev,
        reduceMotion: mediaQueries.reduceMotion.matches,
        highContrast: mediaQueries.highContrast.matches,
        screenReader: mediaQueries.screenReader,
      }));
    };

    // Listeners para cambios
    mediaQueries.reduceMotion.addEventListener('change', updatePreferences);
    mediaQueries.highContrast.addEventListener('change', updatePreferences);

    // Cargar preferencias guardadas
    const saved = localStorage.getItem('accessibility_preferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.warn('Failed to parse accessibility preferences');
      }
    }

    updatePreferences();

    return () => {
      mediaQueries.reduceMotion.removeEventListener('change', updatePreferences);
      mediaQueries.highContrast.removeEventListener('change', updatePreferences);
    };
  }, []);

  const updatePreference = <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    localStorage.setItem('accessibility_preferences', JSON.stringify(newPreferences));
  };

  // Aplicar clases CSS basadas en preferencias
  useEffect(() => {
    const root = document.documentElement;
    
    // Reducir animaciones
    if (preferences.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Alto contraste
    if (preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Tamaño de fuente
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${preferences.fontSize}`);

  }, [preferences]);

  return {
    preferences,
    updatePreference,
    // Helpers para componentes
    shouldReduceMotion: preferences.reduceMotion,
    shouldUseHighContrast: preferences.highContrast,
    isScreenReaderActive: preferences.screenReader,
    getFontSizeClass: () => `font-${preferences.fontSize}`,
  };
}

// Hook para anuncios de screen reader
export function useScreenReaderAnnouncements() {
  const [announcements, setAnnouncements] = useState<string[]>([]);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncements(prev => [...prev, message]);
    
    // Crear elemento ARIA live region si no existe
    let liveRegion = document.getElementById(`sr-${priority}`);
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = `sr-${priority}`;
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }

    // Anunciar mensaje
    liveRegion.textContent = message;
    
    // Limpiar después de un tiempo
    setTimeout(() => {
      if (liveRegion) liveRegion.textContent = '';
      setAnnouncements(prev => prev.filter(a => a !== message));
    }, 3000);
  };

  return { announce, announcements };
}

// Componente para skip links
export function SkipLinks() {
  return (
    <div className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50">
      <a 
        href="#main-content" 
        className="bg-blue-600 text-white px-4 py-2 rounded-br-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Saltar al contenido principal
      </a>
      <a 
        href="#navigation" 
        className="bg-blue-600 text-white px-4 py-2 rounded-br-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ml-2"
      >
        Saltar a navegación
      </a>
    </div>
  );
}
