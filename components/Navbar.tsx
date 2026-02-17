'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from '@/context/LocaleContext';
import { useAuth } from '@/context/AuthContext';
import React, { useState } from 'react';
import { ActiveWorkoutBanner } from '@/components/ActiveWorkoutBanner';
import { Button } from '@/components/ui/Button';
import { 
  Home, 
  LayoutDashboard, 
  ClipboardList, 
  Target, 
  TrendingUp, 
  Calendar,
  Trophy,
  Lightbulb,
  Calculator,
  Database,
  User,
  LogOut,
  Menu,
  X,
  Dumbbell,
  BookOpen,
  Sparkles,
  Settings
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('nav');
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (!pathname) return false;
    // Root must match exactly
    if (path === '/') return pathname === '/';
    // Match exact path or any nested subpath (e.g. /routines -> /routines/create)
    return pathname === path || pathname.startsWith(`${path}/`);
  };

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
      <nav className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl transform group-hover:scale-110 transition-transform shadow-lg">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                {t('appName')}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <div className="flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl p-1.5">
                <NavLink href="/" icon={Home} label={t('home')} isActive={isActive('/')} color="blue" />
                <NavLink href="/dashboard" icon={LayoutDashboard} label={t('dashboard')} isActive={isActive('/dashboard')} color="cyan" />
                <NavLink href="/routines" icon={ClipboardList} label={t('routines')} isActive={isActive('/routines')} color="blue" data-tour="routines" />
                <NavLink href="/recommended" icon={Target} label={t('recommended')} isActive={isActive('/recommended')} color="purple" />
                <NavLink href="/progress" icon={TrendingUp} label={t('progress')} isActive={isActive('/progress')} color="emerald" data-tour="progress" />
                <NavLink href="/sessions" icon={Calendar} label={t('sessions')} isActive={isActive('/sessions')} color="indigo" />
                <NavLink href="/achievements" icon={Trophy} label={t('achievements')} isActive={isActive('/achievements')} color="amber" />
                <NavLink href="/exercises" icon={Lightbulb} label={t('exercises')} isActive={isActive('/exercises')} color="blue" data-tour="exercises" />
                <NavLink href="/glossary" icon={BookOpen} label="Glosario" isActive={isActive('/glossary')} color="indigo" data-tour="glossary" />
                <NavLink href="/ai-assistant" icon={Sparkles} label="Asistente IA" isActive={isActive('/ai-assistant')} color="purple" data-tour="ai-assistant" />
                <NavLink href="/equipment" icon={Dumbbell} label={t('equipment') || 'Equipamiento'} isActive={isActive('/equipment')} color="blue" />
                <NavLink href="/calculators" icon={Calculator} label={t('calculators')} isActive={isActive('/calculators')} color="teal" data-tour="calculators" />
                <NavLink href="/settings" icon={Settings} label="Ajustes" isActive={isActive('/settings')} color="zinc" />
                {/* <NavLink href="/data" icon={Database} label={t('data')} isActive={isActive('/data')} color="indigo" /> */}
                {user && <NavLink href="/profile" icon={User} label={t('profile')} isActive={isActive('/profile')} color="blue" data-tour="profile" />}
              </div>
              
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 ml-2"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center space-x-2 lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 border-t border-zinc-200 dark:border-zinc-800 mt-2 pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <MobileNavLink href="/" icon={Home} label={t('home')} isActive={isActive('/')} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/dashboard" icon={LayoutDashboard} label={t('dashboard')} isActive={isActive('/dashboard')} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/routines" icon={ClipboardList} label={t('routines')} isActive={isActive('/routines')} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/recommended" icon={Target} label={t('recommended')} isActive={isActive('/recommended')} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/progress" icon={TrendingUp} label={t('progress')} isActive={isActive('/progress')} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/sessions" icon={Calendar} label={t('sessions')} isActive={isActive('/sessions')} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/achievements" icon={Trophy} label={t('achievements')} isActive={isActive('/achievements')} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/exercises" icon={Lightbulb} label={t('exercises')} isActive={isActive('/exercises')} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/glossary" icon={BookOpen} label="Glosario" isActive={isActive('/glossary')} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/equipment" icon={Dumbbell} label={t('equipment') || 'Equipamiento'} isActive={isActive('/equipment')} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/calculators" icon={Calculator} label={t('calculators')} isActive={isActive('/calculators')} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/settings" icon={Settings} label="Ajustes" isActive={isActive('/settings')} onClick={() => setMobileMenuOpen(false)} />
                {/* <MobileNavLink href="/data" icon={Database} label={t('data')} isActive={isActive('/data')} onClick={() => setMobileMenuOpen(false)} /> */}
                {user && <MobileNavLink href="/profile" icon={User} label={t('profile')} isActive={isActive('/profile')} onClick={() => setMobileMenuOpen(false)} />}
              </div>
              {user && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full mt-4"
                >
                  <LogOut className="w-4 h-4" />
                  {t('logout') || 'Cerrar sesión'}
                </Button>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

// Componente de enlace para desktop
interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  color: string;
  'data-tour'?: string;
}

const NavLink: React.FC<NavLinkProps> = ({ href, icon: Icon, label, isActive, color, 'data-tour': dataTour }) => {
  const colorClasses = {
    blue: 'from-blue-600 to-blue-500 shadow-blue-500/30',
    cyan: 'from-cyan-600 to-cyan-500 shadow-cyan-500/30',
    purple: 'from-purple-600 to-purple-500 shadow-purple-500/30',
    emerald: 'from-emerald-600 to-emerald-500 shadow-emerald-500/30',
    indigo: 'from-indigo-600 to-indigo-500 shadow-indigo-500/30',
    amber: 'from-amber-600 to-amber-500 shadow-amber-500/30',
    teal: 'from-teal-600 to-teal-500 shadow-teal-500/30',
  };

  return (
    <Link
      href={href}
      data-tour={dataTour}
      className={`px-3 py-2 rounded-lg transition-all text-sm font-medium whitespace-nowrap ${
        isActive
          ? `bg-linear-to-r ${colorClasses[color as keyof typeof colorClasses]} text-white shadow-lg`
          : 'text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700/50'
      }`}
    >
      <span className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <span className="hidden xl:inline">{label}</span>
      </span>
    </Link>
  );
};

// Componente de enlace para mobile
interface MobileNavLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ href, icon: Icon, label, isActive, onClick }) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
        isActive
          ? 'bg-linear-to-br from-blue-600 to-purple-600 text-white shadow-lg'
          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
      }`}
    >
      <Icon className="w-6 h-6 mb-1" />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
};
