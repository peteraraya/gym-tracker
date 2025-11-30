'use client';

import React from 'react';
import { useLocale } from '@/context/LocaleContext';
import { Button } from '@/components/ui/Button';

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useLocale();

  const handleSetLocale = (newLocale: string) => {
    setLocale(newLocale);
    window.location.reload();
  };

  return (
    <div className="flex gap-2">
      <Button
        variant={locale === 'es' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => handleSetLocale('es')}
        className="text-sm"
      >
        🇪🇸 ES
      </Button>
      <Button
        variant={locale === 'en' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => handleSetLocale('en')}
        className="text-sm"
      >
        🇺🇸 EN
      </Button>
    </div>
  );
};
