'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string; // Selector CSS del elemento a destacar
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface OnboardingContextType {
  isActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  startOnboarding: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  hasCompletedOnboarding: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido a tu Gym Tracker! 💪',
    description: 'Te guiaremos paso a paso para que aproveches al máximo la aplicación. Este tour solo tomará 2 minutos.',
    position: 'bottom'
  },
  {
    id: 'profile',
    title: 'Configura tu Perfil',
    description: 'Primero, configura tu perfil con tu información básica: edad, peso, altura y objetivos. Esto nos ayudará a darte recomendaciones personalizadas.',
    target: '[data-tour="profile"]',
    position: 'bottom'
  },
  {
    id: 'routines',
    title: 'Crea tu Primera Rutina',
    description: 'Las rutinas son plantillas de entrenamiento que puedes reutilizar. Puedes crear las tuyas o usar nuestras rutinas recomendadas.',
    target: '[data-tour="routines"]',
    position: 'bottom'
  },
  {
    id: 'exercises',
    title: 'Explora la Biblioteca de Ejercicios',
    description: 'Tenemos más de 190 ejercicios con guías detalladas, instrucciones paso a paso y videos. Perfectos para aprender la técnica correcta.',
    target: '[data-tour="exercises"]',
    position: 'bottom'
  },
  {
    id: 'glossary',
    title: 'Aprende los Términos',
    description: '¿No entiendes qué es 1RM, RPE o hipertrofia? Nuestro glosario tiene más de 60 términos explicados de forma simple.',
    target: '[data-tour="glossary"]',
    position: 'bottom'
  },
  {
    id: 'workout',
    title: 'Registra tus Entrenamientos',
    description: 'Cuando estés listo, inicia un entrenamiento desde una rutina o crea uno libre. Registra series, reps y peso para ver tu progreso.',
    target: '[data-tour="start-workout"]',
    position: 'left'
  },
  {
    id: 'progress',
    title: 'Visualiza tu Progreso',
    description: 'Ve gráficos de tu evolución, récords personales, volumen de entrenamiento y mucho más. ¡La motivación viene de ver tus logros!',
    target: '[data-tour="progress"]',
    position: 'bottom'
  },
  {
    id: 'calculators',
    title: 'Usa las Calculadoras',
    description: 'Tenemos 12 calculadoras útiles: 1RM, IMC, TDEE, placas para barra y más. Herramientas profesionales al alcance de tu mano.',
    target: '[data-tour="calculators"]',
    position: 'bottom'
  },
  {
    id: 'complete',
    title: '¡Listo para Empezar! 🎉',
    description: 'Ya conoces lo básico. Recuerda: la consistencia es clave. ¡Empieza con tu primer entrenamiento y disfruta el viaje!',
    position: 'bottom'
  }
];

const STORAGE_KEY = 'gym_tracker_onboarding_completed';

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario logeado
    const checkAuth = () => {
      try {
        // Verificar si hay sesión de Supabase
        const supabaseSession = localStorage.getItem('supabase.auth.token');
        if (!supabaseSession) {
          // No hay usuario logeado, no mostrar onboarding
          return;
        }
      } catch (e) {
        // Error al verificar sesión, no mostrar onboarding
        return;
      }

      // Verificar si el usuario ya completó el onboarding
      const completed = localStorage.getItem(STORAGE_KEY);
      if (!completed) {
        setHasCompletedOnboarding(false);
        // Auto-iniciar onboarding después de 1 segundo
        const timer = setTimeout(() => {
          setIsActive(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    };

    checkAuth();
  }, []);

  const startOnboarding = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    setIsActive(false);
    localStorage.setItem(STORAGE_KEY, 'skipped');
    setHasCompletedOnboarding(true);
  };

  const completeOnboarding = () => {
    setIsActive(false);
    localStorage.setItem(STORAGE_KEY, 'completed');
    setHasCompletedOnboarding(true);
  };

  return (
    <OnboardingContext.Provider
      value={{
        isActive,
        currentStep,
        steps: ONBOARDING_STEPS,
        startOnboarding,
        nextStep,
        prevStep,
        skipOnboarding,
        completeOnboarding,
        hasCompletedOnboarding
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
