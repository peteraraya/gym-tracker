'use client';

import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/ui/Button';
import { Lightbulb } from '@/components/icons/lucide';
import { useTranslations } from '@/context/LocaleContext';

export default function RestartOnboardingButton() {
  const { startOnboarding } = useOnboarding();
  const t = useTranslations('onboarding');

  return (
    <Button
      variant="secondary"
      onClick={startOnboarding}
      className="w-full"
    >
      <Lightbulb className="w-4 h-4 mr-2" />
      {t('restart')}
    </Button>
  );
}
