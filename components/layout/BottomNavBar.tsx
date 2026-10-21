'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/context/LocaleContext';
import { useAuth } from '@/context/AuthContext';
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
  LogOut,
} from '@/components/icons/lucide';

const NavTab: React.FC<{
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}> = ({ href, icon: Icon, label, isActive }) => (
  <Link
    href={href}
    aria-current={isActive ? 'page' : undefined}
    className="flex min-h-11 min-w-0 flex-1 touch-manipulation flex-col items-center justify-center gap-1 py-1"
  >
    <motion.div
      whileTap={{ scale: 0.82 }}
      className={`p-1.5 rounded-xl transition-colors ${
        isActive
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
          : 'text-zinc-400 dark:text-zinc-500'
      }`}
    >
      <Icon className="w-5 h-5" />
    </motion.div>
    <span
      className={`max-w-full truncate text-[11px] font-medium leading-none ${
        isActive
          ? 'text-emerald-800 dark:text-emerald-200'
          : 'text-zinc-400 dark:text-zinc-500'
      }`}
    >
      {label}
    </span>
  </Link>
);

export const BottomNavBar: React.FC = () => {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const t = useTranslations('nav');
  const { user, signOut } = useAuth();
  const { activeWorkout } = useWorkout();
  const [moreOpen, setMoreOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await signOut();
    setMoreOpen(false);
    router.push('/auth');
  };

  // Accesibilidad: enfocar el panel al abrir, cerrar con Escape, devolver el foco al cerrar
  useEffect(() => {
    if (!moreOpen) return;

    const previousFocus =
      (document.activeElement as HTMLElement | null) ?? moreBtnRef.current;
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
      if (e.key !== 'Tab') return;

      const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusableElements?.length) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
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

  // Rutinas y entrenamiento son los accesos primarios; el resto vive en "Más".
  const mainTabs = [
    { href: '/routines', icon: ClipboardList, label: t('routines') },
  ];

  const moreGroups = [
    {
      title: t('moreGroups.overview'),
      items: [
        { href: '/', icon: Home, label: t('home'), color: 'text-blue-500' },
        { href: '/dashboard', icon: LayoutDashboard, label: t('dashboard'), color: 'text-indigo-500' },
      ],
    },
    {
      title: t('moreGroups.progress'),
      items: [
        { href: '/sessions',     icon: Calendar,   label: t('sessions'),     color: 'text-blue-500' },
        { href: '/progress',     icon: TrendingUp, label: t('progress'),     color: 'text-orange-500' },
        { href: '/achievements', icon: Trophy,     label: t('achievements'), color: 'text-amber-500' },
        { href: '/planning',     icon: BarChart3,  label: t('planning'),     color: 'text-indigo-500' },
      ],
    },
    {
      title: t('moreGroups.discover'),
      items: [
        { href: '/exercises',    icon: Lightbulb, label: t('exercises'),   color: 'text-cyan-500' },
        { href: '/recommended',  icon: Target,    label: t('recommended'), color: 'text-emerald-500' },
        { href: '/ai-assistant', icon: Sparkles,  label: t('aiAssistant'), color: 'text-emerald-600 dark:text-emerald-300' },
      ],
    },
    {
      title: t('moreGroups.tools'),
      items: [
        { href: '/equipment',   icon: Dumbbell,   label: t('equipment'),   color: 'text-blue-500' },
        { href: '/calculators', icon: Calculator, label: t('calculators'), color: 'text-teal-500' },
        { href: '/glossary',    icon: BookOpen,    label: t('glossary'),    color: 'text-sky-500' },
      ],
    },
    {
      title: t('moreGroups.account'),
      items: [
        { href: '/settings', icon: Settings, label: t('settings'), color: 'text-zinc-500' },
        { href: '/profile',  icon: User,     label: t('profile'),  color: 'text-rose-500' },
      ],
    },
  ];
  const moreItems = moreGroups.flatMap((group) => group.items);

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
              ref={dialogRef}
              className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-49 mx-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-more-title"
              tabIndex={-1}
              initial={{ y: 24, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            >
              {/* Cabecera */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                <h2 id="mobile-more-title" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('moreSections')}</h2>
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  aria-label={t('close')}
                  className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Secciones agrupadas por intención */}
              <div className="max-h-[70vh] overflow-y-auto p-3 space-y-4">
                {moreGroups.map((group) => (
                  <div key={group.title}>
                    <h3 className="px-1 mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                      {group.title}
                    </h3>
                    <div className="grid grid-cols-2 gap-1 min-[380px]:grid-cols-4">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMoreOpen(false)}
                          className={`flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl p-3 transition-colors touch-manipulation ${
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
                            className={`text-[11px] font-medium text-center leading-tight ${
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
                  </div>
                ))}
              </div>

              {/* Cerrar sesión */}
              {user && (
                <div className="border-t border-zinc-100 dark:border-zinc-800 p-3">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('logout')}
                  </button>
                </div>
              )}
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
              aria-label={activeWorkout ? t('activeWorkout') : t('train')}
              className="relative -mt-6 mx-1 flex shrink-0 touch-manipulation flex-col items-center gap-1"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700 shadow-lg shadow-emerald-900/20 dark:bg-emerald-300 dark:shadow-emerald-950/30"
              >
                <Dumbbell className="w-6 h-6 text-white" strokeWidth={2.4} />
              </motion.div>
              {activeWorkout && (
                <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-900 dark:bg-emerald-300" />
              )}
              <span className="text-[11px] font-semibold leading-none text-zinc-700 dark:text-zinc-300">
                {activeWorkout ? t('activeWorkout') : t('train')}
              </span>
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
              aria-label={t('more')}
              className="flex min-h-11 min-w-0 flex-1 touch-manipulation flex-col items-center justify-center gap-1 py-1"
            >
              <motion.div
                whileTap={{ scale: 0.82 }}
                className={`p-1.5 rounded-xl transition-colors ${
                  isMoreActive || moreOpen
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                    : 'text-zinc-400 dark:text-zinc-500'
                }`}
              >
                {moreOpen ? <X className="w-5 h-5" /> : <Grid3x3 className="w-5 h-5" />}
              </motion.div>
              <span
                className={`text-[11px] font-medium leading-none ${
                  isMoreActive || moreOpen
                    ? 'text-emerald-800 dark:text-emerald-200'
                    : 'text-zinc-400 dark:text-zinc-500'
                }`}
              >
                {t('more')}
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
