import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gradient' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
  center?: boolean; // opt-in: center button horizontally
  block?: boolean;  // opt-in: full width
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  loading = false,
  center = false,
  block = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm hover:shadow-md whitespace-nowrap';
  
  const variants = {
    // Acción principal: gradiente inspirado en el icono de la app
    primary: 'bg-gradient-to-r from-[#0ea5a4] via-[#8D37FC] to-[#4F46E5] dark:from-[#0ea5a4] dark:via-[#8D37FC] dark:to-[#4F46E5] text-white bg-[length:200%_auto] hover:bg-right shadow-lg shadow-purple-500/20',
    // Secundario: gris suave en degradado (y versión dark)
    secondary: 'bg-gradient-to-r from-[#f3f4f6] via-[#e6e7ea] to-[#d1d5db] dark:from-[#374151] dark:via-[#1f2937] dark:to-[#111827] text-zinc-900 dark:text-zinc-100 border border-transparent dark:border-transparent bg-[length:200%_auto] hover:bg-right shadow-sm',
    // Error: degradado rojo profesional (incluye dark)
    danger: 'bg-gradient-to-r from-[#ef4444] via-[#dc2626] to-[#b91c1c] dark:from-[#b91c1c] dark:via-[#991b1b] dark:to-[#7f1d1d] text-white bg-[length:200%_auto] hover:bg-right shadow-lg shadow-red-500/20',
    // Información: degradado azul (incluye dark)
    info: 'bg-gradient-to-r from-[#3b82f6] via-[#0ea5ff] to-[#06b6d4] dark:from-[#1e40af] dark:via-[#0ea5ff] dark:to-[#0891b2] text-white bg-[length:200%_auto] hover:bg-right shadow-lg shadow-sky-500/20',
    ghost: 'bg-transparent text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 shadow-none',
    gradient: 'bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500 text-white bg-[length:200%_auto] hover:bg-right shadow-lg shadow-teal-500/30',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
  };

  const centerClass = center ? 'block mx-auto' : '';
  const blockClass = block ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${centerClass} ${blockClass} ${className}`}
      aria-busy={loading}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
