'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from '@/components/icons/lucide';
import { usePathname } from 'next/navigation';
import { useRoutines } from '@/context/GymContext';
import { useTranslations } from '@/context/LocaleContext';

export const FloatingCreateRoutine: React.FC = () => {
  const pathname = usePathname();
  const { routines } = useRoutines();
  const t = useTranslations('home');

  const hasRoutines = (routines && routines.length > 0);
  const href = hasRoutines ? '/routines' : '/routines?create=1';
  const ariaLabel = hasRoutines ? t('cta.train') : t('cta.create');
  const title = hasRoutines ? t('cta.train') : t('cta.create');
  const subtitle = hasRoutines ? t('haveRoutines.subtitle') : t('getStartedDesc');

  // Ocultar en la ruta /routines y sus subrutas
  if (pathname && pathname.startsWith('/routines')) return null;

  return (
    <div className="fixed left-6 bottom-6 z-50">
      <Link href={href} aria-label={ariaLabel} className="group">
        <div className="flex items-center gap-3 bg-gradient-to-br from-blue-600 to-purple-600 text-white px-4 py-3 rounded-full shadow-lg hover:scale-105 transform transition">
          <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-full">
            <Plus className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold">{title}</div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default FloatingCreateRoutine;
