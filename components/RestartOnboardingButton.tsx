'use client';

import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/ui/Button';
import { Lightbulb } from '@/components/icons/lucide';

export default function RestartOnboardingButton() {
  const { startOnboarding } = useOnboarding();

  return (
    <Button
      variant="secondary"
      onClick={startOnboarding}
      className="w-full"
    >
      <Lightbulb className="w-4 h-4 mr-2" />
      Ver Tutorial de Nuevo
    </Button>
  );
}
