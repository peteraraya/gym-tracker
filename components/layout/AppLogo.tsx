import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { useTranslations } from '@/context/LocaleContext';

interface AppLogoProps {
  large?: boolean;
  oneLine?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({ large = false, oneLine = false }) => {
  const t = useTranslations('nav');
  const appName = t ? t('appName') : 'GymLogiX';
  const containerClass = large
    ? 'p-2.5 bg-[#08090b] rounded-xl transform group-hover:scale-110 transition-transform shadow-lg'
    : 'p-2 bg-[#08090b] rounded-xl transform group-hover:scale-110 transition-transform shadow-lg';

  const iconSize = large ? 32 : 20;
  const textClass = large
    ? 'text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 text-center leading-none'
    : 'text-xl font-extrabold text-zinc-900 dark:text-zinc-100 hidden sm:block';
  const brandName = (
    <span className={textClass}>
      {appName.slice(0, -1)}
      <span className="text-[#007a5e] dark:text-[#00d6a4]">{appName.slice(-1)}</span>
    </span>
  );

  const renderText = () => {
    if (oneLine) return brandName;

    const parts = appName.split(' ');
    if (parts.length >= 2) {
      return (
        <span className={textClass}>
          <span className="block">{parts.slice(0, parts.length - 1).join(' ')}</span>
          <span className="block">{parts[parts.length - 1]}</span>
        </span>
      );
    }

    return brandName;
  };

  return (
    <Link href="/" aria-label={appName} className="flex items-center justify-center space-x-4 group">
      <div className={containerClass}>
        <Image
          src="/gymlogix-mark.svg"
          alt=""
          aria-hidden="true"
          width={iconSize}
          height={iconSize}
          priority
        />
      </div>
      <span className="-ml-1">{renderText()}</span>
    </Link>
  );
};

export default AppLogo;
