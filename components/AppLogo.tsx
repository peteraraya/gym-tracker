import Link from 'next/link';
import { Dumbbell } from 'lucide-react';
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
    ? 'p-3 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl transform group-hover:scale-110 transition-transform shadow-lg'
    : 'p-2 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl transform group-hover:scale-110 transition-transform shadow-lg';

  const iconClass = large ? 'w-8 h-8 text-white' : 'w-5 h-5 text-white';

  const textClass = large
    ? 'text-3xl font-extrabold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center leading-none'
    : 'text-xl font-extrabold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block';

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
