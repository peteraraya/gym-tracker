"use client";

import React, { useId } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', children, id: providedId, name, 'aria-describedby': describedBy, ...props }, ref) => {
    const generatedId = useId();
    const id = providedId || name || generatedId;
    const errorId = id ? `${id}-error` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          aria-invalid={!!error}
          className={`w-full min-h-[44px] rounded-xl border border-border-light bg-surface px-3 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring
            ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            ${className}`}
          {...props}
          name={name}
          aria-describedby={[describedBy, error ? errorId : undefined].filter(Boolean).join(' ') || undefined}
        >
          {children}
        </select>
        {error && <p id={errorId} className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
