'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface OnboardingStep {
  id: string;
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
    position: 'bottom'
  },
  {
    id: 'profile',
    target: '[data-tour="profile"]',
    position: 'bottom'
  },
  {
    id: 'routines',
    target: '[data-tour="routines"]',
    position: 'bottom'
  },
  {
    id: 'exercises',
    target: '[data-tour="exercises"]',
    position: 'bottom'
  },
  {
    id: 'glossary',
    target: '[data-tour="glossary"]',
    position: 'bottom'
  },
  {
    id: 'workout',
    target: '[data-tour="start-workout"]',
    position: 'left'
  },
  {
    id: 'progress',
    target: '[data-tour="progress"]',
    position: 'bottom'
  },
  {
    id: 'calculators',
    target: '[data-tour="calculators"]',
    position: 'bottom'
  },
  {
    id: 'complete',
    position: 'bottom'
  }
];

const STORAGE_KEY = 'gym_logic_onboarding_completed';

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
