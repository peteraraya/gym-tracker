import Link from 'next/link';
import { Dumbbell } from '@/components/icons/lucide';
import React from 'react';
import { useTranslations } from '@/context/LocaleContext';

interface AppLogoProps {
  large?: boolean;
  oneLine?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({ large = false, oneLine = false }) => {
  const t = useTranslations('nav');
  const appName = t ? t('appName') : 'Gym Tracker';
  const containerClass = large
    ? 'p-3 bg-linear-to-br from-zinc-950 to-zinc-700 dark:from-zinc-100 dark:to-zinc-400 rounded-xl transform group-hover:scale-110 transition-transform shadow-lg'
    : 'p-2 bg-linear-to-br from-zinc-950 to-zinc-700 dark:from-zinc-100 dark:to-zinc-400 rounded-xl transform group-hover:scale-110 transition-transform shadow-lg';

  const iconClass = large ? 'w-8 h-8 text-white dark:text-zinc-950' : 'w-5 h-5 text-white dark:text-zinc-950';

  const textClass = large
    ? 'text-3xl font-extrabold bg-linear-to-r from-zinc-900 to-zinc-500 bg-clip-text text-transparent dark:from-zinc-100 dark:to-zinc-500 text-center leading-none'
    : 'text-xl font-extrabold bg-linear-to-r from-zinc-900 to-zinc-500 bg-clip-text text-transparent dark:from-zinc-100 dark:to-zinc-500 hidden sm:block';

  const renderText = () => {
    if (oneLine) return <span className={textClass}>{appName}</span>;

    const parts = appName.split(' ');
    if (parts.length >= 2) {
      return (
        <span className={textClass}>
          <span className="block">{parts.slice(0, parts.length - 1).join(' ')}</span>
          <span className="block">{parts[parts.length - 1]}</span>
        </span>
      );
    }

    return <span className={textClass}>{appName}</span>;
  };

  return (
    <Link href="/" className="flex items-center justify-center space-x-4 group">
      <div className={containerClass}>
        <Dumbbell className={iconClass} />
      </div>
      <span className="-ml-1">{renderText()}</span>
    </Link>
  );
};

export default AppLogo;
