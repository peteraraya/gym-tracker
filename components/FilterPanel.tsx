'use client';

import React from 'react';

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}

export function FilterButton({
  active,
  onClick,
  children,
  count
}: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg transition-all font-medium text-sm ${
        active
          ? 'bg-blue-500 text-white shadow-lg'
          : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-600'
      }`}
    >
      <span>{children}</span>
      {count !== undefined && (
        <span className={`ml-2 text-xs font-semibold ${
          active ? 'text-blue-100' : 'text-zinc-600 dark:text-zinc-400'
        }`}>
          ({count})
        </span>
      )}
    </button>
  );
}

interface FilterPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function FilterPanel({ children, className = '' }: FilterPanelProps) {
  return (
    <div className={`flex flex-wrap gap-2 mb-6 ${className}`}>
      {children}
    </div>
  );
}
