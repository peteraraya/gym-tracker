'use client';

import { useEffect, useState } from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Check,
  Lightbulb
} from '@/components/icons/lucide';

export default function Onboarding() {
  const {
    isActive,
    currentStep,
    steps,
    nextStep,
    prevStep,
    skipOnboarding,
    completeOnboarding
  } = useOnboarding();

  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  useEffect(() => {
    // schedule updates to avoid calling setState synchronously inside effect
    if (!isActive || !currentStepData.target) {
      const t = setTimeout(() => setTargetElement(null), 0);
      return () => clearTimeout(t);
    }

    // Buscar el elemento objetivo
    const element = document.querySelector(currentStepData.target) as HTMLElement;
    if (element) {
      const t = setTimeout(() => {
        setTargetElement(element);

        // Calcular posición del spotlight
        const rect = element.getBoundingClientRect();
        const padding = 8;

        setSpotlightStyle({
          position: 'fixed',
          top: `${rect.top - padding}px`,
          left: `${rect.left - padding}px`,
          width: `${rect.width + padding * 2}px`,
          height: `${rect.height + padding * 2}px`,
          borderRadius: '12px',
          pointerEvents: 'none',
          zIndex: 9999,
          transition: 'all 0.3s ease'
        });

        // Calcular posición del tooltip
        const tooltipWidth = 400;
        const tooltipHeight = 200;
        let top = rect.bottom + 20;
        let left = rect.left + rect.width / 2 - tooltipWidth / 2;

        // Ajustar según la posición especificada
        switch (currentStepData.position) {
          case 'top':
            top = rect.top - tooltipHeight - 20;
            break;
          case 'left':
            top = rect.top + rect.height / 2 - tooltipHeight / 2;
            left = rect.left - tooltipWidth - 20;
            break;
          case 'right':
            top = rect.top + rect.height / 2 - tooltipHeight / 2;
            left = rect.right + 20;
            break;
          case 'bottom':
          default:
            top = rect.bottom + 20;
            break;
        }

        // Asegurar que el tooltip esté dentro de la ventana
        if (left < 20) left = 20;
        if (left + tooltipWidth > window.innerWidth - 20) {
          left = window.innerWidth - tooltipWidth - 20;
        }
        if (top < 20) top = 20;
        if (top + tooltipHeight > window.innerHeight - 20) {
          top = window.innerHeight - tooltipHeight - 20;
        }

        setTooltipStyle({
          position: 'fixed',
          top: `${top}px`,
          left: `${left}px`,
          width: `${tooltipWidth}px`,
          zIndex: 10000
        });

        // Scroll al elemento
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 0);

      return () => clearTimeout(t);
    }
  }, [isActive, currentStep, currentStepData]);

  if (!isActive) return null;

  return (
    <>
      {/* Overlay oscuro */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998] animate-fadeIn"
        onClick={skipOnboarding}
      />

      {/* Spotlight (resaltado del elemento) */}
      {targetElement && (
        <div
          style={spotlightStyle}
          className="border-4 border-blue-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] animate-pulse"
        />
      )}

      {/* Tooltip/Card de información */}
      <div
        style={currentStepData.target ? tooltipStyle : {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '500px',
          zIndex: 10000
        }}
      >
        <Card className="shadow-2xl animate-fadeIn">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {currentStepData.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Paso {currentStep + 1} de {steps.length}
                </p>
              </div>
            </div>
            <button
              onClick={skipOnboarding}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={skipOnboarding}
              className="text-gray-600 dark:text-gray-400"
            >
              Saltar tutorial
            </Button>

            <div className="flex gap-2">
              {!isFirstStep && (
                <Button
                  variant="secondary"
                  onClick={prevStep}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
              )}
              
              {isLastStep ? (
                <Button
                  variant="primary"
                  onClick={completeOnboarding}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  ¡Empezar!
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={nextStep}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-600'
                    : index < currentStep
                    ? 'w-2 bg-green-500'
                    : 'w-2 bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
