import React, { ReactNode } from 'react';

export interface PageLayoutProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

export function PageLayout({ 
  children, 
  maxWidth = '7xl',
  className = ''
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
}

export function PageContent({ 
  children, 
  maxWidth = '7xl',
  className = ''
}: PageLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className={`${maxWidthClasses[maxWidth]} mx-auto ${className}`}>
        {children}
      </div>
    </div>
  );
}
