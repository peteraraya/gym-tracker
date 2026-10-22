"use client";

import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id: providedId, name, 'aria-describedby': describedBy, ...props }, ref) => {
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
        <input
          ref={ref}
          id={id}
          aria-invalid={!!error}
          className={`w-full min-h-[44px] rounded-xl border border-border-light bg-surface px-4 py-2 text-foreground transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring
            ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            ${className}`}
          {...props}
          name={name}
          aria-describedby={[describedBy, error ? errorId : undefined].filter(Boolean).join(' ') || undefined}
        />
        {error && <p id={errorId} className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, error, className = '', id: providedId, name, 'aria-describedby': describedBy, ...props }) => {
  const generatedId = useId();
  const id = providedId || name || generatedId;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="w-full">
      {label && (
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      )}
      <textarea
        id={id}
        name={name}
        aria-invalid={!!error}
        aria-describedby={[describedBy, errorId].filter(Boolean).join(' ') || undefined}
        className={`w-full min-h-20 rounded-xl border border-border-light bg-surface px-4 py-2 text-foreground transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring
          ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
          ${className}`}
        {...props}
      />
      {error && <p id={errorId} className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};
