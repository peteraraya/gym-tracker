'use client';

import React from 'react';

interface PageLayoutProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl';
  gradient?: string;
}

export function PageLayout({
  title,
  description,
  icon,
  actions,
  children,
  maxWidth = '6xl',
  gradient = 'from-blue-500 to-indigo-600'
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className={`bg-linear-to-r ${gradient} dark:opacity-95`}>
        <div className={`${maxWidthClass} mx-auto px-4 py-6 sm:py-8`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {icon && <div className="shrink-0 text-white">{icon}</div>}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {title}
                </h1>
                {description && (
                  <p className="text-white/80 mt-1 text-sm sm:text-base">
                    {description}
                  </p>
                )}
              </div>
            </div>
            {actions && <div className="shrink-0">{actions}</div>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`${maxWidthClass} mx-auto px-4 py-6 sm:py-8`}>
        {children}
      </div>
    </div>
  );
}
