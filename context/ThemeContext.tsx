'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  resolvedTheme: 'light' | 'dark'; // El tema actual aplicado
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'dark';
    return (localStorage.getItem('gym-tracker-theme') as ThemeMode) || 'dark';
  });

  const [timeTick, setTimeTick] = useState<number>(() => Date.now());

  // Función para determinar si es de día o de noche basado en la hora
  const getTimeBasedTheme = (): 'light' | 'dark' => {
    const hour = new Date().getHours();
    // Modo oscuro entre 20:00 (8 PM) y 7:00 (7 AM)
    return (hour >= 20 || hour < 7) ? 'dark' : 'light';
  };

  // Función para obtener el tema del sistema
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Resolver el tema actual basado en la configuración
  const resolveTheme = (themeMode: ThemeMode): 'light' | 'dark' => {
    if (themeMode === 'auto') {
      return getTimeBasedTheme();
    }
    return themeMode;
  };

  // Aplicar el tema al documento
  const applyTheme = (appliedTheme: 'light' | 'dark') => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    if (appliedTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  };

  // Recalcular el tema resuelto cuando cambie la configuración o el tiempo
  const resolvedTheme = useMemo(() => resolveTheme(theme), [theme, timeTick]);

  // Aplicar el tema cuando cambie el resuelto
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  // Verificar cambios de hora cada minuto si está en modo auto (actualiza timeTick)
  useEffect(() => {
    if (theme !== 'auto') return;

    const interval = setInterval(() => setTimeTick(Date.now()), 60000);
    return () => clearInterval(interval);
  }, [theme]);

  // Escuchar cambios en la preferencia del sistema (dispara una actualización de timeTick)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'auto') setTimeTick(Date.now());
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('gym-tracker-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
