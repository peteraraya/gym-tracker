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
  
  // Ocultar en las rutas de workout (entrenamiento activo)
  if (pathname && pathname.startsWith('/workout')) return null;
  if (pathname === '/') return null;

  return (
    <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-4 z-40 lg:bottom-6 lg:left-6">
      <Link href={href} aria-label={ariaLabel} className="group">
        <div className="flex items-center gap-2.5 rounded-full bg-blue-600 px-3 py-2.5 text-white shadow-lg shadow-blue-950/15 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950 sm:px-4 sm:py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
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
