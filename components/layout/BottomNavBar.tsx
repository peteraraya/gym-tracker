'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/context/LocaleContext';
import { useWorkout } from '@/context/WorkoutContext';
import {
  Home,
  ClipboardList,
  Dumbbell,
  LayoutDashboard,
  User,
  Calendar,
  TrendingUp,
  Trophy,
  Sparkles,
  BarChart3,
  Lightbulb,
  Calculator,
  BookOpen,
  Settings,
  Target,
  Grid3x3,
  X,
} from '@/components/icons/lucide';

const NavTab: React.FC<{
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}> = ({ href, icon: Icon, label, isActive }) => (
  <Link
    href={href}
    className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 min-w-0"
  >
    <motion.div
      whileTap={{ scale: 0.82 }}
      className={`p-1.5 rounded-xl transition-colors ${
        isActive
          ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
          : 'text-zinc-400 dark:text-zinc-500'
      }`}
    >
      <Icon className="w-5 h-5" />
    </motion.div>
    <span
      className={`text-[10px] font-medium leading-none truncate ${
        isActive
          ? 'text-indigo-600 dark:text-indigo-400'
          : 'text-zinc-400 dark:text-zinc-500'
      }`}
    >
      {label}
    </span>
  </Link>
);

export const BottomNavBar: React.FC = () => {
  const pathname = usePathname() || '/';
  const t = useTranslations('nav');
  const { activeWorkout } = useWorkout();
  const [moreOpen, setMoreOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const moreBtnRef = useRef<HTMLButtonElement>(null);

  // Accesibilidad: enfocar el panel al abrir, cerrar con Escape, devolver el foco al cerrar
  useEffect(() => {
    if (!moreOpen) return;

    const previousFocus =
      (document.activeElement as HTMLElement | null) ?? moreBtnRef.current;
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      previousFocus?.focus();
    };
  }, [moreOpen]);

  // Ocultar en auth y en workout (pantalla de entrenamiento activo)
  if (pathname.includes('/auth')) return null;
  if (pathname.startsWith('/workout')) return null;

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const centerHref = activeWorkout?.routineId
    ? `/workout/${activeWorkout.routineId}`
    : '/routines';

  // Tabs principales (4 + botón central)
  const mainTabs = [
    { href: '/', icon: Home, label: t('home') },
    { href: '/routines', icon: ClipboardList, label: t('routines') },
    { href: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
  ];

  // Items del panel "Más"
  const moreItems = [
    { href: '/sessions',     icon: Calendar,    label: t('sessions'),    color: 'text-blue-500' },
    { href: '/progress',     icon: TrendingUp,  label: t('progress'),    color: 'text-orange-500' },
    { href: '/achievements', icon: Trophy,      label: t('achievements'), color: 'text-amber-500' },
    { href: '/ai-assistant', icon: Sparkles,    label: t('aiAssistant'), color: 'text-violet-500' },
    { href: '/planning',     icon: BarChart3,   label: t('planning'),    color: 'text-indigo-500' },
    { href: '/exercises',    icon: Lightbulb,   label: t('exercises'),   color: 'text-cyan-500' },
    { href: '/recommended',  icon: Target,      label: t('recommended'), color: 'text-emerald-500' },
    { href: '/calculators',  icon: Calculator,  label: t('calculators'), color: 'text-teal-500' },
    { href: '/glossary',     icon: BookOpen,    label: t('glossary'),    color: 'text-sky-500' },
    { href: '/settings',     icon: Settings,    label: t('settings'),    color: 'text-zinc-500' },
    { href: '/profile',      icon: User,        label: t('profile'),     color: 'text-pink-500' },
  ];

  // Si algún "más" está activo, marcar el tab de "Más" como activo
  const isMoreActive = moreItems.some((item) => isActive(item.href));

  return (
    <>
      {/* Overlay del panel "Más" */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-48 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-49 mx-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Más secciones"
              initial={{ y: 24, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            >
              {/* Cabecera */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Más secciones</span>
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  aria-label="Cerrar menú"
                  className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Grid de ítems */}
              <div className="grid grid-cols-4 gap-1 p-3">
                {moreItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors ${
                      isActive(item.href)
                        ? 'bg-indigo-50 dark:bg-indigo-900/30'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <item.icon
                      className={`w-6 h-6 ${
                        isActive(item.href)
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : item.color
                      }`}
                    />
                    <span
                      className={`text-[10px] font-medium text-center leading-tight ${
                        isActive(item.href)
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Barra inferior fija */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-around px-1 h-16 max-w-lg mx-auto relative">
            {/* Tabs izquierdos */}
            {mainTabs.slice(0, 2).map((tab) => (
              <NavTab
                key={tab.href}
                href={tab.href}
                icon={tab.icon}
                label={tab.label}
                isActive={isActive(tab.href)}
              />
            ))}

            {/* Botón central elevado */}
            <Link
              href={centerHref}
              aria-label={activeWorkout ? 'Entrenamiento activo' : 'Entrenar'}
              className="relative -mt-6 shrink-0 mx-2"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
                  activeWorkout
                    ? 'bg-linear-to-br from-blue-700 to-blue-500 shadow-blue-600/40'
                    : 'bg-blue-600 shadow-blue-700/40'
                }`}
              >
                <Dumbbell className="w-6 h-6 text-white" strokeWidth={2.4} />
              </motion.div>
              {activeWorkout && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-blue-400 border-2 border-white dark:border-zinc-900 animate-pulse" />
              )}
            </Link>

            {/* Tab Dashboard */}
            {mainTabs.slice(2).map((tab) => (
              <NavTab
                key={tab.href}
                href={tab.href}
                icon={tab.icon}
                label={tab.label}
                isActive={isActive(tab.href)}
              />
            ))}

            {/* Tab "Más" */}
            <button
              ref={moreBtnRef}
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              aria-haspopup="dialog"
              aria-label="Más"
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 min-w-0"
            >
              <motion.div
                whileTap={{ scale: 0.82 }}
                className={`p-1.5 rounded-xl transition-colors ${
                  isMoreActive || moreOpen
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-400 dark:text-zinc-500'
                }`}
              >
                {moreOpen ? <X className="w-5 h-5" /> : <Grid3x3 className="w-5 h-5" />}
              </motion.div>
              <span
                className={`text-[10px] font-medium leading-none ${
                  isMoreActive || moreOpen
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-400 dark:text-zinc-500'
                }`}
              >
                Más
              </span>
            </button>
          </div>
          {/* Espaciado safe-area iOS */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </div>
    </>
  );
};
