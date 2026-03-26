'use client';

import React from 'react';

interface PageLayoutProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl';
}

export function PageLayout({
  title,
  description,
  icon,
  actions,
  children,
  maxWidth = '6xl'
}: PageLayoutProps) {
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl'
  }[maxWidth];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 pb-24">
      <div className={`${maxWidthClass} mx-auto px-4 py-8`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
