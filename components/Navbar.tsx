'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from '@/context/LocaleContext';
import { useAuth } from '@/context/AuthContext';
import React from 'react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ActiveWorkoutBanner } from '@/components/ActiveWorkoutBanner';
import { Button } from '@/components/ui/Button';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('nav');
  const { user, signOut } = useAuth();

  const isActive = (path: string) => pathname === path;

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  // No mostrar navbar en la página de auth
  if (pathname === '/auth') {
    return null;
  }

  return (
    <>
      <ActiveWorkoutBanner />
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="text-2xl transform group-hover:scale-110 transition-transform">💪</div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('appName')}
            </span>
          </Link>

          <div className="flex items-center space-x-1 overflow-x-auto">
            <div className="flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
              <Link
                href="/"
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  isActive('/')
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  🏠 {t('home')}
                </span>
              </Link>
              <Link
                href="/dashboard"
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  isActive('/dashboard')
                    ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  📊
                </span>
              </Link>
              <Link
                href="/routines"
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  isActive('/routines')
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  📋 {t('routines')}
                </span>
              </Link>
              <Link
                href="/recommended"
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  isActive('/recommended')
                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  🎯
                </span>
              </Link>
              <Link
                href="/progress"
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  isActive('/progress')
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  📈
                </span>
              </Link>
              <Link
                href="/sessions"
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  isActive('/sessions')
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  🗓️
                </span>
              </Link>
              <Link
                href="/achievements"
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  isActive('/achievements')
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-500/30'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  🏆
                </span>
              </Link>
              <Link
                href="/exercises"
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  isActive('/exercises')
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  💡
                </span>
              </Link>
              <Link
                href="/calculators"
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  isActive('/calculators')
                    ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg shadow-teal-500/30'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  🧮
                </span>
              </Link>
              <Link
                href="/data"
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  isActive('/data')
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  💾
                </span>
              </Link>
              {user && (
                <Link
                  href="/profile"
                  className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                    isActive('/profile')
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    👤
                  </span>
                </Link>
              )}
            </div>
            <LanguageSwitcher />
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 ml-2"
              >
                🚪
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
    </>
  );
};
