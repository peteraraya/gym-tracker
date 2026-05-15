'use client';

import { ReactNode } from 'react';

interface GridLayoutProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  responsive?: boolean;
  className?: string;
}

const colsClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
};

const gapClasses = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6'
};

export function GridLayout({
  children,
  cols = 3,
  gap = 'md',
  responsive = true,
  className = ''
}: GridLayoutProps) {
  return (
    <div className={`
      grid 
      ${responsive ? colsClasses[cols] : `grid-cols-${cols}`}
      ${gapClasses[gap]}
      ${className}
    `}>
      {children}
    </div>
  );
}

// Variante para cards
export function CardGrid({
  children,
  cols = 3,
  gap = 'md',
  className = ''
}: Omit<GridLayoutProps, 'responsive'>) {
  return (
    <GridLayout cols={cols} gap={gap} responsive={true} className={className}>
      {children}
    </GridLayout>
  );
}

// Variante para stats
export function StatsGrid({
  children,
  className = ''
}: Pick<GridLayoutProps, 'children' | 'className'>) {
  return (
    <GridLayout cols={4} gap="md" responsive={true} className={className}>
      {children}
    </GridLayout>
  );
}
